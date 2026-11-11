// Every line a player can see has English: the page, the game's own strings, the level names, the books.
// Run: node i18n-test.mjs
import fs from 'node:fs/promises';
const i18n=await import('./dist/i18n.js');
i18n.setLang('en');
const tr=i18n.tr;let checks=0;const fails=[];
const ok=(c,msg)=>{checks++;if(!c)fails.push(msg);};

// string literals, template pieces included (the same walk as the extractor used to build the dictionary)
function literals(src){const out=[];let i=0;const n=src.length;
 while(i<n){const c=src[i];
  if(c==='/'&&src[i+1]==='/'&&src[i-1]!==':'&&src[i-1]!=='\\'){const j=src.indexOf('\n',i);i=j<0?n:j;continue;}
  if(c==='/'&&src[i+1]==='*'){const j=src.indexOf('*/',i+2);i=j<0?n:j+2;continue;}
  if(c==='\''||c==='"'||c==='`'){const q=c;let j=i+1,buf='';
   while(j<n&&src[j]!==q){if(src[j]==='\\'){buf+=src.slice(j,j+2);j+=2;continue;}
    if(q==='`'&&src[j]==='$'&&src[j+1]==='{'){let d=1,k=j+2;while(k<n&&d){if(src[k]==='{')d++;else if(src[k]==='}')d--;k++;}buf+='${…}';out.push(...literals(src.slice(j+2,k-1)));j=k;continue;}
    if(q!=='`'&&src[j]==='\n')break;buf+=src[j];j++;}
   out.push(buf);i=j+1;continue;}
  i++;}
 return out;}
