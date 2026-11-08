async (page) => {
 await page.reload();
 await page.waitForFunction(()=>WORLD.assets.length>0&&[...images.values()].every(i=>i.complete&&i.naturalWidth>0));
 await page.getByRole('button',{name:'Pauziraj kameru'}).click();
 await page.locator('#level').selectOption('klisura');
 await page.locator('#filter').selectOption('prop');
 const expected=await page.evaluate(()=>WORLD.assets.filter(a=>a.kind==='prop').length);
 if(await page.locator('article').count()!==expected)throw Error('Gallery filter mismatch');
 await page.locator('#level').selectOption('selo');
 await page.screenshot({path:'art/world-pack-01/preview.png',fullPage:false});
 console.log('PASS: all available images loaded, six level options, filtering, camera and scene switching');
}
