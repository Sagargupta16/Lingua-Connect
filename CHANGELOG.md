# Changelog

## [1.4.0] - 2026-10-18

- Fixed: Stripe checkout. Stripe.js removed `redirectToCheckout` in its 2025-09-30 release, so the server now returns the Checkout Session `url` and the client redirects to it through the shared Axios instance instead of a hardcoded `http://localhost:5000` fetch; `@stripe/stripe-js` is dropped from the client
- Fixed: `POST /flashcard/create` created the card and then answered 404, because a second `createFlashcard` export overwrote the first; the student-linked variant is now `createFlashcardForStudent` on `/flashcard/create/:id`
- Fixed: `DELETE /test/delete-question/:id/:questionId` now declares the `questionId` it reads; before, it reported success without removing anything
- Fixed: tutor signup without a `languages` array returns 400 instead of crashing with 500
- Fixed: duplicate `email` index warning on the Student and Tutor schemas
- Security: student and tutor update and delete routes return 403 unless the id is the caller's own account
- Security: auth routes reject a non-string `email` (MongoDB operator injection such as `{"$ne": null}`)
- Security: class, flashcard, test, student and tutor create and update handlers copy only their schema fields and drop any non-scalar value, so a body such as `{"$unset": {...}}` or `{"name": {"$gt": ""}}` cannot reach Mongoose (CodeQL js/sql-injection, Sonar S4684 mass assignment)
- Security: app-wide rate limit (300 requests per 5 minutes) ahead of the JWT user lookup, on top of the stricter per-route limit
- Security: OTP codes, request bodies and password hashes are no longer written to logs
- Security: concurrently 10.0.6 and shell-quote 1.12.0 (GHSA-pqg4-j6r4-53mv, critical); nodemon replaced by `node --watch`, removing the vulnerable braces chain (GHSA-vfj7-8cjw-p6xm)
- Changed: Mongoose `new: true` replaced by `returnDocument: "after"` (deprecated in Mongoose 9)
- Changed: client reads optional `VITE_API_URL`; server has `start` (node) and `dev` (node --watch) scripts
- Changed: all dependencies bumped to latest in-range releases
- CI: workflow token limited to `contents: read`, installs run with `--ignore-scripts`, and every server file is syntax-checked instead of only `index.js`
- Docs: README rewritten to match the code (env var names, Node 24, Vite, Stripe Checkout), with architecture and booking-flow diagrams, data model, API table and tech decisions; claims for live broadcasting, notifications and subscriptions removed because the code has none

## [1.3.0] - 2026-09-05

- Removed: video calling. The `/VideoCall` page, the `/room/:roomId` Zego meet room, the nav entries and the `@zegocloud/zego-uikit-prebuilt` client dependency are gone; the Zego app id and server secret that were hardcoded in `Meet.jsx` leave the codebase with them (rotate them in the ZegoCloud console if that account is still used)

## [1.2.2] - 2026-09-03

- Security: force qs 6.15.3 -> 6.16.0 via server overrides (alerts #255, #256)

## [1.2.1] - 2026-09-03

- Security: bump react-router 7.18.1 -> 7.18.3 (client, alert #252)
- Security: force ip-address 10.2.0 -> 10.7.0 via server overrides (alerts #248, #249, #251)
- Security: force shell-quote 1.8.4 -> 1.10.0 via root overrides (alert #247)

## [1.2.0] - 2026-03-14

- Add .env.example for server and client

## [1.1.0] - 2026-03-07

- Fix security vulnerabilities in client and server
- Upgrade Express to v5, Mongoose to v9, Stripe to v20

## [1.0.0] - 2024-03-08

- TRINIT Hackathon: Lingua Connect language learning marketplace
- MERN stack with Redux Toolkit state management
- Video calling via Zego Cloud UIKit
- Stripe payment integration with checkout sessions
- Tutor search, scheduling, flashcards, tests
- JWT + bcrypt authentication with role-based access (Student/Tutor)
- Student and Tutor models with profile pages
- OTP email verification via Nodemailer
