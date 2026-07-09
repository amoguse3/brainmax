// Comet field: NO connecting lines and NO curves. A glowing point eases in a STRAIGHT
// line from the brain hub to each number, dragging a fading trail, then dissolves and
// respawns after a pause. ease-out (decelerate on arrival), never linear
// (NN/g, Material 3, Motion.dev: linear reads robotic; entering motion should decelerate).
const easeOutQuint = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 5);
function freshComet(i, n){
  return {
    node: i,
    phase: 'wait',
    t: 0,
    delay: (i / n) * 2.0 + Math.random() * 0.8,
    travel: 1.6 + Math.random() * 0.6,
    fade: 0.9,
    rest: 1.5 + Math.random() * 2.2,
    trail: []
  };
}
function nodesOf(state){ return state.getNodes ? state.getNodes() : state.nodes; }
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
    c.t += dt;
    if(c.phase === 'wait'){ if(c.t >= c.delay){ c.phase = 'travel'; c.t = 0; c.trail = []; } }
    else if(c.phase === 'travel'){ if(c.t >= c.travel){ c.phase = 'fade'; c.t = 0; } }
    else if(c.phase === 'fade'){ if(c.t >= c.fade){ c.phase = 'rest'; c.t = 0; c.trail = []; } }
    else if(c.phase === 'rest'){ if(c.t >= c.rest){ c.phase = 'travel'; c.t = 0; c.trail = []; c.travel = 1.6 + Math.random()*0.6; c.rest = 1.5 + Math.random()*2.2; } }
    const x = nd[0] * cv.width, y = nd[1] * cv.height;
    if(c.phase === 'travel'){
      const prog = easeOutQuint(c.t / c.travel);
      const px = bx + (x - bx) * prog, py = by + (y - by) * prog; // STRAIGHT path
      c.trail.push({ x: px, y: py, life: 1 });
      if(c.trail.length > 24) c.trail.shift();
    }
    for(const p of c.trail) p.life -= dt * 1.7;
    c.trail = c.trail.filter(p => p.life > 0);
    for(const p of c.trail){
      const a = p.life * p.life;
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6 * p.life + 1.5);
      g.addColorStop(0, palette.trail.replace('A', (0.55 * a).toFixed(3)));
      g.addColorStop(1, 'transparent');
      cx.fillStyle = g;
      cx.beginPath(); cx.arc(p.x, p.y, 6 * p.life + 1.5, 0, Math.PI*2); cx.fill();
    }
    if(c.phase === 'travel'){
      const prog = easeOutQuint(c.t / c.travel);
      const hx = bx + (x - bx) * prog, hy = by + (y - by) * prog;
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