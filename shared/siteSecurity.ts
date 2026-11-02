const ALLOWED_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "cafolauganda.com",
  "www.cafolauganda.com",
  "i.ytimg.com",
  "img.youtube.com",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "player.vimeo.com",
]);

const MEDIA_KEYS = new Set([
  "logoUrl",
  "imageUrl",
  "heroImageUrl",
  "url",
  "servicePageDefaultImageUrl",
  "hero",
  "story",
]);

const MARKUP_TAG =
  /<\s*\/?\s*(script|iframe|object|embed|link|meta|base|form|svg)\b[^>]*>/gi;
const INLINE_HANDLER = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL = /javascript\s*:/gi;

export function safeMediaUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2000) return "";
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("\\") &&
    !/[\s<>"'`]/.test(trimmed)
  ) {
    return trimmed;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return "";
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return "";
  if (url.username || url.password) return "";

  const host = url.hostname.toLowerCase();
  if (host.includes("manus")) return "";

  const allowed =
    ALLOWED_HOSTS.has(host) || host.endsWith(".firebasestorage.app");
  if (!allowed) return "";

  if (
    url.protocol === "http:" &&
    (host === "cafolauganda.com" || host === "www.cafolauganda.com")
  ) {
    url.protocol = "https:";
  }

  return url.toString();
}

export function safeWebsite(value: unknown): string {
  const fallback = "https://www.cafolauganda.com";
  const url = safeMediaUrl(typeof value === "string" ? value : "");
  if (!url) return fallback;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === "cafolauganda.com" || host === "www.cafolauganda.com") {
      return url;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export function stripDangerousMarkup(value: string): string {
  return value.replace(MARKUP_TAG, "").replace(INLINE_HANDLER, "").replace(JS_URL, "");
}

function sanitizeNode(value: unknown, key: string): unknown {
  if (Array.isArray(value)) {
    if (key === "caregivers") {
      return value.map(item => safeMediaUrl(item)).filter(Boolean);
    }
    return value.map(item => sanitizeNode(item, key));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<
      Record<string, unknown>
    >((acc, [childKey, childValue]) => {
      acc[childKey] = sanitizeNode(childValue, childKey);
      return acc;
    }, {});
  }

  if (typeof value !== "string") return value;
  if (key === "website") return safeWebsite(value);
  if (MEDIA_KEYS.has(key)) return safeMediaUrl(value);
  return stripDangerousMarkup(value);
}

export function sanitizeSiteContent<T>(content: T): T {
  return sanitizeNode(content, "") as T;
}

export type ContactInput = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  source?: unknown;
};

export type CleanContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  createdAt: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return stripDangerousMarkup(value).trim().slice(0, max);
}

export function parseContactSubmission(input: ContactInput): CleanContact | null {
  const firstName = cleanText(input.firstName, 80);
  const email = cleanText(input.email, 160).toLowerCase();
  if (!firstName || !EMAIL_PATTERN.test(email)) return null;

  return {
    firstName,
    lastName: cleanText(input.lastName, 80),
    email,
    phone: cleanText(input.phone, 40),
    message: cleanText(input.message, 4000),
    source: cleanText(input.source, 80) || "unknown",
    createdAt: new Date().toISOString(),
  };
}

export function privateApiHeaders(): Record<string, string> {
  return {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
  };
}
