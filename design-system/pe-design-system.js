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
const ARCH_LABELS = ['Platform Architecture', 'Layer Detail', 'Data Integration', 'Multi-Tenant Portfolio'];


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
   C. PHASE 1 — PLATTFORM-ÜBERBLICK
   Zeigt die vier Haupt-Architektur-Layer (L3 → L0) als einfachen
   Stapel. Layer animieren von unten nach oben ein, danach faden
   die Untertitel-Zeilen ein.
   ────────────────────────────────────────────────────────────────── */
function archP1() {
  const view = aEl('div', 'arch-view');

  /* Die vier Haupt-Layer von oben nach unten */
  const layers = [
    aLyr('L3', 'User Layer',           'Next.js · Google/Outlook · Claude Integration · Widgets'),
    aLyr('L2', 'AI & Workflow Engine', 'Claude AI · Temporal.io · Reporting · Automation'),
    aLyr('L1', 'Semantic Data Layer',  'Datenmodell · Business-Logik · KPI-Definitionen · Prisma ORM'),
    aLyr('L0', 'Database / Data Lake', 'PostgreSQL · Neon Serverless · Location of data origin'),
  ];
  const wrap = aEl('div');
  wrap.style.cssText = 'width:100%;max-width:680px;';
  wrap.appendChild(aStk(layers));
  view.appendChild(wrap);

  return { view, animate() {
    const tl = gsap.timeline();
    /* Layer fliegen von unten ein — reversed = unterster Layer zuerst */
    tl.from([...layers].reverse(), {
      opacity: 0, y: 22, scale: 0.97,
      duration: 1.1, stagger: 0.2, ease: 'power3.out'
    });
    /* Untertitel faden nach den Layern ein */
    tl.from(layers.map(l => l.querySelector('.arch-lsub')), {
      opacity: 0, duration: 0.8, stagger: 0.14, ease: 'power2.out'
    }, '-=0.7');
  }};
}


/* ──────────────────────────────────────────────────────────────────
   D. PHASE 2 — LAYER-DETAIL
   Klappt L2 und L1 in ihre Sub-Layer auf (L2a/L2b, L1a/L1b).
   Übergangs-Sequenz: Äußere Layer (L3, L0) erscheinen zuerst von
   oben/unten — dann öffnet sich der Spalt, während die mittleren
   Layer von der Mitte heraus skalieren.
   ────────────────────────────────────────────────────────────────── */
function archP2() {
  const view = aEl('div', 'arch-view');

  /* Sechs Layer: äußere (L3, L0) + vier Sub-Layer in der Mitte */
  const layers = [
    aLyr('L3',  'User Layer',          'UI/UX · Google/Outlook · Claude Integration · Widgets'),
    aLyr('L2b', 'Intelligence Layer',  'Claude AI · Reporting · Insights · LLM Interface',              true),
    aLyr('L2a', 'Workflow Engine',     'Temporal.io · Process Logic · Approvals · Escalations',         true),
    aLyr('L1b', 'Semantic Layer',      'KPI-Definitionen · Cube.dev · Business-Metriken · AI-Interface', true),
    aLyr('L1a', 'Domain Model',        'Prisma ORM · Entitäten · Relationen · Customer · Order · GL',   true),
    aLyr('L0',  'Database / Data Lake','PostgreSQL · Neon Serverless · Location of data origin'),
  ];

  /* Fußnote: erklärt die bewusste Trennung von L2a und L2b */
  const note = aEl('div');
  note.style.cssText = 'font-size:11px;color:var(--muted);font-style:italic;text-align:center;margin-top:7px;';
  note.textContent = 'L2a (deterministisch) und L2b (probabilistisch) sind bewusst getrennt';

  const wrap = aEl('div');
  wrap.style.cssText = 'width:100%;max-width:680px;display:flex;flex-direction:column;align-items:center;';
  wrap.appendChild(aStk(layers));
  wrap.appendChild(note);
  view.appendChild(wrap);

  return { view, animate() {
    const mid = layers.slice(1, 5); /* L2b, L2a, L1b, L1a */

    /* Mittlere Layer auf Höhe 0 setzen — sie sind initial nicht sichtbar */
    gsap.set(mid, { scaleY: 0, opacity: 0, transformOrigin: 'center center' });

    const tl = gsap.timeline({ delay: 0.5 });
    /* Schritt 1: Äußere Layer gleiten von gegenüberliegenden Seiten ein */
    tl.from(layers[0], { opacity: 0, y: -18, duration: 0.84, ease: 'power3.out' });
    tl.from(layers[5], { opacity: 0, y:  18, duration: 0.84, ease: 'power3.out' }, '<');
    /* Schritt 2: Spalt weitet sich — mittlere Layer skalieren nacheinander auf */
    tl.to(mid, { scaleY: 1, opacity: 1, duration: 0.8, stagger: 0.18, ease: 'back.out(1.3)' }, '+=0.4');
    tl.from(note, { opacity: 0, y: 8, duration: 0.76, ease: 'power2.out' }, '-=0.2');
  }};
}


