import { initEngagement } from './engagement.js';
import { S } from './state.js';
import { EVOLUTIONS } from './evolutions.js';

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function seededNoise(index) {
 const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
 return value - Math.floor(value);
}

export function makeBrainPts(count) {
 const points = [];
 for (let i = 0; i < count; i += 1) {
 const yBase = 1 - 2 * ((i + 0.5) / count);
 const ring = Math.sqrt(Math.max(0, 1 - yBase * yBase));
 const angle = i * GOLDEN_ANGLE;
 const noise = seededNoise(i);
 let x = Math.cos(angle) * ring * 1.14;
 let y = yBase * 0.84;
 let z = Math.sin(angle) * ring * 0.92;
 const frontalBulge = 1 + 0.08 * clamp((z + 0.35) / 1.2, 0, 1);
 const rearTaper = 1 - 0.05 * clamp((-z + 0.55) / 1.5, 0, 1);
 x *= frontalBulge * rearTaper;
 const gyri = Math.sin(angle * 8 + yBase * 10) * 0.036 + Math.sin(angle * 15 - yBase * 7) * 0.021 + Math.cos(x * 12 + z * 8) * 0.014;
 const shell = i % 7 === 0 ? 0.82 + noise * 0.1 : 0.97 + gyri;
 x *= shell;
 z *= shell;
 if (y < -0.42) y = -0.42 + (y + 0.42) * 0.38;
 if (y < 0.02) x *= 1.04 + (0.02 - y) * 0.1;
 const cleft = 0.075 * clamp((y + 0.28) / 0.92, 0, 1) * (1 - Math.min(0.62, Math.abs(z) * 0.5));
 x += (x < 0 ? -1 : 1) * cleft;
 z += 0.06 * (1 - yBase * yBase) - 0.016;
 points.push({ x, y, z, size:0.72 + seededNoise(i + 9000) * 0.55, seed:seededNoise(i + 14000), group:i % 5 });
 }
 return points;
}

