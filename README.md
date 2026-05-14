# Posterr

AI writing that does not sound like AI marketing.

Posterr is an AI writing workbench for turning rough ideas into plain, believable posts for Reddit, blogs, X, LinkedIn, devlogs, and product updates—without viral hooks, fake authority, or obvious AI cadence.

## MVP features

- Landing page, magic-link auth (Supabase), protected dashboard
- Generator with platform-aware options and structured AI output
- Save drafts, library with search and platform filter, draft detail with edit/delete
- User defaults (platform, tone, writing level, length)
- Daily generation cap (10 per user per UTC day) via `generation_logs`

## Product principles

Prefer plain English, shorter sentences, realistic uncertainty, and practical usefulness. Avoid hype words, guru LinkedIn tone, fake stories, and invented research.

## Setup

### Node and where to run `npm`

Use **Node 20 LTS** (≥ 20.19) or **Node 22+** (≥ 22.13). **Node 21 is not supported** by several dependencies (you will see `EBADENGINE`).

If the project lives under **WSL** (e.g. `/home/.../posterr`), run **all** of `npm install`, `npm run dev`, and `npm run build` **inside WSL** (Ubuntu shell), not from **Git Bash / CMD / PowerShell** against a `\\wsl.localhost\...` or `\\wsl$\...` path. Windows npm cannot reliably manage Linux `node_modules` (symlinks in `.bin` show up as directories → `EISDIR`, plus `EPERM` cleanup errors).

```bash
wsl -d Ubuntu-22.04
cd ~/personal/posterr   # your path
rm -rf node_modules     # if a previous Windows-side install corrupted .bin
npm install
```

If you prefer Windows-native tooling, clone the repo onto an **NTFS** path (e.g. `C:\dev\posterr`) and use Node 20/22 there instead.

1. **Install dependencies** (from WSL as above, or from a Windows folder if you use that layout)

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) and enable Email auth (magic link).

3. **Run SQL schema** from `supabase/migrations/001_initial.sql` in the Supabase SQL editor (tables + RLS).

4. **Configure Auth redirect URLs** in Supabase: add `http://localhost:3000/auth/callback` (and your production URL) to Redirect URLs.

5. **Environment variables** — copy `.env.local.example` to `.env.local` and fill in:

   | Variable | Required | Notes |
   |----------|----------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Anon key |
   | `NEXT_PUBLIC_SITE_URL` | yes for magic link | e.g. `http://localhost:3000` |
   | `OPENAI_API_KEY` | yes | OpenAI API key |
   | `POSTERR_MODEL` | no | Defaults to `gpt-4.1-mini` |
   | `SUPABASE_SERVICE_ROLE_KEY` | no | Not used by this MVP (keep server-only if you add admin scripts) |

6. **Run dev server**

   ```bash
   npm run dev
   ```

7. **Deploy to Vercel** — set the same env vars; use your production `NEXT_PUBLIC_SITE_URL` and Supabase callback URL.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — ESLint

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase Auth + Postgres, Vercel AI SDK, OpenAI.
