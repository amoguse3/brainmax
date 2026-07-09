export const DEF = {cq:100,sessions:0,records:0,bestAcc:0,zones:{frontal:15,parietal:15,hippo:15,creative:15,reason:15},levels:{rotation:1,math:1,memory:1,stroop:1,creative:1,critical:1},best:{}};
export let S = JSON.parse(localStorage.getItem('bmx8') || 'null') || structuredClone(DEF);
export function save(){ localStorage.setItem('bmx8', JSON.stringify(S)); }
export function resetState(){ S = structuredClone(DEF); save(); }