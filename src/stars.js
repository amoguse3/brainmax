import { S } from './state.js';

export function starScore(){return Math.max(0,Number(S.stars)||0)}
export function adaptationScore(){return Math.max(0,starScore()-(Number(S.adaptationBase)||0))}
export function initStarScore(canvas){
 if(canvas){canvas.setAttribute('aria-label','Brain network visualization');canvas.style.cursor='default';}
 const paint=()=>{
  document.querySelectorAll('.star-value').forEach(element=>{element.textContent=starScore().toLocaleString()});
 };
 paint();
 window.addEventListener('stars:changed',paint);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint()});
}
