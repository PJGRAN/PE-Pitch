# PE Design System — Quick Reference

Use this file when rebuilding a similar presentation. It covers everything needed to reconstruct the visual language and architecture animation from scratch.

---

## File structure

```
your-project/
  design-system/
    pe-design-system.css   ← all styles
    pe-design-system.js    ← arch animation (requires GSAP)
    skill.md               ← this file
  index.html               ← slide HTML + navigation JS only
  bg_video.mp4             ← optional background video
  logo.png                 ← optional logo
```

**Load order in `<head>`:**
```html
<link rel="stylesheet" href="./design-system/pe-design-system.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="./design-system/pe-design-system.js"></script>
```

---

## Design tokens (`:root` in the CSS)

Override these to rebrand. Everything else in the system derives from them.

| Variable | Default | Purpose |
|---|---|---|
| `--accent` | `#3E6FA3` | Primary brand blue |
| `--accent-light` | `#7AAFD4` | Lighter blue (dividers, hovers) |
| `--accent-border` | `rgba(62,111,163,0.22)` | Subtle blue border |
| `--text` | `#14100c` | Body text (near-black, warm) |
| `--text2` | `#2a2016` | Strong emphasis text |
| `--muted` | `rgba(20,16,12,0.55)` | Secondary / caption text |
| `--card` | `rgba(252,248,244,0.88)` | Frosted card surface |
| `--card-border` | `rgba(62,111,163,0.13)` | Card outline |
| `--card-shadow` | `0 2px 20px rgba(62,111,163,0.08)` | Card drop shadow |
| `--hi` | `rgba(232,244,246,0.96)` | Highlighted layer surface |
| `--radius` | `12px` | Global corner radius |

Background body color: `#f2ede7` (warm off-white, set directly on `body`).

---

## App shell

```html
<video id="bg-video" autoplay muted loop playsinline>
  <source src="bg_video.mp4" type="video/mp4">
</video>
<div id="bg-overlay"></div>

<div id="app">
  <nav>
    <div class="nav-brand">
      <img src="logo.png" style="height:26px;mix-blend-mode:multiply;">
      <div class="nav-sep"></div>
      <div class="nav-sub">Subtitle text</div>
    </div>
    <div class="nav-dots" id="nav-dots"></div>
    <div class="nav-arrows">
      <div class="nav-arrow" id="prev">←</div>
      <div class="nav-arrow" id="next">→</div>
    </div>
  </nav>

  <div id="slides-wrap">
    <!-- slides go here -->
  </div>

  <div id="progress"><div id="progress-fill"></div></div>
  <div class="slide-counter" id="counter">1 / 5</div>
</div>
```

---

## Slide template

Every slide is `position:absolute; opacity:0` by default. GSAP controls visibility.

```html
<div class="slide" data-index="0">
  <div class="sc">           <!-- or class="sc center" for centered layout -->
    <div class="label anim">Section Name</div>
    <h2 class="anim">Heading with <strong>bold part</strong></h2>
    <div class="divider anim"></div>
    <!-- content here with class="anim" on each block -->
  </div>
</div>
```

- `class="anim"` — marks elements for the staggered entrance animation (opacity 0→1, y 20→0).
- Do NOT put `class="anim"` on logo `<img>` tags — the y-translate causes a small→big effect.
- Architecture slide needs `class="slide slide-arch"` (see below).

---

## Component classes

### Card grid (3 columns)
```html
<div class="grid-3 anim">
  <div class="card">
    <div class="card-title">Title</div>
    <div class="card-body">Text with <strong>emphasis</strong></div>
  </div>
</div>
```

### Stat boxes
```html
<div class="stats-row anim">
  <div class="stat">
    <div class="stat-num">90</div>
    <div class="stat-label">Days to go live</div>
  </div>
</div>
```
Animate the numbers with `animateCounter(el)` on slide entry.

### Contrast grid (old vs. new)
```html
<div class="contrast-grid anim">
  <div class="contrast-card old">
    <div class="contrast-label old">Old approach</div>
    <div class="contrast-item">
      <div class="contrast-dot old"></div>
      <div class="contrast-text old">Item text</div>
    </div>
  </div>
  <div class="contrast-card new">
    <div class="contrast-label new">New approach</div>
    <div class="contrast-item">
      <div class="contrast-dot new"></div>
      <div class="contrast-text new">Item text</div>
    </div>
  </div>
</div>
```

