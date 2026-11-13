# PoloLog – Kanupolo Training & Turniere

Eine einzige Datei: **`index.html`**. Läuft offline auf dem Handy und am PC, ohne Installation und ohne Server.
Alle Daten bleiben lokal im Browser (Backup-Export unter *Einstellungen*).

## Funktionen
- **Saison**: Kalender, Wasser-, Kraft- und sonstiges Training anlegen (auch als wöchentliche Serie), Turniere und Lehrgänge
- **Krafttraining live**: Plan laden, Sätze abhaken, Gewicht/Wiederholungen/Zeit eintragen, Pausen-Timer, Vergleich mit dem letzten Mal
- **Intervall-Timer**: Runden, Belastung und Pause je Übung frei einstellbar, Vollbild-Countdown mit Ton und Vibration
- **Übungsbibliothek**: 200+ Übungen aus den KPoloMax/E-Sens-Unterlagen (Musculation, Swiss Ball, Medizinball, TRX), eigene Übungen ergänzbar
- **Pläne**: Maxims Sessions als Vorlagen, eigene Pläne bauen, als Datei teilen/importieren
- **Monatsplan**: Wochenvorgaben des Trainers, werden automatisch in neue Trainings übernommen
- **Turniere**: Kader, Spiele, Statistik je Spieler (Tore, Würfe, Assists, Ballgewinne, …), persönliche Eindrücke
- **Statistik**: Minuten pro Woche, Belastung (Minuten × RPE), Kraftverlauf je Übung, Turnierbilanz
- **Trainer-Feedback**: RPE 1–10, Feedback-Text auf EN/FR/DE per WhatsApp, E-Mail oder Teilen
- **PDF**: Training, Plan, Turnier, Saisonübersicht, Trainingstagebuch (über „Drucken → Als PDF speichern“)
- **Garmin**: Import von CSV (Aktivitätenliste), TCX und GPX aus Garmin Connect

## Design
Rot-weiß mit dem Wappen der Rothe Mühle (aus `maxi-paddel/assets/crest.json`), Überschriften in Barlow Condensed (OFL, eingebettet).

## Entwicklung
Quellen liegen in `src/`; `node build.js` baut daraus `index.html`.
