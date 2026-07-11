import { S, vib } from '../state.js';
import { openGame, setProg, startTimer, stopTimer, finish } from './engine.js';
import { nextDifficulty, recordExperiment } from './lab.js';

function installMathStyles(){if(document.getElementById('mathChainStyles'))return;const style=document.createElement('style');style.id='mathChainStyles';style.textContent=`
.chain-reactor{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin:10px 0 24px}.chain-start{display:grid;place-items:center;width:66px;height:66px;flex:0 0 66px;border:1px solid oklch(82% .12 82 / .28);border-radius:50%;background:oklch(27% .07 82);color:oklch(90% .13 82);font:850 1.45rem 'JetBrains Mono',monospace;box-shadow:0 0 24px oklch(78% .13 82 / .18)}.chain-arrow{color:var(--text-3);font-weight:800}.chain-ops{display:flex;flex-wrap:wrap;justify-content:center;gap:7px}.chain-op{display:grid;place-items:center;min-width:48px;height:48px;padding:0 9px;border-radius:14px;background:oklch(28% .075 300);color:oklch(88% .06 300);font:800 .9rem 'JetBrains Mono',monospace}.chain-op:nth-child(even){background:oklch(30% .08 285)}.chain-question{margin-bottom:8px;color:var(--text);font-size:1.45rem;font-weight:780;text-align:center}.chain-sub{max-width:30ch;margin-bottom:12px;color:var(--text-3);font-size:.72rem;line-height:1.4;text-align:center}.tutorial-chain{display:flex;flex-direction:column;gap:7px;width:100%;max-width:320px;margin:4px 0 18px}.tutorial-step{display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:10px;min-height:46px;padding:7px 10px;border-radius:13px;background:oklch(21% .045 300)}.tutorial-step i{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:oklch(32% .09 300);color:oklch(88% .07 300);font-style:normal;font-weight:800}.tutorial-step span{color:var(--text-2);font:700 .78rem 'JetBrains Mono',monospace}.tutorial-step b{color:oklch(86% .13 82);font:850 .9rem 'JetBrains Mono',monospace}.math-mode{margin-bottom:7px;color:oklch(78% .12 300);font-size:.65rem;font-weight:850;letter-spacing:.11em;text-transform:uppercase}.chain-tip{display:flex;align-items:center;gap:8px;max-width:320px;margin-bottom:18px;color:var(--text-3);font-size:.68rem;line-height:1.35}.chain-tip b{color:oklch(84% .13 82);font-size:1rem}
`;document.head.appendChild(style);}
function makeChain(level){
  const steps=level<3?2:level<7?3:4;let value=3+Math.floor(Math.random()*(9+level)),current=value;const operations=[];
  for(let i=0;i<steps;i+=1){
    const allowMultiply=level>=4&&current<60,allowDivide=level>=7&&current>5&&current%2===0;const types=['add','sub',...(allowMultiply?['mul']:[]),...(allowDivide?['div']:[])];const type=types[Math.floor(Math.random()*types.length)];
    if(type==='add'){const n=2+Math.floor(Math.random()*(7+level));operations.push({symbol:`+${n}`,before:current,after:current+n});current+=n;}
    else if(type==='sub'){const max=Math.max(2,Math.min(9+level,current-1)),n=1+Math.floor(Math.random()*max);operations.push({symbol:`−${n}`,before:current,after:current-n});current-=n;}
    else if(type==='mul'){const n=2+Math.floor(Math.random()*Math.min(3,1+Math.floor(level/4)));operations.push({symbol:`×${n}`,before:current,after:current*n});current*=n;}
    else {operations.push({symbol:'÷2',before:current,after:current/2});current/=2;}
  }
  return{start:value,operations,answer:current};
}
function choices(answer){const values=new Set([answer]);while(values.size<4){const spread=Math.max(4,Math.round(Math.abs(answer)*.2)),candidate=answer+Math.floor(Math.random()*(spread*2+1))-spread;if(candidate!==answer&&candidate>=0)values.add(candidate);}return[...values].sort(()=>Math.random()-.5);}

export function startMath(){
  installMathStyles();openGame('Math Chain');
  const startedAt=Date.now(),total=12,trials=[],recent=[];let index=0,level=S.levels.math||1;
  const body=document.getElementById('gameBody'),levelEl=document.getElementById('gameLevel');
  function intro(){body.innerHTML=`<div class="lab-kicker">Mental arithmetic</div><div class="clear-title">Carry one number through a chain</div><div class="lab-prompt">Start with the first number. Apply every operation from left to right without writing intermediate answers.</div><div class="tutorial-chain"><div class="tutorial-step"><i>1</i><span>Start</span><b>8</b></div><div class="tutorial-step"><i>2</i><span>8 + 5</span><b>13</b></div><div class="tutorial-step"><i>3</i><span>13 × 2</span><b>26</b></div><div class="tutorial-step"><i>4</i><span>26 − 6</span><b>20</b></div></div><div class="chain-tip"><b>✦</b><span>The chain grows as you improve. One mistake lowers the load instead of killing the run.</span></div><button class="clear-start" id="mathStart">Start Math Chain</button>`;document.getElementById('mathStart').onclick=round;}
  function round(){
    if(index>=total)return done();const chain=makeChain(level),answers=choices(chain.answer),limit=Math.max(4000,9500-level*320);
    setProg(index,total);levelEl.textContent=`Load ${level} · ${index+1}/${total}`;
    body.innerHTML=`<div class="math-mode">Chain ${index+1} of ${total}</div><div class="chain-question">Where does the number land?</div><div class="chain-reactor"><div class="chain-start">${chain.start}</div><div class="chain-arrow">→</div><div class="chain-ops">${chain.operations.map(op=>`<div class="chain-op">${op.symbol}</div>`).join('')}</div></div><div class="lab-answers">${answers.map(value=>`<button class="lab-answer" data-value="${value}">${value}</button>`).join('')}</div><div class="lab-meta"><span>${chain.operations.length} operations</span><span>${(limit/1000).toFixed(1)}s</span></div>`;
    let answered=false;const answer=value=>{if(answered)return;answered=true;const rt=stopTimer(),correct=value===chain.answer;trials.push({level,correct,rt,start:chain.start,operations:chain.operations.map(op=>op.symbol),answer:chain.answer});recent.push(correct);body.querySelectorAll('.lab-answer').forEach(button=>{button.disabled=true;if(+button.dataset.value===chain.answer)button.classList.add('correct');});if(!correct)body.querySelector(`[data-value="${value}"]`)?.classList.add('wrong');vib(correct?10:[24,18,24]);level=nextDifficulty(level,recent);index+=1;setTimeout(round,480);};
    body.querySelectorAll('.lab-answer').forEach(button=>button.onclick=()=>answer(+button.dataset.value));startTimer(limit,()=>answer(Number.NaN));
  }
  function done(){S.levels.math=level;const session=recordExperiment('math',trials,startedAt,level);finish('∑',session.accuracy,session.meanRtMs,'frontal','math',`Math Chain load reached ${level}.`);}intro();
}
