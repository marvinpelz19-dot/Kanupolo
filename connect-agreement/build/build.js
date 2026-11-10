// Builds the Connect Kayaks Athlete Affiliate Agreement (.docx).
const fs = require('fs');
const path = require('path');
const d = require('docx');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, Header, Footer,
  AlignmentType, WidthType, ShadingType, BorderStyle, PageNumber, VerticalAlign, TabStopType,
  HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType, LineRuleType,
  TableLayoutType, HeightRule,
} = d;

const A = (f) => fs.readFileSync(path.resolve(__dirname, '../assets', f));
const mm = (v) => Math.round(v * 56.6929);      // mm -> twips
const emu = (v) => Math.round(v * 36000);       // mm -> EMU
const px = (v) => Math.round(v * 3.7795);       // mm -> px (96 dpi) for ImageRun sizes

const FONT = 'Arial';
const INK = '0C0E12', NAVY = '0B2A3C', GREEN = '2FBF1F', GREEN_BRIGHT = '3DDC2C', GREY = '5B6570', PALE = 'F1F7F3', LINE = 'D5DDE2';
const CONTENT = mm(210 - 18 - 18);

const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: none, bottom: none, left: none, right: none };

function bg(file) {
  return new Paragraph({ children: [new ImageRun({
    type: 'jpg', data: A(file), transformation: { width: px(210), height: px(297) },
    floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
      verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
      behindDocument: true, allowOverlap: true, wrap: { type: TextWrappingType.NONE },
    },
  })] });
}
function floatLogo(file, x, y, w) {
  const h = w * 312 / 1460;
  return new ImageRun({
    type: 'png', data: A(file), transformation: { width: px(w), height: px(h) },
    altText: { title: 'Connect Kayaks logo', description: 'Connect – Your connection to the water', name: 'Connect logo' },
    floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: emu(x) },
      verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: emu(y) },
      allowOverlap: true, wrap: { type: TextWrappingType.NONE },
    },
  });
}

const t = (text, o = {}) => new TextRun({ text, font: FONT, size: 20, color: INK, ...o });
const spacer = (h) => new Paragraph({ spacing: { line: mm(h), lineRule: LineRuleType.EXACT, before: 0, after: 0 }, children: [t('', { size: 2 })] });

function body(children, o = {}) {
  return new Paragraph({ spacing: { before: 0, after: 120, line: 290 }, alignment: AlignmentType.LEFT, ...o,
    children: (Array.isArray(children) ? children : [children]).map((c) => (typeof c === 'string' ? t(c) : c)) });
}
function section(num, title) {
  return new Paragraph({
    keepNext: true, spacing: { before: 300, after: 140 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GREEN_BRIGHT, space: 4 } },
    children: [
      t(String(num).padStart(2, '0'), { bold: true, italics: true, size: 30, color: GREEN }),
      t('   ' + title.toUpperCase(), { bold: true, italics: true, size: 24, color: NAVY, characterSpacing: 10 }),
    ],
  });
}
function clause(num, label, text, o = {}) {
  const runs = [t(num, { bold: true, color: GREEN }), t('\t')];
  if (label) runs.push(t(label + ' ', { bold: true, color: NAVY }));
  (Array.isArray(text) ? text : [text]).forEach((x) => runs.push(typeof x === 'string' ? t(x) : x));
  return new Paragraph({
    spacing: { before: 0, after: 110, line: 290 }, indent: { left: mm(11), hanging: mm(11) },
    tabStops: [{ type: TabStopType.LEFT, position: mm(11) }], children: runs, ...o,
  });
}
function cell(children, w, o = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.TOP,
    margins: { top: mm(2.5), bottom: mm(2.5), left: mm(3.5), right: mm(3.5) }, children, ...o,
  });
}
const shade = (fill) => ({ type: ShadingType.CLEAR, color: 'auto', fill });
const small = (text, o = {}) => t(text, { size: 15, bold: true, color: GREEN, characterSpacing: 30, ...o });
const line = (label, fill = '______________________________') => new Paragraph({ spacing: { before: 60, after: 60, line: 300 }, children: [t(label + ' ', { color: GREY, size: 18 }), t(fill, { color: GREY, size: 18 })] });

