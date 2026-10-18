# CLAUDE.md

> This file stacks on top of the workspace root at `C:\Code\GitHub\`:
> - Root [`CLAUDE.md`](../../CLAUDE.md) -- voice, rules, routing map, references, skills, slash commands, conventions.
> - Root [`MEMORY.md`](../../MEMORY.md) -- live facts across repos.
> - Root [`STATUS.md`](../../STATUS.md) -- live PR/CI/security dashboard.
> - [`.claude/resources/`](../../.claude/resources/README.md) -- deep reference for collaboration, workflow, git, OSS, debugging, voice.
>
> Read those first. The guidance below only adds **repo-specific context** -- it does not override anything in the root.

## Project

MERN platform connecting language learners with tutors: search/filter tutors, book classes (Stripe Checkout + webhook), flashcards, tests. Built by team BugBiters (TriNIT hackathon); Sagar is project lead.

Was live at `https://trinit-bugbiters-dev.onrender.com` -- Render service suspended, currently offline.

## Stack

- **Language**: JavaScript (Node 24 per `.nvmrc`; server is CommonJS)
- **Framework**: React 19 + Vite 8 + Redux Toolkit + React Router 7 + Tailwind 4 (client); Express 5 (server)
- **Database**: MongoDB via Mongoose 9 (no migrations; models in `server/models/`)
- **Package manager**: npm (three package.jsons: root, `client/`, `server/`)
- **Deploy target**: Render (suspended). CI in `.github/workflows/ci.yml` (client build, server `node --check` on every file) plus CodeQL default setup; Renovate enabled.

## Run

```
npm run fb-install    # installs root + client + server deps concurrently
npm run start         # concurrently: server (node --watch, :5000) + client (Vite, :3000)
npm run demo          # same, but the API runs on an in-memory MongoDB with seed data
npm run frontend-build
docker compose up --build   # mongo + api (seeded if empty) + nginx client on :3000
```

Demo logins: `student@demo.lingua.dev` / `tutor@demo.lingua.dev`, password `Demo1234` (from `server/scripts/seed.js`).

## Test

`npm test` (root or `server/`) runs `node --test` over `server/test/*.test.js`: supertest against the real `app.js` on mongodb-memory-server, one in-memory DB per file. The Stripe HTTP client is replaced with `setStripe()`; webhook bodies are signed with `Stripe.webhooks.generateTestHeaderString`. `openapi.test.js` fails when a route is added without a `docs/openapi.yaml` entry, and checks the spec version equals the root `package.json` version. The client has no test runner; `npm run screenshots` (Playwright) recaptures `docs/screenshots/` from a running demo.

## Entry points

- `server/app.js` -- Express app: middleware and route mounts, no listen (tests and demo import it)
- `server/index.js` -- loads dotenv, connects Mongo, listens
- `client/src/index.jsx` -- React root
- `client/src/App.jsx` -- router definition (createBrowserRouter)

## Key files

- `server/routes/*.js` + `server/controllers/` -- API surface
- `server/models/` -- Mongoose schemas (source of truth for data shape)
- `client/src/store/` -- Redux slices
- `client/src/api/` -- Axios service layer

## Gotchas

- Env var names: code reads `DB_CONNECTION_STRING` (not `MONGODB_URI`) and `EMAIL_ID`/`EMAIL_PASSWORD` (not `EMAIL_USER`/`EMAIL_PASS`). Trust `server/index.js` and `server/controllers/`.
- Client reads optional `VITE_API_URL`; without it `client/src/api/axiosInstance.jsx` picks localhost:5000 or the dead Render URL by hostname.
- Checkout: `/student/create-checkout-session` takes `{ tutorId, slotId }` or `{ classId }`, prices from MongoDB and returns `{ id, url }`; the client navigates to `url`. Booking happens only in `POST /stripe/webhook` (`server/controllers/paymentController.js`), mounted before `express.json()` because the signature covers the raw body. Stripe.js no longer has `redirectToCheckout`, so `@stripe/stripe-js` is not a dependency.
- `server/utils/stripe.js` creates the Stripe client lazily: `new Stripe(undefined)` throws, and an eager client used to crash boot before dotenv loaded.
- Rate limits: `apiLimiter` (300 / 5 min) is app-wide in `server/index.js`; the default export of `server/utils/limiter.js` (100 / 5 min) stays on auth and write routes.
- Ownership: student/tutor `update`, `delete`, tutor `add-slot` and `delete-slot` return 403 unless `:id` is the caller. Classes (`tutor`), tests (`tutor`) and flashcards (`owner`) are owner-checked on every write; class and test creation is tutor-only. The old `addClass` routes are gone: the webhook links classes.
- Server `.env` must set: `PORT`, `DB_CONNECTION_STRING`, `JWT_SECRET`, `JWT_SALT_ROUNDS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `EMAIL_ID`, `EMAIL_PASSWORD`, `CLIENT_URL`.
- `server/scripts/seed.js` wipes the six collections; it refuses a non-local `DB_CONNECTION_STRING` (anything but localhost, 127.0.0.1 or the compose `mongo` host) without `--force`.
- API routes have NO `/api` prefix -- mounted at `/auth`, `/student`, etc.
- Root scripts include a typo duplicate `frontent-build`; the correct one is `frontend-build`.
- Root `package.json` overrides `shell-quote` and server `package.json` overrides `ip-address` and `qs` for security advisories -- don't strip them.

## Repo-specific rules

- Server code is CommonJS (`require`); match it, don't convert to ESM piecemeal.
- npm here, not pnpm -- lockfiles and scripts assume npm.

## Routes / Pages

- `/` -- Home (NavBar layout root)
- `/tutor`, `/profile` -- auth-gated (loader `checkAuthAction`)
- `/auth` -- public
- `/payment-failed` -- NotFound fallback
- `/flashcards` is auth-gated too (it decodes the JWT)

## API routes

- `/auth` -- register/login (JWT)
- `/student`, `/tutor` -- profiles, search
- `/class` -- tutor-owned classes
- `/stripe/webhook` -- Stripe events (booking)
- Full contract: `docs/openapi.yaml`
- `/flashcard` -- flashcard CRUD
- `/test` -- tutor-created assessments

## Auth

- JWT (jsonwebtoken) + bcrypt; `authenticateUser` middleware in `server/middleware/`
- Token issued by `/auth` routes on login
- Required env vars: `JWT_SECRET`, `JWT_SALT_ROUNDS`
