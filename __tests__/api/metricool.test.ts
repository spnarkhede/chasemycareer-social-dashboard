// __tests__/api/metricool.test.ts
import { describe, it, expect, beforeAll } from "vitest";

describe("Metricool API", () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "password" }),
    });
    const data = await response.json();
    authToken = data.token;
  });

  it("should fetch analytics", async () => {
    const response = await fetch(
      "/api/metricool/analytics?startDate=2024-01-01&endDate=2024-01-31",
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("totals");
  });

  it("should create a post", async () => {
    const response = await fetch("/api/metricool/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caption: "Test post",
        platforms: ["LinkedIn"],
        type: "text",
        status: "draft",
      }),
    });
    expect(response.status).toBe(201);
  });
});