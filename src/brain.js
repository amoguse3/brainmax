// Creative brain: dual-lobe point cloud, glowing core, cortical folds, faint internal web, traveling neural impulses. Tint lerps between modes.
export const brainState = { hue:300, targetHue:300, chroma:0.11, targetChroma:0.11 };
export function makeBrainPts(N){
  const pts=[];
  for(let i=0;i<N;i++){
    const t=i/N;
    const phi=Math.acos(1-2*t);
    const th=Math.PI*(1+Math.sqrt(5))*i;
    let x=Math.sin(phi)*Math.cos(th), y=Math.sin(phi)*Math.sin(th), z=Math.cos(phi);
    x*=1.32; y*=0.96; z*=1.08;
    const fold=0.055*Math.sin(x*8.5)*Math.cos(z*8.5);
    if(Math.abs(x)<0.05) x += (x>=0?0.08:-0.08);
    if(y<-0.34) y=-0.34-(y+0.34)*0.45;
    pts.push({x:x+(x>0?fold:-fold), y:y+fold*0.5, z, ph:Math.random()*Math.PI*2, core:Math.hypot(x,y,z)<0.55});
  }
  return pts;
}
function buildEdges(pts){ const edges=[]; const maxD=0.34; for(let i=0;i<pts.length;i++){ let c=0; for(let j=i+1;j<pts.length && c<2;j++){ const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,dz=pts[i].z-pts[j].z; if(dx*dx+dy*dy+dz*dz < maxD*maxD){ edges.push([i,j]); c++; } } } return edges; }
export function mountBrain(id, opt={}){
  const cv=document.getElementById(id); if(!cv) return;
  const cx=cv.getContext('2d');
  const W=cv.width, H=cv.height;
  const N=opt.points||620, scale=opt.scale||168;
  const pts=makeBrainPts(N), edges=buildEdges(pts);
  let rot=0, tm=0, impulses=[], lastSpawn=0;
  (function draw(ts){
    rot+=0.004; tm+=0.02;
    brainState.hue += (brainState.targetHue-brainState.hue)*0.05;
    brainState.chroma += (brainState.targetChroma-brainState.chroma)*0.05;
    const hue=brainState.hue, chr=brainState.chroma;
    cx.clearRect(0,0,W,H);
    const cxp=W/2, cyp=H/2, cos=Math.cos(rot), sin=Math.sin(rot);
    // soft breathing core glow
    const pulse=0.5+0.5*Math.sin(tm*0.8);
    const cg=cx.createRadialGradient(cxp,cyp,0,cxp,cyp,scale*0.9);
    cg.addColorStop(0,`oklch(70% ${chr} ${hue} / ${0.12+pulse*0.06})`);
    cg.addColorStop(1,'transparent');
    cx.fillStyle=cg; cx.beginPath(); cx.arc(cxp,cyp,scale*0.9,0,Math.PI*2); cx.fill();
    const proj=pts.map(p=>{ const a=1+0.045*Math.sin(tm+p.ph); const rx=(p.x*a)*cos-(p.z*a)*sin; const rz=(p.x*a)*sin+(p.z*a)*cos; return {sx:cxp+rx*scale, sy:cyp-(p.y*a)*scale, depth:rz, core:p.core}; });
    cx.lineWidth=1;
    for(const e of edges){ const pa=proj[e[0]], pb=proj[e[1]]; const d=((pa.depth+pb.depth)/2+1.3)/2.6; cx.strokeStyle=`oklch(72% ${chr*0.8} ${hue} / ${0.015+d*0.07})`; cx.beginPath(); cx.moveTo(pa.sx,pa.sy); cx.lineTo(pb.sx,pb.sy); cx.stroke(); }
    const order=proj.map((_,i)=>i).sort((a,b)=>proj[a].depth-proj[b].depth);
    for(const i of order){ const p=proj[i]; const d=(p.depth+1.3)/2.6; const r=(p.core?1.4:1)+d*1.7; cx.beginPath(); cx.arc(p.sx,p.sy,r,0,Math.PI*2); cx.fillStyle=`oklch(${64+d*20}% ${0.09+d*0.05} ${hue} / ${0.2+d*0.62})`; cx.shadowBlur=d*6; cx.shadowColor=`oklch(76% ${chr} ${hue} / 0.6)`; cx.fill(); }
    cx.shadowBlur=0;
    if(ts-lastSpawn>200 && edges.length){ lastSpawn=ts; impulses.push({e:edges[(Math.random()*edges.length)|0], t:0, sp:0.010+Math.random()*0.012}); if(impulses.length>26) impulses.shift(); }
    impulses.forEach(im=>im.t+=im.sp); impulses=impulses.filter(im=>im.t<=1);
    for(const im of impulses){ const pa=proj[im.e[0]], pb=proj[im.e[1]]; const x=pa.sx+(pb.sx-pa.sx)*im.t, y=pa.sy+(pb.sy-pa.sy)*im.t; const a=Math.sin(im.t*Math.PI); const g=cx.createRadialGradient(x,y,0,x,y,8); g.addColorStop(0,`oklch(94% ${chr} ${hue} / ${0.9*a})`); g.addColorStop(1,'transparent'); cx.fillStyle=g; cx.shadowBlur=14*a; cx.shadowColor=`oklch(88% ${chr} ${hue})`; cx.beginPath(); cx.arc(x,y,8,0,Math.PI*2); cx.fill(); }
    cx.shadowBlur=0;
    requestAnimationFrame(draw);
  })(0);
}