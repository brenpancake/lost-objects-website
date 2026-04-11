/*!
 * Lost Objects — Cursor Chromatic Aberration Effect
 * Drop one line into every page before </body>:
 * <script src="cursor-fx.js"></script>
 */
(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────── */
  const CFG = {
    radius:      120,    /* px — size of the effect zone              */
    strength:    3.2,    /* px — max channel split at edge of zone    */
    innerFade:   0.35,   /* 0-1 — how much of radius before fade-in   */
    speed:       0.1,    /* lerp factor — how quickly cursor follows  */
    moveBoost:   2.2,    /* multiplier when moving fast               */
    boostDecay:  0.08,   /* how quickly boost fades                   */
    dotSize:     5,      /* px — cursor dot radius                    */
    ringSize:    22,     /* px — outer ring radius                    */
    color:       '255,102,102', /* RGB of cursor accent (--pink)      */
  };

  /* ── STATE ──────────────────────────────────────── */
  let mx = -999, my = -999;        /* raw mouse position               */
  let cx = -999, cy = -999;        /* lerped cursor position           */
  let px = -999, py = -999;        /* previous lerped position         */
  let boost = 0;                   /* current speed boost              */
  let raf;

  /* ── CANVAS SETUP ───────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.id = 'lo-cursor-fx';
  Object.assign(canvas.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '99997',
    mixBlendMode:  'screen',
    opacity:       '1',
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  /* ── CUSTOM CURSOR DOT ──────────────────────────── */
  const dot = document.createElement('div');
  dot.id = 'lo-cursor-dot';
  Object.assign(dot.style, {
    position:        'fixed',
    width:           CFG.dotSize * 2 + 'px',
    height:          CFG.dotSize * 2 + 'px',
    borderRadius:    '50%',
    background:      `rgba(${CFG.color}, 0.85)`,
    pointerEvents:   'none',
    zIndex:          '99999',
    transform:       'translate(-50%, -50%)',
    transition:      'width 0.2s, height 0.2s, opacity 0.3s',
    mixBlendMode:    'screen',
    top:             '0',
    left:            '0',
  });
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.id = 'lo-cursor-ring';
  Object.assign(ring.style, {
    position:        'fixed',
    width:           CFG.ringSize * 2 + 'px',
    height:          CFG.ringSize * 2 + 'px',
    borderRadius:    '50%',
    border:          `1px solid rgba(${CFG.color}, 0.25)`,
    pointerEvents:   'none',
    zIndex:          '99998',
    transform:       'translate(-50%, -50%)',
    transition:      'width 0.35s ease, height 0.35s ease, border-color 0.35s, opacity 0.3s',
    top:             '0',
    left:            '0',
    opacity:         '0',
  });
  document.body.appendChild(ring);

  /* ── RESIZE ─────────────────────────────────────── */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ── MOUSE TRACKING ─────────────────────────────── */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    ring.style.opacity = '1';
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    ring.style.opacity = '0';
    dot.style.opacity  = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  /* Grow cursor on interactive elements */
  document.addEventListener('mouseover', e => {
    const tag = e.target.tagName;
    const isLink = tag === 'A' || tag === 'BUTTON' || e.target.style.cursor === 'pointer'
      || window.getComputedStyle(e.target).cursor === 'pointer';
    if (isLink) {
      dot.style.width  = CFG.dotSize * 3 + 'px';
      dot.style.height = CFG.dotSize * 3 + 'px';
      ring.style.width  = CFG.ringSize * 2.5 + 'px';
      ring.style.height = CFG.ringSize * 2.5 + 'px';
      ring.style.borderColor = `rgba(${CFG.color}, 0.5)`;
    } else {
      dot.style.width  = CFG.dotSize * 2 + 'px';
      dot.style.height = CFG.dotSize * 2 + 'px';
      ring.style.width  = CFG.ringSize * 2 + 'px';
      ring.style.height = CFG.ringSize * 2 + 'px';
      ring.style.borderColor = `rgba(${CFG.color}, 0.25)`;
    }
  }, { passive: true });

  /* ── LERP HELPER ────────────────────────────────── */
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ── DRAW CHROMATIC ABERRATION ───────────────────── */
  function drawAberration(x, y, str) {
    if (str < 0.1) return;

    const r = CFG.radius;

    /* We sample a region of the page behind the cursor using
       ctx.drawImage(canvas) — but since we're drawing ON the canvas,
       we capture the underlying page using a clip-based RGB shift.

       Technique: draw three overlapping radial transparent rects
       with globalCompositeOperation tricks — but the cleanest pure-canvas
       approach is a feathered RGB displacement using radial gradient masks. */

    ctx.save();

    /* Create circular clip zone */
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    /* RED channel — shift left */
    ctx.globalCompositeOperation = 'screen';
    const rg = ctx.createRadialGradient(x, y, r * CFG.innerFade, x, y, r);
    rg.addColorStop(0, `rgba(255,0,0,${0.028 * str})`);
    rg.addColorStop(0.5, `rgba(255,0,0,${0.018 * str})`);
    rg.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(x - r - str, y - r, r * 2 + str * 2, r * 2);

    /* BLUE channel — shift right */
    const bg = ctx.createRadialGradient(x, y, r * CFG.innerFade, x, y, r);
    bg.addColorStop(0, `rgba(0,0,255,${0.028 * str})`);
    bg.addColorStop(0.5, `rgba(0,0,255,${0.018 * str})`);
    bg.addColorStop(1, 'rgba(0,0,255,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(x - r + str, y - r, r * 2 + str * 2, r * 2);

    /* GREEN channel — subtle vertical shift */
    const gg = ctx.createRadialGradient(x, y, r * CFG.innerFade * 1.2, x, y, r);
    gg.addColorStop(0, `rgba(0,255,0,${0.012 * str})`);
    gg.addColorStop(1, 'rgba(0,255,0,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(x - r, y - r - str * 0.4, r * 2, r * 2 + str * 0.8);

    /* Subtle lens flare ring at edge */
    const lg = ctx.createRadialGradient(x, y, r * 0.7, x, y, r);
    lg.addColorStop(0, 'rgba(255,102,102,0)');
    lg.addColorStop(0.85, `rgba(255,102,102,${0.04 * str})`);
    lg.addColorStop(1, 'rgba(255,102,102,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = lg;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    ctx.restore();
  }

  /* ── MAIN LOOP ───────────────────────────────────── */
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Lerp cursor position */
    cx = lerp(cx === -999 ? mx : cx, mx, CFG.speed);
    cy = lerp(cy === -999 ? my : cy, my, CFG.speed);

    /* Measure speed */
    const dx = cx - px;
    const dy = cy - py;
    const speed = Math.sqrt(dx * dx + dy * dy);
    px = cx; py = cy;

    /* Boost calculation */
    const targetBoost = Math.min(speed * 0.18, 1);
    boost = lerp(boost, targetBoost, CFG.boostDecay + 0.04);

    /* Draw chromatic effect */
    const str = (1 + boost * (CFG.moveBoost - 1));
    drawAberration(cx, cy, str);

    /* Move DOM cursor elements */
    dot.style.left = cx + 'px';
    dot.style.top  = cy + 'px';
    ring.style.left = cx + 'px';
    ring.style.top  = cy + 'px';

    raf = requestAnimationFrame(loop);
  }

  /* ── HIDE DEFAULT CURSOR ON DESKTOP ─────────────── */
  const isTouchOnly = window.matchMedia('(hover: none)').matches;
  if (!isTouchOnly) {
    document.documentElement.style.cursor = 'none';

    /* Restore on inputs so you can still see the text cursor */
    document.addEventListener('mouseover', e => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        document.documentElement.style.cursor = 'text';
        dot.style.opacity = '0.3';
      } else {
        document.documentElement.style.cursor = 'none';
        dot.style.opacity = '1';
      }
    }, { passive: true });
  } else {
    /* Touch device — hide all the cursor chrome */
    canvas.style.display = 'none';
    dot.style.display    = 'none';
    ring.style.display   = 'none';
    return;
  }

  loop();
})();
