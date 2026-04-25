import { defaultSiteContent, type SiteContent } from "../shared/cms.js";
import { readFirestoreDocument, writeFirestoreDocument } from "../server/firebase.js";

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
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  if (req.method === "GET") {
    try {
      const remoteContent = await readFirestoreDocument<SiteContent>("cms/siteContent");
      return res.status(200).json({ ...defaultSiteContent, ...(remoteContent ?? {}) });
    } catch {
      return res.status(200).json(defaultSiteContent);
    }
  }

  if (req.method === "PUT") {
    const nextContent = parseBody<SiteContent>(req.body);

    if (!nextContent || typeof nextContent !== "object") {
      return res.status(400).json({ error: "Invalid CMS payload." });
    }

    try {
      const wroteToFirebase = await writeFirestoreDocument("cms/siteContent", {
        ...defaultSiteContent,
        ...nextContent,
        updatedAt: new Date().toISOString(),
      });

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
