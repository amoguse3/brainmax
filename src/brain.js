// Brain from scratch, take 2. The key: the OUTLINE must be a bumpy, lobed silhouette
// (scalloped top, pointed frontal lobe, cerebellum notch) so it reads as a brain even
// as a blob. Dots + link lines fill that shape; impulses travel the mesh. Lavender.
// Authoring box 0..200 x 0..170, left-facing profile.

// Scalloped outline: hand-placed control points tracing gyri bumps around the perimeter.
const OUTLINE = [
  [40,92],            // front-bottom (frontal pole)
  [30,80],[42,72],    // frontal bulge
  [34,58],[50,54],    // upper frontal gyrus bump
  [46,42],[64,44],    // superior frontal bump
  [60,32],[80,36],    // crown bump 1
  [82,26],[100,32],   // crown bump 2
  [106,24],[124,32],  // crown bump 3
  [130,28],[148,38],  // parietal bump
  [156,34],[168,48],  // upper occipital bump
  [176,52],[178,68],  // occipital bulge
  [186,74],[176,88],  // back bump
  [184,98],[168,104], // occipital under
  [172,116],[156,118],// pre-cerebellum
  [162,130],[146,132],// cerebellum bump 1
  [150,144],[132,142],// cerebellum bump 2
  [134,156],[116,150],// brainstem
  [118,160],[100,152],// underside bump
  [96,158],[78,150],  // temporal under bump
  [72,156],[56,146],  // temporal lobe bump
  [44,150],[38,132],  // lower temporal
  [30,124],[40,112],  // front-under
  [30,104],[40,92]    // close
];

// fold spines (gyri) for dot seeding + fissure
const FOLDS = [
  [[46,96],[62,82],[56,66],[76,58],[70,46],[92,44]],
  [[42,114],[60,102],[54,86],[74,78],[70,62],[92,58]],
  [[52,130],[70,120],[64,104],[82,96],[78,80],[100,76]],
  [[74,142],[90,132],[84,116],[102,108],[98,90],[118,86]],
  [[98,146],[112,136],[106,120],[124,112],[120,94],[140,90]],
  [[122,144],[136,132],[128,116],[146,108],[142,90],[160,86]],
  [[150,128],[164,116],[156,100],[170,92],[164,76]],
  [[92,44],[110,52],[128,50],[146,60],[160,78]],
  [[74,72],[92,78],[108,70],[124,76],[140,86]],
  [[86,96],[104,102],[120,94],[136,100],[150,108]],
  [[80,118],[100,124],[116,116],[132,122],[146,126]]
];
const FISSURE = [[52,52],[82,42],[114,42],[146,54],[166,78],[164,100]];
function cerebellumPts(){ const out=[]; const cx=150,cy=138; for(let a=0;a<Math.PI*1.1;a+=0.26){ for(let r=5;r<=15;r+=3){ out.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r*0.8]); } } return out; }

function drawOutline(ctx){
  ctx.beginPath();
  ctx.moveTo(OUTLINE[0][0], OUTLINE[0][1]);
  for(let i=1;i<OUTLINE.length;i++){
    const prev=OUTLINE[i-1], cur=OUTLINE[i];
    const mx=(prev[0]+cur[0])/2, my=(prev[1]+cur[1])/2;
    ctx.quadraticCurveTo(prev[0],prev[1],mx,my);
  }
  ctx.closePath();
}
function catmull(pts,t){ const seg=(pts.length-1)*t; const i=Math.min(pts.length-2,Math.floor(seg)); const lt=seg-i; const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)]; const q=(a,b,c,d)=>0.5*((2*b)+(-a+c)*lt+(2*a-5*b+4*c-d)*lt*lt+(-a+3*b-3*c+d)*lt*lt*lt); return [q(p0[0],p1[0],p2[0],p3[0]),q(p0[1],p1[1],p2[1],p3[1])]; }

