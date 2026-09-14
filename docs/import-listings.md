# Import listings from CSV

Use this when a curated ops sheet needs to land in Postgres without wiping existing data.

`npm run seed` **deletes** listings, cities, claims, and submissions and loads **sample** preview rows. Do **not** seed production after a real import. Seed does not publish ops `candidate` rows — only explicit `published` listings in `prisma/seed.ts` are live in that sample set.

## Admin upload (production)

On Vercel the app already has `DATABASE_URL`. **Do not copy that URL off the project** to run a laptop import. Sign in with the existing `ADMIN_PASSWORD` session and upload the sheet:

1. Open `/admin/login` and enter `ADMIN_PASSWORD`.
2. Go to `/admin/import`.
3. Choose the hero CSV. Optionally check **Dry run** (counts only) or **Insert only** (skip existing slugs/names).
4. Submit. The desk shows **created / updated / skipped** counts, plus any row errors or warnings.

`/admin/import` is inside the same `admin/(console)` layout as the rest of the desk. The server action calls `requireAdmin()` before reading the file. There is **no** public or unauthenticated import route.

The upload uses `src/lib/import-listings.ts` — the same parser, aliases, status mapping, and upsert as `npm run import:listings`.

## CLI (local / machines that already have the database URL)

```bash
# Preview mapping (no writes). Works even without a database if you only want parse/status checks.
npm run import:listings -- data/hero-seed.sample.csv --dry-run

# Built-in mapping tests (candidate stays draft, publish goes live, metro_slug → Wave 1)
npm run import:listings -- --self-test

# Write to the database in DATABASE_URL
npm run import:listings -- /absolute/path/to/hero.csv
```

Then confirm on the public site and `/admin`. Prefer **`/admin/import`** for production so `DATABASE_URL` never leaves Vercel.

## Expected columns

See [`data/hero-seed.sample.csv`](../data/hero-seed.sample.csv) for a complete header row. Headers are matched **case-insensitively**; spaces and hyphens become underscores (`Source URL` → `source_url`).

Ops sheet (`directories/belowgradepros/research/listings/seed-candidates.csv`):

`name,city,state,metro,metro_slug,services,phone,website,bio,license_id,source_url,photo_policy,status,notes,email,growth_flag`

| Logical field | Prisma | Accepted headers (any one) |
| --- | --- | --- |
| name | `name` | `name`, `listing`, `listing_name`, `business`, `title`, `contractor` |
| city | `homeCity` | `city`, `home_city`, `locality` |
| state | `homeState` | `state`, `home_state`, `st` |
| metro_slug | `ListingCity` → `City.slug` | `metro_slug`, `city_slug`, `hub_slug` (**preferred**) |
| metro | `ListingCity` → `City` (fuzzy) | `metro`, `metros`, `hub`, `destination`, `location` |
| primary | `primaryService` | `primary`, `primary_service`, `focus`, `desk` |
| services | `primaryService` and/or badge `services` | `services`, `service`, `service_flags`, `flags` |
| founding | `founding` | `founding`, `founding_listing`, `paid` |
| phone | `phone` | `phone`, `telephone`, `tel` |
| website | `website` | `website`, `url`, `web`, `site` |
| bio | `bio` | `bio`, `description`, `about`, `blurb` |
| license_id | `licenseId` | `license_id`, `license`, `license_number` |
| source_url | `sourceUrl` | `source_url`, `source`, `attribution` |
| status | `status` | `status`, `publish_status` |
| email | `contactEmail` | `email`, `contact_email`, `contact` (if it looks like an email) |
| notes | `tagline` if no tagline; also bio fallback | `notes`, `note`, `internal_notes` |
| growth_flag | `claimable` when value is `claimable` | `growth_flag`, `growth` |
| claimable | `claimable` | `claimable`, `claim`, `can_claim` |
| featured / verified | booleans | `featured` / `verified` |
| tagline | `tagline` | `tagline`, `subtitle`, `headline` |
| slug | `slug` | `slug`, `permalink` |
| photos | `photos` (JSON) | `photos`, `images`, `photo_urls` |
| region | new cities only | `region` |
| photo_policy | **ignored** (no schema column) | `photo_policy` |

