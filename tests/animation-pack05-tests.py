import importlib.util
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
JOBS = ROOT / "art/animation-pack-05/jobs.json"
BUILDER = ROOT / "tools/build-animation-pack05.py"


def verify_manifest():
    cfg=json.loads(JOBS.read_text())
    assert cfg["count"] == len(cfg["jobs"]) == 24
    ids = [j["id"] for j in cfg["jobs"]]
    assert len(set(ids)) == len(ids)
    for prefix,min_n in [("milos-",10),("vila-",10),("marko-",2),("musa-",1),("sarac-",1)]:
        assert sum(k.startswith(prefix) for k in ids)==min_n
    for j in cfg["jobs"]:
        assert j["status"]=="needs-authored-frames"
        assert j["frames"] == j["grid"]["columns"]*j["grid"]["rows"] == 8
        assert len(j["prompt"]) > 350
        assert j["references"]
        assert 8<=j["fps"]<=18
    return cfg


def gif_fixture(path, motion=True):
    images=[]
    for n in range(8):
        im=Image.new("RGB",(256,256),(0,255,0))
        d=ImageDraw.Draw(im)
        x=45+(n*15 if motion else 0)
        # This is ONLY a temporary CI input fixture, never shipped as game artwork.
        d.rectangle((x,55,x+66,196),fill=(150,30,25))
        d.ellipse((x+12,35,x+50,80),fill=(220,160,130))
        images.append(im)
    images[0].save(path,save_all=True,append_images=images[1:],
                   format="GIF",loop=0,duration=100,optimize=False)


def main():
    verify_manifest()
    with tempfile.TemporaryDirectory() as tmp:
        p=Path(tmp)
        inp=p/"incoming";inp.mkdir()
        out=p/"out"
        gif_fixture(inp/"milos-idle.gif",True)
        r=subprocess.run([sys.executable,str(BUILDER),
             "--input-dir",str(inp),"--output-dir",str(out),"--allow-incomplete"],
            text=True,capture_output=True)
        if r.returncode:raise AssertionError(r.stdout+"\n"+r.stderr)
        result=json.loads((out/"qa/validation.json").read_text())
        assert result["requested"]==24, result
        assert result["rendered"]==1, result
        assert result["missing"]==23, result
        assert (out/"dist/assets/milos-idle.png").exists()
        assert (out/"dist/assets/milos-idle.json").exists()
        assert (out/"art/animation-pack-05/assets/milos-idle/preview.gif").exists()
        bad=p/"bad";bad.mkdir()
        gif_fixture(bad/"milos-idle.gif",False)
        out2=p/"bad-output"
        r=subprocess.run([sys.executable,str(BUILDER),
             "--input-dir",str(bad),"--output-dir",str(out2),"--allow-incomplete"],
            text=True,capture_output=True)
        if r.returncode:raise AssertionError(r.stdout+"\n"+r.stderr)
        rep=json.loads((out2/"qa/validation.json").read_text())
        assert rep["rejected"] == 1, rep
        assert rep["rendered"] == 0, rep
    print("PASS: 24 jobs, real 8-frame import, fixed atlas, static/duplicate clip rejection")

if __name__=="__main__":main()
