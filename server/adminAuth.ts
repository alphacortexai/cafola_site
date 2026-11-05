import { isAdminEmail } from "../shared/adminEmails";

type HeaderValue = string | string[] | undefined;

export type HeaderSource = {
  headers?: Record<string, HeaderValue> | { get?: (name: string) => string | null };
  header?: (name: string) => string | undefined;
};

export type AdminDecision =
  | { ok: true; idToken?: string; email?: string }
  | { ok: false; status: number; error: string };

function headerValue(req: HeaderSource, name: string): string | undefined {
  const fromExpress = req.header?.(name) ?? req.header?.(name.toLowerCase());
  if (fromExpress) return fromExpress;

  const headers = req.headers;
  if (!headers) return undefined;
  if (typeof (headers as { get?: (name: string) => string | null }).get === "function") {
    return (headers as { get: (name: string) => string | null }).get(name) ?? undefined;
  }

  const record = headers as Record<string, HeaderValue>;
  const raw = record[name] ?? record[name.toLowerCase()];
  return Array.isArray(raw) ? raw[0] : raw;
}

function tokensMatch(presented: string, expected: string): boolean {
  if (presented.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < presented.length; index += 1) {
    mismatch |= presented.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

function firebaseApiKey(): string {
  return (process.env.FIREBASE_API_KEY ?? process.env.VITE_FIREBASE_API_KEY ?? "").trim();
}

async function lookupFirebaseUser(
  idToken: string
): Promise<{ email?: string; emailVerified?: boolean } | null> {
  const apiKey = firebaseApiKey();
  if (!apiKey || idToken.length < 20 || idToken.length > 8192) return null;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!response.ok) return null;

  const body = (await response.json()) as {
    users?: Array<{ email?: string; emailVerified?: boolean }>;
  };
  return body.users?.[0] ?? null;
}

export async function requireAdmin(req: HeaderSource): Promise<AdminDecision> {
  const configuredToken = process.env.ADMIN_TOKEN?.trim();
  const presentedToken = headerValue(req, "x-admin-token")?.trim();
  if (configuredToken && presentedToken && tokensMatch(presentedToken, configuredToken)) {
    return { ok: true };
  }

  const authorization = headerValue(req, "authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  const idToken = match?.[1];
  if (!idToken) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const user = await lookupFirebaseUser(idToken);
  if (!user?.email || user.emailVerified === false) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  if (!isAdminEmail(user.email)) {
    return { ok: false, status: 403, error: "This Google account is not a CAFOLA admin." };
  }

  return { ok: true, idToken, email: user.email };
}
