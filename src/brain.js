const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function seededNoise(index) {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function makeBrainPts(count) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    const yBase = 1 - 2 * ((i + 0.5) / count);
    const ring = Math.sqrt(Math.max(0, 1 - yBase * yBase));
    const angle = i * GOLDEN_ANGLE;
    const noise = seededNoise(i);
    let x = Math.cos(angle) * ring * 1.14;
    let y = yBase * 0.84;
    let z = Math.sin(angle) * ring * 0.92;

    const frontalBulge = 1 + 0.08 * clamp((z + 0.35) / 1.2, 0, 1);
    const rearTaper = 1 - 0.05 * clamp((-z + 0.55) / 1.5, 0, 1);
    x *= frontalBulge * rearTaper;

    const gyri =
      Math.sin(angle * 8 + yBase * 10) * 0.036 +
      Math.sin(angle * 15 - yBase * 7) * 0.021 +
      Math.cos(x * 12 + z * 8) * 0.014;
    const shell = i % 7 === 0 ? 0.82 + noise * 0.1 : 0.97 + gyri;
    x *= shell;
    z *= shell;

    if (y < -0.42) y = -0.42 + (y + 0.42) * 0.38;
    if (y < 0.02) x *= 1.04 + (0.02 - y) * 0.1;

    const cleft = 0.075 * clamp((y + 0.28) / 0.92, 0, 1) * (1 - Math.min(0.62, Math.abs(z) * 0.5));
    x += (x < 0 ? -1 : 1) * cleft;
    z += 0.06 * (1 - yBase * yBase) - 0.016;

    points.push({
      x,
      y,
      z,
      size: 0.72 + seededNoise(i + 9000) * 0.55
    });
  }
  return points;
}

export function mountStatBrain() {
  const canvas = document.getElementById('brainCanvas');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const points = makeBrainPts(1080);
  const centerX = width / 2;
  const centerY = height / 2 - 2;
  const scale = 113;
  const pitch = -0.12;
  const pitchCos = Math.cos(pitch);
  const pitchSin = Math.sin(pitch);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rotationSpeed = reducedMotion ? 0.00007 : 0.0003;
  let startedAt = performance.now();
  let pausedAt = 0;

  function draw(now) {
    const rotation = (now - startedAt) * rotationSpeed;
    const rotationCos = Math.cos(rotation);
    const rotationSin = Math.sin(rotation);
    context.clearRect(0, 0, width, height);

    const projected = points.map((point) => {
      const x = point.x * rotationCos - point.z * rotationSin;
      const z = point.x * rotationSin + point.z * rotationCos;
      const y = point.y * pitchCos - z * pitchSin;
      const depth = point.y * pitchSin + z * pitchCos;
      const perspective = 3.65 / (3.65 - depth);
      return {
        x: centerX + x * scale * perspective,
        y: centerY - y * scale * perspective,
        depth,
        perspective,
        size: point.size
      };
    });

    projected.sort((a, b) => a.depth - b.depth);
    context.shadowColor = 'oklch(78% 0.18 300 / 0.68)';
    context.shadowBlur = 5;

    projected.forEach((point) => {
      const depth = clamp((point.depth + 1.12) / 2.24, 0, 1);
      const radius = (0.62 + depth * 1.22) * point.size * point.perspective;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, TAU);
      context.fillStyle = `oklch(${51 + depth * 35}% ${0.11 + depth * 0.1} ${291 + depth * 19} / ${0.18 + depth * 0.78})`;
      context.fill();
    });

    context.shadowBlur = 0;
    requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pausedAt = performance.now();
    else if (pausedAt) {
      startedAt += performance.now() - pausedAt;
      pausedAt = 0;
    }
  });

  requestAnimationFrame(draw);
}
