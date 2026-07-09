import { articles } from './data/articles.js';
import { S } from './state.js';
const reader=document.getElementById('reader');
const readerBody=document.getElementById('readerBody');
export function openArticle(i){const a=articles[i];readerBody.innerHTML=`<div class="reader-tier">${a.zone}</div><h1 class="reader-h1">${a.t}</h1><div class="reader-meta">Library entry</div>${a.body}`;reader.classList.add('open');readerBody.scrollTop=0;}
export function closeArticle(){reader.classList.remove('open');}
export function bindReader(){document.getElementById('readerBack').addEventListener('click', closeArticle);} 
export function isUnlocked(a){return a.un({S});}