// ---------- parties ----------
const half = Math.floor((CONTENT - mm(5)) / 2);
const gap = CONTENT - 2 * half;
const cardBorder = { top: { style: BorderStyle.SINGLE, size: 24, color: GREEN_BRIGHT }, bottom: none, left: none, right: none };
const parties = new Table({
  width: { size: CONTENT, type: WidthType.DXA }, columnWidths: [half, gap, half], layout: TableLayoutType.FIXED,
  rows: [new TableRow({ cantSplit: true, children: [
    cell([
      new Paragraph({ spacing: { after: 60 }, children: [small('THE ATHLETE')] }),
      line('Name:', '____________________________'),
      line('Address:', '__________________________'),
      line('Club / team:', '_______________________'),
      line('Instagram (if available): @', '____________'),
    ], half, { shading: shade(PALE), borders: cardBorder }),
    cell([new Paragraph({ children: [] })], gap, { margins: { left: 0, right: 0 } }),
    cell([
      new Paragraph({ spacing: { after: 60 }, children: [small('THE COMPANY')] }),
      new Paragraph({ spacing: { before: 60, after: 60 }, children: [t('Connect Kayaks', { bold: true, size: 22, color: NAVY })] }),
      new Paragraph({ spacing: { after: 60, line: 280 }, children: [t('represented by Gonçalo', { size: 18, color: GREY })] }),
      new Paragraph({ spacing: { after: 30, line: 270 }, children: [t('info@connectkayaks.eu', { size: 18 })] }),
      new Paragraph({ spacing: { after: 30, line: 270 }, children: [t('connectkayaks.eu', { size: 18 })] }),
      new Paragraph({ spacing: { after: 30, line: 270 }, children: [t('instagram.com/connectkayaks', { size: 18 })] }),
    ], half, { shading: shade(PALE), borders: cardBorder }),
  ] })],
});

// ---------- key term callout ----------
const kW = [mm(40), CONTENT - mm(40)];
const keyTerm = new Table({
  width: { size: CONTENT, type: WidthType.DXA }, columnWidths: kW, layout: TableLayoutType.FIXED,
  rows: [new TableRow({ cantSplit: true, children: [
    cell([
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 0 }, children: [t('50%', { bold: true, italics: true, size: 64, color: GREEN_BRIGHT })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [t('ATHLETE PRICE', { bold: true, size: 14, color: 'FFFFFF', characterSpacing: 30 })] }),
    ], kW[0], { shading: shade(INK), verticalAlign: VerticalAlign.CENTER }),
    cell([
      new Paragraph({ spacing: { after: 60 }, children: [t('The deal in one sentence', { bold: true, size: 20, color: 'FFFFFF' })] }),
      new Paragraph({ spacing: { line: 280 }, children: [t('Connect Kayaks provides the Athlete with a canoe polo boat for one year. At the end of that year the Athlete buys the boat for 50% of the original price shown on the invoice. Payment is due after one year, and Connect Kayaks will contact the Athlete when the time comes.', { size: 18, color: 'E8EEF1' })] }),
    ], kW[1], { shading: shade(NAVY), verticalAlign: VerticalAlign.CENTER }),
  ] })],
});

// ---------- boat & invoice details ----------
const bW = [mm(64), CONTENT - mm(64)];
const hair = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const bRow = (label, value, i) => new TableRow({ cantSplit: true, height: { value: mm(8.5), rule: HeightRule.ATLEAST }, children: [
  cell([new Paragraph({ children: [t(label, { bold: true, size: 18, color: NAVY })] })], bW[0], { shading: shade(i % 2 ? 'FFFFFF' : PALE), borders: { ...noBorders, bottom: hair }, verticalAlign: VerticalAlign.CENTER, margins: { top: mm(1.2), bottom: mm(1.2), left: mm(3), right: mm(3) } }),
  cell([new Paragraph({ children: [t(value, { size: 18, color: GREY })] })], bW[1], { shading: shade(i % 2 ? 'FFFFFF' : PALE), borders: { ...noBorders, bottom: hair }, verticalAlign: VerticalAlign.CENTER, margins: { top: mm(1.2), bottom: mm(1.2), left: mm(3), right: mm(3) } }),
] });
const boatTable = new Table({
  width: { size: CONTENT, type: WidthType.DXA }, columnWidths: bW, layout: TableLayoutType.FIXED,
  rows: [
    ['Boat (model / colour)', '______________________________________________'],
    ['Handover date (start of Loan Year)', '____ / ____ / ________'],
    ['Invoice number', '______________________________________________'],
    ['Original price as per invoice', '€ ________________'],
    ['Athlete price (50% of the invoice)', '€ ________________'],
    ['Payment due (end of Loan Year)', '____ / ____ / ________'],
  ].map((r, i) => bRow(r[0], r[1], i)),
});

