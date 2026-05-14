import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  exchangeGoogleAuthorizationCode,
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  safeNextPath,
  siteOrigin,
} from "@/lib/auth/google";

function clearOauthCookies(res: NextResponse) {
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  res.cookies.delete(GOOGLE_NEXT_COOKIE);
}

export async function GET(request: NextRequest) {
  const origin = siteOrigin();
  const q = request.nextUrl.searchParams;

  const oauthError = q.get("error");
  const oauthDesc = q.get("error_description");
  if (oauthError) {
    const msg = (oauthDesc ?? oauthError).replace(/\+/g, " ");
    const res = NextResponse.redirect(
      `${origin}/login?error=oauth&message=${encodeURIComponent(msg)}`,
    );
    clearOauthCookies(res);
    return res;
  }

  const code = q.get("code");
  const state = q.get("state");
  const cookieState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  const cookieNext = request.cookies.get(GOOGLE_NEXT_COOKIE)?.value;

  const failRedirect = (message: string) => {
    const res = NextResponse.redirect(
      `${origin}/login?error=auth&message=${encodeURIComponent(message)}`,
    );
    clearOauthCookies(res);
    return res;
  };

  if (!code || !state || !cookieState || state !== cookieState) {
    return failRedirect("Sign-in expired or invalid. Please try again.");
  }

  const next = safeNextPath(cookieNext);

  let idToken: string;
  let accessToken: string;
  try {
    const tokens = await exchangeGoogleAuthorizationCode(code);
    idToken = tokens.id_token;
    accessToken = tokens.access_token;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Google sign-in failed.";
    return failRedirect(msg);
  }

  const redirectUrl = `${origin}${next}`;
  const res = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
    ...(accessToken ? { access_token: accessToken } : {}),
  });

  clearOauthCookies(res);

  if (error) {
    return failRedirect(error.message);
  }

  return res;
}
