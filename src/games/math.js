import { S, vib } from '../state.js';
import { openGame, setProg, startTimer, stopTimer, finish } from './engine.js';
// Living Equation: rule symbols mutate. Levels 1-10 teach chains.
// 11+ anti-strategy: operators remap mid-round (e.g. ▲ now means ×).
export function startMath(){
  openGame('Living Equation');
  const gBody=document.getElementById('gameBody'), gLevel=document.getElementById('gameLevel');
  let lvl=S.levels.math, total=10, q=0, correct=0, streak=0, rt=[], val='', ans=0;
  const sigs=['▲','◆','●'];
  function gen(L){
    const terms=Math.min(2+Math.floor(L/3),4);
    const maxN=6+L*3;
    const useSig=L>=5;
    const map={'+':'+','-':'−','×':'×'};
    const sigMap = useSig ? {'▲': L>=11 ? '×' : '+', '◆': L>=11 ? '+' : '−', '●':'×'} : null;
    const ops=L<4?['+','-']:['+','-','×'];
    let acc=0, expr='', legend='';
    if(useSig){ legend = Object.entries(sigMap).map(([k,v])=>`${k}=${v}`).join('  '); }
    for(let i=0;i<terms;i++){
      const op=i===0?'+':ops[(Math.random()*ops.length)|0];
      const num=(Math.random()*maxN|0)+2;
      const disp = useSig && i>0 ? Object.keys(sigMap).find(k=>sigMap[k]===op) : map[op]||op;
      if(i===0){ acc=num; expr=''+num; }
      else if(op==='+'){ acc+=num; expr+=` ${disp} ${num}`; }
      else if(op==='-'){ acc-=num; expr+=` ${disp} ${num}`; }
      else { acc*=num; expr+=` ${disp} ${num}`; }
    }
    return {expr,acc,legend};
  }
  function upd(){ document.getElementById('mIn').textContent=val||'_'; }
  function newQ(){
    q++; if(q>total) return done();
    setProg(q-1,total); gLevel.textContent=`Lv ${lvl} \u00b7 ${q}/${total}`;
    const g=gen(lvl); ans=g.acc; val='';
    gBody.innerHTML=`<div class="game-hint">${g.legend||'Solve fast, hold the chain in mind.'}</div><div class="math-q">${g.expr}</div><div class="math-input" id="mIn">_</div><div class="math-pad">${[1,2,3,4,5,6,7,8,9].map(d=>`<button class="math-key" data-d="${d}">${d}</button>`).join('')}<button class="math-key" data-d="-">\u00b1</button><button class="math-key" data-d="0">0</button><button class="math-key ok" data-d="ok">\u2713</button></div><div class="math-feedback" id="mfb"></div>`;
    document.querySelectorAll('.math-key').forEach(k=>k.addEventListener('click',()=>{ const d=k.dataset.d; vib(8); if(d==='ok') check(); else if(d==='-'){ val=val.startsWith('-')?val.slice(1):'-'+val; upd(); } else { val+=d; upd(); } }));
    upd();
    startTimer(Math.max(3800,9800-lvl*380),()=>check(true));
  }
  function check(timeout){
    rt.push(stopTimer()); const fb=document.getElementById('mfb');
    if(!timeout && parseInt(val,10)===ans){ correct++; streak++; fb.textContent='\u2713'; fb.style.color='var(--lav)'; vib(20); if(streak>=3){ lvl++; streak=0; } }
    else { fb.textContent='\u2717'; fb.style.color='var(--red)'; vib([30,20,30]); streak=0; if(lvl>1) lvl--; }
    fb.classList.add('show'); setTimeout(()=>{ fb.classList.remove('show'); newQ(); },550);
  }
  function done(){ const acc=Math.round(correct/total*100); const avg=rt.length?rt.reduce((a,b)=>a+b,0)/rt.length:9999; S.levels.math=lvl; finish('\u26a1',acc,avg,'frontal','math'); }
  newQ();
}