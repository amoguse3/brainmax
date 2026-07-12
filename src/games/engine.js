import { S, save, setSessionDone, vib, awardStars } from '../state.js';
import { zoneMeta } from '../util.js';
let gs={};
const gameEl=document.getElementById('game'),gBody=document.getElementById('gameBody'),gTitle=document.getElementById('gameTitle'),gLevel=document.getElementById('gameLevel'),gProg=document.getElementById('gameProg'),timerFill=document.getElementById('timerFill');
export function endGame(){gameEl.classList.remove('open');if(gs.timer)clearInterval(gs.timer);if(gs.timeout)clearTimeout(gs.timeout);if(gs.rtimer)clearInterval(gs.rtimer);gs={};}
export function openGame(title){gTitle.textContent=title;gameEl.classList.add('open');gProg.style.width='0%';timerFill.style.width='100%';}
export function setProg(done,total){gProg.style.width=(done/total*100)+'%';}
export function startTimer(ms,onExpire){if(gs.rtimer)clearInterval(gs.rtimer);const t0=Date.now();timerFill.style.width='100%';gs.rExpire=onExpire;gs.rStart=t0;gs.rtimer=setInterval(()=>{const elapsed=Date.now()-t0,pct=Math.max(0,100-elapsed/ms*100);timerFill.style.width=pct+'%';if(elapsed>=ms){clearInterval(gs.rtimer);if(gs.rExpire)gs.rExpire();}},40);}
export function stopTimer(){if(gs.rtimer)clearInterval(gs.rtimer);return Date.now()-gs.rStart;}
export function adapt(key,acc){if(acc>=80)S.levels[key]++;else if(acc<50&&S.levels[key]>1)S.levels[key]--;}
export function completeSession(){if(setSessionDone&&!document.getElementById('protoWrap').classList.contains('unlocked')){setSessionDone(true);document.getElementById('lockState').style.display='none';document.getElementById('protoWrap').classList.add('unlocked');document.getElementById('protoTab').classList.remove('locked');document.getElementById('lockDot').style.display='none';document.getElementById('lockFill').style.width='100%';document.getElementById('lockCount').textContent='1 / 1 session';vib([10,40,20]);}}
export function finish(icon,acc,avgRtMs,zoneKey,gameKey,extraNote){
 if(gs.timer)clearInterval(gs.timer);if(gs.rtimer)clearInterval(gs.rtimer);setProg(1,1);gLevel.textContent='Complete';
 const speedFactor=Math.max(.4,Math.min(1.3,4000/Math.max(800,avgRtMs))),zoneGain=Math.max(1,Math.round(acc/16));
 S.zones[zoneKey]=Math.min(100,S.zones[zoneKey]+zoneGain);
 const cqGain=Math.max(0,Math.round((acc/100)*(S.levels[gameKey]||1)*speedFactor*1.2));
 S.cq+=cqGain;S.sessions++;S.bestAcc=Math.max(S.bestAcc,acc);
 let isRecord=false;const prev=S.best[gameKey]||0;if(acc>prev){S.best[gameKey]=acc;if(prev>0){isRecord=true;S.records++;}}
 let milestone=null;const zoneValue=S.zones[zoneKey];if(zoneValue>=100&&prev<100)milestone=zoneMeta[zoneKey].n+' zone MASTERED';else if(zoneValue>=75&&zoneValue-zoneGain<75)milestone=zoneMeta[zoneKey].n+' reached 75';else if(zoneValue>=50&&zoneValue-zoneGain<50)milestone=zoneMeta[zoneKey].n+' badge unlocked';
 save();const stars=awardStars(acc,gameKey),meta=zoneMeta[zoneKey];
 gBody.innerHTML=`<div class="results show"><div class="results-icon">${icon}</div><div class="results-title">${acc>=70?'Well done':'Good effort'}${isRecord?' · New personal best':''}</div><div class="results-stats"><div class="rst"><div class="rst-v">${acc}%</div><div class="rst-l">Accuracy</div></div><div class="rst"><div class="rst-v">+${cqGain}</div><div class="rst-l">CQ</div></div><div class="rst"><div class="rst-v">+${stars} ✦</div><div class="rst-l">Points</div></div></div><div class="trained"><div class="trained-row"><span class="trained-dot"></span><span class="trained-zone">${meta.n}</span><span class="trained-gain">+${zoneGain}</span></div>${extraNote?`<div class="trained-row"><span class="trained-dot"></span><span class="trained-zone">${extraNote}</span></div>`:''}${milestone?`<div class="trained-row"><span class="trained-dot"></span><span class="trained-zone">${milestone}</span></div>`:''}</div><button class="results-cta" id="resCta">Finish session</button></div>`;
 document.getElementById('resCta').addEventListener('click',()=>{completeSession();endGame();});vib(milestone?[15,50,25,50,25]:[15,50,25]);
}
export function bindGameShell(){document.getElementById('gameQuit').addEventListener('click',endGame);}