function networkScore() {
 const zoneTotal = Object.values(S.zones || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
 return Math.max(0, (Number(S.cq) || 100) - 100) + (Number(S.sessions) || 0) * 72 + zoneTotal * 1.35;
}

function networkState() {
 const score = networkScore();
 let index = 0;
 EVOLUTIONS.forEach((item, i) => { if (score >= item.at) index = i; });
 return { score, index, stage:EVOLUTIONS[index], next:EVOLUTIONS[index + 1] };
}

function strongestGroup() {
 const keys = ['frontal','parietal','hippo','creative','reason'];
 let winner = 0;
 keys.forEach((key, index) => { if ((S.zones?.[key] || 0) > (S.zones?.[keys[winner]] || 0)) winner = index; });
 return winner;
}

function makeLinks(points) {
 const anchors = points.map((_, i) => i).filter(i => i % 13 === 0);
 const links = [];
 anchors.forEach((from, order) => {
 const a = points[from];
 let nearest = [];
 for (let to = 0; to < points.length; to += 11) {
 if (to === from) continue;
 const b = points[to];
 const distance = (a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2;
 if (distance < 0.22) nearest.push({ to, distance });
 }
 nearest.sort((m,n) => m.distance-n.distance).slice(0,2).forEach((item, branch) => {
 links.push({ from, to:item.to, seed:seededNoise(order * 7 + branch + 22000) });
 });
 });
 return links.sort((a,b) => a.seed-b.seed);
}

function installStatus() {
 const host = document.querySelector('.brain-center');
 if (!host) return null;
 const style = document.createElement('style');
 style.textContent = `
 .brain-adaptation{position:absolute;left:50%;top:100%;width:190px;transform:translate(-50%,8px);font:650 .5rem 'JetBrains Mono',monospace;letter-spacing:.07em;text-transform:uppercase;color:var(--text-3);pointer-events:none;white-space:nowrap}
 .brain-adaptation b{color:var(--lav);font-weight:700}.brain-adaptation i{display:inline-block;width:4px;height:4px;margin:0 7px 1px;border-radius:50%;background:var(--lav-2);box-shadow:0 0 7px var(--lav-2)}
 `;
 document.head.appendChild(style);
 const label = document.createElement('div');
 label.className = 'brain-adaptation';
 host.appendChild(label);
 return label;
}

export function mountStatBrain() {
 const canvas = document.getElementById('brainCanvas');
 if (!canvas) return;
 initEngagement();
 const context = canvas.getContext('2d');
 const width = canvas.width;
 const height = canvas.height;
 const points = makeBrainPts(1080);
 const links = makeLinks(points);
 const centerX = width / 2;
 const centerY = height / 2 - 2;
 const scale = 113;
 const pitch = -0.12;
 const pitchCos = Math.cos(pitch);
 const pitchSin = Math.sin(pitch);
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const rotationSpeed = reducedMotion ? 0.00007 : 0.0003;
 const status = installStatus();
 let startedAt = performance.now();
 let pausedAt = 0;
 let lastStateUpdate = 0;
 let model = networkState();
 let focusGroup = strongestGroup();

 function updateModel(now) {
 if (now-lastStateUpdate < 1200) return;
 model = networkState();
 focusGroup = strongestGroup();
 const visiblePaths = Math.min(96, 12 + model.index * 10);
 if (status) status.innerHTML = `<b>${model.stage.name}</b><i></i>${String(visiblePaths).padStart(2,'0')} paths`;
 lastStateUpdate = now;
 }

 function project(point, rotationCos, rotationSin) {
 const x = point.x * rotationCos - point.z * rotationSin;
 const z = point.x * rotationSin + point.z * rotationCos;
 const y = point.y * pitchCos - z * pitchSin;
 const depth = point.y * pitchSin + z * pitchCos;
 const perspective = 3.65 / (3.65 - depth);
 return { x:centerX + x*scale*perspective, y:centerY-y*scale*perspective, depth, perspective, size:point.size, seed:point.seed, group:point.group };
 }

 function draw(now) {
 updateModel(now);
 const rotation = (now-startedAt) * rotationSpeed;
 const rotationCos = Math.cos(rotation);
 const rotationSin = Math.sin(rotation);
 const time = reducedMotion ? 0 : now * 0.001;
 context.clearRect(0,0,width,height);
 const projected = points.map(point => project(point,rotationCos,rotationSin));
 const linkCount = Math.min(links.length,12 + model.index*10);

 if (model.index >= 3) {
 const coreAlpha = 0.025 + model.index*0.008 + Math.sin(time*1.1)*0.006;
 const glow = context.createRadialGradient(centerX,centerY-3,3,centerX,centerY-3,54);
 glow.addColorStop(0,`oklch(84% .10 300 / ${coreAlpha})`);
 glow.addColorStop(1,'oklch(60% .08 300 / 0)');
 context.fillStyle = glow;
 context.fillRect(centerX-58,centerY-61,116,116);
 }

 context.lineCap = 'round';
 for (let i=0;i<linkCount;i+=1) {
 const link = links[i], a=projected[link.from], b=projected[link.to];
 if (a.depth < -0.34 && b.depth < -0.34) continue;
 const front = clamp((a.depth+b.depth+2.2)/4.4,0,1);
 if (model.index >= 5) {
 context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);
 context.strokeStyle = `oklch(76% .055 292 / ${0.018+front*0.022})`;
 context.lineWidth = 2.2;context.stroke();
 }
 context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);
 context.strokeStyle = `oklch(${64+front*16}% .10 ${294+link.seed*18} / ${0.035+front*0.08})`;
 context.lineWidth = .45 + front*.35;context.stroke();
 }

 const pulseCount = model.index < 2 ? 0 : Math.min(7,1+Math.floor(model.index/2));
 for (let i=0;i<pulseCount;i+=1) {
 const link = links[(i*17+model.index*5)%Math.max(1,linkCount)], a=projected[link.from], b=projected[link.to];
 const speed = .09 + model.index*.012;
 const t = (time*speed + link.seed + i/pulseCount) % 1;
 const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
 context.beginPath();context.arc(x,y,1.1+model.index*.05,0,TAU);
 context.shadowColor='oklch(91% .11 300 / .9)';context.shadowBlur=7;
 context.fillStyle='oklch(91% .09 300 / .9)';context.fill();context.shadowBlur=0;
 }

 const ordered = projected.map((point,index)=>({...point,index})).sort((a,b)=>a.depth-b.depth);
 ordered.forEach(point => {
 const depth = clamp((point.depth+1.12)/2.24,0,1);
 const selected = point.group===focusGroup && point.seed < (.025+model.index*.012);
 const synchrony = model.index>=3 ? Math.max(0,Math.sin(time*(.7+model.index*.025)+point.seed*TAU)) : 0;
 const persistent = model.index>=6 && selected ? .34 : 0;
 const activity = selected ? .38+synchrony*.34+persistent : 0;
 const radius = (0.62+depth*1.22)*point.size*point.perspective*(selected?1.16:1);
 if (selected) { context.shadowColor='oklch(88% .13 304 / .9)';context.shadowBlur=7+model.index*.45; }
 context.beginPath();context.arc(point.x,point.y,radius,0,TAU);
 const hemisphereShift = model.index>=7 ? (points[point.index].x<0?-7:7) : 0;
 context.fillStyle=`oklch(${51+depth*35+activity*8}% ${0.11+depth*.1+activity*.035} ${291+depth*19+hemisphereShift} / ${Math.min(.98,.18+depth*.78+activity*.22)})`;
 context.fill();context.shadowBlur=0;
 });
 requestAnimationFrame(draw);
 }

 document.addEventListener('visibilitychange',()=>{
 if(document.hidden) pausedAt=performance.now();
 else if(pausedAt){startedAt+=performance.now()-pausedAt;pausedAt=0;}
 });
 requestAnimationFrame(draw);
}
