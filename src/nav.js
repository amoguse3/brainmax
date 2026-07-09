import { applyTheme } from './theme.js';
import { sessionDone, vib } from './state.js';
import { flashLock } from './util.js';
let current = 0;
const NUM = 4;
const PROTO = 2;
const track = document.getElementById('track');
const tabs = document.querySelectorAll('.tab');
const viewsEl = document.querySelector('.views');
export function getCurrent(){ return current; }
export function goTo(i){
  if(i===PROTO && !sessionDone){ flashLock(); vib([20,30,20]); return; }
  current = Math.max(0, Math.min(NUM-1, i));
  track.style.transform = `translateX(-${current*100}%)`;
  tabs.forEach((t,idx)=>t.classList.toggle('active', idx===current));
  applyTheme(current);
  const v = viewsEl.querySelectorAll('.view')[current];
  if(v.classList.contains('enter')){ v.classList.remove('enter'); v.offsetHeight; v.classList.add('enter'); }
  vib(6);
}
export function bindNav(){
  tabs.forEach(t=>t.addEventListener('click',()=>goTo(parseInt(t.dataset.v,10))));
  let sx=0,sy=0,drag=false,lk=null;
  viewsEl.addEventListener('touchstart',e=>{ if(e.target.closest('.tc-track')||e.target.closest('.map-vp')||e.target.closest('.mind-stack')) return; sx=e.touches[0].clientX; sy=e.touches[0].clientY; drag=true; lk=null; track.style.transition='none'; },{passive:true});
  viewsEl.addEventListener('touchmove',e=>{ if(!drag) return; const dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy; if(lk===null) lk=Math.abs(dx)>Math.abs(dy)?'x':'y'; if(lk==='x'){ const base=-current*100,pct=(dx/viewsEl.offsetWidth)*100; let n=base+pct; if(current===0&&dx>0) n=base+pct*0.35; if(current===NUM-1&&dx<0) n=base+pct*0.35; track.style.transform=`translateX(${n}%)`; } },{passive:true});
  viewsEl.addEventListener('touchend',e=>{ if(!drag) return; drag=false; track.style.transition='transform 0.7s var(--smooth)'; if(lk==='x'){ const dx=e.changedTouches[0].clientX-sx,th=viewsEl.offsetWidth*0.2; if(dx<-th&&current<NUM-1){ let nx=current+1; if(nx===PROTO&&!sessionDone) nx=PROTO+1; goTo(nx); } else if(dx>th&&current>0){ let nx=current-1; if(nx===PROTO&&!sessionDone) nx=PROTO-1; goTo(nx); } else goTo(current); } },{passive:true});
}