// A real anatomical brain: side-profile silhouette + cortical fold (gyri) curves +
// glowing impulses that travel along the folds. Rendered on canvas in the lavender
// palette, with a gentle breathing scale (no ball spin).

// Brain outline as a closed bezier path, authored in a 0..200 x 0..175 box.
function traceOutline(ctx){
  ctx.beginPath();
  ctx.moveTo(40, 96);
  ctx.bezierCurveTo(28, 74, 40, 44, 72, 36);   // upper-left forehead bulge
  ctx.bezierCurveTo(92, 22, 128, 22, 150, 36);  // crown
  ctx.bezierCurveTo(178, 48, 190, 74, 176, 96);  // upper-right (back of head)
  ctx.bezierCurveTo(190, 108, 184, 128, 166, 132); // occipital
  ctx.bezierCurveTo(170, 146, 156, 156, 140, 150); // cerebellum notch
  ctx.bezierCurveTo(132, 164, 112, 162, 108, 148); // brainstem area
  ctx.bezierCurveTo(96, 158, 74, 156, 70, 142);   // underside
  ctx.bezierCurveTo(50, 148, 34, 136, 40, 118);    // temporal lobe
  ctx.bezierCurveTo(30, 112, 30, 102, 40, 96);     // close to front
  ctx.closePath();
}
// Cortical fold curves (gyri) inside the outline. Each is a poly-bezier as flat point list.
const FOLDS = [
  [[62,58],[86,50],[104,64],[92,80],[112,92]],
  [[74,44],[100,40],[126,52],[120,72],[142,80]],
  [[52,84],[74,78],[88,94],[74,108],[92,118]],
  [[110,50],[134,58],[150,74],[138,92],[156,102]],
  [[64,110],[86,104],[100,120],[86,132],[104,138]],
  [[120,96],[142,102],[152,118],[138,130]],
  [[96,70],[114,82],[104,100],[122,110]]
];
function sampleFold(pts, t){
  // Catmull-Rom-ish sampling across the point list
  const seg = (pts.length-1) * t;
  const i = Math.min(pts.length-2, Math.floor(seg));
  const lt = seg - i;
  const a = pts[i], b = pts[i+1];
  return [a[0]+(b[0]-a[0])*lt, a[1]+(b[1]-a[1])*lt];
}
function strokeFold(ctx, pts){
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i=1;i<pts.length;i++){
    const prev=pts[i-1], cur=pts[i];
    const mx=(prev[0]+cur[0])/2, my=(prev[1]+cur[1])/2;
    ctx.quadraticCurveTo(prev[0], prev[1], mx, my);
  }
  ctx.lineTo(pts[pts.length-1][0], pts[pts.length-1][1]);
}

export function makeBrainPts(){ return []; } // kept for import compatibility

export function mountBrain(id, opt={}){
  const cv=document.getElementById(id); if(!cv) return;
  const ctx=cv.getContext('2d');
  const W=cv.width, H=cv.height;
  const BW=200, BH=175;
  const s=(opt.scale||1.05) * Math.min(W/BW, H/BH);
  const ox=(W - BW*s)/2, oy=(H - BH*s)/2;
  let impulses=[], lastSpawn=0, tm=0;
  function setup(){ ctx.setTransform(1,0,0,1,0,0); ctx.translate(ox,oy); ctx.scale(s,s); }
  (function draw(ts){
    tm+=0.016;
    const breath=1+0.012*Math.sin(tm*0.9);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.translate(W/2,H/2); ctx.scale(breath,breath); ctx.translate(-W/2,-H/2);
    ctx.translate(ox,oy); ctx.scale(s,s);

    // soft inner fill
    traceOutline(ctx);
    const g=ctx.createRadialGradient(100,80,10,100,90,120);
    g.addColorStop(0,'oklch(40% 0.11 300 / 0.42)');
    g.addColorStop(1,'oklch(22% 0.07 300 / 0.14)');
    ctx.fillStyle=g; ctx.fill();

    // outline stroke
    traceOutline(ctx);
    ctx.lineJoin='round';
    ctx.strokeStyle='oklch(80% 0.11 300 / 0.85)';
    ctx.lineWidth=2.2/1; ctx.shadowBlur=14; ctx.shadowColor='oklch(76% 0.13 300 / 0.6)';
    ctx.stroke();
    ctx.shadowBlur=0;

    // clip to brain and draw folds
    ctx.save();
    traceOutline(ctx); ctx.clip();
    ctx.strokeStyle='oklch(74% 0.10 300 / 0.5)';
    ctx.lineWidth=1.5;
    for(const f of FOLDS) strokeFold(ctx,f), ctx.stroke();

    // spawn + move impulses along random folds
    if(ts-lastSpawn>360){ lastSpawn=ts; impulses.push({f:(Math.random()*FOLDS.length)|0, t:0, sp:0.006+Math.random()*0.006}); if(impulses.length>14) impulses.shift(); }
    impulses.forEach(im=>im.t+=im.sp);
    impulses=impulses.filter(im=>im.t<=1);
    for(const im of impulses){
      const [px,py]=sampleFold(FOLDS[im.f], im.t);
      const a=Math.sin(im.t*Math.PI);
      const gr=ctx.createRadialGradient(px,py,0,px,py,6);
      gr.addColorStop(0,`oklch(95% 0.10 300 / ${0.95*a})`); gr.addColorStop(1,'transparent');
      ctx.fillStyle=gr; ctx.shadowBlur=12*a; ctx.shadowColor='oklch(88% 0.12 300)';
      ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur=0;
    ctx.restore();
    requestAnimationFrame(draw);
  })(0);
}