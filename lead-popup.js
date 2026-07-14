/*!
 * Lost Objects — Lead Capture Popup with Collapsible Tab
 * Stays on screen always as a small tab. Expands to full button.
 * Never fully dismisses — just tucks away.
 *
 * SETUP: Set KIT_FORM_ID to your kit.com (ConvertKit) form id. The
 * popup posts to that form's keyless public subscription endpoint, so
 * no API key lives in client code. Tagging/automation is configured on
 * the form itself in the Kit dashboard.
 */
(function () {
  'use strict';

  const KIT_FORM_ID = '9497290';

  /* Don't show the button if already signed up */
  let signedUp = false;
  try { signedUp = localStorage.getItem('lo_signed_up') === '1'; } catch (e) {}

  /* ── STYLES ─────────────────────────────────────── */
  const css = document.createElement('style');
  css.textContent = `

    /* ── LAUNCHER WRAPPER ─────────────────────────── */
    /* Sits fixed bottom-right, slides in on load.
       z-index 10000 keeps the launcher above the site's .vignette
       layer (9998, index.html only) and .grain layer (9999, all
       pages), so the pink pill reads with identical vibrance on
       every page instead of being subtly muted. */
    #lo-launcher {
      position: fixed;
      bottom: 28px;
      right: 0;
      z-index: 10000;
      display: flex;
      align-items: flex-end;
      flex-direction: column;
      gap: 0;
      animation: lo-slide-in 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.5s both;
    }

    @keyframes lo-slide-in {
      from { opacity: 0; transform: translateX(60px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* ── EXPANDED STATE — full pill button ────────── */
    #lo-trigger {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #FF6666;
      color: #0f0e0d;
      border: none;
      border-radius: 2px 0 0 2px;
      padding: 13px 18px;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      box-shadow: -4px 4px 24px rgba(255,102,102,0.28);
      transition: opacity 0.2s, padding 0.35s cubic-bezier(0.4,0,0.2,1),
                  width 0.35s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden;
      white-space: nowrap;
      max-width: 200px;
    }

    #lo-trigger:hover { opacity: 0.88; }

    /* Collapsed state — just a narrow tab on the edge */
    #lo-launcher.lo-collapsed #lo-trigger {
      padding: 13px 10px;
      max-width: 36px;
      min-height: 52px;
    }

    /* Hide label text when collapsed */
    #lo-trigger-label {
      transition: opacity 0.2s, width 0.35s;
      overflow: hidden;
    }

    #lo-launcher.lo-collapsed #lo-trigger-label {
      opacity: 0;
      width: 0;
      pointer-events: none;
    }

    /* Collapse toggle — tab below the button. Reads as its own
       actionable control with clear Hide/Show affordance. */
    #lo-collapse-btn {
      background: rgba(255,102,102,0.22);
      border: none;
      border-radius: 0 0 0 3px;
      border-top: 1px solid rgba(255,102,102,0.5);
      width: 100%;
      min-height: 34px;
      padding: 9px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      transition: background 0.2s;
    }

    #lo-collapse-btn:hover { background: rgba(255,102,102,0.38); }

    #lo-collapse-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,102,102,0.95);
      transition: opacity 0.2s, width 0.35s;
      overflow: hidden;
      white-space: nowrap;
    }

    #lo-launcher.lo-collapsed #lo-collapse-label {
      opacity: 0;
      width: 0;
    }

    #lo-collapse-icon {
      color: rgba(255,102,102,0.95);
      font-size: 13px;
      font-weight: 700;
      line-height: 1;
      transition: transform 0.3s ease;
      flex-shrink: 0;
    }

    /* Arrow points left when expanded (to collapse),
       right when collapsed (to expand) */
    #lo-launcher.lo-collapsed #lo-collapse-icon {
      transform: rotate(180deg);
    }

    /* ── MODAL OVERLAY ────────────────────────────── */
    /* z-index 10001 sits one step above the launcher (10000) so the
       modal properly covers the pill when opened, and above the
       site's grain (9999) + vignette (9998) so the modal looks
       identically crisp on every page — including index.html where
       a Vimeo video is playing behind the blur. */
    #lo-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 10001;
      background: rgba(10,9,8,0.93);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    #lo-overlay.lo-open { display: flex; }

    #lo-modal {
      background: #0f0e0d;
      border: 1px solid rgba(255,102,102,0.42);
      border-radius: 0;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,102,102,0.08);
      width: 100%;
      max-width: 500px;
      max-height: 90dvh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      animation: lo-modal-in 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }

    /* Poster is pinned at the top (the CLOSE tag sits over it); everything below
       it — header + form — scrolls together in #lo-scroll, so the form gets the
       full remaining height instead of a cramped sub-window on short screens. */
    #lo-form-wrap {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      position: relative;   /* positioning context for the scroll indicator */
    }
    #lo-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    /* ── SCROLL INDICATOR ─────────────────────────────
       Sleek coral progress cue on the right inner edge of the scroll area.
       JS positions it to overlay the #lo-scroll viewport and toggles
       .lo-visible only when the content actually overflows. pointer-events
       stay off so it never blocks the Close tag, the fields, or the submit
       button. Sharp edges (no radius) to match the popup aesthetic. */
    #lo-scrollbar {
      position: absolute;
      right: 0;
      width: 3px;
      z-index: 2;
      background: rgba(255,102,102,0.10);   /* very faint track */
      opacity: 0;
      display: none;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    #lo-scrollbar.lo-visible { display: block; opacity: 1; }
    #lo-scrollbar-thumb {
      position: absolute;
      top: 0;
      right: 0;
      width: 3px;
      min-height: 28px;
      background: #FF6666;                   /* coral thumb */
      box-shadow: 0 0 4px rgba(255,102,102,0.45);
      transition: transform 0.09s linear;    /* smooth position updates */
      will-change: transform;
    }
    /* Reduced motion: keep the position cue, drop the animated glide */
    @media (prefers-reduced-motion: reduce) {
      #lo-scrollbar { transition: none; }
      #lo-scrollbar-thumb { transition: none; }
    }

    /* Seminar poster — full-width banner at the top of the popup. Sharp corners
       (modal is border-radius 0 + overflow hidden). Shows the WHOLE 16:9 image
       (no crop) so the FA + Lost Objects logos at the top stay fully visible;
       the popup height accommodates it and the body scrolls if needed. */
    #lo-poster {
      display: block;
      width: 100%;
      height: auto;
      flex-shrink: 0;
    }

    @keyframes lo-modal-in {
      from { opacity: 0; transform: scale(0.94) translateY(16px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Animated grain on the modal */
    #lo-modal::before {
      content: '';
      position: absolute;
      inset: -50px;
      width: calc(100% + 100px);
      height: calc(100% + 100px);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.055;
      pointer-events: none;
      z-index: 0;
      animation: lo-grain 0.5s steps(1) infinite;
    }

    @keyframes lo-grain {
      0%  { transform: translate(0,0); }
      20% { transform: translate(-2%,-3%); }
      40% { transform: translate(3%,2%); }
      60% { transform: translate(-1%,3%); }
      80% { transform: translate(2%,-2%); }
      100%{ transform: translate(0,0); }
    }

    /* Pink atmospheric glow behind the header */
    #lo-modal-header {
      position: relative;
      z-index: 1;
      flex-shrink: 0;
      padding: clamp(22px, 4vw, 36px) clamp(20px, 5vw, 36px) clamp(18px, 3vw, 28px);
      border-bottom: 1px solid rgba(232,226,217,0.07);
      background:
        radial-gradient(ellipse at 20% 0%, rgba(255,102,102,0.12) 0%, transparent 65%),
        #111010;
      overflow: hidden;
    }

    /* Film frame corners on modal header */
    #lo-modal-header::before,
    #lo-modal-header::after {
      content: '';
      position: absolute;
      width: 16px; height: 16px;
    }
    #lo-modal-header::before {
      top: 0; left: 0;
      border-top: 1px solid rgba(255,102,102,0.5);
      border-left: 1px solid rgba(255,102,102,0.5);
    }
    #lo-modal-header::after {
      top: 0; right: 0;
      border-top: 1px solid rgba(255,102,102,0.5);
      border-right: 1px solid rgba(255,102,102,0.5);
    }

    /* Bottom frame corners via wrapper */
    #lo-modal-body {
      position: relative;
      z-index: 1;
      padding: clamp(20px, 3vw, 28px) clamp(20px, 5vw, 36px) clamp(22px, 4vw, 36px);
      background: #0f0e0d;
    }

    #lo-modal-body::before,
    #lo-modal-body::after {
      content: '';
      position: absolute;
      width: 16px; height: 16px;
    }
    #lo-modal-body::before {
      bottom: 0; left: 0;
      border-bottom: 1px solid rgba(255,102,102,0.3);
      border-left: 1px solid rgba(255,102,102,0.3);
    }
    #lo-modal-body::after {
      bottom: 0; right: 0;
      border-bottom: 1px solid rgba(255,102,102,0.3);
      border-right: 1px solid rgba(255,102,102,0.3);
    }

    .lo-eyebrow {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 8px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: rgba(255,102,102,0.7);
      margin-bottom: 16px;
    }

    .lo-eyebrow::before {
      content: '';
      display: block;
      width: 24px; height: 1px;
      background: rgba(255,102,102,0.4);
      flex-shrink: 0;
    }

    .lo-modal-hl {
      font-family: var(--display, 'Built Titling', 'Arial Narrow', sans-serif);
      font-size: clamp(28px, 6vw, 42px);
      font-weight: 700;
      line-height: 0.98;
      letter-spacing: 0.01em;
      text-transform: uppercase;
      color: #e8e2d9;
      margin-bottom: 14px;
    }

    .lo-modal-hl em { font-style: normal; color: #FF6666; }

    .lo-modal-sub {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 300;
      color: rgba(232,226,217,0.52);
      line-height: 1.8;
    }

    /* Stat pill — adds social proof energy */
    .lo-stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 7px 14px;
      background: rgba(255,102,102,0.08);
      border: 1px solid rgba(255,102,102,0.18);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 9px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,102,102,0.7);
    }

    .lo-stat-pill strong {
      font-family: inherit;
      font-style: normal;
      font-weight: 700;
      font-size: inherit;
      letter-spacing: inherit;
      color: #FF6666;
    }

    .lo-field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    .lo-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .lo-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 8px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(232,226,217,0.22);
    }

    .lo-label span { color: #FF6666; margin-left: 2px; }

    .lo-input {
      background: #161514;
      border: 1px solid rgba(232,226,217,0.1);
      color: #e8e2d9;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 300;
      padding: 12px 14px;
      outline: none;
      width: 100%;
      transition: border-color 0.2s, background 0.2s;
      border-radius: 0;
      -webkit-appearance: none;
      box-sizing: border-box;
    }

    .lo-input:focus {
      border-color: rgba(255,102,102,0.5);
      background: #1a1918;
    }
    .lo-input::placeholder { color: rgba(232,226,217,0.22); }

    .lo-optin {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 20px;
      cursor: pointer;
    }

    .lo-checkbox {
      width: 15px;
      height: 15px;
      min-width: 15px;
      background: #161514;
      border: 1px solid rgba(232,226,217,0.2);
      margin-top: 1px;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      position: relative;
      transition: background 0.2s, border-color 0.2s;
      flex-shrink: 0;
    }

    .lo-checkbox:checked { background: #FF6666; border-color: #FF6666; }

    .lo-checkbox:checked::after {
      content: '';
      position: absolute;
      top: 2px; left: 4px;
      width: 4px; height: 7px;
      border: 1.5px solid #0f0e0d;
      border-top: none; border-left: none;
      transform: rotate(40deg);
    }

    .lo-optin-text {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 300;
      color: rgba(232,226,217,0.32);
      line-height: 1.6;
    }

    .lo-submit {
      width: 100%;
      background: #FF6666;
      color: #0f0e0d;
      border: none;
      border-radius: 0;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      padding: 15px;
      cursor: pointer;
      transition: filter 0.2s ease, box-shadow 0.25s ease, transform 0.15s ease;
      box-shadow: 0 4px 24px rgba(255,102,102,0.35);
    }

    .lo-submit:hover {
      transform: translateY(-1px);
      filter: brightness(1.1) saturate(1.08);
      box-shadow: 0 0 24px rgba(255,102,102,0.55), 0 0 7px rgba(255,102,102,0.45);
    }
    .lo-submit:active { transform: translateY(0); }
    .lo-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }

    .lo-fine-print {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 9px;
      color: rgba(232,226,217,0.18);
      line-height: 1.6;
      margin-top: 12px;
      text-align: center;
    }

    /* Legal line — quiet supporting text at the very bottom, matching the fine
       print. Only the two policy names are linked (muted, subtle coral hover). */
    .lo-legal {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 9px;
      font-weight: 300;
      color: rgba(232,226,217,0.28);
      line-height: 1.6;
      margin-top: 10px;
      text-align: center;
    }
    .lo-legal a {
      color: rgba(232,226,217,0.5);
      border-bottom: 1px solid rgba(232,226,217,0.2);
      transition: color 0.2s, border-color 0.2s;
    }
    .lo-legal a:hover { color: #FF6666; border-color: rgba(255,102,102,0.6); }

    /* Close control — an outline "tag" matching the Join Community tags: thin
       coral outline, transparent fill, small uppercase letter-spaced coral text.
       Centered over the poster's top dark band, between the FA logo (left) and
       the Lost Objects logo (right), so it never covers either. Fills coral with
       dark text on hover. z-index 3 keeps it above the poster + header. */
    #lo-close {
      position: absolute;
      top: 13px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid rgba(255,102,102,0.55);
      border-radius: 0;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      line-height: 1;
      color: #FF6666;
      padding: 7px 16px;
      transition: color 0.2s, background 0.2s, border-color 0.2s;
    }
    #lo-close:hover {
      color: #14120f;
      background: #FF6666;
      border-color: #FF6666;
    }
    /* Invisible hit-area extension so the compact tag stays a >=44px tap target */
    #lo-close::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      min-width: 72px;
      height: 44px;
    }

    #lo-success {
      display: none;
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: clamp(32px, 6vw, 48px) clamp(20px, 5vw, 32px);
      text-align: center;
    }

    .lo-success-icon {
      width: 48px; height: 48px;
      border: 1px solid rgba(255,102,102,0.3);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
    }

    .lo-success-hl {
      font-family: var(--display, 'Built Titling', 'Arial Narrow', sans-serif);
      font-size: clamp(26px, 5vw, 32px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.01em;
      color: #e8e2d9; margin-bottom: 10px;
    }

    .lo-success-hl em { font-style: normal; color: #FF6666; }

    .lo-success-sub {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px; font-weight: 300;
      color: rgba(232,226,217,0.45); line-height: 1.75;
      margin-bottom: 18px;
    }

    .lo-success-btn {
      display: inline-block;
      background: #FF6666;
      color: #0f0e0d;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10px; font-weight: 600;
      letter-spacing: 0.2em; text-transform: uppercase;
      padding: 12px 24px;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .lo-success-btn:hover { opacity: 0.82; }

    /* ── TABLET — comfortable centered width, name fields side by side ── */
    @media (min-width: 481px) and (max-width: 820px) {
      #lo-modal { max-width: 460px; }
    }

    /* ── MOBILE — coexist cleanly with the cookie banner ── */
    @media (max-width: 768px) {
      /* Normal resting position when no cookie banner is showing.
         z-index 10001 keeps the launcher above the mobile/tablet nav, which is
         promoted to its own top GPU layer at z-index 10000 (<=1024px, in
         index.html) to fix iOS bleed-through. Mirrors the desktop pattern of the
         overlay sitting one step above the launcher, both above the nav. */
      #lo-launcher {
        bottom: 16px;
        z-index: 10001;
        transition: bottom 0.35s ease;
      }
      /* While the cookie banner is active, lift the tab to sit directly
         above it: banner height (published by cookie-notice.js) + 8px gap. */
      body.cookie-active #lo-launcher {
        bottom: calc(var(--lo-cookie-h, 0px) + 8px);
      }
      /* z-index 10002 keeps the user-initiated modal above the mobile/tablet nav
         (10000, promoted to its own top GPU layer in index.html to fix iOS
         bleed-through) so the header can't clip the popup — one step above the
         launcher (10001). This also puts the modal above the cookie banner
         (9000), which is fine: the banner-height reservation below already keeps
         the two from visually colliding while the banner is active, and the modal
         is user-initiated so it legitimately covers the banner. When the banner is
         up we reserve its height at the bottom of the overlay and cap the modal so
         the whole popup — incl. the submit button and legal links — sits above it.
         --lo-cookie-h is published by cookie-notice.js. The reservation rules only
         apply while the banner is active AND the modal is open; with either absent
         they do nothing, so each element's normal behavior is preserved. */
      #lo-overlay { z-index: 10002; }
      body.cookie-active #lo-overlay {
        padding-bottom: calc(var(--lo-cookie-h, 0px) + 12px);
      }
      body.cookie-active #lo-modal {
        max-height: calc(100dvh - var(--lo-cookie-h, 0px) - 32px);
      }
    }

    /* ── PHONE — near-full-width, stacked name fields ──────────── */
    @media (max-width: 480px) {
      #lo-launcher { bottom: 16px; }
      #lo-launcher.lo-collapsed #lo-trigger {
        padding: 16px 12px;
        max-width: 44px;
        min-height: 60px;
      }
      #lo-launcher.lo-collapsed #lo-collapse-btn {
        min-height: 36px;
        padding: 8px 12px;
      }
      /* 16px side margins → card is calc(100% - 32px) wide */
      #lo-overlay { padding: 16px; }
      /* Stack First / Last name vertically */
      .lo-field-row { grid-template-columns: 1fr; }
      /* Keep the CLOSE tag comfortably between the logos on the narrowest widths */
      #lo-close { font-size: 8px; letter-spacing: 0.16em; padding: 6px 12px; }
      /* More readable fine print + legal line on mobile, with easier link taps */
      .lo-fine-print { font-size: 10px; color: rgba(232,226,217,0.32); }
      .lo-legal { font-size: 10.5px; line-height: 1.75; }
    }
  `;
  document.head.appendChild(css);

  /* ── HTML ───────────────────────────────────────── */
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="lo-launcher">

      <button id="lo-trigger" aria-label="Get free lesson">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="flex-shrink:0">
          <polygon points="1,0.5 11,6 1,11.5" fill="#0f0e0d"/>
        </svg>
        <span id="lo-trigger-label">Free Lesson</span>
      </button>

      <button id="lo-collapse-btn" aria-label="Toggle lesson button">
        <span id="lo-collapse-label">Hide</span>
        <span id="lo-collapse-icon">&#8249;</span>
      </button>

    </div>

    <div id="lo-overlay" role="dialog" aria-modal="true" aria-labelledby="lo-modal-title">
      <div id="lo-modal">

        <button id="lo-close" type="button" aria-label="Close">Close</button>

        <div id="lo-form-wrap">
          <img id="lo-poster" src="images/Instragram-Live-Seminar-Poster-800.jpg" alt="Kyra and Brendan Sweeney presenting Instagram for Filmmakers at the B&amp;H BILD Expo" decoding="async" />
          <div id="lo-scrollbar" aria-hidden="true"><div id="lo-scrollbar-thumb"></div></div>
          <div id="lo-scroll">
          <div id="lo-modal-header">
            <div class="lo-eyebrow" id="lo-modal-title">Duration, 47 min</div>
            <p class="lo-modal-sub">
              Kyra and Brendan Sweeney share their framework for mastering social media as a filmmaker, from optimizing your profile to growing organically with Reels and collaborations. Using their Legacy Grip case study, they show how a niche industry pro grew from 400 to over 50,000 followers and unlocked new career opportunities.
            </p>
            <div class="lo-stat-pill">
              <strong>Free</strong> keynote
            </div>
          </div>

          <div id="lo-modal-body">
            <form id="lo-form" novalidate>

              <div class="lo-field-row">
                <div class="lo-field">
                  <label class="lo-label" for="lo-first">First name <span>*</span></label>
                  <input class="lo-input" type="text" id="lo-first" name="first_name" placeholder="First" required />
                </div>
                <div class="lo-field">
                  <label class="lo-label" for="lo-last">Last name <span>*</span></label>
                  <input class="lo-input" type="text" id="lo-last" name="last_name" placeholder="Last" required />
                </div>
              </div>

              <div class="lo-field">
                <label class="lo-label" for="lo-email">Email address <span>*</span></label>
                <input class="lo-input" type="email" id="lo-email" name="email" placeholder="you@yourdomain.com" required />
              </div>

              <label class="lo-optin">
                <input class="lo-checkbox" type="checkbox" id="lo-optin" required />
                <span class="lo-optin-text">
                  I agree to receive the free lesson and occasional emails from Lost Objects about social media strategy for the film industry. Unsubscribe any time.
                </span>
              </label>

              <button class="lo-submit" type="submit" id="lo-submit-btn">
                Send Me The Free Lesson
              </button>

              <p class="lo-fine-print">No spam. No selling your info. Just the lesson and useful things.</p>

              <p class="lo-legal">By signing up you agree to our <a href="privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="terms.html" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>.</p>

            </form>
          </div>
          </div>
        </div>

        <div id="lo-success">
          <div class="lo-success-icon">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M1 7l5 5 11-11" stroke="#FF6666" stroke-width="1.5" stroke-linecap="square"/>
            </svg>
          </div>
          <h3 class="lo-success-hl">You're <em>found.</em></h3>
          <p class="lo-success-sub">Check your inbox, the lesson is on its way.<br>If you don't see it, check your spam folder.</p>
          <a href="https://watch.filmmakersacademy.com/programs/instagram-for-filmmakers-your-blueprint-for-success" target="_blank" rel="noopener" class="lo-success-btn">Watch the free lesson &rarr;</a>
        </div>

      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  /* ── REFERENCES ─────────────────────────────────── */
  const launcher   = document.getElementById('lo-launcher');
  const trigger    = document.getElementById('lo-trigger');
  const collapseBtn = document.getElementById('lo-collapse-btn');
  const collapseLabel = document.getElementById('lo-collapse-label');
  const overlay    = document.getElementById('lo-overlay');
  const closeBtn   = document.getElementById('lo-close');
  const form       = document.getElementById('lo-form');
  const submitBtn  = document.getElementById('lo-submit-btn');
  const formWrap   = document.getElementById('lo-form-wrap');
  const success    = document.getElementById('lo-success');

  /* ── SCROLL INDICATOR ───────────────────────────────
     A thin coral thumb that overlays the right edge of #lo-scroll, sized to
     the visible fraction and moved to reflect scroll position. Only visible
     when the content overflows; recomputed on scroll, resize, and layout
     changes (incl. the poster image finishing loading). */
  const scrollArea  = document.getElementById('lo-scroll');
  const scrollbar   = document.getElementById('lo-scrollbar');
  const scrollThumb = document.getElementById('lo-scrollbar-thumb');
  const poster      = document.getElementById('lo-poster');
  let sbRaf = 0;

  function updateScrollIndicator() {
    sbRaf = 0;
    if (!scrollArea || !scrollbar || !overlay.classList.contains('lo-open')) {
      if (scrollbar) scrollbar.classList.remove('lo-visible');
      return;
    }
    const sh = scrollArea.scrollHeight;
    const ch = scrollArea.clientHeight;
    const overflow = sh - ch;
    if (overflow <= 1 || ch <= 0) {          /* fits on screen — no cue */
      scrollbar.classList.remove('lo-visible');
      return;
    }
    /* Overlay exactly the scroll viewport (below the pinned poster). */
    scrollbar.style.top = scrollArea.offsetTop + 'px';
    scrollbar.style.height = ch + 'px';
    scrollbar.classList.add('lo-visible');
    const thumbH = Math.max(28, Math.round((ch / sh) * ch));
    const travel = Math.max(0, ch - thumbH);
    const y = Math.round((scrollArea.scrollTop / overflow) * travel);
    scrollThumb.style.height = thumbH + 'px';
    scrollThumb.style.transform = 'translateY(' + y + 'px)';
  }

  function queueScrollUpdate() {
    if (sbRaf) return;
    sbRaf = requestAnimationFrame(updateScrollIndicator);
  }

  if (scrollArea && scrollbar) {
    scrollArea.addEventListener('scroll', queueScrollUpdate, { passive: true });
    window.addEventListener('resize', queueScrollUpdate);
    if (poster) poster.addEventListener('load', queueScrollUpdate);
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(queueScrollUpdate);
      ro.observe(scrollArea);
    }
  }

  /* ── COLLAPSE STATE ─────────────────────────────── */
  let collapsed = false;

  /* Default to collapsed on mobile so the tab is a small edge sliver that
     never covers the hero CTAs (even when lifted above the cookie banner).
     Desktop still opens expanded. A stored session preference always wins. */
  const loNarrow = !!(window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
  try {
    const stored = sessionStorage.getItem('lo_collapsed');
    if (stored === '1' || (stored === null && loNarrow)) {
      collapsed = true;
      launcher.classList.add('lo-collapsed');
      collapseLabel.textContent = 'Show';
    }
  } catch (e) {
    if (loNarrow) {
      collapsed = true;
      launcher.classList.add('lo-collapsed');
      collapseLabel.textContent = 'Show';
    }
  }

  function setCollapsed(val) {
    collapsed = val;
    if (collapsed) {
      launcher.classList.add('lo-collapsed');
      collapseLabel.textContent = 'Show';
    } else {
      launcher.classList.remove('lo-collapsed');
      collapseLabel.textContent = 'Hide';
    }
    try { sessionStorage.setItem('lo_collapsed', collapsed ? '1' : '0'); } catch (e) {}
  }

  collapseBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setCollapsed(!collapsed);
  });

  /* ── MODAL OPEN / CLOSE ─────────────────────────── */
  function openModal() {
    /* If collapsed, expand first then open */
    if (collapsed) setCollapsed(false);
    overlay.classList.add('lo-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('lo-first').focus(), 100);
    /* Show/size the scroll cue once the modal is laid out (and again once the
       poster image has settled its height). */
    queueScrollUpdate();
    setTimeout(queueScrollUpdate, 250);
  }

  function closeModal() {
    overlay.classList.remove('lo-open');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ── FORM SUBMIT ────────────────────────────────── */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const first = document.getElementById('lo-first').value.trim();
    const last  = document.getElementById('lo-last').value.trim();
    const email = document.getElementById('lo-email').value.trim();
    const optin = document.getElementById('lo-optin').checked;

    if (!first || !last || !email || !optin) {
      submitBtn.style.opacity = '0.5';
      setTimeout(() => { submitBtn.style.opacity = '1'; }, 400);
      return;
    }

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      /* Keyless public form-subscription endpoint (same one Kit's embed
         forms use): no API key in client code. Fields mirror the embed
         form — email_address + fields[first_name]. */
      const fd = new FormData();
      fd.append('email_address', email);
      fd.append('fields[first_name]', first + ' ' + last);
      const res = await fetch(
        `https://app.convertkit.com/forms/${KIT_FORM_ID}/subscriptions`,
        {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: fd,
        }
      );

      if (res.ok) {
        formWrap.style.display = 'none';
        success.style.display  = 'block';
        /* Collapse the launcher to just a tiny tab after signup */
        setTimeout(() => setCollapsed(true), 1200);
        try { localStorage.setItem('lo_signed_up', '1'); } catch (err) {}
      } else {
        submitBtn.textContent = 'Something went wrong, try again';
        submitBtn.disabled    = false;
      }
    } catch (err) {
      submitBtn.textContent = 'Something went wrong, try again';
      submitBtn.disabled    = false;
    }
  });

  /* Hide trigger entirely if already signed up */
  if (signedUp) {
    launcher.style.display = 'none';
  }

})();
