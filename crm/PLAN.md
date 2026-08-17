# LO Underground — Overhaul Roadmap

**Target: working demo by January 2027.**

Open this file first. It is the map for the CRM overhaul — read it before changing anything under `crm/`.

---

## Vision

The centralized internal system for Lost Objects. One place that carries a client from first contact to archive:

- **Client intake** from the homepage services block, through the full lifecycle: **lead → active → former → dormant**, à la carte.
- **Three user roles** — owner, project manager, freelancer.
- **A job board** where roster freelancers claim posted work.
- **A client portal** — invoices, agreements, asset upload, After Hours entry.

**Demo-first on simulated data.** Live integrations (Slack, Notion, Drive, Kit, Cowork) come *after* the demo proves the flow. Do not wire a real service until the thing it plugs into is clickable and approved.

---

## Phases

### 1. UNIFY — *in progress*

- ✅ **Module split complete** — 33 files, provable zero behavior change (`36c768d`, `18bf5f0`).
- ⬜ **NEXT: merge the two datasets.** Intake leads and companies/contacts are currently separate in-memory/localStorage worlds with no shared identifier and no conversion path. Collapse them into **one unified record model with a lifecycle status**.
- ⬜ Intake becomes a *view of a record's early life*, not a parallel dataset.
- ⬜ Tab counts become true (today `cnt-intake` is a constant 6 — leads never leave the queue).

### 2. ROLES

- ⬜ Make the login role field real: **owner / project manager / freelancer**.
- ⬜ Slimmed freelancer view.

### 3. JOB BOARD

- ⬜ Confirmed leads postable as open jobs.
- ⬜ Freelancers claim; owners approve.

### 4. CLIENT PORTAL

- ⬜ Separate client login.
- ⬜ Engagement status, invoices, agreements, asset-upload stub, After Hours entry.

### 5. POLISH + DEMO PREP

- ⬜ Legibility and daily-function pass.
- ⬜ End-to-end demo data seeding.

---

## Working agreements

1. **Zero-behavior-change refactors are committed separately from feature work.** Never mix a move with a change.
2. **Every phase ends with something clickable.** No phase closes on scaffolding alone.
3. **Demo data only** until the demo is approved.
4. **Update this file with a one-line progress note each session** (see Progress log).

---

## Current state

`crm/index.html` is a 477-line shell — markup only. All CSS lives in `crm/css/` (10 files), all JS in `crm/js/` (23 files).

### JS load order — do not reorder casually

Scripts are **plain classic `<script>` tags**, loaded at the end of `<body>`.

- **Never `type="module"`.** The markup depends on **257 inline `on*=` handlers**; module scope would take every function off `window` and break them silently — only on click, not at load.
- **`utils.js` must load first** — `seed-data.js` calls `uid()` at top level. Getting this wrong is invisible on a machine that already has `lo-contacts-v3` in localStorage, and breaks the app completely for a fresh visitor.
- **`config.js` → `storage.js` → `seed-data.js`.**
- **`boot.js` must load last** — it restores the session and cascades into nearly every module.
- Everything else is function declarations, resolved at call time; order is free.

### Module map

| `crm/js/` | Holds |
|---|---|
| `utils.js` | `uid, esc, esc2, cap, fmt, ini, isGuest, toast, logAct, fmtDate, checkSvg`, icon SVGs |
| `config.js` | Users, roles, tags, storage keys, `AV_BG`/`PILL_*`/`CAT_LABELS` |
| `storage.js` | `ls`, the `contacts` array, company colour/notes side table |
| `users.js` | `getAllUsers, getUserDef, canDo` |
| `auth.js` | Login, 2FA, forgot-password, `bootApp` |
| `seed-data.js` | Seed contacts |
| `profile.js` | Prefs, theme/font, team CRUD, email settings |
| `comms.js` | DMs + presence |
| `notifications.js` | Notif store, panel, mention detection |
| `favorites.js` | Bins |
| `app.js` | `init, switchTab, renderMain, renderStats`, filters, global listeners |
| `views.js` | Companies view + card grid |
| `intake.js` | Intake pipeline (`intakeLeads`, stages, checklist, containers) |
| `dashboard.js` | Feed, overdue, dashboard panels, channel |
| `dash-edit.js` | Quick-edit popout |
| `seed-demo.js` | Feed / channel / DM / notification seeds |
| `trash.js` | Soft delete, restore, purge |
| `detail.js` | Detail panel + inquiry renderer |
| `comments.js` | Mentions, post, like |
| `contact-modal.js` | Add/edit contact, copy/share |
| `rail.js` | Side rail, profile view |
| `pacman.js` | Easter egg |
| `boot.js` | Global listeners + session restore |

CSS files are contiguous slices linked in source order: `tokens, login, shell, cards, rail, overlays, dashboard, comments, responsive, intake`. **Link order must equal source order** — several same-specificity rules rely on later-wins (`.dash-scroll`, `.modal`). Font paths in `login.css` are `../../fonts/` — relative to `crm/css/`, not `crm/`.

### Verification protocol for refactors

For any zero-behavior-change move, prove it mechanically before running anything:

```
cat css/<files in link order>  | diff - <original slice>   # expect empty
cat js/<files in load order>   | diff - <original slice>   # expect empty
```

Then: all assets 200, `node --check` on every module, and a functional pass over login → every tab → intake actions → comments → favorites → trash → rail → role matrix.

---

## Known blockers and gaps

- **Do not merge `crm/` to `main`** until real backend authentication replaces the plaintext demo credentials. See `CLAUDE.md`. The login is a front-end demo; passwords are readable in `config.js`, and 2FA accepts any code.
- **No persistence beyond localStorage.** "Team" collaboration is simulated — DMs, notifications, comments, and presence all live in one browser. Two people on two machines share nothing. Every phase from 2 onward is inherently multi-party and will need a real backend to be more than a mockup.
- **No visibility scoping.** Roles currently gate *verbs* (`canEdit`, `canDelete`, …), never *what you can see*. Every user sees all records. Phases 2–4 all depend on adding a scoping layer.
- **No engagement entity.** A client has one free-text `service` string, so concurrent à-la-carte services — and a `dormant` status — are not representable yet. Phase 1 should fix this while unifying the model.
- **No money model.** Container tiles name QuickBooks and DocuSign, but the only financial data is price strings and hand-written status text.
- `crm/dataLayer.js` exists as a storage abstraction with Airtable TODOs and is **not loaded by anything**. Either wire it during Phase 1 or delete it.

---

## Progress log

- **2026-08-16** — Phase 1: module split landed. `crm/index.html` 2,960 → 477 lines; CSS into 10 files, JS into 23. Byte-identical concatenation proof, 71/71 functional checks green. Next up: unify the two datasets.
