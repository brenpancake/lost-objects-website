# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing site for **Lost Objects** (Kyra & Brendan Sweeney) — social media strategy/management for the film industry. Pure static site: no build step, no package manager, no tests, no framework.

## Running locally

Open any `.html` file directly in a browser, or serve the directory with any static server, e.g. `python -m http.server` from the repo root. There is no `npm`/`build`/`lint`/`test` pipeline — changes to HTML/CSS/JS are live on reload.

## Architecture

Three standalone pages at the repo root, each a self-contained document:

- `index.html` (the single-page marketing site), `privacy.html`, `terms.html`

A separate CRM app lives under `crm/` (`crm/index.html`, `crm/share.html`, `crm/dataLayer.js`). The legacy `about.html`, `services.html`, `work.html`, and `contact.html` pages were archived; their routes now 301-redirect to `/` via `vercel.json` (see the merge-procedure section below).

Each page is authored in a single file with **inlined CSS in a `<style>` block** and **inlined page-specific JS in a `<script>` block** near the bottom. There is no shared CSS file and no templating — nav, footer, and design tokens are **duplicated** across pages. When changing site-wide visuals (colors, nav, footer, typography), update every root HTML page.

Shared design tokens live in each file's `:root` CSS variables (`--pink`, `--cream`, `--bg`, `--bg2`, `--fg*`, `--display`, `--accent-serif`, `--sans`, `--max`, `--pad`, `--nav-h`). Keep these consistent across pages when editing.

The **only shared JS asset** is `lead-popup.js`, included via `<script src="lead-popup.js">` on every page. It self-initializes as an IIFE, injects its own CSS and DOM, and renders a persistent collapsible lead-capture tab in the bottom-right. It posts to ConvertKit (Kit)'s **keyless public form-subscription endpoint** at `https://app.convertkit.com/forms/${KIT_FORM_ID}/subscriptions` (no API key in client code) and persists a `lo_signed_up` flag in `localStorage` to suppress re-prompts.

## Third-party integrations

- **ConvertKit / Kit** (newsletter): `KIT_FORM_ID` constant at the top of `lead-popup.js`. The popup submits to that form's keyless public endpoint (`https://app.convertkit.com/forms/${KIT_FORM_ID}/subscriptions`) with `email_address` + `fields[first_name]` — **no API key in client code**. Tagging/automation is configured on the form itself in the Kit dashboard. The homepage CSP (`index.html`) must allow `https://app.convertkit.com` in `connect-src`.
- **Formspree** (contact forms): both `#auditForm` and `#openForm` in `contact.html`, and the Services `#fitForm` in `index.html`, post to `https://formspree.io/f/xgoqdyyd`.
- **Vimeo Player API**: loaded in `index.html` only (`https://player.vimeo.com/api/player.js`) for the hero video.

When editing these, do not replace the placeholder strings with real keys unless explicitly asked — treat them as config the site owner fills in.

## Conventions

- Preserve the inlined-per-page structure; do not extract shared CSS/JS into new files unless asked. Duplication is intentional for this codebase.
- The aesthetic is dark and film-grain. Display headings use **Built Titling** (`--display`, loaded from the local `.otf` files in `fonts/` via `fonts.css`); body copy uses **Inter** (`--sans`); **Fraunces** (`--accent-serif`, loaded from Google Fonts) is used for accent/quote serif text. The primary accent color is coral `--pink: #FF6666` over a near-black `--bg: #0f0e0d`. A full-viewport animated SVG `.grain` layer (`z-index: 9999`) and a radial `.vignette` (`z-index: 9998`) sit above content on every page — keep page content `z-index` below 9998.
- Line endings and file sizes: HTML files are large (900–1500 lines) because of inlined styles. Prefer `Edit` over `Write` for changes.

## Mobile fixed header — GPU compositing (do not remove)

On iOS Safari, the animated scroll sections (.scene, .hero, .collage-section) are GPU-promoted via transform: translateZ(0) / backface-visibility: hidden. These promoted layers paint OVER the fixed nav even though the nav has a higher z-index — z-index and GPU layer order are not the same thing on WebKit. This caused page content to bleed through the header on iPhone.

The fix lives in the @media (max-width: 1024px) nav block: z-index 10000, transform translateZ(0), will-change transform, and isolation isolate promote the nav into its own compositing layer so it stays on top. Do NOT remove these thinking they are redundant — a solid background alone does not fix it, and desktop (>1024px) deliberately keeps the original z-index 200 with no GPU promotion. Also note env(safe-area-inset-top) resolves to 0 on real iPhones here, so the status-bar band is covered by a fixed 100px nav::before overhang, not by env().

## IMPORTANT: How to merge feature/crm-redesign

`feature/crm-redesign` was branched **before** the legacy marketing pages were archived from `main`. Because of that, a plain `git merge feature/crm-redesign` into `main` would **undo today's cleanup**:

- It would **resurrect the four deleted pages** — `about.html`, `services.html`, `work.html`, and `contact.html` — since those files still exist on that branch.
- It would **strip the 301 redirects** for `/about`, `/services`, `/work`, and `/contact` from `vercel.json`, because that branch predates the `redirects` block.

**Required procedure — do NOT do a plain merge.** Before bringing the CRM work into `main`, do one of the following so that *only* the CRM changes come across and the cleanup is preserved:

- **Rebase** `feature/crm-redesign` onto the current `main` (`git rebase main`), resolve conflicts so the legacy pages stay deleted and the `vercel.json` redirects stay in place, then merge; **or**
- **Cherry-pick only the `crm/index.html` changes** (the actual CRM work) onto a fresh branch off `main`, leaving everything else untouched.

**Do NOT merge the CRM to `main` at all** until real backend authentication replaces the plaintext demo credentials currently in the CRM. The login is a front-end demo only and must not go live as-is.
