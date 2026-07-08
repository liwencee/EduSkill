'use strict';
/**
 * Skillora / Skillora — Pitch Deck Generator
 * Run:  node scripts/generate-pitch-deck.js
 * Output: Skillora-PitchDeck-2025.pptx  (project root)
 */

const PptxGenJS = require('pptxgenjs');
const path      = require('path');

// ─────────────────────────────────────────────────────────────────
//  BRAND PALETTE  (no # prefix for pptxgenjs)
// ─────────────────────────────────────────────────────────────────
const C = {
  blue:       '378ADD',
  blueDark:   '1E4F8A',
  blueLight:  'D6EAFB',
  amber:      'EF9F27',
  amberDark:  'C97E0A',
  amberLight: 'FEF3C7',
  cream:      'F1EFE8',
  ink:        '2C2C2A',
  inkMid:     '5A5A58',
  inkLight:   '9A9A97',
  white:      'FFFFFF',
  green:      '16A34A',
  greenLight: 'D1FAE5',
  red:        'DC2626',
  redLight:   'FEE2E2',
  purple:     '7C3AED',
  purpleLight:'EDE9FE',
  grey:       'F5F5F4',
  greyLine:   'E2E2E0',
};

const F = 'Calibri'; // Font face – available in all PowerPoint installs

// ─────────────────────────────────────────────────────────────────
//  PRESENTATION INIT
// ─────────────────────────────────────────────────────────────────
const pres = new PptxGenJS();
pres.layout  = 'LAYOUT_WIDE';   // 10" × 5.625"
pres.title   = 'Skillora — Investor Pitch Deck 2025';
pres.subject = 'Seed Round — Skillora Ltd.';
pres.author  = 'Skillora Ltd.';
pres.company = 'Skillora Ltd.';

// ─── Layout constants ─────────────────────────────────────────────
const W   = 10;        // slide width  (inches)
const H   = 5.625;     // slide height (inches)
const ML  = 0.4;       // left margin
const CW  = W - 0.8;   // content width  = 9.2"
const HH  = 0.72;      // header height
const FH  = 0.22;      // footer height
const FY  = H - FH;    // footer y  = 5.405"
const CY  = HH + 0.18; // content starts y = 0.90"

// ─────────────────────────────────────────────────────────────────
//  HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/** Blue header bar with amber left-stripe + white title */
function hdr(slide, title) {
  slide.addShape('rect', { x:0, y:0, w:W, h:HH, fill:{ color:C.blue }, line:{ color:C.blue, width:0 } });
  slide.addShape('rect', { x:0, y:0, w:0.07, h:HH, fill:{ color:C.amber }, line:{ color:C.amber, width:0 } });
  slide.addText(title, { x:ML, y:0, w:CW, h:HH, fontFace:F, fontSize:21, bold:true, color:C.white, valign:'middle' });
}

/** Amber footer bar with company tag + slide number */
function ftr(slide, num) {
  slide.addShape('rect', { x:0, y:FY, w:W, h:FH, fill:{ color:C.amber }, line:{ color:C.amber, width:0 } });
  slide.addText('Skillora  ·  Skillora Ltd.  ·  eduskill.ng  ·  Confidential',
    { x:ML, y:FY, w:8.6, h:FH, fontFace:F, fontSize:6.5, color:C.ink, valign:'middle' });
  slide.addText(String(num),
    { x:9.55, y:FY, w:0.3, h:FH, fontFace:F, fontSize:7, bold:true, color:C.ink, align:'right', valign:'middle' });
}

/** Filled rectangle shape */
function rect(slide, x, y, w, h, fill, line) {
  slide.addShape('rect', { x, y, w, h, fill:{ color: fill || C.white }, line:{ color: line || fill || C.greyLine, width:1 } });
}

/** Bordered rectangle with visible outline */
function card(slide, x, y, w, h, bg, border) {
  slide.addShape('rect', { x, y, w, h, fill:{ color: bg || C.white }, line:{ color: border || C.greyLine, width:1 } });
}

/** Simple text box */
function txt(slide, text, x, y, w, h, opts) {
  slide.addText(text, { x, y, w, h, fontFace:F, color:C.ink, ...(opts || {}) });
}

