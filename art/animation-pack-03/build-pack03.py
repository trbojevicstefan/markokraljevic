"""Builds animation pack 03 briefs: one sprite-gen run folder per clip (request, prompt, layout guide,
identity reference), prompts.json with the creative briefs and a Serbian catalog (index.html).

    python build-pack03.py

Generation per clip is then the same pipeline as pack 02:
    image generator (prompt + base-source.png + layout guide)  ->  raw/motion.png
    sprite-gen extract / compose-atlas / compose-gif            ->  atlas + frames + manifest
"""
import html, json, os, shutil, subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
# lives in marko-game/art/animation-pack-03; the workspace root holds tools/ and animation-pack-02/
PROJECT = os.path.abspath(os.path.join(ROOT, '..', '..', '..'))
SPRITE_GEN = os.path.join(PROJECT, 'tools', 'sprite-gen', '.venv', 'Scripts', 'sprite-gen.exe')
CAST = os.path.join(PROJECT, 'marko-game', 'dist', 'assets', 'cast')
PACK2 = os.path.join(PROJECT, 'animation-pack-02', 'assets')

# Identity references: the approved look of each character.
REFS = {
    'marko': os.path.join(CAST, 'marko.png'),
    'sword': os.path.join(CAST, 'sword.png'),
    'shield': os.path.join(CAST, 'shield.png'),
    'archer': os.path.join(CAST, 'archer.png'),
    'musa': os.path.join(CAST, 'musa.png'),
    'akindzija': os.path.join(PACK2, 'akindzija-charge', 'frames', 'motion', 'frame-5.png'),
    'oklopnik': os.path.join(PACK2, 'oklopnik-slam', 'frames', 'motion', 'frame-0.png'),
    'palikuca': os.path.join(PACK2, 'palikuca-torch', 'frames', 'motion', 'frame-0.png'),
}
NAMES = {'marko': 'Kraljević Marko', 'sword': 'Sabljaš', 'shield': 'Štitonoša', 'archer': 'Strelac', 'musa': 'Musa Kesedžija',
         'akindzija': 'Akindžija', 'oklopnik': 'Oklopnik', 'palikuca': 'Palikuća'}
IDENTITY = {
    'marko': 'Marko Kraljevic: dark wavy hair, thick moustache and beard, red embroidered cloak with gold trim, bronze-and-leather lamellar armor, ivory sleeves with red embroidery, dark trousers, brown boots, spiked iron mace (topuz) in the right hand, wine gourd on the belt.',
    'sword': 'Ottoman swordsman: white turban wrapped around a spiked steel helmet with a trailing turban tail, crimson kaftan over scale armor, brown boots, curved scimitar.',
    'shield': 'Ottoman shield bearer: spiked steel helmet with white turban, green brocade kaftan, round bronze shield on the left arm, short curved sword.',
    'archer': 'Ottoman archer: red cap with white turban, mustard-yellow and teal kaftan, quiver on the back, recurve bow.',
    'musa': 'Musa Kesedzija, a giant outlaw: white headband, black beard, dark purple embroidered coat, red sash, huge curved scimitar.',
    'akindzija': 'Akinji raider: red turban with a bronze plate, long cream scarf, teal and green jacket with leather straps, baggy trousers, two curved sabres.',
    'oklopnik': 'Heavy armored Ottoman (oklopnik): steel helmet with gold trim and chainmail aventail, crimson quilted coat under golden scale armor, round bronze shield, war hammer.',
    'palikuca': 'Ottoman arsonist (palikuca): orange-red turban, soot-smudged face, mustard shirt with a dark vest, red sash, satchel, carries a burning torch (the flame is part of the torch prop).',
}
STYLE = ('Production painterly cel-shaded 2D game sprites, side view facing RIGHT unless a frame says otherwise. ONE horizontal row of clearly '
         'separated full-body poses on pure flat #00FF00 green. Same anatomical head size and body proportions in every frame, shared foot '
         'baseline, generous empty gaps and padding, the whole weapon and cloak visible in every pose. No text, no floor, no wall, no shadows, '
         'no motion streaks, no glows.')

