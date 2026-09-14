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
| `/founding` | Founding / featured upgrade ($199–299/mo Stripe stub) |
| `/about` | What the product is (and is not) |
| `/admin` | Password-gated CRUD (`ADMIN_PASSWORD`) |
| `/admin/import` | Signed-in CSV upsert (same logic as `npm run import:listings`) |

FTF `/destinations` is `/cities`. There is no `/last-minute`, `/guides`, `/lodges`, `/c/waterproofing`, or Beehiiv.

Wave 1 hub slugs (publish order): `houston` → `dallas-fort-worth` → `atlanta` → `tampa` → `chicago` → `charlotte` → `austin` → `st-louis`. Tampa is `tampa`, not `tampa-bay`.

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

Seed data uses **@example.com** addresses only and includes 17 published contractors plus 1 draft across the eight Wave 1 hubs.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | **Required.** Postgres connection string |
| `ADMIN_PASSWORD` | **Required** in production. Shared password for `/admin` |
| `NEXT_PUBLIC_SITE_URL` | Optional. Canonical site URL for metadata, sitemap, and JSON-LD |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Optional. Founding Payment Link. Preview builds work when empty. |
| `STRIPE_PAYMENT_LINK` | Optional. Server-side alias for the same Payment Link |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional. Placeholder for a future Checkout session |
| `STRIPE_SECRET_KEY` | Optional. Placeholder; not required to build |
| `STRIPE_FOUNDING_PRICE_ID` | Optional. Placeholder for a future Checkout price |

No Stripe npm package. No Beehiiv (or other newsletter) variables. Empty Stripe vars keep `/founding` on a notify stub.

## Deploy on Vercel

Set these project environment variables (Production, and Preview if you want those deploys to hit a database):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres URL from Vercel Postgres, Neon, Supabase, or any host. Use a pooled URL for the app if the provider offers one. |
| `ADMIN_PASSWORD` | Yes | Shared `/admin` password |
| `NEXT_PUBLIC_SITE_URL` | No | e.g. `https://belowgradepros.com`. If unset, the app falls back to `VERCEL_URL` or `https://belowgradepros.com` |
| Stripe Payment Link / keys | No | Founding CTA stays stubbed until a link is set |

Build already runs `prisma generate && next build`. Database pages are `force-dynamic`, so Next does not prerender them at build time. `DATABASE_URL` must still be present so Prisma can generate the client; a missing or invalid database fails at **runtime**, not during compile.

This repo does **not** create the Vercel project or DNS. Document env only.

Do **not** run migrations during the Vercel build. After the first deploy (and after later schema changes), apply migrations against production:

```bash
# From a machine that can reach the production database
npx prisma migrate deploy
# or: npm run db:deploy
```

If `migrate deploy` fails on a pooled host (PgBouncer / Neon pooler), rerun it with the provider’s **direct / unpooled** connection string as `DATABASE_URL` for that command only.

Then optionally load **sample** data (dev / empty staging only — this **wipes** listing tables):

```bash
npm run seed
```

To load a curated hero CSV **without** wiping (production or staging), upload it at **`/admin/import`** while signed in with `ADMIN_PASSWORD`. Status values `candidate` and `ready` publish.

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
npm run db:deploy         # prisma migrate deploy (production)
npm run seed              # reset sample cities and listings (destructive)
npm run import:listings   # upsert listings from a CSV (see docs/import-listings.md)
npm run lint
```

## Product boundaries

- Stripe founding path is a **stub** ($199–299/mo Payment Link placeholder). Live Checkout is out of scope until keys exist.
- No contractor auth beyond the claim inbox
- No Beehiiv / newsletter product
- No booking engine
- Waterproofing / pier-and-beam / slab are **badges**, not category URLs

Operators inquire directly. BelowGradePros publishes the desk.

## Clone notes

Scaffolded from FishTheFlats (`ctdietrich/fishtheflats`). See [ARCHITECTURE.md](./ARCHITECTURE.md) for the URL map and schema deltas.
