// Baut die App zu einer einzigen, offline lauffähigen index.html zusammen:  node build.js
const fs=require('fs'),p=require('path'),src=p.join(__dirname,'src');
const r=f=>fs.readFileSync(p.join(src,f),'utf8');
const font=fs.readFileSync(p.join(src,'assets/barlow-condensed-latin-700-normal.woff2')).toString('base64');
const fontCss=`@font-face{font-family:"Barlow Condensed";font-weight:700;font-style:normal;font-display:swap;src:url(data:font/woff2;base64,${font}) format("woff2")}`;
const crest=JSON.parse(r('assets/crest.json'));
const js=`const CREST=${JSON.stringify(crest)};\n`+['core.js','views.js','actions.js'].map(r).join('\n');
const html=r('index.tpl.html').replace('/*CSS*/',()=>r('styles.css').replace('/*FONT*/',()=>fontCss)).replace('/*JS*/',()=>js);
fs.writeFileSync(p.join(__dirname,'index.html'),html);
console.log('index.html',(html.length/1024).toFixed(1)+' kB');