# id, character, frames, fps, loop, ground, topic, game use (sr), [(frame sr, frame en)]
CLIPS = [
    # 1 · idle
    ('marko-idle', 'marko', 8, 10, True, True, '1 · Markovo mirovanje', 'Zamenjuje statičnu sliku dok Marko stoji. Petlja 10 FPS.', [
        ('miran stav, topuz spušten u desnoj ruci', 'relaxed ready stance, mace hanging low in the right hand'),
        ('udah: grudi se šire, ramena se dižu', 'inhale: chest expands, shoulders rise slightly'),
        ('vrh udaha, ogrtač se blago njiše nazad', 'top of the breath, cloak sways slightly back'),
        ('izdah, težina prelazi na prednju nogu', 'exhale, weight shifts onto the front foot'),
        ('glava se kratko okreće ka posmatraču', 'head turns briefly toward the viewer'),
        ('prsti stežu dršku topuza, pogled napred', 'fingers tighten on the mace handle, gaze forward again'),
        ('ogrtač se smiruje', 'cloak settles'),
        ('povratak u poziciju 1, bez skoka', 'returns to pose 1 for a seamless loop'),
    ]),
    # 2 · light combo
    ('marko-combo-1', 'marko', 6, 14, False, True, '2 · Niz od 3 laka udarca', 'J (1. pritisak). Pogodak na kadru 3. Kadrovi 5–6: prozor za sledeći J.', [
        ('gard, topuz kod kuka', 'guard, mace at the hip'),
        ('kratak zamah unazad u visini ramena', 'short backswing at shoulder height'),
        ('brz vodoravan udarac napred u visini grudi — KONTAKT', 'fast horizontal strike forward at chest height — CONTACT'),
        ('topuz prolazi preko tela, trup zarotiran', 'mace sweeps across the body, torso rotated'),
        ('oporavak, topuz kod levog ramena', 'recovery, mace near the left shoulder'),
        ('poza iz koje kreće drugi udarac', 'pose that flows into the second strike'),
    ]),
    ('marko-combo-2', 'marko', 6, 14, False, True, '2 · Niz od 3 laka udarca', 'J (2. pritisak). Pogodak na kadru 3. Kadrovi 5–6: prozor za treći J.', [
        ('topuz kod levog ramena (nastavak prvog udarca)', 'mace at the left shoulder, continuing from strike one'),
        ('korak napred, kukovi se okreću', 'step forward, hips rotate'),
        ('povratni udarac dijagonalno nadole s leva na desno — KONTAKT', 'backhand return swing diagonally downward from left to right — CONTACT'),
        ('topuz nisko desno', 'mace low on the right'),
        ('diže topuz ka desnom ramenu', 'lifts the mace toward the right shoulder'),
        ('spreman za završni udarac', 'ready for the finisher'),
    ]),
    ('marko-combo-3', 'marko', 6, 12, False, True, '2 · Niz od 3 laka udarca', 'J (3. pritisak), završni udarac. Pogodak na kadru 4 sa talasom prašine.', [
        ('obe ruke hvataju dršku, topuz iza glave', 'both hands grip the handle, mace behind the head'),
        ('mali odskok, telo se izvija unazad', 'small hop, body arches back'),
        ('vrh: topuz visoko iznad glave, kolena savijena', 'apex: mace high above the head, knees bent'),
        ('snažan udar nadole u tlo ispred — KONTAKT, čučanj', 'powerful downward smash into the ground ahead — CONTACT, crouched'),
        ('topuz zariven u tlo, ogrtač pada', 'mace buried in the ground, cloak falls'),
        ('ispravljanje u gard', 'straightens into guard'),
    ]),
    # 3 · dodge roll
    ('marko-roll', 'marko', 6, 16, False, True, '3 · Kolut za izmicanje', 'Shift. Kolut traje ~0,4 s; neranjiv od kadra 2 do 4.', [
        ('nagnut napred, kreće u kolut', 'leans forward, starting the roll'),
        ('rame dodiruje tlo, ogrtač obavija telo', 'shoulder touches the ground, cloak wraps the body'),
        ('kolut: leđa ka tlu, kolena uz grudi, topuz uz telo', 'tucked roll: back to the ground, knees to chest, mace held close'),
        ('izlazi iz koluta u čučanj', 'comes out of the roll into a crouch'),
        ('klečeći se diže', 'rising from a kneel'),
        ('nastavlja u trk, jedna noga ispred', 'flows into a run, one foot forward'),
    ]),
    # 4 · Marko hit reactions
    ('marko-hurt', 'marko', 4, 12, False, True, '4 · Marko: primljen udarac, pad i ustajanje', 'Lak pogodak (bez obaranja).', [
        ('udarac u grudi: glava i ramena trznu nazad', 'hit in the chest: head and shoulders snap back'),
        ('korak nazad, slobodna ruka štiti telo', 'step back, free arm guards the body'),
        ('stabilizuje se, stisnutih zuba', 'steadies himself, teeth gritted'),
        ('vraća se u gard', 'back to guard'),
    ]),
    ('marko-knockdown', 'marko', 6, 10, False, True, '4 · Marko: primljen udarac, pad i ustajanje', 'Jak udarac (Musa, oklopnik, eksplozija). Kadar 5 se drži dok ne ustane.', [
        ('snažan pogodak: telo savijeno nazad, stopala se odvajaju od tla', 'heavy hit: body bent backward, feet leaving the ground'),
        ('leti unazad vodoravno, ogrtač leprša', 'flying backward horizontally, cloak flapping'),
        ('pada leđima na tlo', 'lands on his back'),
        ('klizi po leđima', 'slides on his back'),
        ('leži na leđima, topuz pored ruke', 'lying on his back, mace beside his hand'),
        ('leži, glava se podiže', 'still lying, head lifts'),
    ]),
    ('marko-getup', 'marko', 6, 10, False, True, '4 · Marko: primljen udarac, pad i ustajanje', 'Posle pada; kadrovi 1–3 neranjiv.', [
        ('leži na leđima', 'lying on his back'),
        ('oslanja se na lakat', 'props himself on an elbow'),
        ('na jedno koleno', 'up on one knee'),
        ('ustaje oslanjajući se na topuz', 'stands up leaning on the mace'),
        ('stoji pognut, hvata dah', 'standing bent over, catching breath'),
        ('gard', 'guard'),
    ]),
    # 5 · perfect parry counter
    ('marko-counter', 'marko', 8, 16, False, True, '5 · Kontra posle savršenog odbijanja', 'Posle savršenog L. Usporenje 0,3 s na kadru 4; pogoci na kadrovima 4 i 7.', [
        ('savršeno odbijanje: topuz vodoravno ispred lica', 'perfect parry: mace held horizontally in front of the face'),
        ('protivnikovo oružje odbačeno, okret u kukovima', 'enemy weapon knocked aside, hips turning'),
        ('korak unutra, topuz nisko iza', 'steps in, mace low behind'),
        ('aperkat: topuz udara odozdo nagore — KONTAKT', 'uppercut: mace swings from low to high — CONTACT'),
        ('topuz visoko iznad glave, telo ispruženo', 'mace high above the head, body stretched'),
        ('okret za drugi udarac', 'turns for the second blow'),
        ('vodoravni udarac — KONTAKT 2', 'horizontal blow — CONTACT 2'),
        ('junačka poza, topuz na ramenu', 'heroic pose, mace resting on the shoulder'),
    ]),
    # 6 · downward plunge
    ('marko-plunge', 'marko', 6, 12, False, True, '6 · Udar topuzom nadole iz skoka', 'Dole + J u skoku. Kadar 3 se drži dok ne dodirne tlo; pogodak i talas na kadru 4.', [
        ('u vazduhu, obe ruke dižu topuz iza glave', 'airborne, both hands raise the mace behind the head'),
        ('telo se savija napred, topuz iznad', 'body curls forward, mace above'),
        ('pada nadole, topuz okrenut ka tlu', 'dropping, mace pointed at the ground'),
        ('udar u tlo: čučanj, topuz zariven — KONTAKT', 'ground impact: crouched, mace driven into the ground — CONTACT'),
        ('kleči, oslanja se na topuz', 'kneeling, leaning on the mace'),
        ('ustaje u gard', 'rises into guard'),
    ]),
]

