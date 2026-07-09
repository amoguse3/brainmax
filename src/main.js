import { vib } from './state.js';
import { applyTheme } from './theme.js';
import { renderStats, initStatsVisuals, initFireParticles, weakestZone } from './stats.js';
import { zoneMeta } from './zones.js';
import { renderStack, renderOpts, initStackLines, animLines2, initStackBrain } from './stack.js';
import { completeSession, toggleP } from './protocol.js';
import { renderMap, centerMap, bindMap } from './learn-map.js';
import { closeReader } from './reader.js';
import { renderCarousel, bindCarousel } from './carousel.js';
import { bindNav, goTo } from './nav.js';
import { startGame, endGame } from './games/index.js';

window.startGame = (type) => startGame(type, () => completeSession(vib));

document.getElementById('frontierBtn').addEventListener('click',()=>startGame(zoneMeta[weakestZone()].ex, () => completeSession(vib)));
document.getElementById('goTrainHint').addEventListener('click',()=>goTo(1));
document.getElementById('readerBack').addEventListener('click',closeReader);
document.getElementById('gameQuit').addEventListener('click',endGame);
document.getElementById('addBtn').addEventListener('click',()=>{ renderOpts(()=>document.getElementById('modalBack').classList.remove('open'), vib); document.getElementById('modalBack').classList.add('open'); });
document.getElementById('modalClose').addEventListener('click',()=>document.getElementById('modalBack').classList.remove('open'));
document.getElementById('modalBack').addEventListener('click',e=>{ if(e.target.id==='modalBack') document.getElementById('modalBack').classList.remove('open'); });
document.querySelectorAll('.proto-item').forEach(row=>row.addEventListener('click',()=>{ toggleP(row); vib(10); }));

applyTheme(0);
renderStats();
renderCarousel((type)=>startGame(type, () => completeSession(vib)));
renderMap();
initStatsVisuals();
initFireParticles();
initStackBrain();
renderStack(vib);
const stackLineState = initStackLines();
animLines2(stackLineState);
setTimeout(centerMap,300);
bindMap();
bindCarousel();
bindNav();
window.addEventListener('resize', centerMap);