// ─────────────────────────────────────────────────────────────────
//  SLIDE 1 — COVER
// ─────────────────────────────────────────────────────────────────
(function coverSlide() {
  const s = pres.addSlide();

  // Dark-blue background
  s.addShape('rect', { x:0, y:0, w:W, h:H, fill:{ color:C.blueDark }, line:{ color:C.blueDark, width:0 } });
  // Amber right panel
  s.addShape('rect', { x:6.8, y:0, w:3.2, h:H, fill:{ color:C.amber }, line:{ color:C.amber, width:0 } });
  // Thin blue separator stripe
  s.addShape('rect', { x:6.65, y:0, w:0.15, h:H, fill:{ color:C.blue }, line:{ color:C.blue, width:0 } });

  // Graduation emoji
  txt(s, '🎓', 0.3, 0.3, 1.4, 1.4, { fontSize:62, align:'center', valign:'middle' });

  // Brand name
  txt(s, 'Skillora', ML, 0.45, 6.0, 1.1, { fontSize:54, bold:true, color:C.white, valign:'middle' });

  // Amber divider
  s.addShape('rect', { x:ML, y:1.62, w:4.6, h:0.055, fill:{ color:C.amber }, line:{ color:C.amber, width:0 } });

  // Sub-brand
  txt(s, 'Skillora Ltd.', ML, 1.72, 6.0, 0.44, { fontSize:17, color:C.amber, bold:true });

  // Tagline
  txt(s, 'Empowering Every Nigerian\nLearner and Teacher', ML, 2.25, 5.8, 0.9, { fontSize:14.5, color:'C8DCF0', lineSpacingMultiple:1.4 });

  // Amber panel content
  txt(s, '2025  SEED ROUND', 6.95, 1.1, 2.85, 0.42, { fontSize:14, bold:true, color:C.blueDark, align:'center' });
  txt(s, '$300,000', 6.95, 1.6, 2.85, 0.7, { fontSize:28, bold:true, color:C.blueDark, align:'center' });
  txt(s, 'USD', 6.95, 2.2, 2.85, 0.3, { fontSize:13, color:C.blueDark, align:'center' });
  s.addShape('rect', { x:7.1, y:2.6, w:2.6, h:0.04, fill:{ color:C.blueDark }, line:{ color:C.blueDark, width:0 } });
  txt(s, 'eduskill.ng', 6.95, 2.7, 2.85, 0.38, { fontSize:13, bold:true, color:C.blueDark, align:'center' });
  txt(s, 'contact@eduskill.ng', 6.95, 3.12, 2.85, 0.32, { fontSize:11, color:C.blueDark, align:'center' });

  // Bottom note
  txt(s, 'May 2025  ·  Confidential — Not for Distribution', ML, 5.15, 5.5, 0.3, { fontSize:9, color:'8899AA' });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 2 — THE PROBLEM
// ─────────────────────────────────────────────────────────────────
(function problemSlide() {
  const s = pres.addSlide();
  hdr(s, 'The Problem — Three Critical Gaps in Nigerian Education');
  ftr(s, 2);

  const BY = CY + 0.05;
  const BH = FY - BY - 0.32;
  const BW = (CW - 0.3) / 3;

  const gaps = [
    {
      n:'GAP 1', title:'UNEMPLOYABLE\nYOUTH',
      stat:'53%', desc:'of Nigerian graduates\ncannot find relevant\nemployment',
      src:'Source: NBS 2024',
      note:'They need job-ready\nvocational skills',
      bg:C.redLight, bc:C.red, tc:C.red,
    },
    {
      n:'GAP 2', title:'UNDERTRAINED\nTEACHERS',
      stat:'42%', desc:'of teachers hold a\ncurrent CPD certificate;\nrenewal is mandatory',
      src:'Source: TRCN 2023',
      note:'They need accessible,\naccredited CPD',
      bg:C.amberLight, bc:C.amberDark, tc:C.amberDark,
    },
    {
      n:'GAP 3', title:'UNEQUIPPED\nSCHOOLS',
      stat:'<5%', desc:'of public school teachers\nuse AI-powered lesson\nplanning tools',
      src:'Source: FME Survey 2024',
      note:'They need AI tools\nbuilt for Nigeria',
      bg:C.blueLight, bc:C.blue, tc:C.blue,
    },
  ];

  gaps.forEach((g, i) => {
    const bx = ML + i * (BW + 0.15);
    card(s, bx, BY, BW, BH, g.bg, g.bc);
    // Top accent
    s.addShape('rect', { x:bx, y:BY, w:BW, h:0.05, fill:{ color:g.bc }, line:{ color:g.bc, width:0 } });
    txt(s, g.n,    bx+0.15, BY+0.12, BW-0.3, 0.28, { fontSize:9.5, bold:true, color:g.tc });
    txt(s, g.title, bx+0.15, BY+0.42, BW-0.3, 0.68, { fontSize:15.5, bold:true, color:g.tc, lineSpacingMultiple:1.1 });
    s.addShape('rect', { x:bx+0.1, y:BY+1.18, w:BW-0.2, h:0.03, fill:{ color:g.bc }, line:{ color:g.bc, width:0 } });
    txt(s, g.stat, bx+0.1, BY+1.25, BW-0.2, 0.68, { fontSize:38, bold:true, color:g.tc, align:'center' });
    txt(s, g.desc, bx+0.1, BY+1.98, BW-0.2, 0.72, { fontSize:10, color:C.inkMid, align:'center', lineSpacingMultiple:1.25 });
    txt(s, g.src,  bx+0.1, BY+2.75, BW-0.2, 0.28, { fontSize:8, color:C.inkLight, align:'center', italic:true });
    s.addShape('rect', { x:bx+0.1, y:BY+3.1, w:BW-0.2, h:0.03, fill:{ color:g.bc }, line:{ color:g.bc, width:0 } });
    txt(s, '→  '+g.note, bx+0.1, BY+3.18, BW-0.2, 0.58, { fontSize:9.5, color:g.tc, bold:true, lineSpacingMultiple:1.2 });
  });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 3 — MARKET OPPORTUNITY
// ─────────────────────────────────────────────────────────────────
(function marketSlide() {
  const s = pres.addSlide();
  hdr(s, 'Market Opportunity — A Market Too Large to Ignore');
  ftr(s, 3);

  // Big number callouts
  const metW = (CW - 0.4) / 3;
  const mets = [
    { val:'54M',   lbl:'Nigerian Youth\n(ages 15–35)',          c:C.blue,     bg:C.blueLight },
    { val:'1.2M',  lbl:'Registered TRCN\nTeachers',            c:C.amberDark, bg:C.amberLight },
    { val:'$6.4B', lbl:'African EdTech\nMarket by 2030',       c:C.green,    bg:C.greenLight },
  ];
  mets.forEach((m, i) => {
    const bx = ML + i * (metW + 0.2);
    card(s, bx, CY, metW, 1.42, m.bg, m.c);
    txt(s, m.val, bx, CY+0.08, metW, 0.78, { fontSize:38, bold:true, color:m.c, align:'center' });
    txt(s, m.lbl, bx, CY+0.9,  metW, 0.5,  { fontSize:10.5, color:C.inkMid, align:'center', lineSpacingMultiple:1.2 });
  });

  // Market sizing table
  txt(s, 'Market Sizing (Nigeria)',   ML, CY+1.56, 4.5, 0.36, { fontSize:12.5, bold:true });
  txt(s, 'HolonIQ · NBS · TRCN data', 6.5, CY+1.56, 2.7, 0.36, { fontSize:9.5, color:C.inkMid, italic:true, align:'right' });

  const tRows = [
    [
      { text:'Market Segment',           options:{ bold:true, fill:{ color:C.blue  }, color:C.white, valign:'middle' } },
      { text:'Value',                    options:{ bold:true, fill:{ color:C.blue  }, color:C.white, align:'center', valign:'middle' } },
      { text:'Components',               options:{ bold:true, fill:{ color:C.blue  }, color:C.white, valign:'middle' } },
    ],
    [ 'Total Addressable Market (TAM)',
      { text:'₦180B+', options:{ bold:true, color:C.blue, align:'center' } },
      'Youth Skills + Teacher CPD + Institutional' ],
    [ 'Serviceable Addressable Market (SAM)',
      { text:'₦28B',  options:{ bold:true, color:C.amberDark, align:'center' } },
      'Online-first, Nigeria, English-medium' ],
    [ 'Initial Target Market (SOM — 36 months)',
      { text:'₦2.1B', options:{ bold:true, color:C.green, align:'center' } },
      '0.004% penetration of addressable segments' ],
  ];
  s.addTable(tRows, { x:ML, y:CY+1.98, w:CW, rowH:0.47,
    fontFace:F, fontSize:10.5, color:C.ink,
    border:{ type:'solid', color:C.greyLine, pt:1 },
    colW:[3.8, 1.5, 3.9] });

  // Nigeria fast facts sidebar
  txt(s, '🇳🇬  Nigeria Fast Facts', 6.3, CY+1.56, 3.3, 0.36, { fontSize:12, bold:true });
  const facts = '• 60% of population under 25\n• 122M internet-connected users\n• TRCN CPD renewal is mandatory\n• ~30% of African EdTech demand';
  txt(s, facts, 6.3, CY+1.98, 3.3, 1.9, { fontSize:11, color:C.inkMid, lineSpacingMultiple:1.35 });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 4 — THE SOLUTION
// ─────────────────────────────────────────────────────────────────
(function solutionSlide() {
  const s = pres.addSlide();
  hdr(s, 'The Solution — One Platform. Two Ecosystems. Unlimited Impact.');
  ftr(s, 4);

  const colW = (CW - 0.25) / 2;
  const colH = FY - CY - 0.12;

  // ── SkillUp (left)
  card(s, ML, CY, colW, colH, C.blueLight, C.blue);
  s.addShape('rect', { x:ML, y:CY, w:colW, h:0.42, fill:{ color:C.blue }, line:{ color:C.blue, width:0 } });
  txt(s, '  SKILLUP  —  For Nigerian Youth', ML, CY, colW, 0.42, { fontSize:12.5, bold:true, color:C.white, valign:'middle' });
  const su = [
    '🎯  6 NERDC-aligned vocational tracks',
    '📱  Mobile-first · works on 2G / 3G',
    '🏆  Quizzes + shareable certificates',
    '👥  Peer community & leaderboards',
    '💼  Job board integration (Q3 2025)',
    '📅  4–8 weeks self-paced per course',
  ];
  su.forEach((item, i) => txt(s, item, ML+0.2, CY+0.52+i*0.61, colW-0.35, 0.55, { fontSize:11, color:C.inkMid, valign:'middle' }));

  // ── EduPro (right)
  const RX = ML + colW + 0.25;
  card(s, RX, CY, colW, colH, C.amberLight, C.amberDark);
  s.addShape('rect', { x:RX, y:CY, w:colW, h:0.42, fill:{ color:C.amberDark }, line:{ color:C.amberDark, width:0 } });
  txt(s, '  EDUPRO  —  For Teachers', RX, CY, colW, 0.42, { fontSize:12.5, bold:true, color:C.white, valign:'middle' });
  const ep = [
    '📚  4 TRCN-accredited CPD courses',
    '🤖  AI-powered Lesson Planner',
    '📄  DOCX + PDF export after planning',
    '🎓  CPD certificates with TRCN ID',
    '📊  Teacher dashboard & analytics',
    '✅  3–4 weeks self-paced per module',
  ];
  ep.forEach((item, i) => txt(s, item, RX+0.2, CY+0.52+i*0.61, colW-0.35, 0.55, { fontSize:11, color:C.inkMid, valign:'middle' }));

  // Centre vs badge
  txt(s, 'vs', (W-0.35)/2, CY+1.9, 0.35, 0.5, { fontSize:14, bold:true, color:C.inkLight, align:'center' });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 5 — AI LESSON PLANNER (PRODUCT DEEP DIVE)
// ─────────────────────────────────────────────────────────────────
(function productSlide() {
  const s = pres.addSlide();
  hdr(s, 'Product Deep Dive — AI Lesson Planner (EduPro Flagship Feature)');
  ftr(s, 5);

  txt(s, 'What the AI Generates in One Click:', ML, CY, 4.5, 0.35, { fontSize:12.5, bold:true });

  const outputs = [
    ['1','Lesson Title & Objectives',    'NERDC-curriculum matched'],
    ['2','Definition & Key Terms',        'Age-appropriate language'],
    ['3','Detailed Explanation',          '4-paragraph breakdown'],
    ['4','Worked Examples',               '4 real-world examples'],
    ['5','Daily Life Applications',       'Nigeria-context scenarios'],
    ['6','Starter & Main Activities',     'Timed, interactive tasks'],
    ['7','Class Work — 5 Questions',      'With marks + model answers'],
    ['8','Assessment Criteria',           'Differentiated for ability'],
  ];
  outputs.forEach((row, i) => {
    const ry = CY+0.45+i*0.47;
    s.addShape('rect', { x:ML, y:ry+0.04, w:0.3, h:0.3, fill:{ color:C.blue }, line:{ color:C.blue, width:0 } });
    txt(s, row[0], ML, ry+0.04, 0.3, 0.3, { fontSize:11, bold:true, color:C.white, align:'center', valign:'middle' });
    txt(s, row[1], ML+0.38, ry,       2.3, 0.28, { fontSize:11, bold:true });
    txt(s, row[2], ML+0.38, ry+0.22, 2.3, 0.22, { fontSize:9.5, color:C.inkMid, italic:true });
  });

  // Right: export box
  const RX = 4.9;
  card(s, RX, CY, 4.7, 1.75, C.blueLight, C.blue);
  txt(s, '📥  Export Options', RX+0.2, CY+0.1, 4.3, 0.35, { fontSize:12, bold:true, color:C.blue });
  txt(s,
    '• Download as Microsoft Word (.docx)\n• Save as PDF via browser print dialog\n• Auto-populates school letterhead\n• Share via link (coming Q3 2025)',
    RX+0.2, CY+0.5, 4.3, 1.1, { fontSize:11, color:C.inkMid, lineSpacingMultiple:1.3 });

  // Right: teacher benefits box
  card(s, RX, CY+1.85, 4.7, FY-CY-1.97, C.greenLight, C.green);
  txt(s, '⚡  Why Teachers Love It', RX+0.2, CY+1.95, 4.3, 0.35, { fontSize:12, bold:true, color:C.green });
  txt(s,
    '• Saves 3–5 hours of planning per week\n• Aligned to NERDC curriculum framework\n• Works for all subjects & class levels\n• First AI lesson planner built for Nigeria\n• 74% lesson completion rate (beta users)\n• Teacher NPS Score: +61',
    RX+0.2, CY+2.38, 4.3, 1.85, { fontSize:11, color:C.inkMid, lineSpacingMultiple:1.28 });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 6 — TECHNOLOGY STACK
// ─────────────────────────────────────────────────────────────────
(function techSlide() {
  const s = pres.addSlide();
  hdr(s, 'Technology — Built to Scale Across Africa');
  ftr(s, 6);

  const colW = (CW - 0.4) / 3;
  const cols = [
    { title:'🖥  Frontend',        c:C.blue,     bg:C.blueLight,
      items:['Next.js 14 (App Router)','TypeScript','Tailwind CSS','React 18','Framer Motion','React Native (mobile)'] },
    { title:'⚙️  Backend',         c:C.amberDark, bg:C.amberLight,
      items:['Node.js 20 LTS','Supabase (PostgreSQL)','REST API + tRPC','Docker / CI-CD','Paystack Payments','JWT Auth + RBAC'] },
    { title:'🤖  AI & Infrastructure', c:C.green, bg:C.greenLight,
      items:['Claude (Anthropic AI)','Vercel Edge Network','AWS S3 (media)','WhatsApp Bot (WIP)','PDF / DOCX generation','Nigerian CDN proxy'] },
  ];

  const colH = FY - CY - 0.55;
  cols.forEach((col, i) => {
    const bx = ML + i * (colW + 0.2);
    card(s, bx, CY, colW, colH, col.bg, col.c);
    s.addShape('rect', { x:bx, y:CY, w:colW, h:0.44, fill:{ color:col.c }, line:{ color:col.c, width:0 } });
    txt(s, col.title, bx, CY, colW, 0.44, { fontSize:12.5, bold:true, color:C.white, align:'center', valign:'middle' });
    col.items.forEach((item, j) =>
      txt(s, '• '+item, bx+0.15, CY+0.55+j*0.58, colW-0.25, 0.52, { fontSize:11, color:C.inkMid, valign:'middle' }));
  });

  // Compliance badges bar
  const badgeY = FY - 0.42;
  s.addShape('rect', { x:ML, y:badgeY, w:CW, h:0.3, fill:{ color:C.blueLight }, line:{ color:C.blue, width:1 } });
  txt(s, '✓ WCAG 2.1 AA     ✓ Works on 2G/3G     ✓ PWA Offline-Capable     ✓ NDPR Compliant     ✓ <2s Load on Android',
    ML+0.2, badgeY, CW-0.3, 0.3, { fontSize:9.5, bold:true, color:C.blue, align:'center', valign:'middle' });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 7 — TRACTION
// ─────────────────────────────────────────────────────────────────
(function tractionSlide() {
  const s = pres.addSlide();
  hdr(s, 'Traction — Early Signals of Product-Market Fit');
  ftr(s, 7);

  // Metric callouts
  const mW = (CW - 0.4) / 3;
  const mets = [
    { val:'74%',  lbl:'Lesson\nCompletion Rate',          c:C.green,    bg:C.greenLight },
    { val:'+61',  lbl:'NPS Score\n(Beta Users)',           c:C.blue,     bg:C.blueLight },
    { val:'68%',  lbl:'Teachers with\n≥3 Plans / Week',   c:C.amberDark, bg:C.amberLight },
  ];
  mets.forEach((m, i) => {
    const bx = ML + i * (mW + 0.2);
    card(s, bx, CY, mW, 1.35, m.bg, m.c);
    txt(s, m.val, bx, CY+0.06, mW, 0.78, { fontSize:38, bold:true, color:m.c, align:'center' });
    txt(s, m.lbl, bx, CY+0.88, mW, 0.45, { fontSize:10.5, color:C.inkMid, align:'center', lineSpacingMultiple:1.2 });
  });

  // Milestones table
  txt(s, 'Platform Milestones (as of Q2 2025)', ML, CY+1.5, 5.5, 0.36, { fontSize:12.5, bold:true });

  const rows = [
    [
      { text:'Milestone', options:{ bold:true, fill:{ color:C.blue }, color:C.white, valign:'middle' } },
      { text:'Status',    options:{ bold:true, fill:{ color:C.blue }, color:C.white, align:'center', valign:'middle' } },
      { text:'Notes',     options:{ bold:true, fill:{ color:C.blue }, color:C.white, valign:'middle' } },
    ],
    [ 'Platform live at eduskill.ng',          { text:'✓  LIVE',    options:{ color:C.green, bold:true, align:'center' } }, 'Next.js 14 · Vercel' ],
    [ 'AI Lesson Planner',                     { text:'✓  LIVE',    options:{ color:C.green, bold:true, align:'center' } }, 'Claude AI · DOCX + PDF export' ],
    [ 'CPD Courses — 4 modules, 36 lessons',   { text:'✓  LIVE',    options:{ color:C.green, bold:true, align:'center' } }, 'TRCN-aligned content' ],
    [ 'SkillUp Vocational Tracks — 6 courses', { text:'✓  LIVE',    options:{ color:C.green, bold:true, align:'center' } }, 'NERDC-aligned' ],
    [ 'TRCN formal accreditation',             { text:'📋 PENDING', options:{ color:C.amberDark, bold:true, align:'center' } }, 'Application in progress' ],
    [ 'WhatsApp AI Lesson Bot',                { text:'🛠 IN DEV',  options:{ color:C.blue, bold:true, align:'center' } }, 'Q3 2025 target' ],
  ];
  s.addTable(rows, { x:ML, y:CY+1.9, w:CW, rowH:0.4,
    fontFace:F, fontSize:10.5, color:C.ink,
    border:{ type:'solid', color:C.greyLine, pt:1 },
    colW:[3.8, 1.5, 3.9] });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 8 — BUSINESS MODEL
// ─────────────────────────────────────────────────────────────────
(function bizModelSlide() {
  const s = pres.addSlide();
  hdr(s, 'Business Model — Three Revenue Streams, Diversified & Scalable');
  ftr(s, 8);

  const colW = (CW - 0.4) / 3;
  const colH = FY - CY - 0.55;

  const streams = [
    { n:'01', title:'SUBSCRIPTIONS', c:C.blue, bg:C.blueLight,
      items:['SkillUp Learner:  ₦2,500/mo  |  ₦22,000/yr','EduPro Teacher:  ₦3,000/mo  |  ₦28,000/yr','School Bundle:  ₦150,000/yr (50 teachers)'],
      kpis:['Target: 12,000 subs by Yr 2','Avg. rev/user: ₦26,000/yr'] },
    { n:'02', title:'INSTITUTIONAL LICENCES', c:C.amberDark, bg:C.amberLight,
      items:['State Ministries of Education:  ₦2M–₦15M/yr','NGO / Development Partners:  Custom','Corporate CSR Training:  Project-based'],
      kpis:['High ACV long-term contracts','Unlocks large scale quickly'] },
    { n:'03', title:'PREMIUM SERVICES', c:C.green, bg:C.greenLight,
      items:['Verified Certificate (QR+seal):  ₦1,500/cert','AI Lesson Plan Credits:  ₦200/plan','Job Placement Fee:  8% first salary'],
      kpis:['Zero marginal cost to serve','Scales with user volume'] },
  ];

  streams.forEach((st, i) => {
    const bx = ML + i * (colW + 0.2);
    card(s, bx, CY, colW, colH, st.bg, st.c);
    s.addShape('rect', { x:bx, y:CY, w:colW, h:0.72, fill:{ color:st.c }, line:{ color:st.c, width:0 } });
    txt(s, st.n, bx+0.15, CY+0.05, colW-0.3, 0.3, { fontSize:11, bold:true, color:'FFFFFF66' });
    txt(s, st.title, bx, CY+0.3, colW, 0.35, { fontSize:11.5, bold:true, color:C.white, align:'center', valign:'middle' });
    st.items.forEach((item, j) =>
      txt(s, '• '+item, bx+0.15, CY+0.83+j*0.66, colW-0.25, 0.6, { fontSize:10, color:C.inkMid, lineSpacingMultiple:1.2 }));
    s.addShape('rect', { x:bx+0.1, y:FY-0.68, w:colW-0.2, h:0.03, fill:{ color:st.c }, line:{ color:st.c, width:0 } });
    st.kpis.forEach((kpi, j) =>
      txt(s, '↗  '+kpi, bx+0.12, FY-0.62+j*0.24, colW-0.25, 0.22, { fontSize:8.5, color:st.c, bold:true }));
  });

  // Unit economics strip
  const ueY = FY - 0.3;
  const ues = [
    { l:'CAC (blended)', v:'₦3,200' },
    { l:'LTV (12-month)', v:'₦28,000' },
    { l:'LTV : CAC', v:'8.75×' },
    { l:'Gross Margin', v:'72%' },
  ];
  ues.forEach((ue, i) => {
    txt(s, ue.l+': ', ML+i*2.35, ueY, 1.5, 0.27, { fontSize:9.5, color:C.inkMid });
    txt(s, ue.v,      ML+i*2.35+1.35, ueY, 0.85, 0.27, { fontSize:9.5, bold:true, color:C.blue });
  });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 9 — GO-TO-MARKET
// ─────────────────────────────────────────────────────────────────
(function gtmSlide() {
  const s = pres.addSlide();
  hdr(s, 'Go-to-Market Strategy — Community-Led Growth in 3 Phases');
  ftr(s, 9);

  const colW = (CW - 0.4) / 3;
  const colH = FY - CY - 0.12;

  const phases = [
    { n:'1', period:'Months 1–6',    title:'TEACHER-FIRST', c:C.blue, bg:C.blueLight, goal:'5,000 active teachers',
      tactics:['Partner with TRCN state chapters','Bulk CPD enrolment deals','Free Lesson Planner (freemium hook)','WhatsApp teacher communities','50,000+ member reach on Day 1'] },
    { n:'2', period:'Months 7–12',   title:'SCHOOL BUNDLES', c:C.amberDark, bg:C.amberLight, goal:'200 schools enrolled',
      tactics:['Teacher users → pitch their principals','₦150K/yr affordable school bundle','Pilot: 50 private schools','Lagos · Abuja · Kano markets','Referral incentive programme'] },
    { n:'3', period:'Months 13–24',  title:'GOVERNMENT & NGOs', c:C.green, bg:C.greenLight, goal:'2 state contracts · 3 NGO deals',
      tactics:['State government EdTech contracts','USAID / UNICEF / UK FCDO pilots','Expand to Ghana & Kenya','Enterprise procurement BD team','Impact reporting for donors'] },
  ];

  phases.forEach((ph, i) => {
    const bx = ML + i * (colW + 0.2);
    card(s, bx, CY, colW, colH, ph.bg, ph.c);
    s.addShape('rect', { x:bx, y:CY, w:colW, h:0.8, fill:{ color:ph.c }, line:{ color:ph.c, width:0 } });
    txt(s, 'Phase '+ph.n, bx+0.15, CY+0.05, colW-0.3, 0.28, { fontSize:11, bold:true, color:'FFFFFF88' });
    txt(s, ph.title, bx, CY+0.3, colW, 0.36, { fontSize:12, bold:true, color:C.white, align:'center', valign:'middle' });
    txt(s, ph.period, bx, CY+0.64, colW, 0.2, { fontSize:9.5, color:'FFFFFF', align:'center', italic:true });
    ph.tactics.forEach((tac, j) =>
      txt(s, '• '+tac, bx+0.15, CY+0.92+j*0.58, colW-0.25, 0.52, { fontSize:10.5, color:C.inkMid, lineSpacingMultiple:1.15 }));
    // Goal badge
    s.addShape('rect', { x:bx+0.1, y:FY-0.52, w:colW-0.2, h:0.35, fill:{ color:ph.c }, line:{ color:ph.c, width:0 } });
    txt(s, '🎯  '+ph.goal, bx+0.1, FY-0.52, colW-0.2, 0.35, { fontSize:9, bold:true, color:C.white, align:'center', valign:'middle' });
  });

  // Arrow connectors
  txt(s, '→', ML+colW,       CY+0.32, 0.2, 0.4, { fontSize:18, bold:true, color:C.inkLight, align:'center' });
  txt(s, '→', ML+2*(colW)+0.2, CY+0.32, 0.2, 0.4, { fontSize:18, bold:true, color:C.inkLight, align:'center' });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 10 — COMPETITIVE LANDSCAPE
// ─────────────────────────────────────────────────────────────────
(function competitionSlide() {
  const s = pres.addSlide();
  hdr(s, 'Competitive Landscape — Why Skillora Wins');
  ftr(s, 10);

  // Moat callout
  card(s, ML, CY, CW, 0.42, C.blueLight, C.blue);
  txt(s, '🏆  Our Moat:', ML+0.15, CY, 1.5, 0.42, { fontSize:11.5, bold:true, color:C.blue, valign:'middle' });
  txt(s, 'Deep NERDC/TRCN curriculum alignment + AI tools built specifically for Nigerian classroom reality',
    ML+1.5, CY, CW-1.55, 0.42, { fontSize:11, color:C.blue, italic:true, valign:'middle' });

  const Y = (t) => ({ text:t, options:{ bold:true, color:C.green, align:'center', valign:'middle', fontSize:15 } });
  const N = (t) => ({ text:t, options:{ bold:true, color:C.red,   align:'center', valign:'middle', fontSize:15 } });
  const P = (t) => ({ text:t, options:{ bold:true, color:C.amberDark, align:'center', valign:'middle', fontSize:13 } });
  const HL = (t) => ({ text:t, options:{ bold:true, fill:{ color:C.blueLight }, color:C.blue, align:'center', valign:'middle', fontSize:15 } });
  const fC = (t) => ({ text:t, options:{ bold:true, color:C.ink, valign:'middle', fontSize:10.5 } });
  const hC = (t) => ({ text:t, options:{ bold:true, fill:{ color:C.blue }, color:C.white, align:'center', valign:'middle', fontSize:11 } });

  const rows = [
    [ fC('Feature'),                hC('Skillora'), hC('Coursera / Udemy'), hC('uLesson'), hC('Jobberman') ],
    [ 'Nigeria-specific content',   HL('  ✓  '), N('  ✗  '), P('  ~  '), N('  ✗  ') ],
    [ 'Teacher CPD / TRCN aligned', HL('  ✓  '), N('  ✗  '), N('  ✗  '), N('  ✗  ') ],
    [ 'AI Lesson Planner',          HL('  ✓  '), N('  ✗  '), N('  ✗  '), N('  ✗  ') ],
    [ 'Works on 2G / 3G',           HL('  ✓  '), N('  ✗  '), Y('  ✓  '), Y('  ✓  ') ],
    [ 'DOCX / PDF export',          HL('  ✓  '), N('  ✗  '), N('  ✗  '), N('  ✗  ') ],
    [ 'Affordable (₦-priced)',       HL('  ✓  '), N('  ✗  '), Y('  ✓  '), Y('  ✓  ') ],
    [ 'Serves both youth & teachers',HL('  ✓  '), N('  ✗  '), N('  ✗  '), N('  ✗  ') ],
  ];
  s.addTable(rows, { x:ML, y:CY+0.53, w:CW, rowH:0.41,
    fontFace:F, fontSize:10.5, color:C.ink,
    border:{ type:'solid', color:C.greyLine, pt:1 },
    colW:[3.4, 1.45, 1.65, 1.35, 1.35] });

  txt(s, '✓ = Yes     ✗ = No     ~ = Partial', ML, FY-0.3, 3.5, 0.25, { fontSize:9, color:C.inkMid, italic:true });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 11 — TEAM
// ─────────────────────────────────────────────────────────────────
(function teamSlide() {
  const s = pres.addSlide();
  hdr(s, 'The Team — Built by Nigerians, For Nigeria');
  ftr(s, 11);

  txt(s, '* Update with team names, photos, and LinkedIn URLs before pitching',
    ML, CY, CW, 0.3, { fontSize:9.5, color:C.inkLight, italic:true });

  const members = [
    { role:'FOUNDER & CEO',      bg:C.blueLight,   bc:C.blue,     icon:'👤',
      desc:'Background in education\npolicy and EdTech.\nDrives product vision\nand partnerships.' },
    { role:'CTO / CO-FOUNDER',   bg:C.amberLight,  bc:C.amberDark, icon:'💻',
      desc:'Full-stack engineer,\nNext.js & AI / ML.\nBuilt Skillora\nfrom 0 → 1.' },
    { role:'HEAD OF CURRICULUM', bg:C.greenLight,  bc:C.green,    icon:'📚',
      desc:'Ex-NERDC curriculum\ndeveloper, TRCN trainer.\nDesigned all 4\nCPD modules.' },
    { role:'HEAD OF GROWTH',     bg:C.purpleLight, bc:C.purple,   icon:'📈',
      desc:'EdTech marketing &\ncommunity building.\n50K+ teacher\ncommunity reach.' },
  ];

  const colW = (CW - 0.3) / 4;
  const colH = FY - CY - 0.65;
  members.forEach((m, i) => {
    const bx = ML + i * (colW + 0.1);
    card(s, bx, CY+0.38, colW, colH, m.bg, m.bc);
    s.addShape('rect', { x:bx, y:CY+0.38, w:colW, h:0.38, fill:{ color:m.bc }, line:{ color:m.bc, width:0 } });
    txt(s, m.role, bx, CY+0.38, colW, 0.38, { fontSize:8.5, bold:true, color:C.white, align:'center', valign:'middle' });
    txt(s, m.icon, bx, CY+0.82, colW, 0.85, { fontSize:42, align:'center', valign:'middle' });
    // Name placeholder box
    s.addShape('rect', { x:bx+0.12, y:CY+1.72, w:colW-0.24, h:0.28, fill:{ color:'EEEEEE' }, line:{ color:'CCCCCC', width:1 } });
    txt(s, '[Full Name]', bx+0.12, CY+1.72, colW-0.24, 0.28, { fontSize:9.5, bold:true, color:C.inkMid, align:'center', valign:'middle' });
    txt(s, m.desc, bx+0.1, CY+2.07, colW-0.2, 1.4, { fontSize:9.5, color:C.inkMid, lineSpacingMultiple:1.25 });
    s.addShape('rect', { x:bx+0.1, y:FY-0.52, w:colW-0.2, h:0.28, fill:{ color:m.bc }, line:{ color:m.bc, width:0 } });
    txt(s, 'LinkedIn →', bx+0.1, FY-0.52, colW-0.2, 0.28, { fontSize:8.5, color:C.white, bold:true, align:'center', valign:'middle' });
  });

  txt(s, 'ADVISORS:', ML, FY-0.6, 1.2, 0.26, { fontSize:9, bold:true, color:C.inkMid });
  txt(s, '[Name] — Former Director, FME  ·  [Name] — Partner, [VC Firm]  ·  [Name] — Executive, TRCN',
    ML+1.2, FY-0.6, 7.9, 0.26, { fontSize:9, color:C.inkMid, italic:true });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 12 — ROADMAP
// ─────────────────────────────────────────────────────────────────
(function roadmapSlide() {
  const s = pres.addSlide();
  hdr(s, 'Product Roadmap — 24-Month Milestones');
  ftr(s, 12);

  // Timeline spine
  const TY = CY + 0.15;
  s.addShape('rect', { x:ML, y:TY+0.38, w:CW, h:0.06, fill:{ color:C.greyLine }, line:{ color:C.greyLine, width:0 } });

  const colW = (CW - 0.3) / 4;
  const phases = [
    { q:'Q2 2025', c:C.blue,
      items:['Launch paid subscriptions\n(Paystack)','WhatsApp AI Lesson Bot','Android mobile app','First 1,000 paying users'] },
    { q:'Q3 2025', c:C.amberDark,
      items:['TRCN accreditation','Video library (200+ hrs)','Corporate training vertical','10,000 users milestone'] },
    { q:'Q4 2025', c:C.green,
      items:['State government pilot\n(1 state)','₦50M ARR milestone','Series A preparation','Employer dashboard'] },
    { q:'2026', c:C.purple,
      items:['Ghana + Kenya expansion','100,000 registered users','₦200M ARR','B2G: 3 state contracts'] },
  ];

  phases.forEach((ph, i) => {
    const bx = ML + i * (colW + 0.1);
    const cx = bx + colW / 2;

    txt(s, ph.q, bx, TY, colW, 0.3, { fontSize:12.5, bold:true, color:ph.c, align:'center' });

    // Timeline dot
    s.addShape('ellipse', { x:cx-0.16, y:TY+0.26, w:0.32, h:0.32, fill:{ color:ph.c }, line:{ color:ph.c, width:0 } });

    // Content box
    card(s, bx, TY+0.65, colW, FY-TY-0.82, C.grey, ph.c);
    s.addShape('rect', { x:bx, y:TY+0.65, w:colW, h:0.07, fill:{ color:ph.c }, line:{ color:ph.c, width:0 } });

    ph.items.forEach((item, j) => {
      s.addShape('ellipse', { x:bx+0.13, y:TY+0.87+j*0.94+0.07, w:0.27, h:0.27, fill:{ color:ph.c }, line:{ color:ph.c, width:0 } });
      txt(s, String(j+1), bx+0.13, TY+0.87+j*0.94+0.07, 0.27, 0.27, { fontSize:9, bold:true, color:C.white, align:'center', valign:'middle' });
      txt(s, item, bx+0.48, TY+0.85+j*0.94, colW-0.55, 0.88, { fontSize:10, color:C.inkMid, lineSpacingMultiple:1.2, valign:'middle' });
    });
  });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 13 — FINANCIAL PROJECTIONS
// ─────────────────────────────────────────────────────────────────
(function financialsSlide() {
  const s = pres.addSlide();
  hdr(s, 'Financial Projections — Conservative 3-Year Model');
  ftr(s, 13);

  txt(s, '* Conservative model — no government contract revenue in Year 1. Based on 0.004% market penetration.',
    ML, CY, CW, 0.28, { fontSize:8.5, color:C.inkMid, italic:true });

  const hC = (t, c) => ({ text:t, options:{ bold:true, fill:{ color: c||C.blueDark }, color:C.white, align:'center', valign:'middle' } });
  const fC = (t) => ({ text:t, options:{ bold:true, color:C.ink, valign:'middle' } });
  const vC = (t, c) => ({ text:t, options:{ align:'center', bold:true, color:c||C.ink } });

  const rows = [
    [ fC('Metric'), hC('Year 1  —  2025'), hC('Year 2  —  2026'), hC('Year 3  —  2027') ],
    [ 'Paying Subscribers',         vC('2,000'), vC('12,000',C.blue), vC('45,000',C.blue) ],
    [ 'School Licences',             vC('30'),    vC('150'),           vC('500') ],
    [ 'Avg. Revenue / User (₦)',     vC('25,000'), vC('26,000'),       vC('27,500') ],
    [ fC('Total Revenue (₦)'),
      { text:'₦68M',   options:{ align:'center', bold:true, fill:{ color:C.blueLight  } } },
      { text:'₦380M',  options:{ align:'center', bold:true, fill:{ color:C.blueLight  } } },
      { text:'₦1.35B', options:{ align:'center', bold:true, fill:{ color:C.blueLight  } } } ],
    [ 'Gross Margin',                vC('68%'), vC('72%'), vC('75%',C.green) ],
    [ fC('EBITDA (₦)'),             vC('– ₦24M',C.red), vC('+ ₦42M',C.green), vC('+ ₦280M',C.green) ],
    [ fC('Cash Flow Positive'),     vC('No',C.red), vC('Q3 Year 2  ✓',C.green), vC('Full Year  ✓',C.green) ],
  ];
  s.addTable(rows, { x:ML, y:CY+0.36, w:CW, rowH:0.44,
    fontFace:F, fontSize:11, color:C.ink,
    border:{ type:'solid', color:C.greyLine, pt:1 },
    colW:[3.2, 2.0, 2.0, 2.0] });

  // Highlight note
  card(s, ML, FY-0.38, CW, 0.3, C.greenLight, C.green);
  txt(s, '✅  18-month runway to cash-flow positive with this raise  ·  LTV:CAC = 8.75×  ·  Gross Margin 72%',
    ML+0.2, FY-0.38, CW-0.25, 0.3, { fontSize:10, bold:true, color:C.green, valign:'middle' });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 14 — THE ASK
// ─────────────────────────────────────────────────────────────────
(function askSlide() {
  const s = pres.addSlide();
  hdr(s, 'The Ask — Seed Round: $300,000 USD  (≈ ₦480M)');
  ftr(s, 14);

  // ── Left: Use of Funds ──
  txt(s, 'Use of Funds', ML, CY, 4.8, 0.36, { fontSize:13, bold:true });

  const funds = [
    { pct:40, label:'Product & Engineering',  desc:'Mobile app · Video platform · AI fine-tuning',     c:C.blue,     bg:C.blueLight },
    { pct:25, label:'Sales & Marketing',       desc:'Teacher communities · School outreach · BD team',   c:C.amberDark, bg:C.amberLight },
    { pct:20, label:'Content Production',      desc:'200+ video lessons · TRCN accreditation process',   c:C.green,    bg:C.greenLight },
    { pct:10, label:'Operations',              desc:'Legal · Finance · NDPR compliance',                  c:C.purple,   bg:C.purpleLight },
    { pct:5,  label:'Reserve',                 desc:'Contingency',                                        c:'888888',   bg:C.grey },
  ];

  const barMaxW = 4.0;
  funds.forEach((f, i) => {
    const fy2 = CY + 0.45 + i * 0.75;
    txt(s, f.label, ML, fy2, 3.5, 0.26, { fontSize:11, bold:true });
    // Bar track
    s.addShape('rect', { x:ML, y:fy2+0.28, w:barMaxW, h:0.26, fill:{ color:f.bg }, line:{ color:f.c, width:1 } });
    // Bar fill
    const fillW = f.pct / 100 * barMaxW;
    s.addShape('rect', { x:ML, y:fy2+0.28, w:fillW, h:0.26, fill:{ color:f.c }, line:{ color:f.c, width:0 } });
    // Percentage label
    txt(s, f.pct+'%', ML+fillW+0.1, fy2+0.28, 0.55, 0.26, { fontSize:11, bold:true, color:f.c, valign:'middle' });
    txt(s, f.desc, ML+0.05, fy2+0.56, 3.4, 0.2, { fontSize:8.5, color:C.inkMid, italic:true });
  });

  // ── Right: Deal Terms ──
  const RX = 5.4;
  card(s, RX, CY, 4.2, FY-CY-0.12, C.blueLight, C.blue);
  s.addShape('rect', { x:RX, y:CY, w:4.2, h:0.44, fill:{ color:C.blue }, line:{ color:C.blue, width:0 } });
  txt(s, 'Deal Terms', RX, CY, 4.2, 0.44, { fontSize:14, bold:true, color:C.white, align:'center', valign:'middle' });

  const terms = [
    { l:'Raise Amount',    v:'$300,000 USD' },
    { l:'Pre-Money Val.',  v:'$1.5M' },
    { l:'Instrument',      v:'SAFE Note' },
    { l:'Discount',        v:'20% on next round' },
    { l:'Valuation Cap',   v:'$3,000,000' },
    { l:'Runway',          v:'18 months' },
    { l:'Cash-Flow +ve',   v:'Q3 Year 2' },
  ];
  terms.forEach((t2, i) => {
    const ty = CY + 0.56 + i * 0.53;
    txt(s, t2.l, RX+0.3,  ty, 2.0, 0.45, { fontSize:11, color:C.inkMid, valign:'middle' });
    txt(s, t2.v, RX+2.25, ty, 1.75, 0.45, { fontSize:12, bold:true, color:C.blue, valign:'middle', align:'right' });
    if (i < terms.length-1)
      s.addShape('rect', { x:RX+0.2, y:ty+0.43, w:3.8, h:0.01, fill:{ color:C.greyLine }, line:{ color:C.greyLine, width:0 } });
  });
})();

// ─────────────────────────────────────────────────────────────────
//  SLIDE 15 — CLOSING
// ─────────────────────────────────────────────────────────────────
(function closingSlide() {
  const s = pres.addSlide();

  // Full dark-blue background
  s.addShape('rect', { x:0, y:0, w:W, h:H, fill:{ color:C.blueDark }, line:{ color:C.blueDark, width:0 } });
  // Left amber stripe
  s.addShape('rect', { x:0, y:0, w:0.15, h:H, fill:{ color:C.amber }, line:{ color:C.amber, width:0 } });
  // Amber footer strip
  s.addShape('rect', { x:0, y:FY, w:W, h:FH, fill:{ color:C.amber }, line:{ color:C.amber, width:0 } });

  // Opening quote mark
  txt(s, '"', 0.4, 0.1, 0.9, 1.6, { fontSize:90, color:'FFFFFF22', bold:true });

  // Quote
  txt(s,
    "Nigeria's next economic leap won't be built by oil —\nit will be built by skilled, certified, tech-enabled\nyoung Nigerians and the teachers who believed in them.",
    0.6, 0.5, 8.6, 1.85, { fontSize:18, color:C.white, lineSpacingMultiple:1.45, italic:true });

  // CTA line
  txt(s, 'Skillora is the infrastructure that makes that possible.',
    ML, 2.48, CW, 0.45, { fontSize:15, bold:true, color:C.amber });

  // Divider
  s.addShape('rect', { x:ML, y:3.05, w:CW, h:0.04, fill:{ color:'FFFFFF33' }, line:{ color:'FFFFFF33', width:0 } });

  // Contact grid
  const contacts = [
    { icon:'🌐', label:'Website',  val:'eduskill.ng' },
    { icon:'📧', label:'Email',    val:'contact@eduskill.ng' },
    { icon:'📍', label:'Location', val:'Lagos, Nigeria' },
    { icon:'💼', label:'Investors', val:'eduskill.ng/investors' },
  ];
  contacts.forEach((c, i) => {
    const cx = ML + i * 2.38;
    txt(s, c.icon, cx,      3.18, 0.45, 0.5,  { fontSize:22, align:'center', valign:'middle' });
    txt(s, c.label, cx+0.45, 3.18, 1.78, 0.22, { fontSize:9, color:'AABBCC' });
    txt(s, c.val,   cx+0.45, 3.4,  1.78, 0.3,  { fontSize:11, bold:true, color:C.white });
  });

  // Brand + tagline
  txt(s, '🎓  Skillora', ML, 3.88, CW, 0.65, { fontSize:34, bold:true, color:C.white, align:'center' });
  txt(s, '"Every Nigerian Deserves World-Class Skills"',
    ML, 4.57, CW, 0.38, { fontSize:12.5, color:C.amber, align:'center', italic:true });

  // Footer
  txt(s, 'Skillora  ·  Skillora Ltd.  ·  eduskill.ng  ·  Confidential — Not for Distribution  ·  May 2025',
    ML, FY, W-ML, FH, { fontSize:6.5, color:C.ink, valign:'middle' });
})();

// ─────────────────────────────────────────────────────────────────
//  WRITE OUTPUT FILE
// ─────────────────────────────────────────────────────────────────
const outFile = path.join(__dirname, '..', 'Skillora-PitchDeck-2025.pptx');

console.log('\n⏳  Generating Skillora Pitch Deck (15 slides)…');

pres.writeFile({ fileName: outFile })
  .then(() => {
    console.log('');
    console.log('✅  Pitch deck generated successfully!');
    console.log(`📄  File: ${outFile}`);
    console.log('');
    console.log('📌  Next steps:');
    console.log('    1. Open in Microsoft PowerPoint or Google Slides');
    console.log('    2. Fill in team names, photos, and LinkedIn URLs on Slide 11');
    console.log('    3. Update traction metrics before each pitch');
    console.log('    4. Add your phone number to Slide 15 contacts');
    console.log('');
  })
  .catch((err) => {
    console.error('\n❌  Error generating pitch deck:\n', err);
    process.exit(1);
  });
