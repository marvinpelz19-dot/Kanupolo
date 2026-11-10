// Paddle design for Maxi (#2) — KSV Rothe Mühle Essen · CPS Energy Spoon.
// Generates SVG + PNG for every blade face, the shaft and an overview board,
// in two variants: A = white shaft, B = black (carbon) shaft.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.resolve(__dirname, '..');
const crest = JSON.parse(fs.readFileSync(path.join(OUT, 'assets/crest.json'), 'utf8'));

const RED = '#E31E24', DEEP = '#B5121B', WHITE = '#FFFFFF', BLACK = '#111214', INKRED = '#9E0F17';
const FONT = "Inter, 'Inter Display', Arial, sans-serif";
// handwriting fonts, only used for the sample signatures on the preview sheet
const HAND = { caveat: 'caveat-latin-700-normal', marker: 'permanent-marker-latin-400-normal', rock: 'rock-salt-latin-400-normal', reenie: 'reenie-beanie-latin-400-normal', grace: 'covered-by-your-grace-latin-400-normal', nothing: 'nothing-you-could-do-latin-400-normal' };
const FONT_CSS = Object.entries(HAND).map(([k, f]) => `@font-face{font-family:'hand-${k}';src:url(data:font/woff2;base64,${fs.readFileSync(path.join(OUT, 'assets/fonts', f + '.woff2')).toString('base64')}) format('woff2');}`).join('');
// example names – the team signs the real paddle by hand
const SIGS = {
  R: [['Marvin', 'marker', 86, 920, 275, -6], ['Lara', 'caveat', 120, 1265, 300, 5], ['Nille', 'rock', 62, 850, 470, 4], ['Gabor', 'grace', 110, 1200, 500, -7], ['Henry', 'nothing', 80, 950, 655, -3]],
  L: [['Lasse', 'caveat', 120, 930, 285, -5], ['Silas', 'marker', 84, 1270, 300, 6], ['Spjalle', 'grace', 108, 870, 480, 5], ['Jill', 'rock', 64, 1240, 500, -6], ['Amira', 'reenie', 130, 970, 660, -4]],
};

// Blade outline, traced from the CPS Energy Spoon product photo.
// u: 0 = neck … 1955 = tip, v: 0 … 830 (bulge at the bottom).
const BLADE = 'M-140 205 L-40 200 C200 185 400 70 800 25 C1150 -12 1600 -5 1800 22 C1920 40 1965 90 1955 190 C1945 330 1930 430 1900 510 C1860 620 1780 690 1640 740 C1450 805 1250 830 1100 823 C850 812 600 740 420 640 C250 545 150 380 -40 345 L-140 340 Z';
const BW = 1955, BH = 830, CW = 2300, CH = 1000, OX = 190, OY = 85;

