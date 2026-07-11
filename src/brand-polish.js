const style=document.createElement('style');
style.id='brainmaxCraftPolish';
style.textContent=`
:root{
  --page-gutter:24px;
  --measure:34ch;
  --motion-enter:420ms;
  --motion-state:240ms;
  --ease-enter:cubic-bezier(.16,1,.3,1);
  --ease-state:cubic-bezier(.65,0,.35,1);
}
.header,.view,.game-top,.game-body,.reader-top,.reader-body{padding-inline:var(--page-gutter)!important}
.header>*{min-width:0}.h-context{max-width:54%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.h-age{max-width:44%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums}
.screen-head{display:grid;gap:6px}.screen-title,.screen-sub{margin:0!important}.screen-sub{max-width:var(--measure)}
.constellation,.stack-const{width:min(100%,400px)!important;margin-inline:auto!important}.brain-center,.stack-brain{left:50%!important}.node{min-width:74px}.node-l{max-width:92px;overflow:hidden;text-overflow:ellipsis}
.glow-btn,.stack-add,.lock-progress,.tc-explain,.trained,.results-cta,.idea-row,.idea-list,.creative-actions{width:min(100%,340px)!important;margin-left:auto!important;margin-right:auto!important}
.tc-track{align-items:stretch}.tc-slide{display:flex}.tc-big{width:100%}.tc-name,.tc-zone,.tc-play{max-width:100%}.tc-name{overflow-wrap:anywhere}.tc-zone{line-height:1.35}.tc-explain-t{max-width:var(--measure)}
.game-top{display:grid!important;grid-template-columns:44px minmax(0,1fr) 72px;gap:10px}.game-quit{justify-self:start}.game-title{justify-self:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center}.game-level{justify-self:end;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.game-body{width:100%}.game-body>*{max-width:100%}.cog-title,.clear-title,.cog-copy,.lab-prompt{text-wrap:balance}.lab-answers,.color-answers,.rot-controls,.stroop-opts,.ct-opts{margin-inline:auto}.lab-answer,.color-answer,.rot-btn,.stroop-btn,.ct-btn{min-width:0;overflow-wrap:anywhere}.dual-task-layout,.tutorial-chain,.dual-steps,.dual-example,.face-map,.dual-face-map{margin-inline:auto}
.results{margin-inline:auto!important}.results-stats{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px!important}.rst{text-align:center!important}.rst-v{white-space:nowrap;font-variant-numeric:tabular-nums}.trained-row{display:grid!important;grid-template-columns:8px minmax(0,1fr) auto}.trained-zone{min-width:0;overflow-wrap:anywhere}.trained-gain{white-space:nowrap}
.proto-wrap,.lock-state{width:min(100%,360px);margin-inline:auto}.proto-item>div:last-child{min-width:0}.proto-n,.proto-d{overflow-wrap:anywhere}.compound-opt>div{min-width:0}.co-n,.co-d{overflow-wrap:anywhere}
.reader-body{max-width:520px;margin-inline:auto}.reader-h1{overflow-wrap:anywhere}.reader-body p{max-width:66ch;text-wrap:pretty}
.tabbar{isolation:isolate}.tab{min-width:0}.tab-l{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.track{transition-duration:560ms!important;transition-timing-function:var(--ease-enter)!important}.reader,.game{transition-duration:440ms!important;transition-timing-function:var(--ease-enter)!important}
.view.enter>*{animation:craftEnter var(--motion-enter) var(--ease-enter) both!important}.view.enter>*:nth-child(2){animation-delay:45ms!important}.view.enter>*:nth-child(3){animation-delay:90ms!important}
.tc-slide.active .tc-big{animation:cardSettle 360ms var(--ease-enter) both}.tab.active svg{animation:tabSettle 260ms var(--ease-enter) both}.stats-mode-switch button.active{animation:segmentSettle 220ms var(--ease-enter) both}
button,.tab,.map-node,.snode{touch-action:manipulation}.lab-answer,.color-answer,.rot-btn,.stroop-btn,.ct-btn,.go-button,.clear-start,.cog-start,.results-cta,.tc-play{transition:transform 110ms var(--ease-state),background-color var(--motion-state) var(--ease-state),border-color var(--motion-state) var(--ease-state),color var(--motion-state) var(--ease-state)!important}.lab-answer:active,.color-answer:active,.rot-btn:active,.stroop-btn:active,.ct-btn:active,.go-button:active,.clear-start:active,.cog-start:active,.results-cta:active,.tc-play:active{transform:translateY(1px) scale(.985)!important}
.lab-answer.correct,.color-answer.correct,.rot-btn.correct,.stroop-btn.correct{animation:earnedConfirm 420ms var(--ease-enter)!important}.lab-answer.wrong,.color-answer.wrong,.rot-btn.wrong,.stroop-btn.wrong{animation:quietReject 280ms var(--ease-state)!important}
.game-progress-fill,.timer-fill{transition:transform 160ms linear,width 300ms var(--ease-state)!important;transform-origin:left}.results.show .results-icon{animation:resultMark 520ms var(--ease-enter) both!important}.results.show .results-title{animation:resultRise 420ms 55ms var(--ease-enter) both}.results.show .results-stats{animation:resultRise 420ms 100ms var(--ease-enter) both}.results.show .trained{animation:resultRise 420ms 145ms var(--ease-enter) both}.results.show .results-cta{animation:resultRise 420ms 190ms var(--ease-enter) both}
.coin-float{animation-duration:560ms!important}.tap-spark:nth-of-type(n+5){display:none!important}.rush-label{letter-spacing:.12em!important}
@keyframes craftEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes cardSettle{from{opacity:.78;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
@keyframes tabSettle{from{opacity:.55;transform:translateY(2px)}to{opacity:1;transform:translateY(0)}}
@keyframes segmentSettle{from{opacity:.7;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes earnedConfirm{0%{transform:scale(.985)}55%{transform:scale(1.018)}100%{transform:scale(1)}}
@keyframes quietReject{0%,100%{transform:translateX(0)}35%{transform:translateX(-3px)}70%{transform:translateX(3px)}}
@keyframes resultMark{from{opacity:0;transform:translateY(8px) rotate(-6deg)}to{opacity:1;transform:translateY(0) rotate(0)}}
@keyframes resultRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:360px){:root{--page-gutter:18px}.node{min-width:64px}.node-v{font-size:1.15rem!important}.node-l{font-size:.46rem!important}.results-stats{gap:6px!important}.rst-v{font-size:1.28rem!important}.game-top{grid-template-columns:36px minmax(0,1fr) 64px}.face-map,.dual-face-map{grid-template-columns:repeat(2,1fr)!important}}
@media(min-width:480px){:root{--page-gutter:28px}.tc-big{min-height:310px!important}}
@media(prefers-reduced-motion:reduce){.view.enter>*,.tc-slide.active .tc-big,.tab.active svg,.stats-mode-switch button.active,.lab-answer.correct,.color-answer.correct,.rot-btn.correct,.stroop-btn.correct,.lab-answer.wrong,.color-answer.wrong,.rot-btn.wrong,.stroop-btn.wrong,.results.show>*{animation:none!important}.track,.reader,.game{transition-duration:1ms!important}}
`;
document.head.appendChild(style);
