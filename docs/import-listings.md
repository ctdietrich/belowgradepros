# Import listings from CSV

Use this when a curated sheet needs to land in Postgres without wiping existing data.

`npm run seed` **deletes** listings, metros, claims, and submissions. Do **not** seed production after a real import.

## Admin upload (production)

On Vercel the app already has `DATABASE_URL`. **Do not copy that URL off the project** to run a laptop import. Sign in with `ADMIN_PASSWORD` and upload the sheet:

1. Open `/admin/login` and enter `ADMIN_PASSWORD`.
2. Go to `/admin/import`.
3. Choose the CSV. Optionally check **Dry run** or **Insert only**.
4. Submit. The desk shows created / updated / skipped counts.

`/admin/import` is inside the `admin/(console)` layout. The server action calls `requireAdmin()` before reading the file. There is **no** public import route.

The upload uses `src/lib/import-listings.ts` — the same parser as `npm run import:listings`.

## CLI

```bash
npm run import:listings -- data/listings.sample.csv --dry-run
npm run import:listings -- --self-test
npm run import:listings -- /path/to/listings.csv
```

## Expected columns

See [`data/listings.sample.csv`](../data/listings.sample.csv). Headers are matched case-insensitively; spaces and hyphens become underscores.

| Logical field | Prisma | Accepted headers |
| --- | --- | --- |
| name | `name` | `name`, `listing`, `business`, `title`, `company` |
| city | `city` | `city`, `town` |
| state | `state` | `state`, `st`, `state_code` |
| metro | `metro` + hub match | `metro`, `market`, `msa` |
| services | `services` (JSON) | `services`, `service`, `service_flags` |
| description | `description` | `description`, `bio`, `about` |
| email | `email` | `email`, `contact_email` |
| website | `website` | `website`, `url`, `web` |
| source | `sourceUrl` | `source_url`, `source` |
| published | `published` | `published`, `status` |
| claimable | `claimable` | `claimable`, `claim` |
| featured | `featured` | `featured`, `hero` |
| phone | `phone` | `phone`, `telephone` |
| slug | `slug` | `slug`, `permalink` |

Service values map to: `foundation_repair`, `encapsulation`, `waterproofing`, `pier_and_beam`, `slab`.

### Status → published

These CSV values store **`published = true`**: `published`, `publish`, `live`, `ready`, `candidate`, `approved`, `active`, `true`, `yes`.

These stay **`published = false`**: `draft`, `pending`, `unpublished`, `hidden`, `false`, `no`.
