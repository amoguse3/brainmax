import { S } from './state.js';
import { stack, setStack, available } from './data/compounds.js';

const ZONES=[
  {key:'frontal',name:'Calculation'},
  {key:'parietal',name:'Spatial'},
  {key:'hippo',name:'Memory'},
  {key:'creative',name:'Creativity'},
  {key:'reason',name:'Reasoning'}
];
let stackBrainGlow=[0,0,0,0,0];

function installComparisonStyles(){
  if(document.getElementById('stackComparisonStyles'))return;
  const style=document.createElement('style');
  style.id='stackComparisonStyles';
  style.textContent=`
    .stack-compare{width:min(100%,390px);margin:4px auto 18px;border-block:1px solid var(--line);padding:16px 0 8px}
    .stack-compare-head{display:grid;grid-template-columns:minmax(0,1fr) 72px 84px;gap:10px;align-items:end;margin-bottom:8px}
    .stack-compare-head b{font-size:.82rem}.stack-compare-head span{color:var(--text-3);font:.5rem 'JetBrains Mono',monospace;text-align:right;text-transform:uppercase;letter-spacing:.07em}
    .stack-stat-row{display:grid;grid-template-columns:minmax(0,1fr) 72px 84px;gap:10px;align-items:center;min-height:38px;border-top:1px solid color-mix(in oklab,var(--line) 72%,transparent)}
    .stack-stat-row:first-child{border-top:0}.stack-stat-name{color:var(--text-2);font-size:.7rem}.stack-stat-base,.stack-stat-modeled{font:700 .72rem 'JetBrains Mono',monospace;text-align:right;font-variant-numeric:tabular-nums}.stack-stat-base{color:var(--text-3)}.stack-stat-modeled{color:var(--blend)}
    .stack-delta{display:inline-block;min-width:32px;margin-left:5px;color:var(--blend-cool);font-size:.5rem}
    .stack-model-note{margin:9px 0 0;color:var(--text-3);font-size:.58rem;line-height:1.45}
    @media(max-width:360px){.stack-compare-head,.stack-stat-row{grid-template-columns:minmax(0,1fr) 58px 75px;gap:7px}.stack-stat-name{font-size:.64rem}}
  `;
  document.head.appendChild(style);
}
function ensureComparison(){
  installComparisonStyles();
  const host=document.querySelector('.stack-const');
  if(!host||document.getElementById('stackCompare'))return;
  const panel=document.createElement('section');
  panel.id='stackCompare';
  panel.className='stack-compare';
  panel.innerHTML='<div class="stack-compare-head"><b>Brain profile</b><span>Baseline</span><span>With stack</span></div><div id="stackCompareRows"></div><p class="stack-model-note">Modeled display only. Stack values are not measured cognitive effects or medical claims.</p>';
  host.insertAdjacentElement('afterend',panel);
}
function modeledProfile(){
  const boostByZone=[0,0,0,0,0];
  stack.forEach(item=>{boostByZone[item.zone]+=item.b;});
  return ZONES.map((zone,index)=>{
    const base=Math.round(S.zones[zone.key]||0);
    const delta=Math.min(18,Math.round(boostByZone[index]*.65));
    return{...zone,base,delta,value:Math.min(100,base+delta)};
  });
}
function renderComparison(){
  ensureComparison();
  const rows=document.getElementById('stackCompareRows');
  if(!rows)return;
  const profile=modeledProfile();
  const avg=Math.round(profile.reduce((sum,item)=>sum+item.base,0)/profile.length);
  const modeledAvg=Math.round(profile.reduce((sum,item)=>sum+item.value,0)/profile.length);
  rows.innerHTML=[...profile,{name:'Overall profile',base:avg,value:modeledAvg,delta:modeledAvg-avg}].map(item=>`<div class="stack-stat-row"><span class="stack-stat-name">${item.name}</span><span class="stack-stat-base">${item.base}</span><span class="stack-stat-modeled">${item.value}<i class="stack-delta">+${item.delta}</i></span></div>`).join('');
}
export function stackNodePos(i,total){const cx=.5,cy=.5,angle=i/total*Math.PI*2-Math.PI/2;return[cx+Math.cos(angle)*.36,cy+Math.sin(angle)*.34];}
export function mountStackBrain(makeBrainPts){
  const canvas=document.getElementById('stackBrain'),context=canvas.getContext('2d'),width=canvas.width,height=canvas.height,points=makeBrainPts(420),anchors=[[-.7,.5],[.7,.5],[-.6,-.4],[.6,-.4],[0,.7]];let rotation=0;
  (function draw(){context.clearRect(0,0,width,height);rotation+=.005;const cx=width/2,cy=height/2,scale=88,cos=Math.cos(rotation),sin=Math.sin(rotation),projected=points.map(point=>{const x=point.x*cos-point.z*sin,z=point.x*sin+point.z*cos;let glow=0;anchors.forEach((anchor,index)=>{const distance=Math.hypot(point.x-anchor[0],point.y-anchor[1]);glow+=stackBrainGlow[index]*Math.max(0,1-distance/.9);});return{x:cx+x*scale,y:cy-point.y*scale,depth:z,glow:Math.min(1,glow)};}).sort((a,b)=>a.depth-b.depth);projected.forEach(point=>{const depth=(point.depth+1.3)/2.6,radius=1+depth*1.8+point.glow*1.5;context.beginPath();context.arc(point.x,point.y,radius,0,Math.PI*2);context.fillStyle=`oklch(${62+depth*15+point.glow*22}% ${.16+point.glow*.06} ${292-point.glow*18} / ${.25+depth*.55+point.glow*.3})`;context.fill();});requestAnimationFrame(draw);})();
}
export function renderStack(){
  const host=document.querySelector('.stack-const');host.querySelectorAll('.snode').forEach(node=>node.remove());let total=0;stackBrainGlow=[0,0,0,0,0];
  stack.forEach((item,index)=>{total+=item.b;stackBrainGlow[item.zone]=Math.min(1,stackBrainGlow[item.zone]+item.b/12);const[x,y]=stackNodePos(index,stack.length),element=document.createElement('div');element.className='snode';element.style.left=x*100+'%';element.style.top=y*100+'%';element.innerHTML=`<div class="snode-badge ${item.bcls}">${item.ab}</div><div class="snode-nm">${item.nm}</div><div class="snode-b">+${item.b}%</div>`;element.onclick=()=>{setStack(stack.filter(entry=>entry.id!==item.id));renderStack();};host.appendChild(element);});
  document.getElementById('synergyVal').textContent='+'+total+'%';document.getElementById('effCount').textContent=stack.length;document.getElementById('effTotal').textContent='+'+total+'%';document.getElementById('stackStat').textContent='+'+total+'%';const top=stack.slice().sort((a,b)=>b.b-a.b)[0];document.getElementById('effTop').textContent=top?top.nm:'--';renderComparison();
}
export function renderOpts(){const box=document.getElementById('compoundOpts');box.innerHTML='';const inStack=new Set(stack.map(item=>item.id));available.filter(item=>!inStack.has(item.id)).forEach(item=>{const element=document.createElement('div');element.className='compound-opt';element.innerHTML=`<div><div class="co-n">${item.nm}</div><div class="co-d">${item.ds}</div></div><span class="co-add">+</span>`;element.onclick=()=>{setStack([...stack,item]);renderStack();document.getElementById('modalBack').classList.remove('open');};box.appendChild(element);});if(!box.children.length)box.innerHTML='<div class="co-d">All compounds added.</div>';}
