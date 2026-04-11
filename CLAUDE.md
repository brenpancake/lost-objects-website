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

The **only shared JS asset** is `lead-popup.js`, included via `<script src="lead-popup.js">` on every page. It self-initializes as an IIFE, injects its own CSS and DOM, and renders a persistent collapsible lead-capture tab in the bottom-right. It posts to ConvertKit (Kit) at `https://api.convertkit.com/v3/forms/${KIT_FORM_ID}/subscribe` and persists a `lo_signed_up` flag in `localStorage` to suppress re-prompts.

## Third-party integrations (placeholders in code)

Several integrations are wired up but hold placeholder IDs that must be filled in before the site is functional:

- **ConvertKit / Kit** (newsletter): `KIT_FORM_ID` and `KIT_API_KEY` constants at the top of `lead-popup.js`.
- **Formspree** (contact forms): `action="https://formspree.io/f/YOUR_FORMSPREE_ID"` on both `#auditForm` and `#openForm` in `contact.html`. Setup instructions are left as an HTML comment above the forms.
- **Vimeo Player API**: loaded in `index.html` only (`https://player.vimeo.com/api/player.js`) for the hero video.

When editing these, do not replace the placeholder strings with real keys unless explicitly asked — treat them as config the site owner fills in.

## Conventions

- Preserve the inlined-per-page structure; do not extract shared CSS/JS into new files unless asked. Duplication is intentional for this codebase.
- The aesthetic is dark, film-grain, serif-display headings (`DM Serif Display`) + `Inter` body. A full-viewport SVG `.grain` layer and radial `.vignette` sit above content on every page — keep `z-index` below 9998 for page content.
- Line endings and file sizes: HTML files are large (900–1500 lines) because of inlined styles. Prefer `Edit` over `Write` for changes.
