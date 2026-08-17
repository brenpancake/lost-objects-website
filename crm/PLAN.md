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

## Design direction

Cross-cutting. These apply to **every** surface built from here on, not to a single phase — retrofitting them later costs more than building them in.

**Theming.** Dark default plus a *real* light mode — not an afterthought inversion. Framed as wellbeing: eye strain, focus, and matching the user's environment. Every new surface must honor the active theme from the moment it is written. Practically: no hard-coded colours in new work, only the `:root` tokens; check both themes before calling a surface done.

**Personalized welcome per role** (Crextio's "Hello [name]" pattern). The landing surface answers *what does this person need to do, consider, and engage with today* — not a generic dashboard. This is role-shaped by definition, so it lands with Phase 2 and deepens as freelancer and client roles arrive. The existing welcome bar is the seed of this, but it currently greets everyone identically.

**Gamification = progress made legible.** Completion states, visible momentum, the satisfaction of a clean queue. Explicitly **not** vanity points, leaderboards, or manipulative streaks. The onboarding checklist and the intake queue emptying are the model: the reward is the work visibly moving, not a score.

**Reference:** Crextio — clean, calm, engaged multi-user management.

---

## Phases

### 1. UNIFY — ✅ **COMPLETE**

> **✅ PHASE 1 DONE — views rewired to unified model, compatibility layer removed, verified. Data has one source of truth; lifecycle-memory problem solved at the data layer.**

- ✅ **Module split** — 33 files, provable zero behavior change (`36c768d`, `18bf5f0`).
- ✅ **Unified model** — companies carry lifecycle (6-state ladder incl. Dormant + Network), contacts reference companies, intake as graduating sub-object, Halcyon as merged proof case (`1cf76d8`).
- ✅ **Views rewired** onto the model; **compatibility layer removed** (`1aef5be`, `5968c22`). No mirror fields, no projection, no legacy shape anywhere — the seed itself is unified.
- ✅ Intake is now a view of a record's early life: `intakeQueue()` = Lead/Prospect with a non-graduated intake. Graduating flips lifecycle to Active and drops the card from the queue.
- ✅ Tab counts are true: intake 9 (was a constant 6), companies 20, all 42, active 5, prospects 8, network 17, past 1.
- ✅ Intake now **persists** — the old `intakeLeads` was in-memory only and reset on reload.

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

`crm/index.html` is a 477-line shell — markup only. All CSS lives in `crm/css/` (10 files), all JS in `crm/js/` (24 files).

### JS load order — do not reorder casually

Scripts are **plain classic `<script>` tags**, loaded at the end of `<body>`.

- **Never `type="module"`.** The markup depends on **257 inline `on*=` handlers**; module scope would take every function off `window` and break them silently — only on click, not at load.
- **`utils.js` must load first** — `seed-data.js` calls `uid()` at top level. Getting this wrong is invisible on a machine that already has `lo-contacts-v4` in localStorage, and breaks the app completely for a fresh visitor.
- **`config.js` → `storage.js` → `seed-data.js`.**
- **`boot.js` must load last** — it restores the session and cascades into nearly every module.
- Everything else is function declarations, resolved at call time; order is free.

### Module map

| `crm/js/` | Holds |
|---|---|
| `utils.js` | `uid, esc, esc2, cap, fmt, ini, isGuest, toast, logAct, fmtDate, checkSvg`, icon SVGs |
| `config.js` | Users, roles, tags, storage keys, `AV_BG`/`PILL_*`/`CAT_LABELS` |
| `storage.js` | `ls` and the `contacts` array (the name-keyed company side table is gone) |
| `users.js` | `getAllUsers, getUserDef, canDo` |
| `auth.js` | Login, 2FA, forgot-password, `bootApp` |
| `seed-data.js` | `SEED_COMPANIES` + `SEED_CONTACTS` — unified shape, no legacy fields |
| `profile.js` | Prefs, theme/font, team CRUD, email settings |
| `comms.js` | DMs + presence |
| `notifications.js` | Notif store, panel, mention detection |
| `favorites.js` | Bins |
| `app.js` | `init, switchTab, renderMain, renderStats`, filters, global listeners |
| `views.js` | Companies view, company cards, contact cards |
| `intake.js` | Intake command centre — reads `intakeQueue()`, four stages, checklist, containers, graduation |
| `dashboard.js` | Feed, overdue, dashboard panels, channel |
| `dash-edit.js` | Quick-edit popout |
| `seed-demo.js` | Feed / channel / DM / notification seeds |
| `trash.js` | Soft delete, restore, purge |
| `detail.js` | Contact detail, **company detail**, inquiry renderer |
| `comments.js` | Mentions, post, like |
| `contact-modal.js` | Add/edit contact, copy/share |
| `rail.js` | Side rail, profile view |
| `pacman.js` | Easter egg |
| `data.js` | **Unified model** — schema, load/persist, queries, mutations. Documented public API at the top; everything below it is internal |
| `boot.js` | Global listeners + session restore |

CSS files are contiguous slices linked in source order: `tokens, login, shell, cards, rail, overlays, dashboard, comments, responsive, intake`. **Link order must equal source order** — several same-specificity rules rely on later-wins (`.dash-scroll`, `.modal`). Font paths in `login.css` are `../../fonts/` — relative to `crm/css/`, not `crm/`.

Storage keys: `lo-contacts-v4` (contacts) and `lo-companies-v3` (companies). Both bumped when the compatibility layer came out, so any browser holding legacy-shaped data re-seeds cleanly. `share.html` reads the same keys and resolves a contact's company via `companyId`.

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
- ~~No engagement entity.~~ **Closed in Phase 1.** Companies carry `engagements[]` with per-engagement status (proposed / active / completed / paused), so concurrent à-la-carte services and Dormant are both representable. `suggestsDormant()` flags an Active company whose engagements have all completed.
- **No money model.** Container tiles name QuickBooks and DocuSign, but the only financial data is price strings and hand-written status text.
- `crm/dataLayer.js` is **still not loaded by anything** and now references the retired `lo-contacts-v3` / `lo-companies-v1` keys. It was carried through Phase 1 untouched — either rewrite it against the unified model when a real backend arrives, or delete it.

---

## Progress log

- **2026-08-16** — Phase 1: module split landed. `crm/index.html` 2,960 → 477 lines; CSS into 10 files, JS into 23. Byte-identical concatenation proof, 71/71 functional checks green. Next up: unify the two datasets.
- **2026-08-16** — Phase 1: unified data model landed in `js/data.js` (20 companies, 42 contacts, 68 comments preserved, contact ids untouched). Views still read through the compatibility layer. 71/71 green. Next up: rewire views onto the model and delete the compatibility layer.
- **2026-08-16** — Design direction recorded (theming as wellbeing, per-role personalized welcome, gamification as legible progress; Crextio as reference). Cross-cutting — applies to every surface from here.
- **2026-08-16** — **Phase 1 COMPLETE.** All views rewired onto the unified model; compatibility layer removed entirely (mirror fields, `intakeLeads` projection, name-keyed company store, legacy translation tables — all gone, seed regenerated in unified shape). Added a company detail panel and a Past view with Former/Dormant chips. 83/83 checks green, zero console errors, intake persists across reload. Next up: **Phase 2 — roles.** Open question carried forward: Network is split across company `lifecycle` and contact `role` (17 network people, 0 network companies); decide whether it stays that way.
