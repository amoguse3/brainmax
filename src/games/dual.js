import { S, vib } from '../state.js';
import { openGame, setProg, startTimer, stopTimer, finish } from './engine.js';
import { nextDifficulty, recordExperiment } from './lab.js';

const BASE={top:'T',bottom:'B',front:'F',back:'K',left:'L',right:'R'};
function rotate(faces,direction){const f={...faces};if(direction==='forward')return {...f,top:f.back,front:f.top,bottom:f.front,back:f.bottom};if(direction==='back')return {...f,top:f.front,back:f.top,bottom:f.back,front:f.bottom};if(direction==='left')return {...f,top:f.right,left:f.top,bottom:f.left,right:f.bottom};return {...f,top:f.left,right:f.top,bottom:f.right,left:f.bottom};}
function cube(f){return `<div class="dual-cube"><div class="dual-face dual-front">${f.front}</div><div class="dual-face dual-back">${f.back}</div><div class="dual-face dual-right">${f.right}</div><div class="dual-face dual-left">${f.left}</div><div class="dual-face dual-top">${f.top}</div><div class="dual-face dual-bottom">${f.bottom}</div></div>`;}
function math(level){const a=6+Math.floor(Math.random()*(12+level*2)),b=2+Math.floor(Math.random()*(8+level));return Math.random()<.5?{text:`${a}+${b}`,answer:a+b}:{text:`${a+b}−${b}`,answer:a};}
function shuffled(values){return [...values].sort(()=>Math.random()-.5);}

export function startDual(){
  openGame('Dual-Task Lab');
  const startedAt=Date.now(),total=10,trials=[],recent=[];let index=0,level=S.levels.dual||1;
  const body=document.getElementById('gameBody'),levelEl=document.getElementById('gameLevel');
  function round(){
    if(index>=total)return done();
    const dirs=['forward','back','left','right'],steps=level<4?1:level<8?2:3;let faces={...BASE};const sequence=[];for(let i=0;i<steps;i++){const dir=dirs[Math.floor(Math.random()*dirs.length)];sequence.push(dir);faces=rotate(faces,dir);}const sum=math(level),correct=`${faces.top} · ${sum.answer}`;
    const wrong=[`${BASE.top} · ${sum.answer}`,`${faces.top} · ${sum.answer+1}`,`${faces.front} · ${sum.answer-1}`].filter((v,i,a)=>v!==correct&&a.indexOf(v)===i);while(wrong.length<3)wrong.push(`${['B','F','L','R'][wrong.length]} · ${sum.answer+wrong.length+2}`);
    const options=shuffled([correct,...wrong.slice(0,3)]),limit=Math.max(4500,10500-level*430);setProg(index,total);levelEl.textContent=`Load ${level} · ${index+1}/${total}`;
    body.innerHTML=`<div class="lab-kicker">Integrated load</div><div class="lab-prompt">Mentally rotate the cube ${sequence.join(' → ')}. At the same time solve the equation. Pick new TOP + answer.</div><div class="dual-row">${cube(BASE)}<div class="dual-op">${sum.text}</div></div><div class="lab-answers">${options.map(value=>`<button class="lab-answer" data-value="${value}">${value}</button>`).join('')}</div><div class="lab-meta"><span>${steps} rotation${steps>1?'s':''}</span><span>${(limit/1000).toFixed(1)}s</span></div>`;
    let answered=false;const answer=value=>{if(answered)return;answered=true;const rt=stopTimer(),ok=value===correct;trials.push({level,correct:ok,rt,steps,sequence,math:sum.text});recent.push(ok);body.querySelectorAll('.lab-answer').forEach(b=>{b.disabled=true;if(b.dataset.value===correct)b.classList.add('correct');});if(!ok)body.querySelector(`[data-value="${value}"]`)?.classList.add('wrong');vib(ok?10:[24,18,24]);level=nextDifficulty(level,recent);index+=1;setTimeout(round,560);};
    body.querySelectorAll('.lab-answer').forEach(button=>button.onclick=()=>answer(button.dataset.value));startTimer(limit,()=>answer('timeout'));
  }
  function done(){S.levels.dual=level;const session=recordExperiment('dual',trials,startedAt,level);finish('◆',session.accuracy,session.meanRtMs,'reason','dual',`Dual-task load reached ${level}. Logged to N-of-1 Lab.`);}
  round();
}
