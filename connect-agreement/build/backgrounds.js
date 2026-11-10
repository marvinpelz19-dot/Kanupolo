// Renders the page backgrounds (water / splash artwork) with headless Chromium.
const { chromium } = require('playwright');
const path = require('path');

const W = 1654, H = 2339; // A4 @ 200 dpi
const GREEN = '#3DDC2C';

function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function splash(r, cx, cy, n, spread, color) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI * (0.08 + 0.84 * r());
    const d = Math.pow(r(), 0.6) * spread;
    const x = cx + Math.cos(ang) * d * 1.5, y = cy + Math.sin(ang) * d * 0.75;
    const s = 1.2 + Math.pow(r(), 3) * 13;
    const rot = (ang * 180) / Math.PI + 90;
    out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(s * 0.55).toFixed(1)}" ry="${(s * (1 + r() * 1.6)).toFixed(1)}" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${color}" opacity="${(0.25 + r() * 0.7).toFixed(2)}"/>`;
  }
  return out;
}

function streaks(r, n, x0, x1, y0, y1, color, maxLen) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
    const len = 80 + r() * maxLen, th = 2 + r() * 9;
    out += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${len.toFixed(0)}" height="${th.toFixed(1)}" fill="${color}" opacity="${(0.15 + r() * 0.6).toFixed(2)}" transform="skewX(-28)"/>`;
  }
  return out;
}

const defs = `
<defs>
  <filter id="water" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.016" numOctaves="5" seed="11" result="n"/>
    <feSpecularLighting in="n" surfaceScale="38" specularConstant="1.25" specularExponent="22" lighting-color="#9fe8ff" result="spec">
      <feDistantLight azimuth="235" elevation="38"/>
    </feSpecularLighting>
    <feDiffuseLighting in="n" surfaceScale="30" diffuseConstant="1.1" lighting-color="#1f86a8" result="diff">
      <feDistantLight azimuth="235" elevation="50"/>
    </feDiffuseLighting>
    <feComposite in="spec" in2="diff" operator="arithmetic" k1="0" k2="0.9" k3="0.75" k4="0"/>
  </filter>
  <filter id="soft"><feGaussianBlur stdDeviation="1.1"/></filter>
  <filter id="mist"><feGaussianBlur stdDeviation="38"/></filter>
  <linearGradient id="deep" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0C0E12" stop-opacity="0.96"/>
    <stop offset="0.45" stop-color="#0b2233" stop-opacity="0.72"/>
    <stop offset="1" stop-color="#0a3b52" stop-opacity="0.38"/>
  </linearGradient>
  <linearGradient id="fadeUp" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0.78"/>
  </linearGradient>
</defs>`;

function cover() {
  const r = rng(42), BH = 800;
  const clip = `M0 0 H${W} V${BH - 150} L0 ${BH} Z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}
  <rect width="${W}" height="${H}" fill="#fff"/>
  <clipPath id="c"><path d="${clip}"/></clipPath>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${BH}" fill="#0a2a3c"/>
    <rect width="${W}" height="${BH}" filter="url(#water)"/>
    <rect width="${W}" height="${BH}" fill="url(#deep)"/>
    <ellipse cx="1270" cy="640" rx="330" ry="120" fill="#dff8ff" opacity="0.5" filter="url(#mist)"/>
    <g filter="url(#soft)">
      ${splash(r, 1270, 640, 260, 330, '#ffffff')}
      ${splash(r, 1120, 700, 90, 200, '#e9fbff')}
      ${splash(r, 1430, 610, 60, 160, GREEN)}
    </g>
    ${streaks(r, 16, 1200, 2000, 60, 520, GREEN, 420)}
    ${streaks(r, 14, 1250, 2000, 40, 560, '#ffffff', 300)}
  </g>
  <path d="M0 ${BH} L${W} ${BH - 150} V${BH - 132} L0 ${BH + 18} Z" fill="${GREEN}"/>
  <path d="M0 ${BH + 30} L${W} ${BH - 120} V${BH - 114} L0 ${BH + 36} Z" fill="#0C0E12"/>
  <!-- white logo plate -->
  <path d="M0 96 H690 L640 260 H0 Z" fill="#fff"/>
  <path d="M700 96 H716 L666 260 H650 Z" fill="${GREEN}"/>
  ${footerArt(rng(7))}
  </svg>`;
}

function footerArt(r) {
  const top = H - 330;
  return `<clipPath id="f"><path d="M0 ${top + 150} L${W} ${top} V${H} H0 Z"/></clipPath>
  <g clip-path="url(#f)" opacity="0.14">
    <rect y="${top}" width="${W}" height="330" fill="#0a2a3c"/>
    <rect y="${top}" width="${W}" height="330" filter="url(#water)"/>
  </g>
  <rect y="${top}" width="${W}" height="150" fill="url(#fadeUp)" opacity="0.0"/>
  <g opacity="0.55">${streaks(r, 7, 2500, 2950, H - 200, H - 70, GREEN, 260)}</g>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="#0C0E12"/>
  <rect x="0" y="${H - 14}" width="520" height="14" fill="${GREEN}"/>`;
}

function inner() {
  const r = rng(99);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}
  <rect width="${W}" height="${H}" fill="#fff"/>
  <clipPath id="t"><path d="M0 0 H${W} V70 L0 150 Z"/></clipPath>
  <g clip-path="url(#t)">
    <rect width="${W}" height="150" fill="#0a2a3c"/>
    <rect width="${W}" height="150" filter="url(#water)"/>
    <rect width="${W}" height="150" fill="#0C0E12" opacity="0.55"/>
    ${streaks(r, 8, 900, 1900, 10, 90, GREEN, 300)}
  </g>
  <path d="M0 150 L${W} 70 V80 L0 160 Z" fill="${GREEN}"/>
  ${footerArt(rng(7))}
  </svg>`;
}

(async () => {
  const out = path.resolve(__dirname, '../assets');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const [name, svg] of [['bg-cover', cover()], ['bg-inner', inner()]]) {
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await page.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 88 });
  }
  await browser.close();
})();
