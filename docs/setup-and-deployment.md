# Posterr: setup, deployment, domain, and auth

This document ties together **code**, **environment**, **Supabase**, **Google OAuth**, **Vercel**, and **DNS** so you can run Posterr locally, ship it to production, and debug auth when something drifts.

For a short checklist, see the numbered steps in the root [README](../README.md). This file goes deeper.

---

## 1. Big picture

- **Next.js** serves the app (landing, login, dashboard, API routes).
- **Google** signs the user in. The browser talks to **your** domain first (`/api/auth/google` → Google → `/api/auth/google/callback`), so the consent screen is tied to **your** OAuth client and URLs—not `*.supabase.co`.
- **Supabase Auth** receives a **Google ID token** from the server and issues a normal Supabase session (access/refresh cookies). Your app code then uses `@supabase/ssr` like any other Supabase app.
- **Supabase Postgres** stores app data (`profiles`, `drafts`, etc.) with **RLS** so each user only sees their own rows.

Flow in one line: **User → Posterr (OAuth start) → Google → Posterr (callback) → Supabase `signInWithIdToken` → session cookies → dashboard.**

---

## 2. What you need before you start

| Piece | Role |
|--------|------|
| GitHub repo | Source for Vercel deploys |
| Supabase project | Auth + Postgres |
| Google Cloud project | OAuth “Web application” client |
| Domain (optional for local) | Production URL; DNS at your registrar (e.g. Namecheap) pointed per Vercel |
| Vercel project | Hosting; env vars; custom domain |

---

## 3. How the code is organized

| Area | Location | Purpose |
|------|-----------|---------|
| Google OAuth start | `app/api/auth/google/route.ts` | Sets short-lived cookies (`state`, `next`), redirects to Google |
| Google OAuth callback | `app/api/auth/google/callback/route.ts` | Validates `state`, exchanges `code` for tokens, calls `signInWithIdToken`, sets Supabase cookies |
| OAuth helpers | `lib/auth/google.ts` | `siteOrigin()`, `googleRedirectUri()`, authorize URL, token exchange |
| Login UI | `app/login/page.tsx` | Link to `/api/auth/google?next=…` |
| Sign out | `app/auth/actions.ts` | `signOut()` → Supabase `signOut`, redirect `/login` |
| Supabase (server) | `lib/supabase/server.ts` | Server Components / Server Actions |
| Supabase (browser) | `lib/supabase/client.ts` | Client-side Supabase (if used) |
| Middleware | `middleware.ts` + `lib/supabase/middleware.ts` | Refreshes session; blocks unauthenticated `/dashboard/*` |
| Dashboard gate + profile | `app/dashboard/layout.tsx` + `lib/db/profiles.ts` | Requires user; `ensureProfile()` creates `public.profiles` row |
| Schema | `supabase/migrations/001_initial.sql` | Tables + RLS (run in Supabase SQL editor or your migration process) |

There is **no** `/auth/callback` route in this app for Google; the only Google redirect URI path is **`/api/auth/google/callback`**.

---

## 4. Environment variables

Values must match across **Vercel**, **Google redirect URIs**, and **Supabase URL config** where noted.

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SITE_URL` | Client + server (build-time public) | Canonical site **origin**, no trailing slash. Drives `googleRedirectUri()` = `{origin}/api/auth/google/callback`. Must match what you put in Google’s **Authorized redirect URIs** (same scheme, host, no path except the callback path). |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Supabase project URL (`https://<ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Supabase anon (publishable) key; RLS still applies. |
| `GOOGLE_CLIENT_ID` | Server only (used in Route Handlers) | Google OAuth client ID; must match Supabase Google provider. |
| `GOOGLE_CLIENT_SECRET` | Server only | Google OAuth secret; **never** expose to the browser. Same pair as in Supabase Google provider. |
| `OPENAI_API_KEY` | Server | Model calls for generation. |
| `POSTERR_MODEL` | Server | Optional; defaults in code if unset. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Not used by this MVP; do not expose publicly. |

**Important:** `GOOGLE_CLIENT_*` is read only on the server (API routes). `NEXT_PUBLIC_*` is embedded in the client bundle—never put secrets there.

---

## 5. Supabase

### 5.1 Project and keys

