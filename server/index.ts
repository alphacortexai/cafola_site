import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { defaultSiteContent, type SiteContent } from "../shared/cms";
import { mkdir, readFile, writeFile } from "fs/promises";
import {
  createFirestoreDocument,
  listFirestoreCollection,
  readFirestoreDocument,
  writeFirestoreDocument,
} from "./firebase";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "data");
const cmsFile = path.join(dataDir, "cms.json");
const contactsFile = path.join(dataDir, "contact-submissions.json");

type ContactSubmission = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  createdAt: string;
};

async function ensureCmsFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(cmsFile, "utf-8");
  } catch {
    await writeFile(cmsFile, JSON.stringify(defaultSiteContent, null, 2));
  }
}

async function ensureContactFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(contactsFile, "utf-8");
  } catch {
    await writeFile(contactsFile, JSON.stringify([], null, 2));
  }
}

function isAdminRequest(req: express.Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return true;
  return req.header("x-admin-token") === adminToken;
}

async function readContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const remote = await listFirestoreCollection<ContactSubmission>(
      "contactSubmissions",
      {
        pageSize: 200,
        orderBy: "createdAt desc",
      }
    );
    if (remote) {
      return remote;
    }
  } catch {
    // Fallback to local JSON file
  }

  try {
    const raw = await readFile(contactsFile, "utf-8");
    const parsed = JSON.parse(raw) as ContactSubmission[];
    return parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

async function saveContactSubmission(payload: ContactSubmission) {
  try {
    const created = await createFirestoreDocument(
      "contactSubmissions",
      payload
    );
    if (created) {
      return;
    }
  } catch {
    // Fallback to local JSON file
  }

  const current = await readContactSubmissions();
  await writeFile(contactsFile, JSON.stringify([payload, ...current], null, 2));
}

async function readCmsContent(): Promise<SiteContent> {
  try {
    const remoteContent =
      await readFirestoreDocument<SiteContent>("cms/siteContent");
    if (remoteContent) {
      return { ...defaultSiteContent, ...remoteContent };
    }
  } catch {
    // Fallback to file-based CMS
  }

  try {
    const raw = await readFile(cmsFile, "utf-8");
    return { ...defaultSiteContent, ...JSON.parse(raw) };
  } catch {
    return defaultSiteContent;
  }
}

async function saveCmsContent(content: SiteContent) {
  try {
    const wroteToFirebase = await writeFirestoreDocument("cms/siteContent", {
      ...content,
      updatedAt: new Date().toISOString(),
    });
    if (wroteToFirebase) {
      return;
    }
  } catch {
    // Fallback to file-based CMS
  }

  await writeFile(cmsFile, JSON.stringify(content, null, 2));
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  await ensureCmsFile();
  await ensureContactFile();

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/cms", async (_req, res) => {
    const content = await readCmsContent();
    res.json(content);
  });

  app.put("/api/cms", async (req, res) => {
    const nextContent = req.body as SiteContent;

    if (!nextContent || typeof nextContent !== "object") {
      return res.status(400).json({ error: "Invalid CMS payload." });
    }

    await saveCmsContent({ ...defaultSiteContent, ...nextContent });
    return res.status(204).send();
  });

  app.post("/api/contact", async (req, res) => {
    const payload = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      message?: string;
      source?: string;
    };

    if (!payload?.firstName || !payload?.email) {
      return res
        .status(400)
        .json({ error: "firstName and email are required." });
    }

    await saveContactSubmission({
      firstName: payload.firstName.trim(),
      lastName: payload.lastName?.trim() ?? "",
      email: payload.email.trim(),
      phone: payload.phone?.trim() ?? "",
      message: payload.message?.trim() ?? "",
      source: payload.source?.trim() ?? "unknown",
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ ok: true });
  });

  app.get("/api/contact", async (req, res) => {
    if (!isAdminRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const submissions = await readContactSubmissions();
    return res.json(submissions);
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