HURT = {
    'sword': [('trzaj glave nazad, kraj turbana leti', 'head snaps back, turban tail whips'), ('korak nazad, sablja spuštena', 'steps back, scimitar lowered'),
              ('povija se, drži se za stomak', 'doubles over, hand on the stomach'), ('vraća se u stav', 'back to stance')],
    'shield': [('udarac kroz štit: štit odbačen u stranu', 'blow through the shield: shield knocked aside'), ('posrće nazad', 'staggers back'),
               ('hvata ravnotežu, štit nisko (otvoren gard)', 'regains balance, shield low (guard open)'), ('diže štit', 'raises the shield again')],
    'archer': [('trzaj, luk izbačen iz pozicije', 'flinch, bow knocked out of position'), ('korak nazad', 'step back'),
               ('povijen', 'hunched over'), ('vraća luk u ruke', 'brings the bow back up')],
    'akindzija': [('trzaj, sablje razbacane u stranu', 'flinch, sabres flung wide'), ('odskače nazad na prste', 'hops back on the toes'),
                  ('čučne i trese glavom', 'crouches and shakes the head'), ('ponovo u nizak stav', 'back to the low stance')],
    'oklopnik': [('jedva se pomera: ramena trznu, oklop zvekne', 'barely moves: shoulders jolt, armor rattles'), ('zanese se pola koraka', 'sways half a step'),
                 ('štit nisko, otvoren', 'shield low, open'), ('vraća se u težak stav', 'back to the heavy stance')],
    'palikuca': [('trzaj, baklja zamahne', 'flinch, torch swings'), ('posrće nazad', 'stumbles back'),
                 ('kašlje, povijen', 'coughing, hunched'), ('diže baklju', 'raises the torch')],
    'musa': [('veliki trzaj, zareži od bola', 'big flinch, snarling in pain'), ('korak nazad, sablja nisko', 'step back, scimitar low'),
             ('stisne zube, pogled pun besa', 'clenched teeth, furious glare'), ('vraća se u stav', 'back to stance')],
}
for who, frames in HURT.items():
    CLIPS.append((f'{who}-hurt', who, 4, 12, False, True, '7 · Trzaj na udarac (svi protivnici)', 'Svaki pogodak koji ne ubija; zamenjuje proceduralni nagib.', frames))

