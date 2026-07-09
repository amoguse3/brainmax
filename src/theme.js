import { themes } from './data/theme-data.js';
const ctx = document.getElementById('ctx');
export function applyTheme(i){
  const t = themes[i];
  document.documentElement.style.setProperty('--a1', t.a[0]);
  document.documentElement.style.setProperty('--a2', t.a[1]);
  document.documentElement.style.setProperty('--a3', t.a[2]);
  ctx.textContent = t.n;
}