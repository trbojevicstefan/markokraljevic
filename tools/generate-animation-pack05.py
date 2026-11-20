#!/usr/bin/env python3
"""Generate real IMAGE INPUTS for pack 05 with Google Gen AI image model.

Imagen 2 has been retired. Requires GEMINI_API_KEY for the current image endpoint.
No result is marked gameplay-ready until the converter and visual QA accept it.
"""

import argparse
import io
import json
import os
import time
from pathlib import Path


ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"art/animation-pack-05/jobs.json"


def cli():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--jobs",type=Path,default=MANIFEST)
    p.add_argument("--out",type=Path,default=ROOT/"art/animation-pack-05/incoming")
    p.add_argument("--model",default="gemini-3.1-flash-image")
    p.add_argument("--only",nargs="*",default=[])
    p.add_argument("--limit",type=int,default=24)
    p.add_argument("--dry-run",action="store_true")
    p.add_argument("--allow-missing-reference",action="store_true",
       help="Use only for a character identity bootstrap, not production motion")
    p.add_argument("--overwrite",action="store_true")
    p.add_argument("--delay",type=float,default=3.0)
    return p.parse_args()


def reference_paths(job):
    return [ROOT/p for p in job.get("references",[])]

def main():
    opts=cli()
    cfg=json.loads(opts.jobs.read_text(encoding="utf8"))
    todo=[x for x in cfg["jobs"] if not opts.only or x["id"] in set(opts.only)]
    todo=todo[:opts.limit]
    missing=[]
    for job in todo:
        missing.extend((job["id"],str(p)) for p in reference_paths(job) if not p.exists())
    if opts.dry_run:
        print(json.dumps({"model":opts.model,"requested":len(todo),
             "missing_references":missing,"jobs":[x["id"] for x in todo],
             "note":"DRY RUN ONLY; no images generated or accepted"},indent=2))
        return
    if missing and not opts.allow_missing_reference:
        raise SystemExit("Missing canonical character art. Lock references first:\n" +
                         "\n".join(x+" "+p for x,p in missing))
    if not os.environ.get("GEMINI_API_KEY"):
        raise SystemExit("Set GEMINI_API_KEY in the environment. No secret is embedded in the repository.")
    try:
        from google import genai
        from google.genai import types
        from PIL import Image
    except ImportError as exc:
        raise SystemExit("Install dependencies: pip install google-genai Pillow") from exc
    client=genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    opts.out.mkdir(parents=True,exist_ok=True)
    log=[]
    for j,job in enumerate(todo):
        path=opts.out/(job["id"]+".png")
        if path.exists() and not opts.overwrite:
            log.append({"id":job["id"],"status":"already-generated-unreviewed"})
            continue
        refs=[p for p in reference_paths(job) if p.is_file()][:3]
        contents=[job["prompt"]]
        for ref in refs:
            suffix=ref.suffix.lower()
            mime="image/jpeg" if suffix in {".jpg",".jpeg"} else "image/webp" if suffix==".webp" else "image/png"
            contents.append(types.Part.from_bytes(data=ref.read_bytes(),mime_type=mime))
        last_error=""
        for attempt in range(3):
            try:
                response=client.models.generate_content(
                    model=opts.model,contents=contents,
                    config=types.GenerateContentConfig(response_modalities=["IMAGE"]))
                images=[part for part in (response.parts or []) if getattr(part,"inline_data",None)]
                if not images:raise ValueError("No image parts returned by provider")
                raw=images[-1].inline_data.data
                im=Image.open(io.BytesIO(raw)).convert("RGBA")
                if im.width < 1024 or im.height < 512:
                    raise ValueError(f"Generator returned insufficient resolution {im.size}")
                # Do NOT re-tile, warp or hallucinate extra poses; build tool verifies the grid.
                im.save(path,optimize=True)
                log.append({"id":job["id"],"status":"generated-unreviewed",
                            "size":list(im.size),"model":opts.model,
                            "references":[str(x.relative_to(ROOT)) for x in refs]})
                print(f"GENERATED {job['id']} {im.size}; visual QA still required")
                last_error=""
                break
            except Exception as exc:
                last_error=str(exc)
                time.sleep(min(20,2**attempt*3))
        if last_error:
            log.append({"id":job["id"],"status":"failed","error":last_error})
            print(f"REJECTED {job['id']}: {last_error}")
        time.sleep(max(0,opts.delay))
    (opts.out/"generation-log.json").write_text(json.dumps(
        {"provider":"Google Gen AI", "model":opts.model, "results":log},indent=2)+"\n")
    if any(r["status"]=="failed" for r in log):
        raise SystemExit("One or more jobs failed; check generation-log.json")


if __name__=="__main__":
    main()
