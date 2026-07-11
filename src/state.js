export const DEF = {
  cq:100,
  sessions:0,
  records:0,
  bestAcc:0,
  zones:{frontal:15,parietal:15,hippo:15,creative:15,reason:15},
  levels:{rotation:1,math:1,memory:1,stroop:1,creative:1,critical:1},
  best:{},
  neurons:{balance:0,lastTick:Date.now(),rewardedLevels:{},evolution:0,betaTester:false}
};

function migrate(raw){
  const state=raw||structuredClone(DEF);
  state.zones={...DEF.zones,...(state.zones||{})};
  state.levels={...DEF.levels,...(state.levels||{})};
  state.best=state.best||{};
  state.neurons={...DEF.neurons,...(state.neurons||{})};
  state.neurons.rewardedLevels=state.neurons.rewardedLevels||{};
  if(Number.isFinite(state.coins)&&!state.neurons.balance)state.neurons.balance=Math.floor(state.coins);
  delete state.coins;
  return state;
}

export let S=migrate(JSON.parse(localStorage.getItem('bmx8')||'null'));
const betaParam=new URLSearchParams(location.search).get('beta');
if(betaParam==='1')S.neurons.betaTester=true;
if(betaParam==='0')S.neurons.betaTester=false;
export let sessionDone=false;
export function save(){localStorage.setItem('bmx8',JSON.stringify(S));}
export function setSessionDone(val){sessionDone=val;}
export function vib(pattern){if(navigator.vibrate)navigator.vibrate(pattern);}
export function totalLevelUps(){return Object.values(S.levels).reduce((sum,level)=>sum+Math.max(0,(Number(level)||1)-1),0);}
export function neuronRate(){return S.neurons.betaTester?100000000/3600:totalLevelUps()*.02;}
export function settleNeurons(now=Date.now()){
  const elapsed=Math.max(0,Math.min(10*60*60,(now-(S.neurons.lastTick||now))/1000));
  const earned=elapsed*neuronRate();
  S.neurons.balance=Math.max(0,(Number(S.neurons.balance)||0)+earned);
  S.neurons.lastTick=now;
  save();
  return earned;
}
export function rewardLevelUps(gameKey){
  const current=Math.max(1,Number(S.levels[gameKey])||1),rewarded=Math.max(1,Number(S.neurons.rewardedLevels[gameKey])||1),gained=Math.max(0,current-rewarded);
  if(gained){S.neurons.balance+=gained*40;S.neurons.rewardedLevels[gameKey]=current;save();}
  return gained;
}
export function buyEvolution(tier,cost){
  settleNeurons();
  if(tier!==S.neurons.evolution+1||S.neurons.balance<cost)return false;
  S.neurons.balance-=cost;S.neurons.evolution=tier;save();
  window.dispatchEvent(new CustomEvent('brain:evolved',{detail:{tier}}));
  return true;
}
save();
