import { S, vib } from '../state.js?v=18';
import { openGame, setProg, startTimer, stopTimer, finish } from './engine.js?v=18';
function shape(seed=0){ const sets=[[[0,0],[1,0],[1,1],[2,1]],[[0,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[2,0],[1,1]],[[0,0],[1,0],[2,0],[2,1]]]; return sets[seed%sets.length]; }
function proj(cubes,rot=0,mirror=false){ const a=rot*Math.PI/180; const pts=[]; const tr=(x,y)=>{ let rx=x*Math.cos(a)-y*Math.sin(a), ry=x*Math.sin(a)+y*Math.cos(a); if(mirror) rx=-rx; return [rx,ry]; }; for(const [x,y] of cubes){ pts.push(tr(x,y)); } return pts; }
function drawIso(cubes,rot=0,mirror=false){ const s=20; const p=(x,y,z)=>[(x-y)*s*0.87,(x+y)*s*0.5-z*s]; let paths=''; for(const [cx,cy] of cubes){ const top=[p(cx,cy,1),p(cx+1,cy,1),p(cx+1,cy+1,1),p(cx,cy+1,1)]; const left=[p(cx,cy+1,1),p(cx,cy+1,0),p(cx,cy,0),p(cx,cy,1)]; const right=[p(cx+1,cy,1),p(cx+1,cy,0),p(cx+1,cy+1,0),p(cx+1,cy+1,1)]; const P=a=>a.map(pt=>pt.join(',')).join(' '); paths+=`<polygon points="${P(top)}" fill="oklch(74% 0.2 300)" stroke="oklch(36% 0.06 300)" stroke-width="1.5"/>`; paths+=`<polygon points="${P(left)}" fill="oklch(54% 0.16 300)" stroke="oklch(36% 0.06 300)" stroke-width="1.5"/>`; paths+=`<polygon points="${P(right)}" fill="oklch(42% 0.12 300)" stroke="oklch(36% 0.06 300)" stroke-width="1.5"/>`; } const mir=mirror?'scale(-1 1) translate(-10 0)':''; return `<svg viewBox="-70 -70 140 140"><g transform="rotate(${rot}) ${mir}">${paths}</g></svg>`; }
function drawTarget(cubes,rot=0,mirror=false){ const pts=proj(cubes,rot,mirror); let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9; pts.forEach(([x,y])=>{ minX=Math.min(minX,x); maxX=Math.max(maxX,x); minY=Math.min(minY,y); maxY=Math.max(maxY,y); }); const w=maxX-minX+1,h=maxY-minY+1; return `<svg viewBox="${minX-1} ${minY-1} ${w+2} ${h+2}">${pts.map(([x,y])=>`<rect x="${x-0.45}" y="${y-0.45}" width="0.9" height="0.9" rx="0.12" fill="none" stroke="oklch(84% 0.11 300)" stroke-width="0.12"/>`).join('')}</svg>`; }
export function startRotation(){
  openGame('Shadow Match');
  const gBody=document.getElementById('gameBody'), gLevel=document.getElementById('gameLevel');
  let lvl=S.levels.rotation, total=8, q=0, correct=0, rt=[];
  function newQ(){
    q++; if(q>total) return done();
    setProg(q-1,total); gLevel.textContent=`Lv ${lvl} \u00b7 ${q}/${total}`;
    const base=shape((Math.random()*4)|0);
    const angles=[0,45,90,135,180];
    const angle=angles[(Math.random()*Math.min(angles.length,2+Math.floor(lvl/2)))|0];
    const mirror=lvl>=5?Math.random()<0.4:false;
    const right=drawTarget(base,angle,mirror);
    const decoyA=drawTarget(base,(angle+45)%180,false);
    const decoyB=drawTarget(base,angle,lvl>=7?!mirror:!mirror);
    const opts=[right,decoyA,decoyB].sort(()=>Math.random()-0.5);
    const answer=opts.indexOf(right);
    gBody.innerHTML=`<div class="game-hint">Match the 3D form to its correct flat shadow. Mirror is not the same as rotation.</div><div class="rot-pair"><div class="rot-fig">${drawIso(base,angle,false)}</div><div class="rot-vs">TO</div><div class="rot-fig">?</div></div><div class="stroop-opts">${opts.map((o,i)=>`<button class="stroop-btn rot-opt" data-i="${i}">${o}</button>`).join('')}</div>`;
    let doneQ=false;
    const pick=(i,btn)=>{ if(doneQ)return; doneQ=true; rt.push(stopTimer()); document.querySelectorAll('.rot-opt').forEach(x=>x.style.pointerEvents='none'); if(i===answer){ correct++; btn.classList.add('correct'); vib(20); } else { btn.classList.add('wrong'); const t=document.querySelector(`.rot-opt[data-i="${answer}"]`); if(t)t.classList.add('correct'); vib([30,20,30]); } setTimeout(newQ,700); };
    document.querySelectorAll('.rot-opt').forEach(b=>b.onclick=()=>pick(+b.dataset.i,b));
    startTimer(Math.max(2600,5200-lvl*180),()=>{});
  }
  function done(){ const acc=Math.round(correct/total*100); const avg=rt.length?rt.reduce((a,b)=>a+b,0)/rt.length:9999; if(acc>=80) S.levels.rotation++; else if(acc<50&&S.levels.rotation>1) S.levels.rotation--; finish('\ud83d\udd2e',acc,avg,'parietal','rotation'); }
  newQ();
}