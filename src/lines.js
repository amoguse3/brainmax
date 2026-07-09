// Living constellation: lines self-draw, hold, evaporate one by one, then reappear.
function newLife(i){ return { phase:'wait', t:0, delay:i*0.55+Math.random()*0.5, inDur:1.0, hold:3+Math.random()*2.6, outDur:1.1, goneDur:1.0+Math.random()*2.2 }; }
function easeOut(x){ return 1-Math.pow(1-Math.min(1,Math.max(0,x)),3); }
function advance(L,dt){
  L.t+=dt;
  if(L.phase==='wait'){ if(L.t>=L.delay){ L.phase='in'; L.t=0; } }
  else if(L.phase==='in'){ if(L.t>=L.inDur){ L.phase='hold'; L.t=0; } }
  else if(L.phase==='hold'){ if(L.t>=L.hold){ L.phase='out'; L.t=0; } }
  else if(L.phase==='out'){ if(L.t>=L.outDur){ L.phase='gone'; L.t=0; } }
  else if(L.phase==='gone'){ if(L.t>=L.goneDur){ L.phase='in'; L.t=0; L.hold=3+Math.random()*2.6; L.goneDur=1.0+Math.random()*2.2; } }
}
function alphaFor(L){
  if(L.phase==='wait'||L.phase==='gone') return 0;
  if(L.phase==='in') return easeOut(L.t/L.inDur);
  if(L.phase==='hold') return 1;
  if(L.phase==='out') return 1-easeOut(L.t/L.outDur);
  return 0;
}
function nodesOf(state){ return state.getNodes ? state.getNodes() : state.nodes; }
export function animConstellation(state, palette){
  const cv=state.cv; if(!cv){ requestAnimationFrame(()=>animConstellation(state,palette)); return; }
  const cx=cv.getContext('2d');
  const now=performance.now();
  const nodes=nodesOf(state);
  if(!state.life || state.life.length!==nodes.length){ state.life=nodes.map((_,i)=>newLife(i)); state.last=now; }
  const dt=Math.min(0.05,(now-state.last)/1000); state.last=now;
  const bx=cv.width/2, by=cv.height*(state.hubY!=null?state.hubY:0.5);
  cx.clearRect(0,0,cv.width,cv.height);
  nodes.forEach((nd,i)=>{
    const L=state.life[i]; advance(L,dt);
    const a=alphaFor(L); if(a<=0.001) return;
    const x=nd[0]*cv.width, y=nd[1]*cv.height;
    const bxc=(bx+x)/2+(y-by)*0.3, byc=(by+y)/2-(x-bx)*0.3;
    cx.strokeStyle=palette.base.replace('A',(0.5*a).toFixed(3));
    cx.lineWidth=1.8; cx.shadowBlur=10*a; cx.shadowColor=palette.glow; cx.globalAlpha=1;
    cx.beginPath(); cx.moveTo(bx,by); cx.quadraticCurveTo(bxc,byc,x,y); cx.stroke();
    if(L.phase==='in'||L.phase==='hold'){
      const prog=((now/1000)*0.24+i*0.2)%1;
      const px=(1-prog)*(1-prog)*bx+2*(1-prog)*prog*bxc+prog*prog*x;
      const py=(1-prog)*(1-prog)*by+2*(1-prog)*prog*byc+prog*prog*y;
      const g=cx.createRadialGradient(px,py,0,px,py,8);
      g.addColorStop(0,palette.pulse.replace('A',(0.9*a).toFixed(3))); g.addColorStop(1,'transparent');
      cx.fillStyle=g; cx.shadowBlur=14*a; cx.shadowColor=palette.glow;
      cx.beginPath(); cx.arc(px,py,8,0,Math.PI*2); cx.fill();
    }
  });
  cx.shadowBlur=0;
  requestAnimationFrame(()=>animConstellation(state,palette));
}