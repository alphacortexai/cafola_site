import { createFirestoreDocument } from "../server/firebase";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send();
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
    return res.status(500).json({ error: "Firebase is not configured on the server." });
  }

  return res.status(201).json({ ok: true });
}
