"""Z-Image-Turbo img2img for the game's parallax layers, tiles and props (RX 9060 XT, ROCm).

Adapted from D:/projects/Videos/hidden-state/tools/imagegen.py for a machine with little free RAM:
nothing is assembled in system memory. Every component is loaded straight onto the GPU, one at a time.

    D:/projects/Videos/_tools/zimg/Scripts/python.exe tools/zimg_img2img.py jobs.json [outdir]

jobs.json = [{"name": "podgradje_far", "draft": "art/realisticno/podgradje/draft/far.png",
              "prompt": "...", "w": 2048, "h": 688, "strength": 0.7, "steps": 10,
              "seeds": [1, 2], "wrap": "x"}, ...]
  wrap: "x"  -> the result tiles horizontally (parallax layers),
        "xy" -> tiles both ways (materials), null/absent -> plain image (props).
  draft may be omitted (pure text-to-image, strength forced to 1).
Writes <outdir>/<name>_s<seed>.png (default outdir art/realisticno/raw) and skips files that already exist.

How the wrap works: at every denoising step the transformer sees the latent twice, once as is and once rolled by
half its width (and/or height), and the two velocity predictions are blended with weights that fade each view out
near its own edges. Every point of the picture is therefore predicted from a view where it sits in the middle,
including the left/right border, so the result continues seamlessly across the border. The VAE encodes and decodes
with a wrapped margin so the convolutions also see the other side.

Prompt embeddings are cached in art/realisticno/_emb/<sha1>.pt, so the 8 GB text encoder only loads when a prompt
is new. It is freed before the transformer (bf16 straight to GPU, then fp8 layerwise storage, ~6 GB) is loaded.
"""
import gc, hashlib, json, math, os, sys, time

os.environ.setdefault('HIP_VISIBLE_DEVICES', '1')            # device 0 is the iGPU
os.environ.setdefault('TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL', '1')
os.environ.setdefault('HF_HOME', r'D:\projects\Videos\_models\hf')
os.environ.setdefault('HF_HUB_DISABLE_SYMLINKS_WARNING', '1')
os.environ.setdefault('HF_HUB_OFFLINE', '1')
os.environ.setdefault('MIOPEN_FIND_MODE', 'FAST')

import numpy as np
import torch
from PIL import Image

from huggingface_hub import snapshot_download

# A local path (not the repo id): the tokenizer otherwise asks the hub about the model even when offline.
REPO = snapshot_download('Tongyi-MAI/Z-Image-Turbo', local_files_only=True)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMB = os.path.join(ROOT, 'art', 'realisticno', '_emb')
DEV = 'cuda'


def log(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)


def emb_path(prompt):
    return os.path.join(EMB, hashlib.sha1(prompt.encode('utf-8')).hexdigest() + '.pt')


RESERVE_GB = float(os.environ.get('ZIMG_RESERVE_GB', '3'))   # always left free for the other project's TTS


def free_gb():
    """Memory this process could get without taking it from anyone: device free + our own cached slack."""
    f, _ = torch.cuda.mem_get_info()
    slack = torch.cuda.memory_reserved() - torch.cuda.memory_allocated()
    return (f + slack) / 2 ** 30


def gate(need_gb, what):
    """Wait until `need_gb` more GB plus the reserve are free on the card (the TTS of another project shares it)."""
    torch.cuda.empty_cache()
    waited, last = 0, -999
    while free_gb() < need_gb + RESERVE_GB:
        if waited - last >= 300:
            log(f'waiting for GPU memory for {what}: {free_gb():.1f} GB free, need {need_gb:.1f}+{RESERVE_GB:.0f}')
            last = waited
        time.sleep(45)
        waited += 45
        torch.cuda.empty_cache()
    if waited:
        log(f'GPU memory ok after {waited}s')


def is_oom(e):
    s = str(e).lower()
    return isinstance(e, torch.cuda.OutOfMemoryError) or 'out of memory' in s or 'hipErrorOutOfMemory'.lower() in s


