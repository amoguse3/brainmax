// Point-cloud brain in the style of the reference: dots are scattered ALONG the cortical
// fold curves (so the cloud reads as a folded brain, not a random ball), nearby dots are
// linked with faint lines, and impulses travel across the mesh. Lavender palette.
// Authoring box 0..200 (x) by 0..180 (y), left-facing side profile.

function outline(ctx){
  ctx.beginPath();
  ctx.moveTo(36, 104);
  ctx.bezierCurveTo(26, 78, 34, 50, 62, 40);
  ctx.bezierCurveTo(88, 26, 126, 24, 152, 40);
  ctx.bezierCurveTo(178, 54, 186, 82, 170, 104);
  ctx.bezierCurveTo(184, 116, 178, 138, 158, 140);
  ctx.bezierCurveTo(160, 150, 150, 158, 138, 154);
  ctx.bezierCurveTo(140, 168, 122, 172, 116, 158);
  ctx.bezierCurveTo(100, 166, 74, 164, 66, 148);
  ctx.bezierCurveTo(46, 152, 32, 138, 40, 120);
  ctx.bezierCurveTo(30, 116, 28, 110, 36, 104);
  ctx.closePath();
}

// Fold spines: dots are seeded along these so the density traces the gyri.
const FOLDS = [
  [[46,98],[62,84],[56,68],[76,60],[70,46],[92,42]],
  [[42,116],[60,104],[54,88],[74,80],[70,64],[92,60]],
  [[52,132],[70,122],[64,106],[82,98],[78,82],[100,78]],
  [[74,144],[90,134],[84,118],[102,110],[98,92],[118,88]],
  [[98,148],[112,138],[106,122],[124,114],[120,96],[140,92]],
  [[122,146],[136,134],[128,118],[146,110],[142,92],[160,88]],
  [[150,132],[164,120],[156,104],[170,94],[164,78],[176,74]],
  [[92,42],[110,50],[128,48],[146,58],[160,76]],
  [[74,74],[92,80],[108,72],[124,78],[140,88]],
  [[86,98],[104,104],[120,96],[136,102],[150,110]],
  [[80,120],[100,126],[116,118],[132,124],[146,128]]
];
// central fissure spine (brighter)
const FISSURE = [[58,52],[86,42],[116,42],[146,54],[164,78],[162,100]];
// cerebellum spiral-ish cluster (lower back)
function cerebellumPts(){
  const out=[]; const cx=150, cy=140;
  for(let a=0;a<Math.PI*1.1;a+=0.28){
    for(let r=6;r<=16;r+=3){ out.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r*0.8]); }
  }
  return out;
}

function catmull(pts, t){
  const seg=(pts.length-1)*t; const i=Math.min(pts.length-2, Math.floor(seg)); const lt=seg-i;
  const p0=pts[Math.max(0,i-1)], p1=pts[i], p2=pts[i+1], p3=pts[Math.min(pts.length-1,i+2)];
  const q=(a,b,c,d)=>0.5*((2*b)+(-a+c)*lt+(2*a-5*b+4*c-d)*lt*lt+(-a+3*b-3*c+d)*lt*lt*lt);
  return [q(p0[0],p1[0],p2[0],p3[0]), q(p0[1],p1[1],p2[1],p3[1])];
}

// build the dot set once
function buildDots(){
  const dots=[];
  let seed=7; const rnd=()=>{ seed=(seed*9301+49297)%233280; return seed/233280; };
  const perFold=26;
  for(const f of FOLDS){
    for(let k=0;k<perFold;k++){
      const t=k/(perFold-1);
      const [x,y]=catmull(f,t);
      const jx=(rnd()-0.5)*4.5, jy=(rnd()-0.5)*4.5;
      dots.push({x:x+jx, y:y+jy, ph:rnd()*Math.PI*2, r:0.8+rnd()*1.4});
    }
  }
  for(const c of cerebellumPts()){
    dots.push({x:c[0]+(rnd()-0.5)*2, y:c[1]+(rnd()-0.5)*2, ph:rnd()*Math.PI*2, r:0.7+rnd()*1});
  }
  // a few filler dots so gaps read as tissue, still inside folds region
  for(let i=0;i<60;i++){
    const f=FOLDS[(rnd()*FOLDS.length)|0];
    const [x,y]=catmull(f, rnd());
    dots.push({x:x+(rnd()-0.5)*10, y:y+(rnd()-0.5)*10, ph:rnd()*Math.PI*2, r:0.6+rnd()*0.9});
  }
  return dots;
}
// neighbor links (computed once)
function buildLinks(dots){
  const links=[]; const maxD=13;
  for(let i=0;i<dots.length;i++){
    let c=0;
    for(let j=i+1;j<dots.length && c<3;j++){
      const dx=dots[i].x-dots[j].x, dy=dots[i].y-dots[j].y;
      if(dx*dx+dy*dy < maxD*maxD){ links.push([i,j]); c++; }
    }
  }
  return links;
}

