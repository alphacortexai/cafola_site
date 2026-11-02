import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { defaultSiteContent, type SiteContent } from "../shared/cms";
import {
  parseContactSubmission,
  privateApiHeaders,
  sanitizeSiteContent,
} from "../shared/siteSecurity";
import { requireAdmin } from "./adminAuth";
import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync, readFileSync } from "fs";
import {
  createFirestoreDocument,
  listFirestoreCollection,
  readFirestoreDocument,
  writeFirestoreDocument,
} from "./firebase";

function loadDotenvFile() {
  const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (!existsSync(envPath)) return;

  const contents = readFileSync(envPath, "utf-8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotenvFile();

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

function applyPrivateHeaders(res: express.Response) {
  for (const [name, value] of Object.entries(privateApiHeaders())) {
    res.setHeader(name, value);
  }
}

async function readContactSubmissions(idToken?: string): Promise<ContactSubmission[]> {
  try {
    const remote = await listFirestoreCollection<ContactSubmission>(
      "contactSubmissions",
      {
        pageSize: 200,
        orderBy: "createdAt desc",
        idToken,
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
      return sanitizeSiteContent({ ...defaultSiteContent, ...remoteContent });
    }
  } catch {
    // Fallback to file-based CMS
  }

  try {
    const raw = await readFile(cmsFile, "utf-8");
    return sanitizeSiteContent({ ...defaultSiteContent, ...JSON.parse(raw) });
  } catch {
    return sanitizeSiteContent(defaultSiteContent);
  }
}

async function saveCmsContent(content: SiteContent, idToken?: string) {
  const sanitized = sanitizeSiteContent({
    ...content,
    updatedAt: new Date().toISOString(),
  });
  try {
    const wroteToFirebase = await writeFirestoreDocument(
      "cms/siteContent",
      sanitized,
      idToken
    );
    if (wroteToFirebase) {
      return;
    }
  } catch {
    // Fallback to file-based CMS
  }

  await writeFile(cmsFile, JSON.stringify(sanitized, null, 2));
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  await ensureCmsFile();
  await ensureContactFile();

  app.use(express.json({ limit: "100kb" }));
  app.use("/api", (_req, res, next) => {
    applyPrivateHeaders(res);
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/cms", async (_req, res) => {
    const content = await readCmsContent();
    res.json(content);
  });

  app.put("/api/cms", async (req, res) => {
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      return res.status(admin.status).json({ error: admin.error });
    }

    const nextContent = req.body as SiteContent;

    if (!nextContent || typeof nextContent !== "object" || Array.isArray(nextContent)) {
      return res.status(400).json({ error: "Invalid CMS payload." });
    }

    await saveCmsContent({ ...defaultSiteContent, ...nextContent }, admin.idToken);
    return res.status(204).send();
  });

  app.post("/api/contact", async (req, res) => {
    const payload = parseContactSubmission(req.body ?? {});

    if (!payload) {
      return res.status(400).json({ error: "A name and valid email are required." });
    }

    await saveContactSubmission(payload);
    return res.status(201).json({ ok: true });
  });

  app.get("/api/contact", async (req, res) => {
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      return res.status(admin.status).json({ error: admin.error });
    }

    const submissions = await readContactSubmissions(admin.idToken);
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

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