def load_text_encoder():
    """Qwen3 text encoder with fp8 layer storage (~3.6 GB on the GPU); the 0.8 GB token embedding stays on the CPU."""
    from accelerate import init_empty_weights
    from accelerate.utils import set_module_tensor_to_device
    from diffusers.hooks import apply_layerwise_casting
    from transformers import AutoConfig, Qwen3Model
    folder = os.path.join(REPO, 'text_encoder')
    cfg = AutoConfig.from_pretrained(folder)
    with init_empty_weights():
        te = Qwen3Model(cfg)
    te.embed_tokens = torch.nn.Identity()
    apply_layerwise_casting(te, storage_dtype=torch.float8_e4m3fn, compute_dtype=torch.bfloat16,
                            skip_modules_pattern=('norm', 'embed', 'rotary'))
    params = dict(te.named_parameters())
    emb = None
    idx = json.load(open(os.path.join(folder, 'model.safetensors.index.json')))
    for shard in sorted(set(idx['weight_map'].values())):
        for k, t in read_safetensors(os.path.join(folder, shard)):
            name = k[6:] if k.startswith('model.') else k
            if name.startswith('embed_tokens'):
                emb = t.to(torch.bfloat16).clone()
                continue
            dt = params[name].dtype if params[name].dtype == torch.float8_e4m3fn else torch.bfloat16
            set_module_tensor_to_device(te, name, DEV, value=t.to(DEV, dt), dtype=dt)
    for n, b in list(te.named_buffers()):
        if b.device.type != 'meta':
            set_module_tensor_to_device(te, n, DEV, value=b)
    left = [n for n, p in list(te.named_parameters()) + list(te.named_buffers()) if p.device.type == 'meta']
    if left:
        raise RuntimeError(f'text encoder weights missing: {left[:5]}')
    te.eval()
    return te, emb


def encode_missing(prompts):
    missing = [p for p in dict.fromkeys(prompts) if not os.path.exists(emb_path(p))]
    if not missing:
        return
    from transformers import AutoTokenizer
    os.makedirs(EMB, exist_ok=True)
    gate(4.5, 'the text encoder')
    t0 = time.time()
    tok = AutoTokenizer.from_pretrained(os.path.join(REPO, 'tokenizer'))
    te, emb = load_text_encoder()
    log(f'text encoder (fp8) on GPU in {time.time() - t0:.0f}s, VRAM {torch.cuda.memory_allocated() / 2**30:.1f} GB, '
        f'encoding {len(missing)} prompts')
    with torch.no_grad():
        for p in missing:
            text = tok.apply_chat_template([{'role': 'user', 'content': p}], tokenize=False,
                                           add_generation_prompt=True, enable_thinking=True)
            # No padding: with causal attention the real tokens come out the same as with right padding to 512.
            ids = tok([text], truncation=True, max_length=512, return_tensors='pt').input_ids[0]
            x = emb[ids][None].to(DEV)
            hs = te(inputs_embeds=x, output_hidden_states=True).hidden_states[-2]
            torch.save(hs[0].to('cpu', torch.bfloat16).clone(), emb_path(p))
    log(f'encoded in {time.time() - t0:.0f}s, peak VRAM {torch.cuda.max_memory_allocated() / 2**30:.1f} GB')
    del te, emb
    gc.collect(); torch.cuda.empty_cache(); torch.cuda.reset_peak_memory_stats()


ST_DTYPES = {'F32': torch.float32, 'F16': torch.float16, 'BF16': torch.bfloat16}


