# Posterr

AI writing that does not sound like AI marketing.

Posterr is an AI writing workbench for turning rough ideas into plain, believable posts for Reddit, blogs, X, LinkedIn, devlogs, and product updates—without viral hooks, fake authority, or obvious AI cadence.

## MVP features

- Landing page, Google sign-in (OAuth on your domain → Supabase session), protected dashboard
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

4. **Google Cloud — OAuth 2.0 Web Client** (APIs & Services → Credentials → OAuth client ID → **Web application**).

   - **Authorized redirect URIs**: your **Posterr** app (not Supabase). Add both, matching `NEXT_PUBLIC_SITE_URL` with no trailing slash:  
     `http://localhost:3000/api/auth/google/callback`  
     `https://www.posterr.xyz/api/auth/google/callback` (use your real production origin, e.g. apex if that is canonical).
   - **Remove** any old entry like `https://<ref>.supabase.co/auth/v1/callback` unless you still use Supabase-hosted Google elsewhere.
   - **Authorized JavaScript origins**: `http://localhost:3000` and your production origin (e.g. `https://www.posterr.xyz`).
   - **OAuth consent screen**: app name “Posterr”, support email, etc. (so Google shows your brand, not `supabase.co`.)
   - Copy **Client ID** and **Client secret**.

5. **Supabase — Google provider** (Authentication → Sign In / Providers → **Google**): enable and paste the **same** Client ID and Client secret as in `.env.local`. Supabase uses them to verify the Google `id_token` from Posterr (`signInWithIdToken`). You can disable **Email** if you only use Google.

6. **Supabase — URL Configuration** (Authentication → URL Configuration): **Site URL** must match `NEXT_PUBLIC_SITE_URL`. You can remove legacy `/auth/callback` redirect URLs if you are not using them; this app uses `/api/auth/google/callback` on your domain only.

7. **Environment variables** — copy `.env.local.example` to `.env.local` and fill in:

   | Variable | Required | Notes |
   |----------|----------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Anon key |
   | `NEXT_PUBLIC_SITE_URL` | yes | Must match the origin used in Google redirect URIs (no trailing slash) |
   | `GOOGLE_CLIENT_ID` | yes | Google OAuth Client ID (same value as in Supabase Google provider) |
   | `GOOGLE_CLIENT_SECRET` | yes | Google OAuth Client secret (same value as in Supabase Google provider) |
   | `OPENAI_API_KEY` | yes | OpenAI API key |
   | `POSTERR_MODEL` | no | Defaults to `gpt-4.1-mini` |
   | `SUPABASE_SERVICE_ROLE_KEY` | no | Not used by this MVP |

8. **Run dev server**

   ```bash
   npm run dev
   ```

9. **Deploy to Vercel** — set the same env vars (including `GOOGLE_CLIENT_*`); production `NEXT_PUBLIC_SITE_URL` must match the Google redirect URI origin.

### If you previously used Supabase-hosted Google OAuth

1. In **Google Cloud** → your Web client → **Authorized redirect URIs**: delete `https://<ref>.supabase.co/auth/v1/callback`, add Posterr’s `/api/auth/google/callback` URLs as in step 4.
2. In **Supabase** → URL Configuration: remove `/auth/callback` entries if you no longer need them.
3. Keep **Supabase Google provider** enabled with the **same** OAuth client ID/secret as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — ESLint

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase Auth + Postgres, Vercel AI SDK, OpenAI.
