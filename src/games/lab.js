import { S, save } from '../state.js';

export function ensureLabState() {
  if (!S.lab) S.lab = { sessions: [], baselineStartedAt: Date.now() };
  if (!S.levels.dual) S.levels.dual = 1;
  return S.lab;
}

export function nextDifficulty(level, recent) {
  if (recent.length < 4) return level;
  const window = recent.slice(-5);
  const accuracy = window.filter(Boolean).length / window.length;
  if (accuracy >= 0.8) return Math.min(12, level + 1);
  if (accuracy < 0.55) return Math.max(1, level - 1);
  return level;
}

export function recordExperiment(type, trials, startedAt, finalLevel, fatigue = null) {
  const lab = ensureLabState();
  const correct = trials.filter(trial => trial.correct).length;
  const responseTimes = trials.map(trial => trial.rt).filter(Number.isFinite);
  const session = {
    type,
    at: Date.now(),
    durationMs: Date.now() - startedAt,
    accuracy: trials.length ? Math.round(correct / trials.length * 100) : 0,
    meanRtMs: responseTimes.length ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
    finalLevel,
    fatigue,
    trials
  };
  lab.sessions.push(session);
  lab.sessions = lab.sessions.slice(-120);
  save();
  return session;
}

export function installLabStyles() {
  if (document.getElementById('labStyles')) return;
  const style = document.createElement('style');
  style.id = 'labStyles';
  style.textContent = `
    .lab-kicker{margin-bottom:10px;color:oklch(78% .12 300);font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
    .lab-prompt{max-width:32ch;margin-bottom:24px;color:var(--text-2);font-size:.88rem;line-height:1.5;text-align:center}
    .lab-math{margin-bottom:24px;font:700 clamp(2.35rem,12vw,4.25rem)/1 'JetBrains Mono',monospace;letter-spacing:-.06em;color:oklch(91% .025 300);font-variant-numeric:tabular-nums}
    .lab-answers{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:340px}
    .lab-answer{min-height:64px;padding:14px;border:1px solid oklch(72% .08 300 / .18);border-radius:18px;background:oklch(21% .045 300);color:var(--text);font:700 1.05rem 'JetBrains Mono',monospace;transition:transform 120ms cubic-bezier(.22,1,.36,1),background 160ms cubic-bezier(.22,1,.36,1)}
    .lab-answer:active{transform:scale(.95)}
    .lab-answer.correct{background:oklch(35% .11 150);color:oklch(91% .08 150)}
    .lab-answer.wrong{background:oklch(34% .12 25);color:oklch(91% .07 25)}
    .lab-meta{display:flex;gap:14px;margin-top:18px;color:var(--text-3);font:600 .68rem 'JetBrains Mono',monospace}
    .space-stage{display:grid;place-items:center;width:min(72vw,290px);aspect-ratio:1;margin-bottom:22px;perspective:700px}
    .space-object{width:150px;height:150px;transform-style:preserve-3d;filter:drop-shadow(0 18px 28px oklch(7% .02 300 / .5))}
    .space-object svg{width:100%;height:100%;overflow:visible}
    .dual-row{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px}
    .dual-cube{position:relative;width:112px;height:112px;transform:rotateX(-24deg) rotateY(34deg);transform-style:preserve-3d}
    .dual-face{position:absolute;display:grid;place-items:center;width:112px;height:112px;border:1px solid oklch(82% .11 300 / .35);background:oklch(30% .09 300);color:oklch(91% .04 300);font:800 1.25rem 'JetBrains Mono',monospace;backface-visibility:hidden}
    .dual-front{transform:translateZ(56px)}.dual-back{transform:rotateY(180deg) translateZ(56px)}.dual-right{transform:rotateY(90deg) translateZ(56px)}.dual-left{transform:rotateY(-90deg) translateZ(56px)}.dual-top{transform:rotateX(90deg) translateZ(56px)}.dual-bottom{transform:rotateX(-90deg) translateZ(56px)}
    .dual-op{font:800 1.75rem 'JetBrains Mono',monospace;color:oklch(84% .13 82)}
    .lab-fatigue{display:flex;gap:8px;margin-top:18px}.lab-fatigue button{min-width:44px;min-height:44px;border:1px solid oklch(72% .08 300 / .18);border-radius:14px;background:oklch(21% .045 300);color:var(--text-2);font-weight:700}
  `;
  document.head.appendChild(style);
}

ensureLabState();
installLabStyles();
