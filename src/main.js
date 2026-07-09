import { S, vib } from './state.js';
import { applyTheme } from './theme.js';
import { brainAge, weakestZone, zoneMeta } from './util.js';
import { bindNav, goTo } from './nav.js';
import { animLines } from './lines.js';
import { makeBrainPts, mountStatBrain } from './brain.js';
import { mountStackBrain, renderStack, renderOpts } from './stack.js';
import { bindReader } from './reader.js';
import { bindMap, centerMap } from './learn-map.js';
import { exercises } from './data/exercises.js';
import { bindGameShell } from './games/engine.js';
import { startRotation } from './games/rotation.js';

function renderStats(){
  document.getElementById('cqNum').textContent=S.cq;
  document.getElementById('statSessions').textContent=S.sessions;
  document.getElementById('statRecords').textContent=S.records;
  document.getElementById('statBest').textContent=S.bestAcc+'%';
  const age=S.sessions?brainAge():'--';
  document.getElementById('statAge').textContent=age;
  document.getElementById('ageBadge').textContent='Brain age '+age;
  const wk=weakestZone();
  document.getElementById('fireSub').textContent=zoneMeta[wk].n+' needs you (weakest zone)';
}

function initStatLines(){
  const cv=document.getElementById('statLines'); const p=cv.parentElement;
  cv.width=p.offsetWidth; cv.height=p.offsetHeight;
  return {cv,nodes:[[0.20,0.14],[0.80,0.16],[0.18,0.82],[0.82,0.84],[0.90,0.50]]};
}

function initStackLines(){
  const cv=document.getElementById('stackLines'); const p=cv.parentElement;
  cv.width=p.offsetWidth; cv.height=p.offsetHeight;
  return {cv,nodes:[[0.14,0.18],[0.86,0.22],[0.18,0.74],[0.82,0.72],[0.50,0.86]]};
}

function initParticles(){
  const cv=document.getElementById('fireCanvas'); if(!cv) return; const cx=cv.getContext('2d');
  function resize(){ cv.width=cv.offsetWidth; cv.height=cv.offsetHeight; }
  setTimeout(resize,200); window.addEventListener('resize',resize);
  let parts=[];
  (function loop(){
    cx.clearRect(0,0,cv.width,cv.height);
    if(cv.width>10&&Math.random()<0.5) parts.push({x:Math.random()*cv.width,y:cv.height+4,vy:-(0.4+Math.random()*0.8),vx:(Math.random()-0.5)*0.3,life:1,size:1+Math.random()*2});
    parts=parts.filter(p=>p.life>0);
    parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.life-=0.015; cx.beginPath(); cx.arc(p.x,p.y,Math.max(0,p.size*p.life),0,Math.PI*2); cx.fillStyle=`oklch(${78+p.life*8}% 0.10 300 / ${p.life*0.7})`; cx.shadowBlur=6; cx.shadowColor='oklch(80% 0.10 300)'; cx.fill(); });
    cx.shadowBlur=0; requestAnimationFrame(loop);
  })();
}

function renderCarousel(){
  const tcTrack=document.getElementById('tcTrack'),tcDots=document.getElementById('tcDots'),tcExplainT=document.getElementById('tcExplainT');
  let tcIdx=0;
  tcTrack.innerHTML=exercises.map((e,i)=>`<div class="tc-slide" data-i="${i}"><div class="tc-big"><div class="tc-lvl">Lv ${S.levels[e.lvl]}</div><div class="tc-emoji">${e.emoji}</div><div><div class="tc-name">${e.name}</div><div class="tc-zone">${e.zone}</div><div class="tc-play">▶ Play now</div></div></div></div>`).join('');
  tcDots.innerHTML=exercises.map(()=>`<div class="tc-dot"></div>`).join('');
  function updateCarousel(){ const slideW=88,gap=(100-slideW)/2,offset=gap-tcIdx*slideW; tcTrack.style.transform=`translateX(${offset}%)`; tcTrack.querySelectorAll('.tc-slide').forEach((s,i)=>s.classList.toggle('active',i===tcIdx)); tcDots.querySelectorAll('.tc-dot').forEach((d,i)=>d.classList.toggle('on',i===tcIdx)); tcExplainT.textContent=exercises[tcIdx].ex; }
  updateCarousel();
  tcTrack.querySelectorAll('.tc-slide').forEach((slide,i)=>slide.addEventListener('click',()=>{ if(i===tcIdx && exercises[i].id==='rotation') startRotation(); else { tcIdx=i; updateCarousel(); } }));
  let csx=0,cdrag=false;
  tcTrack.addEventListener('touchstart',e=>{ csx=e.touches[0].clientX; cdrag=true; },{passive:true});
  tcTrack.addEventListener('touchend',e=>{ if(!cdrag) return; cdrag=false; const dx=e.changedTouches[0].clientX-csx; if(dx<-40&&tcIdx<exercises.length-1){ tcIdx++; updateCarousel(); vib(8); } else if(dx>40&&tcIdx>0){ tcIdx--; updateCarousel(); vib(8); } },{passive:true});
}

document.getElementById('frontierBtn').addEventListener('click',()=>startRotation());
document.getElementById('addBtn').addEventListener('click',()=>{ renderOpts(); document.getElementById('modalBack').classList.add('open'); });
document.getElementById('modalClose').addEventListener('click',()=>document.getElementById('modalBack').classList.remove('open'));
document.getElementById('modalBack').addEventListener('click',e=>{ if(e.target.id==='modalBack') document.getElementById('modalBack').classList.remove('open'); });
document.querySelectorAll('.proto-item').forEach(row=>row.addEventListener('click',()=>{ const c=row.querySelector('.proto-check'),n=row.querySelector('.proto-n'); c.classList.toggle('on'); n.classList.toggle('done'); vib(10); }));
document.getElementById('goTrainHint').addEventListener('click',()=>goTo(1));

renderStats();
applyTheme(0);
bindNav();
bindReader();
bindMap();
bindGameShell();
mountStatBrain();
mountStackBrain(makeBrainPts);
renderStack();
renderCarousel();
initParticles();
setTimeout(()=>animLines(initStatLines(),{base:'oklch(72% 0.12 300 / 0.5)',glow:'oklch(74% 0.13 300 / 0.7)',pulse:'oklch(86% 0.10 300 / 0.9)'}),250);
setTimeout(()=>animLines(initStackLines(),{base:'oklch(72% 0.12 300 / 0.45)',glow:'oklch(74% 0.13 300 / 0.6)',pulse:'oklch(86% 0.10 300 / 0.9)'}),300);
window.addEventListener('resize',()=>centerMap());