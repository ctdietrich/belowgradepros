# BelowGradePros

**[belowgradepros.com](https://belowgradepros.com)** is a **foundation repair + crawl-space/basement encapsulation directory**.

- **Supply:** licensed contractors (primary desk: foundation, encapsulation, or both)
- **Demand:** homeowners, property managers, and desks who need a specialty operator
- **Geography:** US national, Wave 1 metros first

This repository is the directory application, cloned from the [FishTheFlats](https://github.com/ctdietrich/fishtheflats) Next.js + Prisma kit. It is **not** a booking engine, contractor SaaS, or newsletter product.

Brand lock: typographic wordmark **BelowGrade** (slate) + **Pros** (amber, heavier). Tagline: **Solid ground starts below grade.** Palette is slate / deep slate / concrete / amber on page cream.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (`DATABASE_URL`)

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Featured listings, Wave 1 city hubs, demand/supply desk |
| `/cities` | Metro hubs |
| `/cities/[slug]` | Contractors in one metro (`?service=foundation-repair\|encapsulation`) |
| `/contractors` | All contractors + filters |
| `/services` | Primary-desk index (foundation, encapsulation) |
| `/services/foundation` · `/services/encapsulation` | Browse by primary flag (includes `both`) |
| `/l/[slug]` | Listing detail + JSON-LD |
| `/submit` | Contractor submission |
| `/claim` | Claim a sourced profile |
| `/founding` | Founding offer: free until the first lead, then $49/mo locked |
| `/about` | What the product is (and is not) |
| `/admin` | Password-gated CRUD (`ADMIN_PASSWORD`) |
| `/admin/import` | Signed-in CSV upsert (same logic as `npm run import:listings`) |

FTF `/destinations` is `/cities`. There is no `/last-minute`, `/guides`, `/lodges`, `/c/waterproofing`, or Beehiiv.

Homepage strip (8 cards, `HOMEPAGE_STRIP` in `src/lib/hubs.ts`): `tampa` → `houston` → `atlanta` → `charlotte` → `jacksonville` → `orlando` → `nashville` → `dallas-fort-worth`. Additional Wave 1 hubs stay on `/cities` (Chicago, Austin, St. Louis, Memphis, Birmingham, Oklahoma City, Greenville SC, Raleigh, Tulsa, Charleston SC, plus Florida encapsulation desks: Tallahassee, Pensacola, Fort Myers, Sarasota, West Palm Beach, Fort Lauderdale, Daytona Beach). Tampa is `tampa`, not `tampa-bay`. Charleston is `charleston-sc`, not `charleston`. Fort Lauderdale is not Miami. Do not auto-add Miami.

## Local setup

Postgres must be running and reachable at `DATABASE_URL` (local Postgres, Neon, Vercel Postgres, or similar).

```bash
cp .env.example .env
# Create the database, then point DATABASE_URL at it
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)  
Default local password is `change-me` (set `ADMIN_PASSWORD` in `.env`).

Seed data uses **@example.com** addresses only and includes 20 published contractors plus 1 draft across Wave 1 hubs (homepage strip plus Chicago, Austin, St. Louis, and later catalog adds).

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | **Required.** Postgres connection string. On Prisma Postgres, use the pooled host `pooled.db.prisma.io` for the app. |
| `DIRECT_URL` | Direct `db.prisma.io` URL for `prisma migrate deploy`. If unset, `npm run db:deploy` and `npm run build` fall back to `DATABASE_URL`. Set this whenever `DATABASE_URL` is the pooled host. |
| `ADMIN_PASSWORD` | **Required** in production. Shared password for `/admin` |
| `NEXT_PUBLIC_SITE_URL` | **Required for production SEO.** Canonical origin for metadataBase, canonical/OG URLs, `robots.txt` Sitemap, and sitemap `<loc>`s. Set to `https://belowgradepros.com` on Vercel Production. |
| `STRIPE_PAYMENT_LINK` | Optional. Kept for later billing. Not used by `/founding` or `/claim`. |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Optional. Build-time fallback for the same link. Not shown in the founding or claim flow. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional. Placeholder for a future Checkout session |
| `STRIPE_SECRET_KEY` | Optional. Placeholder; not required to build |
| `STRIPE_FOUNDING_PRICE_ID` | Optional. Placeholder for a future Checkout price |
| `RESEND_API_KEY` | Optional. When set, claim / submit / founding leads email via the Resend API. |
| `LEAD_ALERT_FROM` | Optional. Resend from-address. Default `BelowGradePros <hello@belowgradepros.com>`. |
| `LEAD_ALERT_TO` | Optional. Lead inbox. Default `hello@belowgradepros.com`. |
| `SMTP_USER` | Optional. With `SMTP_PASS`, used when `RESEND_API_KEY` is unset. From-address is this user. |
| `SMTP_PASS` | Optional. SMTP password. Both user and password are required. |
| `SMTP_HOST` | Optional. Default `smtp.gmail.com`. |
| `SMTP_PORT` | Optional. Default `465` (implicit TLS). |

No Stripe npm package. No Beehiiv (or other newsletter) variables. `/founding` and `/claim` do not send visitors to Stripe. Stripe env vars stay for later billing. With no Resend key and no SMTP user/password, claim, submit, and quote rows are still saved and the email send is skipped.

## Deploy on Vercel

Set these project environment variables (Production, and Preview if you want those deploys to hit a database):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres URL. **Prisma Postgres:** `postgres://USER:PASSWORD@pooled.db.prisma.io:5432/postgres?sslmode=require`. The runtime client on Vercel also rewrites a direct `db.prisma.io` host to `pooled.db.prisma.io` and appends `connection_limit=1&pool_timeout=20` when those params are absent. That change is not written back to the env var. |
| `DIRECT_URL` | Yes, if `DATABASE_URL` is pooled | Direct TCP for migrations: `postgres://USER:PASSWORD@db.prisma.io:5432/postgres?sslmode=require` (same user and password). `directUrl` in `prisma/schema.prisma`. If this is unset, `npm run db:deploy` falls back to `DATABASE_URL` — only safe while that value is still the direct host. |
| `ADMIN_PASSWORD` | Yes | Shared `/admin` password |
| `NEXT_PUBLIC_SITE_URL` | **Yes (Production SEO)** | `https://belowgradepros.com`. Set this on the Vercel **Production** environment (and Preview if you want previews to share the same canonical). Do **not** point it at a `*.vercel.app` deployment URL. If unset on Production, the app still uses `https://belowgradepros.com` and **never** `VERCEL_URL`. Preview deploys may fall back to `VERCEL_URL` only when this var is unset. |
| `STRIPE_PAYMENT_LINK` | No | Kept for later billing. Not shown on `/founding` or `/claim`. |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | No | Build-time fallback for the same link. Inlined, so a redeploy is required, and it is ignored when `STRIPE_PAYMENT_LINK` is set. |
| `RESEND_API_KEY` | No | Lead alert email. Without this and without SMTP, alerts are skipped. |
| `LEAD_ALERT_TO` | No | Defaults to `hello@belowgradepros.com`. |
| `LEAD_ALERT_FROM` | No | Resend from-address. Default `BelowGradePros <hello@belowgradepros.com>`. |
| `SMTP_USER` + `SMTP_PASS` | No | Gmail (or `SMTP_HOST` / `SMTP_PORT`) when Resend is unset. |

Build already runs `prisma generate && next build`. Database pages are `force-dynamic`, so Next does not prerender them at build time. `DATABASE_URL` must still be present so Prisma can generate the client; a missing or invalid database fails at **runtime**, not during compile.

This repo does **not** create the Vercel project or DNS. Document env only.

After production deploy, confirm SEO URLs are the custom domain (not a Vercel deployment host):

```bash
curl -sS https://belowgradepros.com/robots.txt
# Sitemap: https://belowgradepros.com/sitemap.xml

curl -sS https://belowgradepros.com/sitemap.xml | head
# every <loc> should start with https://belowgradepros.com/
# city hubs should be /cities/{slug} only — no ?service= query strings
```

Do **not** run migrations during the Vercel build. After the first deploy (and after later schema changes), apply migrations against production:

```bash
# From a machine that can reach the production database.
# Uses DIRECT_URL when set; otherwise DATABASE_URL. Do not call the Prisma
# CLI directly unless DIRECT_URL is already in the environment.
npm run db:deploy
```

`npm run db:deploy` uses `DIRECT_URL` (schema `directUrl`) so migrate does not go through the Prisma Postgres pooler. If `DIRECT_URL` is unset, that script falls back to `DATABASE_URL`. Do not point `DIRECT_URL` at `pooled.db.prisma.io`.

On Vercel the app client does not use the migrate URL. When `VERCEL` is set it opens `pooled.db.prisma.io` (rewritten from a direct `db.prisma.io` host) with `connection_limit=1&pool_timeout=20`, and one `PrismaClient` is reused for the life of the isolate.

Then optionally load **sample** data (dev / empty staging only — this **wipes** listing tables):

```bash
npm run seed
```

To load a curated hero CSV **without** wiping (production or staging), upload it at **`/admin/import`** while signed in with `ADMIN_PASSWORD`. Only `publish` / `published` / `live` / `approved` / `active` / `hero` go live. `candidate`, `qa_pass`, `ready`, and `qa_fail` stay **draft**.

```bash
npm run import:listings -- --dry-run data/hero-seed.sample.csv
DATABASE_URL="postgresql://…" npm run import:listings -- /path/to/hero.csv
```

See [docs/import-listings.md](./docs/import-listings.md).

## Scripts

```bash
npm run dev         # Next.js dev server
npm run build       # prisma generate + production build
npm run start       # serve the production build
npm run db:deploy         # prisma migrate deploy via DIRECT_URL (production)
npm run seed              # reset sample cities and listings (destructive)
npm run import:listings   # upsert listings from a CSV (see docs/import-listings.md)
npm run lint
npm run test:seo          # canonical URL + sitemap hub path checks
```

## Product boundaries

- Founding contractors are free until their first homeowner lead, then $49/mo locked. Exclusive leads, no per-lead fees, 3 founding spots per city. Stripe checkout is not in this flow.
- No contractor auth beyond the claim inbox
- No Beehiiv / newsletter product
- No booking engine
- Waterproofing / pier-and-beam / slab are **badges**, not category URLs

Operators inquire directly. BelowGradePros publishes the desk.

## Clone notes

Scaffolded from FishTheFlats (`ctdietrich/fishtheflats`). See [ARCHITECTURE.md](./ARCHITECTURE.md) for the URL map and schema deltas.