CLIPS += [
    ('akindzija-run', 'akindzija', 6, 12, True, True, '8 · Hod/trk i smrt novih protivnika', 'Kretanje akindžije; korak ~90 px po ciklusu.', [
        ('kontakt desnom nogom, telo nisko nagnuto, sablje unazad', 'right foot contact, body low and leaning, sabres held back'),
        ('odraz, šal leti', 'push-off, scarf flying'), ('let, obe noge od tla', 'flight phase, both feet off the ground'),
        ('kontakt levom nogom', 'left foot contact'), ('odraz', 'push-off'), ('let, povratak u kadar 1', 'flight phase back to frame 1')]),
    ('akindzija-death', 'akindzija', 6, 10, False, True, '8 · Hod/trk i smrt novih protivnika', 'Smrt; poslednji kadar leži ceo na tlu (kao postojeće smrti).', [
        ('pogođen, sablje ispadaju', 'hit, sabres slipping from the hands'), ('pada na kolena', 'drops to the knees'), ('pada unazad', 'falls backward'),
        ('udara o tlo', 'hits the ground'), ('leži', 'lying'), ('nepomičan', 'motionless')]),
    ('oklopnik-walk', 'oklopnik', 6, 8, True, True, '8 · Hod/trk i smrt novih protivnika', 'Težak hod oklopnika; korak ~70 px po ciklusu.', [
        ('težak korak desnom, štit napred', 'heavy right step, shield forward'), ('prenosi težinu', 'shifts weight'), ('čekić na ramenu se zanese', 'hammer on the shoulder sways'),
        ('težak korak levom', 'heavy left step'), ('prenosi težinu', 'shifts weight'), ('povratak u kadar 1', 'back to frame 1')]),
    ('oklopnik-death', 'oklopnik', 6, 8, False, True, '8 · Hod/trk i smrt novih protivnika', 'Smrt; oklop zvekne o tlo.', [
        ('pogođen, kleči na jedno koleno', 'hit, drops to one knee'), ('oslanja se na čekić', 'leans on the hammer'), ('čekić klizi', 'hammer slips'),
        ('pada na stranu', 'falls onto his side'), ('štit se otkotrlja', 'shield rolls away'), ('leži nepomičan', 'lying motionless')]),
    ('palikuca-run', 'palikuca', 6, 12, True, True, '8 · Hod/trk i smrt novih protivnika', 'Trk palikuće sa bakljom visoko.', [
        ('kontakt desnom, baklja visoko', 'right foot contact, torch held high'), ('odraz', 'push-off'), ('let', 'flight phase'),
        ('kontakt levom', 'left foot contact'), ('odraz', 'push-off'), ('let, povratak u kadar 1', 'flight phase back to frame 1')]),
    ('palikuca-death', 'palikuca', 6, 10, False, True, '8 · Hod/trk i smrt novih protivnika', 'Smrt; baklja pada pored i gori dalje.', [
        ('pogođen, baklja ispada', 'hit, torch drops'), ('posrće', 'stumbles'), ('pada unazad', 'falls backward'),
        ('udara o tlo', 'hits the ground'), ('leži, baklja gori pored', 'lying, torch still burning beside him'), ('nepomičan', 'motionless')]),
]

