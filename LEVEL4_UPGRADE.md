# Workproof — Level 4 Upgrade: Context & Prompt for Claude Code

Paste this whole file into Claude Code as your task instructions (or save as `LEVEL4_UPGRADE.md` in the repo root and reference it). It is written so Claude Code knows exactly what to build, how to commit, and — critically — where to STOP and hand control back to you for real-world steps it cannot do itself.

## CONTEXT

This is Workproof, a milestone-based escrow dApp on Stellar (Soroban smart contract) for freelancers and clients. The visual identity is already established: vibrant glassmorphism, glowing gradient accents (violet → cyan → magenta), spring-based Framer Motion micro-interactions, and an immersive 3D background (React Three Fiber). Preserve this design system exactly in everything you build — no generic/default UI.

We are upgrading this project from a working prototype to a production-ready Level 4 submission for the Stellar dApp Challenge. Level 4 requires, among other things:

* A fully functional production MVP (stable frontend + smart contract, mobile responsive, proper loading/error states)
* Smart contract deployed on Stellar testnet
* Monitoring (Sentry) and analytics (PostHog) integration
* In-app user feedback collection (Supabase)
* Minimum 15+ meaningful, incremental git commits
* Clean project structure and documentation
* 10+ real user wallet interactions (I will handle recruiting real users — you do not need to simulate this)

Your job covers everything that is code, configuration, and documentation. Do not fabricate analytics data, screenshots, deployment addresses, or user data at any point. Where a step requires a real-world action (running a deploy transaction, viewing a live dashboard, recording video, testing on a physical phone), stop and clearly hand it back to me with exact instructions.

## GLOBAL RULES FOR THIS TASK

1. Commit incrementally and meaningfully. After each numbered step below (and sub-step where noted), make a real git commit with a descriptive message (e.g. `feat: add Sentry error boundary and wallet hook error capture`). Do not batch multiple unrelated steps into one commit. Aim for the step breakdown below to naturally produce 15-25 commits — do not pad with trivial commits, but do not squash meaningful work together either.
2. Never fake data. Don't hardcode example analytics numbers, mock Sentry events into the UI as if real, or write placeholder user feedback into the Supabase table. Screenshots and demo data must come from real usage.
3. Preserve the design system. Every new UI element (toasts, feedback modal, buttons) must use the existing glass/gradient/motion tokens — check the existing Tailwind config / theme file before adding new styles, and extend it rather than introducing a new visual language.
4. Explicit stop points. Wherever a step says `[STOP — MANUAL STEP]`, complete the code/config up to that point, explain exactly what I need to do manually, and then wait for me to confirm before continuing.
5. Env vars. All secrets/keys (`NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Soroban network config) must be typed, validated at build time, and documented in `.env.example` — never hardcoded.

## STEP 1 — Audit & Stabilize the Core MVP

Before adding telemetry, verify the base product actually works end-to-end.

* Review the existing job/milestone flow: create job → fund milestone → mark delivered → approve/dispute → release.
* Fix any broken states in the flow. Add/verify proper loading states (skeleton glass shimmer, not blank screens) and error states (glass toast, not console-only errors) for every async action (wallet connect, contract call, Supabase read/write).
* Confirm the Soroban contract functions (`create_job`, `fund_milestone`, `mark_delivered`, `approve_milestone`, `dispute_milestone`, `claim_timeout_release`, `get_job`) are implemented and callable from the frontend.
* Commit: `fix: stabilize core milestone lifecycle and loading/error states`

`[STOP — MANUAL STEP]` — Deploy/redeploy the contract to Stellar testnet yourself (fund the deployer account with testnet XLM via friendbot, run the deploy). Paste the resulting contract address back to me so I can wire it into the frontend config.

## STEP 2 — Production Error Monitoring (Sentry)

* Install and configure `@sentry/nextjs` for the App Router (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` as needed).
* Create a centralized error boundary wrapping the core layout.
* Add explicit `Sentry.captureException` calls inside:
   * Wallet connection hooks (rejected signature, wallet not found, network mismatch)
   * Soroban transaction flows (RPC failure, transaction timeout, simulation failure, submission failure)
