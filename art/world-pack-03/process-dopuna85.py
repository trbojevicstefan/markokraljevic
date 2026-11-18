from pathlib import Path
import json
import numpy as np
from PIL import Image

def dump(path, data):
    path.write_text(json.dumps(data, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")

def remove_magenta(source, dest, qa_path):
    im = Image.open(source).convert("RGBA")
    ar = np.array(im)
    r, g, b = [ar[:, :, i].astype(float) for i in range(3)]
    key = (r > 180) & (b > 140) & (r > g * 1.35) & (b > g * 1.20)
    ar[key, 3] = 0
    ar[ar[:, :, 3] == 0, :3] = 0
    out = Image.fromarray(ar)
    out.save(dest)
    blue = Image.new("RGBA", out.size, (35, 85, 150, 255)); blue.alpha_composite(out); blue.convert("RGB").save(dest.with_name("prop-trnje-qa-blue.png"))
    white = Image.new("RGBA", out.size, (255, 255, 255, 255)); white.alpha_composite(out); white.convert("RGB").save(dest.with_name("prop-trnje-qa-white.png"))
    mask = ar[:, :, 3] > 0
    edge = np.zeros(mask.shape, dtype=bool); edge[0] = mask[0]; edge[-1] = mask[-1]; edge[:, 0] |= mask[:, 0]; edge[:, -1] |= mask[:, -1]
    magenta_remaining = ((r > 180) & (b > 140) & (r > g * 1.35) & (b > g * 1.20) & mask)
    dump(qa_path, {"asset":"prop-trnje", "size":list(out.size), "transparentPixels":int((~mask).sum()), "magentaPixels":int(magenta_remaining.sum()), "touchesEdge":bool(edge.any()), "bluePreview":"prop-trnje-qa-blue.png", "whitePreview":"prop-trnje-qa-white.png"})

if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    attempt = root / "world-pack-03" / "uzori-d85" / "prop-trnje-attempt-1.png"
    dest = root / "world-pack-03" / "prop-trnje.png"
    remove_magenta(attempt, dest, root / "world-pack-03" / "prop-trnje-qa.json")
