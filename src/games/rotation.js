import { S, vib } from '../state.js';
import { openGame, setProg, startTimer, stopTimer, finish } from './engine.js';
import { nextDifficulty, recordExperiment } from './lab.js';

const START={top:'PURPLE',bottom:'YELLOW',front:'BLUE',back:'ORANGE',left:'GREEN',right:'PINK'};
const COLORS={PURPLE:'oklch(66% .18 300)',YELLOW:'oklch(84% .15 90)',BLUE:'oklch(66% .15 245)',ORANGE:'oklch(74% .16 55)',GREEN:'oklch(72% .15 150)',PINK:'oklch(72% .17 345)'};
const MOVES={right:{label:'ROLL RIGHT',symbol:'→'},left:{label:'ROLL LEFT',symbol:'←'},forward:{label:'ROLL TOWARD YOU',symbol:'↓'},back:{label:'ROLL AWAY',symbol:'↑'}};

function installRotationStyles(){if(document.getElementById('rotationClarityStyles'))return;const style=document.createElement('style');style.id='rotationClarityStyles';style.textContent=`
.face-map{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;width:100%;max-width:340px;margin:4px 0 18px}.face-key{display:flex;align-items:center;gap:7px;min-width:0;padding:8px 9px;border-radius:11px;background:oklch(21% .045 300)}.face-key i{width:10px;height:10px;flex:0 0 10px;border-radius:50%;box-shadow:0 0 9px currentColor}.face-key span{display:flex;flex-direction:column;min-width:0}.face-key b{overflow:hidden;color:var(--text);font-size:.62rem;text-overflow:ellipsis}.face-key small{color:var(--text-3);font-size:.52rem;text-transform:uppercase;letter-spacing:.06em}.map-label{margin:2px 0 8px;color:var(--text-3);font-size:.62rem;font-weight:750;letter-spacing:.09em;text-transform:uppercase}.hidden-note{max-width:32ch;margin:-8px 0 16px;color:var(--text-3);font-size:.66rem;line-height:1.35;text-align:center}
`;document.head.appendChild(style);}
function roll(faces,direction){const f={...faces};if(direction==='right')return{...f,top:f.left,right:f.top,bottom:f.right,left:f.bottom};if(direction==='left')return{...f,top:f.right,left:f.top,bottom:f.left,right:f.bottom};if(direction==='forward')return{...f,top:f.back,front:f.top,bottom:f.front,back:f.bottom};return{...f,top:f.front,back:f.top,bottom:f.back,front:f.bottom};}
function face(name,klass){return `<div class="clear-face ${klass}" style="--face:${COLORS[name]}"><span>${name}</span></div>`;}
function cube(faces){return `<div class="clear-cube">${face(faces.front,'clear-front')}${face(faces.back,'clear-back')}${face(faces.right,'clear-right')}${face(faces.left,'clear-left')}${face(faces.top,'clear-top')}${face(faces.bottom,'clear-bottom')}</div>`;}
function faceMap(){const labels={top:'Top',bottom:'Bottom',front:'Front',back:'Back',left:'Left',right:'Right'};return `<div class="face-map">${Object.entries(START).map(([side,color])=>`<div class="face-key"><i style="background:${COLORS[color]};color:${COLORS[color]}"></i><span><b>${color}</b><small>${labels[side]}</small></span></div>`).join('')}</div>`;}
function shuffled(values){return[...values].sort(()=>Math.random()-.5);}

export function startRotation(){
  installRotationStyles();openGame('Cube Rotation');
  const startedAt=Date.now(),total=10,trials=[],recent=[];let index=0,level=S.levels.rotation||1;
  const body=document.getElementById('gameBody'),levelEl=document.getElementById('gameLevel');
  function intro(){body.innerHTML=`<div class="lab-kicker">How it works</div><div class="clear-title">Imagine rolling the cube</div><div class="lab-prompt">Every face has a fixed color. Three faces are visible on the cube; the complete map below shows all six.</div><div class="clear-demo">${cube(START)}<div class="move-pill"><b>→</b><span>ROLL RIGHT</span></div></div><div class="map-label">Starting face map</div>${faceMap()}<div class="clear-rule"><span>Before</span><b>GREEN is on the left</b><span>After rolling right</span><b>GREEN moves to the top</b></div><button class="clear-start" id="clearStart">Got it, start</button>`;document.getElementById('clearStart').onclick=round;}
  function round(){
    if(index>=total)return done();let result={...START};const moveCount=level<4?1:level<8?2:3,sequence=[];
    for(let i=0;i<moveCount;i+=1){const names=Object.keys(MOVES),direction=names[Math.floor(Math.random()*names.length)];sequence.push(direction);result=roll(result,direction);}
    const answer=result.top,options=shuffled([answer,...shuffled(Object.keys(COLORS).filter(c=>c!==answer)).slice(0,3)]),limit=Math.max(4500,10500-level*420);
    setProg(index,total);levelEl.textContent=`Load ${level} · ${index+1}/${total}`;
    body.innerHTML=`<div class="lab-kicker">Question ${index+1}</div><div class="clear-title">What color ends up on top?</div><div class="clear-work"><div class="clear-cube-wrap">${cube(START)}</div><div class="move-sequence">${sequence.map(d=>`<div class="move-pill"><b>${MOVES[d].symbol}</b><span>${MOVES[d].label}</span></div>`).join('')}</div></div><div class="map-label">All starting faces</div>${faceMap()}<div class="hidden-note">Use the map for hidden back and bottom faces. Then rotate the whole cube in your head.</div><div class="color-answers">${options.map(color=>`<button class="color-answer" data-value="${color}"><i style="background:${COLORS[color]}"></i>${color}</button>`).join('')}</div>`;
    let answered=false;const choose=value=>{if(answered)return;answered=true;const rt=stopTimer(),correct=value===answer;trials.push({level,correct,rt,sequence,answer});recent.push(correct);body.querySelectorAll('.color-answer').forEach(button=>{button.disabled=true;if(button.dataset.value===answer)button.classList.add('correct');});if(!correct)body.querySelector(`[data-value="${value}"]`)?.classList.add('wrong');vib(correct?10:[24,18,24]);level=nextDifficulty(level,recent);index+=1;setTimeout(round,650);};
    body.querySelectorAll('.color-answer').forEach(button=>button.onclick=()=>choose(button.dataset.value));startTimer(limit,()=>choose('timeout'));
  }
  function done(){S.levels.rotation=level;const session=recordExperiment('rotation',trials,startedAt,level);finish('◈',session.accuracy,session.meanRtMs,'parietal','rotation',`Mental cube load reached ${level}.`);}intro();
}
