import { S, save, vib } from './state.js';
import { goTo } from './nav.js';

const STACK_POSITIONS = [[16,24],[84,24],[16,80],[84,80],[50,10],[50,90]];

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .tab[data-v="2"]{display:none}
    .stats-mode-switch{position:absolute;top:8px;left:50%;z-index:12;display:flex;gap:4px;padding:4px;transform:translateX(-50%);border:1px solid oklch(72% 0.10 300 / .16);border-radius:999px;background:oklch(17% 0.035 300 / .86);box-shadow:0 12px 30px oklch(8% 0.02 300 / .24)}
    .stats-mode-switch button{min-width:78px;min-height:36px;padding:0 15px;border:0;border-radius:999px;background:transparent;color:var(--text-3);font-size:.72rem;font-weight:700;letter-spacing:.02em;transition:transform 140ms cubic-bezier(.22,1,.36,1),background 220ms cubic-bezier(.22,1,.36,1),color 220ms cubic-bezier(.22,1,.36,1)}
    .stats-mode-switch button:active{transform:scale(.95)}
    .stats-mode-switch button.active{background:oklch(65% .15 300);color:oklch(15% .025 300);box-shadow:0 0 22px oklch(72% .15 300 / .34)}
    .view[data-view="stats"],.view[data-view="stack"]{position:relative;padding-top:52px}
    .view[data-view="stack"] .screen-head{display:none}
    .coin-chip{position:absolute;top:56px;left:50%;z-index:10;display:flex;align-items:center;gap:7px;min-height:32px;padding:0 12px;transform:translateX(-50%);border:1px solid oklch(82% .12 82 / .25);border-radius:999px;background:oklch(19% .04 300 / .88);color:oklch(86% .13 82);font:700 .75rem 'JetBrains Mono',monospace;box-shadow:0 0 20px oklch(78% .13 82 / .16);pointer-events:none}
    .coin-chip::before{content:'✦';font-size:.8rem}
    #brainCanvas{cursor:pointer;touch-action:manipulation}
    .brain-center.click-pop{animation:brainClick 260ms cubic-bezier(.22,1,.36,1)}
    .coin-float{position:fixed;z-index:100;pointer-events:none;color:oklch(90% .15 82);font:800 1rem 'JetBrains Mono',monospace;text-shadow:0 0 14px oklch(82% .16 82);animation:coinFloat 720ms cubic-bezier(.16,1,.3,1) forwards}
    .tap-spark{position:fixed;z-index:99;width:5px;height:5px;border-radius:50%;pointer-events:none;background:oklch(88% .15 82);box-shadow:0 0 12px oklch(82% .16 82);animation:sparkOut 560ms cubic-bezier(.16,1,.3,1) forwards}
    .rush-label{position:fixed;left:50%;top:42%;z-index:101;pointer-events:none;transform:translate(-50%,-50%);color:oklch(90% .14 82);font-weight:800;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;text-shadow:0 0 18px oklch(82% .16 82);animation:rush 900ms cubic-bezier(.16,1,.3,1) forwards}
    .stack-const canvas#stackLines{display:none}
    .stack-const{height:430px;margin-top:0}
    .stack-brain{top:52%;z-index:3}
    #stackBrain{width:174px;height:158px}
    .stack-flow{position:absolute;inset:0;z-index:2;width:100%;height:100%;pointer-events:none}
    .snode{z-index:4}
    .snode-badge{border-radius:50%;background:oklch(24% .06 300 / .78)!important;box-shadow:0 0 20px currentColor, inset 0 0 12px oklch(80% .1 300 / .08)}
    @keyframes brainClick{0%{transform:translate(-50%,-50%) scale(1)}40%{transform:translate(-50%,-50%) scale(.96)}100%{transform:translate(-50%,-50%) scale(1)}}
    @keyframes coinFloat{0%{opacity:0;transform:translate(-50%,4px) scale(.75)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-54px) scale(1.08)}}
    @keyframes sparkOut{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.25)}}
    @keyframes rush{0%{opacity:0;transform:translate(-50%,-35%) scale(.8)}22%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}100%{opacity:0;transform:translate(-50%,-90%) scale(1)}}
  `;
  document.head.appendChild(style);
}

function createSwitch(view, active) {
  const switcher = document.createElement('div');
  switcher.className = 'stats-mode-switch';
  switcher.innerHTML = `<button data-mode="brain" class="${active === 'brain' ? 'active' : ''}">Brain</button><button data-mode="stack" class="${active === 'stack' ? 'active' : ''}">Stack</button>`;
  switcher.querySelector('[data-mode="brain"]').addEventListener('click', () => goTo(0));
  switcher.querySelector('[data-mode="stack"]').addEventListener('click', () => goTo(2));
  view.prepend(switcher);
}

function burstAt(x, y, amount) {
  const label = document.createElement('div');
  label.className = 'coin-float';
  label.textContent = `+${amount}`;
  label.style.left = `${x}px`;
  label.style.top = `${y}px`;
  document.body.appendChild(label);
  label.addEventListener('animationend', () => label.remove());

  for (let i = 0; i < 7; i += 1) {
    const spark = document.createElement('i');
    const angle = (Math.PI * 2 * i) / 7 + Math.random() * .3;
    const distance = 25 + Math.random() * 28;
    spark.className = 'tap-spark';
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove());
  }
}

function initClicker() {
  const canvas = document.getElementById('brainCanvas');
  const center = document.querySelector('.brain-center');
  if (!canvas || !center) return;

  if (!Number.isFinite(S.coins)) S.coins = 0;
  const chip = document.createElement('div');
  chip.className = 'coin-chip';
  center.parentElement.appendChild(chip);

  let streak = 0;
  let lastTap = 0;
  const update = () => { chip.textContent = S.coins.toLocaleString(); };
  update();

  canvas.addEventListener('pointerdown', (event) => {
    const now = performance.now();
    streak = now - lastTap < 1250 ? streak + 1 : 1;
    lastTap = now;
    const multiplier = Math.min(5, 1 + Math.floor(streak / 12));
    S.coins += multiplier;
    save();
    update();
    vib(streak % 12 === 0 ? [8,24,12] : 7);

    center.classList.remove('click-pop');
    void center.offsetWidth;
    center.classList.add('click-pop');
    burstAt(event.clientX, event.clientY, multiplier);

    if (S.coins % 25 < multiplier) {
      const rush = document.createElement('div');
      rush.className = 'rush-label';
      rush.textContent = 'Neural rush';
      document.body.appendChild(rush);
      rush.addEventListener('animationend', () => rush.remove());
    }
  });
}

function applyStackPositions() {
  document.querySelectorAll('.stack-const .snode').forEach((node, index) => {
    const position = STACK_POSITIONS[index] || [50 + Math.cos(index) * 36, 50 + Math.sin(index) * 38];
    node.style.left = `${position[0]}%`;
    node.style.top = `${position[1]}%`;
  });
}

function initStackFlow() {
  const host = document.querySelector('.stack-const');
  if (!host) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'stack-flow';
  host.appendChild(canvas);
  const context = canvas.getContext('2d');
  const particles = Array.from({ length: 24 }, (_, index) => ({
    target: index,
    phase: Math.random(),
    speed: .035 + Math.random() * .035,
    bend: (Math.random() - .5) * 75,
    size: .8 + Math.random() * 1.4
  }));

  function resize() {
    canvas.width = host.offsetWidth;
    canvas.height = host.offsetHeight;
  }

  function draw(now) {
    const nodes = [...host.querySelectorAll('.snode')];
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (nodes.length) {
      const start = { x: canvas.width / 2, y: canvas.height * .52 };
      context.shadowColor = 'oklch(78% .16 300 / .7)';
      context.shadowBlur = 8;
      particles.forEach((particle) => {
        const node = nodes[particle.target % nodes.length];
        const end = { x: node.offsetLeft, y: node.offsetTop };
        const raw = ((now / 1000) * particle.speed + particle.phase) % 1;
        const t = raw * raw * (3 - 2 * raw);
        const back = 1 - t;
        const control = { x: (start.x + end.x) / 2 + particle.bend, y: (start.y + end.y) / 2 - 18 };
        const x = back * back * start.x + 2 * back * t * control.x + t * t * end.x;
        const y = back * back * start.y + 2 * back * t * control.y + t * t * end.y;
        const alpha = Math.min(1, raw * 5, (1 - raw) * 5) * .76;
        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `oklch(84% .13 300 / ${alpha})`;
        context.fill();
      });
      context.shadowBlur = 0;
    }
    requestAnimationFrame(draw);
  }

  const observer = new MutationObserver(applyStackPositions);
  observer.observe(host, { childList: true });
  applyStackPositions();
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

export function initEngagement() {
  if (document.documentElement.dataset.engagementReady) return;
  document.documentElement.dataset.engagementReady = 'true';
  injectStyles();
  createSwitch(document.querySelector('.view[data-view="stats"]'), 'brain');
  createSwitch(document.querySelector('.view[data-view="stack"]'), 'stack');
  initClicker();
  initStackFlow();
}
