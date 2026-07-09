import { S } from './state.js';
import { applyTheme } from './theme.js';
import { makeBrainPts, mountBrain } from './brain.js';
import { initStatLines, animLines, initStackLines, animStackLines } from './lines.js';
import { bindNav } from './nav.js';
import { bindReader } from './reader.js';
import { bindMap, centerMap, renderMap } from './learn-map.js';
import { bindStack, renderStack, stackBrainGlow, stackNodePos } from './stack.js';
import { exercises, zoneMeta } from './data/exercises.js';
import { bindGameShell } from './games/engine.js';
import { startRotation } from './games/rotation.js';
import { vib } from './util.js';

const ctx=document.getElementById('ctx');
const tcTrack=document.getElementById('tcTrack');
const tcDots=document.getElementById('tcDots');
const tcExplainT=document.getElementById('tcExplainT');
let tcIdx=0;

export function brainAge(){const z=S.zones;const avg=(z.frontal+z.parietal+z.hippo+z.creative+z.reason)/5;return Math.max(16,Math.round(40-avg*0.28));}
export function weakestZone(){let mk='frontal',mv=999;for(const k in S.zones){if(S.zones[k]<mv){mv=S.zones[k];mk=k;}}return mk;}
export function renderStats(){document.getElementById('cqNum').textContent=S.cq;document.getElementById('statSessions').textContent=S.sessions;document.getElementById('statRecords').textContent=S.records;document.getElementById('statBest').textContent=S.bestAcc+'%';const age=S.sessions?brainAge():'--';document.getElementById('statAge').textContent=age;document.getElementById('ageBadge').textContent='Brain age '+age;const wk=weakestZone();document.getElementById('fireSub').textContent=zoneMeta[wk].n+' needs you (weakest zone)';}
function renderCarousel(){tcTrack.innerHTML=exercises.map((e,i)=>`<div class="tc-slide" data-i="${i}"><div class="tc-big"><div class="tc-lvl">Lv ${S.levels[e.lvl]}</div><div class="tc-emoji">${e.emoji}</div><div><div class="tc-name">${e.name}</div><div class="tc-zone">${e.zone}</div><div class="tc-play">▶ Play now</div></div></div></div>`).join('');tcDots.innerHTML=exercises.map((e,i)=>`<div class="tc-dot" data-i="${i}"></div>`).join('');updateCarousel();[...tcTrack.querySelectorAll('.tc-big')].forEach((card,i)=>card.addEventListener('click',()=>{if(i===tcIdx){if(exercises[i].id==='rotation') startRotation();} else {tcIdx=i;updateCarousel();}}));}
function updateCarousel(){const slideW=88;const gap=(100-slideW)/2;const offset=gap-tcIdx*slideW;tcTrack.style.transform=`translateX(${offset}%)`;tcTrack.querySelectorAll('.tc-slide').forEach((s,i)=>s.classList.toggle('active',i===tcIdx));tcDots.querySelectorAll('.tc-dot').forEach((d,i)=>d.classList.toggle('on',i===tcIdx));tcExplainT.textContent=exercises[tcIdx].ex;}
function bindCarousel(){let csx=0,cdrag=false;tcTrack.addEventListener('touchstart',e=>{csx=e.touches[0].clientX;cdrag=true;},{passive:true});tcTrack.addEventListener('touchend',e=>{if(!cdrag)return;cdrag=false;const dx=e.changedTouches[0].clientX-csx;if(dx<-40&&tcIdx<exercises.length-1){tcIdx++;updateCarousel();vib(8);}else if(dx>40&&tcIdx>0){tcIdx--;updateCarousel();vib(8);}},{passive:true});}
function initFire(){const cv=document.getElementById('fireCanvas');if(!cv)return;const cx=cv.getContext('2d');function resize(){cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;}setTimeout(resize,200);window.addEventListener('resize',resize);let parts=[];function loop(){cx.clearRect(0,0,cv.width,cv.height);if(cv.width>10&&Math.random()<0.5)parts.push({x:Math.random()*cv.width,y:cv.height+4,vy:-(0.4+Math.random()*0.8),vx:(Math.random()-0.5)*0.3,life:1,size:1+Math.random()*2});parts=parts.filter(p=>p.life>0);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=0.015;cx.beginPath();cx.arc(p.x,p.y,Math.max(0,p.size*p.life),0,Math.PI*2);cx.fillStyle=`oklch(${82+p.life*4}% 0.16 ${75-(1-p.life)*30} / ${p.life*0.75})`;cx.shadowBlur=6;cx.shadowColor='oklch(80% 0.16 60)';cx.fill();});cx.shadowBlur=0;requestAnimationFrame(loop);}loop();}

function bindFrontier(){document.getElementById('frontierBtn').addEventListener('click',()=>startRotation());}
function mount(){renderStats();applyTheme(0, ctx);bindNav();bindReader();bindMap();bindStack();bindGameShell();renderCarousel();bindCarousel();bindFrontier();initFire();
  mountBrain(document.getElementById('brainCanvas'), makeBrainPts(480), { scale:100 });
  mountBrain(document.getElementById('stackBrain'), makeBrainPts(420), { scale:88, greenMode:true, glowRef:stackBrainGlow });
  const statState=initStatLines(); animLines(statState,{base:'oklch(70% 0.2 300 / 0.5)',glow:'oklch(72% 0.24 300 / 0.7)',pulse:'oklch(85% 0.2 320 / 0.9)'});
  let stackState=initStackLines(stackNodePos, []); const updateStackLines=()=>{stackState=initStackLines(stackNodePos, window.document.querySelectorAll('.snode').length ? [...window.document.querySelectorAll('.snode')].map(()=>({})) : []);};
  updateStackLines(); animStackLines(stackState);
  window.addEventListener('stack:changed',()=>{renderStack(); renderMap(); updateStackLines();});
  window.addEventListener('map:center', centerMap);
}
mount();