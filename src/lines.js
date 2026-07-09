// Comet field: no connecting lines. A glowing point eases from the brain hub out to each
// number node along a curved path, dragging a fading trail behind it, then dissolves and
// respawns after a pause. Motion uses ease-out (decelerate on arrival), never linear
// (NN/g, Material 3, Motion.dev: linear reads robotic; entering motion should decelerate).
const easeOutQuint = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 5);
function freshComet(i, n){
  return {
    node: i,
    phase: 'wait',
    t: 0,
    delay: (i / n) * 2.2 + Math.random() * 0.8,
    travel: 1.7 + Math.random() * 0.7,   // s to reach the number
    fade: 0.9,                            // s trail dissolve after arrival
    rest: 1.6 + Math.random() * 2.4,      // s dark pause before it runs again
    trail: []
  };
}
function nodesOf(state){ return state.getNodes ? state.getNodes() : state.nodes; }
function pointOnCurve(bx, by, x, y, prog){
  const bxc = (bx + x) / 2 + (y - by) * 0.28;
  const byc = (by + y) / 2 - (x - bx) * 0.28;
  const u = 1 - prog;
  return [ u*u*bx + 2*u*prog*bxc + prog*prog*x, u*u*by + 2*u*prog*byc + prog*prog*y ];
}
export function animConstellation(state, palette){
  const cv = state.cv;
  if(!cv){ requestAnimationFrame(() => animConstellation(state, palette)); return; }
  const cx = cv.getContext('2d');
  const now = performance.now();
  const nodes = nodesOf(state);
  if(!state.comets || state.comets.length !== nodes.length){ state.comets = nodes.map((_,i)=>freshComet(i, nodes.length)); state.last = now; }
  const dt = Math.min(0.05, (now - state.last) / 1000); state.last = now;
  const bx = cv.width / 2, by = cv.height * (state.hubY != null ? state.hubY : 0.5);
  cx.clearRect(0, 0, cv.width, cv.height);
  cx.globalCompositeOperation = 'lighter';
  nodes.forEach((nd, i) => {
    const c = state.comets[i];
    if(c.node !== i){ c.node = i; }
    c.t += dt;
    if(c.phase === 'wait'){ if(c.t >= c.delay){ c.phase = 'travel'; c.t = 0; c.trail = []; } }
    else if(c.phase === 'travel'){ if(c.t >= c.travel){ c.phase = 'fade'; c.t = 0; } }
    else if(c.phase === 'fade'){ if(c.t >= c.fade){ c.phase = 'rest'; c.t = 0; c.trail = []; } }
    else if(c.phase === 'rest'){ if(c.t >= c.rest){ c.phase = 'travel'; c.t = 0; c.trail = []; c.travel = 1.7 + Math.random()*0.7; c.rest = 1.6 + Math.random()*2.4; } }
    const x = nd[0] * cv.width, y = nd[1] * cv.height;
    if(c.phase === 'travel'){
      const prog = easeOutQuint(c.t / c.travel);
      const [px, py] = pointOnCurve(bx, by, x, y, prog);
      c.trail.push({ x: px, y: py, life: 1 });
      if(c.trail.length > 26) c.trail.shift();
    }
    // age the trail every frame so it dissolves smoothly even after arrival
    for(const p of c.trail) p.life -= dt * 1.7;
    c.trail = c.trail.filter(p => p.life > 0);
    // draw trail as soft fading dots (older = dimmer + smaller)
    for(const p of c.trail){
      const a = p.life * p.life; // ease the fade
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6 * p.life + 1.5);
      g.addColorStop(0, palette.trail.replace('A', (0.55 * a).toFixed(3)));
      g.addColorStop(1, 'transparent');
      cx.fillStyle = g;
      cx.beginPath(); cx.arc(p.x, p.y, 6 * p.life + 1.5, 0, Math.PI*2); cx.fill();
    }
    // draw the head
    if(c.phase === 'travel'){
      const prog = easeOutQuint(c.t / c.travel);
      const [hx, hy] = pointOnCurve(bx, by, x, y, prog);
      const headA = Math.min(1, prog * 3) * (1 - Math.max(0, (prog - 0.85) / 0.15) * 0.4);
      const g = cx.createRadialGradient(hx, hy, 0, hx, hy, 9);
      g.addColorStop(0, palette.head.replace('A', (0.95 * headA).toFixed(3)));
      g.addColorStop(0.5, palette.head.replace('A', (0.4 * headA).toFixed(3)));
      g.addColorStop(1, 'transparent');
      cx.fillStyle = g;
      cx.beginPath(); cx.arc(hx, hy, 9, 0, Math.PI*2); cx.fill();
      cx.fillStyle = palette.core.replace('A', (0.95 * headA).toFixed(3));
      cx.beginPath(); cx.arc(hx, hy, 2.1, 0, Math.PI*2); cx.fill();
    }
  });
  cx.globalCompositeOperation = 'source-over';
  requestAnimationFrame(() => animConstellation(state, palette));
}