export function makeBrainPts(){ return []; }

export function mountBrain(id, opt={}){
  const cv=document.getElementById(id); if(!cv) return;
  const ctx=cv.getContext('2d');
  const W=cv.width, H=cv.height, BW=200, BH=180;
  const s=(opt.scale||1.02)*Math.min(W/BW, H/BH);
  const ox=(W-BW*s)/2, oy=(H-BH*s)/2;
  const dots=buildDots();
  const links=buildLinks(dots);
  let tm=0, impulses=[], lastSpawn=0;
  (function draw(ts){
    tm+=0.016;
    const breath=1+0.012*Math.sin(tm*0.9);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.translate(W/2,H/2); ctx.scale(breath,breath); ctx.translate(-W/2,-H/2);
    ctx.translate(ox,oy); ctx.scale(s,s);

    // faint inner glow fill for volume
    outline(ctx);
    const g=ctx.createRadialGradient(96,84,10,100,96,120);
    g.addColorStop(0,'oklch(40% 0.11 300 / 0.30)');
    g.addColorStop(1,'oklch(20% 0.06 300 / 0.06)');
    ctx.fillStyle=g; ctx.fill();

    // link lines (soft)
    ctx.save();
    outline(ctx); ctx.clip();
    ctx.lineWidth=0.6;
    for(const [a,b] of links){
      const da=dots[a], db=dots[b];
      ctx.strokeStyle='oklch(74% 0.10 300 / 0.16)';
      ctx.beginPath(); ctx.moveTo(da.x,da.y); ctx.lineTo(db.x,db.y); ctx.stroke();
    }
    // dots
    for(const d of dots){
      const pulse=0.6+0.4*Math.sin(tm*1.4+d.ph);
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r*(0.85+pulse*0.3),0,Math.PI*2);
      ctx.fillStyle=`oklch(${78+pulse*10}% 0.11 300 / ${0.5+pulse*0.4})`;
      ctx.shadowBlur=3+pulse*3; ctx.shadowColor='oklch(80% 0.12 300 / 0.6)';
      ctx.fill();
    }
    ctx.shadowBlur=0;
    // impulses travel across links
    if(ts-lastSpawn>240 && links.length){ lastSpawn=ts; impulses.push({l:(Math.random()*links.length)|0, t:0, sp:0.02+Math.random()*0.02}); if(impulses.length>18) impulses.shift(); }
    impulses.forEach(im=>im.t+=im.sp);
    impulses=impulses.filter(im=>im.t<=1);
    for(const im of impulses){
      const [a,b]=links[im.l]; const da=dots[a], db=dots[b];
      const x=da.x+(db.x-da.x)*im.t, y=da.y+(db.y-da.y)*im.t;
      const al=Math.sin(im.t*Math.PI);
      const gr=ctx.createRadialGradient(x,y,0,x,y,5);
      gr.addColorStop(0,`oklch(96% 0.10 300 / ${0.95*al})`); gr.addColorStop(1,'transparent');
      ctx.fillStyle=gr; ctx.shadowBlur=10*al; ctx.shadowColor='oklch(88% 0.12 300)';
      ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur=0;

    // central fissure as brighter dotted spine
    for(let t=0;t<=1;t+=0.045){
      const [x,y]=catmull(FISSURE,t);
      ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2);
      ctx.fillStyle='oklch(88% 0.11 300 / 0.8)'; ctx.fill();
    }
    ctx.restore();

    // outline
    outline(ctx);
    ctx.strokeStyle='oklch(82% 0.11 300 / 0.55)'; ctx.lineWidth=1.6; ctx.lineJoin='round';
    ctx.shadowBlur=12; ctx.shadowColor='oklch(76% 0.13 300 / 0.5)'; ctx.stroke(); ctx.shadowBlur=0;

    requestAnimationFrame(draw);
  })(0);
}