### Method flow (numbered steps)
```html
<div class="method-flow anim">
  <div class="method-step">
    <div class="method-num">Step 01</div>
    <div class="method-icon">🎯</div>
    <div class="method-name">Name</div>
    <div class="method-desc">Description text</div>
  </div>
  <!-- repeat; → arrow appears automatically between steps via ::after -->
</div>
```

### Proof rows (icon + title + body)
```html
<div class="proof-rows anim">
  <div class="proof-row">
    <div class="proof-icon">🏗️</div>
    <div>
      <div class="proof-title">Heading</div>
      <div class="proof-body">Text with <strong>emphasis</strong></div>
    </div>
  </div>
</div>
```

### Root-cause / callout box
```html
<div class="root-cause anim">
  <p style="font-size:13px;color:var(--muted);line-height:1.7;">
    Text with <strong style="color:var(--text2);">emphasis</strong>
  </p>
</div>
```

### Buttons
```html
<div class="cta-row anim">
  <button class="btn-primary">Primary CTA →</button>
  <button class="btn-secondary">Secondary CTA</button>
</div>
```

---

## Architecture animation slide

### Required HTML
```html
<div class="slide slide-arch" data-index="3">
  <div class="label anim">The Platform</div>
  <div class="arch-wrap">
    <div class="arch-prog"><div class="arch-prog-fill" id="arch-pbar"></div></div>
    <div class="arch-stage" id="arch-stage">
      <div class="arch-phase-lbl" id="arch-plbl"></div>
    </div>
    <div class="arch-dots-row" id="arch-dots"></div>
  </div>
</div>
```

### Wiring in the navigation script
```js
// After DOM is ready, before first slide plays:
initArch();

// In playSlideIn(), when idx === 3:
if (idx === 3) tl.call(archStart, [], 0.5);
```

### What the JS provides (from pe-design-system.js)
| Function | When to call |
|---|---|
| `initArch()` | Once, on page load (wires DOM IDs + click handlers) |
| `archStart()` | When the arch slide enters the viewport |
| `archGoTo(n)` | To jump directly to phase 0–3 |

### The 4 phases
| Phase | Content | Dwell |
|---|---|---|
| 0 — Platform Architecture | 4 main layers (L3 User, L2 AI/Workflow, L1 Semantic, L0 Database) | 8 s |
| 1 — Layer Detail | L2 + L1 expanded into sub-layers; gap-spread transition | 10.4 s |
| 2 — Data Integration | Stack + Integration box + SAP/CRM/MES/PLM; bidirectional flow dots | 12 s |
| 3 — Multi-Tenant Portfolio | PE-Cockpit above 3 tenant columns + shared L0/L1; upward flow dots | 13 s |

### Customising phases
Edit `archP1()` – `archP4()` in `pe-design-system.js`.
- `aLyr(id, name, sub, hi)` — creates one layer row
- `aStk([...layers])` — wraps layers in a `.arch-stack`
- `aEl(tag, cls, html)` — generic element factory
- `makeFlowCol(yPositions)` inside `archP3` — horizontal flow lane with line + dot per connection
- `connDots` inside `archP4` — vertical upward flow dots
- Adjust `ARCH_DWELL` array and `ARCH_LABELS` array at the top of the JS file

---

## Navigation JS (goes in index.html `<script>`)

Minimal working version — copy this verbatim and adjust slide count / indices:

