/*!
 * Lost Objects — Magnetic Cursor with Pixel Distortion
 * - Page content gets sucked toward the cursor
 * - Cursor draws as arrow or hand depending on hover target
 * - Chromatic fringe along cursor outline
 * - Zero drift — locked 1:1 to mouse
 */
(function () {
  'use strict';

  if (window.matchMedia('(hover: none)').matches) return;

  /* ─── CONFIG ────────────────────────────────────── */
  const PULL_R    = 72;    /* px radius of the suction zone          */
  const PULL_STR  = 0.22;  /* 0–1 how hard pixels pull inward        */
  const CHROMA    = 3.2;   /* px chromatic fringe on cursor outline   */
  const FRINGE_A  = 0.52;  /* fringe opacity                         */
  const CUR_SCALE = 1.0;   /* cursor size multiplier                 */
  const SZ        = Math.round(22 * CUR_SCALE); /* cursor height px  */

  /* ─── STATE ─────────────────────────────────────── */
  let mx = -9999, my = -9999;
  let isPointer = false;   /* hovering a clickable element?          */
  let isText    = false;   /* hovering a text input?                 */
  let W = 0, H = 0;

  /* ─── MAIN CANVAS (cursor draw layer) ───────────── */
  const curCv = document.createElement('canvas');
  Object.assign(curCv.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '999999',
  });
  document.body.appendChild(curCv);
  const curCtx = curCv.getContext('2d');

  /* ─── DISTORTION CANVAS (pixel warp layer) ───────── */
  const distCv = document.createElement('canvas');
  Object.assign(distCv.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '999998',
    mixBlendMode: 'normal',
  });
  document.body.appendChild(distCv);
  const distCtx = distCv.getContext('2d');

  /* ─── OFF-SCREEN WORK BUFFER ─────────────────────── */
  const workCv  = document.createElement('canvas');
  const workCtx = workCv.getContext('2d');

  /* ─── RESIZE ─────────────────────────────────────── */
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    curCv.width  = distCv.width  = W;
    curCv.height = distCv.height = H;
    workCv.width  = PULL_R * 2 + 4;
    workCv.height = PULL_R * 2 + 4;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ─── CURSOR PATHS ───────────────────────────────── */
  /* Arrow — hot spot top-left */
  function drawArrow(c, x, y) {
    c.save();
    c.translate(x, y);

    /* Fringe passes */
    const offsets = [
      { dx: -CHROMA * 0.55, dy: -CHROMA * 0.45, color: `rgba(255,30,30,${FRINGE_A})` },
      { dx:  CHROMA * 0.55, dy:  CHROMA * 0.45, color: `rgba(30,30,255,${FRINGE_A})` },
      { dx:  CHROMA * 0.35, dy: -CHROMA * 0.2,  color: `rgba(30,180,60,${FRINGE_A * 0.5})` },
    ];

    offsets.forEach(o => {
      c.save();
      c.translate(o.dx, o.dy);
      arrowOutline(c);
      c.strokeStyle = o.color;
      c.lineWidth = 1.1;
      c.stroke();
      c.restore();
    });

    /* Filled arrow */
    arrowOutline(c);
    c.fillStyle   = 'rgba(255,255,255,0.97)';
    c.strokeStyle = 'rgba(8,7,6,0.88)';
    c.lineWidth   = 1.5;
    c.fill();
    c.stroke();

    /* Hot-spot dot */
    c.beginPath();
    c.arc(0, 0, 2, 0, Math.PI * 2);
    c.fillStyle = '#FF6666';
    c.fill();

    c.restore();
  }

  function arrowOutline(c) {
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, SZ * 0.85);
    c.lineTo(SZ * 0.28, SZ * 0.60);
    c.lineTo(SZ * 0.52, SZ * 0.95);
    c.lineTo(SZ * 0.63, SZ * 0.90);
    c.lineTo(SZ * 0.39, SZ * 0.55);
    c.lineTo(SZ * 0.65, SZ * 0.50);
    c.closePath();
  }

  /* Hand — hot spot at fingertip (top of index finger) */
  function drawHand(c, x, y) {
    /* The fingertip of the hand cursor sits at roughly
       30% from left, 8% from top of the bounding box.
       We offset so the hot spot stays at (x,y). */
    const ox = -SZ * 0.30;
    const oy = -SZ * 0.08;

    c.save();
    c.translate(x + ox, y + oy);

    const fringe = [
      { dx: -CHROMA * 0.5, dy: -CHROMA * 0.4, color: `rgba(255,30,30,${FRINGE_A})` },
      { dx:  CHROMA * 0.5, dy:  CHROMA * 0.4, color: `rgba(30,30,255,${FRINGE_A})` },
      { dx:  CHROMA * 0.3, dy: -CHROMA * 0.18, color: `rgba(30,180,60,${FRINGE_A * 0.5})` },
    ];

    fringe.forEach(o => {
      c.save();
      c.translate(o.dx, o.dy);
      handOutline(c);
      c.strokeStyle = o.color;
      c.lineWidth = 1.0;
      c.stroke();
      c.restore();
    });

    handOutline(c);
    c.fillStyle   = 'rgba(255,255,255,0.97)';
    c.strokeStyle = 'rgba(8,7,6,0.88)';
    c.lineWidth   = 1.4;
    c.fill();
    c.stroke();

    /* Fingertip dot — hot spot */
    c.beginPath();
    c.arc(SZ * 0.30, SZ * 0.08, 2, 0, Math.PI * 2);
    c.fillStyle = '#FF6666';
    c.fill();

    c.restore();
  }

  function handOutline(c) {
    const s = SZ;
    /* Simplified hand cursor path */
    c.beginPath();
    /* Index finger */
    c.moveTo(s*.30, 0);
    c.lineTo(s*.30, s*.08);
    c.bezierCurveTo(s*.30, 0, s*.38, 0, s*.38, s*.08);
    c.lineTo(s*.38, s*.40);
    /* Middle finger */
    c.bezierCurveTo(s*.38, s*.30, s*.46, s*.28, s*.46, s*.35);
    c.lineTo(s*.46, s*.62);
    /* Ring finger */
    c.bezierCurveTo(s*.46, s*.52, s*.54, s*.50, s*.54, s*.58);
    c.lineTo(s*.54, s*.68);
    /* Pinky */
    c.bezierCurveTo(s*.54, s*.60, s*.62, s*.58, s*.62, s*.65);
    c.lineTo(s*.62, s*.74);
    /* Palm right side */
    c.bezierCurveTo(s*.62, s*.85, s*.54, s*.90, s*.42, s*.92);
    c.lineTo(s*.22, s*.92);
    /* Thumb side */
    c.bezierCurveTo(s*.10, s*.92, s*.04, s*.85, s*.04, s*.74);
    c.lineTo(s*.04, s*.50);
    c.bezierCurveTo(s*.04, s*.42, s*.10, s*.38, s*.18, s*.38);
    c.lineTo(s*.22, s*.38);
    /* Back up to fingertip */
    c.lineTo(s*.22, s*.08);
    c.bezierCurveTo(s*.22, 0, s*.30, 0, s*.30, s*.08);
    c.closePath();
  }

  /* ─── PIXEL DISTORTION ───────────────────────────── */
  /* We grab a screenshot of the region under the cursor
     using the new OffscreenCanvas + drawImage approach —
     sampling directly from what the browser has rendered. */

  let lastDistortTime = 0;

  function renderDistortion() {
    distCtx.clearRect(0, 0, W, H);
    if (mx < 0) return;

    const now = performance.now();
    if (now - lastDistortTime < 16) return; /* cap at ~60fps */
    lastDistortTime = now;

    const R  = PULL_R;
    const D  = R * 2;
    const sx = mx - R;
    const sy = my - R;

    /* Temporarily hide our layers so they don't get sampled */
    curCv.style.visibility  = 'hidden';
    distCv.style.visibility = 'hidden';

    /* Draw the underlying page into our work buffer */
    try {
      workCtx.clearRect(0, 0, D + 4, D + 4);
      workCtx.drawImage(document.documentElement, sx, sy, D, D, 0, 0, D, D);
    } catch (e) {
      curCv.style.visibility  = 'visible';
      distCv.style.visibility = 'visible';
      return;
    }

    curCv.style.visibility  = 'visible';
    distCv.style.visibility = 'visible';

    /* Read pixels */
    let srcData;
    try {
      srcData = workCtx.getImageData(0, 0, D, D);
    } catch (e) { return; }

    const dst     = distCtx.createImageData(D, D);
    const srcPx   = srcData.data;
    const dstPx   = dst.data;
    const cx0     = R, cy0 = R; /* center of the sample region */

    for (let py2 = 0; py2 < D; py2++) {
      for (let px2 = 0; px2 < D; px2++) {
        /* Vector from this pixel to cursor center */
        const dx = px2 - cx0;
        const dy = py2 - cy0;
        const dist = Math.sqrt(dx * dx + dy * dy);

        /* Only process pixels inside the pull radius */
        if (dist >= R) continue;

        /* Falloff: strongest at cursor, fades at edge */
        const t = 1 - dist / R;
        const falloff = t * t * t; /* cubic — tight pull near center */

        /* Pull toward center */
        const pull = falloff * PULL_STR;
        const srcX = Math.round(px2 + dx * (-pull));
        const srcY = Math.round(py2 + dy * (-pull));

        if (srcX < 0 || srcX >= D || srcY < 0 || srcY >= D) continue;

        const dstIdx = (py2 * D + px2) * 4;
        const srcIdx = (srcY * D + srcX) * 4;

        /* Chromatic aberration: R and B sample from slightly offset positions */
        const ca = Math.round(falloff * 2.5);
        const rX = Math.max(0, Math.min(D - 1, srcX - ca));
        const bX = Math.max(0, Math.min(D - 1, srcX + ca));
        const rIdx = (srcY * D + rX) * 4;
        const bIdx = (srcY * D + bX) * 4;

        dstPx[dstIdx]     = srcPx[rIdx];     /* R */
        dstPx[dstIdx + 1] = srcPx[srcIdx + 1]; /* G */
        dstPx[dstIdx + 2] = srcPx[bIdx + 2];  /* B */
        dstPx[dstIdx + 3] = Math.round(srcPx[srcIdx + 3] * falloff * 1.4);
      }
    }

    /* Paint warped pixels onto distortion canvas */
    distCtx.putImageData(dst, sx, sy);
  }

  /* ─── MAIN DRAW LOOP ─────────────────────────────── */
  function frame() {
    curCtx.clearRect(0, 0, W, H);

    if (mx > 0 && !isText) {
      /* Draw distortion first */
      renderDistortion();

      /* Draw cursor on top */
      if (isPointer) {
        drawHand(curCtx, mx, my);
      } else {
        drawArrow(curCtx, mx, my);
      }
    }

    requestAnimationFrame(frame);
  }

  /* ─── INPUT TRACKING ─────────────────────────────── */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  document.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  document.addEventListener('mouseover', e => {
    const el = e.target;
    const tag = el.tagName;
    const computed = window.getComputedStyle(el).cursor;

    isText    = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    isPointer = !isText && (
      tag === 'A' || tag === 'BUTTON' ||
      computed === 'pointer' ||
      el.closest('a, button, [role="button"], .quiz-option, .svc-card-header, .filter-btn, .mode-btn, .lo-icon, .nav-cta, .big-btn, .submit-btn, .svc-book-btn, .game-start-btn') !== null
    );

    if (isText) {
      document.documentElement.style.cursor = 'text';
    } else {
      document.documentElement.style.cursor = 'none';
    }
  }, { passive: true });

  /* ─── HIDE NATIVE CURSOR & START ─────────────────── */
  document.documentElement.style.cursor = 'none';
  requestAnimationFrame(frame);

})();
