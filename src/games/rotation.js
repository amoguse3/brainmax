import { S, vib } from '../state.js';
import { openGame, setProg, startTimer, stopTimer, finish } from './engine.js';
import { nextDifficulty, recordExperiment } from './lab.js';

const SHAPES=[[[0,0,0],[1,0,0],[1,1,0],[2,1,0],[2,1,1]],[[0,0,0],[0,1,0],[1,1,0],[1,1,1],[1,2,1]],[[0,0,0],[1,0,0],[2,0,0],[1,1,0],[1,1,1]]];
function iso(x,y,z){return [(x-y)*24,(x+y)*13-z*26];}
function objectSvg(shape,angle,mirror){
  const rad=angle*Math.PI/180, cos=Math.cos(rad), sin=Math.sin(rad);
  const cubes=shape.map(([x,y,z])=>{const rx=(mirror?-x:x)*cos-y*sin,ry=(mirror?-x:x)*sin+y*cos;return {x:rx,y:ry,z,depth:rx+ry+z};}).sort((a,b)=>a.depth-b.depth);
  const faces=cubes.map(c=>{const [x,y]=iso(c.x,c.y,c.z);return `<g transform="translate(${x} ${y})"><polygon points="0,-26 24,-13 0,0 -24,-13" fill="oklch(76% .13 300)"/><polygon points="-24,-13 0,0 0,26 -24,13" fill="oklch(48% .11 300)"/><polygon points="24,-13 0,0 0,26 24,13" fill="oklch(59% .12 300)"/></g>`;}).join('');
  return `<svg viewBox="-105 -105 210 210" aria-hidden="true"><g transform="translate(0 8)">${faces}</g></svg>`;
}

export function startRotation(){
  openGame('Spatial Rotation Lab');
  const startedAt=Date.now(),total=10,trials=[],recent=[]; let index=0,level=S.levels.rotation||1;
  const body=document.getElementById('gameBody'),levelEl=document.getElementById('gameLevel');
  function round(){
    if(index>=total)return done();
    const shape=SHAPES[Math.floor(Math.random()*SHAPES.length)], mirror=Math.random()<.5;
    const angles=[45,90,135,180,225,270], angle=angles[Math.floor(Math.random()*Math.min(angles.length,2+level))];
    const limit=Math.max(3800,9000-level*420); setProg(index,total); levelEl.textContent=`Load ${level} · ${index+1}/${total}`;
    body.innerHTML=`<div class="lab-kicker">Parietal load</div><div class="lab-prompt">Same object after rotation, or a mirrored structure?</div><div class="rot-pair"><div class="rot-fig">${objectSvg(shape,0,false)}</div><div class="rot-vs">vs</div><div class="rot-fig">${objectSvg(shape,angle,mirror)}</div></div><div class="rot-controls"><button class="rot-btn" data-pick="same">SAME</button><button class="rot-btn" data-pick="mirror">MIRROR</button></div>`;
    let answered=false; const answer=pick=>{if(answered)return;answered=true;const rt=stopTimer(),correct=(pick==='mirror')===mirror;trials.push({level,correct,rt,angle,mirror});recent.push(correct);body.querySelectorAll('.rot-btn').forEach(b=>b.disabled=true);const truth=body.querySelector(`[data-pick="${mirror?'mirror':'same'}"]`);truth?.classList.add('correct');if(!correct)body.querySelector(`[data-pick="${pick}"]`)?.classList.add('wrong');vib(correct?10:[24,18,24]);level=nextDifficulty(level,recent);index+=1;setTimeout(round,500);};
    body.querySelectorAll('.rot-btn').forEach(button=>button.onclick=()=>answer(button.dataset.pick));startTimer(limit,()=>answer('timeout'));
  }
  function done(){S.levels.rotation=level;const session=recordExperiment('rotation',trials,startedAt,level);finish('◈',session.accuracy,session.meanRtMs,'parietal','rotation',`Rotation load reached ${level}. Logged to N-of-1 Lab.`);}
  round();
}
