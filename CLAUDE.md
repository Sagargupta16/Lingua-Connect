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

- **Language**: JavaScript (Node 19 per `.nvmrc`; server is CommonJS)
- **Framework**: React 19 + CRA (react-scripts 5) + Redux Toolkit + React Router 7 + Tailwind 4 (client); Express 5 (server)
- **Database**: MongoDB via Mongoose 9 (no migrations; models in `server/models/`)
- **Package manager**: npm (three package.jsons: root, `client/`, `server/`)
- **Deploy target**: Render (suspended). No CI workflows; Renovate enabled.

## Run

```
npm run fb-install    # installs root + client + server deps concurrently
npm run start         # concurrently: server (nodemon, :5000) + client (CRA, :3000)
npm run frontend-build
```

## Test

No test suite. Root and server `npm test` are placeholders that exit 1; client has the default CRA runner but no custom tests.

## Entry points

- `server/index.js` -- Express app: Mongo connect, middleware, route mounts
- `client/src/index.js` -- React root
- `client/src/App.jsx` -- router definition (createBrowserRouter)

## Key files

- `server/routes/*.js` + `server/controllers/` -- API surface
- `server/models/` -- Mongoose schemas (source of truth for data shape)
- `client/src/store/` -- Redux slices
- `client/src/api/` -- Axios service layer

## Gotchas

- README env var names are WRONG: code reads `DB_CONNECTION_STRING` (not `MONGODB_URI`) and `EMAIL_ID`/`EMAIL_PASSWORD` (not `EMAIL_USER`/`EMAIL_PASS`). Trust `server/index.js` and `server/controllers/`.
- Server `.env` must set: `PORT`, `DB_CONNECTION_STRING`, `JWT_SECRET`, `JWT_SALT_ROUNDS`, `STRIPE_SECRET_KEY`, `EMAIL_ID`, `EMAIL_PASSWORD`, `CLIENT_URL`.
- API routes have NO `/api` prefix -- mounted at `/auth`, `/student`, etc.
- Root scripts include a typo duplicate `frontent-build`; the correct one is `frontend-build`.
- Client `package.json` carries heavy `overrides` to patch CRA's stale transitive deps -- don't strip them.

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
