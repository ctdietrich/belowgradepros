# Architecture — niche directory kit

BelowGradePros is a **vertical directory** cloned from [FishTheFlats](https://github.com/ctdietrich/fishtheflats): one listing type, a city-hub taxonomy, inbound claim/submit, and an admin-lite desk. There is no newsletter product and no last-minute inventory.

## Mental model

```
Demand  →  browse city hubs / primary services  →  inquire on the listing
Supply  →  submit or claim  →  editorial review in /admin  →  published listing
Paid    →  founding / featured upgrade ($199–299/mo Stripe stub)
Ops     →  password-gated CRUD + CSV import
```

There is no availability engine. Checkout is a Payment Link / notify stub until Stripe keys exist. The product is the catalog and the desk.

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
  - CSV / admin aliases `candidate` and `ready` normalize to `published` (`src/lib/listing-status.ts`)
  - `sourceUrl`, `claimable`, `contactEmail` / `website`
- **ListingCity** — many-to-many (FTF `ListingDestination`)
- **Submission** / **ClaimRequest** — inbound supply (`cities` + badges + `primaryService` + `founding`)

Dropped vs FTF: `NewsletterSignup`, `LastMinuteOpening`, Beehiiv env, `/last-minute`, `/guides`, `/lodges`.

## URL map

| Path | Purpose |
| --- | --- |
| `/` | Featured listings, city hubs, demand/supply desk |
| `/cities` | Metro hubs |
| `/cities/{slug}` | Contractors in one Wave 1 metro |
| `/cities/{slug}?service=foundation-repair` | Hub filtered to foundation (+ `both`) |
| `/cities/{slug}?service=encapsulation` | Hub filtered to encapsulation (+ `both`) |
| `/contractors` | All contractors + filters |
| `/services` | Primary-desk index |
| `/services/foundation` · `/services/encapsulation` | Primary flag browse (includes `both`) |
| `/l/{slug}` | Listing detail + JSON-LD |
| `/submit` | Contractor submission |
| `/claim` | Claim a sourced profile |
| `/founding` | Founding / featured Stripe stub |
| `/about` | What the product is (and is not) |
| `/admin` | Password-gated CRUD (`ADMIN_PASSWORD`) |
| `/admin/import` | Signed-in CSV upsert |

FTF `/destinations` is `/cities`. Listing URLs stay `/l/{slug}`. Do **not** add `/c/waterproofing` or mold categories in v1.

### Wave 1 city slugs (SEO lock, publish / seed order)

1. `houston`
2. `dallas-fort-worth`
3. `atlanta`
4. `tampa` (not `tampa-bay`)
5. `chicago`
6. `charlotte`
7. `austin`
8. `st-louis`

Prefer density on the first five: Houston → DFW → Atlanta → Tampa → Chicago.

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
3. **Taxonomy** — Wave 1 hubs in `src/lib/config.ts` (`WAVE1_CITIES`) and `prisma/seed.ts`.
4. **Copy** — `src/app/page.tsx`, `src/app/about/page.tsx`.
5. **SEO** — `src/lib/jsonld.ts` (schema.org types), `src/app/sitemap.ts`, `src/app/robots.ts`.
6. **Admin** — already generic CRUD. Inbox tables follow submissions and claims.
7. **Founding Stripe** — `src/lib/stripe.ts` + `/founding`. Point `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` at a live Payment Link when ready.

## Request flow

```
Public pages (RSC)
  → src/lib/listings.ts (published-only queries)
  → Prisma / PostgreSQL

Forms (submit, claim, founding, admin)
  → src/app/actions.ts (server actions)
  → Prisma (or Payment Link redirect)
  → revalidatePath / redirect
```

`/admin` is a route group (`admin/(console)`) gated by `src/lib/admin.ts`. Login lives at `/admin/login` and is public.

## Postgres (Vercel)

The schema provider is `postgresql`. Local and production both use `DATABASE_URL`.

1. Set `DATABASE_URL` (and `ADMIN_PASSWORD`) on Vercel. `NEXT_PUBLIC_SITE_URL` is optional. Stripe vars are optional.
2. Deploy. Build is `prisma generate && next build`. Data routes are `force-dynamic` so prerender does not query the database.
3. Post-deploy: `npx prisma migrate deploy` (or `npm run db:deploy`). Then seed only if you want sample data.

JSON columns (`photos`, `services`) map to `JSONB`.

## Intentionally out of scope (v1)

- Live Stripe Checkout (keys + SDK). The stub and Payment Link placeholder are in.
- Real contractor auth beyond the claim inbox
- Beehiiv / newsletter product
- Vercel project creation / DNS (document env only)
- Multi-user operator accounts
- Waterproofing / mold as first-class category URLs

## File guide

```
prisma/schema.prisma          models
prisma/seed.ts                8 Wave 1 hubs + sample listings (destructive)
scripts/import-listings.ts    CLI wrapper around the shared importer
src/lib/import-listings.ts    shared CSV parse + upsert (CLI + /admin/import)
src/lib/stripe.ts             founding price + Payment Link helpers (no SDK)
src/app/admin/(console)/import  ADMIN_PASSWORD-gated CSV upload
src/app/founding/page.tsx     founding CTA + stub checkout
data/hero-seed.sample.csv     expected import columns
docs/import-listings.md       column aliases + production runbook
src/lib/config.ts             brand + Wave 1 + primary/badge vocabulary
src/lib/listings.ts           public queries
src/lib/listing-status.ts     published aliases (candidate/ready)
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
