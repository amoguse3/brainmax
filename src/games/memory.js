import { S, vib } from '../state.js';
import { openGame, setProg, startTimer, stopTimer, finish } from './engine.js';
// Dual N-back: each trial lights one of 9 cells in one of 4 colors. Decide if the CURRENT
// position and/or color matches the one N steps back. Executive load = broad transfer.
// Adaptive: hit-rate >=80% over the round -> N up, <50% -> N down.
const COLORS=[['oklch(80% 0.12 300)','L'],['oklch(78% 0.11 265)','B'],['oklch(80% 0.11 200)','C'],['oklch(82% 0.10 330)','P']];
export function startMemory(){
  openGame('Dual N-back');
  const gBody=document.getElementById('gameBody'), gLevel=document.getElementById('gameLevel');
  let N=Math.max(2, S.levels.memory+1);
  const trials=20+N*2;
  const seq=[]; let i=0;
  let posMatchable=0, colMatchable=0, posHit=0, colHit=0, posFA=0, colFA=0;
  let answeredPos=false, answeredCol=false;
  gBody.innerHTML=`<div class="game-hint">Match <b>${N} back</b>. Tap POSITION if the cell repeats from ${N} ago, COLOR if the color does.</div><div class="grid9" id="ng">${Array(9).fill('<div class="cell"></div>').join('')}</div><div class="rot-controls"><button class="rot-btn" id="bPos">POSITION</button><button class="rot-btn" id="bCol">COLOR</button></div>`;
  const cells=[...document.querySelectorAll('#ng .cell')];
  const bPos=document.getElementById('bPos'), bCol=document.getElementById('bCol');
  bPos.onclick=()=>{ if(answeredPos) return; answeredPos=true; bPos.classList.add('correct');
    const cur=seq[seq.length-1], past=seq[seq.length-1-N];
    if(past && cur.p===past.p) posHit++; else posFA++; vib(12); };
  bCol.onclick=()=>{ if(answeredCol) return; answeredCol=true; bCol.classList.add('correct');
    const cur=seq[seq.length-1], past=seq[seq.length-1-N];
    if(past && cur.c===past.c) colHit++; else colFA++; vib(12); };
  function step(){
    if(i>=trials) return done();
    setProg(i,trials); gLevel.textContent=`N=${N} \u00b7 ${i+1}/${trials}`;
    answeredPos=false; answeredCol=false;
    bPos.classList.remove('correct'); bCol.classList.remove('correct');
    const p=(Math.random()*9)|0, c=(Math.random()*4)|0;
    seq.push({p,c});
    if(seq.length>N){ const past=seq[seq.length-1-N]; if(past.p===p) posMatchable++; if(past.c===c) colMatchable++; }
    cells.forEach(x=>{x.classList.remove('lit'); x.style.background='';});
    cells[p].classList.add('lit'); cells[p].style.background=COLORS[c][0];
    i++;
    setTimeout(()=>{ cells[p].classList.remove('lit'); cells[p].style.background=''; }, Math.max(600,1100-N*40));
    startTimer(Math.max(1600,2600-N*80), ()=>{});
    gs_next=setTimeout(step, Math.max(2000,3000-N*100));
  }
  let gs_next=null;
  function done(){
    clearTimeout(gs_next);
    const posAcc = posMatchable? posHit/posMatchable : 1;
    const colAcc = colMatchable? colHit/colMatchable : 1;
    const faPen = (posFA+colFA)*0.04;
    const acc = Math.max(0, Math.round(((posAcc+colAcc)/2 - faPen)*100));
    if(acc>=80) S.levels.memory=Math.min(8,N); else if(acc<50 && N>2) S.levels.memory=N-2;
    finish('\ud83c\udfaf',acc,2500,'hippo','memory', `Position ${posHit}/${posMatchable} \u00b7 Color ${colHit}/${colMatchable}`);
  }
  setTimeout(step,400);
}