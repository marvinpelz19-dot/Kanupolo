'use strict';
/* ============ PoloLog – Kern: Daten, Speicher, Helfer ============ */
const KEY = 'pololog.v1';
const TYPES = {
  wasser:    {label:'Wassertraining', short:'Wasser',    icon:'wave'},
  kraft:     {label:'Krafttraining',  short:'Kraft',     icon:'dumbbell'},
  sonstiges: {label:'Sonstiges',      short:'Sonstiges', icon:'bolt'},
  turnier:   {label:'Turnier',        short:'Turnier',   icon:'trophy'}
};
const STATS = [['tore','Tore'],['wuerfe','Würfe'],['assists','Assists'],['ballgewinne','Ballgewinne'],['ballverluste','Ballverluste'],['paraden','Paraden'],['gruen','Grün'],['gelb','Gelb'],['rot','Rot']];
const WTAGS = ['Technik','Schuss','Pässe','Taktik','Sprint','Ausdauer','Spielformen','Torwart','Bootsbeherrschung','Zweikampf'];
const MODES = {wr:'Gewicht + Wdh.', r:'nur Wiederholungen', t:'Zeit (Sek.)'};

/* ---- Übungsbibliothek (KPoloMax / E-Sens Dokumente von Maxim) ---- */
// Format: "Name|modus" – modus: wr (Standard), r, t
const LIB = {
  'Beine':['Back Squat','Front Squat','Goblet Squat','Deadlift','Romanian Deadlift','Box Squat','Bulgarian Split Squat','Pistol Squat|r','Sumo Deadlift','Trap Bar Deadlift','Good Morning','Forward Lunge','Reverse Lunge','Walking Lunge','Lateral Lunge','Step-Up','Leg Curl','Hip Thrust','Glute Bridge|r','Calf Raise','Seated Calf Raise','Donkey Calf Raise','Hip Abduction','Standing Kickback','Hip Adduction','Landmine Squat'],
  'Push':['Push-Up|r','Push-Up (close grip)|r','Decline Push-Up (feet elevated)|r','Push-Up Rings|r','Bench Press','Incline Bench Press','Decline Bench Press','Dumbbell Chest Press','Dumbbell Fly','Chest Press (Maschine)','Cable Fly','Pull-Over (lying on bench)','Overhead Press','Dumbbell Shoulder Press','Arnold Press','Triceps Pushdown','Skull Crusher','Overhead Triceps Extension','Triceps Kickback','Dips|r','Close-Grip Bench Press','Push Press','Push Jerk','Landmine Press'],
  'Pull':['Lat Pulldown','Barbell Row (Bent-Over Row)','Dumbbell Row','Seated Cable Row','Low Row','Upright Row','T-Bar Row','Face Pull','Face Pull (Bent)','Renegade Row','Single Arm Row','Straight Arm Pulldown','Landmine Row','Barbell Curl','Dumbbell Curl','Hammer Curl','Incline Curl','Concentration Curl','Preacher Curl','Zottman Curl','Cable Curl','Drag Curl','Bayesian Curl'],
  'Klimmzüge':['Pull-Up|r','Chin-Up|r','Pull-Up (wide grip)|r','Pull-Up (close grip)|r','Pull-Up (knees at 90°)|r','Pull-Up (crossed leg)|r','Hanging with ball between the legs|t','Pull-Up with added weight'],
  'Schulter':['Lateral Raise','Front Raise','Rear Delt Fly','Lateral Raise (Bent)','Front Arm Extension (dumbbells)','Lateral Arm Extension (dumbbells)','Overhead Arm Extension (dumbbells)','Shoulder Depression (cable – lateral)','Shoulder Depression (cable – front)','Internal Rotator (rotator cuff)','External Rotator (rotator cuff)'],
  'Core':['Plank|t','Side Plank|t','Dead Bug|r','Bird Dog|r','Crunch|r','Reverse Crunch|r','Bicycle Crunch|r','Leg Raise (straight)|r','Cross Leg Raise (alternating)|r','Hanging Leg Raise|r','Knee Raise|r','L-Sit|t','Russian Crunch|r','Toe Touch|r','Mountain Climber|t','Pallof Press','Woodchopper','Cable Crunch','Cable Rotation','Cable Chop'],
  'Unterer Rücken':['Superman (arms and legs extended)|t','Superman (with dumbbells)','Back Extension (on bench)|r','Hyperextension|r','Cable Pull-Through'],
  'Full Body':['Clean','Hang Clean','Power Clean','Snatch','Hang Snatch','Clean & Press','Kettlebell Swing','Turkish Get-Up','Thruster','Burpee|r','Farmer\'s Walk','Sled Push','Sled Pull','Battle Ropes|t','Plate Push','Plate Hold|t','Step Pitch|r'],
  'Plyometrie':['Box Jump|r','Squat Jump|r','Countermovement Jump|r','Broad Jump|r','Split Jump|r','Depth Jump|r','Lateral Jump|r','Hurdle Hop|r','Tuck Jump|r','Triple Jump|r'],
  'Medizinball':['MB Chest Pass','MB Overhead Throw','MB Wall Ball','MB Standing Twist','MB Seated Rotation','MB Seated Trunk Rotation','MB Seated Partner Pass (two-handed)','MB Russian Twist','MB Woodchopper','MB Pallof Press','MB Rotational Throw','MB Slam','MB Squat to Twist','MB Lunge & Twist','MB Dynamic Plank|t','MB Hip Thrust','MB Kneeling Press','MB Diagonal Throw'],
  'Swiss Ball':['SB Plank|t','SB Pike|r','SB Mountain Climber|t','SB Push-Up|r','SB Squat|r','SB Bulgarian Split Squat|r','SB Hip Thrust|r','SB Single Leg Deadlift|r','SB Side Plank|t','SB Bird Dog|r','SB Superman|r','SB Single Leg Balance|t','SB Side Bends|r','SB Trunk Rotation|r','SB Balance Pass|r','SB Unilateral Push-Up|r','SB Seated Balance (hold)|t','SB Seated Balance with arm action (paddle motion)|t','SB Trunk Rotation (feet on floor, back on ball)|r'],
  'TRX Oberkörper':['TRX Row|r','TRX Push-Up|r','TRX Chest Press|r','TRX T Fly|r','TRX Biceps Curl|r','TRX Triceps Extension|r','TRX Y Raise|r','TRX Face Pull|r'],
  'TRX Unterkörper':['TRX Squat|r','TRX Assisted Lunge|r','TRX Split Squat|r','TRX Single-Leg Squat|r','TRX Hamstring Curl|r','TRX Hip Hinge|r','TRX Glute Bridge|r','TRX Lateral Lunge|r'],
  'TRX Core':['TRX Plank|t','TRX Side Plank|t','TRX Pike|r','TRX Knee Tuck|r','TRX Mountain Climber|t','TRX Body Saw|r','TRX Side Crunch|r','TRX Atomic Push-Up|r']
};
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function seedExercises(){
  const out=[];
  for(const cat in LIB) for(const e of LIB[cat]){ const [name,mode]=e.split('|'); out.push({id:'x-'+slug(name),name,cat,mode:mode||'wr',note:'',orm:null}); }
  return out;
}
// Plan-Vorlagen aus Maxims Dokumenten: [Name, Sätze, Wdh/Sek, %1RM, Pause s, Hinweis, Block, modus?]
const SEED_PLANS = [
 {name:'Kraft – Session 1 & 2 (ab 02.11.) · Aufbau', note:'Ziel: Wiedereinstieg, solides Fundament. Bulgarian / Kraftausdauer.', items:[
  ['Dumbbell Chest Press',4,6,70,240,'Direkt danach ohne Pause 15 Push-Ups','Push – Bulgarian'],
  ['Push-Up',4,15,null,240,'Ohne Pause nach dem Bankdrücken. Dann 4 min Pause','Push – Bulgarian'],
  ['Seated Cable Row',4,6,70,240,'Direkt danach 15 Upright Rows','Pull – Bulgarian'],
  ['Upright Row',4,15,50,240,'Bei 50 %. Dann 4 min Pause','Pull – Bulgarian'],
  ['Leg Raise (straight)',5,45,null,0,'30–60 s je Station, keine Pause zwischen Stationen','Zirkel 5 Runden',"t"],
  ['Back Extension (on bench)',5,45,null,0,'30–60 s','Zirkel 5 Runden','t'],
  ['MB Seated Trunk Rotation',5,45,null,0,'30–60 s','Zirkel 5 Runden','t'],
  ['SB Seated Balance (hold)',5,45,null,120,'30–60 s. Ball nicht mit den Beinen klemmen, Füße nicht am Boden. 2 min Pause zwischen Runden','Zirkel 5 Runden','t'],
  ['Pull-Up (close grip)',4,6,null,0,'Enger Obergriff, direkt weiter','Klimmzüge – Kraft / Propriozeption'],
  ['Pull-Up (knees at 90°)',4,4,null,210,'Untergriff, Beine 90°. Pause 3–4 min','Klimmzüge – Kraft / Propriozeption'],
  ['Front Raise',4,6,null,0,'','Schulter'],
  ['Lateral Raise',4,6,null,0,'leicht','Schulter'],
  ['Internal Rotator (rotator cuff)',4,6,null,0,'Mit Band, je Schulter','Schulter'],
  ['External Rotator (rotator cuff)',4,6,null,120,'Mit Band, je Schulter. Pause 2 min','Schulter']]},
 {name:'Kraft – Session 9.–15.11. · Power & Endurance', note:'Bulgarian / Kraftausdauer: 5 × (6 Wdh. bei 75–80 % + 12 Wdh. bei 55 %). 4 Stationen nacheinander, 4 Runden, Pause 3–4 min. Übungsauswahl laut Maxims Blatt bitte gegenprüfen.', items:[
  ['Triceps Pushdown',5,6,78,0,'75–80 %, direkt weiter','Push – Bulgarian'],
  ['Push-Up',5,12,55,210,'55 % (leichter). Pause 3–4 min','Push – Bulgarian'],
  ['Seated Cable Row',5,6,78,0,'75–80 %, direkt weiter','Pull – Bulgarian'],
  ['Low Row',5,12,55,210,'55 %. Pause 3–4 min','Pull – Bulgarian'],
  ['Leg Raise (straight)',5,20,null,0,'20 s','Core – 5 Serien','t'],
  ['Cross Leg Raise (alternating)',5,20,null,0,'20 s','Core – 5 Serien','t'],
  ['Crunch',5,20,null,0,'20 s','Core – 5 Serien','t'],
  ['Bicycle Crunch',5,20,null,180,'20 s. Pause 3 min','Core – 5 Serien','t'],
  ['Superman (arms and legs extended)',5,30,null,30,'30 s statisch halten','Unterer Rücken'],
  ['Front Raise',4,10,null,0,'leicht, dynamisch','Schulter A'],
  ['Lateral Raise',4,10,null,0,'leicht, dynamisch','Schulter A'],
  ['Overhead Arm Extension (dumbbells)',4,10,null,60,'Pause 1 min','Schulter A'],
  ['Internal Rotator (rotator cuff)',3,10,null,0,'mit Gummiband','Schulter B'],
  ['External Rotator (rotator cuff)',3,10,null,60,'mit Gummiband. Pause 1 min','Schulter B']]},
 {name:'TRX – Woche 1 (9 Übungen, 40/20)', note:'3 Serien · 40 s Arbeit / 20 s Pause · von der 1. bis zur letzten Übung, dann Serienpause 5 min. Übungen frei wählbar: 3 Oberkörper / 3 Unterkörper / 3 Core.', items:
  ['TRX Row','TRX Push-Up','TRX Y Raise','TRX Squat','TRX Split Squat','TRX Hamstring Curl','TRX Plank','TRX Knee Tuck','TRX Body Saw'].map((n,i,a)=>[n,3,40,null,i==a.length-1?300:20,'','','t'])},
 {name:'TRX – Woche 2 (12 Übungen, 50/10)', note:'3 Serien · 50 s Arbeit / 10 s Pause · Serienpause 6 min. 4 Oberkörper / 4 Unterkörper / 4 Core.', items:
  ['TRX Row','TRX Push-Up','TRX Y Raise','TRX Face Pull','TRX Squat','TRX Split Squat','TRX Hamstring Curl','TRX Lateral Lunge','TRX Plank','TRX Knee Tuck','TRX Body Saw','TRX Pike'].map((n,i,a)=>[n,3,50,null,i==a.length-1?360:10,'','','t'])},
 {name:'TRX – Woche 4 (10 Übungen, 1 min)', note:'4 Serien · 1 min Arbeit, keine Pause · Serienpause 5 min. 2 Oberkörper / 2 Unterkörper / 6 Core.', items:
  ['TRX Row','TRX Push-Up','TRX Squat','TRX Hamstring Curl','TRX Plank','TRX Side Plank','TRX Pike','TRX Knee Tuck','TRX Mountain Climber','TRX Body Saw'].map((n,i,a)=>[n,4,60,null,i==a.length-1?300:0,'','','t'])}
];
const SEED_GUIDES = [
 {from:'2026-11-02',to:'2026-11-08',title:'Woche 1',
  kraft:'2× pro Woche. Bulgarian Strength / Kraftausdauer: 4 × (6 Wdh. bei 70 % + 15 Wdh. bei 50 %). 4 Stationen nacheinander (z. B. Bankdrücken/Rudern, Bizeps/Trizeps), 4 Runden. Pause 3–4 min. Zusätzlich Core- und Schulterstabilität.',
  trx:'3 Serien mit 9 TRX-Übungen (3 Oberkörper / 3 Unterkörper / 3 Core). 40 s Arbeit / 20 s Pause. Serienpause 5 min.',
  wasser:'Session 1 – Aerobe Power: 3 Sätze (6 × 1 Feldlänge bei 85 % HFmax; Pause = Feldbreite). Satzpause 5–6 min.\nSession 2 – Speed: 4 Sätze (4 × 1 Feldlänge maximal, abwechselnd fliegender und stehender Start; Pause 1 min). Satzpause 4–5 min.\nBootsbeherrschung: in beiden Einheiten ein Manöver am Start oder während der Länge einbauen.',
  sonstiges:'45 min bis 1 h locker (Laufen, Rad, anderer Sport).'},
 {from:'2026-11-09',to:'2026-11-15',title:'Woche 2',
  kraft:'2× pro Woche. Bulgarian Strength / Kraftausdauer: 5 × (6 Wdh. bei 75–80 % + 12 Wdh. bei 55 %). 4 Stationen nacheinander, 4 Runden. Pause 3–4 min. Zusätzlich Core, Beine und Schulterstabilität.',
  trx:'3 Serien mit 12 TRX-Übungen (4 Oberkörper / 4 Unterkörper / 4 Core). 50 s Arbeit / 10 s Pause. Serienpause 6 min.',
  wasser:'Session 1 – Aerobe Power: 3 Sätze (8 × 1 Feldlänge bei 85 % HFmax; Pause = Feldbreite). Satzpause 5–6 min.\nSession 2 – Speed: 3 Sätze (6 × 1 Feldlänge maximal, abwechselnd fliegender und stehender Start; Pause 45 s). Satzpause 4–5 min.\nBootsbeherrschung: Manöver am Start oder während der Länge einbauen.',
  sonstiges:'45 min bis 1 h locker.'},
 {from:'2026-11-16',to:'2026-11-22',title:'Woche 3',
  kraft:'1× diese Woche. Bulgarian Strength: 3 × (1 Wdh. bei 90 % + 3 Wdh. bei 70 % + 8 Wdh. bei 40 %). Jede Station einzeln für saubere Ausführung, 3–4 Stationen. Pause zwischen Wdh.-Blöcken 4 min, Satzpause 7 min. Instabilität abwechseln: TRX Leg Raises oder Spiders und Swiss-Ball-Übungen.',
  trx:'Pause – kein TRX-Zirkel diese Woche.',
  wasser:'Session 1 – Aerobe Power: 3 Sätze (8 min im Wechsel 30 s bei 85 % MAP / 30 s locker). Pause 4 min.\nSession 2 – Speed: 3 Sätze (4 × 1 Feldlänge maximal, fliegender/stehender Start im Wechsel; Pause 1 min 30). Satzpause 4–5 min.\nFokus: längere Paddelschläge bei aerober Arbeit, Technik in die Speed-Arbeit integrieren. Lehrgang respektieren – bei Bedarf nur Session 1.',
  sonstiges:'10 × (15 s all-out); Pause 1 min 45.'},
 {from:'2026-11-23',to:'2026-11-29',title:'Woche 4',
  kraft:'2× pro Woche. Exzentrische Kraft: 3 × (1 exzentrische Wdh. bei 90 % (6 Sekunden) + 3 Wdh. bei 80 % + 10 Wdh. bei 50 %). Stationen einzeln, 3 Stationen. Pause zwischen Wdh.-Blöcken 30 s, Satzpause 7 min. Instabilität: TRX Leg Raises/Spiders und Swiss Ball, auch mit Poloball oder Medizinball.',
  trx:'4 Serien mit 10 TRX-Übungen (2 Oberkörper / 2 Unterkörper / 6 Core). 1 min Arbeit, keine Pause. Serienpause 5 min.',
  wasser:'Session 1 – Aerobe Power: 3 Sätze (6 min im Wechsel 20 s bei 85–90 % MAP / 20 s locker). Pause 4 min.\nSession 2 – Speed: freie Wahl, maximal 30 Minuten.\nFokus: längere Paddelschläge, Ballhandling in die Speed-Arbeit integrieren.',
  sonstiges:'2 × (6 × 15 s all-out); Pause 1 min 45; Satzpause 7 min.'}
];
const SEED_GOALS = 'Schwerpunkte aus Maxims Diagnose (November 2026):\n\n• Athletik: Kraft aufbauen und festigen, v. a. Balance zwischen Drücken und Ziehen. Hohe Grundfitness für mehr Explosivität im Zweikampf. Ausdauer über die Energiesysteme des Kanupolo. Breite Kraftbasis für Kraftübertragung und Bootskontrolle.\n• Kajak: Mehr Abwechslung im Training. Paddeltechnik und Effizienz verfeinern (Kraftübertragung). Solide aerobe Basis + spezifische Paddelausdauer.\n• Technik/Taktik: Ziele für mein Spiel klar definieren. Spielstil analysieren (Angreifer, Verteidiger, Blocker). Schlüsselbereiche für mehr Effizienz in Spielsituationen.\n• Mental: Programm für umfassende Diagnose; Fokus, Selbstvertrauen, Druckmanagement, Entscheidungsfindung.\n\nOrganisation: Monatsplan · Video-Session in der letzten Woche jedes Monats · Besuch in Essen Ende Januar · Turnier Helmond oder Essen.';

