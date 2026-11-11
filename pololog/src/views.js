/* ============ PoloLog – Ansichten ============ */
const UI = {month:today().slice(0,7), sel:null, filter:'alle', kraftTab:'plaene', exq:'', range:'12w', statEx:'', openPlayers:{}};
const inp = (path,val,extra='')=>`<input data-bind="${path}" value="${esc(val??'')}" ${extra}>`;
const numinp = (path,val,extra='')=>`<input data-bind="${path}" data-num inputmode="decimal" value="${esc(fnum(val))}" ${extra}>`;
const field = (label,html)=>`<div class="field"><label>${label}</label>${html}</div>`;
const badge = t=>`<span class="badge t-${t}">${ic(TYPES[t].icon,'sm')}${TYPES[t].short}</span>`;

function entryItem(e){
  const sub=[fdate(e.date)+(e.time?' · '+e.time:'')];
  if(e.minutes) sub.push(e.minutes+' min'); else if(e.planned) sub.push('geplant '+e.planned+' min');
  if(e.rpe) sub.push('RPE '+e.rpe);
  if(e.type==='kraft'&&e.items.length) sub.push(e.items.length+' Übungen');
  return `<a class="item t-${e.type} ${e.done?'done':''}" href="#/training/${e.id}">
    <div class="grow"><div class="ttl">${esc(e.title)}</div><div class="small muted">${sub.join(' · ')}</div></div>
    ${e.done?`<span class="tick">${ic('check')}</span>`:badge(e.type)}</a>`;
}
function tournItem(t){
  const rec=record(t);
  return `<a class="item t-turnier" href="#/turnier/${t.id}"><div class="grow"><div class="ttl">${esc(t.name||'Turnier')}</div>
    <div class="small muted">${fdate(t.from)}${t.to&&t.to!==t.from?' – '+fshort(t.to):''}${t.ort?' · '+esc(t.ort):''}${t.games.length?` · ${t.games.length} Spiele (${rec.w}-${rec.d}-${rec.l})`:''}</div></div>${t.kind==='lehrgang'?`<span class="badge t-turnier">Lehrgang</span>`:badge('turnier')}</a>`;
}
function record(t){ const r={w:0,d:0,l:0,gf:0,ga:0}; for(const g of t.games){ if(g.gf==null||g.ga==null) continue; r.gf+=g.gf; r.ga+=g.ga; g.gf>g.ga?r.w++:g.gf<g.ga?r.l++:r.d++; } return r; }
function guideCard(g,open){
  if(!g) return '';
  const rows=[['kraft','Kraft','kraft'],['trx','TRX','kraft'],['wasser','Boot','wasser'],['sonstiges','Laufen / Rad / Sonstiges','sonstiges']].filter(r=>g[r[0]]);
  return `<div class="card"><div class="row"><div class="grow"><b>${esc(S.settings.trainer)}s Vorgabe · ${esc(g.title)}</b><div class="small muted">${fshort(g.from)} – ${fshort(g.to)}</div></div><a class="btn sm" href="#/kraft" data-a="ktab" data-v="monat">Monatsplan</a></div>
   ${rows.map(r=>`<details ${open?'open':''} style="margin-top:10px"><summary><span class="badge t-${r[2]}">${r[1]}</span></summary><div class="small" style="white-space:pre-wrap;margin-top:6px">${esc(g[r[0]])}</div></details>`).join('')}</div>`;
}

