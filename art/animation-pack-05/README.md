# Animation Pack 05 — Marko Kraljević, Miloš Obilić i vila Ravijojla

**Draft PR, not a completed art release.** This branch contains 24 precisely specified frame-by-frame animation jobs, a real source-image converter and atlas importer, automated anti-static-frames checks, and a standalone renderer at `dist/animation-pack05-player.js`.

## Correct cast
- **Marko Kraljević:** four animation jobs, including front-facing expressions for his menu portrait.
- **Miloš Obilić:** ten body animation jobs (new hero, red cape, silver armor and sword).
- **Vila Ravijojla:** ten wing, flight and spell animation jobs (female fairy, long golden braid, white embroidered dress and translucent wings). She is **NOT** Bajazit/Bayezid, and must never be rendered as a male character.

## Assets produced outside GitHub, with QA
Seven 8-frame animated source clips were rendered and checked in this chat and packaged in a downloadable ZIP. The ZIP contains 512×512 per frame, 8×1 transparent atlases, JSON, frames, GIF and WebP previews, and a fully offline visual gallery:

- `vila-hover-nova` — actual wings opening and closing
- `milos-idle-nova` — body idle and cape
- `milos-cape-wind` — red cape moving in wind
- `marko-menu-laugh` — genuine face/lips changes
- `marko-menu-stern-blink` — stern eyes blink
- `marko-menu-patient-blink` — slow blink
- `marko-menu-neutral` — neutral/serious portrait

**The binary assets are in the user's conversation ZIP, not committed to this repository.** The GitHub connector currently accepts UTF-8 text or inline base64 for writes and cannot ingest those 60+ MB of local files directly. Do not treat the filenames above as shipped or loadable from the PR branch.

Current release QA: 7/7 exported locally, each with 8 unique source frames; 24 storyboard jobs remain `needs-authored-frames` in `jobs.json` until actual image sources are uploaded into this branch and manually approved. The user's goal of at least 20 newly drawn gameplay clips is **not yet complete**, and this PR remains a draft.

## Renderer / import

Once binary atlases are copied into `dist/assets/`, use `dist/animation-pack05-player.js` to draw a clip from its JSON and PNG. Existing game/menu UI and physics remain unchanged. Some Marko clips are **face portraits only**, not in-game attack animations.

## Source-frame authoring and converter

For each individual clip in `jobs.json`, render eight actual chronologically ordered poses with a consistent character and equipment, not a moving still. Export either eight GIF/APNG/WebP frames or a 4×2 sheet with flat green chroma or alpha. Use:

```bash
python -m pip install Pillow numpy
python tools/build-animation-pack05.py --input-dir incoming --output-dir /tmp/marko-pack05 --allow-incomplete
```

The converter makes 512×512 transparent frames, an 8×1 `atlas.png`, matching JSON, and GIF previews. It rejects static/near-duplicate sources; a human must also inspect identity, pose continuity, weapon grip and root/pivot alignment.

`tools/generate-animation-pack05.py` contains an optional external Google Gen AI adapter, but no Google API credential is installed here. In this conversation original image outputs were made using OpenAI's available image model; **do not label them Imagen 2**. The image model repeatedly returned incorrect characters/posters for some prompts, and those attempts were excluded.

## Completion requirements before merge
1. Commit actual sprite binaries for all required clips.
2. Run CI and gameplay-scale visual QA of every GIF/PNG atlas.
3. Retune combat events, pivots and state-machine references for new characters.
4. Confirm number of genuinely finished, non-duplicate new clips is at least 20.
