export const SKILLS=['state','spatial','math','switching','episodic','inhibition','creativity','dual'];
const skillSeed=()=>({rating:1000,peak:1000,uncertainty:220,sessions:0,lastAt:0,history:[]});
export const DEF={cq:100,sessions:0,records:0,bestAcc:0,zones:{frontal:15,parietal:15,hippo:15,creative:15,reason:15},levels:{state:1,rotation:1,math:1,switching:1,episodic:1,inhibition:1,creativity:1,dual:1},skills:Object.fromEntries(SKILLS.map(key=>[key,skillSeed()])),best:{},lab:{sessions:[],baselineStartedAt:Date.now()},neurons:{balance:0,lastTick:Date.now(),rewardedLevels:{},evolution:0,betaTester:false}};
function clone(value){return JSON.parse(JSON.stringify(value));}
function migrate(raw){const s={...clone(DEF),...(raw||{})};s.zones={...DEF.zones,...(s.zones||{})};s.levels={...DEF.levels,...(s.levels||{})};s.best=s.best||{};s.lab={...DEF.lab,...(s.lab||{})};s.lab.sessions=Array.isArray(s.lab.sessions)?s.lab.sessions:[];s.skills=s.skills||{};SKILLS.forEach(key=>{const legacy=key==='spatial'?s.levels.rotation:s.levels[key];s.skills[key]={...skillSeed(),...(s.skills[key]||{})};if(!s.skills[key].migrated&&legacy>1){s.skills[key].rating=1000+(legacy-1)*70;s.skills[key].peak=s.skills[key].rating;s.skills[key].migrated=true;}s.skills[key].history=Array.isArray(s.skills[key].history)?s.skills[key].history:[];});s.neurons={...DEF.neurons,...(s.neurons||{})};s.neurons.rewardedLevels=s.neurons.rewardedLevels||{};return s;}
export let S=migrate(JSON.parse(localStorage.getItem('bmx8')||'null'));
const betaParam=new URLSearchParams(location.search).get('beta');if(betaParam==='1')S.neurons.betaTester=true;if(betaParam==='0')S.neurons.betaTester=false;
export let sessionDone=false;
export function save(){localStorage.setItem('bmx8',JSON.stringify(S));}
export function setSessionDone(value){sessionDone=value;}
export function vib(pattern){if(navigator.vibrate)navigator.vibrate(pattern);}
export function totalLevelUps(){return Object.values(S.levels).reduce((sum,level)=>sum+Math.max(0,(Number(level)||1)-1),0);}
export function neuronRate(){return S.neurons.betaTester?100000000/3600:totalLevelUps()*.02;}
export function settleNeurons(now=Date.now()){const elapsed=Math.max(0,Math.min(36000,(now-(S.neurons.lastTick||now))/1000)),earned=elapsed*neuronRate();S.neurons.balance=Math.max(0,(Number(S.neurons.balance)||0)+earned);S.neurons.lastTick=now;save();return earned;}
export function rewardLevelUps(gameKey){const current=Math.max(1,Number(S.levels[gameKey])||1),rewarded=Math.max(1,Number(S.neurons.rewardedLevels[gameKey])||1),gained=Math.max(0,current-rewarded);if(gained){S.neurons.balance+=gained*40;S.neurons.rewardedLevels[gameKey]=current;save();}return gained;}
export function buyEvolution(tier,cost){settleNeurons();if(tier!==S.neurons.evolution+1||S.neurons.balance<cost)return false;S.neurons.balance-=cost;S.neurons.evolution=tier;save();window.dispatchEvent(new CustomEvent('brain:evolved',{detail:{tier}}));return true;}
save();
