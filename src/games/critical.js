import { S, vib } from '../state.js';
import { openGame, setProg, finish, adapt } from './engine.js';
// Critical Thinking -> Relation Forge, inspired by Syllogimous/RFT. Nonsense terms remove
// world-knowledge crutches. Step 1 solve relation, step 2 explain the logic.
const ITEMS=[
  {prem:['All DAX are MIP','No MIP are TOV','Some LER are DAX'],q:'Which statement must be true?',opts:['Some LER are not TOV','All LER are TOV','No LER are DAX','Some TOV are DAX'],a:0,key:['because','all dax are mip','no mip are tov','therefore','not tov']},
  {prem:['All VEK are NUL','Some NUL are RAS','No RAS are POM'],q:'Which can be true?',opts:['Some VEK are not POM','All VEK are POM','No NUL are RAS','Some POM are RAS'],a:0,key:['some','can be','not forced','compatible']},
  {prem:['Left of A is B','Right of B is C','Left of C is D'],q:'Which order is possible?',opts:['A-B-D-C','B-A-D-C','B-A-C-D','D-C-A-B'],a:1,key:['b left','a between','d left of c']},
  {prem:['If X then Y','If Y then Z','Not Z'],q:'Best conclusion?',opts:['Not X','X','Maybe Y','Z'],a:0,key:['contrapositive','if x then y then z','not z','not x']},
  {prem:['Some KEP are RON','All RON are FEX','No FEX are LUM'],q:'Which must be false?',opts:['Some KEP are LUM','Some KEP are not LUM','Some RON are FEX','No LUM are RON'],a:0,key:['ron are fex','no fex lum','therefore']}
];
export function startCritical(){
  openGame('Relation Forge');
  const gBody=document.getElementById('gameBody'), gLevel=document.getElementById('gameLevel');
  const total=5; let q=0, score=0; const pool=[...ITEMS].sort(()=>Math.random()-0.5).slice(0,total);
  function step(){
    if(q>=total) return done();
    const it=pool[q]; q++; setProg(q-1,total); gLevel.textContent=`${q}/${total}`;
    const opts=it.opts.map((o,i)=>({o,ok:i===it.a})).sort(()=>Math.random()-0.5);
    gBody.innerHTML=`<div class="game-hint">Build the relation map. Ignore meaning, follow structure.</div><div class="ct-scenario">${it.prem.join('<br>')}</div><div class="ct-q">${it.q}</div><div class="ct-opts">${opts.map(o=>`<button class="ct-btn" data-ok="${o.ok}">${o.o}</button>`).join('')}</div>`;
    let picked=false;
    document.querySelectorAll('.ct-btn').forEach(b=>b.onclick=()=>{ if(picked)return; picked=true; document.querySelectorAll('.ct-btn').forEach(x=>x.style.pointerEvents='none'); const right=b.dataset.ok==='true'; if(right){ score+=0.5; b.classList.add('correct'); vib(18); } else { b.classList.add('wrong'); document.querySelector('.ct-btn[data-ok="true"]')?.classList.add('correct'); vib([30,20,30]); } setTimeout(()=>explain(it),650); });
  }
  function explain(it){
    gBody.innerHTML=`<div class="game-hint">Explain why in one line</div><div class="ct-scenario">${it.prem.join('<br>')}</div><div class="cr-inputrow"><input class="cr-field" id="ctField" placeholder="why?" autocomplete="off"><button class="cr-send" id="ctSend">\u2192</button></div><div class="cr-sub" id="ctFb" style="margin-top:14px"></div>`;
    const field=document.getElementById('ctField'); setTimeout(()=>field.focus(),150);
    const submit=()=>{ const v=field.value.trim().toLowerCase(); const hits=it.key.filter(k=>v.includes(k)).length; if(hits>=2) score+=0.5; else if(hits===1) score+=0.25; document.getElementById('ctFb').textContent = hits>=2 ? 'Yep, that\u2019s the structure.' : 'Closer. Name the relation chain next time.'; vib(10); setTimeout(step,900); };
    document.getElementById('ctSend').onclick=submit; field.addEventListener('keydown',e=>{ if(e.key==='Enter') submit(); });
  }
  function done(){ const acc=Math.round(score/total*100); adapt('critical',acc); finish('\ud83e\udde9',acc,4000,'reason','critical'); }
  step();
}