IDLE = {
    'sword': ('stav sa sabljom, disanje, sablja se blago pomera, kraj turbana leprša', 'fighting stance with the scimitar, breathing, blade shifts slightly, turban tail flutters'),
    'shield': ('štit ispred, viri preko štita, diše', 'shield up front, peeks over the rim, breathing'),
    'archer': ('luk spušten, proverava strelu, gleda napred', 'bow lowered, checks an arrow, looks ahead'),
    'akindzija': ('poskakuje na prstima, vrti sablju', 'bounces on the toes, twirls a sabre'),
    'oklopnik': ('težak dah, čekić na ramenu, štit oslonjen', 'heavy breathing, hammer on the shoulder, shield resting'),
    'palikuca': ('baklja treperi, nervozno gleda okolo', 'torch flickers, glances around nervously'),
    'musa': ('prezrivo diše, sablja preko ramena', 'breathing with contempt, scimitar over the shoulder'),
}
for who, (sr, en) in IDLE.items():
    CLIPS.append((f'{who}-idle', who, 6, 8, True, True, '9 · Mirovanje protivnika', 'Petlja dok protivnik stoji (zamenjuje statičnu sliku).', [
        (f'{sr} — kadar {i + 1}', f'{en} — phase {i + 1} of a seamless 6-frame breathing loop') for i in range(6)]))

