// Baut die App zu einer einzigen, offline lauffähigen index.html zusammen:  node build.js
const fs=require('fs'),p=require('path'),src=p.join(__dirname,'src');
const r=f=>fs.readFileSync(p.join(src,f),'utf8');
const html=r('index.tpl.html').replace('/*CSS*/',()=>r('styles.css')).replace('/*JS*/',()=>['core.js','views.js','actions.js'].map(r).join('\n'));
fs.writeFileSync(p.join(__dirname,'index.html'),html);
console.log('index.html',(html.length/1024).toFixed(1)+' kB');
