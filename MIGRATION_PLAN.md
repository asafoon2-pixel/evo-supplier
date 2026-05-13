# Migration Plan — Source Repo to Monorepo

> **For AI assistants:** Read this entire file before making any changes. This repo is being prepared for migration into a new unified monorepo that combines our **users** and **suppliers** apps. Your job here is **preparation, not relocation** — do not move files out of this repo. The actual merge happens later via `git subtree` in the target repo.

---

## Context

- This repo contains **either** the users-flow code **or** the suppliers-flow code (client + server).
- A sibling repo contains the other side.
- Both repos were built rapidly by non-developers using AI assistance. Expect inconsistency, dead code, and untyped/loosely-typed code.
- A software developer is now leading consolidation into one organized monorepo.
- Both apps share a single database.
- The target architecture is: **one shared API** serving both user-web and supplier-web clients.

---

## Goals of this migration prep

1. Make this repo **understandable** — anyone reading it should grasp what it does in 15 minutes.
2. Make it **importable** — clean enough to bring into the monorepo without dragging garbage along.
3. Document the **domain knowledge** that only lives in the founders' heads or in the code itself.
4. Identify what is **shared** with the sibling repo so it can be deduplicated later.

**Do not refactor heavily here.** The monorepo is where serious refactoring happens. Here, we clean, document, and inventory.

---

## Order of operations

Work through these phases in order. Do not skip ahead.

### Phase 1 — Inventory (read-only, no code changes)

Produce a file called `AUDIT.md` at the repo root with the following sections:

1. **Stack** — language, framework, runtime version, build tool, package manager.
2. **Entry points** — exact file(s) where the client and server start.
3. **Routes / endpoints** — every API route or page route, with a one-line description.
4. **Database tables/models touched** — list every table this app reads or writes.
5. **External services** — every third-party API, SDK, or service (payments, email, SMS, storage, analytics, auth providers).
6. **Environment variables** — every env var referenced anywhere in the code, with a guess at what it does.
7. **Authentication flow** — how a user logs in, where the session/token lives, how it's validated.
8. **Dead code candidates** — files, routes, or features that look unused, half-built, or commented out. Do not delete them; just list them.
9. **Known bugs / TODOs / FIXMEs** — grep the codebase for `TODO`, `FIXME`, `XXX`, `HACK` and list them.
10. **Shared concepts with sibling repo** — your best guess at what overlaps (e.g., "both apps have a `Product` concept", "both apps send order confirmation emails").

### Phase 2 — Stabilize

Goal: the app builds, runs locally, and a fresh developer can set it up.

- Write or fix `README.md` so a new developer can clone and run locally. Required sections:
  - Prerequisites (Node version, database, etc.)
  - Setup steps (install, env vars, database init, seed data if any)
  - How to run dev server
  - How to run tests (if any exist)
  - Common gotchas
- Create `.env.example` with **every** env var from the audit, with a comment explaining each. **Never commit real secrets.**
- Add `.nvmrc` or equivalent pinning the runtime version.
- Verify `.gitignore` excludes `node_modules`, `.env`, build outputs, IDE folders, OS files.
- If the package manager lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `poetry.lock`, etc.) is missing or stale, regenerate it.

### Phase 3 — Clean without restructuring

Small, safe improvements only. **Do not move files between folders.** **Do not rename folders.** The new monorepo will impose its own structure — anything you reorganize here is wasted work.

- Run a formatter (Prettier, Black, etc.) across the whole repo in **one commit** so future diffs are clean.
- Add a basic linter config if none exists. Fix only auto-fixable issues; leave warnings for the monorepo phase.
- Remove obviously dead files **only** after confirming with the human lead. List them in `AUDIT.md` first.
- Add type annotations only where they're trivially obvious. No deep type refactors.

### Phase 4 — Document the domain

Create `docs/DOMAIN.md` capturing the business logic that isn't obvious from code:

- What does this app *do*? (one paragraph, plain English)
- Who are the users of this side of the app? (end users? suppliers? admins?)
- What are the core entities? (e.g., User, Supplier, Product, Order — describe each in one sentence)
- What are the core flows? (e.g., "Supplier uploads a product → admin reviews → product becomes visible to users")
- What business rules exist that aren't enforced in code? (things the founders said in conversation but never wrote down)

If you don't know the answers, ask the human lead. Do not invent them.

### Phase 5 — Tag the migration point

Once Phases 1–4 are done:

- Create a git tag: `pre-monorepo-migration`
- Confirm `main` (or `master`) is in a buildable, committed state
- The monorepo will pull from this tag via `git subtree`

---

## Rules for the AI assistant

- **Ask before deleting anything.** Even files that look dead may be referenced indirectly.
- **Don't introduce new dependencies** unless explicitly asked. This repo is going to be re-evaluated in the monorepo — adding libraries now is wasted churn.
- **Don't move files between directories.** Structure happens in the monorepo.
- **Don't rewrite working code for style reasons.** Formatting via Prettier is the only mass-edit allowed.
- **Flag, don't fix, anything that looks wrong but isn't blocking.** Add it to `AUDIT.md` under a "Concerns" section.
- **When uncertain, stop and ask.** This codebase has tribal knowledge you don't have access to.

---

## What "done" looks like

- `AUDIT.md` exists and is thorough
- `README.md` lets a new dev run the app in under 10 minutes
- `.env.example` is complete
- `docs/DOMAIN.md` exists
- The repo is formatted consistently
- A `pre-monorepo-migration` git tag points to the final clean commit
- The human lead has reviewed the audit and signed off

After sign-off, no more work happens in this repo. All future development moves to the monorepo.
