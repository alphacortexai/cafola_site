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

const FIREBASE_WEB_APP_ID_RE = /^\d+:\d+:web:[a-z0-9]+$/i;

export const getLoginConfigIssue = () => {
  const oauthPortalUrl = normalizeOAuthPortalUrl(
    import.meta.env.VITE_OAUTH_PORTAL_URL
  );
  const appId = import.meta.env.VITE_APP_ID?.trim();

  if (!oauthPortalUrl || !appId) {
    return "Missing VITE_OAUTH_PORTAL_URL or VITE_APP_ID.";
  }

  if (FIREBASE_WEB_APP_ID_RE.test(appId)) {
    return "VITE_APP_ID appears to be a Firebase appId. Use the OAuth portal app ID instead.";
  }

  return null;
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = normalizeOAuthPortalUrl(
    import.meta.env.VITE_OAUTH_PORTAL_URL
  );
  const appId = import.meta.env.VITE_APP_ID?.trim();
  const redirectUri = `${window.location.origin}/__/auth/handler`;
  const state = btoa(redirectUri);

  // The auth portal requires both its base URL and an appId to resolve
  // the Google OAuth client configuration for this application.
  if (getLoginConfigIssue() || !oauthPortalUrl || !appId) return "";

  const url = new URL("/app-auth", oauthPortalUrl);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
