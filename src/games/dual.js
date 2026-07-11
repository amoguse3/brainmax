import { S, vib } from '../state.js';
import { openGame, setProg, startTimer, stopTimer, finish } from './engine.js';
import { nextDifficulty, recordExperiment } from './lab.js';

const START={top:1,bottom:6,front:2,back:5,left:3,right:4};
const MOVES={right:['→','ROLL RIGHT'],left:['←','ROLL LEFT'],forward:['↓','ROLL TOWARD YOU'],back:['↑','ROLL AWAY']};
function roll(f,d){const x={...f};if(d==='right')return{...x,top:x.left,right:x.top,bottom:x.right,left:x.bottom};if(d==='left')return{...x,top:x.right,left:x.top,bottom:x.left,right:x.bottom};if(d==='forward')return{...x,top:x.back,front:x.top,bottom:x.front,back:x.bottom};return{...x,top:x.front,back:x.top,bottom:x.back,front:x.bottom};}
function cube(f){return `<div class="number-cube"><div class="number-face nf-front">${f.front}</div><div class="number-face nf-back">${f.back}</div><div class="number-face nf-right">${f.right}</div><div class="number-face nf-left">${f.left}</div><div class="number-face nf-top">${f.top}</div><div class="number-face nf-bottom">${f.bottom}</div></div>`;}
function makeMath(level){const a=5+Math.floor(Math.random()*(12+level)),b=2+Math.floor(Math.random()*(7+level));return Math.random()<.5?{text:`${a} + ${b}`,answer:a+b}:{text:`${a+b} − ${b}`,answer:a};}
function shuffle(values){return [...values].sort(()=>Math.random()-.5);}

export function startDual(){
  openGame('Cube + Math');
  const startedAt=Date.now(),total=10,trials=[],recent=[];let index=0,level=S.levels.dual||1;
  const body=document.getElementById('gameBody'),levelEl=document.getElementById('gameLevel');

  function intro(){
    body.innerHTML=`<div class="lab-kicker">Two things at once</div><div class="clear-title">Keep one number in memory while rotating</div><div class="dual-steps"><div><b>1</b><span>Solve the equation and hold the answer</span></div><div><b>2</b><span>Mentally roll the numbered cube</span></div><div><b>3</b><span>Choose: new TOP number + equation answer</span></div></div><div class="dual-example"><span>Example</span><strong>8 + 4 = 12</strong><strong>roll right → top becomes 3</strong><em>correct choice: 3 | 12</em></div><button class="clear-start" id="dualStart">Got it, start</button>`;
    document.getElementById('dualStart').onclick=round;
  }

  function round(){
    if(index>=total)return done();
    const task=makeMath(level),moveCount=level<5?1:2,names=Object.keys(MOVES),sequence=[];let result={...START};
    for(let i=0;i<moveCount;i+=1){const d=names[Math.floor(Math.random()*names.length)];sequence.push(d);result=roll(result,d);}
    const correct=`${result.top} | ${task.answer}`;
    const options=shuffle([correct,`${START.top} | ${task.answer}`,`${result.top} | ${task.answer+1}`,`${result.front} | ${task.answer-1}`].filter((v,i,a)=>a.indexOf(v)===i));
    while(options.length<4)options.push(`${2+options.length} | ${task.answer+options.length}`);
    const limit=Math.max(5500,12000-level*420);setProg(index,total);levelEl.textContent=`Load ${level} · ${index+1}/${total}`;
    body.innerHTML=`<div class="lab-kicker">Question ${index+1}</div><div class="dual-task-layout"><section><span class="step-tag">1 · CALCULATE</span><div class="dual-equation">${task.text}</div><small>Keep the answer in mind</small></section><section><span class="step-tag">2 · ROTATE</span><div class="dual-visual">${cube(START)}<div class="move-sequence">${sequence.map(d=>`<div class="move-pill"><b>${MOVES[d][0]}</b><span>${MOVES[d][1]}</span></div>`).join('')}</div></div><small>Which number moves to TOP?</small></section></div><span class="step-tag final-tag">3 · CHOOSE TOP | MATH</span><div class="lab-answers">${options.map(value=>`<button class="lab-answer" data-value="${value}">${value}</button>`).join('')}</div>`;
    let answered=false;const choose=value=>{if(answered)return;answered=true;const rt=stopTimer(),ok=value===correct;trials.push({level,correct:ok,rt,sequence,math:task.text,top:result.top});recent.push(ok);body.querySelectorAll('.lab-answer').forEach(button=>{button.disabled=true;if(button.dataset.value===correct)button.classList.add('correct');});if(!ok)body.querySelector(`[data-value="${value}"]`)?.classList.add('wrong');vib(ok?10:[24,18,24]);level=nextDifficulty(level,recent);index+=1;setTimeout(round,700);};
    body.querySelectorAll('.lab-answer').forEach(button=>button.onclick=()=>choose(button.dataset.value));startTimer(limit,()=>choose('timeout'));
  }
  function done(){S.levels.dual=level;const session=recordExperiment('dual',trials,startedAt,level);finish('◆',session.accuracy,session.meanRtMs,'reason','dual',`Combined load reached ${level}.`);}
  intro();
}
