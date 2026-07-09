// Constellation lines that DRAW ON as a dot travels each one, pop a burst at the node,
// hold, then evaporate and redraw one by one. Only runs while state.active() is true.
function easeOut(x){ x=Math.min(1,Math.max(0,x)); return 1-Math.pow(1-x,3); }
function freshLife(i){ return { phase:'wait', t:0, delay:i*0.42+Math.random()*0.3, draw:0.7, burst:0.35, hold:2.6+Math.random()*2.4, out:0.9, gone:1.0+Math.random()*2.0 }; }
function step(L,dt){ L.t+=dt; const to=(next,ph)=>{ L.phase=ph; L.t=0; if(ph==='in-again'){} }; if(L.phase==='wait'){ if(L.t>=L.delay){L.phase='draw';L.t=0;} } else if(L.phase==='draw'){ if(L.t>=L.draw){L.phase='burst';L.t=0;} } else if(L.phase==='burst'){ if(L.t>=L.burst){L.phase='hold';L.t=0;} } else if(L.phase==='hold'){ if(L.t>=L.hold){L.phase='out';L.t=0;} } else if(L.phase==='out'){ if(L.t>=L.out){L.phase='gone';L.t=0;} } else if(L.phase==='gone'){ if(L.t>=L.gone){ L.phase='draw'; L.t=0; L.hold=2.6+Math.random()*2.4; L.gone=1.0+Math.random()*2.0; } } }
function bez(p0,p1,c,t){ const u=1-t; return u*u*p0 + 2*u*t*c + t*t*p1; }
export function animConstellation(state, palette){
  const cv=state.cv;
  if(!cv){ requestAnimationFrame(()=>animConstellation(state,palette)); return; }
  const cx=cv.getContext('2d');
  const now=performance.now();
  if(state.last==null) state.last=now;
  const dt=Math.min(0.05,(now-state.last)/1000); state.last=now;
  if(!state.active()){ if(!state.cleared){ cx.clearRect(0,0,cv.width,cv.height); state.cleared=true; state.life=null; } requestAnimationFrame(()=>animConstellation(state,palette)); return; }
  state.cleared=false;
  const nodes=state.getNodes();
  if(!state.life || state.life.length!==nodes.length){ state.life=nodes.map((_,i)=>freshLife(i)); }
  const bx=cv.width/2, by=cv.height*0.5;
  cx.clearRect(0,0,cv.width,cv.height);
  nodes.forEach((nd,i)=>{
    const L=state.life[i]; step(L,dt);
    if(L.phase==='wait'||L.phase==='gone') return;
    const x=nd[0]*cv.width, y=nd[1]*cv.height;
    const cxq=(bx+x)/2+(y-by)*0.28, cyq=(by+y)/2-(x-bx)*0.28;
    let head=1, alpha=1;
    if(L.phase==='draw'){ head=easeOut(L.t/L.draw); }
    else if(L.phase==='out'){ alpha=1-easeOut(L.t/L.out); }
    // draw trail from hub to head
    cx.globalAlpha=1; cx.lineWidth=1.8; cx.shadowBlur=9*alpha; cx.shadowColor=palette.glow;
    cx.strokeStyle=palette.base.replace('A',(0.55*alpha).toFixed(3));
    cx.beginPath(); cx.moveTo(bx,by);
    const seg=Math.max(2,Math.round(head*20));
    for(let s=1;s<=seg;s++){ const tt=head*(s/seg); cx.lineTo(bez(bx,x,cxq,tt), bez(by,y,cyq,tt)); }
    cx.stroke();
    // traveling head dot while drawing
    if(L.phase==='draw'){ const hx=bez(bx,x,cxq,head), hy=bez(by,y,cyq,head); const g=cx.createRadialGradient(hx,hy,0,hx,hy,7); g.addColorStop(0,palette.pulse.replace('A','0.95')); g.addColorStop(1,'transparent'); cx.fillStyle=g; cx.shadowBlur=14; cx.shadowColor=palette.glow; cx.beginPath(); cx.arc(hx,hy,7,0,Math.PI*2); cx.fill(); }
    // burst ring at node when the dot arrives
    if(L.phase==='burst'){ const b=L.t/L.burst; const rr=4+b*16; cx.globalAlpha=(1-b); cx.strokeStyle=palette.pulse.replace('A',(1-b).toFixed(3)); cx.lineWidth=2; cx.shadowBlur=12; cx.shadowColor=palette.glow; cx.beginPath(); cx.arc(x,y,rr,0,Math.PI*2); cx.stroke(); cx.globalAlpha=1; }
    // steady node glow while present
    if(L.phase==='burst'||L.phase==='hold'||L.phase==='out'){ const g=cx.createRadialGradient(x,y,0,x,y,6); g.addColorStop(0,palette.pulse.replace('A',(0.85*alpha).toFixed(3))); g.addColorStop(1,'transparent'); cx.fillStyle=g; cx.shadowBlur=12*alpha; cx.shadowColor=palette.glow; cx.beginPath(); cx.arc(x,y,6,0,Math.PI*2); cx.fill(); }
  });
  cx.globalAlpha=1; cx.shadowBlur=0;
  requestAnimationFrame(()=>animConstellation(state,palette));
}