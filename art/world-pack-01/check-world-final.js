async (page) => {
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.reload();
 const available=await page.evaluate(()=>WORLD.summary.sets.filter(s=>s.layers===4));
 let checked=0;
 for(const set of available){
   await page.locator('#level').selectOption(set.theme);
   await page.locator('#lighting').selectOption(set.variant);
   await page.waitForFunction(()=>active.layers.every(l=>ready(getImage(getLayerId(l.id))))&&images.size>4&&[...images.values()].every(ready));
   if(['selo','pecina','prevoj'].includes(set.theme)&&set.variant==='day'){
     await page.locator('canvas').screenshot({path:'D:/projects/Marko Kraljevic/marko-game/art/world-pack-01/preview-'+set.theme+'.png'});
   }
   checked++;
 }
 await page.locator('#filter').selectOption('prop');
 const count=await page.evaluate(()=>WORLD.assets.filter(a=>a.kind==='prop').length);
 if(await page.locator('article').count()!==count)throw Error('Prop gallery mismatch');
 if(errors.length)throw Error(errors.join('\n'));
 await page.locator('#level').selectOption('selo');await page.locator('#lighting').selectOption('day');
 return {sceneVariantsChecked:checked,props:count,pageErrors:errors};
}
