# AUDIT.md — evo-supplier

> Phase 1 inventory. Read-only — no code was changed to produce this file.

---

## 1. Stack

| Item | Detail |
|---|---|
| Language | JavaScript (ES Modules, no TypeScript) |
| UI Framework | React 18.3 |
| Build Tool | Vite 5.2 |
| CSS | Tailwind CSS 3.4 |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Backend / DB | Firebase (Firestore, Auth, Cloud Functions) |
| Server Functions | Firebase Cloud Functions v2 (Node.js 20, CommonJS) |
| Package Manager | npm |
| Runtime (local) | Node 24.14.0 (no `.nvmrc` — not pinned) |
| Hosting | Vercel (project: `evo-suppliers`) |

---

## 2. Entry Points

| Layer | File |
|---|---|
| Client app | `src/main.jsx` → `src/App.jsx` |
| Firebase Functions | `functions/index.js` |

The client is a single-page app with no URL router. Navigation is state-driven via `SupplierContext.screen`.

---

## 3. Screen Routes (client-side)

All navigation is handled by `screenMap` in `src/App.jsx`. There are no URL-based routes.

| Screen key | File | Purpose |
|---|---|---|
| `entry` | `screens/Entry.jsx` | Login / sign-up (Google auth) |
| `onboarding` | `screens/Onboarding.jsx` | New supplier registration flow |
| `home` | `screens/Home.jsx` | Supplier dashboard home |
| `leads` | `screens/Leads.jsx` | Incoming lead list |
| `leadDetail` | `screens/LeadDetail.jsx` | Single lead view + accept/decline |
| `events` | `screens/Events.jsx` | Confirmed events list |
| `eventDetail` | `screens/EventDetail.jsx` | Single event detail + timeline |
| `catalog` | `screens/Catalog.jsx` | Package/product catalog view |
| `packageForm` | `screens/PackageForm.jsx` | Create/edit a package |
| `productsForm` | `screens/ProductsForm.jsx` | Create/edit a product |
| `profile` | `screens/Profile.jsx` | Supplier profile editor |
| `calendar` | `screens/CalendarScreen.jsx` | Calendar view of events |
| `payments` | `screens/Payments.jsx` | Payment tracking (UI only — no payment processor) |
| `insights` | `screens/Insights.jsx` | Revenue and performance stats |
| `dbAgent` | `screens/DbAgent.jsx` | Internal admin tool: recalculates price aggregates on all vendors |
| `admin` | `screens/AdminDashboard.jsx` | Admin-only dashboard (all vendors, clients, leads, events) |

## 4. Firebase Cloud Functions (server-side)

| Function | Trigger | Purpose |
|---|---|---|
| `onVendorCreated` | `vendors/{uid}` document created | Sets Firebase Auth custom claim `role: 'vendor'` |
| `onClientCreated` | `users/{uid}` document created | Sets Firebase Auth custom claim `role: 'client'` |

`functions/migrate-roles.js` — a one-off migration script, not a deployed function.

---

## 5. Database Collections Touched

| Collection | Read | Write | Notes |
|---|---|---|---|
| `vendors` | Yes | Yes | One doc per supplier, keyed by Firebase Auth UID |
| `vendors/{uid}/packages` | Yes | Yes | Package offerings for a supplier |
| `vendors/{uid}/products` | Yes | Yes | Individual product/add-on items |
| `vendors/{uid}/pricing_rules` | Yes | Yes | Pricing modifiers (discount rules etc.) |
| `vendors/{uid}/reviews` | No | No | Collection exists in rules; no write UI in this app yet |
| `leads` | Yes | Yes (status update only) | Created by client app; supplier can accept/decline |
| `leads/{id}/messages` | Yes | Yes | In-app messaging thread per lead |
| `events` | Yes | No | Read by supplier; written by client app |
| `users` | Yes (admin only) | No | Client user profiles; read for admin dashboard and lead photo backfill |

---

## 6. External Services

| Service | SDK / Method | Purpose |
|---|---|---|
| Firebase Auth | `firebase/auth` | Google sign-in, session management |
| Firebase Firestore | `firebase/firestore` | Primary database |
| Firebase Cloud Functions | `firebase-functions/v2` | Role assignment on signup |
| Firebase Admin SDK | `firebase-admin` | Used inside Cloud Functions only |
| Vercel | `vercel` CLI | Hosting and deployment |

