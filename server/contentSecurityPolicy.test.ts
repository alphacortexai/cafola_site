import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function contentSecurityPolicy(): string {
  const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as {
    headers: Array<{ headers: Array<{ key: string; value: string }> }>;
  };
  const policy = vercel.headers
    .flatMap(group => group.headers)
    .find(header => header.key === "Content-Security-Policy");
  if (!policy) throw new Error("Content-Security-Policy header is missing");
  return policy.value;
}

function directive(policy: string, name: string): string {
  return (
    policy
      .split(";")
      .map(part => part.trim())
      .find(part => part === name || part.startsWith(`${name} `)) ?? ""
  );
}

describe("content security policy", () => {
  it("lets Firebase Auth load the Google sign-in script", () => {
    const scriptSrc = directive(contentSecurityPolicy(), "script-src");
    expect(scriptSrc).toContain("https://apis.google.com");
    expect(scriptSrc).toContain("https://www.gstatic.com");
    expect(scriptSrc).toContain("https://www.google.com");
  });

  it("lets the Firebase auth frame and Google account chooser open", () => {
    const frameSrc = directive(contentSecurityPolicy(), "frame-src");
    expect(frameSrc).toContain("https://cafolauganda.firebaseapp.com");
    expect(frameSrc).toContain("https://accounts.google.com");
    expect(frameSrc).toContain("https://apis.google.com");
  });

  it("keeps script loading limited to this site and named Google hosts", () => {
    const scriptSrc = directive(contentSecurityPolicy(), "script-src");
    expect(scriptSrc).not.toContain("*");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).not.toContain("https://evil.example");
  });
});
