function getLayerId(id){const v=document.querySelector('#lighting')?.value;return id+(v&&v!=='day'?'-'+v:'')}
function getLightFilter(){return {night:'brightness(0.52) saturate(0.72)',storm:'brightness(0.72) saturate(0.78)'}[document.querySelector('#lighting')?.value]||'none'}
function drawTerrain(p,cam,active,g){
 const ground={selo:'prop-tlo-trava',klisura:'prop-tlo-mahovina',suma:'prop-tlo-mahovina',manastir:'prop-tlo-cigla',tvrdjava:'prop-tlo-cigla',prevoj:'prop-tlo-sneg',pecina:'prop-tlo-mahovina',podrum:'prop-tlo-cigla',mocvara:'prop-tlo-mahovina',rudnik:'prop-tlo-daske',rusevine:'prop-tlo-cigla',reka:'prop-tlo-trava'};
 const id=p.h<100?'prop-platforma-kamen':ground[active.id],im=getImage(id),a=byId.get(id);
 if(ready(im)&&a?.bounds){const[x,y,r,b]=a.bounds;g.drawImage(im,x,y,r-x,b-y,p.x-cam,p.y,p.w,p.h);return}
 g.fillStyle='#394537';g.fillRect(p.x-cam,p.y,p.w,p.h);g.fillStyle='#a5a66c';g.fillRect(p.x-cam,p.y,p.w,5);
}
