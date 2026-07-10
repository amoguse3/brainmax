import { S, vib } from '../state.js';
import { openGame, setProg, stopTimer, finish, adapt } from './engine.js';
// Two-step critical thinking: 1) spot the logical flaw, 2) type a one-line counter-argument.
// Local scoring rewards naming the flaw + a substantive rebuttal. Swappable for LLM later.
const ITEMS=[
  {s:'"Everyone I know loves this movie, so it must be the best film ever made."',opts:['Hasty generalization','Valid conclusion','Circular reasoning','Appeal to authority'],a:0,key:['sample','everyone','few','not represent','anecdot']},
  {s:'"The rooster crows before sunrise, so the rooster causes the sun to rise."',opts:['Correlation \u2260 causation','Straw man','Valid cause','Ad hominem'],a:0,key:['correlat','cause','coincid','timing','both']},
  {s:'"You can\u2019t trust his climate argument, he failed science in school."',opts:['Attacking the person','Slippery slope','Sound reasoning','False dilemma'],a:0,key:['person','argument','ad hominem','evidence','irrelevant']},
  {s:'"Either we ban all cars, or the planet is doomed."',opts:['False dilemma','Correlation error','Valid logic','Appeal to emotion'],a:0,key:['other option','middle','both','alternativ','more than two']},
  {s:'"This medicine is natural, so it must be safe."',opts:['Appeal to nature','Circular reasoning','Correct inference','Hasty generalization'],a:0,key:['natural','safe','poison','arsenic','not mean']},
  {s:'"Let students redo one test and soon school collapses."',opts:['Slippery slope','Ad hominem','Valid prediction','False cause'],a:0,key:['slope','step','extreme','not follow','exagger']}
];
export function startCritical(){
  openGame('Critical Thinking');
  const gBody=document.getElementById('gameBody'), gLevel=document.getElementById('gameLevel');
  const total=5; let q=0, score=0;
  const pool=[...ITEMS].sort(()=>Math.random()-0.5).slice(0,total);
  function step(){
    if(q>=total) return done();
    const it=pool[q]; q++; setProg(q-1,total); gLevel.textContent=`${q}/${total}`;
    const opts=it.opts.map((o,i)=>({o,ok:i===it.a})).sort(()=>Math.random()-0.5);
    gBody.innerHTML=`<div class="game-hint">1. Find the flaw</div><div class="ct-scenario">${it.s}</div><div class="ct-opts">${opts.map(o=>`<button class="ct-btn" data-ok="${o.ok}">${o.o}</button>`).join('')}</div>`;
    let picked=false;
    document.querySelectorAll('.ct-btn').forEach(b=>b.onclick=()=>{
      if(picked) return; picked=true;
      document.querySelectorAll('.ct-btn').forEach(x=>x.style.pointerEvents='none');
      const right=b.dataset.ok==='true';
      if(right){ score+=0.5; b.classList.add('correct'); vib(18); } else { b.classList.add('wrong'); document.querySelector('.ct-btn[data-ok="true"]').classList.add('correct'); vib([30,20,30]); }
      setTimeout(()=>rebut(it),650);
    });
  }
  function rebut(it){
    gBody.innerHTML=`<div class="game-hint">2. Write a one-line counter-argument</div><div class="ct-scenario">${it.s}</div><div class="cr-inputrow"><input class="cr-field" id="ctField" placeholder="Why is it wrong?\u2026" autocomplete="off"><button class="cr-send" id="ctSend">\u2192</button></div><div class="cr-sub" id="ctFb" style="margin-top:14px"></div>`;
    const field=document.getElementById('ctField'); setTimeout(()=>field.focus(),150);
    const submit=()=>{
      const v=field.value.trim().toLowerCase();
      const hits=it.key.filter(k=>v.includes(k)).length;
      const substantive=v.split(/\s+/).length>=5;
      if(hits>0 && substantive) score+=0.5;
      else if(hits>0 || substantive) score+=0.25;
      document.getElementById('ctFb').textContent = hits>0? 'Solid, you named the mechanism.' : 'Fair try. Point at the specific gap next time.';
      vib(12);
      setTimeout(step,900);
    };
    document.getElementById('ctSend').onclick=submit;
    field.addEventListener('keydown',e=>{ if(e.key==='Enter') submit(); });
  }
  function done(){
    const acc=Math.round(score/total*100);
    adapt('critical',acc);
    finish('\ud83e\udde9',acc,4000,'reason','critical');
  }
  step();
}