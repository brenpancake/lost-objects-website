# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing site for **Lost Objects** (Kyra & Brendan Sweeney) — social media strategy/management for the film industry. Pure static site: no build step, no package manager, no tests, no framework.

## Running locally

Open any `.html` file directly in a browser, or serve the directory with any static server, e.g. `python -m http.server` from the repo root. There is no `npm`/`build`/`lint`/`test` pipeline — changes to HTML/CSS/JS are live on reload.

## Architecture

Five standalone pages at the repo root, each a self-contained document:

- `index.html`, `about.html`, `services.html`, `work.html`, `contact.html`

Each page is authored in a single file with **inlined CSS in a `<style>` block** and **inlined page-specific JS in a `<script>` block** near the bottom. There is no shared CSS file and no templating — nav, footer, and design tokens are **duplicated** across pages. When changing site-wide visuals (colors, nav, footer, typography), update all five HTML files.

Shared design tokens live in each file's `:root` CSS variables (`--pink`, `--cream`, `--bg`, `--bg2`, `--fg*`, `--serif`, `--sans`, `--max`, `--pad`, `--nav-h`). Keep these consistent across pages when editing.

The **only shared JS asset** is `lead-popup.js`, included via `<script src="lead-popup.js">` on every page. It self-initializes as an IIFE, injects its own CSS and DOM, and renders a persistent collapsible lead-capture tab in the bottom-right. It posts to ConvertKit (Kit)'s **keyless public form-subscription endpoint** at `https://app.convertkit.com/forms/${KIT_FORM_ID}/subscriptions` (no API key in client code) and persists a `lo_signed_up` flag in `localStorage` to suppress re-prompts.

## Third-party integrations

- **ConvertKit / Kit** (newsletter): `KIT_FORM_ID` constant at the top of `lead-popup.js`. The popup submits to that form's keyless public endpoint (`https://app.convertkit.com/forms/${KIT_FORM_ID}/subscriptions`) with `email_address` + `fields[first_name]` — **no API key in client code**. Tagging/automation is configured on the form itself in the Kit dashboard. The homepage CSP (`index.html`) must allow `https://app.convertkit.com` in `connect-src`.
- **Formspree** (contact forms): both `#auditForm` and `#openForm` in `contact.html`, and the Services `#fitForm` in `index.html`, post to `https://formspree.io/f/xgoqdyyd`.
- **Vimeo Player API**: loaded in `index.html` only (`https://player.vimeo.com/api/player.js`) for the hero video.

When editing these, do not replace the placeholder strings with real keys unless explicitly asked — treat them as config the site owner fills in.

## Conventions

- Preserve the inlined-per-page structure; do not extract shared CSS/JS into new files unless asked. Duplication is intentional for this codebase.
- The aesthetic is dark, film-grain, serif-display headings (`DM Serif Display`) + `Inter` body. A full-viewport SVG `.grain` layer and radial `.vignette` sit above content on every page — keep `z-index` below 9998 for page content.
- Line endings and file sizes: HTML files are large (900–1500 lines) because of inlined styles. Prefer `Edit` over `Write` for changes.

## IMPORTANT: How to merge feature/crm-redesign

`feature/crm-redesign` was branched **before** the legacy marketing pages were archived from `main`. Because of that, a plain `git merge feature/crm-redesign` into `main` would **undo today's cleanup**:

- It would **resurrect the four deleted pages** — `about.html`, `services.html`, `work.html`, and `contact.html` — since those files still exist on that branch.
- It would **strip the 301 redirects** for `/about`, `/services`, `/work`, and `/contact` from `vercel.json`, because that branch predates the `redirects` block.

**Required procedure — do NOT do a plain merge.** Before bringing the CRM work into `main`, do one of the following so that *only* the CRM changes come across and the cleanup is preserved:

- **Rebase** `feature/crm-redesign` onto the current `main` (`git rebase main`), resolve conflicts so the legacy pages stay deleted and the `vercel.json` redirects stay in place, then merge; **or**
- **Cherry-pick only the `crm/index.html` changes** (the actual CRM work) onto a fresh branch off `main`, leaving everything else untouched.

**Do NOT merge the CRM to `main` at all** until real backend authentication replaces the plaintext demo credentials currently in the CRM. The login is a front-end demo only and must not go live as-is.