def read_safetensors(path):
    """Yield (name, cpu tensor) one at a time with plain file reads. safetensors' own torch loader maps the whole
    shard copy-on-write, which on Windows charges the full 9.9 GB shard against the commit limit and crashes
    natively when free RAM is short; this never holds more than one tensor (<=150 MB) in memory."""
    import struct
    with open(path, 'rb') as fh:
        n = struct.unpack('<Q', fh.read(8))[0]
        head = json.loads(fh.read(n))
        base = 8 + n
        items = sorted(((k, v) for k, v in head.items() if k != '__metadata__'), key=lambda kv: kv[1]['data_offsets'][0])
        for k, v in items:
            a, b = v['data_offsets']
            fh.seek(base + a)
            buf = bytearray(fh.read(b - a))
            t = torch.frombuffer(buf, dtype=ST_DTYPES[v['dtype']]).reshape(v['shape']) if b > a else \
                torch.empty(v['shape'], dtype=ST_DTYPES[v['dtype']])
            yield k, t


def load_transformer():
    from accelerate import init_empty_weights
    from accelerate.utils import set_module_tensor_to_device
    from diffusers import ZImageTransformer2DModel
    folder = os.path.join(REPO, 'transformer')
    cfg = ZImageTransformer2DModel.load_config(folder)
    with init_empty_weights():
        tr = ZImageTransformer2DModel.from_config(cfg)
    # Store the weights as fp8 (~6 GB) and upcast each layer to bf16 when it runs. Set up on the empty model, so
    # every weight goes to the GPU already in its storage dtype and the load never peaks at the 12.3 GB of bf16.
    tr.enable_layerwise_casting(storage_dtype=torch.float8_e4m3fn, compute_dtype=torch.bfloat16)
    params = dict(tr.named_parameters())
    idx = json.load(open(os.path.join(folder, 'diffusion_pytorch_model.safetensors.index.json')))
    for shard in sorted(set(idx['weight_map'].values())):
        for k, t in read_safetensors(os.path.join(folder, shard)):
            dt = params[k].dtype if k in params and params[k].dtype == torch.float8_e4m3fn else torch.bfloat16
            set_module_tensor_to_device(tr, k, DEV, value=t.to(DEV, dt), dtype=dt)
            del t
    left = [n for n, p in list(tr.named_parameters()) + list(tr.named_buffers()) if p.device.type == 'meta']
    if left:
        raise RuntimeError(f'transformer weights missing: {left[:5]}')
    return tr


def load_denoiser():
    from diffusers import AutoencoderKL, FlowMatchEulerDiscreteScheduler
    t0 = time.time()
    gate(6.6, 'the transformer')
    tr = load_transformer()
    gc.collect(); torch.cuda.empty_cache()
    vae = AutoencoderKL.from_pretrained(os.path.join(REPO, 'vae'), torch_dtype=torch.bfloat16).to(DEV)
    # Small VAE tiles keep the decode of a ~2300 px wide wrapped layer around 1 GB instead of ~8 GB.
    vae.enable_tiling()
    vae.tile_sample_min_size = 512
    vae.tile_latent_min_size = 64
    vae.tile_overlap_factor = 0.25
    vae.eval(); tr.eval()
    sch = FlowMatchEulerDiscreteScheduler.from_pretrained(os.path.join(REPO, 'scheduler'))
    log(f'transformer+vae on GPU in {time.time() - t0:.0f}s, VRAM {torch.cuda.memory_allocated() / 2**30:.1f} GB')
    return tr, vae, sch


def wrap_pad(x, px, wx, wy):
    """Pad a [B,C,H,W] tensor by px with wrapped content along the requested axes."""
    if wx:
        x = torch.cat([x[..., -px:], x, x[..., :px]], dim=-1)
    if wy:
        x = torch.cat([x[..., -px:, :], x, x[..., :px, :]], dim=-2)
    return x


def crop_pad(x, px, wx, wy):
    if wx:
        x = x[..., px:-px]
    if wy:
        x = x[..., px:-px, :]
    return x


PAD_LAT = 16  # latent px of wrapped margin for the VAE (128 image px)


