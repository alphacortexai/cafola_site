import {
  createFirestoreDocument,
  listFirestoreCollection,
} from "../server/firebase.js";
import { requireAdmin } from "../server/adminAuth.js";
import {
  parseContactSubmission,
  privateApiHeaders,
  type ContactInput,
} from "../shared/siteSecurity.js";

type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  send: (body?: unknown) => void;
  setHeader: (name: string, value: string) => void;
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

function applyPrivateHeaders(res: VercelResponse) {
  for (const [name, value] of Object.entries(privateApiHeaders())) {
    res.setHeader(name, value);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyPrivateHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  if (req.method === "GET") {
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      return res.status(admin.status).json({ error: admin.error });
    }

    const submissions =
      (await listFirestoreCollection<Record<string, unknown>>("contactSubmissions", {
        pageSize: 200,
        orderBy: "createdAt desc",
        idToken: admin.idToken,
      })) ?? [];

    return res.status(200).json(submissions);
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = parseContactSubmission(parseBody<ContactInput>(req.body) ?? {});

  if (!payload) {
    return res.status(400).json({ error: "A name and valid email are required." });
  }

  const created = await createFirestoreDocument("contactSubmissions", payload);

  if (!created) {
    return res.status(500).json({ error: "Firebase is not configured on the server." });
  }

  return res.status(201).json({ ok: true });
}
