import { S } from './state.js';
import { goTo } from './nav.js';

const STACK_POSITIONS=[[16,24],[84,24],[16,80],[84,80],[50,10],[50,90]];
function injectStyles(){
 if(document.getElementById('engagementStyles'))return;
 const style=document.createElement('style');style.id='engagementStyles';style.textContent=`
 .view[data-view="stats"],.view[data-view="stack"]{position:relative;padding-top:8px!important}.view[data-view="stack"] .screen-head{display:none}
 .stats-toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;width:min(100%,390px);min-height:44px;margin:4px auto 0;padding:5px 6px;border:1px solid var(--line);border-radius:12px;background:var(--matte);position:relative;z-index:12}
 .stats-mode-switch{display:grid;grid-template-columns:1fr 1fr;gap:2px;min-width:0;padding:2px;border-radius:9px;background:oklch(14.5% .032 300)}
 .stats-mode-switch button{min-width:0;min-height:34px;padding:0 13px;border:0;border-radius:7px;background:transparent;color:var(--text-3);font-size:.59rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;touch-action:manipulation}
 .stats-mode-switch button.active{background:var(--blend);color:oklch(17% .035 300)}
 .star-bank{display:grid;grid-template-columns:auto auto;align-items:center;gap:7px;min-width:82px;min-height:34px;padding:4px 7px;border-left:1px solid var(--line);color:var(--text);font-family:'JetBrains Mono',monospace;pointer-events:none}
 .star-bank::before{content:'✦';color:var(--blend);font-size:.8rem}.star-value{font-size:.7rem;font-weight:700;font-variant-numeric:tabular-nums}
 .constellation,.stack-const{margin-top:0!important}.stack-const canvas#stackLines{display:none}.stack-const{height:430px}.stack-brain{top:52%;z-index:3}#stackBrain{width:174px;height:158px}.stack-flow{position:absolute;inset:0;z-index:2;width:100%;height:100%;pointer-events:none}.snode{z-index:4}
 @media(max-width:360px){.stats-toolbar{gap:6px}.stats-mode-switch button{padding-inline:9px}.star-bank{min-width:72px;padding-inline:5px}}
 `;document.head.appendChild(style);
}
function viewIndex(name){
 const views=[...document.querySelectorAll('.view')].filter(view=>view.dataset.view!=='protocol');
 return Math.max(0,views.findIndex(view=>view.dataset.view===name));
}
function createToolbar(view,active){
 if(!view)return null;
 const toolbar=document.createElement('div');toolbar.className='stats-toolbar';
 toolbar.innerHTML=`<div class="stats-mode-switch"><button type="button" data-screen="stats" class="${active==='stats'?'active':''}">Stats</button><button type="button" data-screen="stack" class="${active==='stack'?'active':''}">Stack</button></div><div class="star-bank" aria-label="Neural points"><span class="star-value">${Math.max(0,Number(S.stars)||0).toLocaleString()}</span></div>`;
 toolbar.querySelector('[data-screen="stats"]').addEventListener('click',event=>{event.stopPropagation();goTo(viewIndex('stats'));});
 toolbar.querySelector('[data-screen="stack"]').addEventListener('click',event=>{event.stopPropagation();goTo(viewIndex('stack'));});
 view.prepend(toolbar);return toolbar;
}
function applyStackPositions(){document.querySelectorAll('.stack-const .snode').forEach((node,index)=>{const pos=STACK_POSITIONS[index]||[50+Math.cos(index)*36,50+Math.sin(index)*38];node.style.left=pos[0]+'%';node.style.top=pos[1]+'%';});}
function initStackFlow(){
 const host=document.querySelector('.stack-const');if(!host||host.querySelector('.stack-flow'))return;
 const canvas=document.createElement('canvas');canvas.className='stack-flow';host.appendChild(canvas);
 const context=canvas.getContext('2d'),particles=Array.from({length:18},(_,index)=>({target:index,phase:Math.random(),speed:.025+Math.random()*.025,bend:(Math.random()-.5)*70,size:.7+Math.random()}));
 function resize(){canvas.width=host.offsetWidth;canvas.height=host.offsetHeight;}
 function draw(now){const nodes=[...host.querySelectorAll('.snode')];context.clearRect(0,0,canvas.width,canvas.height);if(nodes.length){const start={x:canvas.width/2,y:canvas.height*.52};particles.forEach(p=>{const node=nodes[p.target%nodes.length],end={x:node.offsetLeft,y:node.offsetTop},raw=((now/1000)*p.speed+p.phase)%1,t=raw*raw*(3-2*raw),back=1-t,control={x:(start.x+end.x)/2+p.bend,y:(start.y+end.y)/2-18},x=back*back*start.x+2*back*t*control.x+t*t*end.x,y=back*back*start.y+2*back*t*control.y+t*t*end.y,alpha=Math.min(1,raw*5,(1-raw)*5)*.55;context.beginPath();context.arc(x,y,p.size,0,Math.PI*2);context.fillStyle=`oklch(82% .1 282 / ${alpha})`;context.fill();});}requestAnimationFrame(draw);}
 new MutationObserver(applyStackPositions).observe(host,{childList:true});applyStackPositions();resize();window.addEventListener('resize',resize);requestAnimationFrame(draw);
}
export function initEngagement(){
 if(document.documentElement.dataset.engagementReady)return;
 document.documentElement.dataset.engagementReady='true';injectStyles();
 createToolbar(document.querySelector('.view[data-view="stats"]'),'stats');
 createToolbar(document.querySelector('.view[data-view="stack"]'),'stack');
 initStackFlow();
}
