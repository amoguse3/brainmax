import { S, save } from './state.js';

const AWARD_KEY='bmx_star_awards_v2';

function loadAwards(){
 try{return JSON.parse(localStorage.getItem(AWARD_KEY))||[]}catch{return[]}
}
function writeAwards(items){localStorage.setItem(AWARD_KEY,JSON.stringify(items.slice(-240)))}

export function initStarScore(canvas){
 if(!Number.isFinite(S.stars)) S.stars=Number.isFinite(S.coins)?S.coins:0;
 S.coins=S.stars;
 if(!S.adaptationV2){
  S.adaptationBase=S.stars;
  S.adaptationV2=true;
  delete S.upgrades;
  delete S.evolutions;
  delete S.purchased;
  delete S.purchasedUpgrades;
  delete S.unlockedUpgrades;
  delete S.evolutionTier;
  save();
 }
 const chip=document.querySelector('.coin-chip');
 const paint=()=>{if(chip){chip.textContent=S.stars.toLocaleString();chip.setAttribute('aria-label',`${S.stars} neural points`);}};
 paint();
 if(canvas){
  canvas.setAttribute('aria-label','Brain network visualization');
  canvas.style.cursor='default';
  canvas.addEventListener('pointerdown',event=>event.stopImmediatePropagation(),true);
 }
 const body=document.getElementById('gameBody');
 if(!body)return;
 const capture=()=>{
  const text=body.textContent||'';
  if(!/Finish session/i.test(text))return;
  const match=text.match(/(\d+)%\s*Accuracy/i);
  if(!match)return;
  const acc=Number(match[1]);
  const session=Number(S.sessions)||0;
  const signature=`${session}:${acc}`;
  const awards=loadAwards();
  if(awards.includes(signature))return;
  const earned=Math.max(3,Math.round(acc/8));
  S.stars+=earned;
  S.coins=S.stars;
  awards.push(signature);
  writeAwards(awards);
  save();
  paint();
 };
 new MutationObserver(capture).observe(body,{childList:true,subtree:true,characterData:true});
}

export function starScore(){return Number(S.stars)||0}
export function adaptationScore(){return Math.max(0,starScore()-(Number(S.adaptationBase)||0))}
