/*!
 * Lost Objects — Lead Capture Popup
 * Fixed bottom-right button that opens a seminar signup modal.
 * Add to every page with: <script src="lead-popup.js"></script>
 *
 * SETUP: Replace YOUR_KIT_FORM_ID and YOUR_KIT_API_KEY below
 * with your values from kit.com (free up to 10,000 subscribers)
 */
(function () {
  'use strict';

  const KIT_FORM_ID = 'YOUR_KIT_FORM_ID';
  const KIT_API_KEY = 'YOUR_KIT_API_KEY';

  /* Don't show again if already signed up this session */
  try {
    if (localStorage.getItem('lo_signed_up') === '1') return;
  } catch (e) {}

  /* ── STYLES ───────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #lo-popup-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9000;
      display: flex;
      align-items: center;
      gap: 10px;
      background: #FF6666;
      color: #0f0e0d;
      border: none;
      padding: 13px 20px;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      box-shadow: 0 8px 32px rgba(255,102,102,0.3);
      transition: opacity 0.2s, transform 0.2s;
      animation: lo-bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.5s both;
    }
    #lo-popup-btn:hover {
      opacity: 0.88;
      transform: translateY(-2px);
    }
    #lo-popup-btn svg {
      flex-shrink: 0;
    }
    @keyframes lo-bounce-in {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    #lo-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9001;
      background: rgba(10,9,8,0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    #lo-overlay.lo-open {
      display: flex;
    }

    #lo-modal {
      background: #111010;
      border: 1px solid rgba(255,102,102,0.2);
      width: 100%;
      max-width: 500px;
      position: relative;
      animation: lo-modal-in 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes lo-modal-in {
      from { opacity: 0; transform: scale(0.95) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    #lo-modal-header {
      padding: 32px 32px 24px;
      border-bottom: 1px solid rgba(232,226,217,0.07);
    }

    .lo-eyebrow {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 8px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: rgba(255,102,102,0.65);
      margin-bottom: 12px;
    }

    .lo-modal-hl {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(20px, 4vw, 28px);
      font-weight: 400;
      line-height: 1.1;
      letter-spacing: -0.02em;
      color: #e8e2d9;
      margin-bottom: 10px;
    }

    .lo-modal-hl em {
      font-style: italic;
      color: #FF6666;
    }

    .lo-modal-sub {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 300;
      color: rgba(232,226,217,0.48);
      line-height: 1.75;
    }

    #lo-modal-body {
      padding: 24px 32px 32px;
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
      border: 1px solid rgba(232,226,217,0.07);
      color: #e8e2d9;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 300;
      padding: 11px 14px;
      outline: none;
      width: 100%;
      transition: border-color 0.2s;
      border-radius: 0;
      -webkit-appearance: none;
      box-sizing: border-box;
    }

    .lo-input:focus {
      border-color: rgba(255,102,102,0.4);
    }

    .lo-input::placeholder {
      color: rgba(232,226,217,0.2);
    }

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
    }

    .lo-checkbox:checked {
      background: #FF6666;
      border-color: #FF6666;
    }

    .lo-checkbox:checked::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 4px;
      width: 4px;
      height: 7px;
      border: 1.5px solid #0f0e0d;
      border-top: none;
      border-left: none;
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
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding: 14px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .lo-submit:hover { opacity: 0.85; }
    .lo-submit:disabled { opacity: 0.5; cursor: not-allowed; }

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
      top: 12px;
      right: 14px;
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
      width: 48px;
      height: 48px;
      border: 1px solid rgba(255,102,102,0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .lo-success-hl {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 28px;
      font-style: italic;
      color: #e8e2d9;
      margin-bottom: 10px;
    }

    .lo-success-hl em { font-style: normal; color: #FF6666; }

    .lo-success-sub {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 300;
      color: rgba(232,226,217,0.45);
      line-height: 1.75;
    }

    @media (max-width: 480px) {
      #lo-popup-btn { bottom: 16px; right: 16px; padding: 11px 16px; }
      #lo-modal-header { padding: 24px 20px 18px; }
      #lo-modal-body { padding: 18px 20px 24px; }
      .lo-field-row { grid-template-columns: 1fr; }
      #lo-success { padding: 36px 20px; }
    }
  `;
  document.head.appendChild(style);

  /* ── HTML ─────────────────────────────────────────── */
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <!-- Trigger button -->
    <button id="lo-popup-btn" aria-label="Get free seminar">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <polygon points="2,1 13,7 2,13" fill="#0f0e0d"/>
      </svg>
      Free Seminar
    </button>

    <!-- Overlay + Modal -->
    <div id="lo-overlay" role="dialog" aria-modal="true" aria-labelledby="lo-modal-title">
      <div id="lo-modal">

        <button id="lo-close" aria-label="Close">✕ Close</button>

        <!-- Form state -->
        <div id="lo-form-wrap">
          <div id="lo-modal-header">
            <div class="lo-eyebrow">Free — B&amp;H BILD Expo 2025</div>
            <h2 class="lo-modal-hl" id="lo-modal-title">
              Instagram is changing<br><em>filmmakers' lives.</em>
            </h2>
            <p class="lo-modal-sub">
              Watch Kyra and Brendan's full keynote from the B&amp;H BILD Expo — free. What's changing on Instagram, what it means for your career, and exactly what to do about it.
            </p>
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
                Send me the free seminar →
              </button>

              <p class="lo-fine-print">No spam. No selling your info. Just the seminar and useful things when we have them.</p>

            </form>
          </div>
        </div>

        <!-- Success state -->
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

  /* ── LOGIC ────────────────────────────────────────── */
  const btn      = document.getElementById('lo-popup-btn');
  const overlay  = document.getElementById('lo-overlay');
  const closeBtn = document.getElementById('lo-close');
  const form     = document.getElementById('lo-form');
  const submitBtn = document.getElementById('lo-submit-btn');
  const formWrap = document.getElementById('lo-form-wrap');
  const success  = document.getElementById('lo-success');

  function openModal() {
    overlay.classList.add('lo-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lo-first').focus();
  }

  function closeModal() {
    overlay.classList.remove('lo-open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const first = document.getElementById('lo-first').value.trim();
    const last  = document.getElementById('lo-last').value.trim();
    const email = document.getElementById('lo-email').value.trim();
    const optin = document.getElementById('lo-optin').checked;

    if (!first || !last || !email || !optin) {
      /* Simple shake on the submit button */
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
        btn.style.display      = 'none';
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

})();
