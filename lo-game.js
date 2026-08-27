/* Lost Objects — AFTER HOURS SNAKE (hidden easter-egg game).
 * Self-initializing IIFE. Injects its own overlay/CSS, stays dormant until
 * triggered, and runs a dependency-free snake game on a canvas.
 * Exposes `window.LOGame = { open, close }`.
 *
 * TRIGGER — the whole "Lost Objects: After Hours" chip in the Join the
 * Community section (`.ah-kicker`, logo + text together, in index.html):
 * a single click or tap. It glows coral on hover and takes a pointer cursor.
 * The chip is a plain <div> with no href, so nothing is being overridden; the
 * Discord invite stays reachable from the death screen's closing link.
 * A legacy `.lo-icon` click delegate is kept too, so re-adding that nav icon
 * would light the game up again with no change here.
 *
 * The modal shell, blur backdrop, open/close machinery, lazy DOM build and
 * z-index stacking below are carried over unchanged from the previous game.
 */
(function () {
  'use strict';
  if (window.__loGameLoaded) return;
  window.__loGameLoaded = true;

  /* ---------- CSS ---------- */
  const CSS = `
    .lo-game-overlay { display: none; position: fixed; inset: 0; background: rgba(10,9,8,0.94); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
    /* On mobile/tablet (<=1024px) the nav is promoted to its own top GPU layer at
       z-index 10000 (in index.html) to fix iOS bleed-through, which would clip the
       top of this full-screen modal. Raise the overlay above it there. Scoped to
       <=1024px only, so desktop keeps its original z-index 1000 stacking (below
       the grain/vignette overlays) unchanged — desktop nav is only 200, so 1000
       already sits above it. */
    @media (max-width: 1024px) {
      .lo-game-overlay { z-index: 10002; }
    }
    .lo-game-overlay.open { display: flex; }
    .lo-game-modal { position: relative; background: #14120f; border: 1px solid rgba(255,102,102,0.3); display: flex; flex-direction: column; max-width: 95vw; box-shadow: 0 28px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,102,102,0.06); }
    .lo-game-header { padding: 14px 18px; border-bottom: 1px solid rgba(255,102,102,0.18); display: flex; justify-content: space-between; align-items: center; gap: 20px; }
    .lo-game-title { font-size: 10px; font-weight: 600; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(232,226,217,0.55); white-space: nowrap; }
    .lo-game-title span { color: #FF6666; }
    .lo-game-score { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(232,226,217,0.55); white-space: nowrap; display: flex; align-items: baseline; gap: 9px; }
    .lo-game-score b { color: #F0E8DC; font-family: 'Built Titling', 'Arial Narrow', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 0.04em; }
    .lo-game-close { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; line-height: 1; color: rgba(240,232,220,0.75); cursor: pointer; background: rgba(255,102,102,0.06); border: 1px solid rgba(255,102,102,0.35); border-radius: 2px; padding: 0; transition: color 0.2s, background 0.2s, border-color 0.2s; flex-shrink: 0; }
    .lo-game-close:hover { color: #0c0a08; background: #FF6666; border-color: #FF6666; }
    #lo-game-canvas { display: block; background: #13110f; }
    .lo-game-footer { padding: 11px 18px; border-top: 1px solid rgba(255,102,102,0.14); display: flex; justify-content: space-between; align-items: center; gap: 18px; }
    .lo-game-hint { font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(232,226,217,0.4); }
    .lo-game-start { font-size: 9px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #FF6666; border: 1px solid rgba(255,102,102,0.5); padding: 8px 20px; cursor: pointer; background: none; transition: background 0.2s, color 0.2s; }
    .lo-game-start:hover { background: #FF6666; color: #13110f; }

    /* ---- Title / death cards. DOM rather than canvas text, so Built Titling
            and the Discord link come for free and stay accessible. ---- */
    .lo-game-stage { position: relative; line-height: 0; touch-action: none; }
    .lo-game-panel { position: absolute; inset: 0; display: none; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 18px; background: rgba(17,15,13,0.9); line-height: 1.4; }
    .lo-game-panel.show { display: flex; }
    .lo-game-big { font-family: 'Built Titling', 'Arial Narrow', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; line-height: 0.92; color: #F0E8DC; font-size: 58px; }
    .lo-game-big em { font-style: normal; color: #FF6666; }
    .lo-game-rule { width: 40px; height: 2px; background: #FF6666; margin: 14px 0 0; box-shadow: 0 0 12px rgba(255,102,102,0.55); }
    .lo-game-sub { margin-top: 14px; font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(232,226,217,0.42); }
    .lo-game-tally { margin-top: 16px; display: flex; gap: 26px; align-items: baseline; }
    .lo-game-tally div { font-size: 8px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(232,226,217,0.42); }
    .lo-game-tally b { display: block; margin-top: 5px; font-family: 'Built Titling', 'Arial Narrow', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: 0.03em; color: #F0E8DC; }
    .lo-game-tally b.hot { color: #FF6666; }
    .lo-game-again { margin-top: 20px; font-size: 9px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #FF6666; border: 1px solid rgba(255,102,102,0.5); padding: 9px 22px; cursor: pointer; background: none; transition: background 0.2s, color 0.2s; }
    .lo-game-again:hover { background: #FF6666; color: #13110f; }
    .lo-game-note { margin-top: 16px; font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase; }
    .lo-game-note a { color: rgba(232,226,217,0.4); text-decoration: none; border-bottom: 1px solid rgba(255,102,102,0.35); padding-bottom: 2px; transition: color 0.2s, border-color 0.2s; }
    .lo-game-note a:hover { color: #FF6666; border-bottom-color: #FF6666; }

    /* NEW BEST badge — flashes in the header the moment the record falls */
    .lo-game-nb { font-size: 8px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #FF6666; border: 1px solid rgba(255,102,102,0.45); padding: 3px 8px; opacity: 0; pointer-events: none; }
    .lo-game-nb.flash { animation: loNbFlash 1.6s ease-out; }
    @keyframes loNbFlash {
      0%   { opacity: 0; transform: scale(0.9); }
      12%  { opacity: 1; transform: scale(1); }
      70%  { opacity: 1; }
      100% { opacity: 0; }
    }

    @media (max-width: 640px) {
      .lo-game-big { font-size: 40px; }
      .lo-game-tally b { font-size: 21px; }
      .lo-game-header, .lo-game-footer { padding-left: 12px; padding-right: 12px; }
      .lo-game-hint { font-size: 7px; letter-spacing: 0.14em; }
    }

    /* Easter-egg trigger: the whole After Hours chip (logo + text). Glyph-shaped
       coral glow via drop-shadow rather than box-shadow, since the chip has no
       fill or border to cast a rectangle from — the two-layer radius mirrors the
       hero button's 0 0 24px / 0 0 7px coral glow convention, so it reads as
       the same family of interaction. Layout is untouched. */
    .ah-kicker {
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
      transition: filter 0.25s ease;
    }
    .ah-kicker:hover {
      filter: brightness(1.12)
              drop-shadow(0 0 10px rgba(255,102,102,0.55))
              drop-shadow(0 0 3px rgba(255,102,102,0.45));
    }
    @media (hover: none) {
      /* No hover on touch — don't leave the glow stuck after a tap. */
      .ah-kicker:hover { filter: none; }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ---------- Constants ---------- */
  const PC = '#FF6666';          // coral
  const CC = '#F0E8DC';          // cream
  const GRID = 20;
  const COLS = 27;
  const ROWS = 20;
  const CANVAS_W = COLS * GRID;  // 540
  const CANVAS_H = ROWS * GRID;  // 400
  const BG = '#13110f';

  const DISCORD = 'https://discord.gg/ZqGhVfJu2a';
  const BEST_KEY = 'lo_snake_best';

  // Gentle speed ramp: one step every STEP_START ms, easing down to STEP_MIN.
  const STEP_START = 138;
  const STEP_MIN = 66;
  const STEP_RAMP = 2.4;         // ms shaved per object recovered

  const SWIPE_MIN = 24;          // px before a swipe counts

  /* ---------- State ---------- */
  let overlay = null;
  let canvas = null;
  let ctx = null;
  let stageEl = null;
  let scoreEl = null;
  let bestEl = null;
  let startEl = null;
  let titleEl = null;
  let deadEl = null;
  let nbEl = null;
  let finalScoreEl = null;
  let finalBestEl = null;
  let deadHeadEl = null;

  let raf = 0;
  let lastTs = 0;
  let acc = 0;

  let gState = 'title';          // 'title' | 'playing' | 'dead'
  let snake = null;              // array of {x,y}; head at index 0
  let occupied = null;           // Uint8Array collision map, no per-step scans
  let dirX = 1, dirY = 0;
  let nDirX = 1, nDirY = 0;
  let food = null;               // {x, y, kind}
  let score = 0;
  let best = 0;
  let grow = 0;
  let beatBest = false;

  let grainPattern = null;

  /* ---------- Persistent best ---------- */
  function loadBest() {
    try {
      const v = parseInt(localStorage.getItem(BEST_KEY), 10);
      best = (isFinite(v) && v > 0) ? v : 0;
    } catch (e) { best = 0; }
  }
  function saveBest() {
    try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) {}
  }

  /* ---------- Film-grain tile, built once ---------- */
  function buildGrain() {
    const t = document.createElement('canvas');
    t.width = t.height = 96;
    const g = t.getContext('2d');
    const img = g.createImageData(96, 96);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    grainPattern = ctx.createPattern(t, 'repeat');
  }

  /* ---------- Collectibles: small white film-gear line sprites ---------- */
  function sprLens(cx, cy, s) {
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.46, 0, Math.PI * 2);
    ctx.moveTo(cx + s * 0.26, cy);
    ctx.arc(cx, cy, s * 0.26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.1, 0, Math.PI * 2);
    ctx.stroke();
  }
  function sprClapper(cx, cy, s) {
    const w = s * 0.92, h = s * 0.62;
    const x = cx - w / 2, y = cy - h / 2 + s * 0.14;
    ctx.strokeRect(x, y, w, h - s * 0.06);
    // hinged top bar
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.06);
    ctx.lineTo(x + w, y - s * 0.22);
    ctx.lineTo(x + w, y - s * 0.04);
    ctx.lineTo(x, y + s * 0.1);
    ctx.closePath();
    ctx.stroke();
    // two slate stripes
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y - s * 0.03); ctx.lineTo(x + w * 0.22, y + s * 0.09);
    ctx.moveTo(x + w * 0.68, y - s * 0.11); ctx.lineTo(x + w * 0.6, y + s * 0.02);
    ctx.stroke();
  }
  function sprTape(cx, cy, s) {
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.17, 0, Math.PI * 2);
    ctx.stroke();
    // peeling end
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.42, cy + s * 0.14);
    ctx.lineTo(cx + s * 0.62, cy + s * 0.3);
    ctx.stroke();
  }
  const SPRITES = [sprLens, sprClapper, sprTape];

  /* ---------- Game setup ---------- */
  function idx(x, y) { return y * COLS + x; }

  function initGame() {
    snake = [{ x: 13, y: 10 }, { x: 12, y: 10 }, { x: 11, y: 10 }];
    occupied = new Uint8Array(COLS * ROWS);
    for (let i = 0; i < snake.length; i++) occupied[idx(snake[i].x, snake[i].y)] = 1;
    dirX = 1; dirY = 0; nDirX = 1; nDirY = 0;
    score = 0; grow = 0; beatBest = false;
    acc = 0;
    placeFood();
    syncHud();
  }

  function placeFood() {
    const free = COLS * ROWS - snake.length;
    if (free <= 0) { food = null; return; }
    let n = (Math.random() * free) | 0;
    for (let i = 0; i < COLS * ROWS; i++) {
      if (occupied[i]) continue;
      if (n-- === 0) {
        food = { x: i % COLS, y: (i / COLS) | 0, kind: (Math.random() * SPRITES.length) | 0 };
        return;
      }
    }
  }

  function stepMs() {
    return Math.max(STEP_MIN, STEP_START - score * STEP_RAMP);
  }

  /* ---------- One simulation step ---------- */
  function step() {
    // Apply the queued turn, rejecting 180s against the direction actually travelled
    if (!(nDirX === -dirX && nDirY === -dirY)) { dirX = nDirX; dirY = nDirY; }

    const hx = snake[0].x + dirX;
    const hy = snake[0].y + dirY;

    if (hx < 0 || hy < 0 || hx >= COLS || hy >= ROWS) return die();
    // Walking into the current tail tile is legal — it moves out of the way.
    const tail = snake[snake.length - 1];
    const intoTail = (grow === 0 && hx === tail.x && hy === tail.y);
    if (occupied[idx(hx, hy)] && !intoTail) return die();

    snake.unshift({ x: hx, y: hy });
    occupied[idx(hx, hy)] = 1;

    if (food && hx === food.x && hy === food.y) {
      score++;
      grow += 2;
      if (score > best) {
        best = score;
        if (!beatBest) { beatBest = true; flashNewBest(); }
      }
      placeFood();
      syncHud();
    }

    if (grow > 0) { grow--; }
    else {
      const t = snake.pop();
      occupied[idx(t.x, t.y)] = 0;
    }
  }

  function die() {
    gState = 'dead';
    if (beatBest) saveBest();
    finalScoreEl.textContent = score;
    finalBestEl.textContent = best;
    finalScoreEl.className = beatBest ? 'hot' : '';
    deadHeadEl.innerHTML = beatBest ? 'New <em>Best.</em>' : 'Object <em>Lost.</em>';
    setPanel();
    startEl.textContent = 'Restart';
  }

  /* ---------- Drawing ---------- */
  function draw() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // hairline field border, matching the site's keyline language
    ctx.strokeStyle = 'rgba(255,102,102,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, CANVAS_W - 1, CANVAS_H - 1);

    // collectible
    if (food) {
      ctx.strokeStyle = CC;
      ctx.lineWidth = 1.4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      SPRITES[food.kind](food.x * GRID + GRID / 2, food.y * GRID + GRID / 2, GRID * 0.74);
    }

    // snake — coral, head brightest, body easing back
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i];
      const t = 1 - (i / Math.max(snake.length, 1)) * 0.55;
      ctx.globalAlpha = 0.45 + t * 0.55;
      ctx.fillStyle = PC;
      const pad = i === 0 ? 2 : 3;
      ctx.fillRect(s.x * GRID + pad, s.y * GRID + pad, GRID - pad * 2, GRID - pad * 2);
    }
    ctx.globalAlpha = 1;

    // head glow
    if (snake.length) {
      const h = snake[0];
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.shadowColor = PC;
      ctx.shadowBlur = 16;
      ctx.fillStyle = PC;
      ctx.fillRect(h.x * GRID + 2, h.y * GRID + 2, GRID - 4, GRID - 4);
      ctx.restore();
    }

    // the site's grain, drawn into the canvas so it reads identically on
    // desktop (where the page's .grain sits above the modal) and mobile (where
    // the modal sits above it).
    if (grainPattern) {
      const ox = -((Math.random() * 96) | 0);
      const oy = -((Math.random() * 96) | 0);
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.globalCompositeOperation = 'overlay';
      ctx.translate(ox, oy);
      ctx.fillStyle = grainPattern;
      ctx.fillRect(0, 0, CANVAS_W - ox, CANVAS_H - oy);
      ctx.restore();
    }
  }

  /* ---------- Loop ---------- */
  function frame(ts) {
    if (!lastTs) lastTs = ts;
    let dt = ts - lastTs;
    lastTs = ts;
    if (dt > 250) dt = 250;      // tab was backgrounded; don't fast-forward

    if (gState === 'playing') {
      acc += dt;
      const iv = stepMs();
      while (acc >= iv && gState === 'playing') { acc -= iv; step(); }
    }
    draw();
    raf = requestAnimationFrame(frame);
  }

  /* ---------- HUD ---------- */
  function syncHud() {
    scoreEl.textContent = score;
    bestEl.textContent = best;
  }
  function flashNewBest() {
    nbEl.classList.remove('flash');
    void nbEl.offsetWidth;       // restart the animation
    nbEl.classList.add('flash');
  }
  function setPanel() {
    titleEl.classList.toggle('show', gState === 'title');
    deadEl.classList.toggle('show', gState === 'dead');
  }

  /* ---------- Build DOM (lazy, idempotent) ---------- */
  function build() {
    if (overlay) return;
    loadBest();
    overlay = document.createElement('div');
    overlay.className = 'lo-game-overlay';
    overlay.innerHTML =
      '<div class="lo-game-modal">' +
        '<div class="lo-game-header">' +
          '<div class="lo-game-title">After Hours — <span>Snake</span></div>' +
          '<div class="lo-game-score">' +
            '<span class="lo-game-nb" id="lo-game-nb">New Best</span>' +
            'Score <b id="lo-game-score-val">0</b>' +
            'Best <b id="lo-game-best-val">0</b>' +
          '</div>' +
          '<button class="lo-game-close" type="button" aria-label="Close game">&#x2715;</button>' +
        '</div>' +
        '<div class="lo-game-stage">' +
          '<canvas id="lo-game-canvas" width="' + CANVAS_W + '" height="' + CANVAS_H + '"></canvas>' +
          '<div class="lo-game-panel show" id="lo-game-title-panel">' +
            '<div class="lo-game-big">After <em>Hours</em></div>' +
            '<div class="lo-game-rule"></div>' +
            '<div class="lo-game-sub">Arrows / WASD / Swipe</div>' +
          '</div>' +
          '<div class="lo-game-panel" id="lo-game-dead-panel">' +
            '<div class="lo-game-big" id="lo-game-dead-head">Object <em>Lost.</em></div>' +
            '<div class="lo-game-tally">' +
              '<div>Recovered<b id="lo-game-final">0</b></div>' +
              '<div>Best<b id="lo-game-finalbest">0</b></div>' +
            '</div>' +
            '<button class="lo-game-again" type="button">Run it back</button>' +
            '<div class="lo-game-note">' +
              '<a href="' + DISCORD + '" target="_blank" rel="noopener noreferrer">Built for the ones still here after hours</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="lo-game-footer">' +
          '<span class="lo-game-hint">Arrows or WASD — recover the lost objects · Esc to quit</span>' +
          '<button class="lo-game-start" type="button">Start</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    canvas = overlay.querySelector('#lo-game-canvas');
    ctx = canvas.getContext('2d', { alpha: false });
    stageEl = overlay.querySelector('.lo-game-stage');
    scoreEl = overlay.querySelector('#lo-game-score-val');
    bestEl = overlay.querySelector('#lo-game-best-val');
    startEl = overlay.querySelector('.lo-game-start');
    titleEl = overlay.querySelector('#lo-game-title-panel');
    deadEl = overlay.querySelector('#lo-game-dead-panel');
    nbEl = overlay.querySelector('#lo-game-nb');
    finalScoreEl = overlay.querySelector('#lo-game-final');
    finalBestEl = overlay.querySelector('#lo-game-finalbest');
    deadHeadEl = overlay.querySelector('#lo-game-dead-head');

    overlay.querySelector('.lo-game-close').addEventListener('click', close);
    overlay.querySelector('.lo-game-again').addEventListener('click', startGame);
    startEl.addEventListener('click', startGame);

    buildGrain();
    initGame();
    gState = 'title';
    setPanel();
  }

  /* ---------- Controls ---------- */
  function startGame() {
    initGame();
    gState = 'playing';
    setPanel();
    startEl.textContent = 'Restart';
  }

  function turn(x, y) {
    if (gState === 'title') { startGame(); }
    else if (gState !== 'playing') return;
    if (x === -dirX && y === -dirY) return;   // no 180s
    nDirX = x; nDirY = y;
  }

  function open() {
    build();
    overlay.classList.add('open');
    if (!raf) {
      lastTs = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  function close() {
    if (overlay) overlay.classList.remove('open');
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    // Esc / X quits outright — come back to a clean title card.
    if (overlay) {
      gState = 'title';
      initGame();
      setPanel();
      startEl.textContent = 'Start';
    }
  }

  function isOpen() { return !!overlay && overlay.classList.contains('open'); }

  window.LOGame = { open: open, close: close };

  /* ---------- Trigger: the After Hours chip in Join the Community ---------- */
  /* One click or tap on the whole zone — logo and text alike. A tap fires a
     click on every mobile browser, so this covers touch with no extra handlers
     (and the game's own touch listeners all gate on isOpen(), so they can't
     swallow the opening tap). */
  function armTrigger(el) {
    if (!el || el.__loArmed) return;
    el.__loArmed = true;
    el.addEventListener('click', function (e) {
      if (isOpen()) return;
      // Defensive: the chip has no href today, but if a link is ever nested
      // here the game takes the click and the Discord invite stays reachable
      // from the death screen's closing line.
      e.preventDefault();
      open();
    });
  }

  function armAll() {
    armTrigger(document.querySelector('.ah-kicker'));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armAll);
  } else {
    armAll();
  }

  /* Legacy: a `.lo-icon` anywhere in the page still opens the game. */
  document.addEventListener('click', function (e) {
    const t = e.target.closest && e.target.closest('.lo-icon');
    if (t) open();
  });

  /* ---------- Keyboard ---------- */
  const KM = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
    W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0]
  };
  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { close(); return; }
    const km = KM[e.key];
    if (km) {
      turn(km[0], km[1]);
      e.preventDefault();          // keep arrows/WASD from scrolling the page
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      if (gState !== 'playing') startGame();
      e.preventDefault();
    }
  });

  /* ---------- Touch: swipe to steer, and no page scroll while open ---------- */
  let touchStart = null;
  document.addEventListener('touchstart', function (e) {
    if (!isOpen()) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!isOpen()) return;
    if (e.cancelable) e.preventDefault();   // lock the page behind the modal
  }, { passive: false });

  document.addEventListener('touchend', function (e) {
    if (!touchStart || !isOpen()) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return;
    if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
    else turn(0, dy > 0 ? 1 : -1);
  }, { passive: true });
})();