CLIPS += [
    ('marko-ledge', 'marko', 8, 12, False, False, '10 · Ivica i zid', 'Hvatanje ivice i penjanje. Šake na istoj visini (ivica) u kadrovima 2–6; topuz okačen o pojas.', [
        ('skok, ruka ispružena ka ivici gore desno', 'jump, arm reaching up-right toward a ledge'), ('hvata ivicu jednom rukom', 'grabs the ledge with one hand'),
        ('visi, noge slobodne', 'hanging, legs dangling'), ('druga ruka hvata ivicu', 'second hand grabs the ledge'),
        ('povlači se nagore, lakat preko ivice', 'pulls up, elbow over the edge'), ('koleno na ivici', 'knee on the ledge'),
        ('ustaje na ivici', 'stands up on the ledge'), ('stoji, uzima topuz', 'standing, takes the mace in hand')]),
    ('marko-walljump', 'marko', 6, 14, False, False, '10 · Ivica i zid', 'Klizanje niz zid i skok od zida. Zid se ne crta; zid je desno od Marka.', [
        ('klizi niz zid desno, ruka i stopalo na zidu', 'sliding down an (undrawn) wall on his right, hand and foot against it'),
        ('klizanje, ogrtač se diže', 'sliding, cloak billowing up'), ('skuplja se uz zid', 'compresses against the wall'),
        ('odraz nogom od zida, telo kreće ulevo', 'kicks off the wall, body launching to the left'),
        ('u vazduhu, okrenut ULEVO', 'airborne, now facing LEFT'), ('vrh skoka okrenut ulevo', 'apex of the jump, facing left')]),
]


def brief(clip):
    cid, who, n, fps, loop, ground, topic, use, frames = clip
    lines = [f'Use the reference for the exact identity of {IDENTITY[who]}', STYLE,
             f'{n} {"looping " if loop else ""}successive phases of {cid.replace("-", " ").upper()}:']
    lines += [f'{i + 1} {en}' for i, (_, en) in enumerate(frames)]
    if loop:
        lines.append('The last frame must flow seamlessly back into the first.')
    lines.append('Keep the same scale as the reference character.')
    return ' '.join(lines)


