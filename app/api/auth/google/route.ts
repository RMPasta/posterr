import { NextResponse } from "next/server";

import {
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  googleAuthorizeUrl,
  oauthCookieOptions,
  randomOAuthState,
  safeNextPath,
} from "@/lib/auth/google";

export function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const next = safeNextPath(searchParams.get("next"));
    const state = randomOAuthState();
    const googleUrl = googleAuthorizeUrl(state);
    const res = NextResponse.redirect(googleUrl);
    const opts = oauthCookieOptions();
    res.cookies.set(GOOGLE_STATE_COOKIE, state, opts);
    res.cookies.set(GOOGLE_NEXT_COOKIE, next, opts);
    return res;
  } catch {
    const fallback = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    return NextResponse.redirect(
      `${fallback}/login?error=oauth&message=${encodeURIComponent("Sign-in is not configured (check GOOGLE_CLIENT_ID and NEXT_PUBLIC_SITE_URL).")}`,
    );
  }
}
