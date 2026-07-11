import { S, vib } from '../state.js';
import { openGame, setProg, startTimer, stopTimer, finish } from './engine.js';
import { nextDifficulty, recordExperiment } from './lab.js';

function problem(level) {
  const digits = level < 3 ? 1 : level < 7 ? 2 : 3;
  const max = 10 ** digits - 1;
  const min = digits === 1 ? 2 : 10 ** (digits - 1);
  const a = min + Math.floor(Math.random() * (max - min));
  const b = min + Math.floor(Math.random() * (max - min));
  const operations = level < 2 ? ['+'] : level < 5 ? ['+','-'] : level < 8 ? ['+','-','×'] : ['+','-','×','÷'];
  const op = operations[Math.floor(Math.random() * operations.length)];
  if (op === '+') return { text:`${a} + ${b}`, answer:a+b };
  if (op === '-') return { text:`${Math.max(a,b)} − ${Math.min(a,b)}`, answer:Math.abs(a-b) };
  if (op === '×') { const x=2+Math.floor(Math.random()*(7+level)); const y=2+Math.floor(Math.random()*(7+level)); return { text:`${x} × ${y}`,answer:x*y }; }
  const divisor=2+Math.floor(Math.random()*Math.min(12,4+level)); const quotient=2+Math.floor(Math.random()*(8+level)); return { text:`${divisor*quotient} ÷ ${divisor}`,answer:quotient };
}

function choices(answer) {
  const values = new Set([answer]);
  while (values.size < 4) {
    const spread = Math.max(3, Math.round(Math.abs(answer) * .18));
    let candidate = answer + Math.floor(Math.random() * spread * 2 + 1) - spread;
    if (candidate === answer) candidate += 1;
    values.add(candidate);
  }
  return [...values].sort(() => Math.random() - .5);
}

export function startMath() {
  openGame('Adaptive Math Lab');
  const startedAt=Date.now(), total=12, trials=[], recent=[];
  let index=0, level=S.levels.math || 1;
  const body=document.getElementById('gameBody'), levelEl=document.getElementById('gameLevel');

  function round() {
    if (index >= total) return done();
    const item=problem(level), answers=choices(item.answer), limit=Math.max(3500,8500-level*380);
    setProg(index,total); levelEl.textContent=`Load ${level} · ${index+1}/${total}`;
    body.innerHTML=`<div class="lab-kicker">Frontal load</div><div class="lab-math">${item.text}</div><div class="lab-answers">${answers.map(value=>`<button class="lab-answer" data-value="${value}">${value}</button>`).join('')}</div><div class="lab-meta"><span>target 70–85%</span><span>${(limit/1000).toFixed(1)}s</span></div>`;
    let answered=false;
    const answer=value=>{
      if(answered)return; answered=true;
      const rt=stopTimer(), correct=value===item.answer;
      trials.push({level,correct,rt,prompt:item.text,answer:item.answer}); recent.push(correct);
      body.querySelectorAll('.lab-answer').forEach(button=>{button.disabled=true;if(+button.dataset.value===item.answer)button.classList.add('correct');});
      if(!correct) body.querySelector(`[data-value="${value}"]`)?.classList.add('wrong');
      vib(correct?10:[24,18,24]); level=nextDifficulty(level,recent); index+=1; setTimeout(round,420);
    };
    body.querySelectorAll('.lab-answer').forEach(button=>button.onclick=()=>answer(+button.dataset.value));
    startTimer(limit,()=>answer(Number.NaN));
  }

  function done(){
    S.levels.math=level;
    const session=recordExperiment('math',trials,startedAt,level);
    finish('⚡',session.accuracy,session.meanRtMs,'frontal','math',`Adaptive load reached ${level}. Logged to N-of-1 Lab.`);
  }
  round();
}
