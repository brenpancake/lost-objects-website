/*!
 * Lost Objects — Cursor Magnetic Distortion
 * WebGL-based pixel displacement — tube TV magnet / liquid warp effect
 * Include once per page: <script src="cursor-fx.js"></script>
 */
(function () {
  'use strict';

  /* Touch-only devices — skip entirely */
  if (window.matchMedia('(hover: none)').matches) return;

  /* ── CONFIG ─────────────────────────────────────── */
  const CFG = {
    radius:      140,    /* px — warp zone radius                     */
    strength:    0.018,  /* displacement intensity (0.01–0.04 range)  */
    chroma:      0.006,  /* chromatic aberration split amount          */
    lerpSpeed:   0.12,   /* cursor follow smoothing                   */
    boostMult:   2.8,    /* how much faster movement amps the effect  */
    boostDecay:  0.06,   /* how quickly the boost fades               */
    dotRadius:   4,      /* px — cursor dot size                      */
  };

  /* ── STATE ──────────────────────────────────────── */
  let mx = -9999, my = -9999;
  let cx = -9999, cy = -9999;
  let px = 0,     py = 0;
  let boost = 0;
  let W = 0,      H = 0;
  let visible = false;

  /* ── CANVAS ─────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position:      'fixed',
    inset:         '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '99990',
    display:       'block',
  });
  document.body.appendChild(canvas);

  /* ── WEBGL CONTEXT ──────────────────────────────── */
  const gl = canvas.getContext('webgl', {
    premultipliedAlpha: false,
    alpha: true,
    antialias: false,
  });

  if (!gl) { canvas.remove(); return; }

  /* ── SHADERS ─────────────────────────────────────── */
  const VS = `
    attribute vec2 a_pos;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  /* Fragment shader — reads the page texture and displaces pixels
     based on distance from cursor, creating magnetic warp + chromatic split */
  const FS = `
    precision mediump float;

    uniform sampler2D u_tex;   /* screenshot of the page             */
    uniform vec2  u_res;       /* canvas resolution in px            */
    uniform vec2  u_cursor;    /* cursor position in px (y flipped)  */
    uniform float u_radius;    /* warp zone radius in px             */
    uniform float u_strength;  /* displacement multiplier            */
    uniform float u_chroma;    /* chromatic aberration               */

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;

      /* Cursor position in UV space */
      vec2 cursorUV = u_cursor / u_res;

      /* Vector from cursor to current fragment */
      vec2 diff = uv - cursorUV;

      /* Correct for aspect ratio so the zone is circular */
      float aspect = u_res.x / u_res.y;
      vec2 diffCorrected = diff * vec2(aspect, 1.0);
      float dist = length(diffCorrected);

      /* Normalised radius */
      float normRadius = u_radius / u_res.y;

      /* Smooth falloff — strongest at cursor, fades to edge of zone */
      float falloff = 1.0 - smoothstep(0.0, normRadius, dist);
      falloff = falloff * falloff;   /* square for sharper centre warp */

      /* Magnetic displacement — pulls pixels toward cursor */
      vec2 displacement = -diff * falloff * u_strength;

      /* Chromatic aberration — red and blue split away from center */
      float chrSplit = u_chroma * falloff;
      vec2 chromaOff = normalize(diff + vec2(0.0001)) * chrSplit;

      /* Sample displaced UVs */
      vec2 uvBase  = uv + displacement;
      vec2 uvRed   = uv + displacement + chromaOff;
      vec2 uvBlue  = uv + displacement - chromaOff;

      /* Clamp to [0,1] */
      uvBase  = clamp(uvBase,  vec2(0.0), vec2(1.0));
      uvRed   = clamp(uvRed,   vec2(0.0), vec2(1.0));
      uvBlue  = clamp(uvBlue,  vec2(0.0), vec2(1.0));

      /* Sample each channel from displaced position */
      float r = texture2D(u_tex, uvRed).r;
      float g = texture2D(u_tex, uvBase).g;
      float b = texture2D(u_tex, uvBlue).b;
      float a = texture2D(u_tex, uvBase).a;

      /* Only output pixels within the warp zone */
      float mask = smoothstep(0.0, normRadius * 0.08, falloff);

      gl_FragColor = vec4(r, g, b, a * mask);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  /* Full-screen quad */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1,
  ]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  /* Uniform locations */
  const uTex      = gl.getUniformLocation(prog, 'u_tex');
  const uRes      = gl.getUniformLocation(prog, 'u_res');
  const uCursor   = gl.getUniformLocation(prog, 'u_cursor');
  const uRadius   = gl.getUniformLocation(prog, 'u_radius');
  const uStrength = gl.getUniformLocation(prog, 'u_strength');
  const uChrома   = gl.getUniformLocation(prog, 'u_chroma');

  /* Texture that holds the page screenshot */
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  /* ── PAGE CAPTURE ───────────────────────────────── */
  /* We use html2canvas to grab the live page content.
     This runs periodically so scrolling / animation stays responsive. */
  let capturing = false;
  let captureReady = false;
  let lastCapture = 0;
  const CAPTURE_INTERVAL = 80; /* ms between recaptures               */

  function captureToTexture() {
    if (capturing) return;
    const now = performance.now();
    if (now - lastCapture < CAPTURE_INTERVAL) return;
    capturing = true;
    lastCapture = now;

    /* Temporarily hide our canvas and cursor elements so they
       don't appear in the screenshot */
    canvas.style.display = 'none';
    if (dotEl) dotEl.style.display = 'none';

    window.html2canvas(document.body, {
      x: window.scrollX,
      y: window.scrollY,
      width:  window.innerWidth,
      height: window.innerHeight,
      useCORS: true,
      allowTaint: true,
      scale: 0.75,          /* lower res = much faster capture        */
      logging: false,
      backgroundColor: null,
      imageTimeout: 0,
    }).then(captured => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captured);
      captureReady = true;
      capturing = false;
      canvas.style.display = 'block';
      if (dotEl) dotEl.style.display = 'block';
    }).catch(() => {
      capturing = false;
      canvas.style.display = 'block';
      if (dotEl) dotEl.style.display = 'block';
    });
  }

  /* ── CURSOR DOT ─────────────────────────────────── */
  const dotEl = document.createElement('div');
  Object.assign(dotEl.style, {
    position:      'fixed',
    width:         CFG.dotRadius * 2 + 'px',
    height:        CFG.dotRadius * 2 + 'px',
    borderRadius:  '50%',
    background:    'rgba(255,102,102,0.9)',
    pointerEvents: 'none',
    zIndex:        '99999',
    transform:     'translate(-50%,-50%)',
    mixBlendMode:  'screen',
    top:           '0',
    left:          '0',
    opacity:       '0',
    transition:    'opacity 0.3s',
    boxShadow:     '0 0 6px rgba(255,102,102,0.5)',
  });
  document.body.appendChild(dotEl);

  /* ── RESIZE ─────────────────────────────────────── */
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
  }
  resize();
  window.addEventListener('resize', () => { resize(); captureToTexture(); }, { passive: true });
  window.addEventListener('scroll', () => { captureToTexture(); }, { passive: true });

  /* ── INPUT ──────────────────────────────────────── */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) { visible = true; dotEl.style.opacity = '1'; }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    visible = false;
    dotEl.style.opacity = '0';
  });

  /* Restore text cursor on inputs */
  document.addEventListener('mouseover', e => {
    const tag = e.target.tagName;
    const isText = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    document.documentElement.style.cursor = isText ? '' : 'none';
    dotEl.style.opacity = visible ? (isText ? '0.3' : '1') : '0';
  }, { passive: true });

  /* ── MAIN LOOP ───────────────────────────────────── */
  const lerp = (a, b, t) => a + (b - a) * t;

  function frame() {
    requestAnimationFrame(frame);

    /* Lerp cursor */
    if (cx === -9999) { cx = mx; cy = my; }
    cx = lerp(cx, mx, CFG.lerpSpeed);
    cy = lerp(cy, my, CFG.lerpSpeed);

    /* Speed boost */
    const dx = cx - px, dy = cy - py;
    px = cx; py = cy;
    const speed = Math.sqrt(dx * dx + dy * dy);
    boost = lerp(boost, Math.min(speed * 0.15, 1.0), CFG.boostDecay + 0.05);

    const str = CFG.strength * (1 + boost * (CFG.boostMult - 1));

    /* Move dot */
    dotEl.style.left = cx + 'px';
    dotEl.style.top  = cy + 'px';

    /* Trigger recapture */
    if (visible) captureToTexture();

    /* Render */
    if (!captureReady) { gl.clear(gl.COLOR_BUFFER_BIT); return; }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes,      W, H);
    /* Flip Y — WebGL origin is bottom-left, DOM is top-left */
    gl.uniform2f(uCursor,   cx, H - cy);
    gl.uniform1f(uRadius,   CFG.radius);
    gl.uniform1f(uStrength, str);
    gl.uniform1f(uChrома,   CFG.chroma * (1 + boost));
    gl.uniform1i(uTex,      0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /* ── HIDE DEFAULT CURSOR ─────────────────────────── */
  document.documentElement.style.cursor = 'none';

  /* Load html2canvas from CDN then start */
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  s.onload = () => {
    /* Initial capture once page is fully painted */
    setTimeout(() => {
      captureToTexture();
      requestAnimationFrame(frame);
    }, 400);
  };
  s.onerror = () => {
    /* Fallback — no distortion, just show the dot cursor */
    canvas.remove();
    document.documentElement.style.cursor = 'none';
    requestAnimationFrame(function dotOnly() {
      dotEl.style.left = cx + 'px';
      dotEl.style.top  = cy + 'px';
      cx = lerp(cx === -9999 ? mx : cx, mx, CFG.lerpSpeed);
      cy = lerp(cy === -9999 ? my : cy, my, CFG.lerpSpeed);
      requestAnimationFrame(dotOnly);
    });
  };
  document.head.appendChild(s);

})();
