// True 3D point-cloud brain: two hemispheres, central fissure, cortical mesh,
// depth sorting and perspective rotation. No fake 2D squash.
const TAU=Math.PI*2,instances=[];let raf=0;
function rng(seed=73){return()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)}
function buildBrain(){const r=rng(),pts=[];let guard=0;
 // Surface shell of two overlapping 3D hemispheres.
 while(pts.length<560&&guard++<30000){const x=r()*1.8-.9,y=r()*1.75-.88,z=r()*1.18-.59;const side=x<0?-1:1,cx=side*.34;let d=Math.pow((x-cx)/.61,2)+Math.pow((y+.06)/.82,2)+Math.pow(z/.55,2);const folds=.055*Math.sin(x*18+z*9)*Math.cos(y*17-z*7)+.025*Math.sin(y*31+x*8);d+=folds;
  const fissure=Math.abs(x)<(.055+.035*Math.max(0,-y))&&y<.58;const tapered=y>.48&&Math.abs(x)>.68-(y-.48)*.45;
  if(d>.72&&d<1.04&&!fissure&&!tapered){const gyri=.5+.5*Math.sin(x*21+y*13+z*17)*Math.sin(y*19-z*11);pts.push({x,y,z,r:.7+r()*1.15,a:.32+r()*.42,hot:gyri>.68})}}
 // Rear-lower cerebellum gives the side view an anatomical silhouette.
 guard=0;while(pts.length<650&&guard++<8000){const x=r()*.92-.46,y=.48+r()*.48,z=.12+r()*.48;const d=Math.pow(x/.48,2)+Math.pow((y-.67)/.27,2)+Math.pow((z-.31)/.34,2);if(d>.62&&d<1.04)pts.push({x,y,z,r:.55+r()*.8,a:.22+r()*.3,hot:false})}
 const links=[];for(let i=0;i<pts.length;i+=2){let best=-1,bd=.12;for(let j=Math.max(0,i-18);j<Math.min(pts.length,i+19);j++){if(i===j)continue;const a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);if(d<bd){bd=d;best=j}}if(best>=0)links.push([i,best])}
 return{pts,links}}
const GEO=buildBrain();
function active(b){if(document.hidden||!b.cv.isConnected)return false;const mode=document.getElementById('mindView')?.dataset.mode||'stats';return b.id==='brainCanvas'?mode==='stats':mode==='stack'}
function project(b,p,ca,sa,tilt){const x=p.x*ca-p.z*sa,z=p.x*sa+p.z*ca,y=p.y+z*tilt;const perspective=1/(1.18-z*.18);return{x:b.w/2+x*b.s*perspective,y:b.h/2+y*b.s*perspective,z,scale:perspective}}
function draw(b,time,dt){const c=b.ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,b.w,b.h);const angle=time*.00016,ca=Math.cos(angle),sa=Math.sin(angle),tilt=.055*Math.sin(time*.00031),pr=GEO.pts.map((p,i)=>({...project(b,p,ca,sa,tilt),i}));pr.sort((a,d)=>a.z-d.z);const byIndex=[];for(const p of pr)byIndex[p.i]=p;
 c.globalCompositeOperation='lighter';c.lineWidth=.65;c.strokeStyle='oklch(75% 0.09 300 / 0.10)';c.beginPath();for(const[a,d]of GEO.links){const p=byIndex[a],q=byIndex[d];if(!p||!q)continue;c.moveTo(p.x,p.y);c.lineTo(q.x,q.y)}c.stroke();
 for(const q of pr){const p=GEO.pts[q.i],depth=Math.max(0,Math.min(1,(q.z+.75)/1.5)),pulse=p.hot?(.82+.18*Math.sin(time*.0018+q.i)):1;c.fillStyle=`oklch(${72+depth*18}% ${.075+depth*.04} 300 / ${p.a*(.48+depth*.72)})`;c.beginPath();c.arc(q.x,q.y,p.r*q.scale*pulse,0,TAU);c.fill()}
 // Neural impulses move over the actual rotating 3D mesh.
 for(const im of b.impulses){im.t=(im.t+dt*im.speed)%1;const link=GEO.links[im.link%GEO.links.length],p=byIndex[link[0]],q=byIndex[link[1]],x=p.x+(q.x-p.x)*im.t,y=p.y+(q.y-p.y)*im.t;c.shadowBlur=8;c.shadowColor='oklch(91% 0.10 300 / .8)';c.fillStyle='oklch(97% 0.045 300 / .96)';c.beginPath();c.arc(x,y,2.1,0,TAU);c.fill()}c.shadowBlur=0;c.globalCompositeOperation='source-over'}
function tick(t){const dt=Math.min(.033,(t-(tick.last||t))/1000);tick.last=t;for(const b of instances)if(active(b))draw(b,t,dt);raf=requestAnimationFrame(tick)}
export function makeBrainPts(){return GEO.pts}
export function mountBrain(id,opt={}){const cv=document.getElementById(id);if(!cv||instances.some(b=>b.cv===cv))return;const b={id,cv,ctx:cv.getContext('2d',{alpha:true,desynchronized:true}),w:cv.width,h:cv.height,s:Math.min(cv.width/2.05,cv.height/1.95)*(opt.scale||1),impulses:Array.from({length:7},(_,i)=>({link:i*13,t:i/7,speed:.17+(i%3)*.035}))};instances.push(b);if(!raf)raf=requestAnimationFrame(tick)}
