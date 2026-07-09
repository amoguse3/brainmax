export let stack = [
  {id:'cr',nm:'Creatine',bcls:'sbadge-cr',ab:'Cr',ds:'5g · Morning · ATP resynthesis',b:8,zone:0},
  {id:'sx',nm:'Semax',bcls:'sbadge-sx',ab:'Sx',ds:'600mcg · Intranasal · BDNF ↑1.4x',b:12,zone:1},
  {id:'om',nm:'Omega-3',bcls:'sbadge-om',ab:'Ω3',ds:'2000mg · Membranes',b:6,zone:2},
  {id:'lm',nm:"Lion's Mane",bcls:'sbadge-lm',ab:'🦁',ds:'1000mg · NGF synthesis',b:5,zone:3},
  {id:'lt',nm:'L-Theanine',bcls:'sbadge-lt',ab:'Lt',ds:'200mg · Alpha waves',b:4,zone:4}
];
export const available = [
  {id:'bc',nm:'Bacopa',bcls:'sbadge-sx',ab:'Bc',ds:'300mg · 8-12wk memory',b:5,zone:1},
  {id:'ag',nm:'Alpha-GPC',bcls:'sbadge-cr',ab:'Ag',ds:'300mg · Choline',b:4,zone:0},
  {id:'ps',nm:'PS',bcls:'sbadge-om',ab:'Ps',ds:'100mg · Membranes',b:3,zone:2},
  {id:'cu',nm:'Curcumin',bcls:'sbadge-lm',ab:'Cu',ds:'500mg · Anti-inflam',b:4,zone:3},
  {id:'pr',nm:'Probiotic',bcls:'sbadge-lt',ab:'Pr',ds:'Gut-brain axis',b:3,zone:4},
  {id:'md',nm:'Modafinil',bcls:'sbadge-cr',ab:'Md',ds:'100mg · Rx',b:6,zone:0}
];
export function setStack(next){ stack = next; }