```js
const slides  = Array.from(document.querySelectorAll('.slide'));
const navDots = document.getElementById('nav-dots');
const total   = slides.length;
let current = 0, animating = false;

slides.forEach((_, i) => {
  const d = document.createElement('button');
  d.className = 'nav-dot' + (i === 0 ? ' active' : '');
  d.addEventListener('click', () => goTo(i));
  navDots.appendChild(d);
});

function animateCounter(el) {
  const original = el.dataset.orig ?? el.textContent.trim();
  el.dataset.orig = original;
  const suffix = original.replace(/[\d]/g, '');
  const num = parseFloat(original);
  if (isNaN(num)) return;
  const obj = { val: num === 0 ? 12 : 0 };
  gsap.to(obj, {
    val: num, duration: num <= 1 ? 0.7 : 1.5,
    ease: num === 0 ? 'power2.in' : 'power2.out',
    snap: { val: 1 },
    onUpdate() { el.textContent = Math.round(obj.val) + suffix; },
    onComplete() { el.textContent = original; }
  });
}

function playSlideOut(el, dir) {
  el.style.pointerEvents = 'none';
  return gsap.to(el, { opacity: 0, x: -60 * dir, duration: 0.38, ease: 'power2.in' });
}

function playSlideIn(el, idx, dir) {
  gsap.set(el, { opacity: 0, x: dir === 0 ? 0 : 60 * dir });
  const tl = gsap.timeline({
    onStart:    () => { el.style.pointerEvents = 'all'; },
    onComplete: () => { animating = false; }
  });
  tl.to(el, { opacity: 1, x: 0, duration: 0.52, ease: 'power3.out' });
  const anims = el.querySelectorAll('.anim');
  if (anims.length) {
    tl.from(anims, {
      opacity: 0, y: 20, duration: 0.48,
      stagger: { each: 0.07, ease: 'power2.out' },
      ease: 'power3.out', clearProps: 'all'
    }, '-=0.28');
  }
  if (idx === 0) tl.call(() => el.querySelectorAll('.stat-num').forEach(animateCounter), [], 0.45);
  if (idx === 3) tl.call(archStart, [], 0.5);  // ← adjust index if arch slide is not slide 4
  return tl;
}

function goTo(idx) {
  if (idx === current || animating) return;
  animating = true;
  const dir = idx > current ? 1 : -1;
  const prev = current;
  current = idx; updateUI();
  const master = gsap.timeline();
  master.add(playSlideOut(slides[prev], dir), 0);
  master.add(playSlideIn(slides[idx], idx, dir), 0.22);
}

function updateUI() {
  navDots.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  document.getElementById('counter').textContent = (current + 1) + ' / ' + total;
  gsap.to('#progress-fill', { width: ((current + 1) / total * 100) + '%', duration: 0.5, ease: 'power2.out' });
}

// Hover micro-interactions
document.querySelectorAll('.card, .proof-row, .contrast-card, .method-step').forEach(card => {
  card.addEventListener('mouseenter', () => gsap.to(card, { y: -4, duration: 0.25, ease: 'power2.out' }));
  card.addEventListener('mouseleave', () => gsap.to(card, { y:  0, duration: 0.35, ease: 'power2.out' }));
});
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
  btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.04, duration: 0.2,  ease: 'back.out(2)' }));
  btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1,    duration: 0.28, ease: 'power2.out' }));
});
document.querySelectorAll('.nav-arrow').forEach(btn => {
  btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.1, duration: 0.18, ease: 'back.out(2)' }));
  btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1,   duration: 0.22, ease: 'power2.out' }));
});

// Keyboard + touch navigation
document.getElementById('prev').addEventListener('click', () => goTo(Math.max(0, current - 1)));
document.getElementById('next').addEventListener('click', () => goTo(Math.min(total - 1, current + 1)));
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(Math.min(total - 1, current + 1));
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(Math.max(0, current - 1));
});
let tx = 0;
document.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - tx;
  if (Math.abs(dx) > 50) goTo(dx < 0 ? Math.min(total - 1, current + 1) : Math.max(0, current - 1));
});

// Boot
gsap.from('nav', { opacity: 0, y: -8, duration: 0.6, ease: 'power3.out', delay: 0.1 });
updateUI();
initArch();             // from pe-design-system.js — omit if no arch slide
playSlideIn(slides[0], 0, 0);
```

---

## Visual language summary

- **Palette:** Warm off-white background (`#f2ede7`), blue accent (`#3E6FA3`), warm dark text.
- **Cards:** Frosted glass (semi-transparent white + `backdrop-filter:blur`), subtle blue border, soft shadow.
- **Typography:** System font stack, light weight (300) for headings, 600 for `<strong>`. All-caps small labels above headings.
- **Animations:** GSAP `power3.out` for entrances, `back.out` for pops/scales. Elements enter with `opacity:0, y:20` staggered. No CSS transitions except nav dots and arch dots.
- **Slide transitions:** Horizontal slide + fade (60px x-offset). Old slide exits before new one fully enters.
- **Architecture animation:** Sequential phases auto-advance. Click stage or dots to navigate manually. Progress bar fills over each phase's dwell time.
