function quadraticPoint(a, b, control, progress) {
  const back = 1 - progress;
  return {
    x: back * back * a.x + 2 * back * progress * control.x + progress * progress * b.x,
    y: back * back * a.y + 2 * back * progress * control.y + progress * progress * b.y
  };
}

function makeParticle(index, nodeCount) {
  return {
    target: index % nodeCount,
    offset: Math.random(),
    speed: 0.035 + Math.random() * 0.035,
    bow: (Math.random() - 0.5) * 90,
    drift: Math.random() * Math.PI * 2,
    size: 0.8 + Math.random() * 1.5
  };
}

function animStatParticles(state, color) {
  const cv = state.cv;
  const cx = cv.getContext('2d');
  const origin = { x: cv.width / 2, y: cv.height * 0.52 };
  const time = performance.now() / 1000;

  if (!state.particles) {
    state.particles = Array.from({ length: 22 }, (_, index) => makeParticle(index, state.nodes.length));
  }

  cx.clearRect(0, 0, cv.width, cv.height);
  cx.shadowColor = color.glow;
  cx.shadowBlur = 9;

  state.particles.forEach((particle) => {
    const node = state.nodes[particle.target];
    const destination = { x: node[0] * cv.width, y: node[1] * cv.height };
    const raw = (time * particle.speed + particle.offset) % 1;
    const progress = raw * raw * (3 - 2 * raw);
    const control = {
      x: (origin.x + destination.x) / 2 + particle.bow,
      y: (origin.y + destination.y) / 2 + Math.sin(particle.drift) * 34
    };
    const point = quadraticPoint(origin, destination, control, progress);
    const fadeIn = Math.min(1, raw * 5);
    const fadeOut = Math.min(1, (1 - raw) * 5);
    const alpha = Math.min(fadeIn, fadeOut) * 0.82;

    cx.beginPath();
    cx.arc(point.x, point.y, particle.size, 0, Math.PI * 2);
    cx.fillStyle = `oklch(84% 0.14 305 / ${alpha})`;
    cx.fill();
  });

  cx.shadowBlur = 0;
  requestAnimationFrame(() => animStatParticles(state, color));
}

function animStackConnections(state, color) {
  const cv = state.cv;
  const cx = cv.getContext('2d');
  const bx = cv.width / 2;
  const by = cv.height / 2;
  const time = Date.now() / 1000;

  cx.clearRect(0, 0, cv.width, cv.height);
  state.nodes.forEach(([nx, ny], index) => {
    const x = nx * cv.width;
    const y = ny * cv.height;
    const controlX = (bx + x) / 2 + (y - by) * 0.32;
    const controlY = (by + y) / 2 - (x - bx) * 0.32;

    cx.strokeStyle = color.base;
    cx.lineWidth = 2.5;
    cx.shadowBlur = 12;
    cx.shadowColor = color.glow;
    cx.globalAlpha = 0.5;
    cx.beginPath();
    cx.moveTo(bx, by);
    cx.quadraticCurveTo(controlX, controlY, x, y);
    cx.stroke();
    cx.globalAlpha = 1;

    const progress = (time * 0.18 + index * 0.2) % 1;
    const point = quadraticPoint(
      { x: bx, y: by },
      { x, y },
      { x: controlX, y: controlY },
      progress
    );
    cx.fillStyle = color.pulse;
    cx.beginPath();
    cx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    cx.fill();
  });

  cx.shadowBlur = 0;
  requestAnimationFrame(() => animStackConnections(state, color));
}

export function animLines(state, color) {
  if (!state) return;
  if (state.cv.id === 'statLines') animStatParticles(state, color);
  else animStackConnections(state, color);
}
