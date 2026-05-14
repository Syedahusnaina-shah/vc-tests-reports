const { test } = require('@playwright/test');
const path = require('path');

const BASE_URL    = 'https://vc.qa.impiricus.com';
const AGENT_ID    = '3631';
const VERSION_ID  = '1';
const CSV_PATH    = path.resolve(__dirname, 'f150_bulk_testing.csv');

async function login(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  if (page.url().includes('login') || page.url().includes('sign-in') ||
      (await page.locator('input[type="password"]').count()) > 0) {
    await page.fill('input[type="email"], input[name="email"]', 'Syeda.Husnaina@ssasoft.com');
    await page.fill('input[type="password"], input[name="password"]', 'Test123@');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1500);
  }
}

test('DIAGNOSTIC — what appears after Start Test click', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE_URL}/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Click Bulk testing tab
  const bulkTab = page.locator('text=Bulk testing').first();
  if (await bulkTab.isVisible().catch(() => false)) await bulkTab.click();
  await page.waitForTimeout(800);

  // Upload CSV
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CSV_PATH);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'diag/01_after_upload.png', fullPage: true });

  // Click Start Test
  await page.locator('button:has-text("Start Test")').first().click();
  await page.screenshot({ path: 'diag/02_after_click_0s.png', fullPage: true });

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'diag/03_after_3s.png', fullPage: true });

  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'diag/04_after_8s.png', fullPage: true });

  await page.waitForTimeout(7000);
  await page.screenshot({ path: 'diag/05_after_15s.png', fullPage: true });

  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'diag/06_after_25s.png', fullPage: true });

  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'diag/07_after_35s.png', fullPage: true });

  // Click View on the first (most recent) test result row
  const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
  const viewVisible = await viewBtn.isVisible().catch(() => false);
  if (viewVisible) {
    await viewBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'diag/08_after_view_click.png', fullPage: true });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'diag/09_after_view_5s.png', fullPage: true });
  }

  // Log all visible text
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT AT END:\n', bodyText.slice(0, 5000));
});
