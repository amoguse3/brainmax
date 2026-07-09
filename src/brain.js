// Brain, rebuilt from scratch. Anatomical left-side profile drawn on canvas:
//  - smooth cranial silhouette (frontal -> parietal -> occipital -> temporal -> underside)
//  - central (Sylvian/longitudinal) fissure splitting the top into two masses
//  - dense cortical folds (gyri) as wavy curves filling each region
//  - cerebellum cluster at the lower back + brainstem stub
//  - lavender palette, soft breathing, and glowing impulses travelling along the folds
// Authoring box is 0..200 (x) by 0..180 (y).

function outline(ctx){
  ctx.beginPath();
  ctx.moveTo(36, 104);
  // frontal lobe (left/front)
  ctx.bezierCurveTo(26, 78, 34, 50, 62, 40);
  // crown / top
  ctx.bezierCurveTo(88, 26, 126, 24, 152, 40);
  // upper back (parietal)
  ctx.bezierCurveTo(178, 54, 186, 82, 170, 104);
  // occipital bulge (back)
  ctx.bezierCurveTo(184, 116, 178, 138, 158, 140);
  // cerebellum notch
  ctx.bezierCurveTo(160, 150, 150, 158, 138, 154);
  // brainstem
  ctx.bezierCurveTo(140, 168, 122, 172, 116, 158);
  // underside / temporal base
  ctx.bezierCurveTo(100, 166, 74, 164, 66, 148);
  ctx.bezierCurveTo(46, 152, 32, 138, 40, 120);
  ctx.bezierCurveTo(30, 116, 28, 110, 36, 104);
  ctx.closePath();
}

// central fissure line (front-top curving to back), splits hemispheres
const FISSURE = [[58,52],[86,42],[116,42],[146,54],[164,78],[162,100]];

// cortical folds (gyri). Each entry is a wavy poly-line filling a region.
const FOLDS = [
  [[48,92],[64,80],[58,66],[76,58],[70,44]],
  [[44,110],[62,100],[56,86],[74,78],[70,64]],
  [[52,128],[70,120],[64,104],[82,96],[78,82]],
  [[72,140],[90,132],[84,116],[102,108],[98,92]],
  [[96,146],[112,136],[106,120],[124,112],[120,96]],
  [[120,144],[136,132],[128,116],[146,108],[142,92]],
  [[150,130],[164,118],[156,102],[170,92],[164,78]],
  [[92,60],[110,52],[128,58],[140,74]],
  [[74,72],[92,78],[104,70],[120,76]],
  [[86,96],[104,102],[118,94],[134,100]],
  [[80,118],[100,124],[116,116],[132,122]]
];

// cerebellum: tight stacked arcs at lower-back
const CEREBELLUM = { cx:150, cy:138, r:16, lines:5 };

function strokeWavy(ctx, pts){
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i=1;i<pts.length;i++){
    const prev=pts[i-1], cur=pts[i];
    const mx=(prev[0]+cur[0])/2, my=(prev[1]+cur[1])/2;
    ctx.quadraticCurveTo(prev[0], prev[1], mx, my);
  }
  const last=pts[pts.length-1];
  ctx.lineTo(last[0], last[1]);
}
function strokePoly(ctx, pts){
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]);
}
function sampleFold(pts, t){
  const seg=(pts.length-1)*t;
  const i=Math.min(pts.length-2, Math.floor(seg));
  const lt=seg-i; const a=pts[i], b=pts[i+1];
  return [a[0]+(b[0]-a[0])*lt, a[1]+(b[1]-a[1])*lt];
}

export function makeBrainPts(){ return []; } // import compat

export function mountBrain(id, opt={}){
  const cv=document.getElementById(id); if(!cv) return;
  const ctx=cv.getContext('2d');
  const W=cv.width, H=cv.height, BW=200, BH=180;
  const s=(opt.scale||1.02)*Math.min(W/BW, H/BH);
  const ox=(W-BW*s)/2, oy=(H-BH*s)/2;
  let tm=0, impulses=[], lastSpawn=0;
  (function draw(ts){
    tm+=0.016;
    const breath=1+0.012*Math.sin(tm*0.9);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.translate(W/2,H/2); ctx.scale(breath,breath); ctx.translate(-W/2,-H/2);
    ctx.translate(ox,oy); ctx.scale(s,s);

    // fill
    outline(ctx);
    const g=ctx.createRadialGradient(96,84,12,100,96,120);
    g.addColorStop(0,'oklch(42% 0.11 300 / 0.44)');
    g.addColorStop(1,'oklch(20% 0.06 300 / 0.12)');
    ctx.fillStyle=g; ctx.fill();

    // folds + fissure clipped inside
    ctx.save();
    outline(ctx); ctx.clip();
    ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.strokeStyle='oklch(74% 0.10 300 / 0.5)'; ctx.lineWidth=1.6;
    for(const f of FOLDS){ strokeWavy(ctx,f); ctx.stroke(); }
    // cerebellum arcs
    ctx.strokeStyle='oklch(70% 0.10 300 / 0.55)'; ctx.lineWidth=1.4;
    for(let i=0;i<CEREBELLUM.lines;i++){
      const rr=CEREBELLUM.r - i*3;
      ctx.beginPath(); ctx.arc(CEREBELLUM.cx,CEREBELLUM.cy,rr,Math.PI*0.15,Math.PI*0.95); ctx.stroke();
    }
    // central fissure, brighter
    strokeWavy(ctx,FISSURE);
    ctx.strokeStyle='oklch(82% 0.11 300 / 0.75)'; ctx.lineWidth=2; ctx.shadowBlur=8; ctx.shadowColor='oklch(78% 0.13 300 / 0.5)'; ctx.stroke(); ctx.shadowBlur=0;

    // impulses along folds
    if(ts-lastSpawn>340){ lastSpawn=ts; impulses.push({f:(Math.random()*FOLDS.length)|0, t:0, sp:0.006+Math.random()*0.006}); if(impulses.length>16) impulses.shift(); }
    impulses.forEach(im=>im.t+=im.sp);
    impulses=impulses.filter(im=>im.t<=1);
    for(const im of impulses){
      const [px,py]=sampleFold(FOLDS[im.f], im.t);
      const a=Math.sin(im.t*Math.PI);
      const gr=ctx.createRadialGradient(px,py,0,px,py,6);
      gr.addColorStop(0,`oklch(96% 0.10 300 / ${0.95*a})`); gr.addColorStop(1,'transparent');
      ctx.fillStyle=gr; ctx.shadowBlur=12*a; ctx.shadowColor='oklch(88% 0.12 300)';
      ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur=0;
    ctx.restore();

    // outline on top
    outline(ctx);
    ctx.strokeStyle='oklch(82% 0.11 300 / 0.9)'; ctx.lineWidth=2.4; ctx.lineJoin='round';
    ctx.shadowBlur=14; ctx.shadowColor='oklch(76% 0.13 300 / 0.6)'; ctx.stroke(); ctx.shadowBlur=0;

    requestAnimationFrame(draw);
  })(0);
}