/* ---- Helfer ---- */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const uid = ()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-3);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2,'0');
const iso = d => d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today = ()=>iso(new Date());
const pdate = s => { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); };
const addDays = (s,n)=>{ const d=pdate(s); d.setDate(d.getDate()+n); return iso(d); };
const WD=['So','Mo','Di','Mi','Do','Fr','Sa'], MON=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const fdate = s => { if(!s) return ''; const d=pdate(s); return WD[d.getDay()]+', '+pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear(); };
const fshort = s => { if(!s) return ''; const d=pdate(s); return pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'; };
const weekStart = s => { const d=pdate(s); const wd=(d.getDay()+6)%7; d.setDate(d.getDate()-wd); return iso(d); };
const num = v => { if(v===''||v==null) return null; const n=parseFloat(String(v).replace(',','.')); return isNaN(n)?null:n; };
const fnum = n => n==null?'':String(Math.round(n*100)/100).replace('.',',');
const fmin = m => { m=Math.round(m||0); return m>=60? Math.floor(m/60)+' h '+pad(m%60)+' min' : m+' min'; };
const sum = (a,f=x=>x)=>a.reduce((s,x)=>s+(+f(x)||0),0);

const ICONS = {
 home:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z', calendar:'M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
 dumbbell:'M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11', trophy:'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4',
 chart:'M4 20V10M10 20V4M16 20v-7M21 20H3', gear:'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2M16 4v4M10 10v4M16 16v4',
 wave:'M2 9c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2 5-1M2 15c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2 5-1', bolt:'M13 2L4 14h7l-1 8 9-12h-7z',
 plus:'M12 5v14M5 12h14', check:'M5 12.5l4.5 4.5L19 7.5', trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6', back:'M15 5l-7 7 7 7',
 share:'M12 15V3M8 7l4-4 4 4M5 12v8h14v-8', pdf:'M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6', copy:'M9 9h11v11H9zM5 15H4V4h11v1',
 up:'M6 15l6-6 6 6', down:'M6 9l6 6 6-6', x:'M6 6l12 12M18 6L6 18', timer:'M12 8v5l3 2M9 2h6M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16z',
 user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', right:'M9 5l7 7-7 7', play:'M7 4l13 8-13 8z', edit:'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
 msg:'M4 5h16v11H9l-5 4z', pause:'M8 5v14M16 5v14', skip:'M6 5l9 7-9 7zM18 5v14', prev:'M18 5l-9 7 9 7zM6 5v14', list:'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01', watch:'M9 3h6l1 4M9 21h6l1-4M8 7h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM12 10v2.5l1.5 1'
};
const ic = (n,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n]||''}"/></svg>`;

