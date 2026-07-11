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
import { startMath } from './games/math.js';
import { startDual } from './games/dual.js';
import './games/lab.js';

const starters={math:startMath,rotation:startRotation,dual:startDual};

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
function initStatLines(){const cv=document.getElementById('statLines'),p=cv.parentElement;cv.width=p.offsetWidth;cv.height=p.offsetHeight;return{cv,nodes:[[.16,.24],[.84,.24],[.16,.8],[.84,.8],[.5,.1]]};}
function initStackLines(){const cv=document.getElementById('stackLines'),p=cv.parentElement;cv.width=p.offsetWidth;cv.height=p.offsetHeight;return{cv,nodes:[[.14,.18],[.86,.22],[.18,.74],[.82,.72],[.5,.86]]};}
function initParticles(){const cv=document.getElementById('fireCanvas');if(!cv)return;const cx=cv.getContext('2d');function resize(){cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;}setTimeout(resize,200);window.addEventListener('resize',resize);let parts=[];(function loop(){cx.clearRect(0,0,cv.width,cv.height);if(cv.width>10&&Math.random()<.5)parts.push({x:Math.random()*cv.width,y:cv.height+4,vy:-(.4+Math.random()*.8),vx:(Math.random()-.5)*.3,life:1,size:1+Math.random()*2});parts=parts.filter(p=>p.life>0);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=.015;cx.beginPath();cx.arc(p.x,p.y,Math.max(0,p.size*p.life),0,Math.PI*2);cx.fillStyle=`oklch(${78+p.life*8}% .10 300 / ${p.life*.7})`;cx.fill();});requestAnimationFrame(loop);})();}
function renderCarousel(){
  const track=document.getElementById('tcTrack'),dots=document.getElementById('tcDots'),explain=document.getElementById('tcExplainT');let active=0;
  track.innerHTML=exercises.map((e,i)=>`<div class="tc-slide" data-i="${i}"><div class="tc-big"><div class="tc-lvl">Load ${S.levels[e.lvl]||1}</div><div class="tc-emoji">${e.emoji}</div><div><div class="tc-name">${e.name}</div><div class="tc-zone">${e.zone}</div><div class="tc-play">${starters[e.id]?'▶ Run experiment':'In research'}</div></div></div></div>`).join('');
  dots.innerHTML=exercises.map(()=>'<div class="tc-dot"></div>').join('');
  function update(){const width=88,gap=(100-width)/2;track.style.transform=`translateX(${gap-active*width}%)`;track.querySelectorAll('.tc-slide').forEach((slide,i)=>slide.classList.toggle('active',i===active));dots.querySelectorAll('.tc-dot').forEach((dot,i)=>dot.classList.toggle('on',i===active));explain.textContent=exercises[active].ex;}
  update();track.querySelectorAll('.tc-slide').forEach((slide,i)=>slide.addEventListener('click',()=>{if(i===active&&starters[exercises[i].id])starters[exercises[i].id]();else{active=i;update();}}));
  let startX=0;track.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;},{passive:true});track.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(dx<-40&&active<exercises.length-1){active++;update();vib(8);}else if(dx>40&&active>0){active--;update();vib(8);}},{passive:true});
}

document.getElementById('frontierBtn').addEventListener('click',startMath);
document.getElementById('addBtn').addEventListener('click',()=>{renderOpts();document.getElementById('modalBack').classList.add('open');});
document.getElementById('modalClose').addEventListener('click',()=>document.getElementById('modalBack').classList.remove('open'));
document.getElementById('modalBack').addEventListener('click',e=>{if(e.target.id==='modalBack')document.getElementById('modalBack').classList.remove('open');});
document.querySelectorAll('.proto-item').forEach(row=>row.addEventListener('click',()=>{row.querySelector('.proto-check').classList.toggle('on');row.querySelector('.proto-n').classList.toggle('done');vib(10);}));
document.getElementById('goTrainHint').addEventListener('click',()=>goTo(1));
renderStats();applyTheme(0);bindNav();bindReader();bindMap();bindGameShell();mountStatBrain();mountStackBrain(makeBrainPts);renderStack();renderCarousel();initParticles();
setTimeout(()=>animLines(initStatLines(),{base:'oklch(72% .12 300 / .5)',glow:'oklch(74% .13 300 / .7)',pulse:'oklch(86% .10 300 / .9)'}),250);
setTimeout(()=>animLines(initStackLines(),{base:'oklch(72% .12 300 / .45)',glow:'oklch(74% .13 300 / .6)',pulse:'oklch(86% .10 300 / .9)'}),300);
window.addEventListener('resize',centerMap);
