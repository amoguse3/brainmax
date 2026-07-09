export function getArticles(S){
  return [
    {t:'Can You Train Creativity?',emoji:'🌀',zone:'Creativity',un:()=>true,body:`<p>Yes. A 2024 meta-analysis in <strong>Psychological Bulletin</strong> reviewed 5 decades and confirmed it works.</p><div class="callout">Quantity breeds quality. Force out more ideas, the later ones get more original.</div>`,x:450,y:450},
    {t:'The Too Easy Trap',emoji:'🧠',zone:'Psychology',un:()=>true,body:`<p>Pride stops you: I already know I can. <strong>Reactance</strong> + ego protection.</p><div class="callout">Fix: the Frontier. Train your weakest zone.</div>`,x:640,y:360},
    {t:'Mastery Beats Streaks',emoji:'🏆',zone:'Retention',un:()=>true,body:`<p>Streaks backfire. External rewards <strong>crowd out</strong> internal motivation.</p><div class="callout">Get sharper, not feed a flame.</div>`,x:270,y:360},
    {t:'Mental Rotation Science',emoji:'🔮',zone:'Parietal',un:()=>S.levels.rotation>=2,body:`<p>Shepard-Metzler (1971). Reaction time rises with rotation angle.</p><div class="callout">2025 Nature: gains persist 90 days.</div>`,x:640,y:600},
    {t:'Semax & BDNF',emoji:'💉',zone:'Hippocampus',un:()=>S.cq>=120,body:`<p>Synthetic peptide. One dose raised BDNF <strong>1.4x</strong> in rat hippocampus.</p><div class="callout">Human RCTs limited: Tier 2.</div>`,x:270,y:600},
    {t:'Creatine for Brain',emoji:'⚡',zone:'Global',un:()=>S.sessions>=3,body:`<p>Your brain is an energy hog. Creatine buffers ATP, strongest under stress.</p><div class="callout">5g daily. Higher doses may help.</div>`,x:450,y:700},
    {t:'Stroop & Focus',emoji:'🎨',zone:'Frontal',un:()=>S.levels.stroop>=2,body:`<p>Suppressing the automatic read trains the frontal lobe and anterior cingulate.</p><div class="callout">Better inhibition spills into real focus.</div>`,x:820,y:480},
    {t:'Lion Mane NGF',emoji:'🦁',zone:'Neuro',un:()=>S.cq>=140,body:`<p>Hericenones stimulate NGF synthesis. Effects build over weeks.</p><div class="callout">Tier 2. Give it a month.</div>`,x:90,y:480}
  ];
}