const crestSvg = c=>`<svg class="${c}" viewBox="0 0 ${CREST.w.toFixed(1)} ${CREST.h}" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${CREST.crest}"/></svg>`;
const wheelSvg = c=>`<svg class="${c}" viewBox="${(CREST.cx-190).toFixed(1)} ${CREST.cy-190} 380 380" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${CREST.wheel}"/></svg>`;
const hm = m => { m=Math.round(m||0); return m<60 ? m+' min' : Math.floor(m/60)+':'+pad(m%60)+' h'; };
const mmss = s => { s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+pad(s%60); };
/* ---- Intervall-Timer ---- */
const mkStep=(label,work,rest)=>({id:uid(),label,work,rest});
const seedTimers=()=>[
 {id:uid(),name:'TRX Woche 2 · 12 × 50/10',rounds:3,prep:10,roundRest:360,steps:['TRX Row','TRX Push-Up','TRX Y Raise','TRX Face Pull','TRX Squat','TRX Split Squat','TRX Hamstring Curl','TRX Lateral Lunge','TRX Plank','TRX Knee Tuck','TRX Body Saw','TRX Pike'].map(n=>mkStep(n,50,10))},
 {id:uid(),name:'Core · 4 × 20 s, 5 Serien',rounds:5,prep:10,roundRest:180,steps:['Leg Raise','Cross Leg Raise','Crunch','Bicycle Crunch'].map(n=>mkStep(n,20,0))},
 {id:uid(),name:'Sprints · 10 × 15 s all-out',rounds:10,prep:10,roundRest:105,steps:[mkStep('All-out',15,0)]},
 {id:uid(),name:'Tabata · 8 × 20/10',rounds:8,prep:10,roundRest:10,steps:[mkStep('Belastung',20,0)]}];
