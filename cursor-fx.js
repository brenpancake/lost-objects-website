/*!
 * Lost Objects — Magnetic Cursor
 * Custom cursor that looks like the system arrow with a tight
 * chromatic aberration / magnetic fringe right along its edge.
 * Zero drift — locks 1:1 to mouse position.
 */
(function () {
  'use strict';

  /* Skip on touch-only devices */
  if (window.matchMedia('(hover: none)').matches) return;

  /* ── CONFIG ─────────────────────────────────────── */
  const SCALE     = 1;        /* cursor size multiplier              */
  const FRINGE    = 3.5;      /* px — chromatic fringe spread        */
  const FRINGE_A  = 0.55;     /* fringe opacity                      */
  const DOT_R     = 2;        /* px — hot-spot indicator dot radius  */
  const PINK      = '#FF6666';
  const PINK_R    = 'rgba(255,40,40,';
  const PINK_B    = 'rgba(40,40,255,';
  const PINK_G    = 'rgba(40,180,80,';

  /* ── CANVAS ─────────────────────────────────────── */
  const cv = document.createElement('canvas');
  Object.assign(cv.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '999999',
  });
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');

  /* ── CURSOR ARROW PATH ──────────────────────────── */
  /* Standard OS arrow cursor geometry, normalised.
     Hot spot is at (0,0). The arrow points up-left.
     All coordinates are in "cursor units" — we'll scale up. */
  const SZ = 22 * SCALE; /* overall cursor height in px            */

  /* Build the arrow as a Path2D so we can stroke it
     at multiple offsets for the fringe effect */
  function arrowPath(ctx2d) {
    ctx2d.beginPath();
    /* Outer arrow shape — classic system cursor outline */
    ctx2d.moveTo(0, 0);
    ctx2d.lineTo(0, SZ * 0.85);
    ctx2d.lineTo(SZ * 0.28, SZ * 0.60);
    ctx2d.lineTo(SZ * 0.52, SZ * 0.95);
    ctx2d.lineTo(SZ * 0.63, SZ * 0.90);
    ctx2d.lineTo(SZ * 0.39, SZ * 0.55);
    ctx2d.lineTo(SZ * 0.65, SZ * 0.50);
    ctx2d.closePath();
  }

  /* ── STATE ──────────────────────────────────────── */
  let mx = -999, my = -999;
  let W = 0, H = 0;
  let isText = false;  /* true when hovering inputs */

  /* ── RESIZE ─────────────────────────────────────── */
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width  = W;
    cv.height = H;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ── MOUSE EVENTS ───────────────────────────────── */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  document.addEventListener('mouseover', e => {
    const tag = e.target.tagName;
    isText = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    /* Restore native cursor for text fields */
    document.documentElement.style.cursor = isText ? '' : 'none';
  }, { passive: true });

  document.addEventListener('mouseleave', () => { mx = -999; my = -999; });

  /* ── DRAW ───────────────────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    if (mx < 0 || isText) {
      requestAnimationFrame(draw);
      return;
    }

    ctx.save();
    ctx.translate(mx, my);

    /* ── CHROMATIC FRINGE ────────────────────────────
       Draw the cursor outline three times, each channel
       offset slightly in a different direction, at low opacity.
       This creates the magnetic / CRT fringe right along the edge. */

    /* Red channel — offset up-left */
    ctx.save();
    ctx.translate(-FRINGE * 0.6, -FRINGE * 0.5);
    arrowPath(ctx);
    ctx.strokeStyle = PINK_R + FRINGE_A + ')';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    /* Blue channel — offset down-right */
    ctx.save();
    ctx.translate(FRINGE * 0.6, FRINGE * 0.5);
    arrowPath(ctx);
    ctx.strokeStyle = PINK_B + FRINGE_A + ')';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    /* Green channel — offset right */
    ctx.save();
    ctx.translate(FRINGE * 0.4, -FRINGE * 0.2);
    arrowPath(ctx);
    ctx.strokeStyle = PINK_G + (FRINGE_A * 0.5) + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    /* ── MAIN CURSOR BODY ────────────────────────────
       Solid white fill with dark stroke — mimics OS cursor */
    arrowPath(ctx);
    ctx.fillStyle   = 'rgba(255,255,255,0.96)';
    ctx.strokeStyle = 'rgba(10,9,8,0.85)';
    ctx.lineWidth   = 1.5;
    ctx.fill();
    ctx.stroke();

    /* ── HOT SPOT DOT ────────────────────────────────
       Tiny pink dot at tip so the click point is clear */
    ctx.beginPath();
    ctx.arc(0, 0, DOT_R, 0, Math.PI * 2);
    ctx.fillStyle = PINK;
    ctx.fill();

    ctx.restore();
    requestAnimationFrame(draw);
  }

  /* ── HIDE NATIVE CURSOR, START LOOP ─────────────── */
  document.documentElement.style.cursor = 'none';
  requestAnimationFrame(draw);

})();
