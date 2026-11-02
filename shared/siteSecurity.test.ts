import { describe, expect, it } from "vitest";
import { requireAdmin } from "../server/adminAuth";
import {
  parseContactSubmission,
  safeMediaUrl,
  safeWebsite,
  sanitizeSiteContent,
} from "./siteSecurity";

describe("safeMediaUrl", () => {
  it("keeps first-party and Firebase media", () => {
    expect(safeMediaUrl("/images/home-hero.webp")).toBe("/images/home-hero.webp");
    expect(
      safeMediaUrl(
        "https://firebasestorage.googleapis.com/v0/b/cafolauganda.firebasestorage.app/o/media%2Flogo.png?alt=media"
      )
    ).toContain("firebasestorage.googleapis.com");
  });

  it("drops builder CDNs and scriptable URLs", () => {
    expect(
      safeMediaUrl(
        "https://files.manuscdn.com/user_upload_by_module/session_file/310519663269964698/nXeqdbNLjMDKrnNe.jpg"
      )
    ).toBe("");
    expect(safeMediaUrl("javascript:alert(1)")).toBe("");
    expect(safeMediaUrl("https://evil.example/pixel.gif")).toBe("");
    expect(safeMediaUrl("data:text/html,<script>alert(1)</script>")).toBe("");
  });
});

describe("sanitizeSiteContent", () => {
  it("removes blocked media and upgrades the company website", () => {
    const sanitized = sanitizeSiteContent({
      website: "http://cafolauganda.com",
      homeImages: {
        hero: "/images/home-hero.webp",
        story: "https://files.manuscdn.com/story.jpg",
        caregivers: ["https://files.manuscdn.com/a.jpg", "/images/home-hero.webp"],
      },
      aboutUs: {
        description: "Care <script>alert(1)</script> notes",
      },
    });

    expect(sanitized.website).toBe("https://cafolauganda.com/");
    expect(sanitized.homeImages.story).toBe("");
    expect(sanitized.homeImages.caregivers).toEqual(["/images/home-hero.webp"]);
    expect(sanitized.aboutUs.description).not.toContain("<script");
  });
});

describe("parseContactSubmission", () => {
  it("rejects incomplete or script-like submissions", () => {
    expect(parseContactSubmission({ firstName: "A", email: "not-an-email" })).toBeNull();
    const parsed = parseContactSubmission({
      firstName: "Amina",
      email: "amina@example.com",
      message: "Hello <script>alert(1)</script>",
      source: "home-talk-to-us",
    });
    expect(parsed?.email).toBe("amina@example.com");
    expect(parsed?.message).not.toContain("<script");
  });
});

describe("safeWebsite", () => {
  it("refuses off-site website values", () => {
    expect(safeWebsite("https://attacker.example")).toBe("https://www.cafolauganda.com");
  });
});

describe("requireAdmin", () => {
  it("rejects anonymous requests even when no admin token is configured", async () => {
    const previous = process.env.ADMIN_TOKEN;
    delete process.env.ADMIN_TOKEN;
    const decision = await requireAdmin({ headers: {} });
    if (previous) process.env.ADMIN_TOKEN = previous;
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.status).toBe(401);
  });
});
