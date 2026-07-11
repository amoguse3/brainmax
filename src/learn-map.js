import { articles } from './data/articles.js';
import { openArticle } from './reader.js';

const mapVp=document.getElementById('mapVp');
const mapWorld=document.getElementById('mapWorld');
const categoryOrder=['core','mechanism','training','lifestyle','learning','myth','case','evidence'];
const categoryNames={core:'Start here',mechanism:'How cognition works',training:'Training science',lifestyle:'State and lifestyle',learning:'Learning that sticks',myth:'Myth Lab',case:'Case files',evidence:'Evidence skills'};

function extractClaim(article){
  const match=article.body.match(/<h2>The claim<\/h2><p>(.*?)<\/p>/);
  return match?match[1].replace(/<[^>]+>/g,''):'';
}
function evidenceType(article){
  const match=article.body.match(/<div class="evidence-meta"><span>(.*?)<\/span>/);
  return match?match[1]:'Evidence';
}
function readTime(article){
  const match=article.body.match(/<div class="evidence-meta">.*?<span>(.*?)<\/span><\/div>/);
  return match?match[1]:'3 min';
}

export function renderMap(){
  mapWorld.innerHTML='';
  mapWorld.className='evidence-index';
  categoryOrder.forEach(category=>{
    const section=document.createElement('section');
    section.className='evidence-section';
    const entries=articles.filter(article=>article.cat===category);
    if(!entries.length)return;
    section.innerHTML=`<div class="evidence-section-head"><h2>${categoryNames[category]}</h2><span>${entries.length} notes</span></div>`;
    entries.forEach((article,index)=>{
      const unlocked=article.un();
      const row=document.createElement('article');
      row.className=`evidence-row ${unlocked?'unlocked':'locked'}`;
      const globalIndex=articles.indexOf(article)+1;
      row.innerHTML=`
        <div class="evidence-mark">${unlocked?article.emoji:'·'}</div>
        <div class="evidence-summary">
          <div class="evidence-row-meta"><span>${article.zone}</span><span>${evidenceType(article)} · ${readTime(article)}</span></div>
          <h3>${unlocked?article.t:'Locked evidence'}</h3>
          <p>${unlocked?extractClaim(article):'Keep training to unlock this evidence note.'}</p>
        </div>
        <span class="evidence-number">${String(globalIndex).padStart(2,'0')}</span>`;
      if(unlocked){
        row.tabIndex=0;
        row.setAttribute('role','button');
        row.onclick=()=>openArticle(article);
        row.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openArticle(article);}};
      }
      section.appendChild(row);
    });
    mapWorld.appendChild(section);
  });
}

export function drawMapLines(){}
export function applyMapTransform(){}
export function centerMap(){mapVp.scrollTop=0;}
export function bindMap(){
  mapVp.classList.add('evidence-vp');
  renderMap();
}