/* ──────────────────────────────────────────────────────────────────
   E. PHASE 3 — DATEN-INTEGRATION
   Zeigt den Plattform-Stack neben einer temporären Integration Layer
   und den Legacy-Quell-Systemen (SAP, CRM, MES, PLM).
   Bidirektionale Datenpunkte laufen entlang horizontaler Linien:
     Quell-Systeme → Integration Layer → Plattform-Stack
   ────────────────────────────────────────────────────────────────── */
function archP3() {
  const view = aEl('div', 'arch-view');
  const outer = aEl('div');
  outer.style.cssText = 'width:100%;max-width:820px;display:flex;flex-direction:column;align-items:center;gap:8px;';
  const row = aEl('div');
  row.style.cssText = 'display:flex;align-items:stretch;justify-content:center;width:100%;';

  /* ── Linke Spalte: kompakter Plattform-Stack ── */
  const stackLayers = [
    aLyr('L3',  'User Layer',   null),
    aLyr('L2b', 'Intelligence', null),
    aLyr('L2a', 'Workflow',     null),
    aLyr('L1b', 'Semantic',     null),
    aLyr('L1a', 'Domain',       null, true),
    aLyr('L0',  'Database',     null, true),
  ];
  const stackCol = aEl('div');
  stackCol.style.cssText = 'flex:0 0 175px;display:flex;flex-direction:column;gap:4px;';
  stackLayers.forEach(l => stackCol.appendChild(l));

  /* ── Flow-Lane-Hilfsfunktion ─────────────────────────────────
     Erstellt eine 38px breite Verbindungsspalte.
     Pro Eintrag in yPositions: eine horizontale Linie + ein Punkt.
     isReturn:false → vorwärts (Quelle → Stack), rechts→links
     isReturn:true  → rückwärts (heller), links→rechts            */
  function makeFlowCol(yPositions) {
    const col = aEl('div');
    col.style.cssText = 'flex:0 0 38px;position:relative;align-self:stretch;overflow:visible;';
    const dots = [];
    yPositions.forEach(({ yPct, isReturn }) => {
      /* Sichtbare horizontale Linie auf der Höhe der Verbindung */
      const line = aEl('div');
      line.style.cssText =
        `position:absolute;top:${yPct}%;left:0;right:0;height:1px;` +
        `background:rgba(0,112,173,${isReturn ? '0.12' : '0.22'});margin-top:-0.5px;`;
      col.appendChild(line);
      /* Beweglicher Punkt, der entlang der Linie animiert wird */
      const d = aEl('div');
      const sz = isReturn ? 3 : 4;
      const op = isReturn ? 0.45 : 0.82;
      d.style.cssText =
        `position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;` +
        `background:var(--accent);top:${yPct}%;margin-top:-${sz/2}px;` +
        `left:50%;margin-left:-${sz/2}px;opacity:${op};`;
      col.appendChild(d);
      dots.push({ d, isReturn });
    });
    return { col, dots };
  }

  /* Linker Datenfluss: Integration Layer → Stack
     y-Positionen ~70% und ~84% entsprechen L1a und L0 im Stack */
  const flowL = makeFlowCol([
    { yPct: 70, isReturn: false },
    { yPct: 84, isReturn: false },
    { yPct: 77, isReturn: false },
    { yPct: 74, isReturn: true  },
  ]);

  /* ── Mittlere Spalte: Integration / Migration Box ── */
  const mig = aEl('div');
  mig.style.cssText =
    'flex:0 0 138px;background:rgba(0,112,173,0.07);border:1px solid var(--accent-border);' +
    'border-radius:10px;overflow:hidden;box-shadow:0 1px 12px rgba(0,112,173,0.1);align-self:center;';
  mig.innerHTML =
    `<div style="padding:6px 11px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent);border-bottom:1px solid var(--accent-border);background:rgba(0,112,173,0.06);text-align:center;">Integration Layer</div>` +
    `<div style="padding:5px 11px;font-size:11px;color:var(--muted);border-bottom:1px solid rgba(0,112,173,0.07);">Schema Mapping</div>` +
    `<div style="padding:5px 11px;font-size:11px;color:var(--muted);border-bottom:1px solid rgba(0,112,173,0.07);">Data Transform</div>` +
    `<div style="padding:5px 11px;font-size:11px;color:var(--muted);border-bottom:1px solid rgba(0,112,173,0.07);">Validation</div>` +
    `<div style="padding:5px 11px;font-size:11px;color:var(--muted);">Cutover Tooling</div>`;

  /* Rechter Datenfluss: Quell-Systeme → Integration
     Vier Linien bei ~17/37/57/77% entsprechen den vier Quell-Blöcken */
  const flowR = makeFlowCol([
    { yPct: 17, isReturn: false },
    { yPct: 37, isReturn: false },
    { yPct: 57, isReturn: false },
    { yPct: 77, isReturn: false },
    { yPct: 27, isReturn: true  },
    { yPct: 67, isReturn: true  },
  ]);

  /* ── Rechte Spalte: Legacy-Quell-Systeme ── */
  const sources = [], srcCol = aEl('div');
  srcCol.style.cssText = 'flex:0 0 120px;display:flex;flex-direction:column;gap:5px;';
  ['SAP / ERP', 'CRM', 'MES', 'PLM'].forEach(name => {
    const b = aEl('div');
    b.style.cssText =
      'background:var(--card);border:1px solid var(--card-border);border-radius:7px;' +
      'padding:7px 10px;font-size:11px;font-weight:700;color:var(--text2);' +
      'text-align:center;box-shadow:0 1px 8px rgba(0,112,173,0.07);';
    b.textContent = name; srcCol.appendChild(b); sources.push(b);
  });

  /* Fußnote: Integration Layer ist temporär und nach Cutover abschaltbar */
  const note = aEl('div');
  note.style.cssText = 'font-size:11px;color:var(--muted);font-style:italic;text-align:center;width:100%;';
  note.textContent = 'Temporäre Onboarding-Infrastruktur — nach Cutover abschaltbar';

  row.appendChild(stackCol); row.appendChild(flowL.col); row.appendChild(mig);
  row.appendChild(flowR.col); row.appendChild(srcCol);
  outer.appendChild(row); outer.appendChild(note);
  view.appendChild(outer);

  return { view, animate() {
    const tl = gsap.timeline({ delay: 0.5 });
    /* Eingangsanimation: Stack von links, Integration + Quellen von rechts */
    tl.from(stackLayers, { opacity: 0, x: -14, duration: 0.9,  stagger: 0.12, ease: 'power3.out' });
    tl.from(mig,         { opacity: 0, x:  28, duration: 0.96, ease: 'power3.out' }, '-=0.4');
    tl.from(sources,     { opacity: 0, x:  22, duration: 0.76, stagger: 0.16, ease: 'power3.out' }, '-=0.4');
    tl.from(note,        { opacity: 0, y:   7, duration: 0.76, ease: 'power2.out' });

    /* Bidirektionaler Datenfluss — startet nach der Eingangsanimation
       OVR: Pixel-Überschuss über den Spaltenrand (für sauberes Ein-/Ausfahren)
       Vorwärts-Punkte (isReturn:false) fahren rechts→links
       Rückwärts-Punkte (isReturn:true)  fahren links→rechts, heller */
    const OVR    = 22;
    const FSTART = 3.0;
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
   F. PHASE 4 — MULTI-TENANT PORTFOLIO
   Zeigt die vollständige Multi-Tenant-Architektur:
   - PE-Cockpit oben (gemeinsamer User Layer + AI & Reporting)
   - Drei Tenant-Spalten (L2a/L2b isoliert pro Portfolio-Unternehmen)
   - Gemeinsame L1 + L0 am unteren Rand (Shared Database)
   Animierte Punkte steigen von jedem Tenant zum PE-Cockpit auf
   und visualisieren den aufwärts gerichteten Datenfluss.
   ────────────────────────────────────────────────────────────────── */
function archP4() {
  const view = aEl('div', 'arch-view');
  view.style.cssText = 'align-items:flex-start;justify-content:center;overflow:hidden;padding:10px 18px 8px;';
  const outer = aEl('div');
  outer.style.cssText = 'width:100%;max-width:780px;display:flex;flex-direction:column;gap:0;';

  /* ── PE-Cockpit: gemeinsamer Reporting- und KI-Layer für das Portfolio ── */
  const cockpit = aEl('div');
  cockpit.style.cssText =
    'border:2px solid var(--accent);border-radius:10px;overflow:hidden;' +
    'background:rgba(210,233,245,0.88);box-shadow:0 2px 22px rgba(0,112,173,0.18);';

  /* Kopfzeile mit Titel */
  const cpHdr = aEl('div');
  cpHdr.style.cssText = 'padding:5px 14px;background:var(--accent);display:flex;align-items:center;gap:10px;';
  cpHdr.innerHTML =
    '<span style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#fff;">PE-Cockpit</span>' +
    '<span style="font-size:11px;color:rgba(255,255,255,0.72);font-weight:300;">Portfolio Visibility Layer</span>';

  /* Zwei Sub-Layer im Cockpit: User Layer + AI & Reporting */
  const cpBody = aEl('div');
  cpBody.style.cssText = 'display:flex;gap:8px;padding:7px 12px 9px;';
  const cpLayers = [];
  [['User Layer',     'Next.js · Google/Outlook · Claude Integration · Mobile'],
   ['AI & Reporting', 'Claude AI · Portfolio KPIs · Cross-company Benchmarks · Alerts']
  ].forEach(([name, sub]) => {
    const l = aEl('div');
    l.style.cssText =
      'flex:1;background:rgba(255,255,255,0.9);border:1px solid var(--accent-border);' +
      'border-radius:7px;padding:6px 10px;';
    l.innerHTML =
      `<div style="font-size:11px;font-weight:700;color:var(--accent);">${name}</div>` +
      `<div style="font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4;">${sub}</div>`;
    cpBody.appendChild(l); cpLayers.push(l);
  });
  cockpit.appendChild(cpHdr); cockpit.appendChild(cpBody);

  /* ── Verbindungszone: vertikale Linien + aufsteigende Punkte ──
     Jede Linie verbindet eine Tenant-Spalte mit dem PE-Cockpit.
     Punkte steigen auf und faden aus — visualisieren Datenstrom. */
  const connZone = aEl('div');
  connZone.style.cssText = 'display:flex;gap:6px;height:20px;';
  const connDots = [];
  for (let i = 0; i < 3; i++) {
    const c = aEl('div');
    c.style.cssText = 'flex:1;position:relative;display:flex;justify-content:center;';
    /* Vertikale Verbindungslinie */
    const line = aEl('div');
    line.style.cssText = 'width:1px;height:100%;background:rgba(0,112,173,0.25);';
    c.appendChild(line);
    /* Zwei Punkte pro Spalte, versetzt für kontinuierlichen Strom */
    [0, 1].forEach(j => {
      const d = aEl('div');
      d.style.cssText =
        'position:absolute;width:4px;height:4px;border-radius:50%;background:var(--accent);' +
        'left:50%;margin-left:-2px;bottom:0;opacity:0.85;';
      c.appendChild(d);
      connDots.push({ d, col: i, j });
    });
    connZone.appendChild(c);
  }

  /* ── Tenant-Spalten: L2b (Intelligence) + L2a (Workflow) pro Unternehmen ──
     Jeder Tenant hat seinen eigenen isolierten Applikations-Layer. */
  const tenantsWrap = aEl('div');
  tenantsWrap.style.cssText = 'display:flex;gap:6px;';
  const tenantCols = [];
  ['Portfolio A', 'Portfolio B', 'Portfolio C'].forEach(name => {
    const col = aEl('div');
    col.style.cssText =
      'flex:1;border:1px solid var(--card-border);border-radius:8px;overflow:hidden;' +
      'background:var(--card);box-shadow:0 1px 10px rgba(0,112,173,0.07);';
    const hdr = aEl('div');
    hdr.style.cssText =
      'padding:4px 8px;background:rgba(0,112,173,0.05);border-bottom:1px solid var(--card-border);' +
      'font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--accent);text-align:center;';
    hdr.textContent = name;
    const inner = aEl('div');
    inner.style.cssText = 'display:flex;flex-direction:column;gap:4px;padding:6px;';
    [['L2b','Intelligence'],['L2a','Workflow']].forEach(([lid, lname]) => inner.appendChild(aLyr(lid, lname, null, true)));
    col.appendChild(hdr); col.appendChild(inner);
    tenantsWrap.appendChild(col); tenantCols.push(col);
  });

  /* ── Shared Layer: L1 + L0 spannen über ALLE Tenants ──
     Alle Portfolio-Unternehmen teilen diese zwei Layer via Row-Level-Security. */
  const sharedWrap = aEl('div');
  sharedWrap.style.cssText = 'margin-top:6px;display:flex;flex-direction:column;gap:5px;';
  const sharedLayers = [
    aLyr('L1', 'Shared Domain Model',        'Prisma ORM · Entitäten · Relationen · Row-Level-Security per Tenant', true),
    aLyr('L0', 'Shared Database / Data Lake', 'PostgreSQL · Neon Serverless · Mandantentrennung via RLS · Multi-tenant', true),
  ];
  sharedLayers.forEach(l => sharedWrap.appendChild(l));

  /* Fußnote: erklärt die Isolierungs-/Sharing-Grenze */
  const note = aEl('div');
  note.style.cssText = 'font-size:11px;color:var(--muted);font-style:italic;text-align:center;margin-top:4px;';
  note.textContent = 'L2a/L2b sind tenant-isoliert — L1 und L0 werden shared betrieben';

  outer.appendChild(cockpit); outer.appendChild(connZone);
  outer.appendChild(tenantsWrap); outer.appendChild(sharedWrap); outer.appendChild(note);
  view.appendChild(outer);

  return { view, animate() {
    const tl = gsap.timeline({ delay: 0.5 });
    /* PE-Cockpit fällt von oben herein */
    tl.from(cockpit,      { opacity: 0, y: -22, scale: 0.97, duration: 1.04, ease: 'power3.out' });
    tl.from(cpLayers,     { opacity: 0, scale: 0.94, duration: 0.72, stagger: 0.2,  ease: 'back.out(1.5)' }, '-=0.5');
    /* Tenant-Spalten fächern von unten auf */
    tl.from(tenantCols,   { opacity: 0, y: 20, scale: 0.96, duration: 0.88, stagger: 0.18, ease: 'power3.out' }, '-=0.2');
    /* Shared Layer steigen von unten auf */
    tl.from(sharedLayers, { opacity: 0, y: 14, duration: 0.8, stagger: 0.2, ease: 'power3.out' }, '-=0.4');
    tl.from(note,         { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.1');

    /* Kontinuierlicher Aufwärtsstrom: Punkte steigen von Tenants zum PE-Cockpit */
    connDots.forEach(({ d, col, j }) => {
      const delay = 3.0 + col * 0.56 + j * 1.1;
      gsap.fromTo(d,
        { y: 0,   opacity: 0.85 },
        { y: -20, opacity: 0, ease: 'power1.in', duration: 1.3, repeat: -1, delay }
      );
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
    gsap.to(old, { opacity: 0, duration: 0.56, ease: 'power2.in',
      onComplete: () => {
        if (archStageEl.contains(old)) archStageEl.removeChild(old);
        gsap.to(view, { opacity: 1, duration: 0.44, ease: 'power2.out' });
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
