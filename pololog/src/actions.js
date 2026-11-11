/* ============ PoloLog – Router, Aktionen, Export/Import ============ */
const NAVMAP={training:'saison',plan:'kraft',timer:'kraft',turnier:'turniere',spiel:'turniere'};
const NAV=[['heute','Heute','home'],['saison','Saison','calendar'],['kraft','Training','dumbbell'],['turniere','Turniere','trophy'],['stats','Statistik','chart']];
let lastRoute='';
function route(){ const p=(location.hash||'#/heute').slice(2).split('/'); return views[p[0]]?p:['heute']; }
function go(h){ if(location.hash===h) render(); else location.hash=h; }
function render(){
  const r=route(), key=r.join('/'), y=window.scrollY;
  $('#view').innerHTML=views[r[0]](r[1],r[2]);
  const on=NAVMAP[r[0]]||r[0];
  $$('[data-nav]').forEach(a=>a.classList.toggle('on',a.dataset.nav===on));
  const v=$('#view'); v.classList.remove('enter');
  if(key!==lastRoute){ window.scrollTo(0,0); lastRoute=key; void v.offsetWidth; v.classList.add('enter'); } else window.scrollTo(0,y);
  if(r[0]==='kraft'&&UI.exq) filterEx($('#view'),UI.exq);
}
function buildNav(){
  const link=([k,l,i])=>`<a class="nav" data-nav="${k}" href="#/${k}">${ic(i)}<span>${l}</span></a>`;
  $('#tabs').innerHTML=link(NAV[0])+link(NAV[1])+`<button class="go" data-a="start" aria-label="Training starten">${wheelSvg('')}<span>Training starten</span></button>`+link(NAV[2])+link(NAV[3]);
  const brand=`<div class="brand">${crestSvg('crest')}<div>PoloLog<small>Rothe Mühle Essen</small></div></div>`;
  $('#side').innerHTML=brand+`<button class="btn pri block" data-a="start">${ic('play','sm')}Training starten</button>`+NAV.map(link).join('')+`<a class="nav" data-nav="mehr" href="#/mehr">${ic('gear')}<span>Einstellungen</span></a>`;
  $('#top').innerHTML=brand+`<span class="sp"></span><a class="iconbtn plain" href="#/stats" aria-label="Statistik">${ic('chart')}</a><a class="iconbtn plain" href="#/mehr" aria-label="Einstellungen">${ic('gear')}</a>`;
  $('#run').innerHTML=`<div class="top"><span id="rinfo"></span><button class="iconbtn plain" style="color:inherit" data-a="trClose" aria-label="Timer beenden">${ic('x')}</button></div>
   <div class="phase" id="rphase"></div><div class="dial">${wheelSvg('')}<div class="time" id="rtime"></div></div><div class="next" id="rnext"></div><div class="bar"><i id="rbar"></i></div>
   <div class="ctl"><button data-a="trPrev" aria-label="Zurück">${ic('prev')}</button><button class="main" data-a="trToggle" id="rtog" aria-label="Pause"></button><button data-a="trSkip" aria-label="Weiter">${ic('skip')}</button></div>`;
  const fav=$('link[rel=icon]'); if(fav) fav.href='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 0 540 558"><rect x="-40" width="540" height="558" rx="90" fill="#fff"/><path fill="#d71f26" fill-rule="evenodd" d="${CREST.crest}"/></svg>`);
}
/* ---- Sheet ---- */
function sheet(title,html){ $('#sheet').innerHTML=`<div class="sheet"><div class="hd"><h2>${title}</h2><button class="iconbtn" data-a="closeSheet">${ic('x')}</button></div>${html}</div>`; $('#sheet').classList.add('on'); }
function closeSheet(){ $('#sheet').classList.remove('on'); $('#sheet').innerHTML=''; render(); }
const formVals=root=>Object.fromEntries($$('[name]',root).map(i=>[i.name,i.value]));
function filterEx(root,q){ q=q.trim().toLowerCase(); $$('.pick',root).forEach(b=>b.style.display=!q||b.dataset.name.includes(q)?'':'none'); $$('[data-cat]',root).forEach(c=>c.style.display=$$('.pick',c).some(b=>b.style.display!=='none')?'':'none'); }
function download(name,text,type='application/json'){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500); }
async function copyText(t){ try{ await navigator.clipboard.writeText(t); }catch(e){ const ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } toast('In die Zwischenablage kopiert'); }

/* ---- Pausen-Timer ---- */
const Rest={end:0,iv:null};
function startRest(sec){ if(!sec) return; Rest.end=Date.now()+sec*1000; clearInterval(Rest.iv); Rest.iv=setInterval(tickRest,250); tickRest(); }
function stopRest(){ clearInterval(Rest.iv); $('#rest').classList.remove('on'); }
function tickRest(){
  const left=Math.ceil((Rest.end-Date.now())/1000);
  if(left<=0){ stopRest(); if(navigator.vibrate) navigator.vibrate([200,100,200]); beep(); toast('Pause vorbei, weiter geht’s'); return; }
  $('#rest').classList.add('on'); $('#restt').textContent='Pause '+mmss(left);
}
let AC; function beep(f=880,d=.35){ try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume(); const o=AC.createOscillator(), g=AC.createGain(); o.connect(g); g.connect(AC.destination); o.frequency.value=f; g.gain.value=.2; o.start(); o.stop(AC.currentTime+d); }catch(e){} }

