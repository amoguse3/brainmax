export const DEF={
 cq:100,sessions:0,records:0,bestAcc:0,
 zones:{frontal:15,parietal:15,hippo:15,creative:15,reason:15},
 levels:{rotation:1,math:1,memory:1,stroop:1,creative:1,critical:1},
 best:{},stars:0,adaptationBase:0,adaptationV3:false
};

function finite(value){return Number.isFinite(Number(value))?Number(value):0}
function migrate(raw){
 const source=raw||{};
 const state={...structuredClone(DEF),...source};
 state.zones={...DEF.zones,...(source.zones||{})};
 state.levels={...DEF.levels,...(source.levels||{})};
 state.best=source.best||{};
 const legacyStars=Math.max(finite(source.stars),finite(source.coins),finite(source.neurons?.balance));
 state.stars=Math.max(0,Math.floor(legacyStars));
 if(!source.adaptationV3){state.adaptationBase=state.stars;state.adaptationV3=true;}
 else state.adaptationBase=Math.max(0,finite(source.adaptationBase));
 delete state.coins;
 delete state.neurons;
 delete state.upgrades;
 delete state.evolutions;
 delete state.purchased;
 delete state.purchasedUpgrades;
 delete state.unlockedUpgrades;
 delete state.evolutionTier;
 delete state.adaptationV2;
 return state;
}

export let S=migrate(JSON.parse(localStorage.getItem('bmx8')||'null'));
export let sessionDone=false;
export function save(){localStorage.setItem('bmx8',JSON.stringify(S));}
export function setSessionDone(value){sessionDone=value;}
export function vib(pattern){if(navigator.vibrate)navigator.vibrate(pattern);}
export function awardStars(accuracy,gameKey){
 const earned=Math.max(3,Math.round((Number(accuracy)||0)/8));
 S.stars=Math.max(0,finite(S.stars))+earned;
 save();
 window.dispatchEvent(new CustomEvent('stars:changed',{detail:{earned,total:S.stars,gameKey}}));
 return earned;
}
export function rewardLevelUps(){return 0;}
export function totalLevelUps(){return Object.values(S.levels).reduce((sum,level)=>sum+Math.max(0,finite(level)-1),0);}
save();
