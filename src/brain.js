export function makeBrainPts(N){
  const pts=[];
  for(let i=0;i<N;i++){
    const t=i/N, phi=Math.acos(1-2*t), th=Math.PI*(1+Math.sqrt(5))*i;
    let x=Math.sin(phi)*Math.cos(th), y=Math.sin(phi)*Math.sin(th), z=Math.cos(phi);
    x*=1.25; y*=0.82; z*=1.05;
    if(Math.abs(x)<0.08) y*=0.9;
    if(y<-0.3) y=-0.3-(y+0.3)*0.4;
    const w=0.06*Math.sin(x*9)*Math.cos(z*9);
    pts.push({x:x+(x>0?w:-w), y:y+w*0.5, z, ph:Math.random()*Math.PI*2});
  }
  return pts;
}
export function animateBrain(canvas, pts, opts={}){
  const cx=canvas.getContext('2d'), W=canvas.width, H=canvas.height;
  let rot=0, tm=0;
  function draw(){
    cx.clearRect(0,0,W,H); rot += opts.rotStep || 0.006; tm += 0.02;
    const cxp=W/2, cyp=H/2, scale=opts.scale || 100, cos=Math.cos(rot), sin=Math.sin(rot);
    const proj=pts.map(p=>{
      const anom=1+0.08*Math.sin(tm+p.ph);
      const rx=(p.x*anom)*cos-(p.z*anom)*sin;
      const rz=(p.x*anom)*sin+(p.z*anom)*cos;
      return { sx:cxp+rx*scale, sy:cyp-(p.y*anom)*scale, depth:rz, p };
    });
    proj.sort((a,b)=>a.depth-b.depth);
    proj.forEach(p=>{
      const d=(p.depth+1.3)/2.6, r=1+d*(opts.radiusMul||1.9);
      cx.beginPath(); cx.arc(p.sx,p.sy,r,0,Math.PI*2);
      cx.fillStyle=`oklch(${62+d*22}% ${0.2+d*0.06} 300 / ${0.25+d*0.7})`;
      cx.shadowBlur=d*(opts.shadowMul||8); cx.shadowColor=opts.shadowColor || 'oklch(72% 0.24 300 / 0.7)'; cx.fill();
    });
    cx.shadowBlur=0; requestAnimationFrame(draw);
  }
  draw();
}