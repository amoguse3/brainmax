import { S, vib } from '../state.js';
import { openGame, setProg, startTimer, stopTimer, finish, adapt } from './engine.js';
// Stroop with escalating rules: L1 tap ink color, L2 tap the OPPOSITE, L3+ the rule flips
// every few rounds (tests cognitive flexibility, not just inhibition). Timer tightens.
const COLORS=[['RED','oklch(64% 0.16 20)'],['GREEN','oklch(78% 0.14 150)'],['BLUE','oklch(66% 0.15 255)'],['GOLD','oklch(80% 0.12 85)']];
export function startStroop(){
  openGame('Stroop Focus');
  const gBody=document.getElementById('gameBody'), gLevel=document.getElementById('gameLevel');
  const lvl=S.levels.stroop, total=12; let q=0, correct=0, rt=[];
  let rule = 'ink'; // 'ink' = tap ink color, 'opp' = tap opposite of ink
  function maybeFlip(){ if(lvl>=3 && q>1 && q%3===0) rule = rule==='ink'?'opp':'ink'; else if(lvl===2) rule='opp'; }
  function newQ(){
    q++; if(q>total) return done();
    setProg(q-1,total); maybeFlip();
    gLevel.textContent=`Lv ${lvl} \u00b7 ${q}/${total}`;
    const wI=(Math.random()*4)|0; let iI=(Math.random()*4)|0; if(Math.random()<0.75&&iI===wI) iI=(iI+1)%4;
    const word=COLORS[wI][0], ink=COLORS[iI][1], inkName=COLORS[iI][0];
    const target = rule==='ink' ? inkName : COLORS[(iI+2)%4][0];
    const hint = rule==='ink' ? 'Tap the INK color' : 'Tap the OPPOSITE of the ink';
    const opts=[...COLORS].sort(()=>Math.random()-0.5);
    gBody.innerHTML=`<div class="game-hint">${hint}</div><div class="stroop-word" style="color:${ink}">${word}</div><div class="stroop-opts">${opts.map(o=>`<button class="stroop-btn" data-c="${o[0]}">${o[0]}</button>`).join('')}</div>`;
    let answered=false;
    const pick=(c,btn)=>{ if(answered) return; answered=true; rt.push(stopTimer());
      document.querySelectorAll('.stroop-btn').forEach(x=>x.style.pointerEvents='none');
      if(c===target){ correct++; if(btn)btn.classList.add('correct'); vib(20); }
      else { if(btn)btn.classList.add('wrong'); const t=document.querySelector(`.stroop-btn[data-c="${target}"]`); if(t)t.classList.add('correct'); vib([30,20,30]); }
      setTimeout(newQ,480);
    };
    document.querySelectorAll('.stroop-btn').forEach(b=>b.onclick=()=>pick(b.dataset.c,b));
    startTimer(Math.max(1800,3800-lvl*160),()=>pick('__',null));
  }
  function done(){
    const acc=Math.round(correct/total*100);
    const avg=rt.length?rt.reduce((a,b)=>a+b,0)/rt.length:9999;
    adapt('stroop',acc);
    finish('\ud83c\udfa8',acc,avg,'frontal','stroop');
  }
  newQ();
}