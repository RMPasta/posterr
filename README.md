# Posterr

AI writing that does not sound like AI marketing.

Posterr is an AI writing workbench for turning rough ideas into plain, believable posts for Reddit, blogs, X, LinkedIn, devlogs, and product updates—without viral hooks, fake authority, or obvious AI cadence.

## MVP features

- Landing page, Google sign-in (Supabase Auth), protected dashboard
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

2. **Create a Supabase project** at [supabase.com](https://supabase.com).

3. **Run SQL schema** from `supabase/migrations/001_initial.sql` in the Supabase SQL editor (tables + RLS).

4. **Google Cloud — OAuth 2.0 Web Client** (APIs & Services → Credentials → Create credentials → OAuth client ID → **Web application**).

   - **Authorized redirect URIs** (required): add **exactly**  
     `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`  
     Use your real project hostname from **Supabase → Project Settings → API** (`NEXT_PUBLIC_SUPABASE_URL`). Google sends users back to Supabase here, not to Posterr first.
   - **Authorized JavaScript origins**: add where the app runs, for example  
     `http://localhost:3000` and your production origin (e.g. `https://www.posterr.xyz` if that is canonical). If Google rejects saving until the consent screen is ready, configure the **OAuth consent screen** (External, your email as test user while in Testing).
   - Create the client and copy **Client ID** and **Client secret**.

5. **Supabase — enable Google** (Authentication → Sign In / Providers → **Google**): paste Client ID and Client secret, save. You can turn off **Email** if you only want Google.

6. **Supabase — Site URL and Redirect URLs** (Authentication → URL Configuration).

   - **Site URL**: match `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000` locally, `https://www.posterr.xyz` in production if you use `www`).
   - **Redirect URLs**: include both  
     `http://localhost:3000/auth/callback`  
     and your production callback, e.g. `https://www.posterr.xyz/auth/callback` (and the apex URL too if users might hit it before a redirect).

7. **Environment variables** — copy `.env.local.example` to `.env.local` and fill in:

   | Variable | Required | Notes |
   |----------|----------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Anon key |
   | `NEXT_PUBLIC_SITE_URL` | yes | Origin only, no trailing slash (e.g. `http://localhost:3000`, production canonical URL) |
   | `OPENAI_API_KEY` | yes | OpenAI API key |
   | `POSTERR_MODEL` | no | Defaults to `gpt-4.1-mini` |
   | `SUPABASE_SERVICE_ROLE_KEY` | no | Not used by this MVP (keep server-only if you add admin scripts) |

   Google credentials live in the Supabase dashboard only; you do not add Google secrets to `.env.local` for this flow.

8. **Run dev server**

   ```bash
   npm run dev
   ```

9. **Deploy to Vercel** — set the same env vars; production `NEXT_PUBLIC_SITE_URL` must match the canonical site (including `www` if you redirect apex → `www`).

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — ESLint

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase Auth + Postgres, Vercel AI SDK, OpenAI.
