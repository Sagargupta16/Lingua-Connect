# CLAUDE.md

> This file stacks on top of the workspace root at `C:\Code\GitHub\`:
> - Root [`CLAUDE.md`](../../CLAUDE.md) -- voice, rules, routing map, references, skills, slash commands, conventions.
> - Root [`MEMORY.md`](../../MEMORY.md) -- live facts across repos.
> - Root [`STATUS.md`](../../STATUS.md) -- live PR/CI/security dashboard.
> - [`.claude/resources/`](../../.claude/resources/README.md) -- deep reference for collaboration, workflow, git, OSS, debugging, voice.
>
> Read those first. The guidance below only adds **repo-specific context** -- it does not override anything in the root.

## Project

MERN platform connecting language learners with tutors: search/filter tutors, book classes, flashcards, tests, Stripe subscriptions. Built by team BugBiters (TriNIT hackathon); Sagar is project lead.

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
npm run frontend-build
```

## Test

No test suite. Root and server `npm test` are placeholders that exit 1; the client has no test runner.

## Entry points

- `server/index.js` -- Express app: Mongo connect, middleware, route mounts
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
- Checkout: server returns `{ id, url }` from `/student/create-checkout-session` and the client navigates to `url`. Stripe.js no longer has `redirectToCheckout`, so `@stripe/stripe-js` is not a dependency.
- Rate limits: `apiLimiter` (300 / 5 min) is app-wide in `server/index.js`; the default export of `server/utils/limiter.js` (100 / 5 min) stays on auth and write routes.
- Student and tutor `update/:id` and `delete/:id` return 403 unless `:id` is the caller. Tutor `addClass` and `delete-slot` are deliberately NOT owner-checked: the student's booking flow in `TutorModal.jsx` calls them on the tutor's record.
- Server `.env` must set: `PORT`, `DB_CONNECTION_STRING`, `JWT_SECRET`, `JWT_SALT_ROUNDS`, `STRIPE_SECRET_KEY`, `EMAIL_ID`, `EMAIL_PASSWORD`, `CLIENT_URL`.
- API routes have NO `/api` prefix -- mounted at `/auth`, `/student`, etc.
- Root scripts include a typo duplicate `frontent-build`; the correct one is `frontend-build`.
- Root `package.json` overrides `shell-quote` and server `package.json` overrides `ip-address` and `qs` for security advisories -- don't strip them.

## Repo-specific rules

- Server code is CommonJS (`require`); match it, don't convert to ESM piecemeal.
- npm here, not pnpm -- lockfiles and scripts assume npm.

## Routes / Pages

- `/` -- Home (NavBar layout root)
- `/tutor`, `/profile` -- auth-gated (loader `checkAuthAction`)
- `/flashcards`, `/auth` -- public
- `/payment-failed` -- NotFound fallback

## API routes

- `/auth` -- register/login (JWT)
- `/student`, `/tutor` -- profiles, search
- `/class` -- scheduling/booking
- `/flashcard` -- flashcard CRUD
- `/test` -- tutor-created assessments

## Auth

- JWT (jsonwebtoken) + bcrypt; `authenticateUser` middleware in `server/middleware/`
- Token issued by `/auth` routes on login
- Required env vars: `JWT_SECRET`, `JWT_SALT_ROUNDS`
