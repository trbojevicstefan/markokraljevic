import fs from 'node:fs/promises';
let s=await fs.readFile('dist/game.js','utf8');
s=s.replace('const atlas=motionAtlases[name];if(!atlas)return false;','const atlas=motionAtlases[name];if(!atlas)return false;size=motionSizes[name]||size;');
await fs.writeFile('dist/game.js',s);
let readme=await fs.readFile('README.md','utf8');
readme=readme.replace('oko 5:34','oko 5:35').replace('Neprijatelji i pojedine sporedne radnje i dalje koriste proceduralne pokrete ilustracija, a ne pune višekadarske cikluse.','Markov skok i vino, Musin zamah, napadi sabljaša i štitonoše, i ispaljivanje strele sada koriste zasebne sekvence od po šest kadrova. Pokreti mirovanja, hod neprijatelja, odbijanje i sporedni efekti koriste proceduralnu animaciju. Animacije nisu motion-capture niti produkcijski verifikovane kao savršene.');
readme+='\n## Pokretanje dvoklikom\n\nNa Windowsu otvori `Igraj.cmd`. Potreban je Node.js 22+. Launcher pokreće lokalni server i tek kada je spreman otvara browser; ako igra već radi, otvara postojeću instancu. Paket `Marko-Tri-srca-Kacanika.zip` sadrži igru i launcher. Za animacione izvore vidi `art/combat-animation-prompts.json`.\n';
await fs.writeFile('README.md',readme);
