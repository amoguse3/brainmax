export const themes = [
  {n:'Intellect', accent:'oklch(76% 0.15 300)', a:['oklch(56% 0.17 300)','oklch(50% 0.13 270)','oklch(58% 0.15 325)']},
  {n:'Training', accent:'oklch(79% 0.13 205)', a:['oklch(56% 0.15 205)','oklch(52% 0.16 285)','oklch(59% 0.14 245)']},
  {n:'Stack', accent:'oklch(80% 0.15 150)', a:['oklch(54% 0.15 150)','oklch(51% 0.12 180)','oklch(57% 0.13 125)']},
  {n:'Protocol', accent:'oklch(84% 0.14 82)', a:['oklch(58% 0.15 75)','oklch(52% 0.13 35)','oklch(59% 0.12 105)']},
  {n:'Library', accent:'oklch(78% 0.16 20)', a:['oklch(56% 0.16 20)','oklch(52% 0.14 335)','oklch(58% 0.13 48)']}
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
