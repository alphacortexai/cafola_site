import {
  createFirestoreDocument,
  listFirestoreCollection,
} from "../server/firebase.js";

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  send: (body?: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

type ContactPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
};

function parseBody<T>(body: unknown): T | null {
  if (!body) return null;
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as T;
    } catch {
      return null;
    }
  }
  if (typeof body === "object") {
    return body as T;
  }
  return null;
}

function isAdminRequest(req: VercelRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return true;

  const tokenFromHeader = (
    req as { headers?: Record<string, string | string[] | undefined> }
  ).headers?.["x-admin-token"];
  const normalizedToken = Array.isArray(tokenFromHeader)
    ? tokenFromHeader[0]
    : tokenFromHeader;
  return normalizedToken === adminToken;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Admin-Token");

  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  if (req.method === "GET") {
    if (!isAdminRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const submissions =
      (await listFirestoreCollection<ContactPayload & { createdAt?: string }>(
        "contactSubmissions",
        {
          pageSize: 200,
          orderBy: "createdAt desc",
        }
      )) ?? [];

    return res.status(200).json(submissions);
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = parseBody<ContactPayload>(req.body);

  if (!payload?.firstName || !payload?.email) {
    return res.status(400).json({ error: "firstName and email are required." });
  }

  const created = await createFirestoreDocument("contactSubmissions", {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName?.trim() ?? "",
    email: payload.email.trim(),
    phone: payload.phone?.trim() ?? "",
    message: payload.message?.trim() ?? "",
    source: payload.source?.trim() ?? "unknown",
    createdAt: new Date().toISOString(),
  });

  if (!created) {
    return res
      .status(500)
      .json({ error: "Firebase is not configured on the server." });
  }

  return res.status(201).json({ ok: true });
}
