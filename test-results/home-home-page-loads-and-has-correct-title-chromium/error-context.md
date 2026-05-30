# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> home page loads and has correct title
- Location: e2e\tests\home.spec.ts:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4200/
Call log:
  - navigating to "http://127.0.0.1:4200/", waiting until "load"

```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 | 
  3 | test('home page loads and has correct title', async ({ page }) => {
> 4 |   const response = await page.goto('/');
    |                               ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4200/
  5 |   // A successful navigation should return a response with status < 400
  6 |   expect(response && response.status() < 400).toBeTruthy();
  7 |   await expect(page).toHaveTitle('Nebula');
  8 | });
  9 | 
```