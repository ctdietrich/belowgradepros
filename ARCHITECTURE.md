# Architecture — niche directory kit

BelowGradePros is a **vertical directory** cloned from [FishTheFlats](https://github.com/ctdietrich/fishtheflats): one listing type, a city-hub taxonomy, inbound claim/submit, and an admin-lite desk. There is no newsletter product and no last-minute inventory.

## Mental model

```
Demand  →  browse city hubs / services  →  inquire on the listing
Supply  →  submit or claim  →  editorial review in /admin  →  published listing
Ops     →  password-gated CRUD + CSV import
```

There is no payments layer and no availability engine. The product is the catalog and the desk.

## Stack map

| Layer | Choice | Why it clones cleanly |
| --- | --- | --- |
| App | Next.js App Router | File-based pages; metadata + sitemap live next to routes |
| UI | Tailwind + a small component set | Brand tokens live in `globals.css` |
| Data | Prisma | PostgreSQL via `DATABASE_URL` (local or hosted) |
| Auth | Shared `ADMIN_PASSWORD` cookie | Enough for a one-desk editorial tool |

## Domain objects

Defined in `prisma/schema.prisma`:

- **City** — metro hub taxonomy (`slug`, `name`, `state`, `region`, `heroImage`). FTF called this Destination (`country` instead of `state`).
- **Listing** — `contractor` (thin `listingTypes` config; one type in v1)
  - `services[]`, `photos[]` (JSON) — FTF `species` → BGP `services`
  - `homeCity` / `homeState` / `licenseId` — ops fields, not in FTF
  - `featured`, `verified`, `status` (`draft` \| `published`)
  - CSV / admin aliases `candidate` and `ready` normalize to `published` (`src/lib/listing-status.ts`)
  - `sourceUrl`, `claimable`, `contactEmail` / `website`
- **ListingCity** — many-to-many (FTF `ListingDestination`)
- **Submission** / **ClaimRequest** — inbound supply (`cities` + `services` instead of destinations + species)

Dropped vs FTF: `NewsletterSignup`, `LastMinuteOpening`, Beehiiv env, `/last-minute`, `/guides`, `/lodges`.

## URL map

| Path | Purpose |
| --- | --- |
| `/` | Featured listings, city hubs, demand/supply desk |
| `/cities` | Metro hubs |
| `/cities/[slug]` | Contractors in one metro |
| `/contractors` | All contractors + filters |
| `/services` | Service flag index |
| `/services/[slug]` | Contractors with that flag |
| `/l/[slug]` | Listing detail + JSON-LD |
| `/submit` | Contractor submission |
| `/claim` | Claim a sourced profile |
| `/about` | What the product is (and is not) |
| `/admin` | Password-gated CRUD (`ADMIN_PASSWORD`) |
| `/admin/import` | Signed-in CSV upsert |

FTF `/destinations` is `/cities`. Listing URLs stay `/l/[slug]`.

## Where to change a clone

1. **Brand** — `src/lib/config.ts` (`name`, `domain`, `tagline`, `listingTypes`, service vocabulary) and `src/app/globals.css` (palette + fonts in `src/app/layout.tsx`).
2. **Types** — `site.listingTypes` (one `contractor` key). Listing URLs stay `/l/[slug]`.
3. **Taxonomy** — city hubs in `prisma/seed.ts`.
4. **Copy** — `src/app/page.tsx`, `src/app/about/page.tsx`.
5. **SEO** — `src/lib/jsonld.ts` (schema.org types), `src/app/sitemap.ts`, `src/app/robots.ts`.
6. **Admin** — already generic CRUD. Inbox tables follow submissions and claims.

## Request flow

```
Public pages (RSC)
  → src/lib/listings.ts (published-only queries)
  → Prisma / PostgreSQL

Forms (submit, claim, admin)
  → src/app/actions.ts (server actions)
  → Prisma
  → revalidatePath / redirect
```

`/admin` is a route group (`admin/(console)`) gated by `src/lib/admin.ts`. Login lives at `/admin/login` and is public.

## Postgres (Vercel)

The schema provider is `postgresql`. Local and production both use `DATABASE_URL`.

1. Set `DATABASE_URL` (and `ADMIN_PASSWORD`) on Vercel. `NEXT_PUBLIC_SITE_URL` is optional.
2. Deploy. Build is `prisma generate && next build`. Data routes are `force-dynamic` so prerender does not query the database.
3. Post-deploy: `npx prisma migrate deploy` (or `npm run db:deploy`). Then seed only if you want sample data.

JSON columns (`photos`, `services`) map to `JSONB`.

## Intentionally out of scope (v1)

- Payments (Stripe / founding checkout)
- Real contractor auth beyond the claim inbox
- Beehiiv / newsletter product
- Vercel project creation / DNS (document env only)
- Multi-user operator accounts

## File guide

```
prisma/schema.prisma          models
prisma/seed.ts                8 hubs + ~19 sample listings (destructive)
scripts/import-listings.ts    CLI wrapper around the shared importer
src/lib/import-listings.ts    shared CSV parse + upsert (CLI + /admin/import)
src/app/admin/(console)/import  ADMIN_PASSWORD-gated CSV upload
data/hero-seed.sample.csv     expected import columns
docs/import-listings.md       column aliases + production runbook
src/lib/config.ts             brand + types (clone here first)
src/lib/listings.ts           public queries
src/lib/listing-status.ts     published aliases (candidate/ready)
src/lib/admin.ts              password cookie
src/app/actions.ts            mutations
src/app/l/[slug]/page.tsx     listing + JSON-LD
src/app/admin/(console)/      CRUD + inbox + CSV import
src/components/               cards, header, filters
```

## Schema deltas vs FishTheFlats

| FTF | BGP |
| --- | --- |
| `Destination` (`region`, `country`) | `City` (`state`, `region`) |
| `ListingDestination` | `ListingCity` |
| `Listing.species` JSON | `Listing.services` JSON |
| — | `Listing.homeCity`, `homeState`, `licenseId` |
| `Listing.type` `guide` \| `lodge` | `contractor` |
| `Submission.destinations` / `species` | `cities` / `services` |
| `NewsletterSignup` | removed |
| `LastMinuteOpening` | removed |
