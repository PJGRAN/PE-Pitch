/* ══════════════════════════════════════════════════════════════════
   PE DESIGN SYSTEM  —  pe-design-system.js
   Architecture Animation Engine
   ══════════════════════════════════════════════════════════════════
   Baut die 4-phasige Architektur-Animation auf und steuert alle
   GSAP-Animationen. Kann in beliebige Projekte kopiert werden.

   VORAUSSETZUNGEN:
     - GSAP 3.12+ muss VOR dieser Datei geladen sein:
         <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
     - Die Seite muss folgende Element-IDs enthalten:
         #arch-stage   — Bereich, in dem die Phasen gerendert werden
         #arch-pbar    — Fortschrittsbalken-Füllelement
         #arch-plbl    — Phasennamen-Label
         #arch-dots    — Container für die Phasen-Indikatoren

   EINBINDEN:
     <script src="../pe-design-system/pe-design-system.js"></script>

   VERWENDUNG:
     1. initArch()   — einmalig aufrufen, sobald das DOM bereit ist
     2. archStart()  — startet die Animation (z.B. beim Slide-Eingang)
     3. archGoTo(n)  — springt direkt zu Phase n (0-basiert, zyklisch)

   INHALT:
     A. Konfiguration (Verweildauer, Phasennamen)
     B. DOM-Hilfsfunktionen
     C. Phase 1 — Plattform-Überblick (4 Haupt-Layer)
     D. Phase 2 — Layer-Detail (aufgeklappte Sub-Layer)
     E. Phase 3 — Daten-Integration (Quell-Systeme + Datenfluss)
     F. Phase 4 — Multi-Tenant Portfolio (PE-Cockpit + Tenants)
     G. Orchestrierung (archGoTo, archStart, initArch)
   ══════════════════════════════════════════════════════════════════ */


/* ──────────────────────────────────────────────────────────────────
   A. KONFIGURATION
   Verweildauer pro Phase in Millisekunden und Phasennamen.
   Hier anpassen, um Tempo und Beschriftung zu verändern.
   ────────────────────────────────────────────────────────────────── */
const ARCH_DWELL  = [8000, 10400, 12000, 13000];
const ARCH_LABELS = ['Platform Layers', 'Layer Detail', 'Data Migration', 'Multi-Tenant'];


/* ──────────────────────────────────────────────────────────────────
   B. DOM-HILFSFUNKTIONEN
   Kompakte Utilities zum Erstellen von DOM-Elementen.
   ────────────────────────────────────────────────────────────────── */

/* Erstellt ein beliebiges HTML-Element mit optionalem className und innerHTML */
function aEl(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls)              e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

/* Erstellt eine einzelne horizontale Layer-Zeile (.arch-layer)
   id   — Badge-Text links (z.B. "L0", "L2a")
   name — Haupt-Layertitel
   sub  — kleinerer Untertitel (null = kein Untertitel)
   hi   — true für hervorgehobene Akzent-Variante (.arch-layer.hi) */
function aLyr(id, name, sub, hi) {
  const e = aEl('div', 'arch-layer' + (hi ? ' hi' : ''));
  e.innerHTML =
    `<div class="arch-lid">${id}</div>` +
    `<div class="arch-lbody">` +
      `<div class="arch-lname">${name}</div>` +
      (sub ? `<div class="arch-lsub">${sub}</div>` : '') +
    `</div>`;
  return e;
}

/* Wickelt ein Array von Layer-Elementen in einen .arch-stack Container */
function aStk(arr) {
  const s = aEl('div', 'arch-stack');
  arr.forEach(x => s.appendChild(x));
  return s;
}


/* ──────────────────────────────────────────────────────────────────
   C. PHASE 1 — PLATFORM LAYERS
   Four main layers as a clean full-width stack. Layers enter from
   the bottom one by one; subtitles fade in after.
   ────────────────────────────────────────────────────────────────── */
