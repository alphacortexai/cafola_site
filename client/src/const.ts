export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//;

function normalizeOAuthPortalUrl(rawValue: string | undefined) {
  const value = rawValue?.trim();
  if (!value) return null;

  if (ABSOLUTE_URL_RE.test(value)) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (value.startsWith("/")) {
    return `${window.location.origin}${value}`;
  }

  return `https://${value}`;
}

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = normalizeOAuthPortalUrl(
    import.meta.env.VITE_OAUTH_PORTAL_URL
  );
  const appId = import.meta.env.VITE_APP_ID?.trim();
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  // The auth portal requires both its base URL and an appId to resolve
  // the Google OAuth client configuration for this application.
  if (!oauthPortalUrl || !appId) return "";

  const url = new URL("/app-auth", oauthPortalUrl);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
