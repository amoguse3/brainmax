import { S } from './state.js';
import { zoneMeta } from './zones.js';
import { initCurveCanvas, animLines } from './lines.js';
import { makeBrainPts, animateBrain } from './brain.js';
export function brainAge(){ const z=S.zones; const avg=(z.frontal+z.parietal+z.hippo+z.creative+z.reason)/5; return Math.max(16,Math.round(40-avg*0.28)); }
export function weakestZone(){ let mk='frontal', mv=999; for(const k in S.zones){ if(S.zones[k]<mv){ mv=S.zones[k]; mk=k; } } return mk; }
export function renderStats(){
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
export function initStatsVisuals(){
  const cv=initCurveCanvas(document.getElementById('statLines'));
  const nodes=[[0.20,0.14],[0.80,0.16],[0.18,0.82],[0.82,0.84],[0.90,0.50]];
  animLines({cv,nodes},{base:'oklch(70% 0.2 300 / 0.5)',glow:'oklch(72% 0.24 300 / 0.7)',pulse:'oklch(85% 0.2 320 / 0.9)'});
  animateBrain(document.getElementById('brainCanvas'), makeBrainPts(480));
}
export function initFireParticles(){
  const cv=document.getElementById('fireCanvas'); if(!cv) return; const cx=cv.getContext('2d');
  function resize(){ cv.width=cv.offsetWidth; cv.height=cv.offsetHeight; }
  setTimeout(resize,200); window.addEventListener('resize',resize);
  let parts=[];
  (function loop(){
    cx.clearRect(0,0,cv.width,cv.height);
    if(cv.width>10&&Math.random()<0.5) parts.push({x:Math.random()*cv.width,y:cv.height+4,vy:-(0.4+Math.random()*0.8),vx:(Math.random()-0.5)*0.3,life:1,size:1+Math.random()*2});
    parts=parts.filter(p=>p.life>0);
    parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.life-=0.015; cx.beginPath(); cx.arc(p.x,p.y,Math.max(0,p.size*p.life),0,Math.PI*2); cx.fillStyle=`oklch(${82+p.life*4}% 0.16 ${75-(1-p.life)*30} / ${p.life*0.75})`; cx.shadowBlur=6; cx.shadowColor='oklch(80% 0.16 60)'; cx.fill(); });
    cx.shadowBlur=0; requestAnimationFrame(loop);
  })();
}