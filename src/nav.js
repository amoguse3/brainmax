import { applyTheme } from './theme.js';
import { vib } from './state.js';

const protocolView=document.querySelector('.view[data-view="protocol"]');
const protocolTab=document.getElementById('protoTab');
if(protocolView)protocolView.style.display='none';
if(protocolTab)protocolTab.style.display='none';

let current=0;
const track=document.getElementById('track');
const tabs=[...document.querySelectorAll('.tab')].filter(tab=>tab.id!=='protoTab');
const views=[...document.querySelectorAll('.view')].filter(view=>view.dataset.view!=='protocol');
const viewsEl=document.querySelector('.views');
const themeByView={stats:0,train:1,stack:2,learn:4};

export function getCurrent(){return current;}
export function goTo(index){
  current=Math.max(0,Math.min(views.length-1,index));
  track.style.transform=`translateX(-${current*100}%)`;
  tabs.forEach((tab,tabIndex)=>tab.classList.toggle('active',tabIndex===current));
  const view=views[current];
  applyTheme(themeByView[view.dataset.view]??current);
  if(view.classList.contains('enter')){
    view.classList.remove('enter');
    view.offsetHeight;
    view.classList.add('enter');
  }
  if(view.dataset.view==='learn')window.dispatchEvent(new CustomEvent('map:center'));
  vib(6);
}
export function bindNav(){
  tabs.forEach((tab,index)=>tab.addEventListener('click',()=>goTo(index)));
  let startX=0,startY=0,drag=false,axis=null;
  viewsEl.addEventListener('touchstart',event=>{
    if(event.target.closest('.tc-track')||event.target.closest('.map-vp'))return;
    startX=event.touches[0].clientX;
    startY=event.touches[0].clientY;
    drag=true;
    axis=null;
    track.style.transition='none';
  },{passive:true});
  viewsEl.addEventListener('touchmove',event=>{
    if(!drag)return;
    const dx=event.touches[0].clientX-startX,dy=event.touches[0].clientY-startY;
    if(axis===null)axis=Math.abs(dx)>Math.abs(dy)?'x':'y';
    if(axis==='x'){
      const base=-current*100,pct=dx/viewsEl.offsetWidth*100;
      const edge=(current===0&&dx>0)||(current===views.length-1&&dx<0);
      track.style.transform=`translateX(${base+pct*(edge?.35:1)}%)`;
    }
  },{passive:true});
  viewsEl.addEventListener('touchend',event=>{
    if(!drag)return;
    drag=false;
    track.style.transition='transform .56s var(--ease-enter, var(--smooth))';
    if(axis!=='x')return goTo(current);
    const dx=event.changedTouches[0].clientX-startX,threshold=viewsEl.offsetWidth*.2;
    if(dx<-threshold)goTo(current+1);
    else if(dx>threshold)goTo(current-1);
    else goTo(current);
  },{passive:true});
}
