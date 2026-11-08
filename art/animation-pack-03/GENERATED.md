# Paket 03 — nacrtane animacije

Otvori `generated.html` za animirani pregled. `index.html` zadržava originalne opise i šablone. Izvori su nacrtani ugrađenim Imagegen generatorom prema `prompts.json`, uz identitet iz `base-source.png`.

Svaki završen klip ima providan PNG atlas, pojedinačne PNG kadrove, JSON raspored i GIF pregled. GIF ponavlja i jednokratne poteze radi pregleda; igra treba da poštuje polje `loop` u zahtevu. `qa-generated.json` beleži izvezene klipove i njihove granice.

Za ponovno izdvajanje koristi `export-generated.py` i postojeći lokalni sprite-gen. Zahtevi za izdvajanje usklađeni su sa zelenom pozadinom nacrtanih redova; originalni zahtevi su sačuvani kao `sprite-request.original.json`.

Ovo su animacioni resursi. Za kombinacije, savršenu kontru i parkur treba povezati stanja, kontakte, kretanje i kolizije u igri. Broj nacrtanih kadrova ostaje prema pripremljenom paketu 03; podizanje FPS-a samo po sebi ne dodaje nove crteže.

Poznata dorada: `akindzija-run` ima različite faze koraka, ali smena leve i desne noge nije dovoljno jasno nacrtana ni posle ponovnog generisanja. Taj klip traži dodatnu animatorsku doradu pre konačne upotrebe. Automatska provera granica i providnosti ne ocenjuje biomehaniku pokreta.
