/* Lost Objects — hidden easter-egg game.
 * Self-initializing IIFE. Injects its own overlay/CSS, listens for
 * clicks on any `.lo-icon` element in the page, and runs a lightweight
 * pacman-ish game on a canvas. Exposes `window.LOGame = { open, close }`.
 *
 * The `.lo-icon` element itself is rendered inline on each page so it
 * paints immediately with the rest of the nav (no layout shift).
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
    .lo-game-score b { color: #F0E8DC; font-family: "DM Serif Display", serif; font-size: 16px; font-weight: 400; letter-spacing: 0.04em; }
    .lo-game-close { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; line-height: 1; color: rgba(240,232,220,0.75); cursor: pointer; background: rgba(255,102,102,0.06); border: 1px solid rgba(255,102,102,0.35); border-radius: 2px; padding: 0; transition: color 0.2s, background 0.2s, border-color 0.2s; flex-shrink: 0; }
    .lo-game-close:hover { color: #0c0a08; background: #FF6666; border-color: #FF6666; }
    #lo-game-canvas { display: block; background: #13110f; }
    .lo-game-footer { padding: 11px 18px; border-top: 1px solid rgba(255,102,102,0.14); display: flex; justify-content: space-between; align-items: center; gap: 18px; }
    .lo-game-hint { font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(232,226,217,0.4); }
    .lo-game-start { font-size: 9px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #FF6666; border: 1px solid rgba(255,102,102,0.5); padding: 8px 20px; cursor: pointer; background: none; transition: background 0.2s, color 0.2s; }
    .lo-game-start:hover { background: #FF6666; color: #13110f; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ---------- Constants ---------- */
  const PC = '#FF6666';
  const CC = '#F0E8DC';
  const GRID = 20;
  const COLS = 27;
  const ROWS = 20;
  const CANVAS_W = COLS * GRID; // 540
  const CANVAS_H = ROWS * GRID; // 400
  const MOVE_INTERVAL = 5;   // player moves every 5 frames  (12/sec @ 60fps)
  const GHOST_INTERVAL = 8;  // ghosts move every 8 frames   (7.5/sec @ 60fps)
  const FRAME_MS = 1000 / 60;

  /* ---------- Maze (packed Uint8Array) ---------- */
  const WALLS = new Uint8Array(COLS * ROWS);
  const rawWalls = [
    [2,2],[3,2],[4,2],[5,2],[6,2],[8,2],[9,2],[10,2],[11,2],[15,2],[16,2],[17,2],[18,2],[20,2],[21,2],[22,2],[23,2],[24,2],
    [2,4],[6,4],[8,4],[11,4],[15,4],[18,4],[20,4],[24,4],[2,5],[6,5],[8,5],[11,5],[15,5],[18,5],[20,5],[24,5],
    [2,6],[3,6],[4,6],[6,6],[8,6],[9,6],[10,6],[11,6],[15,6],[16,6],[17,6],[18,6],[20,6],[22,6],[23,6],[24,6],
    [4,8],[5,8],[6,8],[8,8],[11,8],[12,8],[13,8],[14,8],[15,8],[18,8],[20,8],[21,8],[22,8],
    [2,10],[3,10],[4,10],[6,10],[8,10],[11,10],[15,10],[18,10],[20,10],[23,10],[24,10],
    [6,11],[8,11],[11,11],[15,11],[18,11],[20,11],
    [2,12],[3,12],[4,12],[6,12],[8,12],[9,12],[10,12],[15,12],[16,12],[17,12],[20,12],[22,12],[23,12],[24,12],
    [4,14],[6,14],[11,14],[12,14],[13,14],[14,14],[15,14],[20,14],[22,14],
    [2,16],[3,16],[4,16],[6,16],[8,16],[9,16],[10,16],[11,16],[15,16],[16,16],[17,16],[18,16],[20,16],[22,16],[23,16],[24,16],
    [2,17],[6,17],[20,17],[24,17],
    [2,18],[3,18],[4,18],[6,18],[7,18],[8,18],[9,18],[10,18],[11,18],[15,18],[16,18],[17,18],[18,18],[19,18],[20,18],[21,18],[22,18],[23,18],[24,18]
  ];
  for (let i = 0; i < rawWalls.length; i++) {
    const w = rawWalls[i];
    WALLS[w[1] * COLS + w[0]] = 1;
  }
  for (let c = 0; c < COLS; c++) { WALLS[c] = 1; WALLS[(ROWS - 1) * COLS + c] = 1; }
  for (let r = 0; r < ROWS; r++) { WALLS[r * COLS] = 1; WALLS[r * COLS + (COLS - 1)] = 1; }

  /* ---------- State ---------- */
  let overlay = null;
  let canvas = null;
  let ctx = null;
  let mazeCache = null;
  let scoreEl = null;
  let startEl = null;

  let raf = 0;
  let lastTs = 0;
  let frameCount = 0;

  let score = 0;
  let lives = 3;
  let gState = 'ready'; // 'ready' | 'playing' | 'over' | 'win'

  let playerC = 13, playerR = 15;
  let dirX = 0, dirY = 0;
  let nDirX = 1, nDirY = 0;
  let ang = 0;

  // Pellets: Map<packedIndex, type> where type 1 = small, 2 = big
  let pelletMap = null;
  let pelletCount = 0;

  // Ghosts: simple object array, no allocations in the hot path
  let ghosts = null;

  /* ---------- Pre-render the maze once per session ---------- */
  function buildMazeCache() {
    mazeCache = document.createElement('canvas');
    mazeCache.width = CANVAS_W;
    mazeCache.height = CANVAS_H;
    const mcx = mazeCache.getContext('2d', { alpha: false });
    mcx.fillStyle = '#13110f';
    mcx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    mcx.fillStyle = 'rgba(255,102,102,0.13)';
    mcx.strokeStyle = 'rgba(255,102,102,0.42)';
    mcx.lineWidth = 1;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (WALLS[r * COLS + c]) {
          const x = c * GRID;
          const y = r * GRID;
          mcx.fillRect(x, y, GRID, GRID);
          mcx.strokeRect(x + 0.5, y + 0.5, GRID - 1, GRID - 1);
        }
      }
    }
  }

  /* ---------- Init / Reset ---------- */
  function initGame() {
    score = 0;
    lives = 3;
    frameCount = 0;
    ang = 0;
    playerC = 13;
    playerR = 15;
    dirX = 0; dirY = 0;
    nDirX = 1; nDirY = 0;
    scoreEl.textContent = '0';

    pelletMap = new Map();
    pelletCount = 0;
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        if (WALLS[r * COLS + c]) continue;
        const big = (r === 2 && c === 2) ||
                    (r === 2 && c === COLS - 3) ||
                    (r === ROWS - 3 && c === 2) ||
                    (r === ROWS - 3 && c === COLS - 3);
        pelletMap.set(r * COLS + c, big ? 2 : 1);
        pelletCount++;
      }
    }

    ghosts = [
      { c: 13, r: 8, dx:  1, dy:  0, color: 'rgba(255,102,102,0.92)', scared: false, ft: 0 },
      { c: 14, r: 8, dx: -1, dy:  0, color: 'rgba(255,170,150,0.9)',  scared: false, ft: 0 },
      { c: 13, r: 9, dx:  0, dy:  1, color: 'rgba(140,180,200,0.9)',  scared: false, ft: 0 },
      { c: 14, r: 9, dx:  0, dy: -1, color: 'rgba(240,232,220,0.82)', scared: false, ft: 0 }
    ];
  }

  /* ---------- Per-frame game logic ---------- */
  function tick() {
    frameCount++;
    ang += 0.11;

    // ----- Player movement (every MOVE_INTERVAL frames) -----
    if (frameCount % MOVE_INTERVAL === 0) {
      // Try buffered direction first
      let tc = playerC + nDirX;
      let tr = playerR + nDirY;
      if (tc < 0) tc += COLS; else if (tc >= COLS) tc -= COLS;
      if (tr < 0) tr += ROWS; else if (tr >= ROWS) tr -= ROWS;
      if (!WALLS[tr * COLS + tc]) {
        dirX = nDirX;
        dirY = nDirY;
      }

      // Move in current direction
      let mc = playerC + dirX;
      let mr = playerR + dirY;
      if (mc < 0) mc += COLS; else if (mc >= COLS) mc -= COLS;
      if (mr < 0) mr += ROWS; else if (mr >= ROWS) mr -= ROWS;
      if (!WALLS[mr * COLS + mc]) {
        playerC = mc;
        playerR = mr;
      }

      // Eat pellet (O(1) lookup)
      const k = playerR * COLS + playerC;
      const p = pelletMap.get(k);
      if (p !== undefined) {
        pelletMap.delete(k);
        pelletCount--;
        if (p === 2) {
          score += 50;
          for (let i = 0; i < 4; i++) {
            ghosts[i].scared = true;
            ghosts[i].ft = 0;
          }
        } else {
          score += 10;
        }
        scoreEl.textContent = score;
        if (pelletCount === 0) gState = 'win';
      }
    }

    // ----- Ghost movement (every GHOST_INTERVAL frames) -----
    if (frameCount % GHOST_INTERVAL === 0) {
      for (let i = 0; i < 4; i++) {
        const g = ghosts[i];
        if (g.scared) {
          g.ft++;
          if (g.ft > 40) { g.scared = false; g.ft = 0; }
        }

        // Enumerate valid forward/side dirs (exclude reverse)
        // dirCandidates reused as stack allocation — 4 entries max
        const valid = [];
        // right
        if (!(g.dx === -1 && g.dy === 0)) {
          let c = g.c + 1, r = g.r;
          if (c >= COLS) c -= COLS;
          if (!WALLS[r * COLS + c]) valid.push(1, 0);
        }
        // left
        if (!(g.dx === 1 && g.dy === 0)) {
          let c = g.c - 1, r = g.r;
          if (c < 0) c += COLS;
          if (!WALLS[r * COLS + c]) valid.push(-1, 0);
        }
        // down
        if (!(g.dx === 0 && g.dy === -1)) {
          let c = g.c, r = g.r + 1;
          if (r >= ROWS) r -= ROWS;
          if (!WALLS[r * COLS + c]) valid.push(0, 1);
        }
        // up
        if (!(g.dx === 0 && g.dy === 1)) {
          let c = g.c, r = g.r - 1;
          if (r < 0) r += ROWS;
          if (!WALLS[r * COLS + c]) valid.push(0, -1);
        }

        let chX, chY;
        if (valid.length === 0) {
          chX = -g.dx; chY = -g.dy;
        } else if (g.scared || Math.random() < 0.22) {
          // Random move (scared or occasional wandering)
          const idx = ((Math.random() * (valid.length / 2)) | 0) * 2;
          chX = valid[idx]; chY = valid[idx + 1];
        } else {
          // Greedy toward player
          let bestD = 1e9, bX = valid[0], bY = valid[1];
          for (let j = 0; j < valid.length; j += 2) {
            let tc = g.c + valid[j];
            let tr = g.r + valid[j + 1];
            if (tc < 0) tc += COLS; else if (tc >= COLS) tc -= COLS;
            if (tr < 0) tr += ROWS; else if (tr >= ROWS) tr -= ROWS;
            const d = Math.abs(tc - playerC) + Math.abs(tr - playerR);
            if (d < bestD) { bestD = d; bX = valid[j]; bY = valid[j + 1]; }
          }
          chX = bX; chY = bY;
        }

        g.dx = chX; g.dy = chY;
        let nc = g.c + chX;
        let nr = g.r + chY;
        if (nc < 0) nc += COLS; else if (nc >= COLS) nc -= COLS;
        if (nr < 0) nr += ROWS; else if (nr >= ROWS) nr -= ROWS;
        g.c = nc;
        g.r = nr;

        // Collision
        if (g.c === playerC && g.r === playerR) {
          if (g.scared) {
            g.scared = false;
            g.c = 13; g.r = 8;
            score += 200;
            scoreEl.textContent = score;
          } else {
            lives--;
            if (lives <= 0) {
              gState = 'over';
            } else {
              playerC = 13;
              playerR = 15;
              dirX = 0; dirY = 0;
              nDirX = 1; nDirY = 0;
            }
          }
        }
      }
    }
  }

  /* ---------- Drawing ---------- */
  function drawPlayer(px, py, size, angle) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.8, -size * 0.6, size, size * 0.3, size * 0.3, size * 0.8);
    ctx.bezierCurveTo(0, size, -size * 0.3, size * 0.8, -size * 0.3, size * 0.8);
    ctx.bezierCurveTo(-size, size * 0.3, -size * 0.8, -size * 0.6, 0, -size);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,102,102,0.32)';
    ctx.fill();
    ctx.strokeStyle = PC;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = PC;
    ctx.fill();
    ctx.restore();
  }

  function drawGhost(g) {
    const px = g.c * GRID + GRID / 2;
    const py = g.r * GRID + GRID / 2;
    const s = GRID * 0.4;
    ctx.save();
    ctx.translate(px, py);
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s, Math.PI, 0);
    ctx.lineTo(s, s * 0.9);
    ctx.lineTo(s * 0.55, s * 0.55);
    ctx.lineTo(s * 0.15, s * 0.9);
    ctx.lineTo(-s * 0.15, s * 0.55);
    ctx.lineTo(-s * 0.55, s * 0.9);
    ctx.lineTo(-s, s * 0.9);
    ctx.closePath();
    ctx.fillStyle = g.scared ? 'rgba(140,180,220,0.85)' : g.color;
    ctx.fill();
    // Eyes (simpler when scared)
    if (g.scared) {
      ctx.fillStyle = '#F0E8DC';
      ctx.beginPath(); ctx.arc(-s * 0.28, -s * 0.05, s * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc( s * 0.28, -s * 0.05, s * 0.1, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#F0E8DC';
      ctx.beginPath(); ctx.arc(-s * 0.32, -s * 0.1, s * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc( s * 0.32, -s * 0.1, s * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0c0a08';
      ctx.beginPath(); ctx.arc(-s * 0.26, -s * 0.08, s * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc( s * 0.38, -s * 0.08, s * 0.1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function draw() {
    // Maze background (pre-rendered)
    ctx.drawImage(mazeCache, 0, 0);

    // Small pellets — single batched path
    ctx.fillStyle = 'rgba(240,232,220,0.62)';
    ctx.beginPath();
    for (const [k, t] of pelletMap) {
      if (t !== 1) continue;
      const c = k % COLS;
      const r = (k / COLS) | 0;
      const x = c * GRID + GRID / 2;
      const y = r * GRID + GRID / 2;
      ctx.moveTo(x + 2.2, y);
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    }
    ctx.fill();

    // Big pellets — separate batch (different color/size)
    ctx.fillStyle = CC;
    ctx.beginPath();
    for (const [k, t] of pelletMap) {
      if (t !== 2) continue;
      const c = k % COLS;
      const r = (k / COLS) | 0;
      const x = c * GRID + GRID / 2;
      const y = r * GRID + GRID / 2;
      ctx.moveTo(x + 4, y);
      ctx.arc(x, y, 4, 0, Math.PI * 2);
    }
    ctx.fill();

    // Ghosts
    for (let i = 0; i < 4; i++) drawGhost(ghosts[i]);

    // Player
    drawPlayer(playerC * GRID + GRID / 2, playerR * GRID + GRID / 2, GRID * 0.44, ang * 0.6);

    // Lives HUD
    for (let i = 0; i < lives; i++) drawPlayer(14 + i * 18, CANVAS_H - 10, 5, ang * 0.3);

    // State overlay
    if (gState !== 'playing') {
      ctx.fillStyle = 'rgba(12,11,10,0.82)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.textAlign = 'center';
      let title, sub, color;
      if (gState === 'ready') {
        title = 'Lost Object'; sub = 'PRESS START TO PLAY'; color = PC;
      } else if (gState === 'over') {
        title = 'You got lost.'; sub = 'SCORE: ' + score + '  —  PRESS START TO RETRY'; color = PC;
      } else if (gState === 'win') {
        title = 'Found.'; sub = 'SCORE: ' + score + '  —  ALL OBJECTS RECOVERED'; color = CC;
      }
      if (title) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.95;
        ctx.font = 'italic 28px "DM Serif Display", serif';
        ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 14);
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(232,226,217,0.55)';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(sub, CANVAS_W / 2, CANVAS_H / 2 + 14);
      }
    }
  }

  /* ---------- Frame loop (60fps render, gated tick) ---------- */
  function frame(ts) {
    if (!raf) return;
    if (ts - lastTs >= FRAME_MS - 1) {
      lastTs = ts;
      if (gState === 'playing') tick();
      draw();
    }
    raf = requestAnimationFrame(frame);
  }

  /* ---------- Build DOM (lazy, idempotent) ---------- */
  function build() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'lo-game-overlay';
    overlay.innerHTML =
      '<div class="lo-game-modal">' +
        '<div class="lo-game-header">' +
          '<div class="lo-game-title">Lost Object — <span>The Game</span></div>' +
          '<div class="lo-game-score">Score <b id="lo-game-score-val">0</b></div>' +
          '<button class="lo-game-close" type="button" aria-label="Close game">&#x2715;</button>' +
        '</div>' +
        '<canvas id="lo-game-canvas" width="' + CANVAS_W + '" height="' + CANVAS_H + '"></canvas>' +
        '<div class="lo-game-footer">' +
          '<span class="lo-game-hint">Arrow keys or WASD — collect the lost objects</span>' +
          '<button class="lo-game-start" type="button">Start</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    canvas = overlay.querySelector('#lo-game-canvas');
    ctx = canvas.getContext('2d', { alpha: false });
    scoreEl = overlay.querySelector('#lo-game-score-val');
    startEl = overlay.querySelector('.lo-game-start');

    overlay.querySelector('.lo-game-close').addEventListener('click', close);
    startEl.addEventListener('click', startGame);

    buildMazeCache();
    initGame();
    gState = 'ready';
  }

  /* ---------- Controls ---------- */
  function startGame() {
    initGame();
    gState = 'playing';
    startEl.textContent = 'Restart';
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
  }

  window.LOGame = { open: open, close: close };

  /* ---------- Click delegation on .lo-icon ---------- */
  document.addEventListener('click', function (e) {
    const t = e.target.closest && e.target.closest('.lo-icon');
    if (t) open();
  });

  /* ---------- Keyboard ---------- */
  const KM = {
    ArrowUp:    [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
    W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0]
  };
  document.addEventListener('keydown', function (e) {
    if (!overlay || !overlay.classList.contains('open')) return;
    const km = KM[e.key];
    if (km) {
      nDirX = km[0];
      nDirY = km[1];
      e.preventDefault();
    } else if (e.key === 'Escape') {
      close();
    }
  });

  /* ---------- Touch swipe ---------- */
  let touchStart = null;
  document.addEventListener('touchstart', function (e) {
    if (!overlay || !overlay.classList.contains('open')) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!touchStart || !overlay || !overlay.classList.contains('open')) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      nDirX = dx > 0 ? 1 : -1; nDirY = 0;
    } else {
      nDirX = 0; nDirY = dy > 0 ? 1 : -1;
    }
    touchStart = null;
  }, { passive: true });
})();
