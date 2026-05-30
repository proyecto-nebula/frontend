import { test, expect } from '@playwright/test';

test('home page loads and has correct title', async ({ page }) => {
  const response = await page.goto('/');
  // A successful navigation should return a response with status < 400
  expect(response && response.status() < 400).toBeTruthy();
  await expect(page).toHaveTitle('Nebula');
});
