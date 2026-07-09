// Bigger, fuller brain point-cloud with faint internal edges and traveling neural impulses.
export function makeBrainPts(N){
  const pts=[];
  for(let i=0;i<N;i++){
    const t=i/N;
    const phi=Math.acos(1-2*t);
    const th=Math.PI*(1+Math.sqrt(5))*i;
    let x=Math.sin(phi)*Math.cos(th), y=Math.sin(phi)*Math.sin(th), z=Math.cos(phi);
    x*=1.3; y*=0.94; z*=1.08;
    const w=0.05*Math.sin(x*8)*Math.cos(z*8); // cortical folds
    if(Math.abs(x)<0.06) x += (x>=0?0.07:-0.07); // central fissure gap
    pts.push({x:x+(x>0?w:-w), y:y+w*0.5, z, ph:Math.random()*Math.PI*2});
  }
  return pts;
}
function buildEdges(pts){
  const edges=[]; const maxD=0.4;
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
  let rot=0, tm=0, impulses=[], lastSpawn=0;
  (function draw(ts){
    rot+=0.0045; tm+=0.02;
    cx.clearRect(0,0,W,H);
    const cxp=W/2, cyp=H/2;
    const cos=Math.cos(rot), sin=Math.sin(rot);
    const proj=pts.map(p=>{
      const anom=1+0.05*Math.sin(tm+p.ph);
      const rx=(p.x*anom)*cos-(p.z*anom)*sin;
      const rz=(p.x*anom)*sin+(p.z*anom)*cos;
      return {sx:cxp+rx*scale, sy:cyp-(p.y*anom)*scale, depth:rz};
    });
    cx.lineWidth=1;
    for(const e of edges){
      const pa=proj[e[0]], pb=proj[e[1]];
      const d=((pa.depth+pb.depth)/2+1.3)/2.6;
      cx.strokeStyle=`oklch(72% 0.10 300 / ${0.02+d*0.09})`;
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