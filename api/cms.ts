import { defaultSiteContent, type SiteContent } from "../shared/cms.js";
import { privateApiHeaders, sanitizeSiteContent } from "../shared/siteSecurity.js";
import { requireAdmin } from "../server/adminAuth.js";
import { readFirestoreDocument, writeFirestoreDocument } from "../server/firebase.js";

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
    try {
      const remoteContent = await readFirestoreDocument<SiteContent>("cms/siteContent");
      return res
        .status(200)
        .json(sanitizeSiteContent({ ...defaultSiteContent, ...(remoteContent ?? {}) }));
    } catch {
      return res.status(200).json(sanitizeSiteContent(defaultSiteContent));
    }
  }

  if (req.method === "PUT") {
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      return res.status(admin.status).json({ error: admin.error });
    }

    const nextContent = parseBody<SiteContent>(req.body);

    if (!nextContent || typeof nextContent !== "object" || Array.isArray(nextContent)) {
      return res.status(400).json({ error: "Invalid CMS payload." });
    }

    const sanitized = sanitizeSiteContent({
      ...defaultSiteContent,
      ...nextContent,
      updatedAt: new Date().toISOString(),
    });

    try {
      const wroteToFirebase = await writeFirestoreDocument(
        "cms/siteContent",
        sanitized,
        admin.idToken
      );

      if (!wroteToFirebase) {
        return res.status(500).json({ error: "Firebase is not configured on the server." });
      }

      return res.status(204).send();
    } catch {
      return res.status(500).json({ error: "Could not save CMS content." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
