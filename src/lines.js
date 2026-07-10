// Lightweight straight comets. Trails are batched paths instead of dozens of
// per-point radial gradients, keeping the same look with a fraction of the work.
const easeOutQuint=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),5);
function fresh(i,n){return{phase:'wait',t:0,delay:i/n*2+Math.random()*.8,travel:1.6+Math.random()*.6,fade:.9,rest:1.5+Math.random()*2.2,trail:[]}}
function nodesOf(s){return s.getNodes?s.getNodes():s.nodes}
export function animConstellation(state,palette){
 const cv=state.cv;if(!cv){requestAnimationFrame(()=>animConstellation(state,palette));return}
 const cx=cv.getContext('2d',{alpha:true,desynchronized:true});let last=performance.now(),comets=[];
 function frame(now){
  if(document.hidden){last=now;requestAnimationFrame(frame);return}
  const nodes=nodesOf(state);if(comets.length!==nodes.length)comets=nodes.map((_,i)=>fresh(i,nodes.length));
  const dt=Math.min(.05,(now-last)/1000);last=now,bx=cv.width/2,by=cv.height*(state.hubY??.5);cx.clearRect(0,0,cv.width,cv.height);cx.globalCompositeOperation='lighter';
  nodes.forEach((nd,i)=>{const c=comets[i];c.t+=dt;if(c.phase==='wait'&&c.t>=c.delay){c.phase='travel';c.t=0;c.trail=[]}else if(c.phase==='travel'&&c.t>=c.travel){c.phase='fade';c.t=0}else if(c.phase==='fade'&&c.t>=c.fade){c.phase='rest';c.t=0;c.trail=[]}else if(c.phase==='rest'&&c.t>=c.rest){c.phase='travel';c.t=0;c.trail=[]}
   const x=nd[0]*cv.width,y=nd[1]*cv.height;if(c.phase==='travel'){const p=easeOutQuint(c.t/c.travel);c.trail.push({x:bx+(x-bx)*p,y:by+(y-by)*p,life:1});if(c.trail.length>16)c.trail.shift()}
   c.trail.forEach(p=>p.life-=dt*1.9);c.trail=c.trail.filter(p=>p.life>0);
   if(c.trail.length>1){cx.lineCap='round';cx.lineJoin='round';cx.lineWidth=3;cx.strokeStyle=palette.trail.replace('A','.24');cx.beginPath();c.trail.forEach((p,j)=>j?cx.lineTo(p.x,p.y):cx.moveTo(p.x,p.y));cx.stroke()}
   if(c.phase==='travel'){const p=easeOutQuint(c.t/c.travel),hx=bx+(x-bx)*p,hy=by+(y-by)*p,a=Math.min(1,p*3)*(1-Math.max(0,(p-.85)/.15)*.4);cx.shadowBlur=8;cx.shadowColor=palette.head.replace('A',(.55*a).toFixed(2));cx.fillStyle=palette.core.replace('A',(.95*a).toFixed(2));cx.beginPath();cx.arc(hx,hy,2.4,0,Math.PI*2);cx.fill();cx.shadowBlur=0}
  });cx.globalCompositeOperation='source-over';requestAnimationFrame(frame)
 }
 requestAnimationFrame(frame)
}
