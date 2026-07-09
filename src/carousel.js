import { exercises } from './data/exercises.js';
import { S, vib } from './state.js';
let tcIdx=0;
const tcTrack=document.getElementById('tcTrack'),tcDots=document.getElementById('tcDots'),tcExplainT=document.getElementById('tcExplainT');
export function currentExercise(){ return exercises[tcIdx]; }
export function renderCarousel(startGame){
  tcTrack.innerHTML=exercises.map((e,i)=>`<div class="tc-slide" data-i="${i}"><div class="tc-big"><div class="tc-lvl">Lv ${S.levels[e.lvl]}</div><div class="tc-emoji">${e.emoji}</div><div><div class="tc-name">${e.name}</div><div class="tc-zone">${e.zone}</div><div class="tc-play">▶ Play now</div></div></div></div>`).join('');
  tcDots.innerHTML=exercises.map((e,i)=>`<div class="tc-dot" data-i="${i}"></div>`).join('');
  [...tcTrack.querySelectorAll('.tc-big')].forEach((card,i)=>card.addEventListener('click',()=>{ if(i===tcIdx) startGame(exercises[i].id); else { tcIdx=i; updateCarousel(); } }));
  updateCarousel();
}
export function updateCarousel(){ const slideW=88,gap=(100-slideW)/2,offset=gap-tcIdx*slideW; tcTrack.style.transform=`translateX(${offset}%)`; tcTrack.querySelectorAll('.tc-slide').forEach((s,i)=>s.classList.toggle('active',i===tcIdx)); tcDots.querySelectorAll('.tc-dot').forEach((d,i)=>d.classList.toggle('on',i===tcIdx)); tcExplainT.textContent=exercises[tcIdx].ex; }
export function bindCarousel(){ let csx=0,cdrag=false; tcTrack.addEventListener('touchstart',e=>{csx=e.touches[0].clientX;cdrag=true;},{passive:true}); tcTrack.addEventListener('touchend',e=>{ if(!cdrag) return; cdrag=false; const dx=e.changedTouches[0].clientX-csx; if(dx<-40&&tcIdx<exercises.length-1){ tcIdx++; updateCarousel(); vib(8); } else if(dx>40&&tcIdx>0){ tcIdx--; updateCarousel(); vib(8); } },{passive:true}); }