function archP1() {
  const view = aEl('div', 'arch-view');
  const layers = [
    aLyr('L3', 'Surface',                'Boards · workflows · forms · dashboards'),
    aLyr('L2', 'Intelligence & Workflow', 'Claude AI · Temporal.io · automation'),
    aLyr('L1', 'Domain & Semantic',       'Data model · KPIs · business logic'),
    aLyr('L0', 'Database',               'PostgreSQL · Neon · data origin'),
  ];
  const wrap = aEl('div');
  wrap.style.cssText = 'width:100%;max-width:680px;';
  wrap.appendChild(aStk(layers));
  view.appendChild(wrap);
  return { view, animate() {
    const tl = gsap.timeline();
    tl.from([...layers].reverse(), { opacity: 0, y: 22, scale: 0.97, duration: 1.0, stagger: 0.18, ease: 'power3.out' });
    tl.from(layers.map(l => l.querySelector('.arch-lsub')), { opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' }, '-=0.6');
  }};
}


/* ──────────────────────────────────────────────────────────────────
   D. PHASE 2 — LAYER DETAIL
   L2 and L1 each split into two equal side-by-side columns. L3 and
   L0 appear to stay in place from Phase 1, creating a seamless
   "split" transition.
   ────────────────────────────────────────────────────────────────── */
function archP2() {
  const view = aEl('div', 'arch-view');

  const L3  = aLyr('L3',  'Surface',        'Boards · workflows · forms · dashboards');
  const L2a = aLyr('L2a', 'Workflow Engine', 'Temporal.io · process logic · approvals', true);
  const L2b = aLyr('L2b', 'Intelligence',   'Claude AI · LLM interface · reporting',   true);
  const L1a = aLyr('L1a', 'Domain Model',   'Prisma ORM · entities · relations',       true);
  const L1b = aLyr('L1b', 'Semantic Layer', 'KPIs · Cube.dev · AI interface',          true);
  const L0  = aLyr('L0',  'Database',       'PostgreSQL · Neon · data origin');

  /* Creates a horizontal row of two equal-width layers */
  function splitRow(a, b) {
    const row = aEl('div');
    row.style.cssText = 'display:flex;gap:5px;';
    [a, b].forEach(l => { l.style.flex = '1'; row.appendChild(l); });
    return row;
  }

  const wrap = aEl('div');
  wrap.style.cssText = 'width:100%;max-width:680px;display:flex;flex-direction:column;gap:5px;';
  [L3, splitRow(L2a, L2b), splitRow(L1a, L1b), L0].forEach(el => wrap.appendChild(el));

  /* Note explaining the intentional L2 separation */
  const note = aEl('div');
  note.style.cssText = 'font-size:11px;color:var(--muted);font-style:italic;text-align:center;margin-top:7px;';
  note.textContent = 'L2a (deterministic workflow) and L2b (probabilistic AI) are intentionally separate layers.';

  const outerWrap = aEl('div');
  outerWrap.style.cssText = 'width:100%;max-width:680px;display:flex;flex-direction:column;align-items:center;';
  outerWrap.appendChild(wrap); outerWrap.appendChild(note);
  view.appendChild(outerWrap);

  return { view, animate() {
    /* L3 and L0 appear to hold from Phase 1 — no entrance animation needed */
    gsap.set([L3, L0], { opacity: 1, y: 0 });
    const tl = gsap.timeline({ delay: 0.18 });
    /* L2 and L1 split outward from the center of the stack */
    tl.from([L2a, L2b], { opacity: 0, scaleX: 0, transformOrigin: 'center', duration: 0.6, stagger: 0.06, ease: 'back.out(1.2)' });
    tl.from([L1a, L1b], { opacity: 0, scaleX: 0, transformOrigin: 'center', duration: 0.6, stagger: 0.06, ease: 'back.out(1.2)' }, '-=0.35');
    tl.from([L2a, L2b, L1a, L1b].map(l => l.querySelector('.arch-lsub')), { opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, '-=0.15');
    tl.from(note, { opacity: 0, y: 6, duration: 0.4, ease: 'power2.out' }, '-=0.1');
  }};
}


/* ──────────────────────────────────────────────────────────────────
   E. PHASE 3 — DATA MIGRATION
   The platform stack (with its split L2/L1 layout) compresses to the
   left. The migration layer and legacy source systems appear from the
   right. Data flow dots animate bidirectionally along the connection
   lines to show data moving from sources into the platform.
   ────────────────────────────────────────────────────────────────── */
function archP3() {
  const view = aEl('div', 'arch-view');
  const outer = aEl('div');
  outer.style.cssText = 'width:100%;max-width:820px;display:flex;flex-direction:column;align-items:center;gap:8px;';
  const row = aEl('div');
  row.style.cssText = 'display:flex;align-items:stretch;justify-content:center;width:100%;';

  /* Compact stack — same 2-column L2/L1 layout as Phase 2 */
  function splitRow(a, b) {
    const r = aEl('div'); r.style.cssText = 'display:flex;gap:3px;';
    [a, b].forEach(l => { l.style.flex = '1'; r.appendChild(l); }); return r;
  }
  const L3  = aLyr('L3',  'Surface',      null);
  const L2a = aLyr('L2a', 'Workflow',     null, true);
  const L2b = aLyr('L2b', 'Intelligence', null, true);
  const L1a = aLyr('L1a', 'Domain',       null, true);
  const L1b = aLyr('L1b', 'Semantic',     null, true);
  const L0  = aLyr('L0',  'Database',     null, true);
  const stackCol = aEl('div');
  stackCol.style.cssText = 'flex:0 0 175px;display:flex;flex-direction:column;gap:3px;';
  [L3, splitRow(L2a, L2b), splitRow(L1a, L1b), L0].forEach(el => stackCol.appendChild(el));

  /* Flow lane: horizontal line + animated dot per connection point */
  function makeFlowCol(yPositions) {
    const col = aEl('div');
    col.style.cssText = 'flex:0 0 38px;position:relative;align-self:stretch;overflow:visible;';
    const dots = [];
    yPositions.forEach(({ yPct, isReturn }) => {
      const line = aEl('div');
      line.style.cssText = `position:absolute;top:${yPct}%;left:0;right:0;height:1px;background:rgba(0,112,173,${isReturn ? '0.12' : '0.22'});margin-top:-0.5px;`;
      col.appendChild(line);
      const d = aEl('div');
      const sz = isReturn ? 3 : 4, op = isReturn ? 0.45 : 0.82;
      d.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:var(--accent);top:${yPct}%;margin-top:-${sz/2}px;left:50%;margin-left:-${sz/2}px;opacity:${op};`;
      col.appendChild(d);
      dots.push({ d, isReturn });
    });
    return { col, dots };
  }

  /* Left flow connects to L1 (~62%) and L0 (~87%) in the compact stack */
  const flowL = makeFlowCol([
    { yPct: 62, isReturn: false }, { yPct: 87, isReturn: false },
    { yPct: 74, isReturn: false }, { yPct: 68, isReturn: true },
  ]);

  /* Migration box */
  const mig = aEl('div');
  mig.style.cssText = 'flex:0 0 138px;background:rgba(0,112,173,0.06);border:1px solid var(--accent-border);border-radius:10px;overflow:hidden;box-shadow:var(--card-shadow);align-self:center;';
  mig.innerHTML =
    `<div style="padding:6px 11px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--accent);border-bottom:1px solid var(--accent-border);background:rgba(0,112,173,0.04);text-align:center;">Migration</div>` +
    `<div style="padding:5px 11px;font-size:11px;color:var(--muted);border-bottom:1px solid rgba(0,112,173,0.07);">Schema mapping</div>` +
    `<div style="padding:5px 11px;font-size:11px;color:var(--muted);border-bottom:1px solid rgba(0,112,173,0.07);">Data transform</div>` +
    `<div style="padding:5px 11px;font-size:11px;color:var(--muted);border-bottom:1px solid rgba(0,112,173,0.07);">Validation</div>` +
    `<div style="padding:5px 11px;font-size:11px;color:var(--muted);">Cutover tooling</div>`;

  /* Right flow connects to the four source systems */
  const flowR = makeFlowCol([
    { yPct: 17, isReturn: false }, { yPct: 37, isReturn: false },
    { yPct: 57, isReturn: false }, { yPct: 77, isReturn: false },
    { yPct: 27, isReturn: true  }, { yPct: 67, isReturn: true  },
  ]);

  /* Legacy source systems */
  const sources = [], srcCol = aEl('div');
  srcCol.style.cssText = 'flex:0 0 110px;display:flex;flex-direction:column;gap:5px;';
  ['SAP / ERP', 'CRM', 'MES', 'PLM'].forEach(name => {
    const b = aEl('div');
    b.style.cssText = 'background:var(--card);border:1px solid var(--card-border);border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;color:var(--text2);text-align:center;box-shadow:var(--card-shadow);';
    b.textContent = name; srcCol.appendChild(b); sources.push(b);
  });

  const note = aEl('div');
  note.style.cssText = 'font-size:11px;color:var(--muted);font-style:italic;text-align:center;width:100%;';
  note.textContent = 'Temporary onboarding infrastructure — can be shut down after cutover.';

  row.appendChild(stackCol); row.appendChild(flowL.col); row.appendChild(mig);
  row.appendChild(flowR.col); row.appendChild(srcCol);
  outer.appendChild(row); outer.appendChild(note);
  view.appendChild(outer);

  return { view, animate() {
    const tl = gsap.timeline({ delay: 0.2 });
    /* Stack slides in from left — appears to compress from Phase 2 */
    tl.from(stackCol, { opacity: 0, x: -20, duration: 0.55, ease: 'power3.out' });
    /* Migration box and source systems appear from the right */
    tl.from(mig,     { opacity: 0, x: 32, duration: 0.5,  ease: 'power3.out' }, '-=0.3');
    tl.from(sources, { opacity: 0, x: 22, duration: 0.4, stagger: 0.08, ease: 'power3.out' }, '-=0.3');
    tl.from(note,    { opacity: 0, y: 7,  duration: 0.4,  ease: 'power2.out' });

    /* Bidirectional data flow dots */
    const OVR = 22, FSTART = 2.2;
    [...flowL.dots, ...flowR.dots].forEach(({ d, isReturn }, fi) => {
      const fromX = isReturn ? -OVR : OVR;
      const toX   = isReturn ?  OVR : -OVR;
      const dur   = isReturn ? 3.6 : 2.2 + (fi % 3) * 0.24;
      const delay = FSTART + fi * 0.56;
      gsap.fromTo(d, { x: fromX }, { x: toX, ease: 'none', duration: dur, repeat: -1, delay });
    });
  }};
}


/* ──────────────────────────────────────────────────────────────────
   F. PHASE 4 — MULTI-TENANT
   PE Cockpit sits at the top (L3 + L2, shared across all portfolios).
   Below: Portfolios 1 and 2 run in a shared deployment with a common
   L0 database. Portfolio 3 (CMMC) runs on a fully isolated instance.
   Data flow dots rise from each portfolio up to the PE Cockpit.
   ────────────────────────────────────────────────────────────────── */
function archP4() {
  const view = aEl('div', 'arch-view');
  view.style.cssText = 'align-items:flex-start;justify-content:center;overflow:hidden;padding:8px 14px;';
  const outer = aEl('div');
  outer.style.cssText = 'width:100%;max-width:820px;display:flex;flex-direction:column;gap:0;';

  /* ── PE Cockpit ───────────────────────────────────────────────────── */
  const cockpitSection = aEl('div');
  cockpitSection.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
  const cockpitLabel = aEl('div');
  cockpitLabel.style.cssText = 'font-size:11px;font-weight:500;letter-spacing:0.10em;text-transform:uppercase;color:var(--accent);text-align:center;margin-bottom:3px;';
  cockpitLabel.textContent = 'PE Cockpit';
  const cpL3 = aLyr('L3', 'Portfolio Interface',    'KPI dashboard · deal pipeline · portfolio view');
  const cpL2 = aLyr('L2', 'Portfolio Intelligence', 'Claude AI · cross-company analytics · alerts');
  cockpitSection.appendChild(cockpitLabel);
  cockpitSection.appendChild(cpL3);
  cockpitSection.appendChild(cpL2);

  /* ── Connector zone with upward-flowing dots ──────────────────────── */
  const connZone = aEl('div');
  connZone.style.cssText = 'display:flex;gap:8px;height:18px;';
  const connDots = [];
  /* Three connector columns — loosely aligned with P1, P2, P3 centers */
  [1, 1, 0.7].forEach((flex, i) => {
    const c = aEl('div');
    c.style.cssText = `flex:${flex};position:relative;display:flex;justify-content:center;`;
    const line = aEl('div');
    line.style.cssText = 'width:1px;height:100%;background:rgba(0,112,173,0.25);';
    c.appendChild(line);
    [0, 1].forEach(j => {
      const d = aEl('div');
      d.style.cssText = 'position:absolute;width:4px;height:4px;border-radius:50%;background:var(--accent);left:50%;margin-left:-2px;bottom:0;opacity:0.85;';
      c.appendChild(d);
      connDots.push({ d, col: i, j });
    });
    connZone.appendChild(c);
  });

  /* ── Portfolio stack builder ──────────────────────────────────────── */
  /* Each portfolio has L3, a split L2 row, a split L1 row (no L0 — handled separately) */
  function mkStack(label) {
    const wrap = aEl('div');
    wrap.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:3px;';
    const hdr = aEl('div');
    hdr.style.cssText = 'font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:var(--accent);text-align:center;margin-bottom:2px;';
    hdr.textContent = label;
    const L3  = aLyr('L3',  'Surface',      null);
    const L2a = aLyr('L2a', 'Workflow',     null, true);
    const L2b = aLyr('L2b', 'Intelligence', null, true);
    const L1a = aLyr('L1a', 'Domain',       null, true);
    const L1b = aLyr('L1b', 'Semantic',     null, true);
    function sr(a, b) {
      const r = aEl('div'); r.style.cssText = 'display:flex;gap:3px;';
      [a, b].forEach(l => { l.style.flex = '1'; r.appendChild(l); }); return r;
    }
    [hdr, L3, sr(L2a, L2b), sr(L1a, L1b)].forEach(el => wrap.appendChild(el));
    return wrap;
  }

  const p1Wrap = mkStack('Portfolio 1');
  const p2Wrap = mkStack('Portfolio 2');
  const p3Wrap = mkStack('Portfolio 3');

  /* Shared L0 for Portfolios 1 and 2 */
  const sharedL0 = aLyr('L0', 'Shared Database', 'PostgreSQL · multi-tenant · row-level security', true);

  /* Isolated L0 for Portfolio 3 (CMMC) */
  const p3L0 = aLyr('L0', 'Isolated Database', 'Dedicated instance · CMMC compliance', true);

  /* Shared deployment box — P1 + P2 side by side, shared L0 below */
  const sharedBox = aEl('div');
  sharedBox.style.cssText = 'flex:2;border:1px solid var(--card-border);border-radius:10px;padding:7px;display:flex;flex-direction:column;gap:5px;box-shadow:var(--card-shadow);';
  const p12Row = aEl('div');
  p12Row.style.cssText = 'display:flex;gap:6px;';
  p12Row.appendChild(p1Wrap); p12Row.appendChild(p2Wrap);
  sharedBox.appendChild(p12Row); sharedBox.appendChild(sharedL0);

  /* Isolated deployment box — P3 with its own L0 */
  const p3Box = aEl('div');
  p3Box.style.cssText = 'flex:1;border:1px solid var(--card-border);border-radius:10px;padding:7px;display:flex;flex-direction:column;gap:5px;box-shadow:var(--card-shadow);';
  p3Box.appendChild(p3Wrap); p3Box.appendChild(p3L0);

  const tenantsRow = aEl('div');
  tenantsRow.style.cssText = 'display:flex;gap:8px;';
  tenantsRow.appendChild(sharedBox); tenantsRow.appendChild(p3Box);

  const note = aEl('div');
  note.style.cssText = 'font-size:11px;color:var(--muted);font-style:italic;text-align:center;margin-top:4px;';
  note.textContent = 'Portfolios 1 and 2 share L0. Portfolio 3 runs on an isolated database instance.';

  outer.appendChild(cockpitSection);
  outer.appendChild(connZone);
  outer.appendChild(tenantsRow);
  outer.appendChild(note);
  view.appendChild(outer);

  return { view, animate() {
    const tl = gsap.timeline({ delay: 0.2 });
    /* PE Cockpit descends from above */
    tl.from(cockpitSection, { opacity: 0, y: -20, scale: 0.97, duration: 0.9, ease: 'power3.out' });
    /* Shared deployment box and isolated box rise from below */
    tl.from(sharedBox, { opacity: 0, y: 18, scale: 0.97, duration: 0.8, ease: 'power3.out' }, '-=0.45');
    tl.from(p3Box,     { opacity: 0, y: 18, scale: 0.97, duration: 0.8, ease: 'power3.out' }, '-=0.65');
    tl.from(note,      { opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1');
    /* Continuous upward data flow from each portfolio to the PE Cockpit */
    connDots.forEach(({ d, col, j }) => {
      const delay = 1.6 + col * 0.56 + j * 1.1;
      gsap.fromTo(d, { y: 0, opacity: 0.85 }, { y: -18, opacity: 0, ease: 'power1.in', duration: 1.3, repeat: -1, delay });
    });
  }};
}


/* ──────────────────────────────────────────────────────────────────
   G. ORCHESTRIERUNG
   Verwaltet den Phasen-Lebenszyklus: alte View ausblenden, neue
   einblenden, Fortschrittsbalken füllen, nächste Phase planen.
   ────────────────────────────────────────────────────────────────── */
const ARCH_PHASES = [archP1, archP2, archP3, archP4];

/* Interne Zustandsvariablen — nicht von außen zugreifen */
let archStageEl, archDotsEl, archPbarEl, archPlblEl;
let archCur = 0, archTimer = null, archActiveView = null, archInited = false;

/* Springt zu Phase idx (0-basiert, zyklisch).
   Blendet die aktuelle View aus, dann die neue ein. */
function archGoTo(idx) {
  idx = ((idx % ARCH_PHASES.length) + ARCH_PHASES.length) % ARCH_PHASES.length;
  if (archTimer) clearTimeout(archTimer);
  gsap.killTweensOf(archPbarEl);
  gsap.killTweensOf(archPlblEl);

  const { view, animate } = ARCH_PHASES[idx]();
  gsap.set(view, { opacity: 0 });
  archStageEl.appendChild(view);

  /* animate() sofort aufrufen — GSAP setzt alle Elemente auf ihren
     Ausgangszustand, bevor die View sichtbar wird. Verhindert den
     "Blitz" des fertig gerenderten Layouts beim Überblenden. */
  animate();

  if (archActiveView) {
    const old = archActiveView;
    gsap.to(old, { opacity: 0, duration: 0.18, ease: 'power2.in',
      onComplete: () => {
        if (archStageEl.contains(old)) archStageEl.removeChild(old);
        gsap.to(view, { opacity: 1, duration: 0.14, ease: 'power2.out' });
      }
    });
  } else {
    gsap.to(view, { opacity: 1, duration: 0.56, ease: 'power2.out' });
  }

  archActiveView = view;
  archCur = idx;
  archDotsEl.querySelectorAll('.arch-dot')
    .forEach((d, i) => d.classList.toggle('active', i === archCur));

  /* Fortschrittsbalken füllt sich über die Verweildauer */
  gsap.fromTo(archPbarEl,
    { width: '0%' },
    { width: '100%', duration: ARCH_DWELL[archCur] / 1000, ease: 'none' }
  );

  /* Phasenlabel erscheint kurz und faded wieder aus */
  archPlblEl.textContent = ARCH_LABELS[archCur];
  gsap.fromTo(archPlblEl,
    { opacity: 0, y: -5 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
      onComplete: () => gsap.to(archPlblEl, { opacity: 0, delay: 3.6, duration: 1.0, ease: 'power2.in' })
    }
  );

  archTimer = setTimeout(() => archGoTo(archCur + 1), ARCH_DWELL[archCur]);
}

/* Startet die Animation — einmalig beim ersten Slide-Eingang aufrufen */
function archStart() {
  if (!archInited) { archInited = true; archGoTo(0); }
}

/* Muss einmalig aufgerufen werden, sobald das DOM bereit ist.
   Sucht die erforderlichen Element-IDs und verdrahtet Click-Handler. */
function initArch() {
  archStageEl = document.getElementById('arch-stage');
  archDotsEl  = document.getElementById('arch-dots');
  archPbarEl  = document.getElementById('arch-pbar');
  archPlblEl  = document.getElementById('arch-plbl');

  /* Phasen-Indikatoren erstellen (ein Kreis pro Phase) */
  ARCH_PHASES.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'arch-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', e => { e.stopPropagation(); archGoTo(i); });
    archDotsEl.appendChild(d);
  });

  /* Klick auf den Stage-Bereich springt zur nächsten Phase */
  archStageEl.addEventListener('click', () => archGoTo(archCur + 1));
}
