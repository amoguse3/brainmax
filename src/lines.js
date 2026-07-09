export function initCurveCanvas(canvas){
  const p=canvas.parentElement; canvas.width=p.offsetWidth; canvas.height=p.offsetHeight; return canvas;
}
export function animLines(state,color){
  if(!state) return;
  const cv=state.cv, cx=cv.getContext('2d'), bx=cv.width/2, by=cv.height/2, t=Date.now()/1000;
  cx.clearRect(0,0,cv.width,cv.height);
  state.nodes.forEach(([nx,ny],idx)=>{
    const x=nx*cv.width,y=ny*cv.height,bxc=(bx+x)/2+(y-by)*0.32,byc=(by+y)/2-(x-bx)*0.32;
    cx.strokeStyle=color.base; cx.lineWidth=2.5; cx.shadowBlur=12; cx.shadowColor=color.glow; cx.globalAlpha=0.5;
    cx.beginPath(); cx.moveTo(bx,by); cx.quadraticCurveTo(bxc,byc,x,y); cx.stroke(); cx.globalAlpha=1;
    const prog=((t*0.18+idx*0.2)%1);
    const px=(1-prog)*(1-prog)*bx+2*(1-prog)*prog*bxc+prog*prog*x;
    const py=(1-prog)*(1-prog)*by+2*(1-prog)*prog*byc+prog*prog*y;
    const grad=cx.createRadialGradient(px,py,0,px,py,10);
    grad.addColorStop(0,color.pulse); grad.addColorStop(1,'transparent');
    cx.fillStyle=grad; cx.shadowBlur=16; cx.shadowColor=color.glow; cx.beginPath(); cx.arc(px,py,10,0,Math.PI*2); cx.fill();
  });
  cx.shadowBlur=0; requestAnimationFrame(()=>animLines(state,color));
}