const STATE_COOKIE = "posterr_google_oauth_state";
const NEXT_COOKIE = "posterr_google_oauth_next";

export { NEXT_COOKIE as GOOGLE_NEXT_COOKIE, STATE_COOKIE as GOOGLE_STATE_COOKIE };

export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set.");
  }
  return raw.replace(/\/$/, "");
}

export function googleRedirectUri(): string {
  return `${siteOrigin()}/api/auth/google/callback`;
}

export function safeNextPath(raw: string | null | undefined): string {
  const next = (raw ?? "/dashboard").trim();
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export function oauthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
}

export function randomOAuthState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function googleAuthorizeUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not set.");
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleAuthorizationCode(code: string): Promise<{
  id_token: string;
  access_token: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.");
  }
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: googleRedirectUri(),
    grant_type: "authorization_code",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    await res.text();
    throw new Error(`Google token exchange failed (${res.status}).`);
  }
  const json = (await res.json()) as {
    id_token?: string;
    access_token?: string;
  };
  if (!json.id_token) {
    throw new Error("Google did not return an id_token.");
  }
  return {
    id_token: json.id_token,
    access_token: json.access_token ?? "",
  };
}
