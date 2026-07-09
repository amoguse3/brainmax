// calm lavender/purple aurora themes; hues held in the 285-330 band, low chroma
export const themes = [
  {n:'Intellect',  a:['oklch(50% 0.14 300)','oklch(46% 0.12 288)','oklch(54% 0.13 318)']},
  {n:'Logic',      a:['oklch(50% 0.13 290)','oklch(46% 0.11 300)','oklch(52% 0.12 282)']},
  {n:'Growth',     a:['oklch(52% 0.13 310)','oklch(48% 0.12 300)','oklch(54% 0.13 322)']},
  {n:'Focus',      a:['oklch(50% 0.14 300)','oklch(46% 0.13 315)','oklch(52% 0.12 292)']},
  {n:'Creativity', a:['oklch(52% 0.14 322)','oklch(48% 0.13 300)','oklch(54% 0.13 330)']}
];
export function applyTheme(i){
  const t = themes[i];
  document.documentElement.style.setProperty('--a1', t.a[0]);
  document.documentElement.style.setProperty('--a2', t.a[1]);
  document.documentElement.style.setProperty('--a3', t.a[2]);
  document.getElementById('ctx').textContent = t.n;
}