export const themes = [
  {n:'Intellect',a:['oklch(52% 0.24 300)','oklch(48% 0.2 270)','oklch(54% 0.22 335)']},
  {n:'Logic',a:['oklch(52% 0.2 265)','oklch(58% 0.16 220)','oklch(50% 0.18 245)']},
  {n:'Growth',a:['oklch(58% 0.18 150)','oklch(60% 0.15 175)','oklch(54% 0.2 135)']},
  {n:'Focus',a:['oklch(64% 0.16 70)','oklch(60% 0.18 45)','oklch(66% 0.15 90)']},
  {n:'Creativity',a:['oklch(58% 0.22 340)','oklch(60% 0.19 20)','oklch(54% 0.2 310)']}
];
export function applyTheme(i){
  const t = themes[i];
  document.documentElement.style.setProperty('--a1', t.a[0]);
  document.documentElement.style.setProperty('--a2', t.a[1]);
  document.documentElement.style.setProperty('--a3', t.a[2]);
  document.getElementById('ctx').textContent = t.n;
}