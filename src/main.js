import { S, vib } from './state.js';
import { applyTheme } from './theme.js';
import { brainAge, weakestZone, zoneMeta } from './util.js';
import { bindNav, goTo } from './nav.js';
import { animConstellation } from './lines.js';
import { mountBrain } from './brain.js?v=17';
import { renderStack, renderOpts, stackNodePos } from './stack.js';
import { stack } from './data/compounds.js';
import { bindReader } from './reader.js';
import { bindMap, centerMap } from './learn-map.js';
import { exercises } from './data/exercises.js';
import { bindGameShell } from './games/engine.js';
import { startRotation } from './games/rotation.js';
import { startMath } from './games/math.js';
import { startMemory } from './games/memory.js';
import { startStroop } from './games/stroop.js';
import { startCreative } from './games/creative.js';
import { startCritical } from './games/critical.js';

const GAMES = { rotation:startRotation, math:startMath, memory:startMemory, stroop:startStroop, creative:startCreative, critical:startCritical };
const LAV = { trail: 'oklch(72% 0.12 300 / A)', head: 'oklch(86% 0.12 300 / A)', core: 'oklch(97% 0.05 300 / A)' };
const STAT_NODES = [[0.20,0.12],[0.80,0.14],[0.18,0.86],[0.82,0.88],[0.92,0.50]];
let mindMode = 'stats';

function startGame(id){ (GAMES[id]||startRotation)(); }

function renderStats(){
  document.getElementById('cqNum').textContent=S.cq;
  document.getElementById('statSessions').textContent=S.sessions;
  document.getElementById('statRecords').textContent=S.records;
  document.getElementById('statBest').textContent=S.bestAcc+'%';
  const age=S.sessions?brainAge():'--';
  document.getElementById('statAge').textContent=age;
  document.getElementById('ageBadge').textContent='Brain age '+age;
  document.getElementById('fireSub').textContent=zoneMeta[weakestZone()].n+' needs you (weakest zone)';
}

function sizeCanvas(id){ const cv=document.getElementById(id); if(!cv) return null; const p=cv.parentElement; cv.width=p.offsetWidth; cv.height=p.offsetHeight; return cv; }

function bindModeToggle(){
  const mind=document.getElementById('mindView');
  const btns=document.querySelectorAll('#modeToggle button');
  btns.forEach(b=>b.addEventListener('click',()=>{
    const m=b.dataset.mode; if(m===mindMode) return;
    mindMode=m;
    mind.dataset.mode=m;
    btns.forEach(x=>x.classList.toggle('on',x.dataset.mode===m));
    vib(10);
  }));
}

function initParticles(){
  const cv=document.getElementById('fireCanvas'); if(!cv) return; const cx=cv.getContext('2d');
  function resize(){ cv.width=cv.offsetWidth; cv.height=cv.offsetHeight; }
  setTimeout(resize,200); window.addEventListener('resize',resize);
  let parts=[];
  (function loop(){
    cx.clearRect(0,0,cv.width,cv.height);
    if(cv.width>10&&Math.random()<0.45) parts.push({x:Math.random()*cv.width,y:cv.height+4,vy:-(0.4+Math.random()*0.8),vx:(Math.random()-0.5)*0.3,life:1,size:1+Math.random()*2});
    parts=parts.filter(p=>p.life>0);
    parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.life-=0.015; cx.beginPath(); cx.arc(p.x,p.y,Math.max(0,p.size*p.life),0,Math.PI*2); cx.fillStyle=`oklch(${80+p.life*6}% 0.10 300 / ${p.life*0.7})`; cx.shadowBlur=6; cx.shadowColor='oklch(82% 0.10 300)'; cx.fill(); });
    cx.shadowBlur=0; requestAnimationFrame(loop);
  })();
}

function renderCarousel(){
  const tcTrack=document.getElementById('tcTrack'),tcDots=document.getElementById('tcDots'),tcExplainT=document.getElementById('tcExplainT');
  let tcIdx=0;
  tcTrack.innerHTML=exercises.map((e,i)=>`<div class="tc-slide" data-i="${i}"><div class="tc-big"><div class="tc-lvl">Lv ${S.levels[e.lvl]}</div><div class="tc-emoji">${e.emoji}</div><div><div class="tc-name">${e.name}</div><div class="tc-zone">${e.zone}</div><div class="tc-play">\u25b6 Play now</div></div></div></div>`).join('');
  tcDots.innerHTML=exercises.map(()=>`<div class="tc-dot"></div>`).join('');
  function updateCarousel(){ const slideW=88,gap=(100-slideW)/2,offset=gap-tcIdx*slideW; tcTrack.style.transform=`translateX(${offset}%)`; tcTrack.querySelectorAll('.tc-slide').forEach((s,i)=>s.classList.toggle('active',i===tcIdx)); tcDots.querySelectorAll('.tc-dot').forEach((d,i)=>d.classList.toggle('on',i===tcIdx)); tcExplainT.textContent=exercises[tcIdx].ex; }
  updateCarousel();
  tcTrack.querySelectorAll('.tc-slide').forEach((slide,i)=>slide.addEventListener('click',()=>{ if(i===tcIdx) startGame(exercises[i].id); else { tcIdx=i; updateCarousel(); } }));
  let csx=0,cdrag=false;
  tcTrack.addEventListener('touchstart',e=>{ csx=e.touches[0].clientX; cdrag=true; },{passive:true});
  tcTrack.addEventListener('touchend',e=>{ if(!cdrag) return; cdrag=false; const dx=e.changedTouches[0].clientX-csx; if(dx<-40&&tcIdx<exercises.length-1){ tcIdx++; updateCarousel(); vib(8); } else if(dx>40&&tcIdx>0){ tcIdx--; updateCarousel(); vib(8); } },{passive:true});
}

document.getElementById('frontierBtn').addEventListener('click',()=>{ const wk=weakestZone(); startGame(zoneMeta[wk].ex); });
document.getElementById('addBtn').addEventListener('click',()=>{ renderOpts(); document.getElementById('modalBack').classList.add('open'); });
document.getElementById('modalClose').addEventListener('click',()=>document.getElementById('modalBack').classList.remove('open'));
document.getElementById('modalBack').addEventListener('click',e=>{ if(e.target.id==='modalBack') document.getElementById('modalBack').classList.remove('open'); });
document.querySelectorAll('.proto-item').forEach(row=>row.addEventListener('click',()=>{ const c=row.querySelector('.proto-check'),n=row.querySelector('.proto-n'); c.classList.toggle('on'); n.classList.toggle('done'); vib(10); }));
document.getElementById('goTrainHint').addEventListener('click',()=>goTo(1));

renderStats();
applyTheme(0);
bindNav();
bindModeToggle();
bindReader();
bindMap();
bindGameShell();
renderStack();
renderCarousel();
initParticles();

function boot(){
  mountBrain('brainCanvas',{scale:1.02});
  mountBrain('stackBrain',{scale:1.02});
  const stage={ cv:sizeCanvas('statLines'), hubY:0.5, getNodes:()=> mindMode==='stats' ? STAT_NODES : stack.map((_,i)=>stackNodePos(i,stack.length)) };
  animConstellation(stage, LAV);
  window.addEventListener('resize',()=>{ sizeCanvas('statLines'); centerMap(); });
}
setTimeout(boot,120);