const SER=/[čćžšđČĆŽŠĐ]/;
const codeish=s=>/^[#.][\w-]/.test(s)||/^[a-z0-9+\-^: ]+$/.test(s)||/\w\(\.?\d/.test(s)||/^[A-Z]+$/.test(s)&&s.length<=6&&!SER.test(s)||/=>|function|\{|;|px|rgba|\.(webp|png|json|mp3|svg)/.test(s);
const prose=s=>{const t=s.replace(/<[^>]+>/g,' ').trim();if(!/[A-Za-zčćžšđČĆŽŠĐ]{2}/.test(t)||codeish(t))return false;return SER.test(t)||/[A-ZČĆŽŠĐ]{3,}/.test(t)&&!/[a-z]/.test(t.replace(/\$\{…\}/g,''))||/\s/.test(t)&&t.split(/\s+/).length>=2;};
// pieces of a template as the page shows them: tags split the text, placeholders become a sample value
const SAMPLES=['7','Kosovsko selo','Janičar'];
function translates(seg){const t=seg.trim();if(!t||!/[a-zčćžšđ]{2}|[A-ZČĆŽŠĐ]{3}/.test(t))return true;
 if(!t.includes('${…}'))return i18n.lookUp(t)!=null||/^(Marko|Šarac|Musa|Ravijojla|МАРКО|SPACE|SHIFT)$/.test(t);
 return SAMPLES.some(v=>{const x=t.replaceAll('${…}',v);return i18n.lookUp(x)!=null;})||!/[a-zčćžšđ]{3}/i.test(t.replace(/\$\{…\}/g,''));}
// lines glued with + in the code ("NA KOLJE! "+d, 'R · BES '+n): try them with a number after
const glued=s=>[s,s+'7',s.trimEnd()+' 7',s.replace(/^\s*· /,''),s+'Kosovsko selo”'].some(x=>i18n.lookUp(x.trim())!=null);
// the palette names describe the art for the painter; the player never sees them
const IGNORE=new Set(['Three.js scena nije dostupna, koristi se 2D prikaz.','letnje podne nad Prilepom']);
for(const f of ['dist/game.js','dist/world.js','dist/zamke.js']){const src=await fs.readFile(f,'utf8');
 for(const s of literals(src)){if(!prose(s)||IGNORE.has(s))continue;
  const segs=s.split(/<[^>]+>/);for(const seg of segs){if(!prose(seg))continue;ok(translates(seg)||glued(seg),`${f}: no English for «${seg.trim().slice(0,90)}»`);}}}
// the page itself
{const html=await fs.readFile('dist/index.html','utf8');const body=html.replace(/<div class="lang-pick"[\s\S]*?<\/div>/,'').replace(/<select id="language"[\s\S]*?<\/select>/,'').replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'');
 for(const seg of body.split(/<[^>]+>/)){const t=seg.replace(/&\w+;/g,' ').trim();if(!t||!prose(t))continue;ok(translates(t),`index.html: no English for «${t.slice(0,90)}»`);}
 for(const m of body.matchAll(/(?:title|aria-label|alt)="([^"]+)"/g)){const t=m[1];if(!prose(t)||/Jezik \/ Language/.test(t))continue;ok(translates(t),`index.html attribute: no English for «${t}»`);}}
// level names
{const L=JSON.parse(await fs.readFile('dist/assets/world/levels.json','utf8'));for(const l of L)ok(i18n.lookUp(l.name)!=null,`level name «${l.name}» has no English`);}
// a few lines exactly as the game builds them
for(const [sr,en] of [['POHOD 3 · RAVIJOJLINA ŠUMA · NOĆ','QUEST 3 · RAVIJOJLA\'S FOREST · NIGHT'],['R · BES 45','R · RAGE 45'],['Kosovsko selo. Noć je pala. Selo je pod opsadom. Oteraj odred i stigni do barjaka na kraju puta.','Kosovo Village. Night has fallen. The village is under siege. Drive off the troop and reach the banner at the end of the road.'],['Sledeći pohod: Klisura Ibra →','Next quest: Ibar Gorge →'],['Nastavi pohod','Continue the quest']])
 ok(tr(sr)===en,`«${sr}» → «${tr(sr)}», expected «${en}»`);
// the dictionary never gives one Serbian line two different English ones
{const src=await fs.readFile('dist/i18n.js','utf8');const seen=new Map();for(const m of src.matchAll(/\["((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)"\]/g)){const [_,k,v]=m;if(seen.has(k)&&seen.get(k)!==v)fails.push(`dictionary: «${k}» is both «${seen.get(k)}» and «${v}»`);seen.set(k,v);}checks++;}
// a long unknown text stays fast (no runaway splitting)
{const t0=Date.now();tr(Array.from({length:60},(_,i)=>`Nepoznata rečenica broj ${i}.`).join(' '));ok(Date.now()-t0<300,'translator: a long unknown text took too long');}
// the Book of Legends: both languages everywhere, the song line for line
{globalThis.markoLegende=undefined;await import('./dist/legende.js');const D=globalThis.markoLegende;ok(D&&D.CHAPTERS.length>=10,'legends: at least ten chapters');
 for(const c of D.CHAPTERS)ok(c.sr?.title&&c.sr?.text&&c.en?.title&&c.en?.text&&c.cy,`legends: chapter ${c.id} is missing a language`);
 ok(D.SONG.lines.sr.length===D.SONG.lines.en.length&&D.SONG.lines.sr.length>250,`song: ${D.SONG.lines.sr.length} Serbian lines, ${D.SONG.lines.en.length} English`);
 for(const c of D.CHAPTERS){try{await fs.access('dist/'+c.img);ok(true);}catch{ok(false,`legends: missing picture ${c.img}`);}}}
// Serbian in Cyrillic: letter for letter, keys stay Latin
for(const [lat,c] of [['Space za skok; J za topuz.','Space за скок; J за топуз.'],['UROŠ I MRNJAVČEVIĆI','УРОШ И МРЊАВЧЕВИЋИ'],['I · DRUM JUNAKA','I · ДРУМ ЈУНАКА'],['S LEĐA!','С ЛЕЂА!'],['S + K je aperkat','S + K је аперкат'],['R · BES 45','R · БЕС 45'],['O legendi','О легенди'],['Džojstik, hodže, Njegoš, ljuta','Џојстик, хоџе, Његош, љута'],['talasi u II i V','таласи у II и V']])
 ok(i18n.cyr(lat)===c,`cyr «${lat}» → «${i18n.cyr(lat)}», expected «${c}»`);
i18n.setLang('sr');ok(i18n.tr('Knjiga dušmana')==='Књига душмана','sr mode shows Cyrillic');i18n.setLang('sr-Latn');ok(i18n.tr('Knjiga dušmana')==='Knjiga dušmana','sr-Latn mode keeps Latin');i18n.setLang('en');
if(fails.length){console.error(fails.slice(0,60).join('\n'));console.error(`${fails.length} of ${checks} translation checks failed.`);process.exit(1);}
console.log(`${checks} translation checks passed.`);