const views = {
/* ---------- Heute ---------- */
heute(){
  const t=today(), ws=weekStart(t), we=addDays(ws,6);
  const week=S.entries.filter(e=>e.date>=ws&&e.date<=we);
  const done=week.filter(e=>e.done);
  const todayE=S.entries.filter(e=>e.date===t);
  const next=S.entries.filter(e=>e.date>t&&!e.done).sort(byDate).slice(0,5);
  const open=S.entries.filter(e=>e.date<t&&!e.done).sort(byDate).slice(-3);
  const nt=S.tournaments.filter(x=>(x.to||x.from)>=t).sort((a,b)=>a.from.localeCompare(b.from))[0];
  const days=nt?Math.round((pdate(nt.from)-pdate(t))/864e5):null;
  return `<div class="hero"><div class="small muted">${fdate(t)}</div><h1 style="margin:.2rem 0 .8rem">Hallo ${esc(S.settings.name||'')} 👋</h1>
    <div class="grid g3"><div><b style="font-size:1.4rem">${done.length}/${week.length}</b><div class="tiny muted">Einheiten diese Woche</div></div>
    <div><b style="font-size:1.4rem">${fmin(sum(done,e=>e.minutes))}</b><div class="tiny muted">Trainingszeit</div></div>
    <div><b style="font-size:1.4rem">${nt?(days<=0?'läuft':days+' T'):'–'}</b><div class="tiny muted">${nt?'bis '+esc(nt.name||'Turnier'):'kein Turnier geplant'}</div></div></div></div>
   <div class="sec"><h2>Heute</h2></div>
   ${todayE.length?todayE.map(entryItem).join(''):`<div class="empty">Heute ist nichts geplant.</div>`}
   <div class="grid g4" style="margin-top:10px">${['wasser','kraft','sonstiges','turnier'].map(k=>`<button class="btn t-${k}" data-a="newEntry" data-type="${k}" style="color:var(--c)">${ic(TYPES[k].icon,'sm')}${TYPES[k].short}</button>`).join('')}</div>
   ${guideFor(t)?`<div class="sec"><h2>Diese Woche vom Trainer</h2></div>${guideCard(guideFor(t))}`:''}
   ${open.length?`<div class="sec"><h2>Noch offen</h2></div>${open.map(entryItem).join('')}`:''}
   <div class="sec"><h2>Als Nächstes</h2><a class="small muted" href="#/saison">Saison ›</a></div>
   ${next.length?next.map(entryItem).join(''):`<div class="empty">Keine geplanten Einheiten. Lege deine Saison im Tab „Saison“ an.</div>`}
   ${nt?`<div class="sec"><h2>Nächstes Turnier</h2></div>${tournItem(nt)}`:''}`;
},
/* ---------- Saison ---------- */
saison(){
  const [y,m]=UI.month.split('-').map(Number);
  const first=new Date(y,m-1,1), start=addDays(iso(first),-((first.getDay()+6)%7));
  const map={};
  for(const e of S.entries){ (map[e.date]=map[e.date]||new Set()).add(e.type); }
  for(const t of S.tournaments){ for(let d=t.from;d<=(t.to||t.from);d=addDays(d,1)) (map[d]=map[d]||new Set()).add('turnier'); }
  let cells='';
  for(let i=0;i<42;i++){ const d=addDays(start,i); if(i>=35&&d.slice(0,7)!==UI.month) break;
    cells+=`<button data-a="selDay" data-d="${d}" class="${d.slice(0,7)!==UI.month?'out':''} ${d===today()?'today':''} ${d===UI.sel?'sel':''}">${+d.slice(8)}<span class="dots">${[...(map[d]||[])].map(t=>`<i class="t-${t}"></i>`).join('')}</span></button>`; }
  const inRange = d => UI.sel ? d===UI.sel : d.slice(0,7)===UI.month;
  let list=S.entries.filter(e=>inRange(e.date)&&(UI.filter==='alle'||UI.filter===e.type)).map(e=>({d:e.date+(e.time||''),h:entryItem(e)}));
  if(UI.filter==='alle'||UI.filter==='turnier') for(const t of S.tournaments){ const hit=UI.sel? (t.from<=UI.sel&&UI.sel<=(t.to||t.from)) : (t.from.slice(0,7)<=UI.month&&UI.month<=(t.to||t.from).slice(0,7)); if(hit) list.push({d:t.from,h:tournItem(t)}); }
  list.sort((a,b)=>a.d.localeCompare(b.d));
  const monthE=S.entries.filter(e=>e.date.slice(0,7)===UI.month);
  return `<div class="row"><button class="iconbtn" data-a="month" data-d="-1">${ic('back')}</button><h1 class="grow center">${MON[m-1]} ${y}</h1><button class="iconbtn" data-a="month" data-d="1" style="transform:scaleX(-1)">${ic('back')}</button></div>
   <div class="small muted center" style="margin:4px 0 12px">${monthE.length} Einheiten · ${fmin(sum(monthE.filter(e=>e.done),e=>e.minutes))} absolviert</div>
   <div class="cal">${['Mo','Di','Mi','Do','Fr','Sa','So'].map(w=>`<div class="wd">${w}</div>`).join('')}${cells}</div>
   <div class="chips scroll" style="margin-top:14px">${['alle','wasser','kraft','sonstiges','turnier'].map(f=>`<button class="chip ${UI.filter===f?'on':''}" data-a="filter" data-v="${f}">${f==='alle'?'Alle':TYPES[f].short}</button>`).join('')}</div>
   <div class="sec"><h2>${UI.sel?fdate(UI.sel):'Im '+MON[m-1]}</h2>${UI.sel?`<button class="small muted" data-a="selDay" data-d="">ganzer Monat</button>`:''}</div>
   ${list.length?list.map(x=>x.h).join(''):`<div class="empty">Keine Einträge. Tippe auf + um ein Training oder Turnier anzulegen.</div>`}
   <button class="fab" data-a="newEntry" aria-label="Neu">${ic('plus')}</button>`;
},
/* ---------- Training (Detail) ---------- */
training(id){
  const e=entry(id); if(!e) return notFound();
  const p=`entries/${e.id}`;
  const g=e.g||{};
  let body='';
  if(e.type==='kraft'){
    const total=sum(e.items,i=>i.sets.length), dn=sum(e.items,i=>i.sets.filter(s=>s.done).length);
    body=`<div class="sec"><h2>Übungen</h2><span class="small muted">${dn}/${total} Sätze</span></div>
     ${total?`<div class="progress" style="margin-bottom:12px"><i style="width:${total?dn/total*100:0}%"></i></div>`:''}
     ${e.items.map((it,i)=>exCard(e,it,i)).join('')}
     ${!e.items.length?`<div class="empty">Noch keine Übungen. Lade einen Plan oder füge Übungen einzeln hinzu.</div>`:''}
     <div class="row" style="margin-top:10px"><button class="btn grow" data-a="pickEx" data-target="entry:${e.id}">${ic('plus','sm')}Übung</button><button class="btn grow" data-a="loadPlan" data-id="${e.id}">${ic('dumbbell','sm')}Plan laden</button></div>`;
  }
  const noteLabel = e.type==='wasser'?'Was habe ich gemacht? (Notizen)':e.type==='kraft'?'Notizen':'Was habe ich gemacht?';
  return `<div class="row"><a class="iconbtn" href="#/saison">${ic('back')}</a><div class="grow">${badge(e.type)}</div>
     <button class="iconbtn" data-a="pdfEntry" data-id="${e.id}" title="PDF">${ic('pdf')}</button><button class="iconbtn" data-a="dupEntry" data-id="${e.id}" title="Duplizieren">${ic('copy')}</button><button class="iconbtn" data-a="delEntry" data-id="${e.id}" title="Löschen" style="color:var(--danger)">${ic('trash')}</button></div>
   <div class="card" style="margin-top:12px">
     ${inp(p+'/title',e.title,'style="font-size:1.15rem;font-weight:700" placeholder="Titel"')}
     <div class="grid g3d" style="margin-top:10px">${field('Datum',inp(p+'/date',e.date,'type="date"'))}${field('Uhrzeit',inp(p+'/time',e.time,'type="time"'))}${field('Dauer (min)',numinp(p+'/minutes',e.minutes,`placeholder="${e.planned||''}"`))}</div>
     ${e.plan?`<details ${e.done?'':'open'}><summary class="small muted">Vorgabe / Plan ▾</summary><textarea data-bind="${p}/plan" style="margin-top:6px">${esc(e.plan)}</textarea></details>`:`<button class="small muted" data-a="addPlanText" data-id="${e.id}">+ Vorgabe / geplanten Inhalt notieren</button>`}
   </div>
   ${body}
   ${e.type==='wasser'?`<div class="sec"><h2>Inhalte</h2></div><div class="chips">${WTAGS.map(t=>`<button class="chip ${e.tags.includes(t)?'on':''}" data-a="tag" data-id="${e.id}" data-v="${t}">${t}</button>`).join('')}</div>`:''}
   <div class="sec"><h2>${noteLabel}</h2></div>
   <textarea data-bind="${p}/notes" placeholder="${e.type==='wasser'?'z. B. 3×6 Feldlängen bei 85 %, danach Torschuss aus der Drehung …':'Notizen zum Training …'}" style="min-height:${e.type==='kraft'?5:9}rem">${esc(e.notes)}</textarea>
   <div class="sec"><h2>Anstrengung (RPE 1–10)</h2><span class="small muted">${e.rpe?rpeText(e.rpe):''}</span></div>
   <div class="rpe">${Array.from({length:10},(_,i)=>`<button style="--i:${i+1}" class="${e.rpe===i+1?'on':''}" data-a="rpe" data-id="${e.id}" data-v="${i+1}">${i+1}</button>`).join('')}</div>
   <details class="card" style="margin-top:16px" ${g.dist||g.hr||g.kcal?'open':''}><summary class="row">${ic('watch','sm')}<span class="grow">Garmin / Messwerte</span><span class="small muted">${g.src?'importiert':'optional'}</span></summary>
     <div class="grid g4" style="margin-top:10px">${field('Distanz (km)',numinp(p+'/g/dist',g.dist))}${field('Ø Puls',numinp(p+'/g/hr',g.hr))}${field('Max. Puls',numinp(p+'/g/maxhr',g.maxhr))}${field('kcal',numinp(p+'/g/kcal',g.kcal))}</div></details>
   <div class="card" style="margin-top:12px"><div class="row">${ic('msg','sm')}<b class="grow">Feedback an ${esc(S.settings.trainer||'Trainer')}</b></div>
     <textarea data-bind="${p}/feedback" style="margin-top:8px" placeholder="Wie lief es? Was war schwer, was leicht? Fragen zum Plan …">${esc(e.feedback)}</textarea>
     <button class="btn block" style="margin-top:8px" data-a="sendFeedback" data-id="${e.id}">${ic('share','sm')}Feedback senden</button>
     <label style="margin-top:12px">Antwort / Hinweise vom Trainer</label><textarea data-bind="${p}/reply" placeholder="Antwort hier einfügen, damit alles beisammen bleibt">${esc(e.reply)}</textarea></div>
   <button class="btn ${e.done?'':'pri'} block" style="margin-top:16px;padding:.9rem" data-a="toggleDone" data-id="${e.id}">${ic('check','sm')}${e.done?'Abgeschlossen – wieder öffnen':'Training abschließen'}</button>`;
},
/* ---------- Kraft: Pläne / Übungen / Monatsplan ---------- */
kraft(){
  const tab=UI.kraftTab;
  const seg=`<div class="seg">${[['plaene','Pläne'],['uebungen','Übungen'],['monat','Monatsplan']].map(([k,l])=>`<button class="${tab===k?'on':''}" data-a="ktab" data-v="${k}">${l}</button>`).join('')}</div>`;
  let h='';
  if(tab==='plaene'){
    h=`<div class="sec"><h2>Meine Trainingspläne</h2><button class="btn sm" data-a="importPlan">Plan importieren</button></div>
     ${S.plans.map(p=>`<a class="item t-kraft" href="#/plan/${p.id}"><div class="grow"><div class="ttl">${esc(p.name)}</div><div class="small muted">${p.items.length} Übungen${p.note?' · '+esc(p.note.slice(0,60)):''}</div></div>${ic('right')}</a>`).join('')||`<div class="empty">Noch kein Plan.</div>`}
     <button class="fab" data-a="newPlan" aria-label="Neuer Plan">${ic('plus')}</button>`;
  } else if(tab==='uebungen'){
    const cats=[...new Set(S.exercises.map(e=>e.cat))];
    h=`<div class="row" style="margin-top:14px"><input id="exq" placeholder="Übung suchen … (${S.exercises.length})" value="${esc(UI.exq)}" data-in="exq"><button class="btn pri" data-a="editEx" data-id="">${ic('plus','sm')}Neu</button></div>
     <div id="exlist">${cats.map(c=>`<div data-cat><div class="sec"><h2>${esc(c)}</h2></div><div class="card" style="padding:4px 12px">${S.exercises.filter(e=>e.cat===c).map(e=>`<button class="pick" data-a="editEx" data-id="${e.id}" data-name="${esc(e.name.toLowerCase())}"><span class="grow">${esc(e.name)}${e.orm?` <span class="tiny muted">1RM ${fnum(e.orm)} kg</span>`:''}</span><span class="tiny muted">${MODES[e.mode]}</span></button>`).join('')}</div></div>`).join('')}</div>`;
  } else {
    h=`<div class="sec"><h2>Wochenvorgaben vom Trainer</h2><button class="btn sm" data-a="editGuide" data-id="">${ic('plus','sm')}Woche</button></div>
     <p class="small muted" style="margin-top:-4px">Die Vorgabe der jeweiligen Woche wird beim Anlegen eines Trainings automatisch übernommen.</p>
     ${[...S.guides].sort((a,b)=>a.from.localeCompare(b.from)).map(g=>`<div style="margin-top:10px">${guideCard(g,true).replace('<a class="btn sm" href="#/kraft" data-a="ktab" data-v="monat">Monatsplan</a>',`<button class="btn sm" data-a="editGuide" data-id="${g.id}">${ic('edit','sm')}</button>`)}</div>`).join('')||`<div class="empty">Keine Vorgaben.</div>`}`;
  }
  return `<h1 style="margin-bottom:12px">Kraft & Pläne</h1>${seg}${h}`;
},
plan(id){
  const p=planById(id); if(!p) return notFound();
  const b=`plans/${p.id}`;
  let last=null;
  return `<div class="row"><a class="iconbtn" href="#/kraft">${ic('back')}</a><div class="grow"></div>
    <button class="iconbtn" data-a="sharePlan" data-id="${p.id}" title="Teilen">${ic('share')}</button><button class="iconbtn" data-a="pdfPlan" data-id="${p.id}">${ic('pdf')}</button><button class="iconbtn" data-a="dupPlan" data-id="${p.id}">${ic('copy')}</button><button class="iconbtn" style="color:var(--danger)" data-a="delPlan" data-id="${p.id}">${ic('trash')}</button></div>
   <div class="card" style="margin-top:12px">${inp(b+'/name',p.name,'style="font-size:1.1rem;font-weight:700" placeholder="Name des Plans"')}
     <textarea data-bind="${b}/note" style="margin-top:8px;min-height:3.5rem" placeholder="Beschreibung / Hinweise">${esc(p.note)}</textarea></div>
   <button class="btn pri block" style="margin-top:12px" data-a="startPlan" data-id="${p.id}">${ic('play','sm')}Heute mit diesem Plan trainieren</button>
   <div class="sec"><h2>Übungen (${p.items.length})</h2></div>
   ${p.items.map((it,i)=>{ const q=`${b}/items/${it.id}`; const hd=it.block&&it.block!==last?`<div class="small" style="margin:14px 2px 6px;font-weight:700;color:var(--kraft)">${esc(it.block)}</div>`:''; last=it.block;
     return hd+`<div class="ex"><div class="row"><span class="num">${i+1}</span><b class="grow">${esc(it.name)}</b>
       <button class="iconbtn sm" data-a="moveItem" data-id="${p.id}" data-i="${i}" data-d="-1">${ic('up','sm')}</button><button class="iconbtn sm" data-a="moveItem" data-id="${p.id}" data-i="${i}" data-d="1">${ic('down','sm')}</button><button class="iconbtn sm" data-a="delItem" data-id="${p.id}" data-i="${i}" style="color:var(--danger)">${ic('x','sm')}</button></div>
       <div class="planrow"><div><label>Sätze</label>${numinp(q+'/sets',it.sets)}</div>
        ${it.mode==='t'?`<div><label>Sek.</label>${numinp(q+'/time',it.time)}</div>`:`<div><label>Wdh.</label>${numinp(q+'/reps',it.reps)}</div>`}
        ${it.mode==='wr'?`<div><label>kg</label>${numinp(q+'/weight',it.weight)}</div>`:`<div><label>Modus</label><select data-bind="${q}/mode" data-rr>${Object.keys(MODES).map(m=>`<option value="${m}" ${it.mode===m?'selected':''}>${m==='wr'?'kg+Wdh':m==='r'?'Wdh':'Zeit'}</option>`).join('')}</select></div>`}
        <div><label>Pause s</label>${numinp(q+'/rest',it.rest)}</div></div>
       <div class="planrow" style="grid-template-columns:1fr 2fr 2fr">${it.mode==='wr'?`<div><label>% 1RM</label>${numinp(q+'/pct',it.pct)}</div>`:'<div></div>'}<div><label>Block / Supersatz</label>${inp(q+'/block',it.block,'style="text-align:left"')}</div><div><label>Hinweis</label>${inp(q+'/note',it.note,'style="text-align:left"')}</div></div></div>`; }).join('')||`<div class="empty">Füge Übungen aus der Bibliothek hinzu.</div>`}
   <button class="btn block" style="margin-top:10px" data-a="pickEx" data-target="plan:${p.id}">${ic('plus','sm')}Übung hinzufügen</button>`;
},
/* ---------- Turniere ---------- */
turniere(){
  const t=today(); const list=[...S.tournaments].sort((a,b)=>a.from.localeCompare(b.from));
  const up=list.filter(x=>(x.to||x.from)>=t), past=list.filter(x=>(x.to||x.from)<t).reverse();
  return `<h1>Turniere</h1>
   <div class="sec"><h2>Anstehend</h2></div>${up.map(tournItem).join('')||`<div class="empty">Kein Turnier geplant. Mit + legst du eines an.</div>`}
   ${past.length?`<div class="sec"><h2>Gespielt</h2></div>${past.map(tournItem).join('')}`:''}
   <button class="fab" data-a="newTourn" aria-label="Neues Turnier">${ic('plus')}</button>`;
},
turnier(id){
  const t=tourn(id); if(!t) return notFound();
  const b=`tournaments/${t.id}`, r=record(t);
  const tot=playerTotals([t]);
  return `<div class="row"><a class="iconbtn" href="#/turniere">${ic('back')}</a><div class="grow">${badge('turnier')}</div>
     <button class="iconbtn" data-a="pdfTourn" data-id="${t.id}">${ic('pdf')}</button><button class="iconbtn" style="color:var(--danger)" data-a="delTourn" data-id="${t.id}">${ic('trash')}</button></div>
   <div class="card" style="margin-top:12px">${inp(b+'/name',t.name,'style="font-size:1.15rem;font-weight:700" placeholder="Turniername"')}
     <div class="grid g2" style="margin-top:10px">${field('Von',inp(b+'/from',t.from,'type="date"'))}${field('Bis',inp(b+'/to',t.to,'type="date"'))}${field('Ort',inp(b+'/ort',t.ort))}${field('Mein Team',inp(b+'/team',t.team))}</div>
     <div class="seg">${[['turnier','Turnier / Spieltag'],['lehrgang','Lehrgang']].map(([k,l])=>`<button class="${(t.kind||'turnier')===k?'on':''}" data-a="tkind" data-id="${t.id}" data-v="${k}">${l}</button>`).join('')}</div></div>
   ${t.games.length?`<div class="grid g4" style="margin-top:12px"><div class="kpi"><b>${r.w}-${r.d}-${r.l}</b><span>S-U-N</span></div><div class="kpi"><b>${r.gf}:${r.ga}</b><span>Tore</span></div><div class="kpi"><b>${t.games.length}</b><span>Spiele</span></div><div class="kpi"><b>${t.platz||'–'}</b><span>Platzierung</span></div></div>`:''}
   <div class="sec"><h2>Spiele</h2><button class="btn sm" data-a="newGame" data-id="${t.id}">${ic('plus','sm')}Spiel</button></div>
   ${t.games.map(g=>`<a class="item t-turnier" href="#/spiel/${t.id}/${g.id}"><div class="grow"><div class="ttl">vs. ${esc(g.opp||'Gegner')}</div><div class="small muted">${[g.phase,g.date?fshort(g.date):'',g.time].filter(Boolean).map(esc).join(' · ')}</div></div><b style="font-size:1.2rem">${g.gf??'–'}:${g.ga??'–'}</b></a>`).join('')||`<div class="empty">Noch keine Spiele.</div>`}
   <div class="sec"><h2>Kader (${t.players.length})</h2><button class="btn sm" data-a="addPlayer" data-id="${t.id}">${ic('plus','sm')}Spieler</button></div>
   <div class="card" style="padding:6px 12px">${t.players.map(pl=>`<div class="row" style="padding:5px 0">${numinp(`${b}/players/${pl.id}/nr`,pl.nr,'style="width:3.2rem;text-align:center" placeholder="#"')}${inp(`${b}/players/${pl.id}/name`,pl.name,'placeholder="Name"')}
      <button class="chip ${pl.me?'on':''}" data-a="mePlayer" data-id="${t.id}" data-p="${pl.id}">ich</button><button class="iconbtn sm" data-a="delPlayer" data-id="${t.id}" data-p="${pl.id}">${ic('x','sm')}</button></div>`).join('')||'<div class="small muted" style="padding:8px 0">Trage hier die Spieler deines Teams ein.</div>'}
     ${S.tournaments.length>1&&!t.players.length?`<button class="btn sm block" style="margin:6px 0" data-a="copyRoster" data-id="${t.id}">Kader vom letzten Turnier übernehmen</button>`:''}</div>
   ${tot.length&&t.games.length?`<div class="sec"><h2>Spielerstatistik</h2></div>${statTable(tot)}`:''}
   <div class="sec"><h2>Fazit</h2></div>
   <div class="grid g2">${field('Platzierung',inp(b+'/platz',t.platz,'data-rr placeholder="z. B. 3."'))}${field('Unterkunft / Infos',inp(b+'/info',t.info))}</div>
   <textarea data-bind="${b}/notes" placeholder="Persönliche Eindrücke vom Turnier, was lief gut, woran arbeiten …" style="min-height:8rem">${esc(t.notes)}</textarea>`;
},
spiel(tid,gid){
  const t=tourn(tid), g=t&&t.games.find(x=>x.id===gid); if(!g) return notFound();
  const b=`tournaments/${t.id}/games/${g.id}`;
  const sumT=sum(t.players,p=>(g.stats[p.id]||{}).tore);
  const stp=(key,val)=>`<div class="stepper"><button data-a="score" data-t="${t.id}" data-g="${g.id}" data-k="${key}" data-d="-1">−</button><b>${val??0}</b><button data-a="score" data-t="${t.id}" data-g="${g.id}" data-k="${key}" data-d="1">+</button></div>`;
  return `<div class="row"><a class="iconbtn" href="#/turnier/${t.id}">${ic('back')}</a><div class="grow small muted">${esc(t.name)}</div><button class="iconbtn" style="color:var(--danger)" data-a="delGame" data-t="${t.id}" data-g="${g.id}">${ic('trash')}</button></div>
   <div class="card" style="margin-top:12px">
     <div class="grid g2">${field('Gegner',inp(b+'/opp',g.opp,'placeholder="Gegner"'))}${field('Phase',inp(b+'/phase',g.phase,'placeholder="Vorrunde, Halbfinale …"'))}</div>
     <div class="grid g3d">${field('Datum',inp(b+'/date',g.date,'type="date"'))}${field('Zeit',inp(b+'/time',g.time,'type="time"'))}${field('Spielzeit (min)',numinp(b+'/minutes',g.minutes))}</div>
     <div class="grid g2" style="align-items:end;margin-top:6px"><div><label class="center">${esc(t.team||'Wir')}</label>${stp('gf',g.gf)}</div><div><label class="center">${esc(g.opp||'Gegner')}</label>${stp('ga',g.ga)}</div></div>
     ${sumT!==(g.gf??0)&&sumT>0?`<button class="small muted" style="margin-top:8px" data-a="syncScore" data-t="${t.id}" data-g="${g.id}">Spielertore ergeben ${sumT} – als unser Ergebnis übernehmen</button>`:''}</div>
   <div class="sec"><h2>Spielerstatistik</h2><span class="small muted">Tor zählt auch als Wurf</span></div>
   ${t.players.map(pl=>{ const s=g.stats[pl.id]||{}; const open=UI.openPlayers[pl.id]??!!pl.me;
     return `<div class="ex"><button class="row" style="width:100%;text-align:left" data-a="togglePlayer" data-p="${pl.id}"><span class="num">${pl.nr??'–'}</span><b class="grow">${esc(pl.name||'Spieler')}${pl.me?' <span class="tiny muted">(ich)</span>':''}</b><span class="small muted">${s.tore||0} T / ${s.wuerfe||0} W${s.assists?' · '+s.assists+' A':''}</span>${ic(open?'up':'down','sm')}</button>
       ${open?`<div class="stat">${STATS.map(([k,l])=>`<div><label>${l}</label><div class="stepper"><button data-a="pstat" data-t="${t.id}" data-g="${g.id}" data-p="${pl.id}" data-k="${k}" data-d="-1">−</button><b>${s[k]||0}</b><button data-a="pstat" data-t="${t.id}" data-g="${g.id}" data-p="${pl.id}" data-k="${k}" data-d="1">+</button></div></div>`).join('')}</div>`:''}</div>`; }).join('')||`<div class="empty">Lege zuerst im Turnier den Kader an.</div>`}
   <div class="sec"><h2>Meine Leistung (1–10)</h2></div>
   <div class="rpe">${Array.from({length:10},(_,i)=>`<button style="--i:${10-i}" class="${g.rating===i+1?'on':''}" data-a="rating" data-t="${t.id}" data-g="${g.id}" data-v="${i+1}">${i+1}</button>`).join('')}</div>
   <div class="sec"><h2>Persönliche Eindrücke</h2></div>
   <textarea data-bind="${b}/notes" style="min-height:9rem" placeholder="Wie lief das Spiel? Taktik, Schlüsselszenen, was nehme ich mit …">${esc(g.notes)}</textarea>`;
},
/* ---------- Statistik ---------- */
stats(){
  const t=today(); const from = UI.range==='4w'?addDays(t,-27):UI.range==='12w'?addDays(t,-83):UI.range==='jahr'?t.slice(0,4)+'-01-01':'0000';
  const E=S.entries.filter(e=>e.done&&e.date>=from&&e.date<=t);
  const T=S.tournaments.filter(x=>x.from>=from);
  const games=T.flatMap(x=>x.games);
  const rp=E.filter(e=>e.rpe);
  const mins=sum(E,e=>e.minutes)+sum(games,g=>g.minutes);
  // Wochen
  const nW=UI.range==='4w'?4:12; const weeks=[];
  for(let i=nW-1;i>=0;i--){ const ws=addDays(weekStart(t),-7*i), we=addDays(ws,6); const w={label:fshort(ws),wasser:0,kraft:0,sonstiges:0,turnier:0,load:0};
    for(const e of S.entries) if(e.done&&e.date>=ws&&e.date<=we){ w[e.type]+=e.minutes||0; w.load+=(e.minutes||0)*(e.rpe||0); }
    for(const x of S.tournaments) for(const g of x.games){ const d=g.date||x.from; if(d>=ws&&d<=we) w.turnier+=g.minutes||0; }
    weeks.push(w); }
  // Übungsfortschritt
  const used=[...new Set(S.entries.filter(e=>e.type==='kraft').flatMap(e=>e.items.filter(i=>i.sets.some(s=>s.done)).map(i=>i.exId)))].map(exById).filter(Boolean);
  if(!used.find(x=>x.id===UI.statEx)) UI.statEx=used[0]?used[0].id:'';
  const ex=exById(UI.statEx); let prog='';
  if(ex){ const pts=[]; let best=null;
    for(const e of S.entries.filter(e=>e.type==='kraft').sort(byDate)) for(const it of e.items) if(it.exId===ex.id){ const ds=it.sets.filter(s=>s.done); if(!ds.length) continue;
      const m=it.mode; const v = m==='wr'?Math.max(...ds.map(s=>s.w||0)) : m==='r'?Math.max(...ds.map(s=>s.r||0)) : Math.max(...ds.map(s=>s.t||0));
      const vol = m==='wr'?sum(ds,s=>(s.w||0)*(s.r||0)):sum(ds,s=>m==='r'?s.r:s.t);
      const e1 = m==='wr'?Math.max(...ds.map(s=>epley(s.w||0,s.r||0))):null;
      pts.push({label:fshort(e.date),y:v,vol,e1}); if(e1&&(!best||e1>best)) best=e1; }
    const unit=ex.mode==='wr'?'kg':ex.mode==='r'?'Wdh.':'s';
    prog=`${lineChart(pts,unit)}<div class="grid g3" style="margin-top:10px"><div class="kpi"><b>${pts.length?fnum(Math.max(...pts.map(p=>p.y))):'–'} <small>${unit}</small></b><span>Bestwert</span></div><div class="kpi"><b>${best?fnum(Math.round(best*10)/10)+' kg':'–'}</b><span>geschätztes 1RM</span></div><div class="kpi"><b>${pts.length?fnum(pts[pts.length-1].vol):'–'}</b><span>Volumen zuletzt</span></div></div>`; }
  const tot=playerTotals(T); const R=T.reduce((a,x)=>{const r=record(x); a.w+=r.w;a.d+=r.d;a.l+=r.l;a.gf+=r.gf;a.ga+=r.ga; return a;},{w:0,d:0,l:0,gf:0,ga:0});
  const me=tot.find(p=>p.me);
  return `<h1 style="margin-bottom:12px">Statistik</h1>
   <div class="seg">${[['4w','4 Wochen'],['12w','12 Wochen'],['jahr','Jahr'],['alle','Gesamt']].map(([k,l])=>`<button class="${UI.range===k?'on':''}" data-a="range" data-v="${k}">${l}</button>`).join('')}</div>
   <div class="grid g4" style="margin-top:12px"><div class="kpi"><b>${E.length}</b><span>Einheiten</span></div><div class="kpi"><b>${fnum(Math.round(mins/6)/10)} h</b><span>Trainings- & Spielzeit</span></div><div class="kpi"><b>${rp.length?fnum(Math.round(sum(rp,e=>e.rpe)/rp.length*10)/10):'–'}</b><span>Ø Anstrengung</span></div><div class="kpi"><b>${games.length}</b><span>Turnierspiele</span></div></div>
   <div class="grid g4" style="margin-top:10px">${['wasser','kraft','sonstiges'].map(k=>{const x=E.filter(e=>e.type===k); return `<div class="kpi t-${k}"><b style="color:var(--c)">${x.length}×</b><span>${TYPES[k].short} · ${fmin(sum(x,e=>e.minutes))}</span></div>`;}).join('')}<div class="kpi"><b>${fnum(Math.round(sum(E,e=>e.g&&e.g.dist)*10)/10)} km</b><span>Distanz (Garmin)</span></div></div>
   <div class="sec"><h2>Minuten pro Woche</h2></div><div class="card">${barChart(weeks)}<div class="legend">${Object.keys(TYPES).map(k=>`<span class="t-${k}"><i></i>${TYPES[k].short}</span>`).join('')}</div></div>
   <div class="sec"><h2>Belastung pro Woche (Minuten × RPE)</h2></div><div class="card">${lineChart(weeks.map(w=>({label:w.label,y:w.load})),'')}</div>
   <div class="sec"><h2>Kraft-Fortschritt</h2></div>
   <div class="card">${used.length?`<select data-in="statEx">${used.map(x=>`<option value="${x.id}" ${x.id===UI.statEx?'selected':''}>${esc(x.name)}</option>`).join('')}</select><div style="margin-top:10px">${prog}</div>`:`<div class="muted small">Sobald du Sätze im Krafttraining abhakst, siehst du hier deinen Verlauf je Übung.</div>`}</div>
   <div class="sec"><h2>Turniere</h2></div>
   ${games.length?`<div class="grid g4"><div class="kpi"><b>${R.w}-${R.d}-${R.l}</b><span>Siege-Unent.-Niederl.</span></div><div class="kpi"><b>${R.gf}:${R.ga}</b><span>Tore</span></div><div class="kpi"><b>${me?me.tore:'–'}</b><span>Meine Tore</span></div><div class="kpi"><b>${me&&me.wuerfe?Math.round(me.tore/me.wuerfe*100)+' %':'–'}</b><span>Meine Wurfquote</span></div></div><div style="margin-top:10px">${statTable(tot)}</div>`:`<div class="empty">Noch keine Turnierspiele im Zeitraum.</div>`}`;
},
/* ---------- Mehr ---------- */
mehr(){
  const s=S.settings, b='settings';
  return `<h1>Einstellungen & Daten</h1>
   <div class="sec"><h2>Profil & Trainer</h2></div>
   <div class="card"><div class="grid g2">${field('Mein Name',inp(b+'/name',s.name))}${field('Trainer',inp(b+'/trainer',s.trainer))}${field('WhatsApp-Nr. Trainer (mit +Land)',inp(b+'/trainerPhone',s.trainerPhone,'placeholder="+33…" inputmode="tel"'))}${field('E-Mail Trainer',inp(b+'/trainerMail',s.trainerMail,'type="email"'))}
     ${field('Sprache für Feedback',`<select data-bind="${b}/lang"><option value="en" ${s.lang==='en'?'selected':''}>English</option><option value="fr" ${s.lang==='fr'?'selected':''}>Français</option><option value="de" ${s.lang==='de'?'selected':''}>Deutsch</option></select>`)}${field('Standard-Pause (Sek.)',numinp(b+'/restDefault',s.restDefault))}</div>
     <div class="row" style="margin-top:4px"><span class="grow small muted">Design</span><div class="seg" style="width:60%">${[['dark','Dunkel'],['light','Hell']].map(([k,l])=>`<button class="${s.theme===k?'on':''}" data-a="theme" data-v="${k}">${l}</button>`).join('')}</div></div></div>
   <button class="btn block" style="margin-top:10px" data-a="weekReport">${ic('share','sm')}Wochenbericht an ${esc(s.trainer||'Trainer')} senden</button>
   <div class="sec"><h2>Meine Ziele</h2></div><textarea data-bind="${b}/goals" style="min-height:12rem">${esc(s.goals)}</textarea>
   <div class="sec"><h2>Garmin Connect</h2></div>
   <div class="card"><p class="small muted" style="margin:0 0 10px">Garmin erlaubt keinen direkten Zugriff aus einer Web-App. So kommen deine Daten trotzdem rein: In Garmin Connect (Web) unter <b>Aktivitäten → „CSV exportieren“</b> die Liste laden – oder eine einzelne Aktivität als <b>TCX/GPX</b> exportieren – und hier auswählen. Dauer, Distanz, Puls und Kalorien werden den Trainings zugeordnet.</p>
     <label class="btn pri block">${ic('watch','sm')}Garmin-Datei importieren (CSV, TCX, GPX)<input type="file" accept=".csv,.tcx,.gpx,text/csv,application/xml" multiple data-file="garmin" hidden></label></div>
   <div class="sec"><h2>PDF-Export</h2></div>
   <div class="grid g2"><button class="btn" data-a="pdfSeason">${ic('pdf','sm')}Saisonübersicht</button><button class="btn" data-a="pdfStats">${ic('pdf','sm')}Trainingstagebuch</button></div>
   <div class="sec"><h2>Datensicherung</h2></div>
   <div class="card"><p class="small muted" style="margin:0 0 10px">Alle Daten liegen nur auf diesem Gerät. Exportiere regelmäßig ein Backup – damit überträgst du sie auch aufs Handy bzw. den PC.</p>
     <div class="grid g2"><button class="btn" data-a="backup">Backup exportieren</button><label class="btn">Backup einspielen<input type="file" accept=".json,application/json" data-file="backup" hidden></label></div>
     <button class="btn danger block ghost" style="margin-top:10px" data-a="reset">Alle Daten zurücksetzen</button></div>
   <p class="tiny muted center" style="margin-top:20px">PoloLog · ${S.exercises.length} Übungen · ${S.entries.length} Trainings · ${S.tournaments.length} Turniere</p>`;
}
};
const byDate=(a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''));
const notFound=()=>`<div class="empty">Eintrag nicht gefunden. <a href="#/heute"><u>Zur Übersicht</u></a></div>`;
const rpeText=n=>['','sehr leicht','leicht','locker','moderat','etwas anstrengend','anstrengend','hart','sehr hart','extrem hart','maximal'][n];