No payment processor, email service, SMS, or storage service is integrated.

---

## 7. Environment Variables

All variables are prefixed `VITE_` (exposed to the browser via Vite).

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firestore project ID (`evo-supplier`) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket (referenced in config; Storage not actively used) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID (FCM not actively used) |
| `VITE_FIREBASE_APP_ID` | Firebase app identifier |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID for sign-in |

**Concern:** `.env` is not listed in `.gitignore` — only `*.local` is. A `.env` file containing real keys could be committed accidentally. See Concerns section.

---

## 8. Authentication Flow

1. User lands on `Entry` screen.
2. Clicks "Sign in with Google" → Firebase `signInWithPopup` (Google provider).
3. `onAuthStateChanged` listener in `SupplierContext` fires.
4. If the user's UID exists in `vendors` collection → navigate to `home`.
5. If `is_admin: true` in `users` or `vendors` collection → navigate to `admin`.
6. If no vendor doc exists → navigate to `onboarding` to complete registration.
7. Session is managed entirely by Firebase Auth SDK (persisted in browser IndexedDB).
8. No server-side session or JWT validation in the client — Firestore rules enforce access control.

---

## 9. Dead Code Candidates

> Do not delete without confirming with the human lead.

| File / Feature | Reason flagged |
|---|---|
| `src/data/index.js` | Contains fully hardcoded mock data (suppliers, leads, events, payments, insights). Not imported in any production screen — appears to be early prototype data. |
| `src/context/LanguageContext.jsx` | Language context exists but no UI for switching language is visible. Hebrew is hardcoded throughout. |
| `functions/migrate-roles.js` | One-off migration script. If migration is complete, this file has no future purpose. |
| `src/screens/DbAgent.jsx` + `src/lib/dbAgent.js` | Internal maintenance tool. Useful but not a user-facing feature — may not belong in the main app bundle. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Referenced in Firebase config but Firebase Storage is not used anywhere in the codebase. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Referenced in Firebase config but push notifications use the browser Notification API directly, not FCM. |
| `VITE_GOOGLE_CLIENT_ID` | Set in `.env` but not referenced in any source file found — may be unused. |

---

## 10. Known Bugs / TODOs / FIXMEs

No `TODO`, `FIXME`, `XXX`, or `HACK` comments found in the codebase.

---

## 11. Shared Concepts with Sibling Repo (evo-client)

| Concept | Notes |
|---|---|
| `vendors` Firestore collection | Both apps read it; supplier app writes it |
| `leads` Firestore collection | Client app creates; supplier app reads and updates status |
| `leads/{id}/messages` sub-collection | Both apps can write messages |
| `events` Firestore collection | Client app creates; supplier app reads |
| `users` Firestore collection | Client app writes; supplier app reads (for photo backfill and admin) |
| `EvoLogo` component | Duplicated in both repos |
| `PageTransition` component | Duplicated in both repos |
| `SplashScreen` component | Duplicated in both repos |
| `LanguageContext` | Duplicated in both repos |
| `src/data/index.js` | Duplicated mock data file exists in both repos |
| Auth pattern | Both use `onAuthStateChanged` + Firebase Google sign-in |
| Lead normalization logic | `normalizeLead` in supplier vs `createLead` shape in client — same data model, separate implementations |

---

## Concerns

1. **`.env` not in `.gitignore`** — `.gitignore` only excludes `*.local`. A plain `.env` with real Firebase keys can be committed. Should add `.env` explicitly.
2. **No `.nvmrc`** — Node version is not pinned. Local dev is Node 24 but Firebase Functions targets Node 20.
3. **Admin check consistency** — `is_admin` is checked in two places (`SupplierContext` and `AdminDashboard`) with slightly different logic. Risk of divergence.
4. **`firebase-tools` in `dependencies`** — `firebase-tools` (a large CLI package) is in `dependencies` instead of `devDependencies`. This inflates the production bundle.
5. **`matchScore` hardcoded to 92** — In `leadsService.js` on the client, every lead is created with `matchScore: 92`. No real matching logic exists yet.
6. **No tests** — Zero test files found in either the client or functions directory.
7. **Payments screen is display-only** — The `Payments` screen shows financial data from Firestore but there is no payment processor. Money handling appears to be manual and outside the app.
