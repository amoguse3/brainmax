import { openGame, endGame, gBody, gLevel, gs } from './engine.js';
import { startRotation } from './rotation.js';
import { startMath } from './math.js';
import { startMemory } from './memory.js';
import { startStroop } from './stroop.js';
import { startCreative } from './creative.js';
import { startCritical } from './critical.js';
export function startGame(type, completeSession){ const titles={rotation:'Mental Rotation',math:'Adaptive Math',memory:'Memory Sequence',stroop:'Stroop Focus',creative:'Creative Flow',critical:'Critical Thinking'}; openGame(titles[type]); gLevel.textContent='Get ready'; let n=3; gBody.innerHTML=`<div class="countdown">${n}</div>`; const fns={rotation:startRotation,math:startMath,memory:startMemory,stroop:startStroop,creative:startCreative,critical:startCritical}; const cd=setInterval(()=>{ n--; if(n<=0){ clearInterval(cd); fns[type](completeSession); } else { gBody.innerHTML=`<div class="countdown">${n}</div>`; } },600); gs.timer=cd; }
export { endGame };