function buildDots(){
  const dots=[]; let seed=11; const rnd=()=>{ seed=(seed*9301+49297)%233280; return seed/233280; };
  const perFold=24;
  for(const f of FOLDS){ for(let k=0;k<perFold;k++){ const t=k/(perFold-1); const [x,y]=catmull(f,t); dots.push({x:x+(rnd()-0.5)*4,y:y+(rnd()-0.5)*4,ph:rnd()*6.28,r:0.8+rnd()*1.3}); } }
  for(const c of cerebellumPts()) dots.push({x:c[0]+(rnd()-0.5)*2,y:c[1]+(rnd()-0.5)*2,ph:rnd()*6.28,r:0.7+rnd()});
  for(let i=0;i<50;i++){ const f=FOLDS[(rnd()*FOLDS.length)|0]; const [x,y]=catmull(f,rnd()); dots.push({x:x+(rnd()-0.5)*9,y:y+(rnd()-0.5)*9,ph:rnd()*6.28,r:0.6+rnd()*0.8}); }
  return dots;
}
function buildLinks(dots){ const links=[]; const maxD=13; for(let i=0;i<dots.length;i++){ let c=0; for(let j=i+1;j<dots.length&&c<3;j++){ const dx=dots[i].x-dots[j].x,dy=dots[i].y-dots[j].y; if(dx*dx+dy*dy<maxD*maxD){ links.push([i,j]); c++; } } } return links; }

export function makeBrainPts(){ return []; }

export function mountBrain(id, opt={}){
  const cv=document.getElementById(id); if(!cv) return;
  const ctx=cv.getContext('2d');
  const W=cv.width, H=cv.height, BW=200, BH=170;
  const s=(opt.scale||1.02)*Math.min(W/BW,H/BH);
  const ox=(W-BW*s)/2, oy=(H-BH*s)/2;
  const dots=buildDots(); const links=buildLinks(dots);
  let tm=0, impulses=[], lastSpawn=0;
  (function draw(ts){
    tm+=0.016;
    const breath=1+0.012*Math.sin(tm*0.9);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.translate(W/2,H/2); ctx.scale(breath,breath); ctx.translate(-W/2,-H/2);
    ctx.translate(ox,oy); ctx.scale(s,s);

    drawOutline(ctx);
    const g=ctx.createRadialGradient(96,80,10,100,90,120);
    g.addColorStop(0,'oklch(40% 0.11 300 / 0.30)'); g.addColorStop(1,'oklch(20% 0.06 300 / 0.06)');
    ctx.fillStyle=g; ctx.fill();

    ctx.save(); drawOutline(ctx); ctx.clip();
    ctx.lineWidth=0.6;
    for(const [a,b] of links){ const da=dots[a],db=dots[b]; ctx.strokeStyle='oklch(74% 0.10 300 / 0.16)'; ctx.beginPath(); ctx.moveTo(da.x,da.y); ctx.lineTo(db.x,db.y); ctx.stroke(); }
    for(const d of dots){ const pulse=0.6+0.4*Math.sin(tm*1.4+d.ph); ctx.beginPath(); ctx.arc(d.x,d.y,d.r*(0.85+pulse*0.3),0,6.28); ctx.fillStyle=`oklch(${78+pulse*10}% 0.11 300 / ${0.5+pulse*0.4})`; ctx.shadowBlur=3+pulse*3; ctx.shadowColor='oklch(80% 0.12 300 / 0.6)'; ctx.fill(); }
    ctx.shadowBlur=0;
    if(ts-lastSpawn>240&&links.length){ lastSpawn=ts; impulses.push({l:(Math.random()*links.length)|0,t:0,sp:0.02+Math.random()*0.02}); if(impulses.length>18) impulses.shift(); }
    impulses.forEach(im=>im.t+=im.sp); impulses=impulses.filter(im=>im.t<=1);
    for(const im of impulses){ const [a,b]=links[im.l]; const da=dots[a],db=dots[b]; const x=da.x+(db.x-da.x)*im.t,y=da.y+(db.y-da.y)*im.t; const al=Math.sin(im.t*Math.PI); const gr=ctx.createRadialGradient(x,y,0,x,y,5); gr.addColorStop(0,`oklch(96% 0.10 300 / ${0.95*al})`); gr.addColorStop(1,'transparent'); ctx.fillStyle=gr; ctx.shadowBlur=10*al; ctx.shadowColor='oklch(88% 0.12 300)'; ctx.beginPath(); ctx.arc(x,y,5,0,6.28); ctx.fill(); }
    ctx.shadowBlur=0;
    for(let t=0;t<=1;t+=0.045){ const [x,y]=catmull(FISSURE,t); ctx.beginPath(); ctx.arc(x,y,1.5,0,6.28); ctx.fillStyle='oklch(88% 0.11 300 / 0.8)'; ctx.fill(); }
    ctx.restore();

    drawOutline(ctx);
    ctx.strokeStyle='oklch(82% 0.11 300 / 0.6)'; ctx.lineWidth=1.6; ctx.lineJoin='round';
    ctx.shadowBlur=12; ctx.shadowColor='oklch(76% 0.13 300 / 0.5)'; ctx.stroke(); ctx.shadowBlur=0;

    requestAnimationFrame(draw);
  })(0);
}