const timerById=id=>S.timers.find(t=>t.id===id);
function buildSeq(t){
  const seq=[], R=Math.max(1,t.rounds||1), st=t.steps.filter(s=>s.work>0);
  if(t.prep>0&&st.length) seq.push({k:'prep',label:'Bereit machen',dur:t.prep});
  for(let r=1;r<=R;r++) st.forEach((s,j)=>{
    seq.push({k:'work',label:s.label||'Belastung',dur:s.work,r,j:j+1,n:st.length,R});
    const lastStep=j===st.length-1; const rest = lastStep ? (r<R ? (t.roundRest||s.rest||0) : 0) : (s.rest||0);
    if(rest>0) seq.push({k:'rest',label:lastStep?'Serienpause':'Pause',dur:rest,r,j:j+1,n:st.length,R}); });
  return seq;
}
const timerTotal=t=>sum(buildSeq(t),x=>x.dur);
const timerInfo=t=>`${t.rounds||1} ${t.rounds>1?'Runden':'Runde'}, ${t.steps.length} ${t.steps.length===1?'Schritt':'Schritte'}, ${mmss(timerTotal(t))} min`;
function timerFromItems(name,items){
  const its=items.filter(i=>i.mode==='t'); if(!its.length) return null;
  const g=i=>i.target||i;
  return {id:'tmp',name,rounds:Math.max(...its.map(i=>g(i).sets||1)),prep:10,roundRest:g(its[its.length-1]).rest||0,steps:its.map(i=>mkStep(i.name,g(i).time||30,g(i).rest||0))};
}
/* ---- Zustand ---- */
let S;
function freshState(){
  const exercises = seedExercises();
  const byName = Object.fromEntries(exercises.map(e=>[e.name,e]));
  const plans = SEED_PLANS.map(p=>({id:uid(),name:p.name,note:p.note,items:p.items.map(([n,sets,reps,pct,rest,note,block,mode])=>{
    const ex=byName[n]; if(!ex) console.warn('Seed: Übung fehlt',n);
    const m=mode||ex.mode;
    return {id:uid(),exId:ex.id,name:ex.name,mode:m,block:block||'',sets,reps:m==='t'?null:reps,time:m==='t'?reps:null,weight:null,pct:pct||null,rest:rest||0,note:note||''};
  })}));
  return {version:1,
    settings:{name:'Marvin',trainer:'Maxim',trainerPhone:'',trainerMail:'',lang:'en',theme:'light',goals:SEED_GOALS,restDefault:90},
    exercises, plans, guides:SEED_GUIDES.map(g=>({id:uid(),...g})), timers:seedTimers(), entries:[], tournaments:seedTournaments()};
}
function load(){
  try{ const raw=localStorage.getItem(KEY); if(raw){ S=JSON.parse(raw); migrate(); return; } }catch(e){ console.warn(e); }
  S=freshState(); 
}
function migrate(){
  const f=freshState();
  for(const k of ['settings','exercises','plans','guides','timers','entries','tournaments']) if(S[k]==null) S[k]=f[k];
  S.settings={...f.settings,...S.settings};
}
let saveWarned=false;
function save(){
  try{ localStorage.setItem(KEY,JSON.stringify(S)); }
  catch(e){ if(!saveWarned){ saveWarned=true; toast('Speichern nicht möglich – bitte Backup exportieren!'); } }
}
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('on'),2200); }

/* ---- Datenzugriff ---- */
const entry = id => S.entries.find(e=>e.id===id);
const tourn = id => S.tournaments.find(t=>t.id===id);
const exById = id => S.exercises.find(e=>e.id===id);
const planById = id => S.plans.find(p=>p.id===id);
const guideFor = date => S.guides.find(g=>g.from<=date && date<=g.to);
const guideText = (g,type,title='') => !g?'': type==='kraft' ? (/trx/i.test(title)? g.trx : g.kraft) : (g[type]||'');
function tournMinutes(t){ return sum(t.games,g=>g.minutes); }
function itemsFromPlan(p){
  return p.items.map(it=>({id:uid(),exId:it.exId,name:it.name,mode:it.mode,block:it.block||'',
    target:{sets:it.sets,reps:it.reps,time:it.time,weight:it.weight,pct:it.pct,rest:it.rest,note:it.note},
    sets:Array.from({length:Math.max(1,it.sets||1)},()=>({w:null,r:null,t:null,done:false}))}));
}
function newEntry(o){
  const e={id:uid(),type:'wasser',date:today(),time:'',title:'',planned:null,minutes:null,plan:'',notes:'',tags:[],rpe:null,done:false,items:[],feedback:'',reply:'',g:{},...o};
  if(!e.title) e.title=TYPES[e.type].label;
  if(!e.plan){ e.plan=guideText(guideFor(e.date),e.type,e.title)||''; }
  return e;
}
// Letzte Leistung für eine Übung (vor einem bestimmten Training)
function lastPerf(exId, before){
  const list=S.entries.filter(e=>e.type==='kraft'&&e.id!==before.id&&e.date<=before.date).sort((a,b)=>b.date.localeCompare(a.date));
  for(const e of list){ const it=e.items.find(i=>i.exId===exId&&i.sets.some(s=>s.done)); if(it) return {date:e.date,sets:it.sets.filter(s=>s.done)}; }
  return null;
}
function fset(s,mode){ return mode==='t' ? (s.t??'–')+' s' : mode==='r' ? (s.r??'–')+' Wdh.' : (s.w!=null?fnum(s.w)+' kg × ':'')+(s.r??'–'); }
function ftarget(it){
  const t=it.target||it; const a=[];
  const n=t.sets||1; const q=it.mode==='t'?(t.time?t.time+' s':''):(t.reps?t.reps+' Wdh.':'');
  a.push(n+' × '+(q||'–'));
  if(t.weight!=null) a.push(fnum(t.weight)+' kg');
  if(t.pct){ const ex=exById(it.exId); a.push(t.pct+' %'+(ex&&ex.orm?' ≈ '+fnum(pctWeight(ex.orm,t.pct))+' kg':'')); }
  if(t.rest) a.push('Pause '+(t.rest>=60?fnum(t.rest/60)+' min':t.rest+' s'));
  return a.join(' · ');
}
const pctWeight=(orm,pct)=>Math.round(orm*pct/100/2.5)*2.5;
const epley=(w,r)=> r>1 ? w*(1+r/30) : w;
// Pfad-Auflösung für data-bind: "entries/ID/items/ID/sets/0/w"
function ref(path){
  const segs=path.split('/'); let o=S;
  for(let i=0;i<segs.length-1;i++){
    const k=segs[i];
    if(Array.isArray(o)){ const byId=o.find(x=>x&&x.id===k); o = byId || o[+k]; }
    else { if(o[k]==null) o[k]={}; o=o[k]; }
    if(o==null) return null;
  }
  return [o,segs[segs.length-1]];
}
/* ---- Saisontermine 2027 (Key Dates, Stand 20.10.2026) ---- */
const NT='Deutschland (DKV)', CL='KSV Rothemühle Essen';
const SEED_EVENTS = [
 ['2027-02-20','2027-02-21','Taktiklehrgang','Bayreuth',NT,'lehrgang'],
 ['2027-03-06','2027-03-07','Taktiklehrgang','Braunschweig',NT,'lehrgang'],
 ['2027-03-27','2027-03-29','Internationales Osterturnier Helmond','Helmond, NL',CL,'turnier','Vereinsfahrt – die Nationaltrainer sind auch vor Ort.'],
 ['2027-04-03','2027-04-10','Athletik- & Taktiklehrgang (8 Tage)','Belek, Türkei',NT,'lehrgang'],
 ['2027-04-24','2027-04-25','Bundesliga-Spieltag','Liblar',CL,'turnier'],
 ['2027-05-01','2027-05-02','1. ECA Cup','Saint-Omer, FR',NT,'turnier','Teil des Nominierungsfensters für die EM.'],
 ['2027-05-15','2027-05-17','Deutschland-Cup','Ort offen',CL,'turnier','Vereins-Höhepunkt Nr. 1.'],
 ['2027-05-22','2027-05-23','XXL Bundesliga-Spieltag (Heim)','Essen',CL,'turnier'],
 ['2027-06-12','2027-06-13','2. ECA Cup','Pfyn, CH',NT,'turnier','Danach wird der EM-Kader nominiert!'],
 ['2027-06-26','2027-06-27','Bundesliga-Spieltag','Ort offen',CL,'turnier'],
 ['2027-07-03','2027-07-04','3. ECA Cup','Turnhout, BE',NT,'turnier'],
 ['2027-07-17','2027-07-18','XL Bundesliga-Spieltag','Brandenburg',CL,'turnier'],
 ['2027-07-31','2027-08-01','Taktiklehrgang Herren & U21','Ort offen',NT,'lehrgang'],
 ['2027-08-27','2027-08-29','Deutsche Meisterschaft','Bremen',CL,'turnier','Saisonziel Verein. Termin noch nicht final.'],
 ['2027-09-04','2027-09-05','Unmittelbare Wettkampfvorbereitung (UWV)','Duisburg (tbc)',NT,'lehrgang'],
 ['2027-09-19','2027-09-27','Europameisterschaft','Thury-Harcourt, FR',NT,'turnier','SAISONHÖHEPUNKT.'],
 ['2027-10-30','2027-10-31','Saisonauswertung','Ort offen',NT,'lehrgang'],
 ['2027-11-13','2027-11-14','Athletiklehrgang','Duisburg',NT,'lehrgang'],
 ['2027-11-20','2027-11-21','Athletiklehrgang','Duisburg',NT,'lehrgang']
];
const newTourn = o => ({id:uid(),name:'',from:today(),to:today(),ort:'',team:'',kind:'turnier',notes:'',platz:'',info:'',players:[],games:[],...o});
const seedTournaments = () => SEED_EVENTS.map(([from,to,name,ort,team,kind,notes])=>newTourn({from,to,name,ort,team,kind,notes:notes||''}));