// ---------- signatures ----------
const sigCell = (title, who) => cell([
  new Paragraph({ spacing: { after: 100 }, children: [small(title)] }),
  new Paragraph({ spacing: { before: 160, after: 0 }, children: [t('Place, date:  ', { size: 17, color: GREY }), t('______________________________', { size: 17, color: GREY })] }),
  new Paragraph({ spacing: { before: 620, after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: INK, space: 1 } }, children: [t(' ', { size: 20 })] }),
  new Paragraph({ spacing: { before: 60 }, children: [t(who, { size: 17, color: GREY })] }),
], half, { shading: shade(PALE), borders: cardBorder });
const signatures = new Table({
  width: { size: CONTENT, type: WidthType.DXA }, columnWidths: [half, gap, half], layout: TableLayoutType.FIXED,
  rows: [new TableRow({ cantSplit: true, children: [
    sigCell('ATHLETE', 'Signature Athlete'),
    cell([new Paragraph({ children: [] })], gap, { margins: { left: 0, right: 0 } }),
    sigCell('CONNECT KAYAKS (GONÇALO)', 'Signature Connect Kayaks'),
  ] })],
});

// ---------- document body ----------
const children = [
  // cover block (sits on the dark water banner)
  new Paragraph({ spacing: { before: 0, after: 0, line: mm(14), lineRule: LineRuleType.EXACT }, children: [floatLogo('connect-logo.png', 16, 15.5, 58), t('', { size: 2 })] }),
  new Paragraph({ spacing: { after: 100 }, children: [t('CANOE POLO  ·  ATHLETE PROGRAMME', { bold: true, size: 17, color: GREEN_BRIGHT, characterSpacing: 60 })] }),
  new Paragraph({ spacing: { after: 0, line: mm(14.5), lineRule: LineRuleType.EXACT }, children: [t('ATHLETE AFFILIATE', { bold: true, italics: true, size: 72, color: 'FFFFFF' })] }),
  new Paragraph({ spacing: { after: 100, line: mm(14.5), lineRule: LineRuleType.EXACT }, children: [t('AGREEMENT', { bold: true, italics: true, size: 72, color: 'FFFFFF' })] }),
  new Paragraph({ spacing: { after: 0 }, children: [t('Boat partnership, athlete boat purchase and brand collaboration', { size: 20, color: 'E8EEF1' })] }),
  spacer(27),

  body([t('This Athlete Affiliate Agreement (the “Agreement”) is entered into between the Athlete named below (the “Athlete”) and Connect Kayaks (the “Company”).')], { spacing: { after: 160, line: 290 } }),
  parties,
  new Paragraph({
    spacing: { before: 220, after: 60, line: 290 }, indent: { left: mm(4) },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: GREEN_BRIGHT, space: 8 } },
    children: [t('Background. ', { bold: true, color: NAVY }), t('This Agreement serves solely as a reliable basis for a successful partnership in canoe polo. It sets out what the Company provides, how the Athlete can purchase the boat, and how the Athlete supports the Connect Kayaks brand in return.', { italics: true })],
  }),

  section(1, 'Company services (scope of the partnership)'),
  clause('1.1', 'Equipment and joint projects.', 'Connect Kayaks supports the Athlete with equipment and joint projects. Depending on need, this includes products such as boats, paddles, spray decks or other items from the Connect Kayaks range.'),
  clause('1.2', 'Boat on loan.', 'The Company provides the Athlete with a canoe polo boat on loan for a period of one (1) year, starting on the day the boat is handed over (the “Loan Year”).'),
  clause('1.3', 'Repairs and service.', 'Repairs or other services relating to bumpers / buoyancy or material damage are part of this Agreement and are covered by the Company.'),

  section(2, 'Boat purchase after the Loan Year'),
  keyTerm,
  spacer(4),
  clause('2.1', 'Purchase.', 'At the end of the Loan Year, the Athlete purchases the boat for 50% of the original price (the “Athlete Price”).'),
  clause('2.2', 'Athlete Price.', 'The Company sends the Athlete an invoice for the boat. The exact amount payable by the Athlete equals 50% of the original price stated on that invoice.'),
  clause('2.3', 'Payment due after one year.', 'The Athlete Price becomes due one (1) year after the boat has been handed over, i.e. at the end of the Loan Year. It is paid to Connect Kayaks using the payment details stated on the invoice.'),
  clause('2.4', 'Reminder by the Company.', 'The Company will contact the Athlete in good time when the payment falls due, to arrange the payment.'),
  clause('2.5', 'Ownership.', 'The boat remains the property of the Company until the Athlete Price has been paid in full. Upon payment, the boat becomes the Athlete’s full property.'),
  clause('2.6', 'Special arrangements.', 'Individual, athlete-specific special arrangements (e.g. a complete, free transfer of the boat) remain unaffected by this standard rule and may be agreed separately.'),
  new Paragraph({ keepNext: true, spacing: { before: 160, after: 100 }, children: [small('BOAT AND INVOICE DETAILS')] }),
  boatTable,

  section(3, 'Athlete commitments (consideration)'),
  body('In return for the support, the Athlete commits to the following:', { keepNext: true }),
  clause('3.1', 'Representation.', 'The Athlete becomes part of the Connect Kayaks social media and website presence.'),
  clause('3.2', 'Media material.', 'Where possible, the Athlete regularly provides the Company with pictures and videos (e.g. from training or tournaments).'),
  clause('3.3', 'Regular social media content.', 'The Athlete regularly shares paddling-related content featuring the boat, in particular Instagram stories and social media posts from tournaments.'),
  clause('3.4', 'Social media tagging duty — @connectkayaks.', 'The Athlete further undertakes — where they maintain a social media presence (if available) — to tag / mention the Company’s Instagram account @connectkayaks (https://www.instagram.com/connectkayaks) in paddling-related posts, reels, stories and videos (training, boat preparation, tournament previews and recaps, results / podiums). Minimum: @connectkayaks mention in the caption plus on-image tag on feed posts / reels, and @connectkayaks mention / sticker in relevant stories; equivalent tag on other platforms where supported. Hashtags alone do not replace the account tag. The Athlete follows @connectkayaks for the term and accepts reasonable collaborator tags where possible.'),
  clause('3.5', 'Use of images and videos.', 'The Company may use pictures and videos showing the Athlete with the boat, whether provided by the Athlete or taken by or for the Company, free of charge for its website, social media channels and other marketing for Connect Kayaks.'),
  clause('3.6', 'Positive promotion.', 'Positive promotion of the boat is part of this Agreement. The Athlete presents the boat and the Connect Kayaks brand in a positive light, both online and at the pitch, and shares any critical feedback directly with the Company.'),
  clause('3.7', 'Test opportunities.', 'Where possible, the Athlete makes their equipment available for testing by potential interested persons, and lets interested paddlers try the boat at tournaments, in their club and at national team level. The Athlete refers interested persons to the Company.'),

  section(4, 'Term and termination'),
  body('This Agreement is based on mutual trust. It may be terminated by either side at any time and without stating reasons. In the event of termination, loaned items shall be returned within a reasonable period, unless the Athlete purchases the boat in accordance with Section 2.'),

  section(5, 'Signatures'),
  body('By signing, both parties confirm that they have read this Agreement and agree to it.', { keepNext: true, spacing: { after: 180 } }),
  signatures,
];

