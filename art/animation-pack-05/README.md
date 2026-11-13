# Animation pack 05 — Miloš Obilić, Ravijojla i glavni likovi

**Status: authoring pack, NOT 24 completed animations.** There are 24 independent frame-by-frame animation jobs. Every job stays at *needs-authored-frames* until generated artwork passes automated and visual QA. No gameplay logic is automatically changed.

## Scope

Miloš Obilić (10): idle, alert, walk, run, jump, land, sword-draw, sword-slash, sword-thrust, parry. Miloš is a **new character** absent from the original game's sprites.

Vila Ravijojla (10): hover, fly-forward, fly-rise, fly-descend, turn, cast-light, cast-heal, cast-shield, chain, land. Must match existing fairy-cast identity. The four existing vila-* animations are not overwritten.

Others (4): Marko laugh / taunt, Musa taunt, Šarac rear.

The original game uses eight motion frames, 512x512 pixels per cell, 8x1 sprite atlases and component-row JSON manifests.

## Production steps

1. Generate each scene independently using a model capable of image reference conditioning (Imagen or equivalent). Open the full prompt and references in jobs.json. All eight frames must show truly different *joint poses*, not a translated still or an effect-only overlay.
2. Export either an 8-frame animated GIF/APNG/WebP of square full-body frames or one 4x2 PNG with eight equal square cells. Use chroma green #00ff00 or genuine transparency. Place at incoming/JOB_ID.gif (or .png).
3. Install dependencies: python -m pip install Pillow numpy
4. Convert: python tools/build-animation-pack05.py --input-dir incoming --output-dir /tmp/marko-pack05 --allow-incomplete
5. Review every preview GIF and PNG atlas at game size. Inspect anatomy, weapon geometry, feet baseline, wing poses, true frame variation and loop continuity. Chroma QA and static-frame checks alone cannot guarantee art quality.
6. After manual approval, copy accepted asset directories and dist/assets outputs into the repo, rebuild the game sprite rig, test the game, and wire collision/events manually.

The converter NEVER synthesizes missing character poses. It crops and keys only genuine authored image frames. It rejects nearly static clips instead of counting translated posters as animations.

## Model limitation

No separately invokable Imagen 2 endpoint or credential is exposed in this workspace. Repeated image-generator calls for Ravijojla produced Marko instead; those invalid files are excluded. The 24 jobs are a precise and runnable production queue, **not 24 generated clip images**. Do not merge or represent them as complete art.

## Content

- jobs.json: all 24 briefs, exact references, frame counts, fps and gameplay event markers.
- tools/build-animation-pack05.py: deterministic sheet/frame processing and quality reporting.
- qa/validation.json: per-run generated status of rendered, missing or rejected jobs.