Comma, semicolon, tab, or `|` lists work for services, photos, metros, and metro_slug. Quoted fields and newlines inside quotes are supported. A UTF-8 BOM is stripped.

There is **no** `notes` or `photo_policy` column on `Listing`. Notes become the tagline when `tagline` is empty. `photo_policy` is accepted and discarded.

If `metro_slug` is present it wins over the fuzzy `metro` name. Wave 1 slugs: `houston`, `dallas-fort-worth`, `atlanta`, `tampa`, `chicago`, `charlotte`, `austin`, `st-louis`, `jacksonville`, `orlando`, `nashville`. Homepage strip order is separate (`HOMEPAGE_STRIP`).

### Service flags

`services` values `foundation`, `encapsulation`, and `both` map to `primaryService`. Extra tokens become badges.

| Stored `primaryService` | Accepted labels |
| --- | --- |
| `foundation` | Foundation, foundation repair, repair |
| `encapsulation` | Encapsulation, crawl space, crawlspace |
| `both` | Both, foundation + encapsulation |

If the services list includes both foundation and encapsulation tokens (and no explicit `primary`), the row is stored as `both`. A listing with `both` appears in hub filters `?service=foundation-repair` **and** `?service=encapsulation`.

**Additional badges** stay on `Listing.services` (JSON). They are not category URLs.

| Badge key | Accepted labels |
| --- | --- |
| `waterproofing` | Waterproofing, waterproof |
| `pier_beam` | Pier & beam, pier and beam, pier |
| `slab` | Slab, slab foundation |

Unknown tokens are dropped with a warning. Do not invent `/c/waterproofing` or mold categories.

### Status → published (BGP ops)

These CSV values are stored as **`published`** and appear on the public directory:

`publish`, `published`, `live`, `approved`, `active`, `hero`

These stay **`draft`** (off the public site until an admin publishes):

`candidate`, `qa_pass`, `ready`, `review`, `pending`, `draft`

These are **inserted as draft** with `claimable=true` (not skipped):

`qa_fail`, `reject`, `rejected`

**`candidate` does not publish.** That FTF mapping is wrong for BGP.

An empty status on import defaults to **draft**. The admin “New listing” form also defaults to draft.

### Type

v1 is a single listing type: `contractor`. Blank or unknown `type` values become `contractor`.

### City hubs

`metro_slug` matches `City.slug` first. Otherwise the script matches by name and Wave 1 aliases (`DFW` → `dallas-fort-worth`, `Tampa Bay` → `tampa`, `St. Louis` → `st-louis`, `JAX` → `jacksonville`). Tampa is stored as `tampa`, not `tampa-bay`. Miami is not a Wave 1 hub.

If both `metro_slug` and `metro` are empty, `city` is used as the hub name.

Missing hubs are **created** unless you pass `--no-create-cities`. Created rows get a slugified name and a short placeholder description.

### Emails

`contactEmail` is required on the model. The ops `email` column maps here. Rows without a valid email get `{slug}@example.com` and a warning. **Do not invent operator emails for real businesses.** Use `example.com` in sheets and sample data until the operator claims the profile.

### growth_flag

`growth_flag=claimable` (or `claim`) sets `claimable=true`. Other growth_flag tokens are ignored.

## Flags

| Flag | Meaning |
| --- | --- |
| `--dry-run` | Parse, resolve cities, print create/update. No writes. |
| `--insert-only` | Skip when slug or name already exists (default is upsert). |
| `--no-create-cities` | Error the row instead of inserting a city hub. |
| `--self-test` | Mapping tests; no database. |
| `--help` | Usage. |

Re-runs upsert by **slug** or case-insensitive **name**. An explicit `slug` column may rename; a generated slug will not overwrite an existing listing’s slug.

## Sample vs production sheet

`data/hero-seed.sample.csv` is fictional desk copy in the ops column layout. Names are invented; every address is `@example.com`. Do not commit a real ops sheet here if it contains personal emails or unpaid-for operator data.
