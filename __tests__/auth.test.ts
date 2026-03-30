// __tests__/auth.test.ts
import { describe, it, expect } from "vitest";

describe("Authentication", () => {
  it("should redirect unauthenticated users to signin", async () => {
    const response = await fetch("/dashboard", { redirect: "manual" });
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/signin");
  });

  it("should return 401 for protected API without auth", async () => {
    const response = await fetch("/api/posts");
    expect(response.status).toBe(401);
  });
});