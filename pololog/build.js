// Baut die App zu einer einzigen, offline lauffähigen index.html zusammen:  node build.js
const fs=require('fs'),p=require('path'),src=p.join(__dirname,'src');
const r=f=>fs.readFileSync(p.join(src,f),'utf8');
const font=fs.readFileSync(p.join(src,'assets/barlow-condensed-latin-700-normal.woff2')).toString('base64');
const fontCss=`@font-face{font-family:"Barlow Condensed";font-weight:700;font-style:normal;font-display:swap;src:url(data:font/woff2;base64,${font}) format("woff2")}`;
const crest=JSON.parse(r('assets/crest.json'));
// Optional: src/owner-lock.json ({"salt":"…","hash":"…"}, aus Einstellungen → „Passwort-Code kopieren“) legt das Passwort fest für alle Geräte fest.
const lockFile=p.join(src,'owner-lock.json');
const lock=fs.existsSync(lockFile)?JSON.stringify(JSON.parse(fs.readFileSync(lockFile,'utf8'))):'null';
// Übungsfotos (Start/Ende) aus src/assets/ex, Zuordnung über index.json
const exDir=p.join(src,'assets/ex'), exIdx=JSON.parse(fs.readFileSync(p.join(exDir,'index.json'),'utf8')), exImg={};
for(const n in exIdx) exImg[n]='data:image/jpeg;base64,'+fs.readFileSync(p.join(exDir,exIdx[n])).toString('base64');
const js=`const CREST=${JSON.stringify(crest)};\nconst EX_IMG=${JSON.stringify(exImg)};\n`+['core.js','views.js','actions.js'].map(r).join('\n').replace('/*LOCK*/null',()=>lock);
const html=r('index.tpl.html').replace('/*CSS*/',()=>r('styles.css').replace('/*FONT*/',()=>fontCss)).replace('/*JS*/',()=>js);
fs.writeFileSync(p.join(__dirname,'index.html'),html);
console.log('index.html',(html.length/1024).toFixed(1)+' kB');
