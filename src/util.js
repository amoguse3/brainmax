export function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
export function qs(s,p=document){ return p.querySelector(s); }
export function qsa(s,p=document){ return [...p.querySelectorAll(s)]; }