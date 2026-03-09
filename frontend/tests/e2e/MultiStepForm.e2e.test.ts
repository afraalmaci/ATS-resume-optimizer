import { test, expect } from '@playwright/test';

test.describe('MultiStepForm E2E Tests', () => {
  test('should complete the multi-step form', async ({ page }) => {
    await page.goto('http://localhost:3001/test-form'); // sayfanın URL’i

    // Adım 1
    await expect(page.locator('text=Multi-Step Form Test')).toBeVisible();
    await page.click('text=Next');

    // Adım 2
    await expect(page.locator('text=Multi-Step Form Test')).toBeVisible();
    await page.click('text=Next');

    // Adım 3
    await expect(page.locator('text=Multi-Step Form Test')).toBeVisible();
    await page.click('text=Finish');

    // Toast veya console çıktısını kontrol etmek istersen mock ekleyebilirsin
    // Playwright direkt toast text görünürlüğünü test edebilir
    await expect(page.locator('text=Form successfully submitted!')).toBeVisible();
  });
});