@torch.no_grad()
def vae_encode(vae, img, wx, wy):
    a = torch.from_numpy(np.asarray(img.convert('RGB'), dtype=np.float32) / 127.5 - 1).permute(2, 0, 1)[None]
    a = wrap_pad(a.to(DEV, torch.bfloat16), PAD_LAT * 8, wx, wy)
    lat = vae.encode(a).latent_dist.mode()
    lat = crop_pad(lat, PAD_LAT, wx, wy)
    return ((lat - vae.config.shift_factor) * vae.config.scaling_factor).float()


@torch.no_grad()
def vae_decode(vae, lat, wx, wy):
    lat = lat.to(torch.bfloat16) / vae.config.scaling_factor + vae.config.shift_factor
    lat = wrap_pad(lat, PAD_LAT, wx, wy)
    img = vae.decode(lat, return_dict=False)[0]
    img = crop_pad(img, PAD_LAT * 8, wx, wy)
    img = ((img[0].float().clamp(-1, 1) + 1) * 127.5).round().byte().permute(1, 2, 0).cpu().numpy()
    return Image.fromarray(img)


def view_weights(n, device):
    """Weight of the un-rolled view along an axis of n latent px: 0 at the borders, 1 in the middle."""
    x = (torch.arange(n, device=device, dtype=torch.float32) + 0.5) / n
    return torch.sin(math.pi * x) ** 2


