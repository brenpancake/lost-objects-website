/*!
 * Lost Objects — Privacy / Cookie Notice
 *
 * Shows a single-time disclosure banner on first visit to any page on
 * the site. Stores acknowledgment in localStorage so it never repeats
 * for returning visitors (until the STORAGE_KEY version is bumped).
 *
 * This is a GOOD-FAITH DISCLOSURE banner, not a consent management
 * platform. It does not block cookies or trackers — it notifies the
 * visitor and captures acknowledgment. If this site later adds
 * analytics, ad pixels, or similar non-essential trackers, this
 * banner must be upgraded to block-until-consent.
 *
 * Bump STORAGE_KEY to force the banner to re-appear for all visitors
 * (e.g. after a material change to the privacy policy).
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'lo_privacy_v1';
  const SHOW_DELAY_MS = 700;

  /* Short-circuit if already acknowledged. Storage can throw in
     Safari private mode or when cookies are blocked entirely. */
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') return;
  } catch (e) { /* swallow — fall through and show banner */ }

  if (window.__loPrivacyNoticeLoaded) return;
  window.__loPrivacyNoticeLoaded = true;

  /* ---------- CSS ---------- */
  const CSS = `
    .lo-privacy-notice {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translate(-50%, 20px);
      z-index: 9100;
      width: min(560px, calc(100vw - 32px));
      background: #14120f;
      border: 1px solid rgba(255,102,102,0.32);
      box-shadow: 0 18px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,102,102,0.05);
      padding: 18px 22px 18px 22px;
      font-family: 'Inter', system-ui, sans-serif;
      color: #f2ece1;
      opacity: 0;
      transition: opacity 0.45s ease, transform 0.45s ease;
      pointer-events: none;
    }
    .lo-privacy-notice.visible {
      opacity: 1;
      transform: translate(-50%, 0);
      pointer-events: auto;
    }
    .lo-privacy-notice.hiding {
      opacity: 0;
      transform: translate(-50%, 16px);
      pointer-events: none;
    }
    .lo-privacy-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 10px;
    }
    .lo-privacy-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: #FF6666;
    }
    .lo-privacy-close {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      line-height: 1;
      color: rgba(242,236,225,0.55);
      background: none;
      border: 1px solid rgba(242,236,225,0.22);
      border-radius: 2px;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      transition: color 0.2s, border-color 0.2s, background 0.2s;
    }
    .lo-privacy-close:hover {
      color: #f2ece1;
      border-color: rgba(255,102,102,0.6);
      background: rgba(255,102,102,0.08);
    }
    .lo-privacy-body {
      font-size: 12px;
      font-weight: 400;
      line-height: 1.6;
      color: rgba(242,236,225,0.78);
      margin: 0 0 14px 0;
    }
    .lo-privacy-body a {
      color: #f2ece1;
      border-bottom: 1px solid rgba(255,102,102,0.5);
      transition: color 0.2s, border-color 0.2s;
    }
    .lo-privacy-body a:hover {
      color: #FF6666;
      border-color: #FF6666;
    }
    .lo-privacy-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      flex-wrap: wrap;
    }
    .lo-privacy-btn {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      cursor: pointer;
      padding: 9px 20px;
      border-radius: 0;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    }
    .lo-privacy-btn-primary {
      color: #FF6666;
      background: none;
      border: 1px solid rgba(255,102,102,0.5);
    }
    .lo-privacy-btn-primary:hover {
      color: #14120f;
      background: #FF6666;
      border-color: #FF6666;
    }
    /* ── MOBILE — compact, bottom-anchored bar ─────── */
    @media (max-width: 768px) {
      .lo-privacy-notice {
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-width: 100%;
        transform: translateY(20px);
        padding: 16px;
        max-height: 45vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        z-index: 9000;
        border-left: none;
        border-right: none;
        border-bottom: none;
      }
      .lo-privacy-notice.visible { transform: translateY(0); }
      .lo-privacy-notice.hiding { transform: translateY(16px); }
      .lo-privacy-head { margin-bottom: 8px; }
      .lo-privacy-body { font-size: 13px; margin-bottom: 12px; }
      .lo-privacy-btn {
        min-height: 40px;
        padding: 0 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }
    @media (max-width: 520px) {
      .lo-privacy-body { font-size: 12px; }
      .lo-privacy-actions { justify-content: stretch; }
      .lo-privacy-btn-primary { flex: 1; text-align: center; }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ---------- DOM ---------- */
  function build() {
    const wrap = document.createElement('div');
    wrap.className = 'lo-privacy-notice';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', 'Privacy notice');
    wrap.innerHTML =
      '<div class="lo-privacy-head">' +
        '<span class="lo-privacy-label">Privacy &amp; Cookies</span>' +
        '<button class="lo-privacy-close" type="button" aria-label="Dismiss privacy notice">&#x2715;</button>' +
      '</div>' +
      '<p class="lo-privacy-body">' +
        'Lost Objects uses cookies and similar technologies for essential site features and to remember your preferences. ' +
        'By continuing to use this site, you agree to our <a href="privacy.html">Privacy Policy</a> and ' +
        '<a href="terms.html">Terms &amp; Conditions</a>.' +
      '</p>' +
      '<div class="lo-privacy-actions">' +
        '<button class="lo-privacy-btn lo-privacy-btn-primary" type="button">Accept &amp; Continue</button>' +
      '</div>';

    document.body.appendChild(wrap);

    const closeBtn = wrap.querySelector('.lo-privacy-close');
    const acceptBtn = wrap.querySelector('.lo-privacy-btn-primary');
    closeBtn.addEventListener('click', dismiss);
    acceptBtn.addEventListener('click', dismiss);

    /* Fade in after the short delay, letting the page settle first */
    setTimeout(function () {
      wrap.classList.add('visible');
    }, SHOW_DELAY_MS);

    return wrap;
  }

  let notice = null;

  /* Flag the page + publish the banner's height so other fixed-position
     UI (the Free Seminar tab in lead-popup.js) can lift itself clear of
     the banner on mobile via `body.cookie-active` + the --lo-cookie-h var. */
  function syncCookieMetrics() {
    if (!notice) return;
    document.body.classList.add('cookie-active');
    document.documentElement.style.setProperty('--lo-cookie-h', notice.offsetHeight + 'px');
  }

  function clearCookieMetrics() {
    document.body.classList.remove('cookie-active');
    document.documentElement.style.removeProperty('--lo-cookie-h');
  }

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* ignore */ }
    if (!notice) return;
    notice.classList.remove('visible');
    notice.classList.add('hiding');
    /* Drop the flag immediately so the Free Seminar tab eases back to its
       normal bottom position as the banner fades out. */
    clearCookieMetrics();
    /* Give the fade-out transition (0.45s) time to finish, then strip from DOM */
    setTimeout(function () {
      if (notice && notice.parentNode) notice.parentNode.removeChild(notice);
      notice = null;
    }, 500);
  }

  function init() {
    notice = build();
    syncCookieMetrics();
    /* Banner height shifts across breakpoints / orientation — keep the
       published value in sync while the banner is on screen. */
    window.addEventListener('resize', syncCookieMetrics);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
