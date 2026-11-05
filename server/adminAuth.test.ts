import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { staffEmails, isAdminEmail } from "../shared/adminEmails";
import { requireAdmin } from "./adminAuth";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.ADMIN_TOKEN;
  delete process.env.FIREBASE_API_KEY;
});

function googleUser(email: string, emailVerified = true) {
  process.env.FIREBASE_API_KEY = "test-key";
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ users: [{ email, emailVerified }] }), { status: 200 });
  return requireAdmin({
    headers: { authorization: `Bearer ${"a".repeat(40)}` },
  });
}

describe("isAdminEmail", () => {
  it("accepts only the staff addresses, ignoring case and surrounding space", () => {
    expect(isAdminEmail("  AlphaCortexAI@gmail.com ")).toBe(true);
    expect(isAdminEmail("someone.else@gmail.com")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });
});

describe("requireAdmin", () => {
  it("rejects a verified Gmail account that is not staff", async () => {
    const decision = await googleUser("visitor@gmail.com");
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.status).toBe(403);
  });

  it("accepts a verified staff Gmail account", async () => {
    const decision = await googleUser(staffEmails[0]);
    expect(decision.ok).toBe(true);
    if (decision.ok) expect(decision.email).toBe(staffEmails[0]);
  });

  it("rejects an unverified staff account", async () => {
    const decision = await googleUser(staffEmails[0], false);
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.status).toBe(401);
  });
});

describe("firebase rules", () => {
  it("names every staff address in Firestore and Storage rules", () => {
    const firestore = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
    const storage = readFileSync(new URL("../storage.rules", import.meta.url), "utf8");
    for (const email of staffEmails) {
      expect(firestore).toContain(`"${email}"`);
      expect(storage).toContain(`"${email}"`);
    }
    expect(firestore).not.toContain("allow write: if signedIn()");
    expect(storage).not.toContain("allow write: if request.auth != null");
  });
});
