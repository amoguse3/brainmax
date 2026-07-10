import { S, vib } from '../state.js';
import { openGame, finish } from './engine.js';
// Creative Flow -> Bridge Forge. Alternate Uses + forced constraint cards. Each prompt asks for
// uses that bridge two distant domains, which kills the obvious-answer loop.
const OBJECTS=['a brick','a spoon','an umbrella','a bottle','a rope','a newspaper'];
const CONSTRAINTS=['must help in music','must work underwater','must help a child learn','must solve a social problem','must be used silently','must fit in a pocket'];
function cat(s){ s=s.toLowerCase(); if(/music|song|instrument|sound|beat/.test(s))return 'music'; if(/teach|learn|school|memory|study/.test(s))return 'learning'; if(/water|rain|underwater|boat/.test(s))return 'water'; if(/social|people|share|team|community/.test(s))return 'social'; if(/art|design|draw|paint/.test(s))return 'art'; return 'other'; }
export function startCreative(){
  openGame('Bridge Forge');
  const gBody=document.getElementById('gameBody'), gLevel=document.getElementById('gameLevel');
  const obj=OBJECTS[(Math.random()*OBJECTS.length)|0], cons=CONSTRAINTS[(Math.random()*CONSTRAINTS.length)|0];
  let ideas=[]; const cats={};
  gBody.innerHTML=`<div class="game-hint">Give uses for <b>${obj}</b> that ${cons}. Weird beats obvious.</div><div class="cr-prompt">${obj}</div><div class="cr-sub" id="crCoach">Bridge distant categories. Don\u2019t stay literal.</div><div class="cr-count" id="crCount">0</div><div class="cr-count-l">ideas</div><div class="cr-inputrow"><input class="cr-field" id="crField" placeholder="a surprising use\u2026" autocomplete="off"><button class="cr-send" id="crSend">+</button></div><div class="cr-list" id="crList"></div>`;
  gLevel.textContent='45s';
  const field=document.getElementById('crField'), list=document.getElementById('crList'), coach=document.getElementById('crCoach');
  function add(){
    const v=field.value.trim(); if(v.length<3) return;
    if(ideas.some(x=>x.toLowerCase()===v.toLowerCase())){ field.value=''; return; }
    ideas.push(v); document.getElementById('crCount').textContent=ideas.length;
    const c=cat(v); cats[c]=(cats[c]||0)+1;
    const chip=document.createElement('div'); chip.className='cr-chip'; chip.textContent=v; list.prepend(chip); field.value=''; vib(10);
    if(cats[c]>=3) coach.textContent=`You\u2019re stuck in ${c}. Jump to another domain.`; else coach.textContent='Good. Now give something that sounds a bit impossible.';
  }
  document.getElementById('crSend').onclick=add; field.addEventListener('keydown',e=>{ if(e.key==='Enter') add(); }); setTimeout(()=>field.focus(),200);
  let t0=Date.now(), timer=setInterval(()=>{ const left=Math.ceil(45-(Date.now()-t0)/1000); gLevel.textContent=Math.max(0,left)+'s'; if(left<=0){ clearInterval(timer); done(); } },250);
  function done(){
    const flu=ideas.length, flex=Object.keys(cats).length, orig=ideas.filter(v=>v.split(/\s+/).length>=5).length;
    const acc=Math.min(100, flu*6 + flex*10 + orig*4);
    if(acc>=80) S.levels.creative++; else if(acc<50&&S.levels.creative>1) S.levels.creative--;
    finish('\ud83c\udf00',acc,2500,'creative','creative', `${flu} ideas \u00b7 ${flex} categories`);
  }
}