const footer = new Footer({ children: [new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: CONTENT }],
  children: [
    t('CONNECT KAYAKS', { bold: true, size: 14, color: NAVY, characterSpacing: 30 }),
    t('   ·   info@connectkayaks.eu   ·   connectkayaks.eu   ·   @connectkayaks', { size: 14, color: GREY }),
    t('\t', { size: 14 }),
    t('Page ', { size: 14, color: GREY }),
    new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 14, color: NAVY, bold: true }),
    t(' / ', { size: 14, color: GREY }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 14, color: GREY }),
  ],
})] });

const doc = new Document({
  creator: 'Connect Kayaks', title: 'Athlete Affiliate Agreement — Canoe Polo', description: 'Connect Kayaks athlete affiliate agreement',
  styles: { default: { document: { run: { font: FONT, size: 20, color: INK } } } },
  sections: [{
    properties: {
      titlePage: true,
      page: { size: { width: mm(210), height: mm(297) }, margin: { top: mm(27), bottom: mm(24), left: mm(18), right: mm(18), header: mm(5), footer: mm(9) } },
    },
    headers: {
      first: new Header({ children: [bg('bg-cover.jpg')] }),
      default: new Header({ children: [bg('bg-inner.jpg'), new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: CONTENT }], children: [floatLogo('connect-logo-light.png', 14, 3, 40)] })] }),
    },
    footers: { first: footer, default: footer },
    children,
  }],
});

const out = path.resolve(__dirname, '..', 'Connect_Athlete_Affiliate_Agreement.docx');
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(out, b); console.log('written', out, b.length); });
