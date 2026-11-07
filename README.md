# Visit at [https://kdt.web8th.com](https://kdt.web8th.com)

This is the KDT website: a Next.js (App Router) app backed by Supabase, deployed on Vercel.

## Getting started

### Prerequisites

- **Node.js 22** (CI uses 22)
- **pnpm 10** (CI uses pnpm; use it instead of npm, even though a `package-lock.json` is also in the repo)
- Access to the project's Supabase project. Ask a maintainer for the project URL and anon key.

### 1. Clone and install

```bash
git clone https://github.com/kdtsuo/v4.git
cd v4
pnpm install --frozen-lockfile
```

### 2. Set environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Both are required. `lib/supabase.ts` throws at import time if either is missing, so `pnpm build` fails without them. You can find the values in the Supabase dashboard under **Project Settings → API**.

Never commit `.env*` files. They are already in `.gitignore`.

### 3. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                | What it does                                                      |
| ---------------------- | ----------------------------------------------------------------- |
| `pnpm dev`             | Start the dev server                                              |
| `pnpm build`           | Create a production build                                         |
| `pnpm start`           | Serve the production build                                        |
| `pnpm lint`            | Run ESLint                                                        |
| `pnpm format`          | Format the repo with Prettier                                     |
| `pnpm format:check`    | Check formatting without writing (CI runs this)                   |
| `pnpm sync:instagram`  | Cache committee members' Instagram avatars and bios into Supabase |
| `pnpm clear:instagram` | Delete the cached Instagram data so you can start over            |

The two Instagram scripts are optional and are not needed for local development.

- They read from `.env`, not `.env.local`. They need `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (the `service_role` key, not the anon key).
- `sync:instagram` must run from a residential connection. Instagram blocks datacenter IPs, including CI runners and cloud hosts. Use `pnpm sync:instagram -- --dry-run` to preview without writing.
- Optional: `PUPPETEER_EXECUTABLE_PATH` points at a Chrome/Chromium binary, and `SCRAPE_CONCURRENCY` sets how many profiles are scraped in parallel (default 3).

## Before opening a PR

CI runs these checks on every push and pull request:

```bash
pnpm format:check
pnpm lint
```

Run them locally first. Lint may show existing warnings. Only errors fail CI.

Code conventions (imports, shadcn usage, forms, Supabase, PR titles) are in [`AGENTS.md`](./AGENTS.md).

## Project layout

```
app/                 Pages (App Router) and API routes under app/api/
  api/keep-alive/    Cron target that pings Supabase so the project isn't paused
  api/club/          Fetches the club page data from the Rubric API
  api/reviews/       Fetches reviews from the Rubric API
components/          Page sections; components/ui/ holds shadcn/ui primitives
  */AddEdit.tsx      Editing forms for each managed section
  */Delete.tsx       Delete actions for each managed section
contexts/            Auth and toast providers
hooks/               Shared React hooks
lib/
  supabase.ts        Supabase client (browser/anon)
  rubric.ts          Rubric API helpers
  data/              Fallback content used when Supabase returns no rows
supabase/
  migrations/        SQL migrations, applied in filename order
  seed.sql           Seed data
  config.toml        Supabase CLI config for local development
scripts/             Instagram sync utilities (run with Node, not in the browser)
types/, utils/       Shared types and helpers
```

## Database

The site reads four tables: `links`, `positions`, `sponsors`, and `team_members`. Schema changes go in a new file under `supabase/migrations/`, named with a timestamp prefix.

Some sections show bundled fallback data when their table is empty. For example, the sponsors section uses `lib/data/FallbackSponsors.ts`.

If you use the [Supabase CLI](https://supabase.com/docs/guides/cli) for a local database, `supabase start` followed by `supabase db reset` applies the migrations and seed data. This path has not been verified against this repo.

## External services

- **Rubric** (`api.hellorubric.com`): reviews and club page data. `/api/club` returns a 500 when this host is unreachable, which happens in offline or sandboxed environments.
- **Instagram**: only used by the optional sync scripts above.

## Deployment

The site deploys to Vercel. `vercel.json` schedules a daily request to `/api/keep-alive` at 12:00 UTC so the Supabase project isn't paused for inactivity. Set `CRON_SECRET` in the Vercel project settings. When it is set, the route rejects requests that don't send `Authorization: Bearer <CRON_SECRET>`.
