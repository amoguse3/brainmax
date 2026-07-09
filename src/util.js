export function vib(p){ if (navigator.vibrate) navigator.vibrate(p); }
export function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
export function avg(arr){ return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }
export function qs(sel, root=document){ return root.querySelector(sel); }
export function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }
export function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }