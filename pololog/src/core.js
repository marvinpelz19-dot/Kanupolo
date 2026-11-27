'use strict';
/* ============ PoloLog – Kern: Daten, Speicher, Helfer ============ */
let KEY = 'pololog.v1', PROFILE = 'owner';
const TEAM_ONLY = /*TEAM*/false; // Team-Ausgabe (team.html): nur eigenes Profil, ohne Profilauswahl
const KEYS = {owner:'pololog.v1', guest:'pololog.guest.v1'}, SESSION = 'pololog.session2', LOCK = 'pololog.lock';
const OWNER_NAME = 'Marvin Pelz';
const OWNER_LOCK = /*LOCK*/null; // optional fest hinterlegtes Passwort (Salt + Hash), siehe build.js
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
  'Pull':['Bankziehen (Langhantel)','Lat Pulldown','Barbell Row (Bent-Over Row)','Dumbbell Row','Seated Cable Row','Low Row','Upright Row','T-Bar Row','Face Pull','Face Pull (Bent)','Renegade Row','Single Arm Row','Straight Arm Pulldown','Landmine Row','Barbell Curl','Dumbbell Curl','Hammer Curl','Incline Curl','Concentration Curl','Preacher Curl','Zottman Curl','Cable Curl','Drag Curl','Bayesian Curl'],
  'Klimmzüge':['Pull-Up|r','Chin-Up|r','Pull-Up (wide grip)|r','Pull-Up (close grip)|r','Pull-Up (knees at 90°)|r','Pull-Up (crossed leg)|r','Hanging with ball between the legs|t','Pull-Up with added weight'],
  'Schulter':['Lateral Raise','Front Raise','Rear Delt Fly','Lateral Raise (Bent)','Front Arm Extension (dumbbells)','Lateral Arm Extension (dumbbells)','Overhead Arm Extension (dumbbells)','Shoulder Depression (cable – lateral)','Shoulder Depression (cable – front)','Internal Rotator (rotator cuff)','External Rotator (rotator cuff)'],
  'Core':['Plank|t','Side Plank|t','Dead Bug|r','Bird Dog|r','Crunch|r','Reverse Crunch|r','Bicycle Crunch|r','Leg Raise (straight)|r','Cross Leg Raise (alternating)|r','Hanging Leg Raise|r','Knee Raise|r','L-Sit|t','Russian Crunch|r','Toe Touch|r','Mountain Climber|t','Pallof Press','Woodchopper','Cable Crunch','Cable Rotation','Cable Chop'],
  'Unterer Rücken':['Superman (arms and legs extended)|t','Superman (with dumbbells)','Back Extension (on bench)|r','Hyperextension|r','Cable Pull-Through'],
  'Full Body':['Clean','Hang Clean','Power Clean','Snatch','Hang Snatch','Clean & Press','Kettlebell Swing','Turkish Get-Up','Thruster','Burpee|r','Farmer\'s Walk','Sled Push','Sled Pull','Battle Ropes|t','Plate Push','Plate Hold|t','Step Pitch|r'],
  'Plyometrie':['Box Jump|r','Squat Jump|r','Countermovement Jump|r','Broad Jump|r','Split Jump|r','Depth Jump|r','Lateral Jump|r','Hurdle Hop|r','Tuck Jump|r','Triple Jump|r'],
  'Medizinball':['MB Chest Pass','MB Overhead Throw','MB Wall Ball','MB Standing Twist','MB Seated Rotation','MB Seated Trunk Rotation','MB Seated Partner Pass (two-handed)','MB Russian Twist','MB Woodchopper','MB Pallof Press','MB Rotational Throw','MB Slam','MB Squat to Twist','MB Lunge & Twist','MB Dynamic Plank|t','MB Hip Thrust','MB Kneeling Press','MB Diagonal Throw'],
  'Swiss Ball':['SB Plank|t','SB Pike|r','SB Mountain Climber|t','SB Push-Up|r','SB Squat|r','SB Bulgarian Split Squat|r','SB Hip Thrust|r','SB Single Leg Deadlift|r','SB Side Plank|t','SB Bird Dog|r','SB Superman|r','SB Single Leg Balance|t','SB Side Bends|r','SB Trunk Rotation|r','SB Balance Pass|r','SB Unilateral Push-Up|r','SB Seated Balance (hold)|t','SB Seated Balance with arm action (paddle motion)|t','SB Trunk Rotation (feet on floor, back on ball)|r'],
  'TRX Oberkörper':['TRX Shoulder External Rotation|r','TRX Shoulder Internal Rotation|r','TRX Row|r','TRX Push-Up|r','TRX Chest Press|r','TRX T Fly|r','TRX Biceps Curl|r','TRX Triceps Extension|r','TRX Y Raise|r','TRX Face Pull|r'],
  'TRX Unterkörper':['TRX Reverse Lunge|r','TRX Squat|r','TRX Assisted Lunge|r','TRX Split Squat|r','TRX Single-Leg Squat|r','TRX Hamstring Curl|r','TRX Hip Hinge|r','TRX Glute Bridge|r','TRX Lateral Lunge|r'],
  'TRX Core':['TRX Spider|r','TRX Standing Fallout|r','TRX Plank|t','TRX Side Plank|t','TRX Pike|r','TRX Knee Tuck|r','TRX Mountain Climber|t','TRX Body Saw|r','TRX Side Crunch|r','TRX Atomic Push-Up|r']
};
// Ausführungstipps für die TRX-Übungen (werden als Hinweis an der Übung gespeichert)
const TRX_TIPS={
 'TRX Row':'Band mittel, Blick zum Anker. Körper wie ein Brett, Schulterblätter zuerst zusammenziehen, Ellbogen eng am Körper zu den Rippen. Langsam ablassen. Füße weiter nach vorn = schwerer.',
 'TRX Push-Up':'Band lang, Füße in den Schlaufen, Hände unter den Schultern. Rumpf fest, kein Hohlkreuz, Brust bis knapp über den Boden. Leichter: Hände in den Griffen im Stand.',
 'TRX Chest Press':'Band lang, Rücken zum Anker, Arme gestreckt vor der Brust. Körper als Linie absenken, Ellbogen etwa 45° zum Körper. Bänder dürfen die Arme nicht berühren.',
 'TRX T Fly':'Band mittel, Blick zum Anker. Arme fast gestreckt seitlich zum T öffnen, Schulterblätter zusammen. Schultern weg von den Ohren, nicht aus dem Rücken schwingen.',
 'TRX Biceps Curl':'Band mittel, Blick zum Anker, Handflächen nach oben. Oberarme bleiben ruhig auf Schulterhöhe, nur die Ellbogen beugen, Griffe zur Stirn.',
 'TRX Triceps Extension':'Band mittel bis lang, Rücken zum Anker. Ellbogen zeigen nach vorn und bleiben stehen, Hände zur Stirn, dann strecken. Rumpf fest.',
 'TRX Y Raise':'Band mittel, Blick zum Anker. Gestreckte Arme schräg nach oben zum Y heben, Daumen nach hinten. Wenig Schräglage wählen, die Übung ist schwerer als sie aussieht.',
 'TRX Face Pull':'Band mittel, Blick zum Anker. Ellbogen hoch und weit, Griffe zu den Schläfen ziehen, am Ende nach außen rotieren. Schulterblätter aktiv.',
 'TRX Shoulder External Rotation':'Band mittel, Blick zum Anker, Ellbogen auf Schulterhöhe und 90° gebeugt. Unterarme kontrolliert nach hinten-oben rotieren. Sehr wenig Schräglage, schmerzfrei bleiben.',
 'TRX Shoulder Internal Rotation':'Band mittel, Ellbogen auf Schulterhöhe und 90° gebeugt. Unterarme kontrolliert nach vorn-unten rotieren. Sehr leichter Widerstand, kleiner Bewegungsweg.',
 'TRX Squat':'Band mittel, Blick zum Anker, Arme lang. Gesäß nach hinten-unten, Gewicht auf den Fersen, Knie über den Fußspitzen. Nur so viel ziehen wie nötig.',
 'TRX Reverse Lunge':'Band mittel, Blick zum Anker. Ein Bein weit nach hinten, hinteres Knie Richtung Boden, vorderes Knie über dem Fuß. Aus dem vorderen Bein hochdrücken.',
 'TRX Assisted Lunge':'Band mittel, Blick zum Anker. Ausfallschritt mit leichter Unterstützung über die Griffe, Oberkörper aufrecht, hinteres Knie Richtung Boden.',
 'TRX Split Squat':'Band mittel, Schrittstellung. Senkrecht absenken, Gewicht auf dem vorderen Bein, Griffe nur zum Ausbalancieren. Seite wechseln.',
 'TRX Single-Leg Squat':'Band mittel, Blick zum Anker. Auf einem Bein nach hinten absetzen, freies Bein nach vorn. Knie stabil über dem Fuß, mit den Armen nur so viel helfen wie nötig.',
 'TRX Hamstring Curl':'Band lang, Rückenlage, Fersen in den Schlaufen. Hüfte anheben und oben lassen, Fersen zum Gesäß ziehen, langsam strecken. Nicht ins Hohlkreuz fallen.',
 'TRX Hip Hinge':'Band mittel, Blick zum Anker. Hüfte nach hinten schieben, Rücken gerade, Knie leicht gebeugt, Arme lang. Aus Gesäß und Beinrückseite aufrichten.',
 'TRX Glute Bridge':'Band lang, Rückenlage, Fersen in den Schlaufen, Knie 90°. Hüfte bis zur Linie Knie–Schulter heben, oben kurz anspannen, kontrolliert ablassen.',
 'TRX Lateral Lunge':'Band mittel, Blick zum Anker. Weiter Schritt zur Seite, Gesäß nach hinten, anderes Bein bleibt gestreckt. Aus dem gebeugten Bein zurückdrücken.',
 'TRX Plank':'Band lang, Füße in den Schlaufen, Unterarme oder Hände am Boden. Kopf bis Ferse eine Linie, Bauch und Gesäß fest, nicht durchhängen.',
 'TRX Side Plank':'Band lang, Füße versetzt in den Schlaufen, auf einem Unterarm seitlich stützen. Hüfte hoch, Körper eine Linie, nicht nach vorn kippen.',
 'TRX Pike':'Band lang, Füße in den Schlaufen, Liegestützposition. Hüfte mit gestreckten Beinen zur Decke heben, Schultern über den Händen, langsam zurück.',
 'TRX Knee Tuck':'Band lang, Füße in den Schlaufen, Liegestützposition. Beide Knie zur Brust ziehen, Hüfte ruhig, langsam zurück ohne Hohlkreuz.',
 'TRX Mountain Climber':'Band lang, Füße in den Schlaufen, Liegestützposition. Knie im Wechsel zur Brust, Hüfte bleibt tief und ruhig, Schultern über den Händen.',
 'TRX Body Saw':'Band lang, Füße in den Schlaufen, Unterarmstütz. Den ganzen Körper aus den Schultern vor und zurück schieben, Rumpf bleibt starr.',
 'TRX Side Crunch':'Band lang, Füße in den Schlaufen, Liegestütz oder Unterarmstütz. Beide Knie seitlich zu einem Ellbogen ziehen, Seite wechseln, Schultern bleiben parallel zum Boden.',
 'TRX Atomic Push-Up':'Band lang, Füße in den Schlaufen. Ein Liegestütz, dann beide Knie zur Brust ziehen, zurück strecken. Tempo erst steigern, wenn die Hüfte ruhig bleibt.',
 'TRX Spider':'Band lang, Füße in den Schlaufen, Liegestützposition. Ein Knie außen zum gleichseitigen Ellbogen führen, Seiten kontrolliert wechseln, Hüfte nicht aufdrehen.',
 'TRX Standing Fallout':'Band mittel bis lang, Rücken zum Anker, Arme gestreckt vor dem Körper. Mit gestreckten Armen nach vorn lehnen, bis die Arme neben den Ohren sind, Rumpf fest, zurückziehen.'};
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function seedExercises(){
  const out=[];
  for(const cat in LIB) for(const e of LIB[cat]){ const [name,mode]=e.split('|'); out.push({id:'x-'+slug(name),name,cat,mode:mode||'wr',note:TRX_TIPS[name]||'',orm:null}); }
  return out;
}
// TRX-Zirkel Woche 2 (9.–15.11.): [Übung, Pause danach s, Hinweis, Block]
const W2='TRX – Woche 2 (12 Übungen, 50/10)', W2T='TRX Woche 2 · 12 × 50/10', W2DAY='2026-11-13';
const BM='Band mittel · stehend, Blick zum Anker', BL='Band lang (Mitte Wade)';
const W2_ITEMS=[
 ['TRX Squat',10,'Unterkörper. Arme lang, Gewicht auf den Fersen',BM],
 ['TRX Row',10,'Oberkörper Zug. Körper wie ein Brett, Ellbogen eng',BM],
 ['TRX Lateral Lunge',10,'Unterkörper. Seite nach jeder Wiederholung wechseln',BM],
 ['TRX Y Raise',10,'Schulter. Arme gestreckt zum Y, Schritt zurück macht es leichter',BM],
 ['TRX Split Squat',25,'Unterkörper. Danach Band auf lang stellen (Schlaufen Mitte Wade)',BM],
 ['TRX Chest Press',10,'Oberkörper Druck. Rücken zum Anker, Band nicht an den Armen',BL],
 ['TRX Hamstring Curl',25,'Rückenlage, Fersen in den Schlaufen, Hüfte oben. Danach in den Stütz drehen',BL],
 ['TRX Plank',10,'Bauchlage, Füße in den Schlaufen',BL],
 ['TRX Push-Up',10,'Oberkörper Druck. Füße bleiben drin',BL],
 ['TRX Knee Tuck',10,'Knie zur Brust, Hüfte ruhig',BL],
 ['TRX Body Saw',10,'Im Unterarmstütz vor und zurück. Ersatz: TRX Side Plank',BL],
 ['TRX Mountain Climber',360,'Letzte Übung, danach 6 min Serienpause und Band wieder auf mittel',BL]];
// Kraft-Session 16.11. (nur 1× diese Woche, Ziel: Dynamic)
const N16='Kraft – Session 16.11. · Dynamic (1× diese Woche)', N16DAY='2026-11-16';
const BULG=[{reps:1,pct:90,rest:0},{reps:3,pct:70,rest:0},{reps:8,pct:40,rest:0}];
const bulgRound=r=>{ const bl='Bulgarian Strength · Runde '+r+' von 3'; return [
  ['Bench Press',3,null,null,0,'Start jeder Wiederholung so explosiv wie möglich. Danach direkt zum Low Row. (Maxims Blatt: Push 1)',bl,'wr',BULG],
  ['Low Row',3,null,null,0,'Explosiv ziehen. Danach direkt zum Trizeps. (Maxims Blatt: Pull 6)',bl,'wr',BULG],
  ['Triceps Pushdown',3,null,null,r<3?210:420,r<3?'Danach 3–4 min Pause, dann die nächste Runde. (Maxims Blatt: Push 6)':'Danach 7 min Pause, dann weiter mit Core. (Maxims Blatt: Push 6)',bl,'wr',BULG]]; };
// Woche 4 (23.–29.11.): Kraft exzentrisch (2× pro Woche) und TRX mit 10 Übungen
const N23='Kraft – Session 23.11. · Exzentrisch (2× diese Woche)', W4N='TRX – Woche 4 (10 Übungen, 1 min)', W4T='TRX Woche 4 · 10 × 60 s';
const ECC=[{reps:1,pct:90,rest:0},{reps:3,pct:80,rest:0}];
const eccStation=(name,a,an,b,bmode,bpct,bn)=>[1,2,3].flatMap(r=>{ const bl=name+' · Runde '+r+' von 3'; return [
  [a,2,null,null,0,an,bl,'wr',ECC],
  [b,1,10,bpct,420,bn+(r<3?' Danach 7 min Pause.':' Danach 7 min Pause, dann nächste Station.'),bl,bmode]]; });
const eccPullUp=[1,2,3].flatMap(r=>{ const bl='Klimmzüge exzentrisch · Runde '+r+' von 3'; return [
  ['Pull-Up with added weight',1,1,null,0,'Exzentrisch: 1 Wdh. mit Zusatzgewicht am Gürtel (90 %), 6 s ablassen. Direkt weiter.',bl,'wr'],
  ['Pull-Up (wide grip)',1,3,null,0,'Konzentrisch: 3 Wdh. mit Körpergewicht (80 %). Direkt weiter.',bl,'r'],
  ['Lat Pulldown',1,10,40,420,'10 Wdh. dynamisch bei 40 %. Danach 7 min Pause.',bl,'wr']]; });
const W4_ITEMS=[
 ['TRX Row','Griffe zu den Rippen ziehen, Körper bleibt eine Linie','Band mittel · stehend'],
 ['TRX Squat','Nach hinten in die Hocke setzen, kontrolliert aufstehen','Band mittel · stehend'],
 ['TRX Reverse Lunge','Ein Bein nach hinten in den Ausfallschritt, zurück in den Stand','Band mittel · stehend'],
 ['TRX Plank','Stabile Planke halten, Füße in den Schlaufen (Suspended Plank)','Band lang · Füße in den Schlaufen'],
 ['TRX Knee Tuck','Aus der Planke beide Knie zur Brust ziehen','Band lang · Füße in den Schlaufen'],
 ['TRX Pike','Aus der Planke die Hüfte zur Decke heben, Beine gestreckt','Band lang · Füße in den Schlaufen'],
 ['TRX Spider','Aus der Planke ein Knie außen zum gleichseitigen Ellbogen, Seiten wechseln','Band lang · Füße in den Schlaufen'],
 ['TRX Shoulder External Rotation','Ellbogen auf Schulterhöhe, 90° gebeugt, kontrolliert nach außen rotieren','Band mittel · stehend'],
 ['TRX Shoulder Internal Rotation','Ellbogen auf Schulterhöhe, 90° gebeugt, kontrolliert nach innen rotieren','Band mittel · stehend'],
 ['TRX Standing Fallout','Mit gestreckten Armen nach vorn lehnen, Rumpf fest','Band mittel · stehend']];
// Dezember Woche 1 (30.11.–6.12.): Kraft exzentrisch 95/85/55 (3× pro Woche), TRX 6 Übungen, Boot, Laufen
const D1K='Kraft – Dez Woche 1 · Exzentrisch 95/85/55 (3× diese Woche)', D1T='TRX – Dez Woche 1 (6 Übungen, 10 Wdh.)';
const D1TT='TRX Dez W1 · 6 Übungen, 6 Serien', B1T='Boot S1 · 3 × 8 min 30/30', B2T='Boot S2 · 3 × 10 min bei 70 %';
const d1Stations=[
 ...[1,2,3].flatMap(r=>{ const bl='Push exzentrisch · Runde '+r+' von 3'; return [
  ['Bench Press',2,null,null,0,'Satz 1 exzentrisch: 2 Wdh. bei 95 %, je 6 s ablassen, nur mit Sicherung! 30 s Pause. Satz 2 konzentrisch: 2 Wdh. bei 85 %. 30 s Pause, dann Liegestütze. (Maxims Blatt: Push 1)',bl,'wr',[{reps:2,pct:95,rest:30},{reps:2,pct:85,rest:30}]],
  ['Push-Up',1,8,null,420,'8 dynamische Liegestütze mit normalem Griff (die 55 %). Danach 7 min Pause. (Maxims Blatt: Push 3)',bl,'r']]; }),
 ...[1,2,3].flatMap(r=>{ const bl='Pull exzentrisch · Runde '+r+' von 3'; return [
  ['Seated Cable Row',1,null,null,0,'Exzentrisch: 2 Wdh. bei 95 %, je 6 s nachgeben, mit Hilfe beim Anziehen. 30 s Pause, dann Low Row. (Maxims Blatt: Pull 2)',bl,'wr',[{reps:2,pct:95,rest:30}]],
  ['Low Row',2,null,null,420,'Satz 1 konzentrisch: 2 Wdh. bei 85 %. 30 s Pause. Satz 2: 8 dynamische Wdh. bei 55 %. Danach 7 min Pause. (Maxims Blatt: Pull 6)',bl,'wr',[{reps:2,pct:85,rest:30},{reps:8,pct:55,rest:0}]]]; }),
 ...[1,2,3].flatMap(r=>{ const bl='Klimmzüge exzentrisch · Runde '+r+' von 3'; return [
  ['Pull-Up with added weight',1,2,null,30,'Exzentrisch: 2 Wdh. mit 20 kg Zusatzgewicht (95 %), je 6 s ablassen. 30 s Pause. (Maxims Blatt: Pull-up 6)',bl,'wr',null,null,20],
  ['Pull-Up (close grip)',1,2,null,30,'Konzentrisch: 2 Wdh. mit Körpergewicht (85 %). 30 s Pause. (Maxims Blatt: Pull-up 2)',bl,'r'],
  ['Lat Pulldown',1,8,55,420,'8 dynamische Wdh. mit leichtem Gewicht (55 %). Danach 7 min Pause. (Maxims Blatt: Pull 3)',bl,'wr']]; })];
const TMR=(work,rr)=>({n:1,work,rest:0,rr});
const D1T_ITEMS=[
 ['TRX Spider','Aus der Planke ein Knie zum gleichseitigen Ellbogen, Seiten kontrolliert wechseln','Band lang · Füße in den Schlaufen'],
 ['TRX Knee Tuck','Beide Knie zur Brust, langsam zurück ohne Hohlkreuz. Kombination: Ball auf den Boden werfen','Band lang · Füße in den Schlaufen'],
 ['TRX Biceps Curl','Blick zum Anker, Handflächen nach oben, Oberarme ruhig, Griffe zur Stirn','Band mittel · stehend'],
 ['TRX Triceps Extension','Rücken zum Anker, Hände zur Stirn beugen, dann strecken, Rumpf fest. Kombination: Rugby-Pass über Kopf mit Ball','Band mittel · stehend'],
 ['TRX Shoulder Internal Rotation','Sehr leichter Widerstand, kleiner schmerzfreier Weg, Ellbogen 90°. Kombination: Ausholbewegung zum Wurf mit Ball','Band mittel · stehend'],
 ['TRX Shoulder External Rotation','Sehr leichter Widerstand, Ellbogen 90°, nach außen rotieren ohne die Schultern hochzuziehen','Band mittel · stehend']];
const DEC_GUIDES=[
 {from:'2026-11-30',to:'2026-12-06',title:'Dezember · Woche 1',en:'December Week 1',
  kraft:'3× diese Woche. Exzentrische Kraft: 3 × (2 exzentrische Wdh. bei 95 % (6 Sekunden) + 2 Wdh. bei 85 % + 8 Wdh. bei 55 %). Stationen einzeln für saubere Ausführung, 3 Stationen. Pause zwischen den Lasten 30 s, Satzpause 7 min. Dazu Core-Übungen, KEINE Schulterstabilität.',
  trx:'6 Serien mit 6 TRX-Übungen: je 10 sehr dynamische Bewegungen, kombiniert mit Technik (Ballwurf, Paddelbewegung). Pause 1 min, Serienpause 5 min.',
  wasser:'Session 1 – Aerobe Power: 3 Sätze à 8 min; 30 s bei 85 % HFmax / 30 s locker paddeln (60–70 % HF). Satzpause 4 min.\nSession 2 – 3 Sätze à 10 min bei 70 % HF. Satzpause 4 min.\nFokus: Rumpf im Boot, die direkte Übertragung vom Oberkörper auf die Bootsgeschwindigkeit spüren.',
  sonstiges:'45 min bis 1 h locker.'},
 {from:'2026-12-07',to:'2026-12-13',title:'Dezember · Woche 2',en:'December Week 2',
  kraft:'3× diese Woche. Exzentrische Kraft: 3 × (1 exzentrische Wdh. bei 100 % (6 Sekunden) + 1 Wdh. bei 90 % + 6 Wdh. bei 60 %). Stationen einzeln, 3 Stationen. Pause zwischen den Lasten 30 s, Satzpause 7 min. Dazu Core-Übungen, KEINE Schulterstabilität.',
  trx:'5 Serien mit 6 TRX-Übungen: je 10 sehr dynamische Bewegungen, kombiniert mit Technik (Ballwurf, Paddelbewegung). Pause 30 s, Serienpause 4 min.',
  wasser:'Session 1 – Aerobe Power: 3 Sätze à 8 min; 20 s bei 85 % HFmax / 20 s locker paddeln (60–70 % HF). Satzpause 4 min.\nSession 2 – 4 Sätze à 8 min bei 70–75 % HF. Satzpause 4 min.\nFokus: Rumpf im Boot, Übertragung vom Oberkörper auf die Bootsgeschwindigkeit.',
  sonstiges:'45 min bis 1 h locker.'},
 {from:'2026-12-14',to:'2026-12-20',title:'Dezember · Woche 3',en:'December Week 3',
  kraft:'1× diese Woche. Maximalkraft-Test und 1-Minuten-Test bei 60 % (Ziehen und Drücken). Sonst Pause.',
  trx:'Pause.',
  wasser:'Session 1 – Aerobe Power: 5 Sätze à 3 min bei 85–90 % HF. Pause 6 min.\nSession 2 – Speed: 10 Sprints von 6 bis 10 Sekunden mit maximaler Geschwindigkeit, fliegender Start. Pause 1 min 30.',
  sonstiges:'Pause.'},
 {from:'2026-12-21',to:'2026-12-27',title:'Dezember · Woche 4',en:'December Week 4',
  kraft:'Wird nach deinem Feedback zu den drei Wochen Exzentrik festgelegt.',trx:'',wasser:'',sonstiges:''}];
// Wochen-Feedback nach Maxims Bogen (Quick Session Evaluation)
const WF=[['strength','Strength Training','Kraft'],['kayak','Kayak','Boot'],['trx','TRX','TRX'],['running','Running','Laufen, Rad, Sonstiges'],['fitness','Overall Fitness','Gesamtform']];
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
 {name:D1K, note:'Ziel: physio-muskuläre Entwicklung (exzentrisch). 3× diese Woche. Je Station 3 Runden: 2 exzentrische Wdh. bei 95 % (6 s ablassen) + 2 Wdh. bei 85 % + 8 dynamische Wdh. bei 55 %, zwischen den Lasten 30 s, danach 7 min Pause. Für die exzentrischen Wiederholungen brauchst du jemanden zur Sicherung! Diese Woche keine Schulterstabilität.', items:[
  ...d1Stations,
  ['Cross Leg Raise (alternating)',4,45,null,75,'4 × 45 s, Pause 1:15. Erst alle Sätze dieser Übung, dann Bicycle Crunch','Core','t',null,TMR(45,75)],
  ['Bicycle Crunch',4,45,null,75,'4 × 45 s, Pause 1:15','Core','t',null,TMR(45,75)],
  ['Superman (with dumbbells)',4,30,null,60,'4 × 30 s mit 1 kg in jeder Hand, Pause 1 min','Unterer Rücken','t',null,TMR(30,60)],
  ['MB Seated Trunk Rotation',4,45,null,75,'4 × 45 s mit Medizinball, Pause 1:15','Medizinball','t',null,TMR(45,75)],
  ['SB Trunk Rotation (feet on floor, back on ball)',4,10,null,60,'4 × 10 Bewegungen insgesamt, Pause 1 min','Swiss Ball','r']]},
 {name:D1T, note:'Maxims TRX-Plan vom 30.11.: 6 Serien, 6 Übungen nacheinander, je 10 sehr dynamische Bewegungen, kombiniert mit Technik (Ballwurf, Paddelbewegung). 1 min Pause nach jeder Übung, 5 min Serienpause. Band: Übung 1–2 lang mit Füßen in den Schlaufen, 3–6 mittel im Stand.', items:D1T_ITEMS.map(([n,cue,bl],i,a)=>[n,6,10,null,i===a.length-1?300:60,cue,bl,'r',null,{n:1,work:30,rest:60,rr:300}])},
 {name:N23, note:'Ziel: exzentrische Kraft. 2× diese Woche. Je Station 3 Runden: 1 exzentrische Wdh. bei 90 % (6 s ablassen) + 3 konzentrische Wdh. bei 80 % + 10 dynamische Wdh. bei 40 %, die drei Lasten direkt nacheinander, dann 7 min Pause. Für die exzentrische Wiederholung brauchst du jemanden zur Sicherung! Swiss-Ball-Übung nach Wahl zusätzlich möglich.', items:[
  ...eccStation('Push exzentrisch','Bench Press','Satz 1 exzentrisch: 1 Wdh. bei 90 %, 6 s ablassen, nur mit Sicherung! Satz 2 konzentrisch: 3 Wdh. bei 80 %. Dann direkt Liegestütze. (Maxims Blatt: Push 1)','Push-Up','r',null,'10 dynamische Liegestütze mit Körpergewicht (die 40 %).'),
  ...eccStation('Pull exzentrisch','Seated Cable Row','Satz 1 exzentrisch: 1 Wdh. bei 90 %, 6 s nachgeben, mit Hilfe beim Anziehen. Satz 2 konzentrisch: 3 Wdh. bei 80 %. Dann direkt Low Row. (Maxims Blatt: Pull 2)','Low Row','wr',40,'10 Wdh. dynamisch bei 40 %. (Maxims Blatt: Pull 6)'),
  ...eccPullUp,
  ['Leg Raise (straight)',4,15,null,0,'15 Wdh., direkt weiter','Core · 4 Runden am Stück','r'],
  ['Cross Leg Raise (alternating)',4,15,null,0,'15 Wdh., direkt weiter','Core · 4 Runden am Stück','r'],
  ['Crunch',4,50,null,0,'50 Wdh., direkt weiter','Core · 4 Runden am Stück','r'],
  ['Bicycle Crunch',4,20,null,210,'20 Wdh., dann 3–4 min Pause. Frisch genug starten, damit die Bewegung dynamisch bleibt','Core · 4 Runden am Stück','r'],
  ['Superman (arms and legs extended)',4,60,null,120,'1 Minute statisch halten. Pause 2 min','Unterer Rücken','t',null,{n:1,work:60,rest:0,rr:120}],
  ['Shoulder Depression (cable – front)',4,10,null,0,'10 Wdh. Positionsarbeit zur Verletzungsvorbeugung','Schulter · 4 Runden','wr'],
  ['Internal Rotator (rotator cuff)',4,10,null,0,'10 Wdh. je Seite','Schulter · 4 Runden','wr'],
  ['External Rotator (rotator cuff)',4,10,null,120,'10 Wdh. je Seite. Pause 2 min','Schulter · 4 Runden','wr']]},
 {name:N16, note:'Nur eine Kraft-Einheit diese Woche. Bulgarian Strength in 3 Runden: Bankdrücken, dann direkt Low Row, dann direkt Trizeps, jeweils 1 Wdh. bei 90 % + 3 Wdh. bei 70 % + 8 Wdh. bei 40 %. Erst nach dem Trizeps 3–4 min Pause, nach der dritten Runde 7 min. Danach Core, unterer Rücken, Medizinball, Klimmzüge und Schulter.', items:[
  ...[1,2,3].flatMap(bulgRound),
  ['Leg Raise (straight)',3,20,null,0,'20 s, direkt weiter','Core · 3 Runden, dynamisch','t'],
  ['Cross Leg Raise (alternating)',3,20,null,0,'20 s, direkt weiter','Core · 3 Runden, dynamisch','t'],
  ['Crunch',3,20,null,0,'20 s, direkt weiter','Core · 3 Runden, dynamisch','t'],
  ['Bicycle Crunch',3,20,null,180,'20 s, dann 3 min Pause. Saubere, dynamische Bewegung','Core · 3 Runden, dynamisch','t'],
  ['Superman (arms and legs extended)',3,6,null,60,'Pro Runde 6 × 10 s halten, dazwischen 5 s lösen. Über „Timer“ läuft das automatisch','Unterer Rücken','r',null,{n:6,work:10,rest:5}],
  ['MB Seated Trunk Rotation',3,15,null,0,'Mit Medizinball, Wiederholungszahl frei (15 als Richtwert)','Medizinball · 3 Runden','r'],
  ['MB Seated Partner Pass (two-handed)',3,15,null,60,'Wenn möglich mit Mitspieler gegenüber, etwa 15 beidhändige Pässe','Medizinball · 3 Runden','r'],
  ['Pull-Up (close grip)',3,5,null,0,'Dynamisch, direkt weiter','Klimmzüge · 3 Runden','r'],
  ['Hanging with ball between the legs',3,5,null,120,'5 Klimmzüge mit Ball zwischen den Beinen. Pause 2 min','Klimmzüge · 3 Runden','r'],
  ['Shoulder Depression (cable – front)',3,10,null,0,'Leichter Widerstand, nur Positionsarbeit','Schulter · 3 Runden','wr'],
  ['Internal Rotator (rotator cuff)',3,10,null,0,'Leichter Widerstand','Schulter · 3 Runden','wr'],
  ['External Rotator (rotator cuff)',3,10,null,180,'Leichter Widerstand. Pause 3 min','Schulter · 3 Runden','wr']]},
 {name:W2, note:'3 Serien · 50 s Arbeit / 10 s Pause · Serienpause 6 min. 4 Oberkörper / 4 Unterkörper / 4 Core. Reihenfolge so, dass das Band nur einmal pro Serie umgestellt wird (nach Übung 5 von mittel auf lang). In den Pausen ab Übung 8 Knie ablegen, Füße bleiben in den Schlaufen.', items:W2_ITEMS.map(([n,rest,note,block])=>[n,3,50,null,rest,note,block,'t'])},
 {name:W4N, note:'Maxims TRX-Plan vom 23.11.: 4 Serien mit 10 Übungen (1 Oberkörper, 2 Unterkörper, 7 Core/Ganzkörper). 1 Minute Arbeit, keine Pause, von Übung 1 bis 10 durch, dann 5 min Serienpause. Band: Übung 1–3 mittel, 4–7 lang mit Füßen in den Schlaufen, 8–10 wieder mittel.', items:W4_ITEMS.map(([n,cue,bl],i,a)=>[n,4,60,null,i===a.length-1?300:0,cue,bl,'t'])}
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
 msg:'M4 5h16v11H9l-5 4z', pause:'M8 5v14M16 5v14', lock:'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z', logout:'M10 5H5v14h5M14 8l4 4-4 4M18 12H9', skip:'M6 5l9 7-9 7zM18 5v14', prev:'M18 5l-9 7 9 7zM6 5v14', list:'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01', watch:'M9 3h6l1 4M9 21h6l1-4M8 7h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM12 10v2.5l1.5 1'
};
const ic = (n,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n]||''}"/></svg>`;

const crestSvg = c=>`<svg class="${c}" viewBox="0 0 ${CREST.w.toFixed(1)} ${CREST.h}" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${CREST.crest}"/></svg>`;
const wheelSvg = c=>`<svg class="${c}" viewBox="${(CREST.cx-190).toFixed(1)} ${CREST.cy-190} 380 380" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${CREST.wheel}"/></svg>`;
const hm = m => { m=Math.round(m||0); return m<60 ? m+' min' : Math.floor(m/60)+':'+pad(m%60)+' h'; };
const mmss = s => { s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+pad(s%60); };
/* ---- Intervall-Timer ---- */
const mkStep=(label,work,rest)=>({id:uid(),label,work,rest});
const seedTimers=()=>[
 {id:uid(),name:W2T,rounds:3,prep:10,roundRest:360,steps:W2_ITEMS.map(([n,rest],i,a)=>mkStep(n+(i===0?' (Band mittel)':i===5?' (Band lang)':''),50,i===a.length-1?0:rest))},
 {id:uid(),name:D1TT,rounds:6,prep:10,roundRest:300,steps:D1T_ITEMS.map(([n])=>mkStep(n+' · 10 Wdh.',30,60))},
 {id:uid(),name:B1T,rounds:3,prep:10,roundRest:240,steps:Array.from({length:16},(_,i)=>mkStep(i%2?'Locker paddeln · 60–70 % HF':'Schnell · 85 % HFmax',30,0))},
 {id:uid(),name:B2T,rounds:3,prep:10,roundRest:240,steps:[mkStep('Paddeln bei 70 % HF',600,0)]},
 {id:uid(),name:W4T,rounds:4,prep:10,roundRest:300,steps:W4_ITEMS.map(([n])=>mkStep(n,60,0))},
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
const isTimed=i=>i.mode==='t'||!!i.tm;
const isCircuit=items=>items.length>0&&items.filter(isTimed).length>=items.length*.6;
function timerFromItems(name,items){
  const its=items.filter(isTimed); if(!its.length) return null;
  const g=i=>i.target||i, work=i=>i.mode==='t'?(g(i).time||30):itemTm(i).work;
  return {id:'tmp',name,rounds:Math.max(...its.map(i=>g(i).sets||1)),prep:10,roundRest:g(its[its.length-1]).rest||0,steps:its.map(i=>mkStep(i.name+(i.mode==='t'?'':' · '+(g(i).reps||10)+' Wdh.'),work(i),g(i).rest||0))};
}
// Timer-Vorgabe für eine einzelne Übung: n Intervalle pro Satz mit Belastung und Pause
function itemTm(it){
  const tg=it.target||{};
  if(it.tm) return it.tm;
  return it.mode==='t' ? {n:1,work:tg.time||30,rest:0} : it.mode==='wr' ? {n:1,work:30,rest:0} : {n:tg.reps||6,work:10,rest:5};
}
/* ---- Wochen-Feedback ---- */
const wfCat = e => e.type==='wasser'?'kayak':e.type==='sonstiges'?'running':/trx/i.test(e.title||'')?'trx':'strength';
const wfEntries = ws => S.entries.filter(e=>e.date>=ws&&e.date<=addDays(ws,6)).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
function wfSuggest(ws){ const o={}; for(const [k] of WF){ const v=wfEntries(ws).filter(e=>e.diff&&wfCat(e)===k).map(e=>e.diff); if(v.length) o[k]=Math.round(sum(v)/v.length); } return o; }
function wfLabel(ws){ const g=guideFor(ws), d=pdate(ws), mon=['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()];
  if(g&&g.en) return g.en;
  const n=g&&(g.title.match(/\d+/)||[])[0]; return n?mon+' Week '+n:'Week of '+d.getDate()+' '+mon+' '+d.getFullYear(); }
function wfGet(ws){ const w=S.weekly[ws]=S.weekly[ws]||{}; if(w.label==null) w.label=wfLabel(ws); w.scores=w.scores||{}; if(w.comments==null) w.comments=''; return w; }
/* ---- Zustand ---- */
let S;
/* ---- Beispielpläne für eigene Profile (Einsteiger, 18–22 Jahre) ---- */
const H='Hör auf, wenn noch etwa zwei Wiederholungen gegangen wären.';
const GP='Der Grundlagenplan für Kanupolo: Muskeln aufbauen, stärker werden und die Schultern gesund halten. Zwei bis drei Einheiten pro Woche, jede dauert 60 bis 80 Minuten und soll sich insgesamt wie eine 8 von 10 anfühlen. ';
const GPP='Pflichtübung. Du startest mit etwa 60 % deines Maximalgewichts und 3 × 10. Jede Woche kommen 2,5 kg drauf. Klappt die Vorgabe zweimal hintereinander nicht, bleibt das Gewicht und du gehst auf 3 × 8, später auf 6, 4 und 3. ';
const GUEST_PLANS=[
 {name:'Grundlagenplan · Einheit 1', note:GP+'Die Pflichtübungen steigerst du Woche für Woche, die Zusatzübungen haben eine feste Vorgabe. Kadenz 2/0/X heißt: 2 Sekunden ablassen, unten nicht warten, so schnell wie möglich hoch.', items:[
  ['Bankziehen (Langhantel)',3,10,null,120,GPP+'Kadenz 2/0/X. Füße nicht einklemmen! Die Stange mindestens bis 10 cm unter die Bank ablassen.','Pflicht'],
  ['Bench Press',3,10,null,120,GPP+'Bankdrücken mit der Langhantel, Zielbereich später 80–85 %. Kadenz 2/0/X. Voller Bewegungsumfang, leichte Dehnung in der untersten Position.','Pflicht'],
  ['Dumbbell Row',3,10,null,30,GPP+'Rudern einarmig. Kadenz 2/0/X. Die 30 s Pause gelten zwischen den Sätzen und beim Seitenwechsel.','Pflicht'],
  ['Box Squat',3,8,null,120,'Box-Kniebeuge, Anstrengung 7. Kadenz 3/0/2 bis 2/0/X. Die Box so stellen, dass du sie in der gewünschten Tiefe nur kurz berührst.','Zusatz'],
  ['Hanging Leg Raise',3,4,null,90,'Beinheben hängend, leicht. Anstrengung 8. Kadenz 3/0/1: 3 s ablassen, 1 s heben.','Zusatz','r']]},
 {name:'Grundlagenplan · Einheit 2', note:GP+'Die zweite Einheit der Woche: Ziehen von oben, Kurzhanteln und am Ende etwas für die Schulter.', items:[
  ['Pull-Up',3,10,null,120,GPP+'Klimmzug oder Latzug, voller Bewegungsumfang. Sind Klimmzüge noch nicht möglich, ist der Latzug die bessere Wahl als Klimmzüge mit Gummiband.','Pflicht','r'],
  ['Dumbbell Chest Press',3,10,null,120,GPP+'Bankdrücken mit Kurzhanteln, Anstrengung 8. Kadenz 2/0/2. Voller Bewegungsumfang, leichte Dehnung unten.','Pflicht'],
  ['Triceps Pushdown',3,5,null,30,'Trizepsstrecken mit Band, Anstrengung 9. Kadenz 2/0/2. Pause zwischen den Sätzen und beim Seitenwechsel.','Zusatz'],
  ['Forward Lunge',3,8,null,120,'Ausfallschritte, 8 Wdh. pro Seite, Anstrengung 8. Kadenz 2/0/2.','Zusatz'],
  ['Face Pull',3,8,null,60,'Facepulls mit Außenrotation, Anstrengung 9. Der Ausgleich für die Schulter, bitte nicht weglassen.','Pflicht · Ausgleich']]},
 {name:'Grundlagenplan · Einheit 3', note:GP+'Nur wenn du dreimal pro Woche in den Kraftraum gehst. Das Bankziehen bleibt hier bewusst leicht.', items:[
  ['Bankziehen (Langhantel)',3,10,null,120,GPP+'Hier leicht, Zielbereich später 80–85 %. Füße nicht einklemmen, Stange weit ablassen.','Pflicht'],
  ['Bench Press',3,10,null,120,GPP+'Bankdrücken mit der Langhantel. Kadenz 2/0/X, voller Bewegungsumfang.','Pflicht'],
  ['Pull-Over (lying on bench)',3,10,null,120,GPP+'Überzüge: Arme fast gestreckt, weit hinter den Kopf, Rippen unten lassen.','Pflicht'],
  ['Back Squat',3,8,null,120,'Kniebeuge, Anstrengung 8.','Zusatz'],
  ['Hanging Leg Raise',3,8,null,90,'Beinheben hängend, Anstrengung 9.','Zusatz','r']]},
 {name:'Einsteiger · Ganzkörper A', note:'Für alle, die noch nie im Kraftraum waren. Die ersten 8 bis 12 Wochen im Wechsel mit Ganzkörper B, zwei- bis dreimal pro Woche und nie an zwei Tagen hintereinander. Lern zuerst die Bewegung. Wenn alle Sätze sauber laufen, nimmst du beim nächsten Mal etwas mehr Gewicht. '+H, items:[
  ['Goblet Squat',3,10,null,90,'Kurzhantel vor der Brust, Knie folgen den Fußspitzen, Rücken gerade','Beine'],
  ['Romanian Deadlift',3,10,null,90,'Hüfte nach hinten schieben, Rücken gerade, Stange nah am Bein','Beine'],
  ['Dumbbell Chest Press',3,10,null,90,'Schulterblätter zusammen, Hanteln kontrolliert senken','Drücken'],
  ['Seated Cable Row',3,10,null,90,'Erst Schulterblätter zurück, dann Ellbogen eng zum Körper ziehen','Ziehen'],
  ['Dumbbell Shoulder Press',2,10,null,90,'Rumpf fest, nicht ins Hohlkreuz ausweichen','Drücken'],
  ['Face Pull',3,15,null,60,'Ausgleich für die Schulter: leicht, sauber, am Ende nach außen rotieren','Ausgleich'],
  ['Plank',3,40,null,45,'Kopf bis Ferse eine Linie, Bauch und Gesäß fest','Rumpf','t']]},
 {name:'Einsteiger · Ganzkörper B', note:'Das Gegenstück zu Ganzkörper A, mit denselben Regeln: sauber bewegen, zwei Wiederholungen übrig lassen, in kleinen Schritten steigern.', items:[
  ['Trap Bar Deadlift',3,8,null,120,'Brust raus, Rücken gerade, aus den Beinen drücken. Ohne Trap Bar: Romanian Deadlift','Beine'],
  ['Bulgarian Split Squat',3,8,null,90,'8 Wdh. je Bein, hinteren Fuß auf die Bank, Oberkörper aufrecht','Beine'],
  ['Push-Up',3,10,null,90,'Körper wie ein Brett. Zu schwer: Hände erhöht. Zu leicht: Füße erhöht','Drücken'],
  ['Lat Pulldown',3,10,null,90,'Zur oberen Brust ziehen, Schultern weg von den Ohren','Ziehen'],
  ['Dumbbell Row',3,10,null,60,'10 Wdh. je Seite, Rücken gerade, Ellbogen nah am Körper','Ziehen'],
  ['External Rotator (rotator cuff)',3,15,null,45,'Ausgleich: Ellbogen am Körper, sehr leichtes Gewicht oder Band','Ausgleich'],
  ['Dead Bug',3,10,null,45,'Lendenwirbelsäule bleibt am Boden, langsam bewegen','Rumpf','r'],
  ['Side Plank',3,30,null,30,'30 s je Seite, Hüfte hoch','Rumpf','t']]},
 {name:'Muskelaufbau · Oberkörper', note:'Wenn Bankdrücken, Rudern und Klimmzug sicher sitzen. Es wird genauso viel gezogen wie gedrückt, zum Schluss kommt die Schulter dran. Zusammen mit dem Unterkörper-Plan trainierst du jede Muskelgruppe zweimal pro Woche. '+H, items:[
  ['Bench Press',4,8,null,120,'Bei schweren Sätzen mit Sicherung oder in der Ablage','Drücken'],
  ['Barbell Row (Bent-Over Row)',4,8,null,120,'Rücken gerade, Stange zum Bauchnabel','Ziehen'],
  ['Dumbbell Shoulder Press',3,10,null,90,'','Drücken'],
  ['Lat Pulldown',3,10,null,90,'Oder Klimmzüge, wenn 8 saubere gehen','Ziehen'],
  ['Triceps Pushdown',2,12,null,60,'','Arme'],
  ['Hammer Curl',2,12,null,60,'','Arme'],
  ['Face Pull',3,15,null,60,'Ausgleich: hintere Schulter und Außenrotatoren','Ausgleich'],
  ['External Rotator (rotator cuff)',2,15,null,45,'Leicht und kontrolliert','Ausgleich']]},
 {name:'Muskelaufbau · Unterkörper und Rumpf', note:'Der zweite Tag zum Oberkörper-Plan. Im Boot kommt die Kraft für Schlag und Wurf aus Beinen und Rumpf, auch wenn man es von außen nicht sieht.', items:[
  ['Back Squat',4,8,null,120,'Tiefe nur so weit, wie der Rücken gerade bleibt','Beine'],
  ['Romanian Deadlift',3,10,null,120,'','Beine'],
  ['Reverse Lunge',3,10,null,90,'10 Wdh. je Bein','Beine'],
  ['Hip Thrust',3,10,null,90,'Oben kurz halten, Gesäß anspannen','Beine'],
  ['Calf Raise',3,12,null,60,'','Beine'],
  ['Pallof Press',3,10,null,45,'10 Wdh. je Seite: Rumpf hält gegen die Drehung, wie im Zweikampf','Rumpf'],
  ['Knee Raise',3,10,null,60,'Im Hang, ohne Schwung','Rumpf','r'],
  ['Back Extension (on bench)',3,12,null,60,'Unterer Rücken, langsam und ohne Überstrecken','Rumpf','r']]},
 {name:'Ausgleich · Schulter und Rumpf (20 min)', note:'20 Minuten für die Schultern, zwei- bis dreimal pro Woche. Geht nach dem Wassertraining oder zu Hause mit einem Band. Paddeln und Werfen machen die Muskeln stark, die ziehen und den Arm nach innen drehen. Hier sind die Gegenspieler dran. Wenig Gewicht, langsam bewegen.', items:[
  ['External Rotator (rotator cuff)',3,15,null,30,'Je Seite, Ellbogen am Körper','Schulter'],
  ['Internal Rotator (rotator cuff)',2,15,null,30,'Je Seite, nur leicht','Schulter'],
  ['Face Pull',3,15,null,45,'','Schulter'],
  ['Rear Delt Fly',3,12,null,45,'Leichte Hanteln, Schultern tief','Schulter'],
  ['Bird Dog',3,8,null,30,'8 Wdh. je Seite, Becken bleibt ruhig','Rumpf','r'],
  ['Side Plank',3,30,null,30,'30 s je Seite','Rumpf','t'],
  ['Dead Bug',3,10,null,30,'','Rumpf','r']]},
 {name:'Core-Zirkel · kurz, ohne Geräte (12 min)', note:'Vier Bauchübungen direkt nacheinander, je 20 Sekunden. Das ist eine Runde. Davon vier, mit 90 Sekunden Pause dazwischen. Du brauchst nur eine Matte. Beweg dich zügig, aber sauber. Mit „Ganzen Zirkel mit Timer starten“ zählt die App für dich.', items:
  [['Leg Raise (straight)','Beine gestreckt heben und langsam senken, der untere Rücken bleibt am Boden'],['Cross Leg Raise (alternating)','Beine im Wechsel, klein und schnell'],['Crunch','Schultern anheben, Kinn weg von der Brust'],['Bicycle Crunch','Ellbogen zum gegenüberliegenden Knie']].map(([n,c],i,a)=>[n,4,20,null,i===a.length-1?90:0,c,'','t'])},
 {name:'Core-Zirkel · lang, ohne Geräte (25 min)', note:'Sechs Übungen für Bauch, Seite und Rücken. 40 Sekunden arbeiten, 15 Sekunden wechseln, drei Runden mit 2 Minuten Pause. Geht überall, auch am Steg nach dem Wassertraining.', items:
  [['Leg Raise (straight)','Langsam senken, Rücken bleibt am Boden'],['Plank','Kopf bis Ferse eine Linie'],['Bicycle Crunch','Ruhig atmen, nicht am Kopf ziehen'],['Side Plank','Jede Runde die Seite wechseln, Hüfte hoch'],['Superman (arms and legs extended)','Arme und Beine knapp über dem Boden halten'],['Mountain Climber','Hüfte tief, Knie im Wechsel zur Brust']].map(([n,c],i,a)=>[n,3,40,null,i===a.length-1?120:15,c,'','t'])},
 {name:'Ganzkörper · ohne Geräte', note:'Für zu Hause oder wenn der Kraftraum zu ist. Alles mit dem eigenen Körpergewicht. Was fehlt, ist das Ziehen: Wenn du eine Klimmzugstange oder ein Band hast, häng drei Sätze dran.', items:[
  ['Push-Up',3,10,null,60,'So viele saubere wie möglich, zwei übrig lassen. Zu schwer: Hände erhöht','Kraft','r'],
  ['Reverse Lunge',3,10,null,60,'10 pro Bein, ohne Gewicht, Oberkörper aufrecht','Kraft','r'],
  ['Glute Bridge',3,15,null,45,'Oben kurz halten und das Gesäß anspannen','Kraft','r'],
  ['Squat Jump',3,6,null,60,'Explosiv hoch, leise landen','Kraft','r'],
  ['Superman (arms and legs extended)',3,30,null,30,'Für den unteren Rücken','Rumpf','t'],
  ['Dead Bug',3,10,null,30,'Langsam, der Rücken bleibt am Boden','Rumpf','r'],
  ['Side Plank',2,30,null,30,'30 s je Seite','Rumpf','t']]},
 {name:'TRX · Grundlagen-Zirkel', note:'Sechs Übungen im Kreis: 40 Sekunden arbeiten, 20 Sekunden wechseln, drei Runden mit je 2 Minuten Pause. Je schräger du stehst, desto schwerer wird es. Tipp auf „Ganzen Zirkel mit Timer starten“, dann sagt dir die App, was dran ist.', items:
  [['TRX Squat','Band mittel'],['TRX Row','Band mittel'],['TRX Chest Press','Band lang'],['TRX Hamstring Curl','Band lang, Fersen in den Schlaufen'],['TRX Plank','Band lang, Füße in den Schlaufen'],['TRX Y Raise','Band mittel, wenig Schräglage']].map(([n,c],i,a)=>[n,3,40,null,i===a.length-1?120:20,c,'','t'])},
 {name:'Explosiv · Wurfkraft mit Medizinball', note:'Hier geht es um Tempo. Wenige Würfe, jeder so schnell wie möglich, dazwischen lange Pausen. Mach das nur ausgeruht, am besten direkt nach dem Aufwärmen, mit einem Ball von 2 bis 4 kg. Sobald die Würfe langsamer werden, ist der Satz vorbei.', items:[
  ['Box Jump',4,5,null,90,'Leise landen, herunter steigen statt springen','Sprung','r'],
  ['MB Chest Pass',4,6,null,90,'Explosiv gegen die Wand oder zum Partner','Wurf','r'],
  ['MB Rotational Throw',4,6,null,90,'6 Würfe je Seite, die Kraft kommt aus Hüfte und Rumpf','Wurf','r'],
  ['MB Slam',4,6,null,90,'Ganzkörper-Streckung, dann mit voller Kraft auf den Boden','Wurf','r']]}];
const WISSEN=[
 {t:'So startest du',s:'In ein paar Minuten zur ersten Trainingswoche',b:[
  ['p','Du brauchst kein Konto. Was du einträgst, liegt nur auf deinem Handy, und außer dir sieht es niemand.'],
  ['ol',['Such dir auf der Startseite einen Grundlagenplan aus und tipp auf „Jetzt trainieren“.','Hak im Training jeden Satz ab und trag Gewicht und Wiederholungen ein. Die Pause läuft dann von allein.','Wenn du magst, lässt du dir im Kraftrechner einen Plan für mehrere Wochen in den Kalender legen. Einzelne Tage verschiebst du mit einem Tipp aufs Datum.','Trag nach dem Training ein, wie anstrengend es war. In der Statistik siehst du später, wie es sich entwickelt.']],
  ['p','Ein Hinweis noch: Wenn du die Browserdaten löschst, sind deine Einträge weg. Unter Einstellungen kannst du ein Backup speichern.']]},
 {t:'Wie viel sollte ich trainieren?',s:'Vom Einstieg bis zum Kader-Umfang',b:[
  ['p','Kurze Antwort für den Einstieg: zweimal Kraft und zwei- bis dreimal aufs Wasser. Das sind vier bis sechs Stunden pro Woche, und damit kommst du in den ersten Monaten richtig weit.'],
  ['ul',['Erste 3 Monate: 2 Krafteinheiten (je 60 bis 80 min) plus dein normales Wassertraining.','Danach: eine dritte Krafteinheit oder die 20 Minuten Ausgleich für die Schulter dazunehmen.','Steigere in kleinen Schritten. Etwa 10 % mehr pro Woche sind eine gute Obergrenze.','Mindestens ein Tag pro Woche bleibt komplett frei.']],
  ['p','Zum Vergleich, wohin die Reise gehen kann: So sieht der Wochenumfang im U21-Kader über das Jahr aus, in Minuten pro Woche.'],
  ['table',[['Zeitraum','Gesamt','Athletik','Im Boot'],['Okt – Nov','320','215','105'],['Nov – Dez','480','265','215'],['Dez – Feb','535','320','215'],['Feb – Mrz','535','220','315'],['Mrz – Apr','555','215','340'],['Apr – Mai','640','185','455'],['Mai – Jun','655','130','525'],['Jun – Aug','670','105','565'],['Aug – Sep','510','50','460']]],
  ['p','Man sieht den roten Faden: Im Winter ist viel Athletik dabei, über die Hälfte der Zeit. Zum Sommer hin wandert fast alles ins Boot, und kurz vor dem Saisonhöhepunkt wird es insgesamt weniger, damit du frisch bist.'],
  ['p','Das sind Kaderwerte. Als Einsteiger musst du da nicht hin, schon gar nicht sofort. Nimm sie als Richtung.']]},
 {t:'Was im Jahr wann zählt',s:'Die Phasen einer Kanupolo-Saison',b:[
  ['p','Alles gleichzeitig verbessern klappt nicht. Deshalb hat jede Phase im Kraftraum ihren Schwerpunkt.'],
  ['ul',['Oktober bis Februar: Aufbau. Muskelaufbau und allgemeine Athletik stehen vorn. Das ist die Zeit für den Grundlagenplan.','Ab Dezember, deutlich ab Februar: Maximalkraft kommt dazu. Schwerere Gewichte, weniger Wiederholungen, dafür weniger Muskelaufbau.','Ab März und April: Schnellkraft. Explosive Übungen, während die Zeit im Boot stark zunimmt.','Mai bis August: Die Athletik wird Schritt für Schritt weniger. Ein bis zwei kurze Einheiten halten, was du aufgebaut hast.','Kurz vor dem Saisonhöhepunkt: nur noch wenig allgemeine Athletik. Jetzt zählen Spiel und Frische.']],
  ['p','Zwischen 18 und 22 lohnt sich der Aufbau besonders. Der Körper reagiert in dem Alter stark auf Krafttraining, und eine saubere Technik hast du dann für immer.']]},
 {t:'Die Kadernormen',s:'Wo du mit deinen Kraftwerten stehst',b:[
  ['p','Für vier Kraftwerte gibt es Normen: Bankdrücken, Bankziehen, Klimmzüge und Toes to Bar. Zu jedem Wert gehören zwei Marken, die Mindestnorm und die Zielvorgabe.'],
  ['table',[['','Herren','Herren U21','Damen','Damen U21'],['Bankdrücken (kg pro kg)','1,05 / 1,41','0,93 / 1,28','0,67 / 0,95','0,58 / 0,81'],['Bankziehen (kg pro kg)','1,03 / 1,25','0,93 / 1,20','0,81 / 1,01','0,69 / 0,88'],['Klimmzüge','12 / 22','9 / 18','2 / 12','1 / 6'],['Toes to Bar','4 / 15','1 / 11','2 / 11','1 / 3']]],
  ['p','Die erste Zahl ist die Mindestnorm, die zweite die Zielvorgabe. Bei Bankdrücken und Bankziehen zählt das Gewicht im Verhältnis zu deinem Körpergewicht. Wer 75 kg wiegt und als U21-Spieler 0,93 schaffen will, braucht also rund 70 kg.'],
  ['ul',['Für eine Kadernominierung müssen mindestens 3 der 4 Mindestnormen stehen.','Einen Anspruch auf eine Nominierung gibt das nicht.','Die Normen werden schrittweise eingeführt: bis November 2027 als Orientierung, danach verbindlich.']],
  ['p','Im Norm-Check trägst du deine Werte ein und siehst sofort, wo du stehst und wie viel bis zur nächsten Marke fehlt.']]},
 {t:'Muskelaufbau: worauf es ankommt',s:'Fünf Dinge, die den Unterschied machen',b:[
  ['ol',['Es muss schwer werden. Die letzten Wiederholungen eines Satzes kosten Überwindung. Hör auf, wenn noch ein bis drei gegangen wären.','Genug Sätze. Für den Muskelaufbau gelten 20 bis 25 Sätze pro Muskel und Woche als sehr guter Wert. Wer gerade anfängt, startet mit deutlich weniger und legt über Wochen nach.','Regelmäßig. Zweimal pro Woche denselben Muskel zu trainieren bringt mehr als einmal sehr viel.','Steigern. Laufen alle Sätze sauber mit der oberen Wiederholungszahl, kommt das nächste Mal die kleinste Scheibe mehr drauf.','Erholen. Der Muskel wächst in der Pause. Dazu gehören acht Stunden Schlaf und genug Eiweiß, etwa 1,6 bis 2,2 g pro Kilo Körpergewicht am Tag.']],
  ['p','In den ersten Wochen wirst du schnell stärker, ohne dass man viel sieht. Das liegt daran, dass Nerven und Muskeln besser zusammenarbeiten. Sichtbare Muskeln brauchen ein paar Wochen länger.']]},
 {t:'Muskelaufbau, Kraftaufbau, Schnellkraft',s:'Die drei Ziele im Überblick',b:[
  ['p','Drei Ziele, drei verschiedene Rezepte. Nimm die Zahlen als grobe Orientierung.'],
  ['table',[['','Muskelaufbau','Kraftaufbau','Schnellkraft'],['Wiederholungen','5–25','unter 6–8','unter 6–8'],['Last (% vom Maximum)','(30) 50–85 %','über 85 %','30–85 %'],['Anstrengung (1–10)','8–10','8–10','4–7'],['Sätze pro Muskel und Woche','20–25','10–15','10–25'],['Pause (min)','1–3','über 3','über 3'],['Einheiten pro Woche','3–5','3–5','3–6'],['Übungen','Ganzkörper + Isolation','Ganzkörper','Ganzkörper'],['Kadenz','2/0/X bis 3/0/2','2/0/X','2/0/X']]],
  ['p','Die Kadenz liest du so: Sekunden beim Ablassen, Pause unten, Sekunden beim Hochgehen. 2/0/X heißt 2 Sekunden ablassen, nicht warten, so schnell wie möglich hoch. Bei 3/0/2 lässt du 3 Sekunden ab und gehst in 2 Sekunden hoch.'],
  ['p','Um Muskeln und Kraft nur zu halten, genügen schon wenige Sätze pro Woche. Das ist die gute Nachricht für die Saison.']]},
 {t:'Wie viele Wiederholungen und Sätze?',s:'Warum der Muskel müde werden muss',b:[
  ['p','Ein Muskel wächst, wenn möglichst oft alle seine Fasern gefordert werden. Die großen, schnellen Fasern schaltet der Körper erst dazu, wenn es richtig schwer wird.'],
  ['ul',['Sehr schwer mit weniger als 5 Wiederholungen ist für den Muskelaufbau nicht ideal.','Mittleres Gewicht mit mittlerer Wiederholungszahl funktioniert. Leichtes Gewicht mit vielen Wiederholungen auch, solange der Muskel am Ende müde ist.','Ob Verbund- oder Isolationsübung, ist dafür zweitrangig.','Mehr Sätze heißen: öfter ausbelastet, größerer Reiz.']],
  ['p','So zählst du: 3 Sätze Klimmzüge, 4 Sätze Bankziehen und 3 Sätze einarmiges Rudern sind zusammen 10 Sätze für Latissimus und Bizeps.'],
  ['p','Die alte Faustregel „1 bis 5 für Kraft, 6 bis 12 für Muskeln, ab 15 Ausdauer“ ist zu streng. Muskeln wachsen in einem breiten Bereich, etwa von 5 bis über 20 Wiederholungen.']]},
 {t:'Was gehört in den Kraftraum, was aufs Wasser?',s:'Maximalkraft, Schnellkraft, Kraftausdauer',b:[
  ['ul',['Maximalkraft und Schnellkraft brauchen wenige, schwere Wiederholungen (1 bis 5). Das geht fast nur im Kraftraum, denn im Boot ist die Belastung dafür meist zu niedrig.','Kraftausdauer heißt 15 Wiederholungen und mehr. Die holst du dir am besten auf dem Wasser, weil es dort genau die Bewegung ist, die du brauchst.']],
  ['p','Im Kraftraum bleiben damit drei Aufgaben: die Grundlage legen (Muskelaufbau), die Leistung steigern (Maximal- und Schnellkraft) und ausgleichen (Rotatoren, unterer Rücken, Beine).']]},
 {t:'Verbund- oder Isolationsübung?',s:'Welche Übung wofür',b:[
  ['p','Welche Übung passt, hängt vom Ziel ab und davon, was du mitbringst: Zeit, Erfahrung, Geräte.'],
  ['ul',['Verbundübungen wie Bankziehen, Kniebeuge oder Klimmzug trainieren viele Muskeln auf einmal. Sie sind näher an den Bewegungen im Sport und die bessere Wahl für Maximal- und Schnellkraft.','Isolationsübungen wie Trizepsstrecken oder Außenrotation treffen einen einzelnen Muskel sehr gezielt und belasten den Kreislauf weniger. Deshalb gehen sie gut als Supersatz oder mit kurzen Pausen.']]]},
 {t:'Voller Bewegungsumfang',s:'Kraft entsteht dort, wo du sie trainierst',b:[
  ['p','Kraft ist spezifisch. Sie hängt am Gelenkwinkel, an der Geschwindigkeit und an der Übung.'],
  ['ul',['Im Kanurennsport können Teilbewegungen sinnvoll sein.','Ein Torwurf im Kanupolo geht dagegen meist über den ganzen Bewegungsweg.','Also trainierst du auch über den ganzen Weg.']],
  ['p','Im Kraftraum heißt das: beim Bankziehen die Stange weit ablassen, beim Bankdrücken die leichte Dehnung unten mitnehmen, Klimmzüge aus dem gestreckten Arm beginnen.']]},
 {t:'Periodisierung und Erholung',s:'Warum auch leichte Einheiten zählen',b:[
  ['p','Ein Training macht dich erst einmal müde. In der Erholung baut der Körper wieder auf und legt ein kleines Stück obendrauf. Das nennt man Superkompensation. Kommt der nächste Reiz im richtigen Moment, wirst du Schritt für Schritt besser. Kommt er zu früh und zu hart, geht es bergab. Und wenn lange nichts kommt, landest du wieder am Anfang.'],
  ['p','Wer sein Training in Stufen plant, kann eine Bewegung häufiger üben, ohne sich zu überlasten. Leichte Einheiten gehören deshalb dazu.'],
  ['p','So läuft die Steigerung im Grundlagenplan, hier am Bankziehen mit 50 kg Maximum:'],
  ['table',[['Woche','Gewicht','Wiederholungen','Anstrengung'],['1 (60 %)','30 kg','10, 10, 10','8'],['2','32,5 kg','10, 10, 10','9'],['3','35 kg','10, 10, 9','10'],['4','35 kg','10, 9, 9','10'],['5','35 kg','8, 8, 8','8'],['6','37,5 kg','8, 8, 8','9']]],
  ['p','In Woche 3 und 4 hat es zweimal nicht für 3 × 10 gereicht. Dann bleibt das Gewicht, und es geht mit 3 × 8 weiter. Die Stufen sind 10, 8, 6, 4 und 3 Wiederholungen.']]},
 {t:'Konzentrisch, exzentrisch, isometrisch',s:'Wie ein Muskel arbeitet und was das jeweils bringt',b:[
  ['ul',['Konzentrisch: Der Muskel wird kürzer und bewegt das Gewicht. Das ist das Hochdrücken beim Bankdrücken oder das Hochziehen beim Klimmzug.','Exzentrisch: Der Muskel wird unter Spannung länger und bremst das Gewicht, etwa wenn du die Hantel ablässt oder dich beim Klimmzug langsam herunterlässt.','Isometrisch: Der Muskel hält, ohne dass sich etwas bewegt. Plank, oder das Hängen an der Stange.']],
  ['p','Und was hast du davon?'],
  ['ul',['Konzentrisch und schnell: Das schult die Ansteuerung und die Schnellkraft. Dafür steht das X in 2/0/X. Diese Phase kommt Wurf und Paddelschlag am nächsten.','Exzentrisch: Beim Bremsen bist du stärker als beim Heben, du kannst also mehr Gewicht kontrollieren. Das ist ein starker Reiz für Kraft und Muskeln und tut auch Sehnen gut. Der Preis: mehr Muskelkater und eine längere Erholung.','Isometrisch: Du wirst stabil in genau der Position, die du hältst. Im Zweikampf brauchen das vor allem Rumpf und Schulter.']],
  ['p','Am Anfang genügt es, jede Wiederholung zwei bis drei Sekunden kontrolliert abzulassen und zügig hochzugehen. Betontes exzentrisches Training mit mehr Gewicht, als du heben kannst, ist etwas für Fortgeschrittene. Das gehört nur mit Sicherung und Anleitung ins Programm.']]},
 {t:'Warum Ausgleichsübungen?',s:'Gesunde Schultern beim Paddeln und Werfen',b:[
  ['p','Paddeln und Werfen fordern immer dieselben Muskeln: den Latissimus, die Brust und alles, was den Arm nach innen dreht. Die werden stark und mit der Zeit oft auch kurz. Ihre Gegenspieler bekommen im Sport kaum etwas ab. Das sind die Außenrotatoren der Schulter, die hintere Schulter und die Muskeln zwischen den Schulterblättern.'],
  ['p','Wird der Unterschied zu groß, sitzt der Oberarmkopf schlechter im Gelenk. Viele Schulterprobleme in Wurf- und Paddelsportarten fangen so an.'],
  ['ul',['Pack in jede Krafteinheit ein bis zwei Ausgleichsübungen, zum Beispiel Facepulls und Außenrotation.','Wenig Gewicht, 12 bis 20 saubere Wiederholungen. Es geht um Kontrolle.','Zieh im Kraftraum ungefähr so viel, wie du drückst.','Trainier den Rumpf in alle Richtungen, auch gegen die Drehung: Pallof Press, Side Plank.']],
  ['p','Der Plan „Ausgleich · Schulter und Rumpf“ packt das in 20 Minuten.']]},
 {t:'Technik, Aufwärmen, Sicherheit',s:'Damit Training stärker macht und nicht verletzt',b:[
  ['ul',['Wärm dich 5 bis 10 Minuten auf und mach vor der ersten Übung ein bis zwei leichte Sätze.','Lern eine neue Übung mit wenig Gewicht. Am besten zeigt sie dir jemand, der sie kann.','Schwere Sätze beim Bankdrücken und bei der Kniebeuge nur mit Sicherung oder in der Ablage.','Anstrengend darf es sein. Bei einem stechenden oder plötzlichen Schmerz brichst du den Satz ab.','Die App ersetzt weder Trainer noch Arzt. Bei Beschwerden oder nach einer Verletzung lass das vorher abklären.']]]},
 {t:'Belastung und Erholung steuern',s:'Anstrengung von 1 bis 10, Pausentage, leichte Wochen',b:[
  ['p','Trag nach jeder Einheit ein, wie hart sie war. 1 ist sehr leicht, bei 10 ging nichts mehr. Die meisten Krafteinheiten sollten bei 7 bis 8 landen.'],
  ['ul',['Nach einer harten Einheit braucht derselbe Muskel etwa zwei Tage.','Polo-Training und Spiele gehen vor. Vor einem Turnier machst du weniger Kraft, aber nicht gar keine.','Alle vier bis sechs Wochen eine leichte Woche: dieselben Übungen, ungefähr halb so viele Sätze.','Schlechter Schlaf, ständig müde, schwächer als sonst, keine Lust? Dann war es zu viel. Nimm zwei, drei Tage raus.']],
  ['p','In der Statistik siehst du Minuten und Belastung pro Woche. Leg lieber jede Woche ein bisschen drauf als einmal einen großen Sprung.']]},
 {t:'Tipps für die wichtigsten Übungen',s:'Worauf du bei der Ausführung achtest',b:[
  ['ul',['Bankziehen: Brust bleibt auf der Bank, Füße hängen frei und werden nicht eingeklemmt. Zieh die Stange zum unteren Brustkorb und lass sie ganz ab.','Bankdrücken: Schulterblätter nach hinten unten, Füße fest am Boden. Die Stange kommt kontrolliert zur Brust und geht zügig hoch. Bei schweren Sätzen steht jemand hinter dir.','Klimmzug: Fang mit gestreckten Armen an und zieh das Kinn über die Stange, ohne zu schwingen. Wenn noch keiner geht, nimm den Latzug.','Rudern einarmig: Rücken gerade, der Ellbogen geht eng am Körper nach hinten. Der Oberkörper dreht nicht mit.','Kniebeuge: Füße etwa schulterbreit, Knie zeigen in Richtung der Fußspitzen. Geh so tief, wie der Rücken gerade bleibt.','Toes to Bar und Beinheben: aus dem ruhigen Hang, ohne Schwung zu holen. Lass die Beine langsam wieder ab.','Facepulls: wenig Gewicht, Ellbogen hoch, am Ende die Hände nach hinten drehen.']],
  ['p','Für alle Übungen gilt: zwei Sekunden ablassen, zügig hoch, und der letzte Satz sieht genauso sauber aus wie der erste. Wenn nicht, war es zu schwer.']]},
 {t:'Woher die Zahlen kommen',s:'Ein paar Studien zum Nachlesen',b:[
  ['p','Die Richtwerte hier sind nicht ausgedacht. Wer es genauer wissen will, findet die wichtigsten Punkte in diesen Arbeiten:'],
  ['ul',['Mehr Sätze pro Woche bringen mehr Muskelwachstum: Schoenfeld, Ogborn und Krieger, Journal of Sports Sciences 2017.','Muskeln wachsen mit leichten wie mit schweren Gewichten, solange der Satz hart ist. Für die Maximalkraft sind schwere Gewichte besser: Schoenfeld, Grgic, Ogborn und Krieger, Journal of Strength and Conditioning Research 2017.','Über etwa 1,6 g Eiweiß pro Kilo Körpergewicht am Tag bringt mehr Eiweiß kaum noch zusätzlichen Muskelaufbau: Morton und Kollegen, British Journal of Sports Medicine 2018.','Krafttraining senkt das Verletzungsrisiko im Sport, und zwar umso mehr, je konsequenter man es macht: Lauersen, Andersen und Andersen, British Journal of Sports Medicine 2018.']],
  ['p','Studien zeigen Durchschnittswerte. Wie dein Körper reagiert, merkst du im Training. Deshalb lohnt es sich, alles einzutragen.']]},
 {t:'Beispielwoche für den Einstieg',s:'Wie Kraft, Wasser und Pause zusammenpassen',b:[
  ['ul',['Montag: Grundlagenplan Einheit 1 oder Ganzkörper A','Dienstag: Wassertraining','Mittwoch: Ausgleich für Schulter und Rumpf (20 min) oder frei','Donnerstag: Grundlagenplan Einheit 2 oder Ganzkörper B','Freitag: Wassertraining','Samstag: 30 bis 45 Minuten locker laufen oder Rad fahren, oder Spiel','Sonntag: frei']],
  ['p','Zwei Krafteinheiten pro Woche reichen für den Anfang völlig. Wenn das nach zwei, drei Monaten gut läuft, kommt eine dritte dazu.']]}];
// Kadernormen: [Mindestnorm, Zielvorgabe] je Gruppe. Bankdrücken/Bankziehen in kg pro kg Körpergewicht, sonst Wiederholungen
const NORM_GROUPS=[['h','Herren'],['hu','Herren U21'],['d','Damen'],['du','Damen U21']];
const NORMS=[
 {k:'bench',t:'Bankdrücken',rel:true,ex:'Bench Press',v:{h:[1.05,1.41],hu:[0.93,1.28],d:[0.67,0.95],du:[0.58,0.81]}},
 {k:'pull',t:'Bankziehen',rel:true,ex:'Bankziehen (Langhantel)',v:{h:[1.03,1.25],hu:[0.93,1.20],d:[0.81,1.01],du:[0.69,0.88]}},
 {k:'pu',t:'Klimmzüge',rel:false,v:{h:[12,22],hu:[9,18],d:[2,12],du:[1,6]}},
 {k:'t2b',t:'Toes to Bar',rel:false,v:{h:[4,15],hu:[1,11],d:[2,11],du:[1,3]}}];
const normGet=()=>{ const n=S.settings.norm=S.settings.norm||{}; n.group=n.group||'hu'; return n; };
/* ---- Live-Check für Pläne und Wochen ---- */
const GRP=[['push','Drücken'],['pull','Ziehen'],['legs','Beine'],['core','Rumpf'],['bal','Ausgleich Schulter']];
function exGroup(name,cat){
  if(/Face Pull|Rear Delt|Rotator|Rotation|Y Raise|Shoulder Depression/.test(name)) return 'bal';
  if(/^TRX (Row|Biceps|T Fly)|Bankziehen/.test(name)) return 'pull';
  if(/^TRX (Push|Chest|Triceps|Atomic)/.test(name)) return 'push';
  return {Push:'push',Pull:'pull','Klimmzüge':'pull',Schulter:'push',Beine:'legs','TRX Unterkörper':'legs',Core:'core','TRX Core':'core','Swiss Ball':'core','Unterer Rücken':'core','TRX Oberkörper':'pull',Medizinball:'power',Plyometrie:'power'}[cat]||'other';
}
// list: [{name,exId,n (Sätze),rest,mode,time}]
function checkSets(list){
  const g={push:0,pull:0,legs:0,core:0,bal:0,power:0,other:0}; let sec=0, total=0;
  for(const it of list){ const ex=exById(it.exId), k=exGroup(it.name,ex?ex.cat:''); g[k]+=it.n; total+=it.n; sec+=it.n*((it.mode==='t'?(it.time||30):40)+(it.rest!=null?it.rest:60)); }
  return {g,total,min:Math.round(sec/60)};
}
function planCheck(list){
  const c=checkSets(list), g=c.g, t=[];
  if(!c.total){ t.push([0,'Füg die ersten Übungen hinzu. Der Check zeigt dir dann, ob der Plan ausgeglichen ist.']); return {...c,tips:t}; }
  if(g.push-g.pull>=3) t.push([1,`Du drückst mehr, als du ziehst (${g.push} zu ${g.pull} Sätze). Im Paddelsport gilt: mindestens so viel ziehen wie drücken.`]);
  if(g.push+g.pull>0&&!g.bal) t.push([1,'Noch nichts für den Ausgleich. Zwei bis drei Sätze Facepulls oder Außenrotation reichen.']);
  if(!g.core) t.push([1,'Der Rumpf fehlt. Eine Übung wie Plank oder Beinheben passt immer ans Ende.']);
  if(g.push+g.pull>0&&!g.legs) t.push([0,'Keine Beinübung dabei. Als reiner Oberkörpertag ist das in Ordnung, sonst nimm eine dazu.']);
  if(c.min>90) t.push([1,`Etwa ${c.min} Minuten. Das ist lang, 60 bis 80 Minuten sind ein guter Rahmen.`]);
  if(c.total>30) t.push([1,`${c.total} Sätze in einer Einheit sind viel. Lieber auf zwei Tage verteilen.`]);
  if(!t.some(x=>x[0])) t.unshift([2,'Passt. Der Plan ist ausgeglichen und hat eine gute Länge.']);
  return {...c,tips:t};
}
function weekCheck(ws){
  const E=wfEntries(ws), K=E.filter(e=>e.type==='kraft'), W=E.filter(e=>e.type==='wasser');
  const c=checkSets(K.flatMap(e=>e.items.map(it=>({name:it.name,exId:it.exId,n:it.sets.length,mode:it.mode})))), g=c.g, t=[];
  if(K.length<2) t.push([1,`${K.length?'Nur eine Krafteinheit':'Keine Krafteinheit'} geplant. Zwei bis drei pro Woche sind ein guter Wert.`]);
  if(K.length>4) t.push([1,`${K.length} Krafteinheiten sind viel. Denk an die Erholung, vor allem neben dem Wassertraining.`]);
  for(const [k,l] of GRP.slice(0,3)){ if(K.length&&g[k]<6) t.push([0,`${l}: ${g[k]} Sätze diese Woche. Für Fortschritt dürfen es 10 und mehr sein.`]); if(g[k]>25) t.push([1,`${l}: ${g[k]} Sätze. Mehr als 25 pro Woche bringen selten mehr.`]); }
  if(g.push-g.pull>=5) t.push([1,`Über die Woche drückst du mehr, als du ziehst (${g.push} zu ${g.pull}).`]);
  if(K.length&&g.bal<4) t.push([1,'Wenig Ausgleich für die Schulter. Plane ihn in jede Krafteinheit ein oder mach einmal den 20-Minuten-Plan.']);
  const days=new Set(E.map(e=>e.date)).size; if(days>=7) t.push([1,'Kein freier Tag in dieser Woche. Einer sollte es mindestens sein.']);
  for(let i=0;i<6;i++){ const d=addDays(ws,i); if(K.some(e=>e.date===d&&!/Core|Ausgleich|TRX/.test(e.title))&&K.some(e=>e.date===addDays(d,1)&&!/Core|Ausgleich|TRX/.test(e.title))){ t.push([0,'Zwei Krafteinheiten an aufeinanderfolgenden Tagen. Das geht, wenn sie verschiedene Muskeln treffen.']); break; } }
  if(!t.some(x=>x[0])) t.unshift([2,'Die Woche sieht gut aus.']);
  return {...c,k:K.length,w:W.length,tips:t};
}
const isBeg=()=>PROFILE==='guest'&&S.settings.mode==='neu';
// Kraftrechner: Übungen, für die ein Maximalgewicht sinnvoll ist (Name in der Bibliothek, deutsche Bezeichnung)
const CALC=[['Bankziehen (Langhantel)','Bankziehen, Langhantel'],['Bench Press','Bankdrücken, Langhantel'],['Dumbbell Row','Rudern einarmig (Gewicht einer Hantel)'],['Dumbbell Chest Press','Bankdrücken, Kurzhantel (Gewicht einer Hantel)'],['Pull-Over (lying on bench)','Überzüge'],['Back Squat','Kniebeuge'],['Box Squat','Box-Kniebeuge'],['Forward Lunge','Ausfallschritte (Zusatzgewicht gesamt)']];
const est1rm=v=>v&&v.w>0?Math.round(epley(v.w,Math.min(v.r||1,12))*2)/2:null;
const nextMonday=()=>{ const t=today(), ws=weekStart(t); return t===ws?t:addDays(ws,7); };
const calcGet=()=>{ const c=S.settings.calc=S.settings.calc||{}; c.vals=c.vals||{}; c.level=c.level||'neu'; c.perWeek=c.perWeek||2; c.weeks=c.weeks||6; if(!c.start||c.start<today()) c.start=nextMonday(); return c; };
function mkPlans(defs,exercises){
  const byName = Object.fromEntries(exercises.map(e=>[e.name,e]));
  return defs.map(p=>({id:uid(),name:p.name,note:p.note,items:p.items.map(([n,sets,reps,pct,rest,note,block,mode,scheme,tm,weight])=>{
    const ex=byName[n]; if(!ex) console.warn('Seed: Übung fehlt',n);
    const m=mode||ex.mode;
    return {id:uid(),exId:ex.id,name:ex.name,mode:m,block:block||'',sets,reps:m==='t'?null:reps,time:m==='t'?reps:null,weight:weight||null,pct:pct||null,rest:rest||0,note:note||'',...(scheme?{scheme}:{}),...(tm?{tm}:{})};
  })}));
}
function guestState(){
  const exercises=seedExercises();
  return {version:1,seedV:99,gV:4,
    settings:{name:'',trainer:'',trainerPhone:'',trainerMail:'',lang:'de',theme:'light',goals:'',restDefault:90},
    exercises, plans:mkPlans(GUEST_PLANS,exercises), guides:[], entries:[], tournaments:[], weekly:{},
    timers:[{id:uid(),name:'Zirkel · 6 Übungen, 40/20, 3 Runden',rounds:3,prep:10,roundRest:120,steps:Array.from({length:6},(_,i)=>mkStep('Übung '+(i+1),40,20))},
      {id:uid(),name:'Jede Minute · 10 Runden',rounds:10,prep:10,roundRest:40,steps:[mkStep('Belastung',20,0)]},
      {id:uid(),name:'Tabata · 8 × 20/10',rounds:8,prep:10,roundRest:10,steps:[mkStep('Belastung',20,0)]}]};
}
function freshState(){
  if(PROFILE==='guest') return guestState();
  const exercises = seedExercises();
  const plans = mkPlans(SEED_PLANS,exercises);
  const st={version:1,seedV:11,
    settings:{name:'Marvin',trainer:'Maxim',trainerPhone:'',trainerMail:'',lang:'en',theme:'light',goals:SEED_GOALS,restDefault:90},
    exercises, plans, guides:[...SEED_GUIDES,...DEC_GUIDES].map(g=>({id:uid(),...g})), timers:seedTimers(), entries:[], tournaments:seedTournaments(), weekly:{}};
  seedW2Entry(st); seedPlanEntry(st,N16,N16DAY,'Kraft – Dynamic','kraft',90); seedW4(st); seedD1(st); return st;
}
function seedPlanEntry(st,planName,date,title,guideKey,planned){
  const p=st.plans.find(x=>x.name===planName); if(!p||st.entries.some(e=>e.date===date&&e.planId===p.id)) return;
  const g=st.guides.find(g=>g.from<=date&&date<=g.to);
  st.entries.push({id:uid(),type:'kraft',date,time:'',title,planned,minutes:null,plan:g?g[guideKey]:'',notes:'',tags:[],rpe:null,done:false,items:itemsFromPlan(p),planId:p.id,feedback:'',reply:'',g:{}});
}
function seedEntry(st,o){
  if(st.entries.some(e=>e.date===o.date&&e.title===o.title)) return;
  st.entries.push({id:uid(),type:'wasser',time:'',planned:null,minutes:null,plan:'',notes:'',tags:[],rpe:null,done:false,items:[],feedback:'',reply:'',g:{},...o});
}
function seedD1(st){
  const g=st.guides.find(x=>x.from==='2026-11-30')||{}, w=(g.wasser||'').split('\n');
  seedPlanEntry(st,D1K,'2026-11-30','Kraft 1/3 · Exzentrisch 95/85/55','kraft',120);
  seedEntry(st,{type:'sonstiges',date:'2026-12-01',title:'Laufen / Rad locker',planned:50,plan:g.sonstiges||''});
  seedEntry(st,{type:'wasser',date:'2026-12-02',title:'Boot – Session 1 · Aerobe Power',planned:75,plan:[w[0],w[2]].filter(Boolean).join('\n'),tname:B1T});
  seedPlanEntry(st,D1K,'2026-12-03','Kraft 2/3 · Exzentrisch 95/85/55','kraft',120);
  seedEntry(st,{type:'wasser',date:'2026-12-04',title:'Boot – Session 2 · 70 % HF',planned:75,plan:[w[1],w[2]].filter(Boolean).join('\n'),tname:B2T});
  seedPlanEntry(st,D1T,'2026-12-04','TRX – Dez Woche 1','trx',75);
  seedPlanEntry(st,D1K,'2026-12-05','Kraft 3/3 · Exzentrisch 95/85/55','kraft',120);
}
function seedW4(st){
  seedPlanEntry(st,N23,'2026-11-24','Kraft – Exzentrisch 1','kraft',110);
  seedPlanEntry(st,W4N,'2026-11-26','TRX – Woche 4','trx',60);
  seedPlanEntry(st,N23,'2026-11-27','Kraft – Exzentrisch 2','kraft',110);
}
function seedW2Entry(st){
  const p=st.plans.find(x=>x.name===W2); if(!p||st.entries.some(e=>e.date===W2DAY&&e.planId===p.id)) return;
  const g=st.guides.find(g=>g.from<=W2DAY&&W2DAY<=g.to);
  st.entries.push({id:uid(),type:'kraft',date:W2DAY,time:'',title:'TRX – Woche 2',planned:60,minutes:null,plan:g?g.trx:'',notes:'',tags:[],rpe:null,done:false,items:itemsFromPlan(p),planId:p.id,feedback:'',reply:'',g:{}});
}
function load(){
  try{ const raw=localStorage.getItem(KEY); if(raw){ S=JSON.parse(raw); migrate(); return; } }catch(e){ console.warn(e); }
  S=freshState(); 
}
function migrate(){
  const f=freshState();
  for(const k of ['settings','exercises','plans','guides','timers','entries','tournaments','weekly']) if(S[k]==null) S[k]=f[k];
  S.settings={...f.settings,...S.settings};
  if(PROFILE==='guest'&&(S.gV||0)<1){ // Beispielpläne und Timer für bestehende eigene Profile nachreichen
    for(const x of f.exercises) if(!S.exercises.some(e=>e.name===x.name)) S.exercises.push(x);
    for(const pl of f.plans) if(!S.plans.some(x=>x.name===pl.name)){ pl.items.forEach(it=>{ const ex=S.exercises.find(e=>e.name===it.name); if(ex) it.exId=ex.id; }); S.plans.push(pl); }
    for(const t of f.timers) if(!S.timers.some(x=>x.name===t.name)) S.timers.push(t);
    S.gV=1; save();
  }
  if(PROFILE==='guest'&&S.gV<2){ // Grundlagenplan nachreichen
    for(const x of f.exercises) if(!S.exercises.some(e=>e.name===x.name)) S.exercises.push(x);
    const add=f.plans.filter(pl=>/^Grundlagenplan /.test(pl.name)&&!S.plans.some(x=>x.name===pl.name||x.name==='DKV '+pl.name));
    add.forEach(pl=>pl.items.forEach(it=>{ const ex=S.exercises.find(e=>e.name===it.name); if(ex) it.exId=ex.id; }));
    S.plans.unshift(...add); S.gV=2; save();
  }
  if(PROFILE==='guest'&&S.gV<3){ // Beispielpläne mit neuen, neutralen Texten auffrischen (Name und eigene Pläne bleiben)
    for(const pl of f.plans){ const i=S.plans.findIndex(x=>x.name===pl.name||x.name==='DKV '+pl.name); if(i<0) continue;
      pl.items.forEach(it=>{ const ex=S.exercises.find(e=>e.name===it.name); if(ex) it.exId=ex.id; }); pl.id=S.plans[i].id; S.plans[i]=pl; }
    S.gV=3; save();
  }
  if(PROFILE==='guest'&&S.gV<4){ // Zirkel ohne Geräte nachreichen; bestehende Profile bleiben im freien Modus
    for(const pl of f.plans) if(!S.plans.some(x=>x.name===pl.name)){ pl.items.forEach(it=>{ const ex=S.exercises.find(e=>e.name===it.name); if(ex) it.exId=ex.id; }); S.plans.push(pl); }
    if(!S.settings.mode) S.settings.mode='fort'; S.gV=4; save();
  }
  if(PROFILE!=='owner') return;
  if((S.seedV||1)<2){ // neuer TRX-Zirkel Woche 2: Plan, Timer und Training für den 13.11.
    const up=(list,name)=>{ const n=f[list].find(x=>x.name===name), i=S[list].findIndex(x=>x.name===name); if(i>=0){ n.id=S[list][i].id; S[list][i]=n; } else S[list].push(n); };
    up('plans',W2); up('timers',W2T); seedW2Entry(S); S.seedV=2; save();
  }
  if(S.seedV<3){ // Kraft-Session 16.11.
    if(!S.plans.some(x=>x.name===N16)) S.plans.unshift(f.plans.find(x=>x.name===N16));
    seedPlanEntry(S,N16,N16DAY,'Kraft – Dynamic','kraft',90); S.seedV=3; save();
  }
  if(S.seedV<4){ // 16.11.: Runden-Reihenfolge Bank -> Rudern -> Trizeps -> Pause, eingetragene Sätze bleiben erhalten
    const np=f.plans.find(x=>x.name===N16), i=S.plans.findIndex(x=>x.name===N16);
    if(i>=0){ np.id=S.plans[i].id; S.plans[i]=np; } else S.plans.unshift(np);
    const e=S.entries.find(e=>e.date===N16DAY&&e.planId===np.id);
    if(e&&e.items.length>=3&&e.items.slice(0,3).every(it=>it.target&&it.target.scheme&&it.sets.length===9)){
      const fresh=itemsFromPlan(np).slice(0,9), old=e.items.slice(0,3);
      fresh.forEach((it,k)=>{ const r=Math.floor(k/3); it.sets=old[k%3].sets.slice(r*3,r*3+3); });
      e.items=[...fresh,...e.items.slice(3)];
    }
    S.seedV=4; save();
  }
  if(S.seedV<5){ // Superman 16.11.: Halte-Timer 6 × 10 s / 5 s
    const sup='Superman (arms and legs extended)', tm={n:6,work:10,rest:5};
    const pl=S.plans.find(x=>x.name===N16), pi=pl&&pl.items.find(i=>i.name===sup); if(pi&&!pi.tm) pi.tm={...tm};
    for(const e of S.entries) if(pl&&e.planId===pl.id) for(const it of e.items) if(it.name===sup&&!it.tm) it.tm={...tm};
    S.seedV=5; save();
  }
  if(S.seedV<6){ // Woche 4: neue TRX-Übungen, Kraft exzentrisch, TRX-Plan + Timer, Trainings der Woche
    for(const x of f.exercises) if(!S.exercises.some(e=>e.name===x.name)) S.exercises.push(x);
    const fix=pl=>{ pl.items.forEach(it=>{ const ex=S.exercises.find(e=>e.name===it.name); if(ex) it.exId=ex.id; }); return pl; };
    const put=(list,name,front)=>{ const n=f[list].find(x=>x.name===name), i=S[list].findIndex(x=>x.name===name); if(list==='plans') fix(n); if(i>=0){ n.id=S[list][i].id; S[list][i]=n; } else front?S[list].unshift(n):S[list].push(n); };
    put('plans',N23,true); put('plans',W4N); put('timers',W4T,true); seedW4(S); S.seedV=6; save();
  }
  if(S.seedV<7){ // Dezember: Monatsplan, Woche 1 mit Kraft, TRX, Boot, Laufen und Timern
    for(const x of f.exercises) if(!S.exercises.some(e=>e.name===x.name)) S.exercises.push(x);
    for(const g of f.guides) if(g.from>='2026-11-30'&&!S.guides.some(x=>x.from===g.from)) S.guides.push(g);
    for(const n of [D1T,D1K]){ if(S.plans.some(x=>x.name===n)) continue; const pl=f.plans.find(x=>x.name===n); pl.items.forEach(it=>{ const ex=S.exercises.find(e=>e.name===it.name); if(ex) it.exId=ex.id; }); S.plans.unshift(pl); }
    for(const n of [B2T,B1T,D1TT]) if(!S.timers.some(t=>t.name===n)) S.timers.unshift(f.timers.find(t=>t.name===n));
    seedD1(S); S.seedV=7; save();
  }
  if(S.seedV<8){ // Taktiklehrgang Bayreuth gestrichen (nur Braunschweig)
    S.tournaments=S.tournaments.filter(x=>!(x.from==='2027-02-20'&&/Bayreuth/.test(x.ort||'')&&!x.games.length));
    S.seedV=8; save();
  }
  if(S.seedV<9){ // Ausführungstipps für TRX-Übungen ergänzen (eigene Notizen bleiben)
    for(const e of S.exercises) if(TRX_TIPS[e.name]&&!e.note) e.note=TRX_TIPS[e.name];
    S.seedV=9; save();
  }
  if(S.seedV<10){ // kürzere, unterscheidbare Titel für die drei Kraft-Einheiten der Woche
    for(const e of S.entries){ const m=/^Kraft – Exzentrisch 95\/85\/55 \((\d) von 3\)$/.exec(e.title||''); if(m) e.title='Kraft '+m[1]+'/3 · Exzentrisch 95/85/55'; }
    S.seedV=10; save();
  }
  if(S.seedV<11){ for(const x of f.exercises) if(!S.exercises.some(e=>e.name===x.name)) S.exercises.push(x); S.seedV=11; save(); }
}
let saveWarned=false;
function save(){
  if(!S) return;
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
  return p.items.map(it=>({id:uid(),exId:it.exId,name:it.name,mode:it.mode,block:it.block||'',...(it.tm?{tm:{...it.tm}}:{}),
    target:{sets:it.sets,reps:it.reps,time:it.time,weight:it.weight,pct:it.pct,rest:it.rest,note:it.note,...(it.scheme?{scheme:it.scheme}:{})},
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
  if(t.scheme){ const n=Math.round((t.sets||t.scheme.length)/t.scheme.length), l=t.scheme.map(x=>x.reps+' Wdh. bei '+x.pct+' %').join(' + '); return (n>1?n+' × ('+l+')':l)+(t.rest?' · Pause '+(t.rest>=60?fnum(t.rest/60)+' min':t.rest+' s'):''); }
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
