import { S, vib } from '../state.js?v=18';
import { openGame, setProg, startTimer, stopTimer, finish, adapt } from './engine.js?v=18';
const COLORS=[['RED','oklch(64% 0.16 20)'],['GREEN','oklch(78% 0.14 150)'],['BLUE','oklch(66% 0.15 255)'],['GOLD','oklch(80% 0.12 85)']];
export function startStroop(){
  openGame('Rule Switch');
  const gBody=document.getElementById('gameBody'), gLevel=document.getElementById('gameLevel');
  const lvl=S.levels.stroop, total=14; let q=0, correct=0, rt=[];
  function targetOf(iI, rule){ return rule==='ink' ? COLORS[iI][0] : COLORS[(iI+2)%4][0]; }
  function newQ(){
    q++; if(q>total) return done();
    const rule = lvl<2 ? 'ink' : (lvl<4 ? (q%2?'ink':'opp') : (Math.random()<0.5?'ink':'opp'));
    setProg(q-1,total); gLevel.textContent=`Lv ${lvl} \u00b7 ${q}/${total}`;
    const wI=(Math.random()*4)|0; let iI=(Math.random()*4)|0; if(Math.random()<0.8&&iI===wI) iI=(iI+1)%4;
    const word=COLORS[wI][0], ink=COLORS[iI][1], target=targetOf(iI,rule);
    const border = rule==='ink' ? '1.5px solid oklch(74% 0.10 300 / 0.5)' : '1.5px dashed oklch(74% 0.10 300 / 0.5)';
    const opts=[...COLORS].sort(()=>Math.random()-0.5);
    gBody.innerHTML=`<div class="game-hint">SOLID border = ink color, DASH border = opposite</div><div class="stroop-word" style="color:${ink};border:${border};padding:12px 24px;border-radius:18px">${word}</div><div class="stroop-opts">${opts.map(o=>`<button class="stroop-btn" data-c="${o[0]}">${o[0]}</button>`).join('')}</div>`;
    let answered=false;
    const pick=(c,btn)=>{ if(answered)return; answered=true; rt.push(stopTimer()); document.querySelectorAll('.stroop-btn').forEach(x=>x.style.pointerEvents='none'); if(c===target){ correct++; if(btn)btn.classList.add('correct'); vib(20); } else { if(btn)btn.classList.add('wrong'); const t=document.querySelector(`.stroop-btn[data-c="${target}"]`); if(t)t.classList.add('correct'); vib([30,20,30]); } setTimeout(newQ,480); };
    document.querySelectorAll('.stroop-btn').forEach(b=>b.onclick=()=>pick(b.dataset.c,b));
    startTimer(Math.max(1600,3600-lvl*150),()=>pick('__',null));
  }
  function done(){ const acc=Math.round(correct/total*100); const avg=rt.length?rt.reduce((a,b)=>a+b,0)/rt.length:9999; adapt('stroop',acc); finish('\ud83c\udfa8',acc,avg,'frontal','stroop'); }
  newQ();
}