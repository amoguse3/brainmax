const style=document.createElement('style');
style.id='brainmaxBrandBlend';
style.textContent=`
:root{
  --blend:color-mix(in oklab,var(--violet) 74%,var(--moon));
  --blend-soft:color-mix(in oklab,var(--violet) 84%,var(--moon));
  --blend-cool:color-mix(in oklab,var(--violet) 58%,var(--moon));
}
.phone::before,.header::after,.constellation::before,.constellation::after,.stack-const::before,.stack-const::after,.game-top::after,.tabbar::before{display:none!important;content:none!important}
body::after{opacity:.1!important}
.h-age{color:var(--blend-cool)!important;text-shadow:0 0 18px color-mix(in oklab,var(--blend-cool) 22%,transparent)!important}
.stats-mode-switch button.active,.view[data-view="stack"] .stats-mode-switch button.active{background:var(--blend)!important;color:oklch(17% .035 300)!important;box-shadow:0 0 22px color-mix(in oklab,var(--blend) 30%,transparent)!important}
.sb-syn,.lock-hint,.reader-back,.reader-tier,.game-level,.lab-kicker,.step-tag,.math-mode,.trained-gain,.trained-lvl,.co-add{color:var(--blend-cool)!important}
.node:nth-of-type(even) .node-v,.eff-item:nth-child(2) .eff-v{color:var(--blend-cool)!important;text-shadow:0 0 16px color-mix(in oklab,var(--blend-cool) 34%,transparent)!important}
.glow-btn{background:linear-gradient(130deg,var(--violet),var(--blend-cool),oklch(31% .06 300))!important}
.stack-add{border-color:color-mix(in oklab,var(--blend-cool) 20%,transparent)!important}.snode:nth-of-type(even) .snode-badge{color:var(--blend-cool)!important;box-shadow:0 0 18px color-mix(in oklab,var(--blend-cool) 22%,transparent)!important}
.lock-icon svg{stroke:var(--blend-cool)!important}.lock-fill,.timer-fill,.game-progress-fill{background:linear-gradient(90deg,var(--violet) 0 64%,var(--blend-cool))!important}.proto-check.on{background:var(--blend)!important;border-color:var(--blend)!important;box-shadow:0 0 18px color-mix(in oklab,var(--blend) 30%,transparent)!important}
.map-circ.unlocked{border-color:color-mix(in oklab,var(--blend-cool) 30%,transparent)!important;box-shadow:0 0 0 5px color-mix(in oklab,var(--violet) 6%,transparent),0 0 28px color-mix(in oklab,var(--blend-cool) 22%,transparent)!important}.map-node:nth-child(odd) .map-circ.unlocked{border-color:color-mix(in oklab,var(--violet) 30%,transparent)!important}
.reader-body .callout{border-color:color-mix(in oklab,var(--blend-cool) 14%,transparent)!important}.reader-body .callout::before{color:var(--blend-cool)!important}
.game{background:radial-gradient(circle at 50% 22%,color-mix(in oklab,oklch(21% .06 300) 90%,var(--moon)),var(--bg) 42%)!important}
.rule-badge{background:color-mix(in oklab,oklch(31% .09 300) 84%,var(--moon))!important;color:var(--blend-cool)!important}
.lab-answer:nth-child(even),.color-answer:nth-child(even){border-color:color-mix(in oklab,var(--blend-cool) 14%,transparent)!important}
.lab-answer.correct,.color-answer.correct,.rot-btn.correct,.stroop-btn.correct{background:color-mix(in oklab,oklch(34% .11 300) 66%,oklch(34% .1 225))!important;border-color:var(--blend-cool)!important;color:oklch(92% .04 260)!important}
.idea-add,.cr-send{background:var(--blend-cool)!important;color:oklch(17% .035 300)!important}
.results-icon{color:var(--blend-cool)!important;text-shadow:0 0 26px color-mix(in oklab,var(--blend-cool) 26%,transparent)!important}
.tab.active{color:var(--blend)!important}.tc-slide:nth-child(3n+2){--card-accent:var(--blend-cool)!important}.tc-play{background:var(--card-accent)!important}
`;
document.head.appendChild(style);