Create a project at [supabase.com](https://supabase.com). From **Project Settings → API** copy:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5.2 Database schema

Run `supabase/migrations/001_initial.sql` in the **SQL Editor** (or apply via your preferred migration workflow). Without `public.profiles` (and related policies), the dashboard will error after login.

### 5.3 Auth: Google provider must stay on

The callback route calls:

`supabase.auth.signInWithIdToken({ provider: 'google', token: id_token, … })`

Supabase only accepts that if **Authentication → Sign In / Providers → Google** is **enabled** and the **Client ID / secret** match the same Google OAuth client used in Posterr (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`). If Google is disabled, you can see errors like the issuer/provider not being enabled.

You may disable **Email** if you do not want magic links; that does not replace the need for the **Google** provider toggle for this flow.

### 5.4 URL configuration

Under **Authentication → URL Configuration**:

- **Site URL** should match your real canonical origin (same as `NEXT_PUBLIC_SITE_URL` in production).
- **Redirect URLs**: legacy `/auth/callback` is **not** used by this app’s Google flow. You can remove unused entries. Some teams keep extra URLs for experiments; the app’s Google return path is only on your domain: `/api/auth/google/callback`.

---

## 6. Google Cloud Platform

### 6.1 OAuth client type

Create an OAuth client of type **Web application** (APIs & Services → Credentials).

### 6.2 Authorized redirect URIs (exact)

Google compares the `redirect_uri` parameter **byte-for-byte** to this list. Posterr always sends:

`{NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`

Examples:

- Local: `http://localhost:3000/api/auth/google/callback`
- Production (if `www` is canonical): `https://www.posterr.xyz/api/auth/google/callback`

If you list `https://www.posterr.xyz/auth/callback` but the app uses `/api/auth/google/callback`, Google will reject the request (often “invalid” / redirect mismatch).

### 6.3 Authorized JavaScript origins

Include the same origins you use for the app, e.g.:

- `http://localhost:3000`
- `https://www.posterr.xyz`

### 6.4 OAuth consent screen

Configure app name (e.g. Posterr), support email, and (when required) privacy policy links. For **Testing**, add Google accounts that may sign in. Publishing is a separate verification process with Google.

---

## 7. Local development

1. Install Node **20.19+** or **22.13+** (see README for WSL vs Windows paths).
2. `npm install`
3. Copy `.env.local.example` to `.env.local` and fill all required variables.
4. Ensure Google redirect URI includes `http://localhost:3000/api/auth/google/callback`.
5. `npm run dev` → open `http://localhost:3000`.

---

## 8. Vercel and GitHub

1. Import the GitHub repository into Vercel.
2. Framework preset: **Next.js**.
3. Add **every** env var from section 4 for **Production** (and **Preview** if you want preview deployments to work with real auth—then Preview needs its own Google redirect URI such as `https://<preview>.vercel.app/api/auth/google/callback`, or accept that previews skip OAuth).
4. Redeploy after changing env vars.

Production `NEXT_PUBLIC_SITE_URL` must be your **canonical** public URL (including `www` if that is what users use).

---

## 9. Domain and DNS

### 9.1 Vercel

In the Vercel project → **Settings → Domains**, add your apex and/or `www` as instructed. Vercel shows the **exact** DNS records (often **A** for apex, **CNAME** for `www`).

### 9.2 Registrar (e.g. Namecheap)

In **Advanced DNS**, create the records Vercel gives you. Wait for propagation (minutes to hours). If you use **apex → www redirect** in Vercel, pick one canonical host and set `NEXT_PUBLIC_SITE_URL` to match (typically `https://www.example.com`).

### 9.3 Align everything

The same canonical origin should appear in:

- `NEXT_PUBLIC_SITE_URL`
- Google **Authorized redirect URIs** (origin + `/api/auth/google/callback`)
- Google **JavaScript origins**
- Supabase **Site URL** (recommended alignment)

Mixing apex in one place and `www` in another is a common source of cookie or redirect issues.

---

## 10. Auth sequence (step by step)

1. User opens `/login` (optional `?next=/dashboard/...`).
2. User clicks **Continue with Google** → `GET /api/auth/google?next=…`.
3. Posterr sets cookies `posterr_google_oauth_state` and `posterr_google_oauth_next`, redirects to Google’s authorize URL with `redirect_uri={SITE}/api/auth/google/callback`.
4. User signs in at Google; Google redirects to `/api/auth/google/callback?code=…&state=…`.
5. Posterr checks `state` against the cookie, exchanges `code` for `id_token` (and `access_token` when present) using `GOOGLE_CLIENT_SECRET` server-side only.
6. Posterr calls `signInWithIdToken` on Supabase; Supabase sets **session cookies** on the response.
7. OAuth helper cookies are cleared; browser redirects to `next` (default `/dashboard`).
8. Middleware runs on subsequent requests, refreshes the session via `getUser()`, and protects `/dashboard/*`.
9. `app/dashboard/layout.tsx` loads the user and `ensureProfile()` inserts a `profiles` row if missing.

---

## 11. Sessions and middleware

`lib/supabase/middleware.ts` creates a Supabase server client bound to the request/response cookies, calls `getUser()`, and **redirects to `/login?next=…`** if the path starts with `/dashboard` and there is no user.

Keep static assets excluded (already configured in `middleware.ts` `matcher`).

---

## 12. Data and RLS

After login, `auth.users` holds the Supabase user. `public.profiles.id` references `auth.users(id)`. RLS policies in `001_initial.sql` restrict reads/writes to `auth.uid()`.

If you see PostgREST errors about missing tables, the SQL migration was not applied to the project your env points at.

---

## 13. Troubleshooting (quick map)

| Symptom | Likely cause |
|---------|----------------|
| Google “invalid” / redirect errors | Redirect URI in Google is not **exactly** `{NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`, or `NEXT_PUBLIC_SITE_URL` does not match (scheme, `www`, trailing slash). |
| “Provider … not enabled” (Google issuer) | Supabase **Google** provider disabled or wrong project keys in Vercel. |
| Token exchange fails | Wrong `GOOGLE_CLIENT_SECRET`, wrong client, or redirect URI mismatch between authorize step and token POST. |
| Dashboard 500 / missing `profiles` | Migration not run on this Supabase project. |
| Login loop or no session | Cookie domain / `Secure` / SameSite; ensure production uses `https` and `NEXT_PUBLIC_SITE_URL` matches the browser’s origin. |

---

## 14. Security reminders

- Treat `GOOGLE_CLIENT_SECRET` like a password: Vercel env only, never in client code or public repos.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public by design; all sensitive data access must go through **RLS** and authenticated users.
- Rotate Google or Supabase keys if they leak; update Vercel and Supabase dashboard together.

---

## 15. Related files in this repo

- [README](../README.md) — install, condensed setup, scripts
- [supabase/migrations/001_initial.sql](../supabase/migrations/001_initial.sql) — schema + RLS
- [.env.local.example](../.env.local.example) — env names (safe to commit)

When in doubt, trace **one** login in DevTools: Network tab for `/api/auth/google` → Google → `/api/auth/google/callback` → final redirect to `next`.
