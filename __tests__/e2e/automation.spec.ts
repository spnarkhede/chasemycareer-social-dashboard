// __tests__/e2e/automation.spec.ts
import { test, expect } from '@playwright/test';

test('Complete automation flow', async ({ page }) => {
  await page.goto('/auth/signin');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.goto('/dashboard/automation/rules');
  await page.click('text=New Rule');
  // ... complete flow
});