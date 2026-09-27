# Architecture — niche directory kit

BelowGradePros is a **vertical directory** cloned from [FishTheFlats](https://github.com/ctdietrich/fishtheflats): one listing type, a city-hub taxonomy, inbound claim/submit, and an admin-lite desk. There is no newsletter product and no last-minute inventory.

## Mental model

```
Demand  →  browse city hubs / primary services  →  inquire on the listing
Supply  →  submit or claim  →  editorial review in /admin  →  published listing
Paid    →  founding: free until the first lead, then $49/mo locked (3 spots per city)
Ops     →  password-gated CRUD + CSV import
```

There is no availability engine. Founding is free until the first homeowner lead, then $49/mo locked. Stripe helpers stay in the repo for later billing and are not shown on `/founding` or `/claim`. The product is the catalog and the desk.

## Stack map

| Layer | Choice | Why it clones cleanly |
| --- | --- | --- |
| App | Next.js App Router | File-based pages; metadata + sitemap live next to routes |
| UI | Tailwind + a small component set | Brand tokens live in `globals.css` |
| Data | Prisma | PostgreSQL via `DATABASE_URL` (local or hosted) |
| Auth | Shared `ADMIN_PASSWORD` cookie | Enough for a one-desk editorial tool |
| Payments | Env-gated Payment Link stub | No Stripe SDK; build/preview do not need keys |

## Domain objects

Defined in `prisma/schema.prisma`:

- **City** — metro hub taxonomy (`slug`, `name`, `state`, `region`, `heroImage`, `sortOrder`). FTF called this Destination (`country` instead of `state`).
- **Listing** — `contractor` (thin `listingTypes` config; one type in v1)
  - `primaryService` — `foundation` \| `encapsulation` \| `both`
  - `services[]` JSON — **additional badges only**: `waterproofing`, `pier_beam`, `slab`
  - `photos[]` (JSON)
  - `homeCity` / `homeState` / `licenseId` — ops fields, not in FTF
  - `featured`, `founding`, `verified`, `status` (`draft` \| `published`)
  - CSV `publish` / `published` / `live` / `approved` / `active` / `hero` → `published`. `candidate`, `qa_pass`, `ready`, `qa_fail`, `reject` stay `draft` (`src/lib/listing-status.ts`)
  - `sourceUrl`, `claimable`, `contactEmail` / `website`
- **ListingCity** — many-to-many (FTF `ListingDestination`)
- **Submission** / **ClaimRequest** — inbound supply (`cities` + badges + `primaryService` + `founding`)

Dropped vs FTF: `NewsletterSignup`, `LastMinuteOpening`, Beehiiv env, `/last-minute`, `/guides`, `/lodges`.

## URL map

Locked taxonomy for v1. Hub copy/titles live in `src/lib/hubs.ts` (`directories/belowgradepros/seo/hub-outlines.md` was not in this workspace).

| Path | Purpose |
| --- | --- |
| `/` | Home |
| `/cities/tampa` | Wave 1 hub (not `tampa-bay`); homepage strip #1, moisture |
| `/cities/houston` | Wave 1 hub; homepage strip #2, moisture |
| `/cities/atlanta` | Wave 1 hub; homepage strip #3, moisture |
| `/cities/charlotte` | Wave 1 hub; homepage strip #4, moisture |
| `/cities/jacksonville` | Wave 1 hub; homepage strip #5, moisture |
| `/cities/orlando` | Wave 1 hub; homepage strip #6, moisture |
| `/cities/nashville` | Wave 1 hub; homepage strip #7, moisture |
| `/cities/dallas-fort-worth` | Wave 1 hub; homepage strip #8, foundation-first (pier & beam / clay) |
| `/cities/chicago` | Wave 1 hub (kept; not in primary homepage strip) |
| `/cities/austin` | Wave 1 hub (kept; not in primary homepage strip) |
| `/cities/st-louis` | Wave 1 hub (kept; not in primary homepage strip) |
| `/cities/memphis` | Wave 1 hub (kept; not in primary homepage strip); both |
| `/cities/birmingham` | Wave 1 hub (kept; not in primary homepage strip); encapsulation-lean |
| `/cities/oklahoma-city` | Wave 1 hub (kept; not in primary homepage strip); foundation-lean |
| `/cities/greenville-sc` | Wave 1 hub (kept; not in primary homepage strip); encapsulation-lean; display name `Greenville, SC` |
| `/cities/raleigh` | Wave 1 hub (kept; not in primary homepage strip); both |
| `/cities/tulsa` | Wave 1 hub (kept; not in primary homepage strip); foundation-lean |
| `/cities/charleston-sc` | Wave 1 hub (kept; not in primary homepage strip); encapsulation-lean; display name `Charleston, SC`; catalog card defaults to encapsulation (`charleston-sc`, not `charleston`) |
| `/cities/tallahassee` | Wave 1 hub (kept; not in primary homepage strip); encapsulation-lean; catalog card defaults to encapsulation |
| `/cities/pensacola` | Wave 1 hub (kept; not in primary homepage strip); encapsulation-lean coastal |
| `/cities/fort-myers` | Wave 1 hub (kept; not in primary homepage strip); encapsulation-lean coastal |
| `/cities/sarasota` | Wave 1 hub (kept; not in primary homepage strip); encapsulation-lean coastal |
| `/cities/west-palm-beach` | Wave 1 hub (kept; not in primary homepage strip); encapsulation-lean coastal; H1 uses full name, not WPB |
| `/cities/fort-lauderdale` | Wave 1 hub (kept; not in primary homepage strip); encapsulation-lean coastal; Broward desk, **not** Miami |
| `/cities/daytona-beach` | Wave 1 hub (kept; not in primary homepage strip); encapsulation-lean coastal |
| `/cities/{slug}?service=foundation-repair` | Hub filtered to foundation repair (+ `both`). In-app only — **not** in `sitemap.xml` |
| `/cities/{slug}?service=encapsulation` | Hub filtered to encapsulation (+ `both`). In-app only — **not** in `sitemap.xml` |
| `/l/{slug}` | Listing detail + JSON-LD |
| `/submit` | Contractor submission |
| `/claim` | Claim a sourced profile |
| `/claim?listing={slug}` | Preselect a **published + claimable** listing (preferred ops deep link) |
| `/claim?listing={id}` | Same, using Prisma cuid |
| `/founding` | Founding / featured Stripe stub |
| `/admin` | Admin-lite publish |
| `/contractors` | Extra browse (all contractors) |
| `/services` · `/services/foundation` · `/services/encapsulation` | Extra browse (primary desk only) |

There is no `/c/waterproofing`, mold category, `/cities/tampa-bay`, `/cities/miami`, `/cities/charleston` (use `charleston-sc`), `/last-minute`, `/guides`, or `/lodges`. Fort Lauderdale is `/cities/fort-lauderdale`, a separate Broward hub — do not fold it into Miami.

The **homepage strip** is an explicit 8-card list in `src/lib/hubs.ts` (`HOMEPAGE_STRIP`) — not City `sortOrder` and not `getCities()` alone:

Tampa → Houston → Atlanta → Charlotte → Jacksonville → Orlando → Nashville → Dallas–Fort Worth.

Moisture cards default to `?service=encapsulation` and keep a foundation chip. DFW is foundation-first (`?service=foundation-repair`) with a pier & beam chip to `/cities/dallas-fort-worth` (no pier-and-beam category URL). Homepage service chips: encapsulation → Tampa encapsulation, foundation → Houston foundation-repair, pier & beam → DFW.

Chicago, Austin, St. Louis, Memphis, Birmingham, Oklahoma City, Greenville SC, Raleigh, Tulsa, Charleston SC, and the Florida catalog desks (Tallahassee, Pensacola, Fort Myers, Sarasota, West Palm Beach, Fort Lauderdale, Daytona Beach) stay as `/cities/{slug}` hubs and are **not** in the primary strip. Charleston SC and Florida catalog cards default to `?service=encapsulation` with a foundation chip. Charleston is `charleston-sc`, not `charleston`; display name is `Charleston, SC`. Fort Lauderdale is not Miami. Do not auto-add Miami. Seed `sortOrder` still follows `WAVE1_HUBS` array order for the catalog.

A listing with `primaryService=both` appears in **both** hub service filters.

## Brand lock

| Token | Value |
| --- | --- |
| Slate | `#1E293B` |
| Deep | `#0F172A` |
| Concrete | `#C9B8A6` |
| Amber | `#D97706` |
| Page | `#F7F4F0` |
| Wordmark | HTML weight-contrast: **BelowGrade** slate + **Pros** amber / heavier |
| Tagline | Solid ground starts below grade. |

Applied in `src/app/globals.css`, `src/lib/config.ts`, and `src/components/BrandLockup.tsx`. No PNG/SVG mark in v1.

## Where to change a clone

1. **Brand** — `src/lib/config.ts` (`name`, `domain`, `tagline`, `listingTypes`, service vocabulary) and `src/app/globals.css` (palette + fonts in `src/app/layout.tsx`).
2. **Types** — `site.listingTypes` (one `contractor` key). Listing URLs stay `/l/[slug]`.
3. **Taxonomy** — Wave 1 hubs in `src/lib/hubs.ts` (`WAVE1_HUBS`) and `prisma/seed.ts`.
4. **Copy** — `src/app/page.tsx`, `src/app/about/page.tsx`.
5. **SEO** — `src/lib/config.ts` (`resolveSiteUrl`), `src/lib/jsonld.ts`, `src/app/sitemap.ts` (bare `/cities/{slug}` only), `src/app/robots.ts`.
6. **Admin** — already generic CRUD. Inbox tables follow submissions and claims.
7. **Founding** — `src/lib/founding.ts` and `/founding`. Three published founding listings per city. A claim that opts in stores `ClaimRequest.founding`; admin “Mark reviewed” sets `Listing.founding` and `foundingAt` when a spot is open. `/founding?listing={slug}` explains the offer and links to `/claim?listing={slug}`. `src/lib/stripe.ts` still reads Payment Link env vars for later billing.

## Request flow

```
Public pages (RSC)
  → src/lib/listings.ts (published-only queries)
  → Prisma / PostgreSQL

Forms (submit, claim, founding, admin)
  → src/app/actions.ts (server actions)
  → Prisma (quote, claim, submit)
  → revalidatePath / redirect
```

`/admin` is a route group (`admin/(console)`) gated by `src/lib/admin.ts`. Login lives at `/admin/login` and is public.

## Postgres (Vercel)

The schema provider is `postgresql`. Runtime queries use `DATABASE_URL`. Migrations use `DIRECT_URL` (`directUrl`), falling back to `DATABASE_URL` when the CLI wrapper has no `DIRECT_URL`.

Prisma Postgres limits direct connections per role (`db.prisma.io`). That is the "too many connections for role" failure when serverless functions open the direct host. Application traffic uses the pooled host `pooled.db.prisma.io`. On Vercel, `src/lib/prisma.ts` rewrites a direct host to the pooled host, appends `connection_limit=1&pool_timeout=20` when missing (Prisma 6's default pool is `num_physical_cpus * 2 + 1`), and stores the client on `globalThis` in every environment. Migrate is unchanged and stays on the direct URL.

1. Set `DATABASE_URL` (pooled, for Prisma Postgres) and `DIRECT_URL` (direct `db.prisma.io`) and `ADMIN_PASSWORD` on Vercel. Set `NEXT_PUBLIC_SITE_URL=https://belowgradepros.com` on Production (required for SEO). Production never falls back to `VERCEL_URL` / `*.vercel.app`. Stripe and lead-alert vars are optional (see README).
2. Deploy. Build is `prisma generate && next build` (via `scripts/with-direct-url.mjs` so generate can see `DIRECT_URL`). Data routes are `force-dynamic` so prerender does not query the database.
3. Post-deploy: `npm run db:deploy` (`prisma migrate deploy` against `DIRECT_URL`). Then seed only if you want sample data.

Lead alerts (`src/lib/notify.ts`) run after claim, listing, and homeowner quote inserts. `after()` from `next/server` sends them once the response is finished, with a 5s timeout. Resend when `RESEND_API_KEY` is set, otherwise SMTP when `SMTP_USER` and `SMTP_PASS` are set, otherwise a warning and no email. Failures stay out of the visitor's result. A quote is stored on that listing only.

JSON columns (`photos`, `services`) map to `JSONB`.

## Intentionally out of scope (v1)

- Live Stripe Checkout (keys + SDK). `src/lib/stripe.ts` still reads Payment Link env vars for later billing.
- Real contractor auth beyond the claim inbox
- Beehiiv / newsletter product
- Vercel project creation / DNS (document env only)
- Multi-user operator accounts
- Waterproofing / mold as first-class category URLs

## File guide

```
prisma/schema.prisma          models
prisma/seed.ts                Wave 1 hubs + sample listings (destructive; 8-card homepage strip is config, not seed order)
scripts/import-listings.ts    CLI wrapper around the shared importer
src/lib/import-listings.ts    shared CSV parse + upsert (CLI + /admin/import)
src/lib/founding.ts           founding offer copy + spots left per city
src/lib/quote-lead.ts         homeowner quote validation
src/lib/stripe.ts             post-first-lead price + Payment Link helpers (no SDK)
src/lib/notify.ts             lead alert email (Resend, SMTP, or no-op)
src/lib/database-url.ts       Vercel pooled URL + connection_limit for PrismaClient
src/lib/prisma.ts             PrismaClient singleton (all environments)
src/app/admin/(console)/import  ADMIN_PASSWORD-gated CSV upload
src/app/founding/page.tsx     founding offer; links to /claim
data/hero-seed.sample.csv     expected import columns
docs/import-listings.md       column aliases + production runbook
src/lib/hubs.ts               Wave 1 slugs, hub titles/meta
src/lib/config.ts             brand + types (clone here first)
src/lib/listings.ts           public queries
src/lib/listing-status.ts     publish aliases only; candidate stays draft
src/lib/admin.ts              password cookie
src/app/actions.ts            mutations
src/app/l/[slug]/page.tsx     listing + JSON-LD
src/app/admin/(console)/      CRUD + inbox + CSV import
src/components/               cards, header, filters, founding CTA
```

## Schema deltas vs FishTheFlats

| FTF | BGP |
| --- | --- |
| `Destination` (`region`, `country`) | `City` (`state`, `region`, `sortOrder`) |
| `ListingDestination` | `ListingCity` |
| `Listing.species` JSON | `Listing.primaryService` + `Listing.services` badges |
| — | `Listing.homeCity`, `homeState`, `licenseId`, `founding` |
| `Listing.type` `guide` \| `lodge` | `contractor` |
| `Submission.destinations` / `species` | `cities` / `primaryService` / badge `services` / `founding` |
| `NewsletterSignup` | removed |
| `LastMinuteOpening` | removed |
