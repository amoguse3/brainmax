import { stack, setStack, available } from './data/compounds.js';
export function stackNodePos(i,total){ const cx=0.5,cy=0.5; const ang=(i/total)*Math.PI*2 - Math.PI/2; const rx=0.38,ry=0.36; return [cx+Math.cos(ang)*rx, cy+Math.sin(ang)*ry]; }
export function renderStack(){
  const host=document.getElementById('stackNodes'); if(!host) return;
  host.innerHTML='';
  let total=0;
  stack.forEach((s,i)=>{ total+=s.b; const [nx,ny]=stackNodePos(i,stack.length); const el=document.createElement('div'); el.className='snode'; el.style.left=(nx*100)+'%'; el.style.top=(ny*100)+'%'; el.innerHTML=`<div class="snode-badge">${s.ab}</div><div class="snode-nm">${s.nm}</div><div class="snode-b">+${s.b}%</div>`; el.onclick=()=>{ setStack(stack.filter(x=>x.id!==s.id)); renderStack(); }; host.appendChild(el); });
  const set=(id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=val; };
  set('synergyVal','+'+total+'%'); set('effCount',stack.length); set('effTotal','+'+total+'%'); set('stackStat','+'+total+'%');
  const top=stack.slice().sort((a,b)=>b.b-a.b)[0]; set('effTop', top?top.nm:'--');
}
export function renderOpts(){ const box=document.getElementById('compoundOpts'); box.innerHTML=''; const inStack=new Set(stack.map(s=>s.id)); available.filter(a=>!inStack.has(a.id)).forEach(a=>{ const el=document.createElement('div'); el.className='compound-opt'; el.innerHTML=`<div><div class="co-n">${a.nm}</div><div class="co-d">${a.ds}</div></div><span class="co-add">+</span>`; el.addEventListener('click',()=>{ setStack([...stack,a]); renderStack(); document.getElementById('modalBack').classList.remove('open'); }); box.appendChild(el); }); if(!box.children.length) box.innerHTML='<div style="color:var(--text-3);font-size:0.85rem;padding:20px 0;text-align:center">All compounds added.</div>'; }