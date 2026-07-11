# Ember — Habit Tracker SaaS

A production-structured habit tracker: React + Vite frontend, Firebase (Auth, Firestore, Cloud Messaging, Cloud Functions), and Stripe subscriptions via Vercel serverless functions.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore |
| Push reminders | Firebase Cloud Messaging + a scheduled Cloud Function |
| Payments | Stripe Checkout + Billing Portal |
| Payment backend | Vercel Serverless Functions (`/api`) |
| Hosting | Vercel |

## Where things live

```
src/               React app (components, hooks, pages, contexts)
api/                Vercel serverless functions — Stripe checkout, portal, webhook
functions/          Firebase Cloud Functions — scheduled reminders, cleanup triggers
firestore.rules     Security rules — the actual enforcement of Free vs Premium access
docs/               Setup and deployment guides — read these in order
```

## Setup order

1. **`docs/FIREBASE_SETUP.md`** — create the Firebase project, enable Auth/Firestore/FCM, deploy security rules
2. **`docs/DEPLOYMENT.md`** — first Vercel deploy
3. **`docs/STRIPE_SETUP.md`** — Stripe account, products, webhook (needs your live Vercel URL from step 2)
4. Back to `DEPLOYMENT.md` step 6 — deploy Firebase Functions for reminders

## Local development

```bash
npm install
cp .env.example .env
# fill in .env per the two setup docs
npm install -g vercel
vercel dev
```

`vercel dev` (not `vite dev`) is required locally so `/api/*` routes work alongside the frontend.

## How plan gating actually works (read this before changing anything)

The client **never** sets its own `plan` field. Here's the trust chain:

1. User clicks Subscribe → frontend calls `POST /api/create-checkout-session` → Stripe Checkout opens.
2. User pays → Stripe calls `POST /api/stripe-webhook` (signature-verified) → this is the **only** code path that writes `plan: "premium"` to Firestore, using the Firebase Admin SDK.
3. `firestore.rules` explicitly blocks any client `update` that touches `plan`, `stripeCustomerId`, `stripeSubscriptionId`, or `subscriptionStatus` — so even a modified/malicious client can't self-upgrade.
4. The frontend reads plan status via `useSubscription()`, which just listens to the Firestore doc in real time.

If you ever add a new premium-gated feature, gate it off `useSubscription().isPremium` — don't invent a second source of truth.

## Known simplifications worth knowing about

- **Reminder timezones**: `functions/src/index.js` currently compares reminder times in UTC. For real per-user timezone accuracy, store an IANA timezone string on the user doc at signup and convert before comparing — noted inline in that file.
- **Reminder scheduling at scale**: the scheduled function scans all users every 15 minutes. Fine for early-stage usage; revisit (e.g. Cloud Tasks per user) if you get into the thousands of users.
- **This code has not been run against live Firebase/Stripe infrastructure** — it was written and reviewed for correctness (imports, exports, security-rule logic, Stripe/Firestore API usage) but I don't have the ability to actually execute `npm install`, deploy, or hit real APIs from this environment. Budget time for a first real end-to-end test pass using the checklist in `DEPLOYMENT.md`.
