async (page) => {
 await page.reload();
 await page.waitForFunction(()=>cards.length===32&&cards.every(c=>c.image.complete&&c.image.naturalWidth>0));
 await page.getByRole('button',{name:'Pauziraj',exact:true}).click();
 const a=await page.locator('.frame').allTextContents();
 await page.waitForTimeout(150);
 if(JSON.stringify(a)!==JSON.stringify(await page.locator('.frame').allTextContents()))throw Error('Pause failed');
 await page.getByRole('button',{name:'Sledeći kadar'}).click();
 await page.getByRole('checkbox',{name:'Okreni ulevo'}).check();
 await page.screenshot({path:'art/animation-pack-03/overview.png',fullPage:true});
 console.log('PASS: 32 loaded atlases, pause, stepping and facing controls');
}