def main():
    os.makedirs(os.path.join(ROOT, 'sources'), exist_ok=True)
    os.makedirs(os.path.join(ROOT, 'references', 'requests'), exist_ok=True)
    prompts = {}
    for clip in CLIPS:
        cid, who, n, fps, loop, ground, topic, use, frames = clip
        req = {"version": 1, "kind": "sprite-gen-request", "engine": "component-row",
               "character": {"id": cid, "description": "", "base_image": None},
               "cell": {"shape": "square", "width": 512, "height": 512, "safe_margin_x": 24, "safe_margin_y": 24, "size": 512, "safe_margin": 24},
               "chroma_key": {"name": "green", "hex": "#00FF00", "rgb": [0, 255, 0], "selection": "manual"},
               "states": {"motion": {"frames": n, "fps": fps, "loop": loop, "action": cid}},
               "style": "hand painted cel shaded", "layout": "taxonomy/v1",
               "fit": {"align_x": "centroid", "align_y": "bottom", "ground_frames": ground, "pixel_unfake": False},
               "chroma": {"mode": "rgb", "unmix_reach": 4, "spill_max_fraction": 0.005}}
        rpath = os.path.join(ROOT, 'references', 'requests', cid + '.json')
        json.dump(req, open(rpath, 'w'), indent=2)
        out = os.path.join(ROOT, 'sources', cid)
        r = subprocess.run([SPRITE_GEN, 'prepare', '--out-dir', out, '--character-id', cid, '--request', rpath,
                            '--base-image', REFS[who], '--force'], capture_output=True, text=True, encoding='utf-8', errors='replace')
        assert r.returncode == 0, r.stderr[-800:]
        text = brief(clip)
        prompts[cid] = text
        with open(os.path.join(out, 'prompts', 'motion.txt'), 'a', encoding='utf-8') as f:
            f.write('\n\nAnimation brief (frame by frame):\n' + text + '\n')
        print(f'{cid:18s} {n} kadrova  {fps} FPS  {"petlja" if loop else "jednom"}')
    json.dump({'generator': 'built-in image_gen (same as pack 02)',
               'notes': 'Creative brief per clip. Attach sources/<id>/base-source.png as the identity reference and '
                        'sources/<id>/references/layout-guides/motion.png as the layout guide.',
               'prompts': prompts}, open(os.path.join(ROOT, 'prompts.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    write_catalog()


def write_catalog():
    topics = []
    for c in CLIPS:
        if c[6] not in topics:
            topics.append(c[6])
    cards = []
    for t in topics:
        cards.append(f'<h2>{html.escape(t)}</h2><div class="grid">')
        for cid, who, n, fps, loop, ground, topic, use, frames in [c for c in CLIPS if c[6] == t]:
            items = ''.join(f'<li><b>{i + 1}</b> {html.escape(sr)}</li>' for i, (sr, _) in enumerate(frames))
            cards.append(f'''<article><header><small>{html.escape(NAMES[who])}</small><h3>{cid}</h3>
<p class="meta">{n} kadrova · {fps} FPS · {"petlja" if loop else "jednom"}{"" if ground else " · slobodno po visini"}</p></header>
<img src="sources/{cid}/base-source.png" alt="Referenca: {html.escape(NAMES[who])}" loading="lazy">
<p class="use">{html.escape(use)}</p><ol>{items}</ol>
<footer><a href="sources/{cid}/references/layout-guides/motion.png">šablon</a> · <a href="sources/{cid}/prompts/motion.txt">prompt</a> · <a href="sources/{cid}/sprite-request.json">zahtev</a></footer></article>''')
        cards.append('</div>')
    total = sum(c[2] for c in CLIPS)
    page = f'''<!doctype html><html lang="sr-Latn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Marko · paket animacija 03 (opisi)</title><style>
:root{{--bg:#0d1d1c;--card:#132826;--line:#2c4a46;--ink:#efe3c3;--dim:#a9b9ad;--gold:#d9b46f}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Georgia,serif}}
main{{max-width:1180px;margin:auto;padding:28px 16px 60px}}h1{{font-size:34px;margin:6px 0}}.lead{{color:var(--dim);max-width:780px}}
h2{{margin:40px 0 12px;font-size:22px;color:var(--gold);border-bottom:1px solid var(--line);padding-bottom:8px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}}
article{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:14px;display:flex;flex-direction:column}}
article small{{font:11px Arial;letter-spacing:2px;color:var(--gold);text-transform:uppercase}}h3{{margin:2px 0;font:600 17px Arial}}
.meta{{margin:2px 0 8px;color:var(--dim);font:12px Arial}}img{{width:100%;height:150px;object-fit:contain;background:#1b3532;border-radius:6px}}
.use{{font:13px Arial;color:#f1d9a8;margin:10px 0 6px}}ol{{list-style:none;padding:0;margin:0;font:13px/1.45 Arial;color:var(--ink)}}
ol b{{display:inline-block;width:20px;color:var(--gold)}}footer{{margin-top:auto;padding-top:10px;font:12px Arial}}a{{color:var(--gold)}}
.steps{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 18px;font:14px/1.6 Arial;color:var(--dim)}}
</style></head><body><main><p class="meta">MARKO · BIBLIOTEKA ANIMACIJA / 03 · OPISI I ŠABLONI</p>
<h1>Pokret i borba kao u The Lost Crown</h1>
<p class="lead">{len(CLIPS)} klipova, {total} kadrova u 10 tema. Svaki klip ima zahtev za sprite-gen, prompt sa opisom kadar po kadar, šablon rasporeda (512×512 polja) i referentnu sliku lika. Ništa još nije nacrtano i igra nije menjana.</p>
<div class="steps"><b style="color:var(--ink)">Postupak (isti kao paket 02):</b> generator slika dobija <code>prompts/motion.txt</code> + <code>base-source.png</code> + šablon → sačuvaj red kao <code>raw/motion.png</code> → <code>sprite-gen extract</code>, <code>compose-atlas</code>, <code>compose-gif</code> → u igri razmera po veličini glave (build-sprite-rig.py).</div>
{"".join(cards)}</main></body></html>'''
    open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(page)


if __name__ == '__main__':
    main()
