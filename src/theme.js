export const themes = [
  {n:'Intellect', accent:'oklch(80% 0.11 300)', a:['oklch(56% 0.17 300)','oklch(50% 0.13 282)','oklch(58% 0.14 320)']},
  {n:'Training', accent:'oklch(84% 0.09 225)', a:['oklch(54% 0.16 298)','oklch(50% 0.11 235)','oklch(57% 0.14 315)']},
  {n:'Stack', accent:'oklch(82% 0.10 236)', a:['oklch(53% 0.15 300)','oklch(49% 0.11 240)','oklch(56% 0.13 286)']},
  {n:'Protocol', accent:'oklch(82% 0.10 300)', a:['oklch(55% 0.16 305)','oklch(50% 0.12 280)','oklch(57% 0.13 325)']},
  {n:'Library', accent:'oklch(84% 0.08 225)', a:['oklch(54% 0.15 302)','oklch(49% 0.10 230)','oklch(57% 0.13 320)']}
];
export function applyTheme(i){
  const t=themes[i];
  document.documentElement.style.setProperty('--a1',t.a[0]);
  document.documentElement.style.setProperty('--a2',t.a[1]);
  document.documentElement.style.setProperty('--a3',t.a[2]);
  document.documentElement.style.setProperty('--section-accent',t.accent);
  document.documentElement.dataset.section=String(i);
  document.getElementById('ctx').textContent=t.n;
}
