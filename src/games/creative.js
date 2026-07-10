import { S, vib } from '../state.js';
import { openGame, stopTimer, finish } from './engine.js';
// Alternative Uses Task. Local scoring approximates fluency (count), flexibility (distinct
// categories) and originality (rare/长er, multi-word, non-obvious). A live coach nudges you
// out of ruts. Swappable for a real LLM scorer later.
const OBJECTS=['a brick','a paperclip','a shoe','a spoon','an umbrella','a rubber band','a bottle','a key','a towel','a newspaper'];
const COMMON=['build','wall','open','hold','carry','hit','throw','clean','wipe','cut','dig','weapon','doorstop','decorate'];
function categoryOf(s){ s=s.toLowerCase(); if(/art|paint|draw|decor|sculpt|music/.test(s))return 'art'; if(/weapon|fight|hit|defend|throw/.test(s))return 'weapon'; if(/clean|wipe|scrub|dust/.test(s))return 'clean'; if(/build|construct|fix|tool|repair/.test(s))return 'build'; if(/game|play|toy|sport/.test(s))return 'play'; if(/cook|food|eat|kitchen/.test(s))return 'food'; return 'other'; }
export function startCreative(){
  openGame('Creative Flow');
  const gBody=document.getElementById('gameBody'), gLevel=document.getElementById('gameLevel');
  const obj=OBJECTS[(Math.random()*OBJECTS.length)|0];
  let ideas=[];
  gBody.innerHTML=`<div class="game-hint">Name as many uses as you can in 45s. Weird beats obvious.</div><div class="cr-prompt">${obj}</div><div class="cr-sub" id="crCoach">Fluency, flexibility, originality all count.</div><div class="cr-count" id="crCount">0</div><div class="cr-count-l">ideas</div><div class="cr-inputrow"><input class="cr-field" id="crField" placeholder="a use for ${obj}\u2026" autocomplete="off"><button class="cr-send" id="crSend">+</button></div><div class="cr-list" id="crList"></div>`;
  gLevel.textContent='45s';
  const field=document.getElementById('crField'), list=document.getElementById('crList'), coach=document.getElementById('crCoach');
  const cats={};
  function add(){
    const v=field.value.trim(); if(v.length<2) return;
    if(ideas.some(x=>x.toLowerCase()===v.toLowerCase())){ field.value=''; return; }
    ideas.push(v); document.getElementById('crCount').textContent=ideas.length;
    const cat=categoryOf(v); cats[cat]=(cats[cat]||0)+1;
    const chip=document.createElement('div'); chip.className='cr-chip'; chip.textContent=v; list.prepend(chip); field.value=''; vib(10);
    const common=COMMON.some(c=>v.toLowerCase().includes(c));
    if(common) coach.textContent='Too safe. Try something absurd or from another domain.';
    else if(cats[cat]>=3) coach.textContent='You\u2019re stuck in \u201c'+cat+'\u201d. Jump to a new category.';
    else coach.textContent='Nice, that\u2019s an original angle. Keep pushing.';
  }
  document.getElementById('crSend').onclick=add;
  field.addEventListener('keydown',e=>{ if(e.key==='Enter') add(); });
  setTimeout(()=>field.focus(),200);
  let t0=Date.now(), timer=setInterval(()=>{ const left=Math.ceil(45-(Date.now()-t0)/1000); gLevel.textContent=Math.max(0,left)+'s'; if(left<=0){ clearInterval(timer); done(); } },250);
  function done(){
    field.blur();
    const fluency=ideas.length;
    const flexibility=Object.keys(cats).length;
    const orig=ideas.filter(v=>!COMMON.some(c=>v.toLowerCase().includes(c))).length;
    const origWords=ideas.filter(v=>v.trim().split(/\s+/).length>=3).length;
    const raw=fluency*6 + flexibility*8 + orig*4 + origWords*3;
    const acc=Math.min(100,raw);
    if(fluency>=8) S.levels.creative++; else if(fluency<4 && S.levels.creative>1) S.levels.creative--;
    finish('\ud83c\udf00',acc,2500,'creative','creative', `${fluency} ideas \u00b7 ${flexibility} categories \u00b7 ${orig} original`);
  }
}