function exCard(e,it,i){
  const p=`entries/${e.id}/items/${it.id}`; const lp=lastPerf(it.exId,e); const ex=exById(it.exId); const tg=it.target||{};
  const all=it.sets.length&&it.sets.every(s=>s.done);
  const phW = tg.weight ?? (tg.pct&&ex&&ex.orm?pctWeight(ex.orm,tg.pct):null);
  const prev=e.items[i-1]; const hd=it.block&&(!prev||prev.block!==it.block)?`<div class="small" style="margin:14px 2px 6px;font-weight:700;color:var(--kraft)">${esc(it.block)}</div>`:'';
  return hd+`<div class="ex ${all?'done':''}"><div class="row"><span class="num">${all?ic('check','sm'):i+1}</span><div class="grow"><b>${esc(it.name)}</b><div class="tiny muted">${esc(ftarget(it))}</div></div>
     <button class="iconbtn sm" data-a="delExItem" data-id="${e.id}" data-i="${i}">${ic('x','sm')}</button></div>
   ${tg.note?`<div class="small" style="margin-top:6px">💡 ${esc(tg.note)}</div>`:''}
   ${lp?`<div class="tiny muted" style="margin-top:4px">Letztes Mal (${fshort(lp.date)}): ${lp.sets.map(s=>fset(s,it.mode)).join(' | ')}</div>`:''}
   ${it.sets.map((s,j)=>{ const l=lp&&(lp.sets[j]||lp.sets[lp.sets.length-1])||{}; const q=`${p}/sets/${j}`;
     const f=(k,unit,ph)=>`<div class="unit"><input data-bind="${q}/${k}" data-num inputmode="decimal" value="${esc(fnum(s[k]))}" placeholder="${esc(fnum(ph))}"><span>${unit}</span></div>`;
     return `<div class="set ${it.mode==='wr'?'':'one'}"><span class="n">${j+1}</span>${it.mode==='wr'?f('w','kg',phW??l.w)+f('r','Wdh',tg.reps??l.r):it.mode==='r'?f('r','Wdh',tg.reps??l.r):f('t','Sek',tg.time??l.t)}
       <button class="chk ${s.done?'on':''}" data-a="setDone" data-id="${e.id}" data-it="${it.id}" data-j="${j}" aria-label="Satz erledigt">${ic('check')}</button></div>`; }).join('')}
   <div class="row" style="margin-top:8px"><button class="btn sm ghost" data-a="addSet" data-id="${e.id}" data-it="${it.id}">+ Satz</button>${it.sets.length>1?`<button class="btn sm ghost" data-a="rmSet" data-id="${e.id}" data-it="${it.id}">− Satz</button>`:''}</div></div>`;
}
function playerTotals(ts){
  const m=new Map();
  for(const t of ts) for(const pl of t.players){ const key=(pl.name||'').trim().toLowerCase()||pl.id; let o=m.get(key); if(!o){ o={name:pl.name,nr:pl.nr,me:!!pl.me,sp:0}; STATS.forEach(([k])=>o[k]=0); m.set(key,o); }
    if(pl.me) o.me=true;
    for(const g of t.games){ const s=g.stats[pl.id]; if(!s||!Object.values(s).some(v=>v)) continue; o.sp++; STATS.forEach(([k])=>o[k]+=s[k]||0); } }
  return [...m.values()].sort((a,b)=>b.tore-a.tore);
}
function statTable(tot){
  return `<div class="tablewrap"><table><tr><th>Spieler</th><th>Sp</th><th>Tore</th><th>Würfe</th><th>Quote</th><th>Ass.</th><th>BG</th><th>BV</th><th>Par.</th><th>G/G/R</th></tr>
   ${tot.map(p=>`<tr><td>${p.nr!=null?`<span class="muted">${p.nr}</span> `:''}${esc(p.name||'–')}${p.me?' ★':''}</td><td>${p.sp}</td><td><b>${p.tore}</b></td><td>${p.wuerfe}</td><td>${p.wuerfe?Math.round(p.tore/p.wuerfe*100)+' %':'–'}</td><td>${p.assists}</td><td>${p.ballgewinne}</td><td>${p.ballverluste}</td><td>${p.paraden}</td><td>${p.gruen}/${p.gelb}/${p.rot}</td></tr>`).join('')}</table></div>`;
}
/* ---- Diagramme (SVG) ---- */
function barChart(weeks){
  const W=340,H=150,L=26,B=18,keys=['wasser','kraft','sonstiges','turnier'];
  const max=Math.max(60,...weeks.map(w=>sum(keys,k=>w[k]))); const top=Math.ceil(max/60)*60;
  const bw=(W-L)/weeks.length; let h='';
  for(const v of [0,top/2,top]){ const y=H-B-(H-B-8)*v/top; h+=`<line x1="${L}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${L-4}" y="${y+3}" text-anchor="end">${v}</text>`; }
  weeks.forEach((w,i)=>{ let y=H-B; const x=L+i*bw+bw*.18;
    keys.forEach(k=>{ const hh=(H-B-8)*w[k]/top; if(hh>0){ y-=hh; h+=`<rect x="${x}" y="${y}" width="${bw*.64}" height="${hh}" rx="2" fill="var(--${k})"><title>${TYPES[k].short}: ${w[k]} min (Woche ab ${w.label})</title></rect>`; } });
    if(weeks.length<=6||i%2===(weeks.length-1)%2) h+=`<text x="${x+bw*.32}" y="${H-5}" text-anchor="middle">${w.label}</text>`; });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Minuten pro Woche">${h}</svg>`;
}
function lineChart(pts,unit){
  if(!pts.length) return `<div class="muted small">Noch keine Daten.</div>`;
  const W=340,H=140,L=30,B=18; const max=Math.max(1,...pts.map(p=>p.y)), min=Math.min(...pts.map(p=>p.y)); const lo=min===max?0:Math.max(0,min-(max-min)*.25), hi=max+(max-lo)*.1||1;
  const X=i=>pts.length===1?(L+W)/2:L+8+(W-L-16)*i/(pts.length-1), Y=v=>H-B-(H-B-10)*(v-lo)/(hi-lo);
  let h='';
  for(const v of [lo,(lo+hi)/2,hi]) h+=`<line x1="${L}" x2="${W}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${L-4}" y="${Y(v)+3}" text-anchor="end">${Math.round(v)}</text>`;
  h+=`<polyline fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round" points="${pts.map((p,i)=>X(i)+','+Y(p.y)).join(' ')}"/>`;
  const step=Math.ceil(pts.length/6);
  pts.forEach((p,i)=>{ h+=`<circle cx="${X(i)}" cy="${Y(p.y)}" r="3.2" fill="var(--accent)"><title>${p.label}: ${fnum(p.y)} ${unit}</title></circle>`; if(i%step===0||i===pts.length-1&&pts.length<7) h+=`<text x="${X(i)}" y="${H-5}" text-anchor="middle">${p.label}</text>`; });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${h}</svg>`;
}