/* ---- Neues Training ---- */
function entrySheet(v){
  v={type:'wasser',date:UI.sel||today(),time:'',title:'',planned:'',planId:'',repeat:'1',...v};
  const g=guideFor(v.date);
  sheet('Neuer Eintrag',`<input type="hidden" name="type" value="${v.type}">
   <div class="seg" style="margin-bottom:12px">${Object.keys(TYPES).map(k=>`<button class="${v.type===k?'on':''}" data-a="setType" data-v="${k}">${TYPES[k].short}</button>`).join('')}</div>
   <div class="grid g2">${field('Datum',`<input type="date" name="date" value="${v.date}">`)}${field('Uhrzeit',`<input type="time" name="time" value="${v.time}">`)}</div>
   ${field('Titel',`<input name="title" value="${esc(v.title)}" placeholder="${TYPES[v.type].label}${v.type==='kraft'?' / TRX':''}">`)}
   <div class="grid g2">${field('Geplante Dauer (min)',`<input name="planned" inputmode="numeric" value="${esc(v.planned)}" placeholder="${v.type==='kraft'?75:90}">`)}${field('Wöchentlich wiederholen',`<select name="repeat">${[1,2,4,6,8,12,16,20,26,40,52].map(n=>`<option value="${n}" ${v.repeat==n?'selected':''}>${n===1?'einmalig':n+' Wochen'}</option>`).join('')}</select>`)}</div>
   ${v.type==='kraft'?field('Trainingsplan',`<select name="planId"><option value="">– ohne Plan / später wählen –</option>${S.plans.map(p=>`<option value="${p.id}" ${v.planId===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select>`):''}
   ${g&&guideText(g,v.type)?`<p class="tiny muted">Die Vorgabe von ${esc(S.settings.trainer)} (${esc(g.title)}) wird automatisch übernommen.</p>`:''}
   <button class="btn pri block" data-a="saveEntry">Anlegen</button>`);
}
function tournSheet(){
  const d=UI.sel||today();
  sheet('Neues Turnier',`${field('Name',`<input name="name" placeholder="z. B. Deutsche Meisterschaft">`)}
   <div class="grid g2">${field('Von',`<input type="date" name="from" value="${d}">`)}${field('Bis',`<input type="date" name="to" value="${d}">`)}${field('Ort',`<input name="ort">`)}${field('Mein Team',`<input name="team" value="${esc((S.tournaments.slice(-1)[0]||{}).team||'')}">`)}</div>
   <button class="btn pri block" data-a="saveTourn">Anlegen</button>`);
}
function pickSheet(target){
  UI.pickTarget=target; const cats=[...new Set(S.exercises.map(e=>e.cat))];
  sheet('Übung hinzufügen',`<input placeholder="Suchen …" data-in="pickq" autofocus><div id="picklist" style="margin-top:8px">${cats.map(c=>`<div data-cat><div class="cathd">${esc(c)}</div>${S.exercises.filter(e=>e.cat===c).map(e=>`<button class="pick" data-a="addEx" data-id="${e.id}" data-name="${esc(e.name.toLowerCase())}"><span class="grow">${esc(e.name)}</span>${ic('plus','sm')}</button>`).join('')}</div>`).join('')}</div>
   <button class="btn block" style="margin-top:12px" data-a="editEx" data-id="">Eigene Übung anlegen</button>`);
}
function exSheet(id){
  const e=exById(id)||{id:'',name:'',cat:'Eigene',mode:'wr',note:'',orm:null};
  sheet(id?'Übung bearbeiten':'Neue Übung',`<input type="hidden" name="id" value="${e.id}">${field('Name',`<input name="name" value="${esc(e.name)}">`)}
   <div class="grid g2">${field('Kategorie',`<input name="cat" list="cats" value="${esc(e.cat)}"><datalist id="cats">${[...new Set(S.exercises.map(x=>x.cat))].map(c=>`<option value="${esc(c)}">`).join('')}</datalist>`)}
   ${field('Erfassung',`<select name="mode">${Object.entries(MODES).map(([k,l])=>`<option value="${k}" ${e.mode===k?'selected':''}>${l}</option>`).join('')}</select>`)}</div>
   ${field('Mein 1RM in kg (optional – für %-Vorgaben)',`<input name="orm" inputmode="decimal" value="${esc(fnum(e.orm))}">`)}
   ${field('Ausführung / Hinweise',`<textarea name="note">${esc(e.note)}</textarea>`)}
   <div class="row"><button class="btn pri grow" data-a="saveEx">Speichern</button>${id?`<button class="btn danger" data-a="delEx" data-id="${id}">${ic('trash','sm')}</button>`:''}</div>`);
}
function guideSheet(id){
  const g=S.guides.find(x=>x.id===id)||{id:'',title:'',from:weekStart(today()),to:addDays(weekStart(today()),6),kraft:'',trx:'',wasser:'',sonstiges:''};
  sheet('Wochenvorgabe',`<input type="hidden" name="id" value="${g.id}">${field('Titel',`<input name="title" value="${esc(g.title)}" placeholder="Woche 1">`)}
   <div class="grid g2">${field('Von',`<input type="date" name="from" value="${g.from}">`)}${field('Bis',`<input type="date" name="to" value="${g.to}">`)}</div>
   ${[['kraft','Kraft'],['trx','TRX'],['wasser','Boot / Wasser'],['sonstiges','Laufen, Rad, Sonstiges']].map(([k,l])=>field(l,`<textarea name="${k}">${esc(g[k])}</textarea>`)).join('')}
   <div class="row"><button class="btn pri grow" data-a="saveGuide">Speichern</button>${id?`<button class="btn danger" data-a="delGuide" data-id="${id}">${ic('trash','sm')}</button>`:''}</div>`);
}

/* ---- Feedback an den Trainer ---- */
const L={
 de:{fb:'Feedback',dur:'Dauer',rpe:'Anstrengung (RPE)',ex:'Übungen',notes:'Notizen',my:'Mein Feedback',week:'Wochenbericht',sessions:'Einheiten',total:'Gesamtzeit',dist:'Distanz',hr:'Ø Puls',types:{wasser:'Wassertraining',kraft:'Krafttraining',sonstiges:'Sonstiges'},hi:'Hallo',tags:'Inhalte',plan:'Plan'},
 en:{fb:'Feedback',dur:'Duration',rpe:'Effort (RPE)',ex:'Exercises',notes:'Notes',my:'My feedback',week:'Weekly report',sessions:'Sessions',total:'Total time',dist:'Distance',hr:'Avg HR',types:{wasser:'Boat session',kraft:'Strength training',sonstiges:'Other training'},hi:'Hi',tags:'Content',plan:'Plan'},
 fr:{fb:'Retour',dur:'Durée',rpe:'Effort perçu (RPE)',ex:'Exercices',notes:'Notes',my:'Mon retour',week:'Bilan de la semaine',sessions:'Séances',total:'Temps total',dist:'Distance',hr:'FC moy.',types:{wasser:'Séance bateau',kraft:'Musculation',sonstiges:'Autre entraînement'},hi:'Salut',tags:'Contenu',plan:'Plan'}};
const ldate=(d,lang)=>pdate(d).toLocaleDateString({de:'de-DE',en:'en-GB',fr:'fr-FR'}[lang]||'en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
function fbText(e,lang,brief){
  const l=L[lang]||L.en, a=[];
  a.push(`${brief?'•':l.fb+' –'} ${l.types[e.type]}${e.title&&e.title!==TYPES[e.type].label?' “'+e.title+'”':''} (${ldate(e.date,lang)})`);
  const m=[]; if(e.minutes) m.push(`${l.dur}: ${e.minutes} min`); if(e.rpe) m.push(`${l.rpe}: ${e.rpe}/10`); if(e.g&&e.g.dist) m.push(`${l.dist}: ${fnum(e.g.dist)} km`); if(e.g&&e.g.hr) m.push(`${l.hr}: ${e.g.hr}`);
  if(m.length) a.push((brief?'  ':'')+m.join(' · '));
  if(e.tags&&e.tags.length) a.push((brief?'  ':'')+l.tags+': '+e.tags.join(', '));
  const its=e.items.filter(i=>i.sets.some(s=>s.done));
  if(its.length){ if(!brief) a.push('',l.ex+':'); for(const it of its) a.push((brief?'  – ':'• ')+it.name+': '+it.sets.filter(s=>s.done).map(s=>fset(s,it.mode).replace(' Wdh.','')).join(' | ')); }
  if(e.notes){ if(!brief) a.push(''); a.push((brief?'  ':'')+l.notes+': '+e.notes); }
  if(e.feedback){ if(!brief) a.push(''); a.push((brief?'  ':'')+l.my+': '+e.feedback); }
  return a.join('\n');
}
function weekText(lang){
  const l=L[lang]||L.en, t=today(), from=addDays(t,-6);
  const E=S.entries.filter(e=>e.done&&e.date>=from&&e.date<=t).sort(byDate);
  const rp=E.filter(e=>e.rpe);
  return `${l.hi} ${S.settings.trainer||''},\n${l.week} ${fshort(from)}–${fshort(t)}\n${l.sessions}: ${E.length} · ${l.total}: ${fmin(sum(E,e=>e.minutes))}${rp.length?' · Ø RPE '+fnum(Math.round(sum(rp,e=>e.rpe)/rp.length*10)/10):''}\n\n`+E.map(e=>fbText(e,lang,true)).join('\n\n');
}
function shareSheet(title,text,ctx){
  UI.share=ctx; const s=S.settings;
  sheet(title,`${ctx?`<div class="seg" style="margin-bottom:10px">${[['en','English'],['fr','Français'],['de','Deutsch']].map(([k,l])=>`<button class="${s.lang===k?'on':''}" data-a="fbLang" data-v="${k}">${l}</button>`).join('')}</div>`:''}
   <textarea id="sharetxt" style="min-height:15rem;font-size:.85rem">${esc(text)}</textarea>
   <div class="grid g2" style="margin-top:10px"><button class="btn pri" data-a="shWa">WhatsApp</button><button class="btn" data-a="shNative">${ic('share','sm')}Teilen …</button><button class="btn" data-a="shMail">E-Mail</button><button class="btn" data-a="shCopy">${ic('copy','sm')}Kopieren</button></div>
   ${!s.trainerPhone&&!s.trainerMail?`<p class="tiny muted" style="margin-bottom:0">Tipp: Hinterlege Nummer/E-Mail deines Trainers in den Einstellungen, dann öffnet sich direkt der richtige Chat.</p>`:''}`);
}
function planText(p){ let last=null; return `Trainingsplan: ${p.name}\n${p.note?p.note+'\n':''}\n`+p.items.map((it,i)=>{ const hd=it.block&&it.block!==last?`\n[${it.block}]\n`:''; last=it.block; return hd+`${i+1}. ${it.name} – ${ftarget(it)}${it.note?' ('+it.note+')':''}`; }).join('\n'); }

/* ---- PDF (über Druckdialog → „Als PDF speichern“) ---- */
function printDoc(title,html){
  $('#print').innerHTML=`<h1>${esc(title)}</h1>${html}<p class="meta" style="margin-top:14pt">PoloLog · ${esc(S.settings.name||'')} · erstellt am ${fdate(today())}</p>`;
  const old=document.title; document.title=title.replace(/[^\wäöüÄÖÜß .-]+/g,'_'); 
  setTimeout(()=>{ window.print(); document.title=old; },60);
}
const P=(l,t)=>t?`<h2>${l}</h2><p>${esc(t)}</p>`:'';
function entryPrint(e,h='h2'){
  const g=e.g||{}; const meta=[fdate(e.date)+(e.time?' '+e.time:''),TYPES[e.type].label,e.minutes?e.minutes+' min':'',e.rpe?'RPE '+e.rpe+'/10':'',g.dist?fnum(g.dist)+' km':'',g.hr?'Ø Puls '+g.hr:'',g.kcal?g.kcal+' kcal':''].filter(Boolean).join(' · ');
  return `<p class="meta">${esc(meta)}</p>${e.tags&&e.tags.length?`<p>Inhalte: ${esc(e.tags.join(', '))}</p>`:''}${P('Vorgabe / Plan',e.plan)}
   ${e.items.length?`<h2>Übungen</h2><table><tr><th>Übung</th><th style="text-align:left">Vorgabe</th><th style="text-align:left">Absolviert</th></tr>${e.items.map(it=>`<tr><td>${esc(it.name)}</td><td style="text-align:left">${esc(ftarget(it))}</td><td style="text-align:left">${esc(it.sets.filter(s=>s.done).map(s=>fset(s,it.mode)).join(' | ')||'–')}</td></tr>`).join('')}</table>`:''}
   ${P('Notizen',e.notes)}${P('Feedback an den Trainer',e.feedback)}${P('Antwort des Trainers',e.reply)}`;
}
function tournPrint(t){
  const r=record(t), tot=playerTotals([t]);
  return `<p class="meta">${esc([fdate(t.from)+(t.to&&t.to!==t.from?' – '+fdate(t.to):''),t.ort,t.team,t.platz?'Platz '+t.platz:''].filter(Boolean).join(' · '))}</p>
   ${t.games.length?`<h2>Spiele (${r.w} S – ${r.d} U – ${r.l} N, ${r.gf}:${r.ga} Tore)</h2><table><tr><th>Gegner</th><th>Phase</th><th>Datum</th><th>Ergebnis</th><th>Meine Leistung</th></tr>${t.games.map(g=>`<tr><td>${esc(g.opp||'–')}</td><td>${esc(g.phase||'')}</td><td>${g.date?fshort(g.date):''} ${esc(g.time||'')}</td><td><b>${g.gf??'–'}:${g.ga??'–'}</b></td><td>${g.rating?g.rating+'/10':''}</td></tr>`).join('')}</table>`:''}
   ${tot.length&&t.games.length?`<h2>Spielerstatistik</h2>${statTable(tot)}`:t.players.length?`<h2>Kader</h2><p>${esc(t.players.map(p=>(p.nr!=null?'#'+p.nr+' ':'')+p.name).join(', '))}</p>`:''}
   ${t.games.filter(g=>g.notes).map(g=>`<div class="nb"><h2>Eindrücke: vs. ${esc(g.opp||'–')} (${g.gf??'–'}:${g.ga??'–'})</h2><p>${esc(g.notes)}</p></div>`).join('')}
   ${P('Fazit',t.notes)}${P('Infos',t.info)}`;
}

/* ---- Garmin-Import ---- */
function parseCSV(text){
  const delim=(text.split('\n')[0].match(/;/g)||[]).length>(text.split('\n')[0].match(/,/g)||[]).length?';':',';
  const rows=[]; let row=[],cur='',q=false;
  for(let i=0;i<text.length;i++){ const c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=c; }
    else if(c==='"') q=true; else if(c===delim){ row.push(cur); cur=''; } else if(c==='\n'){ row.push(cur); rows.push(row); row=[]; cur=''; } else if(c!=='\r') cur+=c; }
  if(cur||row.length){ row.push(cur); rows.push(row); }
  return rows.filter(r=>r.some(x=>x.trim()));
}
const dur2min=s=>{ if(!s) return null; const p=String(s).trim().split(':').map(x=>parseFloat(x.replace(',','.'))); if(p.some(isNaN)) return null; const sec=p.length===3?p[0]*3600+p[1]*60+p[2]:p.length===2?p[0]*60+p[1]:p[0]; return Math.round(sec/60)||null; };
const gint=s=>{ const n=parseInt(String(s||'').replace(/[.,\s]/g,''),10); return isNaN(n)?null:n; };
const gdec=s=>{ s=String(s||'').trim(); if(!s||s==='--') return null; if(s.includes(',')&&s.includes('.')) s=s.replace(/[.,](?=.*[.,])/g,''); const n=parseFloat(s.replace(',','.')); return isNaN(n)?null:n; };
function guessType(t){ t=(t||'').toLowerCase(); return /kraft|strength|gym|hiit|cardio.*indoor|trx/.test(t)?'kraft':/kajak|kayak|paddel|paddl|kanu|canoe|rudern|row|sup|wasser|boat/.test(t)?'wasser':'sonstiges'; }
function garminCSV(text){
  const rows=parseCSV(text.replace(/^﻿/,'')); if(rows.length<2) return [];
  const H=rows[0].map(h=>h.trim().toLowerCase()); const col=(...names)=>{ for(const n of names){ const i=H.indexOf(n); if(i>=0) return i; } for(const n of names){ const i=H.findIndex(h=>h.startsWith(n)); if(i>=0) return i; } return -1; };
  const c={type:col('activity type','aktivitätstyp'),date:col('date','datum'),title:col('title','titel'),dist:col('distance','distanz'),kcal:col('calories','kalorien'),time:col('time','zeit'),hr:col('avg hr','ø hf','ø herzfrequenz','durchschnittliche hf'),max:col('max hr','maximale hf','max. hf')};
  if(c.date<0) return [];
  return rows.slice(1).map(r=>{ const ds=(r[c.date]||'').trim(); let date,time='';
    let m=ds.match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}))?/); if(m){ date=`${m[1]}-${m[2]}-${m[3]}`; time=m[4]||''; }
    else if((m=ds.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[ ,]+(\d{2}:\d{2}))?/))){ date=`${m[3]}-${pad(m[2])}-${pad(m[1])}`; time=m[4]||''; } else return null;
    const gt=c.type>=0?r[c.type]:''; return {date,time,gtype:gt,title:(c.title>=0&&r[c.title])||gt||'Garmin-Aktivität',minutes:dur2min(r[c.time]),dist:gdec(r[c.dist]),kcal:gint(r[c.kcal]),hr:gint(r[c.hr]),maxhr:gint(r[c.max])}; }).filter(Boolean);
}
function garminXML(text,name){
  const d=new DOMParser().parseFromString(text,'application/xml'); const q=(s,r=d)=>[...r.getElementsByTagName(s)];
  const out=[];
  for(const a of q('Activity')){ const laps=q('Lap',a); const id=(q('Id',a)[0]||{}).textContent||laps[0]&&laps[0].getAttribute('StartTime'); if(!id) continue; const dt=new Date(id);
    const v=(lap,tag)=>{ const n=[...lap.children].find(c=>c.tagName===tag); return n?parseFloat(n.textContent):0; };
    const hrs=laps.map(l=>{ const n=[...l.children].find(c=>c.tagName==='AverageHeartRateBpm'); return n?parseFloat(n.textContent):null; }).filter(Boolean);
    const mx=laps.map(l=>{ const n=[...l.children].find(c=>c.tagName==='MaximumHeartRateBpm'); return n?parseFloat(n.textContent):null; }).filter(Boolean);
    const sp=a.getAttribute('Sport')||'';
    out.push({date:iso(dt),time:pad(dt.getHours())+':'+pad(dt.getMinutes()),gtype:sp,title:name.replace(/\.\w+$/,'')||sp,minutes:Math.round(sum(laps,l=>v(l,'TotalTimeSeconds'))/60)||null,dist:Math.round(sum(laps,l=>v(l,'DistanceMeters'))/10)/100||null,kcal:Math.round(sum(laps,l=>v(l,'Calories')))||null,hr:hrs.length?Math.round(sum(hrs)/hrs.length):null,maxhr:mx.length?Math.max(...mx):null}); }
  const pts=q('trkpt');
  if(!out.length&&pts.length){ const times=pts.map(p=>(q('time',p)[0]||{}).textContent).filter(Boolean).map(t=>new Date(t)); let dist=0; const R=6371, rad=x=>x*Math.PI/180;
    for(let i=1;i<pts.length;i++){ const a=pts[i-1],b=pts[i]; const la1=rad(+a.getAttribute('lat')),la2=rad(+b.getAttribute('lat')),dl=rad(+b.getAttribute('lon')-+a.getAttribute('lon')); const h=Math.sin((la2-la1)/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dl/2)**2; dist+=2*R*Math.asin(Math.sqrt(h)); }
    const hr=pts.map(p=>{ const n=[...p.getElementsByTagName('*')].find(c=>c.localName==='hr'); return n?+n.textContent:null; }).filter(Boolean);
    const nm=(q('name')[0]||{}).textContent||name.replace(/\.\w+$/,''); const ty=(q('type')[0]||{}).textContent||'';
    if(times.length) out.push({date:iso(times[0]),time:pad(times[0].getHours())+':'+pad(times[0].getMinutes()),gtype:ty,title:nm,minutes:Math.round((times[times.length-1]-times[0])/6e4)||null,dist:Math.round(dist*100)/100||null,kcal:null,hr:hr.length?Math.round(sum(hr)/hr.length):null,maxhr:hr.length?Math.max(...hr):null}); }
  return out;
}
const gkey=a=>a.date+'|'+a.time+'|'+a.minutes;
function garminSheet(acts){
  const have=new Set(S.entries.map(e=>e.g&&e.g.key).filter(Boolean));
  acts=acts.filter(a=>!have.has(gkey(a))).sort((a,b)=>b.date.localeCompare(a.date)); UI.garmin=acts;
  if(!acts.length) return toast('Keine neuen Aktivitäten gefunden');
  sheet(`Garmin-Import (${acts.length})`,`<p class="small muted" style="margin-top:0">Passende geplante Trainings am selben Tag werden ergänzt, sonst entsteht ein neuer Eintrag.</p>
   ${acts.map((a,i)=>`<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)"><input type="checkbox" name="g${i}" checked style="width:22px;height:22px;flex:none"><div class="grow"><div class="ttl" style="font-weight:650">${esc(a.title)}</div><div class="tiny muted">${fdate(a.date)} ${a.time} · ${a.minutes||'?'} min${a.dist?' · '+fnum(a.dist)+' km':''}${a.hr?' · Puls '+a.hr:''}</div></div>
     <select name="t${i}" style="width:7.2rem;flex:none">${['wasser','kraft','sonstiges'].map(k=>`<option value="${k}" ${guessType(a.gtype+' '+a.title)===k?'selected':''}>${TYPES[k].short}</option>`).join('')}</select></div>`).join('')}
   <button class="btn pri block" style="margin-top:12px" data-a="garminImport">Importieren</button>`);
}

/* ---- Start-Auswahl ---- */
const tile=(a,icon,title,sub,attrs='',cls='')=>`<button class="tile ${cls}" data-a="${a}" ${attrs}><span class="ico">${ic(icon)}</span><span class="grow"><b>${title}</b><span class="small muted">${sub}</span></span>${ic('right','sm')}</button>`;
function startSheet(){
  const open=S.entries.filter(e=>e.date===today()&&!e.done);
  sheet('Was steht an?',`<div class="tiles">
   ${open.map(e=>`<a class="tile pri" href="#/training/${e.id}"><span class="ico">${ic(TYPES[e.type].icon)}</span><span class="grow"><b>${esc(e.title)}</b><span class="small muted">Heute geplant, jetzt starten</span></span>${ic('right','sm')}</a>`).join('')}
   ${tile('startPlans','dumbbell','Mit Plan trainieren','Sätze abhaken, Gewichte eintragen, Pausen-Timer','',open.length?'':'pri')}
   ${tile('startFree','plus','Freies Krafttraining','Übungen aus der Bibliothek zusammenstellen','','t-kraft')}
   ${tile('startTimers','timer','Intervall-Timer','Runden, Belastung und Pausen frei einstellen')}
   ${tile('quick','wave','Wassertraining eintragen','Notiz, Minuten und Anstrengung','data-type="wasser"','t-wasser')}
   ${tile('quick','bolt','Sonstiges eintragen','Laufen, Rad, Mobility und mehr','data-type="sonstiges"','t-sonstiges')}
   ${tile('newEntry','calendar','Für später planen','Einzeln oder als wöchentliche Serie')}
  </div>`);
}
/* ---- Intervall-Timer: Ablauf ---- */
const TR={t:null,seq:[],i:0,end:0,left:0,paused:false,iv:null,lastS:null,entryId:null,lock:null,done:false};
function runTimer(t,entryId){
  const seq=buildSeq(t); if(!seq.length) return toast('Der Timer hat noch keine Übung mit Belastungszeit');
  Object.assign(TR,{t,seq,entryId:entryId||null,paused:false,done:false,total:sum(seq,x=>x.dur)});
  $('#sheet').classList.remove('on'); beep(1,.01);
  try{ navigator.wakeLock&&navigator.wakeLock.request('screen').then(l=>TR.lock=l).catch(()=>{}); }catch(e){}
  clearInterval(TR.iv); TR.iv=setInterval(trTick,100); trGo(0,false);
}
function trGo(i,sound){
  if(i>=TR.seq.length) return trFinish();
  TR.i=Math.max(0,i); const ph=TR.seq[TR.i]; TR.left=ph.dur*1000; TR.end=Date.now()+TR.left; TR.lastS=null;
  if(sound){ beep(ph.k==='work'?990:520,.5); if(navigator.vibrate) navigator.vibrate(ph.k==='work'?[300]:[120,80,120]); }
  trDraw();
}
function trTick(){
  if(TR.paused||TR.done) return; TR.left=TR.end-Date.now();
  if(TR.left<=0) return trGo(TR.i+1,true);
  const s=Math.ceil(TR.left/1000); if(s<=3&&s!==TR.lastS&&TR.seq[TR.i].dur>3){ TR.lastS=s; beep(660,.12); }
  trDraw();
}
function trDraw(){
  const ph=TR.seq[TR.i], nx=TR.seq[TR.i+1], s=Math.ceil(TR.left/1000);
  $('#run').className='on '+ph.k;
  $('#rphase').textContent=ph.label;
  $('#rtime').textContent=s>=60?mmss(s):s;
  $('#rinfo').textContent=ph.k==='prep'?TR.t.name:`Runde ${ph.r}/${ph.R}, Übung ${ph.j}/${ph.n}`;
  $('#rnext').textContent=nx?`Danach: ${nx.label} (${nx.dur>=60?mmss(nx.dur)+' min':nx.dur+' s'})`:'Letzter Abschnitt';
  const before=sum(TR.seq.slice(0,TR.i),x=>x.dur), el=ph.dur-TR.left/1000;
  $('#rbar').style.setProperty('--p',Math.min(1,(before+el)/TR.total));
  $('#run .dial svg').style.transform=`rotate(${(el/ph.dur*360).toFixed(1)}deg)`;
  $('#rtog').innerHTML=ic(TR.paused?'play':'pause');
}
function trFinish(){
  clearInterval(TR.iv); TR.done=true; beep(990,.2); setTimeout(()=>beep(990,.2),300); setTimeout(()=>beep(1320,.6),600); if(navigator.vibrate) navigator.vibrate([200,100,200,100,400]);
  const min=Math.max(1,Math.round(TR.total/60));
  if(TR.entryId){ const e=entry(TR.entryId); if(e){ e.items.filter(i=>i.mode==='t').forEach(it=>it.sets.forEach(st=>{ if(!st.done){ st.done=true; if(st.t==null) st.t=(it.target||{}).time||null; } })); if(!e.minutes) e.minutes=min; save(); render(); } }
  $('#run').className='on prep'; $('#rphase').textContent='Geschafft'; $('#rtime').textContent=mmss(TR.total); $('#rinfo').textContent=TR.t.name; $('#rbar').style.setProperty('--p',1);
  $('#rnext').innerHTML=TR.entryId?'Die Zeit-Übungen sind im Training abgehakt.':`<button class="btn" style="color:inherit;border-color:currentColor" data-a="trSave">Als Training eintragen</button>`;
  $('#rtog').innerHTML=ic('check');
}
function trClose(){ clearInterval(TR.iv); TR.done=true; $('#run').className=''; try{ TR.lock&&TR.lock.release(); }catch(e){} TR.lock=null; }

/* ---- Aktionen ---- */
const A={
 closeSheet,
 start(){ startSheet(); },
 startPlans(){ sheet('Plan wählen',S.plans.map(p=>`<button class="tile" data-a="startPlan" data-id="${p.id}"><span class="ico t-kraft">${ic('dumbbell')}</span><span class="grow"><b>${esc(p.name)}</b><span class="small muted">${p.items.length} Übungen</span></span>${ic('play','sm')}</button>`).join('<div style="height:8px"></div>')||'<div class="empty">Noch keine Pläne. Lege unter Training einen an.</div>'); },
 startFree(){ const e=newEntry({type:'kraft',title:'Freies Krafttraining'}); S.entries.push(e); save(); $('#sheet').classList.remove('on'); go('#/training/'+e.id); setTimeout(()=>pickSheet('entry:'+e.id),350); },
 startTimers(){ UI.kraftTab='timer'; $('#sheet').classList.remove('on'); go('#/kraft'); },
 quick(el){ const e=newEntry({type:el.dataset.type}); S.entries.push(e); save(); $('#sheet').classList.remove('on'); go('#/training/'+e.id); },
 // Intervall-Timer
 newTimer(){ const t={id:uid(),name:'Neuer Timer',rounds:3,prep:10,roundRest:60,steps:[mkStep('',40,20)]}; S.timers.push(t); save(); go('#/timer/'+t.id); },
 dupTimer(el){ const t=JSON.parse(JSON.stringify(timerById(el.dataset.id))); t.id=uid(); t.name+=' (Kopie)'; t.steps.forEach(x=>x.id=uid()); S.timers.push(t); save(); go('#/timer/'+t.id); },
 delTimer(el){ if(!confirm('Timer löschen?')) return; S.timers=S.timers.filter(t=>t.id!==el.dataset.id); save(); go('#/kraft'); },
 addStep(el){ const t=timerById(el.dataset.id), l=t.steps[t.steps.length-1]; t.steps.push(mkStep('',l?l.work:40,l?l.rest:20)); save(); render(); },
 delStep(el){ timerById(el.dataset.id).steps.splice(+el.dataset.i,1); save(); render(); },
 runTimer(el){ clearTimeout(saveT); save(); runTimer(timerById(el.dataset.id)); },
 runPlan(el){ const p=planById(el.dataset.id); runTimer(timerFromItems(p.name,p.items)); },
 runEntry(el){ const e=entry(el.dataset.id); if(!e.startedAt){ e.startedAt=Date.now(); save(); } runTimer(timerFromItems(e.title,e.items),e.id); },
 trToggle(){ if(TR.done) return trClose(); TR.paused=!TR.paused; if(!TR.paused) TR.end=Date.now()+TR.left; trDraw(); },
 trSkip(){ if(!TR.done) trGo(TR.i+1,true); },
 trPrev(){ if(!TR.done) trGo(TR.left>TR.seq[TR.i].dur*1000-2000?TR.i-1:TR.i,false); },
 trClose(){ if(!TR.done&&!confirm('Timer wirklich beenden?')) return; trClose(); },
 trSave(){ const e=newEntry({type:'kraft',title:TR.t.name,minutes:Math.max(1,Math.round(TR.total/60)),done:true,notes:`Intervall-Timer: ${timerInfo(TR.t)}\n`+TR.t.steps.map(x=>`${x.label||'Belastung'} ${x.work} s`+(x.rest?`, Pause ${x.rest} s`:'')).join('\n')}); S.entries.push(e); save(); trClose(); go('#/training/'+e.id); toast('Eingetragen. Wie anstrengend war es?'); },
 newEntry(el){ el.dataset.type==='turnier'?tournSheet():entrySheet({type:el.dataset.type||'wasser'}); },
 setType(el){ const v=formVals($('#sheet')); el.dataset.v==='turnier'?tournSheet():entrySheet({...v,type:el.dataset.v}); },
 saveEntry(){
  const v=formVals($('#sheet')); if(!v.date) return toast('Bitte Datum wählen');
  const plan=v.planId&&planById(v.planId); let first;
  for(let i=0;i<(+v.repeat||1);i++){
    const e=newEntry({type:v.type,date:addDays(v.date,7*i),time:v.time,title:v.title.trim()||(plan?plan.name:''),planned:num(v.planned)});
    if(plan){ e.items=itemsFromPlan(plan); e.planId=plan.id; }
    S.entries.push(e); first=first||e; }
  save(); $('#sheet').classList.remove('on'); toast(+v.repeat>1?v.repeat+' Einheiten angelegt':'Angelegt');
  +v.repeat>1?render():go('#/training/'+first.id);
 },
 saveTourn(){ const v=formVals($('#sheet')); const t=newTourn({name:v.name.trim()||'Turnier',from:v.from,to:v.to<v.from?v.from:v.to,ort:v.ort,team:v.team}); S.tournaments.push(t); save(); $('#sheet').classList.remove('on'); go('#/turnier/'+t.id); },
 selDay(el){ UI.sel=el.dataset.d===UI.sel?null:(el.dataset.d||null); if(UI.sel) UI.month=UI.sel.slice(0,7); render(); },
 month(el){ const [y,m]=UI.month.split('-').map(Number); const d=new Date(y,m-1+ +el.dataset.d,1); UI.month=iso(d).slice(0,7); UI.sel=null; render(); },
 filter(el){ UI.filter=el.dataset.v; render(); },
 ktab(el){ UI.kraftTab=el.dataset.v; if(route()[0]==='kraft') render(); },
 range(el){ UI.range=el.dataset.v; render(); },
 theme(el){ S.settings.theme=el.dataset.v; applyTheme(); save(); render(); },
 // Training
 rpe(el){ const e=entry(el.dataset.id); e.rpe=e.rpe===+el.dataset.v?null:+el.dataset.v; save(); render(); },
 tag(el){ const e=entry(el.dataset.id), v=el.dataset.v; e.tags=e.tags.includes(v)?e.tags.filter(x=>x!==v):[...e.tags,v]; save(); render(); },
 addPlanText(el){ const e=entry(el.dataset.id); e.plan=guideText(guideFor(e.date),e.type,e.title)||' '; save(); render(); },
 toggleDone(el){ const e=entry(el.dataset.id); e.done=!e.done;
  if(e.done){ if(!e.minutes) e.minutes = e.startedAt?Math.max(1,Math.round((Date.now()-e.startedAt)/6e4)):e.planned; stopRest(); toast(e.rpe?'Stark, Training gespeichert':'Gespeichert. Trag noch die Anstrengung ein'); }
  save(); render(); },
 delEntry(el){ if(!confirm('Diesen Eintrag wirklich löschen?')) return; S.entries=S.entries.filter(e=>e.id!==el.dataset.id); save(); go('#/saison'); },
 dupEntry(el){ const o=entry(el.dataset.id); const e=JSON.parse(JSON.stringify(o)); Object.assign(e,{id:uid(),date:addDays(o.date,7),done:false,rpe:null,minutes:null,notes:'',feedback:'',reply:'',g:{},startedAt:null}); e.items.forEach(it=>{ it.id=uid(); it.sets=it.sets.map(()=>({w:null,r:null,t:null,done:false})); }); S.entries.push(e); save(); toast('Kopie für '+fdate(e.date)+' angelegt'); go('#/training/'+e.id); },
 setDone(el){ const e=entry(el.dataset.id), it=e.items.find(i=>i.id===el.dataset.it), s=it.sets[+el.dataset.j]; s.done=!s.done;
  if(s.done){ $$('input',el.closest('.set')).forEach(i=>{ const k=i.dataset.bind.split('/').pop(); if(s[k]==null) s[k]=num(i.placeholder); });
    if(!e.startedAt) e.startedAt=Date.now();
    const r=it.target&&it.target.rest; const allDone=e.items.every(x=>x.sets.every(y=>y.done));
    if(!allDone) startRest(r!=null?r:S.settings.restDefault); }
  save(); render(); },
 addSet(el){ const it=entry(el.dataset.id).items.find(i=>i.id===el.dataset.it); it.sets.push({w:null,r:null,t:null,done:false}); save(); render(); },
 rmSet(el){ const it=entry(el.dataset.id).items.find(i=>i.id===el.dataset.it); it.sets.pop(); save(); render(); },
 delExItem(el){ const e=entry(el.dataset.id); if(e.items[+el.dataset.i].sets.some(s=>s.done)&&!confirm('Übung mit eingetragenen Sätzen entfernen?')) return; e.items.splice(+el.dataset.i,1); save(); render(); },
 loadPlan(el){ sheet('Plan laden',S.plans.map(p=>`<button class="pick" data-a="choosePlan" data-id="${el.dataset.id}" data-p="${p.id}"><span class="grow"><b>${esc(p.name)}</b><br><span class="tiny muted">${p.items.length} Übungen</span></span>${ic('right','sm')}</button>`).join('')||'<div class="empty">Noch keine Pläne.</div>'); },
 choosePlan(el){ const e=entry(el.dataset.id), p=planById(el.dataset.p); e.items.push(...itemsFromPlan(p)); e.planId=p.id; if(e.title===TYPES.kraft.label) e.title=p.name; save(); closeSheet(); },
 pickEx(el){ pickSheet(el.dataset.target); },
 addEx(el){ const ex=exById(el.dataset.id), [kind,id]=UI.pickTarget.split(':');
  if(kind==='entry') entry(id).items.push({id:uid(),exId:ex.id,name:ex.name,mode:ex.mode,block:'',target:{sets:3},sets:[1,2,3].map(()=>({w:null,r:null,t:null,done:false}))});
  else planById(id).items.push({id:uid(),exId:ex.id,name:ex.name,mode:ex.mode,block:'',sets:3,reps:ex.mode==='t'?null:10,time:ex.mode==='t'?30:null,weight:null,pct:null,rest:90,note:''});
  save(); toast(ex.name+' hinzugefügt'); },
 // Übungen
 editEx(el){ exSheet(el.dataset.id); },
 saveEx(){ const v=formVals($('#sheet')); if(!v.name.trim()) return toast('Bitte Namen eingeben');
  let e=exById(v.id); if(!e){ e={id:'c-'+uid(),custom:true}; S.exercises.push(e); }
  Object.assign(e,{name:v.name.trim(),cat:v.cat.trim()||'Eigene',mode:v.mode,orm:num(v.orm),note:v.note}); save(); toast('Übung gespeichert');
  UI.pickTarget&&route()[0]!=='kraft'?pickSheet(UI.pickTarget):closeSheet(); },
 delEx(el){ if(!confirm('Übung aus der Bibliothek löschen? Bereits protokollierte Trainings bleiben erhalten.')) return; S.exercises=S.exercises.filter(e=>e.id!==el.dataset.id); save(); closeSheet(); },
 // Pläne
 newPlan(){ const p={id:uid(),name:'Neuer Plan',note:'',items:[]}; S.plans.push(p); save(); go('#/plan/'+p.id); },
 dupPlan(el){ const p=JSON.parse(JSON.stringify(planById(el.dataset.id))); p.id=uid(); p.name+=' (Kopie)'; p.items.forEach(i=>i.id=uid()); S.plans.push(p); save(); go('#/plan/'+p.id); },
 delPlan(el){ if(!confirm('Plan löschen?')) return; S.plans=S.plans.filter(p=>p.id!==el.dataset.id); save(); go('#/kraft'); },
 moveItem(el){ const a=planById(el.dataset.id).items, i=+el.dataset.i, j=i+ +el.dataset.d; if(j<0||j>=a.length) return; [a[i],a[j]]=[a[j],a[i]]; save(); render(); },
 delItem(el){ planById(el.dataset.id).items.splice(+el.dataset.i,1); save(); render(); },
 startPlan(el){ const p=planById(el.dataset.id); const e=newEntry({type:'kraft',title:p.name,items:itemsFromPlan(p),planId:p.id}); S.entries.push(e); save(); go('#/training/'+e.id); },
 sharePlan(el){ const p=planById(el.dataset.id); UI.sharePlanId=p.id; shareSheet('Plan teilen',planText(p)); $('.sheet').insertAdjacentHTML('beforeend',`<button class="btn block" style="margin-top:8px" data-a="planFile">Als Datei exportieren (zum Import in PoloLog)</button>`); },
 planFile(){ const p=planById(UI.sharePlanId); download('Plan_'+slug(p.name)+'.json',JSON.stringify({pololog:'plan',plan:p},null,1)); },
 importPlan(){ sheet('Plan importieren',`<p class="small muted" style="margin-top:0">Plan-Datei (.json) aus PoloLog wählen – z. B. von deinem Trainer oder einem anderen Gerät.</p><label class="btn pri block">Datei wählen<input type="file" accept=".json" data-file="plan" hidden></label>`); },
 editGuide(el){ guideSheet(el.dataset.id); },
 saveGuide(){ const v=formVals($('#sheet')); let g=S.guides.find(x=>x.id===v.id); if(!g){ g={id:uid()}; S.guides.push(g); } const {id,...rest}=v; Object.assign(g,rest); if(!g.title) g.title='Woche ab '+fshort(g.from); save(); closeSheet(); },
 delGuide(el){ S.guides=S.guides.filter(g=>g.id!==el.dataset.id); save(); closeSheet(); },
 // Feedback
 sendFeedback(el){ const e=entry(el.dataset.id); shareSheet('Feedback an '+(S.settings.trainer||'Trainer'),fbText(e,S.settings.lang),{kind:'entry',id:e.id}); },
 weekReport(){ shareSheet('Wochenbericht',weekText(S.settings.lang),{kind:'week'}); },
 fbLang(el){ S.settings.lang=el.dataset.v; save(); const c=UI.share; c.kind==='week'?A.weekReport():A.sendFeedback({dataset:{id:c.id}}); },
 shCopy(){ copyText($('#sharetxt').value); },
 shNative(){ const text=$('#sharetxt').value; navigator.share?navigator.share({text}).catch(()=>{}):copyText(text); },
 shWa(){ window.open('https://wa.me/'+(S.settings.trainerPhone||'').replace(/\D/g,'')+'?text='+encodeURIComponent($('#sharetxt').value),'_blank'); },
 shMail(){ location.href='mailto:'+encodeURIComponent(S.settings.trainerMail||'')+'?subject='+encodeURIComponent('Training – Feedback '+(S.settings.name||''))+'&body='+encodeURIComponent($('#sharetxt').value); },
 // Turniere
 newTourn(){ tournSheet(); },
 tkind(el){ tourn(el.dataset.id).kind=el.dataset.v; save(); render(); },
 delTourn(el){ if(!confirm('Turnier mit allen Spielen löschen?')) return; S.tournaments=S.tournaments.filter(t=>t.id!==el.dataset.id); save(); go('#/turniere'); },
 addPlayer(el){ tourn(el.dataset.id).players.push({id:uid(),name:'',nr:null,me:false}); save(); render(); const ins=$$('#view input[data-bind$="/name"]'); const last=ins[ins.length-1]; last&&last.focus(); },
 delPlayer(el){ const t=tourn(el.dataset.id); t.players=t.players.filter(p=>p.id!==el.dataset.p); save(); render(); },
 mePlayer(el){ tourn(el.dataset.id).players.forEach(p=>p.me=p.id===el.dataset.p?!p.me:false); save(); render(); },
 copyRoster(el){ const t=tourn(el.dataset.id); const src=[...S.tournaments].filter(x=>x.id!==t.id&&x.players.length).sort((a,b)=>b.from.localeCompare(a.from)).find(x=>x.from<=t.from)||S.tournaments.find(x=>x.players.length); if(!src) return toast('Kein Turnier mit Kader gefunden'); t.players=src.players.map(p=>({...p,id:uid()})); save(); render(); },
 newGame(el){ const t=tourn(el.dataset.id); const d=today()>=t.from&&today()<=(t.to||t.from)?today():t.from; const g={id:uid(),opp:'',phase:'',date:d,time:'',minutes:20,gf:null,ga:null,notes:'',rating:null,stats:{}}; t.games.push(g); save(); go(`#/spiel/${t.id}/${g.id}`); },
 delGame(el){ if(!confirm('Spiel löschen?')) return; const t=tourn(el.dataset.t); t.games=t.games.filter(g=>g.id!==el.dataset.g); save(); go('#/turnier/'+t.id); },
 score(el){ const g=tourn(el.dataset.t).games.find(x=>x.id===el.dataset.g); g[el.dataset.k]=Math.max(0,(g[el.dataset.k]||0)+ +el.dataset.d); save(); render(); },
 syncScore(el){ const t=tourn(el.dataset.t), g=t.games.find(x=>x.id===el.dataset.g); g.gf=sum(t.players,p=>(g.stats[p.id]||{}).tore); save(); render(); },
 pstat(el){ const g=tourn(el.dataset.t).games.find(x=>x.id===el.dataset.g), k=el.dataset.k, d=+el.dataset.d; const s=g.stats[el.dataset.p]=g.stats[el.dataset.p]||{};
  const old=s[k]||0; s[k]=Math.max(0,old+d); const real=s[k]-old;
  if(k==='tore'&&real){ s.wuerfe=Math.max(s.tore,(s.wuerfe||0)+real); g.gf=Math.max(0,(g.gf||0)+real); }
  if(k==='wuerfe'&&s.wuerfe<(s.tore||0)) s.wuerfe=s.tore;
  save(); render(); },
 togglePlayer(el){ const id=el.dataset.p; const cur=UI.openPlayers[id]; const t=tourn(route()[1]); const pl=t.players.find(p=>p.id===id); UI.openPlayers[id]=!(cur??!!pl.me); render(); },
 rating(el){ const g=tourn(el.dataset.t).games.find(x=>x.id===el.dataset.g); g.rating=g.rating===+el.dataset.v?null:+el.dataset.v; save(); render(); },
 // PDF
 pdfEntry(el){ const e=entry(el.dataset.id); printDoc(e.title||TYPES[e.type].label,entryPrint(e)); },
 pdfPlan(el){ const p=planById(el.dataset.id); let last=null; printDoc(p.name,`${p.note?`<p>${esc(p.note)}</p>`:''}<table><tr><th>#</th><th style="text-align:left">Übung</th><th style="text-align:left">Vorgabe</th><th style="text-align:left">Hinweis</th><th>Notiz / Gewicht</th></tr>${p.items.map((it,i)=>{ const hd=it.block&&it.block!==last?`<tr><td colspan="5"><b>${esc(it.block)}</b></td></tr>`:''; last=it.block; return hd+`<tr><td>${i+1}</td><td style="text-align:left">${esc(it.name)}</td><td style="text-align:left">${esc(ftarget(it))}</td><td style="text-align:left">${esc(it.note)}</td><td style="min-width:90pt"></td></tr>`; }).join('')}</table>`); },
 pdfTourn(el){ const t=tourn(el.dataset.id); printDoc(t.name||'Turnier',tournPrint(t)); },
 pdfSeason(){ const rows=[...S.entries.map(e=>({d:e.date,h:`<tr><td>${fdate(e.date)} ${esc(e.time||'')}</td><td style="text-align:left">${TYPES[e.type].short}</td><td style="text-align:left">${esc(e.title)}</td><td>${e.minutes||e.planned||''}</td><td>${e.rpe||''}</td><td>${e.done?'✓':''}</td></tr>`})),
   ...S.tournaments.map(t=>({d:t.from,h:`<tr><td>${fdate(t.from)}${t.to&&t.to!==t.from?' – '+fshort(t.to):''}</td><td style="text-align:left"><b>${t.kind==='lehrgang'?'Lehrgang':'Turnier'}</b></td><td style="text-align:left"><b>${esc(t.name)}</b>${t.ort?' · '+esc(t.ort):''}${t.team?' · '+esc(t.team):''}</td><td></td><td></td><td>${esc(t.platz||'')}</td></tr>`}))].sort((a,b)=>a.d.localeCompare(b.d));
  let h='',mo=''; for(const r of rows){ const m=r.d.slice(0,7); if(m!==mo){ if(mo) h+='</table>'; mo=m; h+=`<h2>${MON[+m.slice(5)-1]} ${m.slice(0,4)}</h2><table><tr><th>Datum</th><th style="text-align:left">Art</th><th style="text-align:left">Inhalt</th><th>min</th><th>RPE</th><th>✓</th></tr>`; } h+=r.h; }
  printDoc('Saisonübersicht '+(S.settings.name||''),h?h+'</table>':'<p>Noch keine Einträge.</p>'); },
 pdfStats(){ const E=S.entries.filter(e=>e.done).sort(byDate); printDoc('Trainingstagebuch '+(S.settings.name||''),`<p class="meta">${E.length} Einheiten · ${fmin(sum(E,e=>e.minutes))}</p>`+E.map(e=>`<div class="nb"><h2>${esc(e.title)}</h2>${entryPrint(e).replace(/<h2>/g,'<p><b>').replace(/<\/h2>/g,'</b></p>')}</div>`).join('')); },
 // Daten
 backup(){ download('PoloLog_Backup_'+today()+'.json',JSON.stringify(S)); toast('Backup exportiert'); },
 reset(){ if(!confirm('Wirklich ALLE Daten löschen und auf den Startzustand zurücksetzen?')) return; if(!confirm('Sicher? Das kann nicht rückgängig gemacht werden.')) return; S=freshState(); save(); applyTheme(); go('#/heute'); },
 garminImport(){ const v=formVals($('#sheet')); let n=0; UI.garmin.forEach((a,i)=>{ if(!$(`[name=g${i}]`).checked) return; const type=v['t'+i]; const g={dist:a.dist||null,hr:a.hr,maxhr:a.maxhr,kcal:a.kcal,src:'garmin',key:gkey(a)};
   let e=S.entries.find(x=>x.date===a.date&&x.type===type&&!(x.g&&x.g.key)); if(e){ if(!e.minutes) e.minutes=a.minutes; if(!e.time) e.time=a.time; e.g=g; e.done=true; } else S.entries.push(newEntry({type,date:a.date,time:a.time,title:a.title,minutes:a.minutes,done:true,g}));
   n++; }); save(); closeSheet(); toast(n+' Aktivitäten importiert'); },
 restAdd(){ Rest.end+=30000; tickRest(); }, restStop(){ stopRest(); }
};
function applyTheme(){ document.documentElement.dataset.theme=S.settings.theme==='light'?'light':'dark'; const m=$('meta[name=theme-color]'); if(m) m.content=S.settings.theme==='light'?'#faf6f3':'#171210'; }

/* ---- Ereignisse ---- */
document.addEventListener('click',ev=>{
  if(ev.target.id==='sheet') return closeSheet();
  const el=ev.target.closest('[data-a]'); if(!el) return;
  const fn=A[el.dataset.a]; if(fn){ if(el.tagName!=='A') ev.preventDefault(); fn(el,ev); }
});
let saveT;
document.addEventListener('input',ev=>{
  const el=ev.target;
  if(el.dataset.in==='exq'){ UI.exq=el.value; return filterEx($('#exlist'),el.value); }
  if(el.dataset.in==='pickq') return filterEx($('#picklist'),el.value);
  if(el.dataset.in==='statEx'){ UI.statEx=el.value; return render(); }
  if(!el.dataset.bind) return;
  const r=ref(el.dataset.bind); if(!r) return;
  r[0][r[1]] = 'num' in el.dataset ? num(el.value) : el.value;
  clearTimeout(saveT); saveT=setTimeout(save,250);
});
document.addEventListener('change',ev=>{
  const el=ev.target;
  if(el.dataset.bind){ clearTimeout(saveT); save(); if('rr' in el.dataset) render(); }
  if(el.dataset.file) readFiles(el);
});
window.addEventListener('pagehide',()=>{ clearTimeout(saveT); save(); });
document.addEventListener('visibilitychange',()=>{ if(document.hidden){ clearTimeout(saveT); save(); } });
async function readFiles(el){
  const kind=el.dataset.file, files=[...el.files]; el.value=''; if(!files.length) return;
  const texts=await Promise.all(files.map(f=>f.text().then(t=>[f.name,t])));
  try{
    if(kind==='garmin'){ let acts=[]; for(const [n,t] of texts) acts=acts.concat(/\.csv$/i.test(n)||!t.trim().startsWith('<')?garminCSV(t):garminXML(t,n)); if(!acts.length) return toast('Keine Aktivitäten erkannt – bitte CSV, TCX oder GPX aus Garmin Connect wählen'); garminSheet(acts); }
    else if(kind==='backup'){ const d=JSON.parse(texts[0][1]); if(!d||!Array.isArray(d.entries)||!Array.isArray(d.exercises)) throw 0; if(!confirm('Aktuelle Daten durch das Backup ersetzen?')) return; S=d; migrate(); save(); applyTheme(); toast('Backup eingespielt'); go('#/heute'); }
    else if(kind==='plan'){ const d=JSON.parse(texts[0][1]); const p=d.plan; if(!p||!Array.isArray(p.items)) throw 0; p.id=uid();
      p.items.forEach(it=>{ it.id=uid(); let ex=S.exercises.find(e=>e.name.toLowerCase()===String(it.name).toLowerCase()); if(!ex){ ex={id:'c-'+uid(),name:it.name,cat:'Importiert',mode:it.mode||'wr',note:'',orm:null,custom:true}; S.exercises.push(ex); } it.exId=ex.id; });
      S.plans.push(p); save(); $('#sheet').classList.remove('on'); toast('Plan importiert'); go('#/plan/'+p.id); }
  }catch(e){ toast('Datei konnte nicht gelesen werden'); }
}
window.addEventListener('hashchange',()=>{ if($('#sheet').classList.contains('on')){ $('#sheet').classList.remove('on'); $('#sheet').innerHTML=''; } render(); });
window.addEventListener('afterprint',()=>{ $('#print').innerHTML=''; });
load(); applyTheme(); buildNav(); render();
