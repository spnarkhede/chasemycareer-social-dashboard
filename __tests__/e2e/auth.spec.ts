// __tests__/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signin");
  });

  test("should display sign in form", async ({ page }) => {
    await expect(page).toHaveTitle(/Sign In/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation errors", async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid email")).toBeVisible();
  });

  test("should sign in successfully", async ({ page }) => {
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should redirect to sign in when accessing protected route", async ({ page }) => {
    await page.goto("/dashboard/posts");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });
});

test.describe("Post Management", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in first
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("should create a new post", async ({ page }) => {
    await page.goto("/dashboard/posts");
    await page.click("text=Add New Post");
    
    await page.fill('textarea[name="caption"]', "Test post content");
    await page.check('input[id="LinkedIn"]');
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=Test post content")).toBeVisible();
  });
});