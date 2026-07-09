// Brain-shaped point cloud: wide, flat-bottomed, split into two hemispheres by a central
// fissure, gently swaying front-facing (small tilt) instead of spinning like a ball.
export function makeBrainPts(N){
  const pts=[];
  for(let i=0;i<N;i++){
    const t=i/N;
    const phi=Math.acos(1-2*t);
    const th=Math.PI*(1+Math.sqrt(5))*i;
    let x=Math.sin(phi)*Math.cos(th), y=Math.sin(phi)*Math.sin(th), z=Math.cos(phi);
    // brain proportions: wide (x), medium tall (y), deep (z)
    x*=1.42; y*=0.9; z*=1.12;
    // flatten the underside so the base is not a round ball
    if(y<-0.15) y = -0.15 + (y+0.15)*0.5;
    // lift a slight dome on top
    if(y>0.4) y = 0.4 + (y-0.4)*1.15;
    // central fissure: push points away from the x=0 midline into two hemispheres
    const side = x>=0 ? 1 : -1;
    x += side*0.12;
    // cortical folds
    const w=0.05*Math.sin(x*7)*Math.cos(z*7);
    pts.push({x:x+side*Math.abs(w), y:y+w*0.4, z, ph:Math.random()*Math.PI*2});
  }
  return pts;
}
function buildEdges(pts){
  const edges=[]; const maxD=0.42;
  for(let i=0;i<pts.length;i++){
    let c=0;
    for(let j=i+1;j<pts.length && c<3;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,dz=pts[i].z-pts[j].z;
      if(dx*dx+dy*dy+dz*dz < maxD*maxD){ edges.push([i,j]); c++; }
    }
  }
  return edges;
}
export function mountBrain(id, opt={}){
  const cv=document.getElementById(id); if(!cv) return;
  const cx=cv.getContext('2d');
  const W=cv.width, H=cv.height;
  const N=opt.points||640;
  const scale=opt.scale||150;
  const pts=makeBrainPts(N);
  const edges=buildEdges(pts);
  let tm=0, impulses=[], lastSpawn=0;
  (function draw(ts){
    tm+=0.016;
    // gentle front-facing sway: small yaw + tiny pitch, never a full spin
    const yaw = Math.sin(tm*0.5)*0.42;
    const pitch = Math.sin(tm*0.34)*0.10;
    cx.clearRect(0,0,W,H);
    const cxp=W/2, cyp=H/2;
    const cy=Math.cos(yaw), sy=Math.sin(yaw);
    const cp=Math.cos(pitch), sp=Math.sin(pitch);
    const proj=pts.map(p=>{
      const breath=1+0.04*Math.sin(tm+p.ph);
      let x=p.x*breath, y=p.y*breath, z=p.z*breath;
      // yaw around vertical axis
      let rx=x*cy - z*sy;
      let rz=x*sy + z*cy;
      // pitch around horizontal axis
      let ry=y*cp - rz*sp;
      rz=y*sp + rz*cp;
      return {sx:cxp+rx*scale, sy:cyp-ry*scale, depth:rz};
    });
    cx.lineWidth=1;
    for(const e of edges){
      const pa=proj[e[0]], pb=proj[e[1]];
      const d=((pa.depth+pb.depth)/2+1.3)/2.6;
      cx.strokeStyle=`oklch(72% 0.10 300 / ${0.02+d*0.08})`;
      cx.beginPath(); cx.moveTo(pa.sx,pa.sy); cx.lineTo(pb.sx,pb.sy); cx.stroke();
    }
    const order=proj.map((_,i)=>i).sort((a,b)=>proj[a].depth-proj[b].depth);
    for(const i of order){
      const p=proj[i]; const d=(p.depth+1.3)/2.6; const r=1+d*1.7;
      cx.beginPath(); cx.arc(p.sx,p.sy,r,0,Math.PI*2);
      cx.fillStyle=`oklch(${64+d*20}% ${0.10+d*0.045} 300 / ${0.22+d*0.6})`;
      cx.shadowBlur=d*6; cx.shadowColor='oklch(74% 0.13 300 / 0.6)'; cx.fill();
    }
    cx.shadowBlur=0;
    if(ts-lastSpawn>210 && edges.length){ lastSpawn=ts; impulses.push({e:edges[(Math.random()*edges.length)|0], t:0, sp:0.010+Math.random()*0.013}); if(impulses.length>28) impulses.shift(); }
    impulses.forEach(im=>im.t+=im.sp);
    impulses=impulses.filter(im=>im.t<=1);
    for(const im of impulses){
      const pa=proj[im.e[0]], pb=proj[im.e[1]];
      const x=pa.sx+(pb.sx-pa.sx)*im.t, y=pa.sy+(pb.sy-pa.sy)*im.t;
      const a=Math.sin(im.t*Math.PI);
      const g=cx.createRadialGradient(x,y,0,x,y,8);
      g.addColorStop(0,`oklch(93% 0.11 300 / ${0.9*a})`); g.addColorStop(1,'transparent');
      cx.fillStyle=g; cx.shadowBlur=14*a; cx.shadowColor='oklch(86% 0.12 300)';
      cx.beginPath(); cx.arc(x,y,8,0,Math.PI*2); cx.fill();
    }
    cx.shadowBlur=0;
    requestAnimationFrame(draw);
  })(0);
}