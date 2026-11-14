#!/usr/bin/env python3
"""Import *authored* animation frames into Marko's component-row atlas format.

The tool never manufactures in-between body poses. For each job it needs either
one transparent/chroma keyed sprite grid or one genuine multi-frame GIF/APNG/WebP.
It rejects duplicate/near-static clips instead of treating them as animations.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageSequence, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_JOBS = ROOT / "art/animation-pack-05/jobs.json"


def args():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--jobs", type=Path, default=DEFAULT_JOBS)
    ap.add_argument("--input-dir", type=Path, required=True)
    ap.add_argument("--output-dir", type=Path, required=True)
    ap.add_argument("--allow-incomplete", action="store_true")
    return ap.parse_args()


def source_for(folder: Path, name: str):
    for ext in (".png", ".webp", ".gif", ".apng"):
        p = folder / (name + ext)
        if p.exists():
            return p
    return None


def extract(source: Path, job: dict):
    src = Image.open(source)
    n = int(job["frames"])
    if getattr(src, "n_frames", 1) > 1:
        frames = [frame.convert("RGBA").copy() for frame in ImageSequence.Iterator(src)]
        if len(frames) != n:
            raise ValueError(f"Expected {n} real frames but found {len(frames)}")
        return frames
    image = src.convert("RGBA")
    cols, rows = int(job["grid"]["columns"]), int(job["grid"]["rows"])
    if cols * rows != n:
        raise ValueError("Frame count and grid dimensions disagree")
    w, h = image.size
    if w % cols or h % rows:
        raise ValueError(f"Image {w}x{h} does not divide into {cols}x{rows} equal cells")
    cw, ch = w // cols, h // rows
    if min(cw, ch) < 128:
        raise ValueError(f"Frames too small: {cw}x{ch}")
    return [image.crop((x*cw,y*ch,(x+1)*cw,(y+1)*ch))
            for y in range(rows) for x in range(cols)]


def remove_chroma(image: Image.Image) -> Image.Image:
    # Only remove an obvious flat high-green image background, not clothes/wings.
    a = np.array(image.convert("RGBA"), dtype=np.uint8).copy()
    rgb = a[:, :, :3].astype(np.float32)
    r,g,b = rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
    corners = np.concatenate((rgb[:12,:12].reshape(-1,3),
                              rgb[:12,-12:].reshape(-1,3),
                              rgb[-12:,:12].reshape(-1,3),
                              rgb[-12:,-12:].reshape(-1,3)))
    green_corners = np.mean((corners[:,1] > 115)&
                            (corners[:,1] > corners[:,0]*1.42)&
                            (corners[:,1] > corners[:,2]*1.42))
    if green_corners > .45:
        # Preserve yellow costume highlights: key requires genuinely green dominant pixels.
        dominance = g - np.maximum(r,b)*1.1
        chroma = (g > 112)&(dominance > 30)
        a[:,:,3][chroma] = 0
        # Reduce green fringes in antialias pixels close to the mask edge.
        fringe = (g > 100)&(dominance > 14)&(~chroma)
        opacity = np.clip((30-dominance[fringe])/16, .05, 1)
        a[:,:,3][fringe] = (a[:,:,3][fringe].astype(float)*opacity).astype(np.uint8)
        a[:,:,1][fringe] = np.minimum(a[:,:,1][fringe],
                                      np.maximum(a[:,:,0][fringe],a[:,:,2][fringe])+15)
    a[a[:,:,3] == 0, :3] = 0
    return Image.fromarray(a, "RGBA")


def normalize(images: list[Image.Image], cell: int):
    result = []
    for image in images:
        image = remove_chroma(image)
        if image.width != image.height:
            raise ValueError(f"Frame is not square: {image.width}x{image.height}")
        if image.size != (cell,cell):
            image = image.resize((cell,cell), Image.Resampling.LANCZOS)
        if image.getbbox() is None:
            raise ValueError("Empty frame after chroma removal")
        result.append(image)
    return result


def quality(frames: list[Image.Image], name: str):
    # Freeze/static screenshots and repeated frame sequences must be rejected.
    small = [np.asarray(i.resize((96,96),Image.Resampling.BILINEAR).convert("RGBA"),
                        dtype=np.float32)/255 for i in frames]
    diffs = []
    for prev, cur in zip(small, small[1:]):
        both = (prev[:,:,3] > .13) | (cur[:,:,3] > .13)
        changed = np.abs(cur[:,:,:3]-prev[:,:,:3]).mean(axis=2)
        delta = np.mean(changed[both]) if both.any() else 0
        diffs.append(float(delta))
    if max(diffs,default=0) < .006 or sum(d > .005 for d in diffs) < 2:
        raise ValueError(f"{name}: frames are nearly static/duplicates: {diffs}")
    bbox = [im.getchannel("A").getbbox() for im in frames]
    if any(b is None for b in bbox):
        raise ValueError(name + ": missing full subject")
    sizes = [(b[2]-b[0],b[3]-b[1]) for b in bbox]
    if any(w < 65 or h < 65 for w,h in sizes):
        raise ValueError(name + ": character clipped or far too small")
    # Flag major pops and identity drift for a human review; do not silently fix anatomy.
    measures = [w*h for w,h in sizes]
    size_ratio = max(measures)/max(1,min(measures))
    return {"adjacent_pose_differences": [round(d,5) for d in diffs],
            "bbox_size_ratio":round(size_ratio,3),
            "requires_visual_review": True,
            "warning": "Large size change: check pose scale" if size_ratio > 1.55 else None}


def export(job: dict, frames: list[Image.Image], out: Path, src: Path, cell: int):
    name = job["id"]
    frames = normalize(frames,cell)
    qa = quality(frames,name)
    n = len(frames)
    atlas = Image.new("RGBA", (n*cell,cell), (0,0,0,0))
    for j,fr in enumerate(frames):
        atlas.alpha_composite(fr,(j*cell,0))
    art = out/"art/animation-pack-05/assets"/name
    asset = out/"dist/assets"
    art.mkdir(parents=True,exist_ok=True)
    asset.mkdir(parents=True,exist_ok=True)
    atlas.save(art/"atlas.png",optimize=True)
    atlas.save(asset/(name+".png"),optimize=True)
    fps=int(job["fps"])
    duration=max(1,round(1000/fps))
    manifest = {
        "characterId":name, "engine":"component-row", "game_input":"atlas.png",
        "generated_from": src.name, "rendered":True, "approved":False,
        "needs_visual_qa":True,"cell":{"shape":"square","width":cell,"height":cell,
        "safe_margin_x":12,"safe_margin_y":12},
        "animation":{"cellWidth":cell,"cellHeight":cell,"columns":n,
        "rows":{"motion":{"row":0,"frames":n,"fps":fps,"loop":bool(job["loop"]),
        "durations_ms":[duration]*n}}},
        "frame_layout":{"sheetWidth":n*cell,"sheetHeight":cell,
        "cellWidth":cell,"cellHeight":cell,
        "rows":{"motion":[{"x":j*cell,"y":0,"w":cell,"h":cell}
        for j in range(n)]}},"events":job.get("events",[]),
        "qa":qa
    }
    blob=json.dumps(manifest,indent=2,ensure_ascii=False)+"\n"
    (art/"manifest.json").write_text(blob,encoding="utf8")
    (asset/(name+".json")).write_text(blob,encoding="utf8")
    for j,frame in enumerate(frames):
        fp=art/"frames"/"motion"/f"frame-{j}.png"
        fp.parent.mkdir(parents=True,exist_ok=True)
        frame.save(fp,optimize=True)
    preview=[i.copy().resize((384,384),Image.Resampling.LANCZOS)
             for i in frames]
    preview[0].save(art/"preview.gif",save_all=True,
                    append_images=preview[1:],duration=duration,loop=0,
                    optimize=False,disposal=2,transparency=0)
    (art/"qa.json").write_text(json.dumps(qa,indent=2)+"\n",encoding="utf8")
    return qa


def main():
    cfg=args()
    manifest=json.loads(cfg.jobs.read_text(encoding="utf8"))
    out=cfg.output_dir
    cell=int(manifest["cell"]["width"])
    if cell!=int(manifest["cell"]["height"]):
        raise ValueError("Only square cells supported")
    results=[]
    for job in manifest["jobs"]:
        name=job["id"]
        source=source_for(cfg.input_dir,name)
        if source is None:
            results.append({"id":name,"status":"missing-authored-frames"})
            continue
        try:
            result=export(job,extract(source,job),out,source,cell)
            results.append({"id":name,"status":"rendered-needs-visual-qa","qa":result})
            print("RENDERED",name)
        except Exception as exc:
            results.append({"id":name,"status":"rejected","reason":str(exc)})
            print("REJECTED",name,str(exc))
    report={"pack":manifest["pack"],"requested":len(manifest["jobs"]),
            "rendered":sum(x["status"]=="rendered-needs-visual-qa" for x in results),
            "missing":sum(x["status"]=="missing-authored-frames" for x in results),
            "rejected":sum(x["status"]=="rejected" for x in results),
            "items":results}
    q=out/"qa";q.mkdir(parents=True,exist_ok=True)
    (q/"validation.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf8")
    print(json.dumps({k:v for k,v in report.items() if k!="items"},indent=2))
    if (report["missing"] or report["rejected"]) and not cfg.allow_incomplete:
        raise SystemExit("Pack incomplete; pass --allow-incomplete ONLY for WIP")
    return 0


if __name__=="__main__":
    raise SystemExit(main())
