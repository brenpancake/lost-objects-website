/*!
 * Lost Objects — Lead Capture Popup with Collapsible Tab
 * Stays on screen always as a small tab. Expands to full button.
 * Never fully dismisses — just tucks away.
 *
 * SETUP: Replace YOUR_KIT_FORM_ID and YOUR_KIT_API_KEY below
 * with values from kit.com (free up to 10,000 subscribers)
 */
(function () {
  'use strict';

  const KIT_FORM_ID = 'YOUR_KIT_FORM_ID';
  const KIT_API_KEY = 'YOUR_KIT_API_KEY';

  /* Don't show the button if already signed up */
  let signedUp = false;
  try { signedUp = localStorage.getItem('lo_signed_up') === '1'; } catch (e) {}

  /* ── STYLES ─────────────────────────────────────── */
  const css = document.createElement('style');
  css.textContent = `

    /* ── LAUNCHER WRAPPER ─────────────────────────── */
    /* Sits fixed bottom-right, slides in on load      */
    #lo-launcher {
      position: fixed;
      bottom: 28px;
      right: 0;
      z-index: 9000;
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

    /* Collapse toggle — little tab below the button */
    #lo-collapse-btn {
      background: rgba(255,102,102,0.12);
      border: none;
      border-radius: 0 0 0 3px;
      border-top: 1px solid rgba(255,102,102,0.15);
      width: 100%;
      min-height: 32px;
      padding: 7px 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 5px;
      transition: background 0.2s;
    }

    #lo-collapse-btn:hover { background: rgba(255,102,102,0.2); }

    #lo-collapse-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 7px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,102,102,0.6);
      transition: opacity 0.2s, width 0.35s;
      overflow: hidden;
      white-space: nowrap;
    }

    #lo-launcher.lo-collapsed #lo-collapse-label {
      opacity: 0;
      width: 0;
    }

    #lo-collapse-icon {
      color: rgba(255,102,102,0.6);
      font-size: 9px;
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
    #lo-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9001;
      background: rgba(10,9,8,0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    #lo-overlay.lo-open { display: flex; }

    #lo-modal {
      background: #0f0e0d;
      border: 1px solid rgba(255,102,102,0.25);
      width: 100%;
      max-width: 520px;
      position: relative;
      overflow: hidden;
      animation: lo-modal-in 0.4s cubic-bezier(0.34,1.56,0.64,1);
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
      padding: 36px 36px 28px;
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
      padding: 28px 36px 36px;
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
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(26px, 5vw, 36px);
      font-weight: 400;
      line-height: 1.0;
      letter-spacing: -0.025em;
      color: #e8e2d9;
      margin-bottom: 14px;
    }

    .lo-modal-hl em { font-style: italic; color: #FF6666; }

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
      font-family: 'DM Serif Display', Georgia, serif;
      font-style: italic;
      font-size: 14px;
      letter-spacing: 0;
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
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      padding: 15px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      box-shadow: 0 4px 24px rgba(255,102,102,0.35);
    }

    .lo-submit:hover { opacity: 0.88; transform: translateY(-1px); }
    .lo-submit:active { transform: translateY(0); }
    .lo-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .lo-fine-print {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 9px;
      color: rgba(232,226,217,0.18);
      line-height: 1.6;
      margin-top: 12px;
      text-align: center;
    }

    #lo-close {
      position: absolute;
      top: 12px; right: 14px;
      background: none;
      border: none;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 9px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(232,226,217,0.22);
      transition: color 0.2s;
      padding: 4px;
    }
    #lo-close:hover { color: #FF6666; }

    #lo-success {
      display: none;
      padding: 48px 32px;
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
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 28px; font-style: italic;
      color: #e8e2d9; margin-bottom: 10px;
    }

    .lo-success-hl em { font-style: normal; color: #FF6666; }

    .lo-success-sub {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px; font-weight: 300;
      color: rgba(232,226,217,0.45); line-height: 1.75;
    }

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
      #lo-modal-header { padding: 24px 20px 18px; }
      #lo-modal-body { padding: 18px 20px 24px; }
      .lo-field-row { grid-template-columns: 1fr; }
      #lo-success { padding: 36px 20px; }
    }
  `;
  document.head.appendChild(css);

  /* ── HTML ───────────────────────────────────────── */
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="lo-launcher">

      <button id="lo-trigger" aria-label="Get free seminar">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="flex-shrink:0">
          <polygon points="1,0.5 11,6 1,11.5" fill="#0f0e0d"/>
        </svg>
        <span id="lo-trigger-label">Free Seminar</span>
      </button>

      <button id="lo-collapse-btn" aria-label="Toggle seminar button">
        <span id="lo-collapse-label">Hide</span>
        <span id="lo-collapse-icon">&#8249;</span>
      </button>

    </div>

    <div id="lo-overlay" role="dialog" aria-modal="true" aria-labelledby="lo-modal-title">
      <div id="lo-modal">

        <button id="lo-close" aria-label="Close">✕ Close</button>

        <div id="lo-form-wrap">
          <div id="lo-modal-header">
            <div class="lo-eyebrow">Free — B&amp;H BILD Expo 2025</div>
            <h2 class="lo-modal-hl" id="lo-modal-title">
              Instagram is changing<br><em>filmmakers' lives.</em>
            </h2>
            <p class="lo-modal-sub">
              Watch Kyra and Brendan's full keynote from the B&amp;H BILD Expo — free. What's changing on Instagram, what it means for your career, and exactly what to do about it. No pitch, no paywall.
            </p>
            <div class="lo-stat-pill">
              <strong>Free</strong> keynote — opt in to unlock
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
                  I agree to receive the free seminar and occasional emails from Lost Objects about social media strategy for the film industry. Unsubscribe any time.
                </span>
              </label>

              <button class="lo-submit" type="submit" id="lo-submit-btn">
                Send me the free seminar &#8594;
              </button>

              <p class="lo-fine-print">No spam. No selling your info. Just the seminar and useful things.</p>

            </form>
          </div>
        </div>

        <div id="lo-success">
          <div class="lo-success-icon">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M1 7l5 5 11-11" stroke="#FF6666" stroke-width="1.5" stroke-linecap="square"/>
            </svg>
          </div>
          <h3 class="lo-success-hl">You're <em>found.</em></h3>
          <p class="lo-success-sub">Check your inbox — the seminar is on its way.<br>If you don't see it, check your spam folder.</p>
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

  /* ── COLLAPSE STATE ─────────────────────────────── */
  let collapsed = false;

  /* Restore collapse preference */
  try {
    if (sessionStorage.getItem('lo_collapsed') === '1') {
      collapsed = true;
      launcher.classList.add('lo-collapsed');
    }
  } catch (e) {}

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
      const res = await fetch(
        `https://api.convertkit.com/v3/forms/${KIT_FORM_ID}/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: KIT_API_KEY,
            first_name: first + ' ' + last,
            email: email,
            tags: ['bh-seminar', 'website-popup'],
          }),
        }
      );

      if (res.ok) {
        formWrap.style.display = 'none';
        success.style.display  = 'block';
        /* Collapse the launcher to just a tiny tab after signup */
        setTimeout(() => setCollapsed(true), 1200);
        try { localStorage.setItem('lo_signed_up', '1'); } catch (err) {}
      } else {
        submitBtn.textContent = 'Something went wrong — try again';
        submitBtn.disabled    = false;
      }
    } catch (err) {
      submitBtn.textContent = 'Something went wrong — try again';
      submitBtn.disabled    = false;
    }
  });

  /* Hide trigger entirely if already signed up */
  if (signedUp) {
    launcher.style.display = 'none';
  }

})();