@torch.no_grad()
def denoise(tr, sch, emb, z0, strength, steps, seed, wx, wy):
    _, c, h, w = z0.shape
    sch.sigma_min = 0.0
    sch.set_timesteps(steps, device=DEV)
    ts = sch.timesteps
    t_start = int(max(steps - min(steps * strength, steps), 0))
    ts = ts[t_start:]
    if hasattr(sch, 'set_begin_index'):
        sch.set_begin_index(t_start)
    g = torch.Generator(DEV).manual_seed(seed)
    noise = torch.randn(z0.shape, generator=g, device=DEV, dtype=torch.float32)
    lat = sch.scale_noise(z0, ts[:1], noise) if strength < 1 else noise

    shifts = [(0, 0)]
    if wx:
        shifts.append((0, w // 2))
    if wy:
        shifts += [(h // 2, s) for _, s in shifts]
    ax, ay = view_weights(w, DEV), view_weights(h, DEV)
    weights = []
    for sy, sx in shifts:
        wxv = (ax if sx == 0 else 1 - ax) if wx else torch.ones_like(ax)
        wyv = (ay if sy == 0 else 1 - ay) if wy else torch.ones_like(ay)
        weights.append(wyv[:, None] * wxv[None, :])
    cap = [emb]
    for t in ts:
        tt = ((1000 - t) / 1000).reshape(1).to(DEV)
        v = torch.zeros_like(lat)
        for (sy, sx), wgt in zip(shifts, weights):
            x = torch.roll(lat, shifts=(sy, sx), dims=(-2, -1)) if (sy or sx) else lat
            out = tr([x[0].to(torch.bfloat16).unsqueeze(1)], tt, cap)[0][0].float().squeeze(1)[None]
            if sy or sx:
                out = torch.roll(out, shifts=(-sy, -sx), dims=(-2, -1))
            v += wgt * out
        lat = sch.step(-v, t, lat, return_dict=False)[0]
    return lat


EXTRA = {}   # (w, h, wrap) -> measured extra GB above the resident weights during one image


def run_job(tr, vae, sch, emb, j, s, outdir):
    w, h = j.get('w', 1024), j.get('h', 1024)
    wrap = j.get('wrap') or ''
    wx, wy = 'x' in wrap, 'y' in wrap
    key = (w, h, wrap)
    gate(EXTRA.get(key, 3.0), j['name'])
    base = torch.cuda.memory_allocated()
    torch.cuda.reset_peak_memory_stats()
    t = time.time()
    if j.get('draft'):
        d = Image.open(os.path.join(ROOT, j['draft'])).convert('RGB')
        if d.size != (w, h):
            d = d.resize((w, h), Image.LANCZOS)
        z0 = vae_encode(vae, d, wx, wy)
        strength = j.get('strength', 0.7)
    else:
        z0 = torch.zeros((1, 16, h // 8, w // 8), device=DEV)
        strength = 1.0
    lat = denoise(tr, sch, emb, z0, strength, j.get('steps', 10), s, wx, wy)
    img = vae_decode(vae, lat, wx, wy)
    out = os.path.join(outdir, f"{j['name']}_s{s}.png")
    img.save(out)
    extra = (torch.cuda.max_memory_allocated() - base) / 2 ** 30
    EXTRA[key] = max(EXTRA.get(key, 0), extra * 1.1 + 0.3)
    log(f'{out}  {time.time() - t:.1f}s  peak {torch.cuda.max_memory_allocated() / 2**30:.1f} GB '
        f'(+{extra:.1f} over the weights)')
    del z0, lat
    torch.cuda.empty_cache()


def run_file(path, outdir, state):
    jobs = json.load(open(path, encoding='utf-8'))
    todo = [(j, s) for j in jobs for s in j.get('seeds', [1])
            if not os.path.exists(os.path.join(outdir, f"{j['name']}_s{s}.png"))]
    if not todo:
        log(f'{path}: nothing to do'); return
    prompts = {j['prompt'] for j, _ in todo}
    if any(not os.path.exists(emb_path(p)) for p in prompts):
        if state.get('tr') is not None:      # the text encoder and the transformer do not fit the budget together
            state.clear(); gc.collect(); torch.cuda.empty_cache()
        encode_missing([j['prompt'] for j, _ in todo])
    embs = {p: torch.load(emb_path(p)).to(DEV) for p in prompts}
    if state.get('tr') is None:
        state['tr'], state['vae'], state['sch'] = load_denoiser()
    log(f'{path}: {len(todo)} images')
    for j, s in todo:
        for attempt in range(6):
            try:
                run_job(state['tr'], state['vae'], state['sch'], embs[j['prompt']], j, s, outdir)
                break
            except Exception as e:
                if not is_oom(e):
                    raise
                key = (j.get('w', 1024), j.get('h', 1024), j.get('wrap') or '')
                EXTRA[key] = EXTRA.get(key, 3.0) + 0.5
                log(f"out of GPU memory on {j['name']} (attempt {attempt + 1}), pausing 90s")
                gc.collect(); torch.cuda.empty_cache(); time.sleep(90)
        else:
            log(f"giving up on {j['name']}_s{s} for now")
    del embs


def main():
    """tools/zimg_img2img.py jobs.json [outdir]   or   tools/zimg_img2img.py --watch <dir> [outdir]
    --watch keeps the weights loaded and runs every *.json put into <dir> (in name order), renaming it to
    *.json.done; it ends when a file named STOP appears in <dir>."""
    a = sys.argv[1:]
    watch = a[1] if a[0] == '--watch' else None
    rest = a[2:] if watch else a[1:]
    outdir = rest[0] if rest else os.path.join(ROOT, 'art', 'realisticno', 'raw')
    os.makedirs(outdir, exist_ok=True)
    state = {}
    if not watch:
        run_file(a[0], outdir, state)
        return
    log(f'watching {watch}')
    idle = 0
    while not os.path.exists(os.path.join(watch, 'STOP')):
        files = sorted(f for f in os.listdir(watch) if f.endswith('.json'))
        if not files:
            time.sleep(15)
            idle += 15
            if idle >= 600 and state.get('tr') is not None:   # free the card for others when there is no work
                log('idle 10 min: unloading'); state.clear(); gc.collect(); torch.cuda.empty_cache()
            continue
        idle = 0
        f = os.path.join(watch, files[0])
        try:
            run_file(f, outdir, state)
        except Exception as e:
            import traceback; traceback.print_exc()
            log(f'{f} failed: {e}')
            os.replace(f, f + '.failed')
            continue
        os.replace(f, f + '.done')
    log('STOP found, exiting')


if __name__ == '__main__':
    main()
