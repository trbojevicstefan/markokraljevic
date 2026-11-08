"""Export newly generated actor references; never overwrite published bases."""
from pathlib import Path
from PIL import Image
import json,subprocess
ROOT=Path(__file__).resolve().parent;GAME=ROOT.parents[1]
SG=GAME.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
for job in json.loads((ROOT/'base-requests.json').read_text(encoding='utf8'))['jobs']:
    source=ROOT/'sources'/job['id']/'base-green.png'
    output=ROOT/'assets'/job['id']/'base-source.png'
    if not source.exists() or output.exists():continue
    cut=source.with_name('base-cutout.png')
    subprocess.run([str(SG),'cutout',str(source),'--out',str(cut),'--key','green','--decontam','palette'],check=True)
    im=Image.open(cut).convert('RGBA');box=im.getchannel('A').getbbox()
    if not box:raise ValueError('Empty actor: '+job['id'])
    im=im.crop(box);scale=min(job['height']/im.height,500/im.width)
    im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',tuple(job['canvas']));bottom=job['footY']+1
    canvas.alpha_composite(im,((canvas.width-im.width)//2,bottom-im.height))
    output.parent.mkdir(parents=True,exist_ok=True);canvas.save(output)
    assert canvas.getchannel('A').getbbox()[3]==bottom
    output.with_name('base-qa.json').write_text(json.dumps({'size':list(canvas.size),'bounds':canvas.getchannel('A').getbbox(),'footY':job['footY'],'targetHeight':job['height'],'actualHeight':im.height},indent=2),encoding='utf8')
    print('Published actor reference:',job['id'])
