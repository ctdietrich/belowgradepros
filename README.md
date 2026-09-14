# BelowGradePros

**[belowgradepros.com](https://belowgradepros.com)** is a US national specialty **directory** for:

- Foundation repair
- Crawl-space and basement encapsulation (vapor barriers, dehumidifier packages)
- Adjacent waterproofing, plus pier-and-beam and slab service flags

Homeowners find a below-grade specialist. Contractors get found by people who already know the job is under the house.

This is **not** a booking marketplace, lead auction, or payment product. v1 is inquiry-first. Founding contractor listings are stubbed at **$199–299/mo** with no checkout in this release.

Interim brand: typographic **BelowGradePros**, deep slate + amber, grounded homeowner-trustworthy tone.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (`DATABASE_URL`)

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Home — homeowners + contractors, search, featured, city hubs |
| `/search` | Browse listings + filters (service, metro, state) |
| `/metros` | City hub index |
| `/metros/[slug]` | Houston, Dallas–Fort Worth, Atlanta, Tampa Bay, Chicago |
| `/l/[slug]` | Listing detail + JSON-LD |
| `/submit` | Contractor submission (inquiry, no payment) |
| `/claim` | Claim a sourced profile |
| `/for-contractors` | Founding pricing CTA ($199–299/mo stub) |
| `/about` | What the product is (and is not) |
| `/admin` | Password-gated desk (`ADMIN_PASSWORD`) |
| `/admin/import` | Signed-in CSV upsert (same logic as `npm run import:listings`) |

## Local setup

Postgres must be running and reachable at `DATABASE_URL` (local Postgres, Neon, Vercel Postgres, or similar).

```bash
cp .env.example .env
# Create the database, then point DATABASE_URL at it
# Optional: docker compose up -d
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)  
Default local password is `change-me` (set `ADMIN_PASSWORD` in `.env`).

Seed data uses **@example.com** addresses only and includes 22 sample listings (21 published, 1 draft) across Houston, Dallas–Fort Worth, Atlanta, Tampa Bay, and Chicago. Names are labeled **(Sample)**.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | **Required.** Postgres connection string |
| `ADMIN_PASSWORD` | **Required** in production. Shared password for `/admin` |
| `NEXT_PUBLIC_SITE_URL` | Optional. Canonical site URL for metadata, sitemap, and JSON-LD |

## Deploy on Vercel

Set these project environment variables (Production, and Preview if you want those deploys to hit a database):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres URL from Vercel Postgres, Neon, Supabase, or any host. Use a pooled URL for the app if the provider offers one. |
| `ADMIN_PASSWORD` | Yes | Shared `/admin` password |
| `NEXT_PUBLIC_SITE_URL` | No | e.g. `https://belowgradepros.com`. If unset, the app falls back to `VERCEL_URL` or `https://belowgradepros.com` |

Build already runs `prisma generate && next build`. Database pages are `force-dynamic`, so Next does not prerender them at build time. `DATABASE_URL` must still be present so Prisma can generate the client; a missing or invalid database fails at **runtime**, not during compile.

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

To load a curated CSV **without** wiping (production or staging), upload it at **`/admin/import`** while signed in with `ADMIN_PASSWORD`. That path uses the production `DATABASE_URL` already on Vercel. [`data/listings.sample.csv`](./data/listings.sample.csv) shows the expected columns. Status values `candidate` and `ready` publish.

The CLI still works on a machine that already has the database URL:

```bash
npm run import:listings -- --self-test
npm run import:listings -- --dry-run data/listings.sample.csv
DATABASE_URL="postgresql://…" npm run import:listings -- /path/to/listings.csv
```

See [docs/import-listings.md](./docs/import-listings.md).

## Scripts

```bash
npm run dev               # Next.js dev server
npm run build             # prisma generate + production build
npm run start             # serve the production build
npm run db:deploy         # prisma migrate deploy (production)
npm run seed              # reset sample metros + listings (destructive)
npm run import:listings   # upsert listings from a CSV
npm run lint
```

## Product boundaries

- No Stripe / payment integration in v1
- No booking engine
- No lead auction
- Directory + inquiry inbox only

Operators inquire to list or claim. Homeowners call the contractor.