* On any contract interaction failure: pipe the exact error to Sentry (with context: job ID, milestone index, action attempted) AND show a glassmorphic toast notification to the user with a human-readable message (not the raw error).
* Commit: `feat: integrate Sentry error monitoring across wallet and contract flows`

`[STOP — MANUAL STEP]` — Create a Sentry project yourself, get the DSN, and add it to your `.env.local` / hosting provider env vars. Confirm to me once done so I can note it's live.

## STEP 3 — Product Analytics (PostHog)

* Install `posthog-js`, initialize inside a client-side `PostHogProvider` component wrapping the app.
* Implement automatic pageview tracking.
* Add explicit custom events at the exact trigger points:
   * `wallet_connected` — truncated address, wallet type
   * `job_created` — milestone count, total XLM locked (computed from real milestone amounts, not hardcoded)
   * `milestone_funded`
   * `milestone_delivered`
   * `milestone_approved` / `milestone_disputed`
* Type and validate all PostHog env vars at build time; fail gracefully (log a warning, don't crash) if missing in local dev.
* Commit: `feat: add PostHog analytics with custom event tracking for core actions`

`[STOP — MANUAL STEP]` — Create a PostHog project, get the API key/host, add to env vars. Confirm once done.

## STEP 4 — Glassmorphic In-App Feedback Collection (Supabase)

* Create the `user_feedback` table in Supabase:
   * `id` (uuid, primary key, default `gen_random_uuid()`)
   * `user_address` (text, nullable)
   * `rating` (int, 1–5)
   * `feedback_text` (text)
   * `created_at` (timestamp, default `now()`)
* Build a floating glassmorphic feedback button (sticky, corner-anchored) matching the existing design system.
* On click, open an immersive glass modal with:
   * Animated 1–5 star/node rating selector (glow on select)
   * Frosted-glass textarea for qualitative feedback
   * Submit button with hover shimmer + spring-physics scale-down on click
* Wire submission to Supabase via React Query mutation. On success, show a fade/particle-burst "Feedback Submitted!" state. On failure, show a glass error toast (and capture the error in Sentry).
* Commit: `feat: add glassmorphic in-app feedback modal wired to Supabase`

`[STOP — MANUAL STEP]` — Run the SQL migration for `user_feedback` in your Supabase project yourself (or confirm you want me to generate the migration file for you to run). Confirm table is live.

## STEP 5 — Mobile Responsiveness Pass

* Audit every page (`/`, `/dashboard`, `/dashboard/new`, `/job/[jobId]`, `/profile`) and every new component from Steps 2–4 (toasts, feedback modal) at mobile breakpoints (375px, 390px, 428px widths).
* Fix touch target sizes, spacing, and overflow issues.
* Ensure the R3F 3D background scene is capped/reduced or disabled on low-power/mobile devices, and respects `prefers-reduced-motion`.
* Verify `backdrop-blur` performance is acceptable on mobile Safari/Chrome (reduce blur radius or layer count if janky).
* Commit: `fix: mobile responsive pass across all pages and new components`

`[STOP — MANUAL STEP]` — Test on your actual phone (not just resized browser). Note anything that still feels broken and send it back to me to fix.

## STEP 6 — Documentation Update

* Append a new section to `README.md` (Level 4 Production Telemetry & Feedback Architecture: Sentry, PostHog, Supabase feedback, screenshots).
* Also verify/update the rest of the README has: project overview, architecture diagram or description, setup instructions, `.env.example` reference, contract address (once available), and tech stack list.
* Commit: `docs: add Level 4 telemetry architecture section and update README`

## STEP 7 — Final Checklist Before Submission

`[STOP — MANUAL STEP]` — These require you directly, once the app has been used by real testers:

* [ ] Recruit and confirm 10+ real users have connected wallets and completed at least one action each on testnet
* [ ] Collect real feedback via the in-app feedback flow
* [ ] Take real screenshots: product UI (desktop), mobile responsive views, Sentry dashboard, PostHog dashboard, feedback summary (e.g. query Supabase and screenshot the results)
* [ ] Record a live demo video showing the complete flow: connect wallet → create job → fund → deliver → approve → funds released
* [ ] Confirm final deployed contract address and live app URL are both in the README
* [ ] Verify final commit count is 15+ and each commit message is meaningful
* [ ] Push repo, make it public if not already, and prepare the submission link
