// Timing and camera math for the cinematic main menu.
// Render cadence is capped at 25 FPS; game simulation remains 120 Hz.
export const MENU_FPS=25;
export const MENU_FRAME_MS=1000/MENU_FPS;
export function menuFrame(now,previous){
 if(!Number.isFinite(now)||!Number.isFinite(previous)||now<previous)return {due:false,next:now,dt:0};
 const delta=now-previous;
 if(delta<MENU_FRAME_MS-.2)return {due:false,next:previous,dt:0};
 const steps=Math.max(1,Math.floor((delta+.2)/MENU_FRAME_MS));
 return {due:true,next:previous+steps*MENU_FRAME_MS,dt:Math.min(.15,steps/MENU_FPS)};
}
export const menuSmooth=(a,b,t)=>a+(b-a)*Math.min(1,Math.max(0,t));
export const menuEase=t=>{const x=Math.min(1,Math.max(0,t));return x*x*(3-2*x)};
export function menuCamera(t,mouseX=0,mouseY=0){
 return {
  far:8*Math.sin(t*.095)+mouseX*5,
  mid:17*Math.sin(t*.074+.8)+mouseX*11,
  near:30*Math.sin(t*.052+1.8)+mouseX*17,
  rise:2.2*Math.sin(t*.15)+mouseY*3,
 };
}