const slant = (u, w, k = 150) => `M${u + k} -20 L${u + k + w} -20 L${u - k + w} ${BH + 20} L${u - k} ${BH + 20} Z`;
function stripes(u0, color, n = 7, step = 64, w0 = 46, dw = 6) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<path d="${slant(u0 + i * step, w0 - i * dw)}" fill="${color}"/>`;
  return s;
}
const field = (u1, color) => `<path d="M-300 -20 L${u1 + 150} -20 L${u1 - 150} ${BH + 20} L-300 ${BH + 20} Z" fill="${color}"/>`;

function crestAt(cx, cy, h, color, id = 'crest') {
  const s = h / crest.h;
  return `<path d="${crest[id]}" fill="${color}" fill-rule="evenodd" transform="translate(${cx - (crest.w * s) / 2} ${cy - h / 2}) scale(${s})"/>`;
}
function wheelAt(cx, cy, r, color, opacity = 1) {
  const s = r / 165;
  return `<path d="${crest.wheel}" fill="${color}" fill-rule="evenodd" opacity="${opacity}" transform="translate(${cx - crest.cx * s} ${cy - crest.cy * s}) scale(${s})"/>`;
}
// CPS wordmark, redrawn in club colours (placeholder for the original CPS logo file).
function cps(x, y, h, c1, c2) {
  const s = h / 120;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke-width="24" stroke-linecap="butt">
    <path d="M90 26 A48 48 0 1 0 90 98" stroke="${c1}"/>
    <path d="M128 122 V8 M128 20 H152 A30 30 0 0 1 152 80 H128" stroke="${c2}"/>
    <path d="M268 30 C240 4 196 14 198 42 C200 68 264 56 266 88 C268 116 216 124 192 96" stroke="${c1}"/></g>`;
}
const txt = (x, y, size, fill, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-weight="${o.w || 900}" font-style="${o.italic === false ? 'normal' : 'italic'}" font-size="${size}" fill="${fill}" text-anchor="${o.anchor || 'middle'}" letter-spacing="${o.ls || 0}">${s}</text>`;

// ---------- blade artwork ----------
// returns { shapes, marks }: shapes are mirrored with the blade, marks (text/logos) are placed un-mirrored.
function art(variant, side, face, X, sample = false) {
  const R = side === 'R';
  let shapes = '', marks = '';
  // inner (power) face: original black CPS carbon, only a small white name / number
  if (face === 'front') {
    shapes = `<rect x="-300" y="-20" width="2600" height="900" fill="#17181b"/><rect x="-300" y="-20" width="2600" height="900" fill="url(#carbon)" opacity="0.55"/>`;
    marks = txt(X(1080), 455, 120, WHITE, R ? 'MAXI' : '#2', { ls: 2 });
    return { shapes, marks };
  }
  const A = variant === 'A';
  // back face: black (or white) neck fading into red, small crest at the tip,
  // club name along the flat top edge, free area below it for hand-written signatures
  const neck = A ? WHITE : BLACK;
  shapes += `<rect x="-300" y="-20" width="2600" height="900" fill="url(#redG)"/>`;
  shapes += field(280, neck) + stripes(320, neck, 6, 58, 42, 6);
  marks += crestAt(X(1700), 400, 370, WHITE);
  marks += txt(X(1120), 128, 46, WHITE, 'ROTHE MÜHLE ESSEN', { ls: 9, w: 800 });
  marks += `<rect x="${X(1120) - 280}" y="152" width="560" height="5" fill="${WHITE}" opacity="0.9"/>`;
  if (sample) {
    for (const [name, font, size, u, v, rot] of SIGS[side]) {
      marks += `<text x="${X(u)}" y="${v}" font-family="hand-${font}" font-size="${size}" fill="#fff" fill-opacity="0.96" text-anchor="middle" transform="rotate(${rot} ${X(u)} ${v})">${name}</text>`;
    }
  } else {
    marks += `<rect x="${X(1130) - 340}" y="200" width="680" height="500" rx="18" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="3" stroke-dasharray="14 12"/>`;
    marks += txt(X(1130), 440, 26, WHITE, 'SIGNATURE AREA – KEEP FREE (PLAIN RED)', { italic: false, w: 700, ls: 3 });
    marks += txt(X(1130), 485, 22, WHITE, 'guide only – do not print this frame', { italic: false, w: 500 });
  }
  return { shapes, marks };
}

const defs = `<defs>
  <linearGradient id="redG" x1="0" y1="0" x2="1" y2="0.35"><stop offset="0" stop-color="${RED}"/><stop offset="0.55" stop-color="${RED}"/><stop offset="1" stop-color="${DEEP}"/></linearGradient>
  <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.16"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.10"/></linearGradient>
  <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF0F2"/><stop offset="1" stop-color="#D9DDE1"/></linearGradient>
  <linearGradient id="tube" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="0.35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></linearGradient>
  <pattern id="carbon" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#141518"/><path d="M0 8L8 0" stroke="#24262b" stroke-width="2.4"/></pattern>
  <filter id="sh" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="0.28"/></filter>
  <clipPath id="bladeClip"><path d="${BLADE}"/></clipPath>
</defs>`;

// One blade as an SVG group in a CW x CH box. Right blade: neck left. Left blade: neck right.
// The inner (power) face is the same outline seen from the other side, i.e. flipped across the long axis.
function bladeGroup(variant, side, face, sample = false) {
  const R = side === 'R';
  const flipV = face === 'front';
  const X = (u) => (R ? u : BW - u);
  const { shapes, marks } = art(variant, side, face, X, sample);
  const m = `${R ? '' : `translate(${BW} 0) scale(-1 1)`} ${flipV ? `translate(0 ${BH}) scale(1 -1)` : ''}`;
  const shaftFill = variant === 'A' ? WHITE : 'url(#carbon)';
  return `<g transform="translate(${R ? OX : CW - OX - BW} ${OY})">
    <g filter="url(#sh)">
      <g transform="${m}"><g clip-path="url(#bladeClip)">${shapes}<rect x="-140" y="190" width="100" height="165" fill="${shaftFill}"/></g></g>
      <g transform="${flipV ? `translate(0 ${BH}) scale(1 -1)` : ''}"><g transform="${flipV ? `translate(0 ${BH}) scale(1 -1)` : ''}">${marks}</g></g>
      <g transform="${m}"><path d="${BLADE}" fill="url(#gloss)"/><path d="${BLADE}" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="3"/></g>
    </g></g>`;
}
const label = (x, y, a, b) => txt(x, y, 34, '#111', a, { anchor: 'start', italic: false, w: 800, ls: 2 }) + txt(x, y + 40, 26, '#5b6570', b, { anchor: 'start', italic: false, w: 500 });
const NAME = { R: 'RIGHT BLADE', L: 'LEFT BLADE', back: 'Back face (design side)', front: 'Power face (inner side) – black, small white print', A: 'white shaft', B: 'black shaft' };

function bladeSVG(variant, side, face) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH + 110}" viewBox="0 0 ${CW} ${CH + 110}">${defs}
  <rect width="${CW}" height="${CH + 110}" fill="url(#bgG)"/>
  ${label(60, 70, `${NAME[side]} · ${NAME[face].toUpperCase()}`, `Maxi #2 · Rothe Mühle Essen · CPS Energy Spoon · ${NAME[variant]}`)}
  <g transform="translate(0 110)">${bladeGroup(variant, side, face)}</g></svg>`;
}

// ---------- shaft ----------
const SL = 4600, ST = 122; // shaft length / thickness in blade units
function shaftGroup(variant, face = 'back') {
  const A = variant === 'A';
  const base = A ? WHITE : 'url(#carbon)', ink = A ? RED : WHITE, ring = RED;
  let g = `<rect width="${SL}" height="${ST}" fill="${base}"/>`;
  const rings = (x, dir) => [0, 1, 2, 3, 4].map((i) => `<rect x="${dir > 0 ? x + i * 62 : x - i * 62 - (46 - i * 9)}" width="${46 - i * 9}" height="${ST}" fill="${ring}"/>`).join('');
  g += `<rect width="150" height="${ST}" fill="${ring}"/><rect x="${SL - 150}" width="150" height="${ST}" fill="${ring}"/>` + rings(180, 1) + rings(SL - 180, -1);
  if (face === 'back') {
    g += wheelAt(SL / 2, ST / 2, 46, ink);
    g += txt(SL / 2 - 90, ST / 2 + 21, 60, ink, 'KSV ROTHE MÜHLE ESSEN', { anchor: 'end', ls: 10 });
    g += txt(SL / 2 + 90, ST / 2 + 21, 60, ink, 'MAXI  #2', { anchor: 'start', ls: 10 });
  }
  g += `<rect width="${SL}" height="${ST}" fill="url(#tube)"/><rect width="${SL}" height="${ST}" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="2"/>`;
  return g;
}
function shaftSVG(variant) {
  const W = 3000, H = 520, s = (W - 160) / SL;
  const zoom = 1.15;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}
  <rect width="${W}" height="${H}" fill="url(#bgG)"/>
  ${label(60, 70, `SHAFT · ${variant === 'A' ? 'WHITE' : 'BLACK (STANDARD CPS CARBON)'}`, `Maxi #2 · Rothe Mühle Essen · ${NAME[variant]} · top: full shaft, bottom: centre section (enlarged)`)}
  <g transform="translate(80 170) scale(${s})" filter="url(#sh)">${shaftGroup(variant)}</g>
  <svg x="80" y="300" width="${W - 160}" height="170" viewBox="${SL / 2 - (W - 160) / zoom / 2} ${-(170 / zoom - ST) / 2 - 4} ${(W - 160) / zoom} ${170 / zoom}"><g filter="url(#sh)">${shaftGroup(variant)}</g></svg>
  </svg>`;
}

// ---------- production notes (English, for CPS) ----------
function notes(x, y, variant) {
  const rows = [
    ['Paddle', 'CPS Energy Spoon blades (left + right) with CPS carbon shaft.'],
    ['Back face (design side)', 'Print: black neck stripes on red, small white club crest at the tip, white text “ROTHE MÜHLE ESSEN” with line along the flat top edge. Same on both blades.'],
    ['Signature area', 'The red area below “ROTHE MÜHLE ESSEN” must stay EMPTY (plain red). The team will sign there by hand. Hand-written names shown here are EXAMPLES – DO NOT PRINT.'],
    ['Power face (inner side)', 'Original black CPS carbon finish. Small white print only: right blade “MAXI”, left blade “#2”. Nothing else.'],
    ['Shaft', variant === 'A' ? 'White shaft with red rings and red text.' : 'Standard black CPS carbon shaft. Red rings at both ends, white text “KSV ROTHE MÜHLE ESSEN”, mill-wheel icon, “MAXI #2”.'],
    ['Colours', 'Club red: HEX #E31E24 (RGB 227 / 30 / 36) – please match as closely as possible. Dark red in gradient: #B5121B. White: #FFFFFF. Black: #111214.'],
    ['Text (do not translate)', '“MAXI”, “#2”, “ROTHE MÜHLE ESSEN”, “KSV ROTHE MÜHLE ESSEN” (shaft), “1924” (part of the crest). Note the German letter “Ü”.'],
    ['CPS logo', 'No CPS logo on the back faces.'],
    ['Blade outline', 'The outline was traced from a product photo. Please fit the artwork to your original Energy Spoon template; small adjustments are fine.'],
    ['Files', 'Vector files (SVG) for every blade face and the shaft are supplied. The single blade files show the print artwork WITHOUT example signatures.'],
  ];
  let g = `<rect x="${x}" y="${y}" width="3080" height="${rows.length * 50 + 110}" rx="10" fill="#fff"/><rect x="${x}" y="${y}" width="14" height="${rows.length * 50 + 110}" fill="${RED}"/>`;
  g += txt(x + 50, y + 62, 36, '#111', 'PRODUCTION NOTES', { anchor: 'start', italic: false, w: 800, ls: 2 });
  rows.forEach((r, i) => {
    g += txt(x + 50, y + 122 + i * 50, 27, RED, r[0], { anchor: 'start', italic: false, w: 800 });
    g += txt(x + 500, y + 122 + i * 50, 27, '#22262b', r[1], { anchor: 'start', italic: false, w: 500 });
  });
  return g;
}

// ---------- overview board ----------
function paddle(variant, face, sample = true) {
  // left blade (neck right) + shaft + right blade (neck left), in blade units
  const yShaft = OY + (face === 'front' ? BH - 340 : 205) + 6;
  const L = bladeGroup(variant, 'L', face, sample), Rb = bladeGroup(variant, 'R', face, sample);
  const xNeckL = CW - OX + 40; // where the left blade's neck stub ends
  return `<g>${L}<g transform="translate(${xNeckL} ${yShaft})" filter="url(#sh)">${shaftGroup(variant, face)}</g><g transform="translate(${xNeckL + SL + 40 - OX} 0)">${Rb}</g></g>`;
}
function boardSVG(variant) {
  const W = 3200, H = 3240, total = CW - OX + 40 + SL + 40 - OX + CW, s = (W - 120) / total;
  const tile = (side, face, x, y) => `<g transform="translate(${x} ${y}) scale(0.62)">${bladeGroup(variant, side, face, true)}</g>` + label(x + 40, y + 660, `${NAME[side]}`, face === 'back' ? 'Back face (design side) · hand-written names are EXAMPLES – not printed' : NAME[face]);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}
  <rect width="${W}" height="${H}" fill="url(#bgG)"/>
  <rect width="${W}" height="150" fill="${variant === 'A' ? RED : BLACK}"/><rect y="150" width="${W}" height="10" fill="${variant === 'A' ? BLACK : RED}"/>
  ${crestAt(110, 75, 120, WHITE)}
  ${txt(200, 72, 54, WHITE, 'CUSTOM PADDLE FOR MAXI  #2', { anchor: 'start', ls: 3 })}
  ${txt(200, 118, 30, WHITE, `KSV Rothe Mühle Essen (Germany) · CPS Energy Spoon · ${NAME[variant]} · design brief for CPS`, { anchor: 'start', italic: false, w: 500 })}
  ${label(60, 240, 'FULL PADDLE · BACK FACES', 'Design side of both blades · with example signatures (signed by hand later, not printed)')}
  <g transform="translate(60 290) scale(${s})">${paddle(variant, 'back')}</g>
  ${label(60, 700, 'FULL PADDLE · POWER FACES', 'Inner side – original CPS black with small white name / number')}
  <g transform="translate(60 750) scale(${s})">${paddle(variant, 'front')}</g>
  ${tile('L', 'back', 60, 1130)}${tile('R', 'back', 1680, 1130)}
  ${[0, 1].map((i) => `<g transform="translate(${i ? 1680 : 60} 1850) scale(0.36)">${bladeGroup(variant, i ? 'R' : 'L', 'front')}</g>` + label((i ? 1680 : 60) + 880, 1990, i ? NAME.R : NAME.L, i ? 'Power face – black, small white “MAXI”' : 'Power face – black, small white “#2”')).join('')}
  ${label(60, 2330, 'SHAFT · CENTRE SECTION (ENLARGED)', 'Black CPS carbon shaft · white text · red rings at both ends')}
  <svg x="60" y="2400" width="3080" height="170" viewBox="${SL / 2 - 1340} -13 2680 148"><g filter="url(#sh)">${shaftGroup(variant)}</g></svg>
  ${notes(60, 2620, variant)}
  </svg>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const jobs = [];
  for (const v of ['B']) {
    const dir = 'final-black-shaft';
    fs.mkdirSync(path.join(OUT, dir, 'svg'), { recursive: true });
    jobs.push([dir, `00-overview-and-production-notes`, boardSVG(v)]);
    jobs.push([dir, `01-right-blade-back-face`, bladeSVG(v, 'R', 'back')]);
    jobs.push([dir, `02-right-blade-power-face`, bladeSVG(v, 'R', 'front')]);
    jobs.push([dir, `03-left-blade-back-face`, bladeSVG(v, 'L', 'back')]);
    jobs.push([dir, `04-left-blade-power-face`, bladeSVG(v, 'L', 'front')]);
    jobs.push([dir, `05-shaft`, shaftSVG(v)]);
  }
  for (const [dir, name, svg] of jobs) {
    fs.writeFileSync(path.join(OUT, dir, 'svg', name + '.svg'), svg);
    const [, w, h] = svg.match(/width="(\d+)" height="(\d+)"/);
    await page.setViewportSize({ width: +w, height: +h });
    await page.setContent(`<html><head><style>${FONT_CSS}</style></head><body style="margin:0">${svg}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, dir, name + '.png') });
    if (name.startsWith('00')) {
      const big = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: +w, height: +h } });
      await big.setContent(`<html><head><style>${FONT_CSS}</style></head><body style="margin:0">${svg}</body></html>`);
      await big.evaluate(() => document.fonts.ready);
      await big.screenshot({ path: path.join(OUT, dir, 'Maxi-Paddle-Design-Sheet-EN.png') });
      await big.close();
    }
  }
  await browser.close();
  console.log('rendered', jobs.length);
})();
