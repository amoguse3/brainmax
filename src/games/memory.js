import { S, vib } from '../state.js';
import { openGame, setProg, finish } from './engine.js';
// Memory Recall -> Ghost Grid. Like dual n-back, but with silent blank trials and jittered
// timing to kill rhythm strategies. Track position and color N-back.
const COLORS=['oklch(80% 0.12 300)','oklch(78% 0.11 265)','oklch(80% 0.11 200)','oklch(82% 0.10 330)'];
export function startMemory(){
  openGame('Ghost Grid');
  const gBody=document.getElementById('gameBody'), gLevel=document.getElementById('gameLevel');
  let N=Math.max(2,S.levels.memory+1), trials=22+N*2, i=0;
  let seq=[], matchable=0, hits=0, falseA=0;
  gBody.innerHTML=`<div class="game-hint">Tap POSITION and/or COLOR if the current flash matches ${N} steps back. Blank beats are traps, don\u2019t use rhythm.</div><div class="grid9" id="ng">${Array(9).fill('<div class="cell"></div>').join('')}</div><div class="rot-controls"><button class="rot-btn" id="bPos">POSITION</button><button class="rot-btn" id="bCol">COLOR</button></div>`;
  const cells=[...document.querySelectorAll('#ng .cell')], bPos=document.getElementById('bPos'), bCol=document.getElementById('bCol');
  let cur={p:null,c:null}, responded={p:false,c:false};
  bPos.onclick=()=>{ if(responded.p)return; responded.p=true; const past=seq[seq.length-1-N]; if(past&&cur.p===past.p) hits++; else falseA++; vib(10); bPos.classList.add('correct'); };
  bCol.onclick=()=>{ if(responded.c)return; responded.c=true; const past=seq[seq.length-1-N]; if(past&&cur.c===past.c) hits++; else falseA++; vib(10); bCol.classList.add('correct'); };
  function tick(){
    if(i>=trials) return done();
    setProg(i,trials); gLevel.textContent=`N=${N} \u00b7 ${i+1}/${trials}`;
    responded={p:false,c:false}; bPos.classList.remove('correct'); bCol.classList.remove('correct');
    const blank = i>2 && Math.random()<Math.min(0.25,0.04*N);
    cells.forEach(c=>{c.classList.remove('lit'); c.style.background='';});
    if(blank){ cur={p:null,c:null}; }
    else {
      cur={ p:(Math.random()*9)|0, c:(Math.random()*4)|0 };
      const past=seq[seq.length-N]; if(past && (past.p===cur.p || past.c===cur.c)) matchable++;
      cells[cur.p].classList.add('lit'); cells[cur.p].style.background=COLORS[cur.c];
      setTimeout(()=>{ cells[cur.p]?.classList.remove('lit'); if(cells[cur.p]) cells[cur.p].style.background=''; }, 620);
    }
    seq.push(cur); i++;
    setTimeout(tick, 1750 + Math.random()*520 - N*55);
  }
  function done(){
    const acc=Math.max(0,Math.round(((hits/Math.max(1,matchable)) - falseA*0.035)*100));
    if(acc>=80) S.levels.memory=Math.min(9,N); else if(acc<50&&N>2) S.levels.memory=N-2;
    finish('\ud83c\udfaf',acc,2500,'hippo','memory', `${hits}/${matchable} hits`);
  }
  setTimeout(tick,450);
}