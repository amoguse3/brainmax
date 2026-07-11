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
    const vertical = 1 - 2 * ((i + 0.5) / count);
    const ring = Math.sqrt(Math.max(0, 1 - vertical * vertical));
    const angle = i * GOLDEN_ANGLE;
    const noise = seededNoise(i);

    let x = Math.cos(angle) * ring * 1.16;
    let y = vertical * 0.86;
    let z = Math.sin(angle) * ring * 0.94;

    const folds =
      Math.sin(angle * 7 + vertical * 8) * 0.032 +
      Math.sin(angle * 13 - vertical * 5) * 0.018;
    const volume = i % 5 === 0 ? 0.84 + noise * 0.12 : 0.96 + folds;

    x *= volume;
    z *= volume;

    if (y < -0.4) y = -0.4 + (y + 0.4) * 0.42;
    if (y < 0.08) x *= 1.04 + (0.08 - y) * 0.08;

    const cleftStrength = clamp((y + 0.22) / 0.9, 0, 1);
    const cleftDepth = 0.052 * cleftStrength * (1 - Math.min(0.7, Math.abs(z) * 0.55));
    x += (x < 0 ? -1 : 1) * cleftDepth;

    z += 0.055 * (1 - vertical * vertical) - 0.018;

    points.push({
      x,
      y,
      z,
      phase: noise * TAU,
      size: 0.78 + seededNoise(i + 9000) * 0.52
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
  const points = makeBrainPts(760);
  const centerX = width / 2;
  const centerY = height / 2 - 2;
  const scale = 102;
  const pitch = -0.1;
  const pitchCos = Math.cos(pitch);
  const pitchSin = Math.sin(pitch);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rotationSpeed = reducedMotion ? 0.00008 : 0.00034;
  let startedAt = performance.now();
  let pausedAt = 0;

  function draw(now) {
    const rotation = (now - startedAt) * rotationSpeed;
    const rotationCos = Math.cos(rotation);
    const rotationSin = Math.sin(rotation);

    context.clearRect(0, 0, width, height);

    const projected = points.map((point) => {
      const rotatedX = point.x * rotationCos - point.z * rotationSin;
      const rotatedZ = point.x * rotationSin + point.z * rotationCos;
      const rotatedY = point.y * pitchCos - rotatedZ * pitchSin;
      const depth = point.y * pitchSin + rotatedZ * pitchCos;
      const perspective = 3.5 / (3.5 - depth);

      return {
        x: centerX + rotatedX * scale * perspective,
        y: centerY - rotatedY * scale * perspective,
        depth,
        perspective,
        size: point.size
      };
    });

    projected.sort((a, b) => a.depth - b.depth);
    context.shadowColor = 'oklch(78% 0.19 300 / 0.72)';
    context.shadowBlur = 6;

    projected.forEach((point) => {
      const depth = clamp((point.depth + 1.15) / 2.3, 0, 1);
      const radius = (0.72 + depth * 1.28) * point.size * point.perspective;
      const lightness = 54 + depth * 31;
      const alpha = 0.22 + depth * 0.74;

      context.beginPath();
      context.arc(point.x, point.y, radius, 0, TAU);
      context.fillStyle = `oklch(${lightness}% ${0.13 + depth * 0.09} ${292 + depth * 18} / ${alpha})`;
      context.fill();
    });

    context.shadowBlur = 0;
    requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pausedAt = performance.now();
    } else if (pausedAt) {
      startedAt += performance.now() - pausedAt;
      pausedAt = 0;
    }
  });

  requestAnimationFrame(draw);
}
