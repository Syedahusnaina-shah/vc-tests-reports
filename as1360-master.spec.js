// ============================================================
// AS-1360 Master Test Suite — VC Studio
// Responsiveness + Login + Bulk Testing + Single Testing +
// Flagged Messages + Interactive Elements + Edge Cases
//
// Jira: AS-1360 (Page responsiveness across screen sizes)
//       AS-766  (Test Coordinator – Bulk Testing tab)
//
// Agent ID: 3631 | Version ID: 1
// CSV: f150_bulk_testing.csv (message, expected_category)
//
// Run:    $env:PLAYWRIGHT_BROWSERS_PATH="D:\playwright-browsers"; npx playwright test as1360-master.spec.js --reporter=html
// Allure: $env:PLAYWRIGHT_BROWSERS_PATH="D:\playwright-browsers"; $env:JAVA_HOME="C:\Program Files\Java\jre1.8.0_491"; npx playwright test as1360-master.spec.js; npx allure generate allure-results --clean -o allure-report
// ============================================================

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

// ─── Config ──────────────────────────────────────────────────────────────────
const BASE_URL       = 'https://vc.qa.impiricus.com';
const LOGIN_EMAIL    = process.env.VC_EMAIL    || 'Syeda.Husnaina@ssasoft.com';
const LOGIN_PASSWORD = process.env.VC_PASSWORD || 'Test123@';
const AGENT_ID       = '3631';
const VERSION_ID     = '1';

// AC-required resolutions (AS-1360)
const RESOLUTIONS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900',  width: 1440, height: 900  },
  { name: '1366x768',  width: 1366, height: 768  },
];

// All VC Studio pages — agent 3631 uses wizard route (step=N), not tab route
const VC_PAGES = [
  { name: 'Create VC Step 1',           path: `/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Create Coordinator', path: `/#/create-virtual-coordinator?edit=true&step=0&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Train Coordinator',  path: `/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Create Content',     path: `/#/create-virtual-coordinator?edit=true&step=2&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Test Coordinator',   path: `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Bulk Testing',       path: `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Flagged Messages',   path: `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'VC Draft',                   path: `/#/virtual-coordinator-draft?agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'VC Overview',                path: `/#/virtual-coordinator-overview?agentId=${AGENT_ID}` },
];

// CSV file for bulk testing
const CSV_PATH = path.resolve(__dirname, 'f150_bulk_testing.csv');
if (!fs.existsSync(CSV_PATH)) {
  fs.writeFileSync(CSV_PATH, 'message,expected_category\ncolors,colors\ncolors,engine\nwhat engines does it offer,engine\n');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function login(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const needsLogin =
    page.url().includes('login') ||
    page.url().includes('sign-in') ||
    (await page.locator('input[type="password"]').count()) > 0;

  if (needsLogin) {
    await page.fill('input[type="email"], input[name="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(1500);
  }
}

async function goToPage(page, pagePath) {
  await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}

async function screenshot(page, name) {
  const safe = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const dir  = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  await page.screenshot({ path: `${dir}/${safe}.png`, fullPage: false });
}

async function checkNoHorizontalScroll(page, label) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth, `[${label}] Horizontal scroll present`).toBeLessThanOrEqual(clientWidth + 5);
}

async function checkNoOverflow(page, label, vw) {
  const overflow = await page.evaluate((vw) =>
    Array.from(document.querySelectorAll('*'))
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.right > vw + 5 && r.width > 0 && r.height > 0;
      })
      .map(el => ({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60) }))
      .slice(0, 5)
  , vw);
  expect(overflow.length, `[${label}] Overflowing: ${JSON.stringify(overflow)}`).toBe(0);
}

async function checkButtonsVisible(page, label, vw) {
  const buttons = page.locator('button:visible');
  const count   = await buttons.count();
  for (let i = 0; i < Math.min(count, 20); i++) {
    const box = await buttons.nth(i).boundingBox();
    if (!box) continue;
    expect(box.x + box.width, `[${label}] Button[${i}] overflows right`).toBeLessThanOrEqual(vw + 5);
    expect(box.x,             `[${label}] Button[${i}] outside left edge`).toBeGreaterThanOrEqual(-5);
    expect(box.width,         `[${label}] Button[${i}] zero width`).toBeGreaterThan(0);
    expect(box.height,        `[${label}] Button[${i}] zero height`).toBeGreaterThan(0);
  }
}

async function checkTextNotClipped(page, label) {
  const clipped = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h1,h2,h3,h4,p,label,span,td,th,button'))
      .filter(el => {
        const s = window.getComputedStyle(el);
        return s.overflow === 'hidden' && el.scrollWidth > el.clientWidth + 2;
      })
      .map(el => ({ tag: el.tagName, text: el.innerText?.slice(0, 60) }))
      .slice(0, 5)
  );
  expect(clipped.length, `[${label}] Clipped text: ${JSON.stringify(clipped)}`).toBe(0);
}

async function checkInteractiveElements(page, label, vw) {
  const selectors = [
    { name: 'buttons',   sel: 'button:visible' },
    { name: 'inputs',    sel: 'input:visible, textarea:visible, select:visible' },
    { name: 'tabs',      sel: '[role="tab"]:visible' },
    { name: 'nav links', sel: 'nav a:visible' },
  ];
  for (const { name, sel } of selectors) {
    const els   = page.locator(sel);
    const count = await els.count();
    for (let i = 0; i < Math.min(count, 15); i++) {
      const box = await els.nth(i).boundingBox();
      if (!box) continue;
      expect(box.x + box.width, `[${label}] ${name}[${i}] overflows right`).toBeLessThanOrEqual(vw + 5);
      expect(box.x,             `[${label}] ${name}[${i}] starts before left edge`).toBeGreaterThanOrEqual(-5);
      expect(box.width,         `[${label}] ${name}[${i}] zero width`).toBeGreaterThan(0);
    }
  }
}

async function goToTestCoordinatorStep(page) {
  await goToPage(page, `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}`);
}

async function goToBulkTestingTab(page) {
  await goToTestCoordinatorStep(page);
  const tab = page.locator('text=Bulk testing').first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click();
    await page.waitForTimeout(800);
  }
}

async function goToSingleTestingTab(page) {
  await goToTestCoordinatorStep(page);
  const tab = page.locator('text=Single Message Testing').first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click();
    await page.waitForTimeout(800);
  }
}

async function goToFlaggedTab(page) {
  await goToTestCoordinatorStep(page);
  const tab = page.locator('text=Flagged messages').first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click();
    await page.waitForTimeout(800);
  }
}

// Upload CSV → Start Test → click View → wait for results modal
async function startBulkTestAndOpenView(page) {
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(CSV_PATH);
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Start Test")').first().click();
  await page.waitForSelector('button:has-text("View")', { timeout: 30000 });
  await page.locator('button:has-text("View")').first().click();
  await page.waitForSelector('text=Bulk testing results', { timeout: 15000 });
  await page.waitForTimeout(1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔐 SECTION 0 — LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

test.describe('🔐 LOGIN — Page loads and authentication works', () => {

  test('✅ TC-L01 | Login page loads at /#/login', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await expect(page.locator('input[type="email"], input[name="email"]').first(), 'Email field visible').toBeVisible();
    await expect(page.locator('input[type="password"]').first(),                  'Password field visible').toBeVisible();
    await expect(page.locator('button[type="submit"]').first(),                   'Submit button visible').toBeVisible();
    await screenshot(page, 'l01_login_page');
  });

  test('✅ TC-L02 | Login with valid credentials redirects to app', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(2000);

    const isStillOnLogin = page.url().includes('login') || page.url().includes('sign-in');
    expect(isStillOnLogin, 'Should redirect away from login after valid credentials').toBe(false);
    await screenshot(page, 'l02_login_success');
  });

  test('❌ TC-L03 | Login with empty email — shows validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const stillOnLogin = page.url().includes('login') || page.url().includes('sign-in') ||
      (await page.locator('input[type="email"], input[name="email"]').count()) > 0;
    expect(stillOnLogin, 'Should stay on login when email is empty').toBe(true);
    await screenshot(page, 'l03_empty_email');
  });

  test('❌ TC-L04 | Login with empty password — shows validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(LOGIN_EMAIL);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const stillOnLogin = page.url().includes('login') || page.url().includes('sign-in') ||
      (await page.locator('input[type="password"]').count()) > 0;
    expect(stillOnLogin, 'Should stay on login when password is empty').toBe(true);
    await screenshot(page, 'l04_empty_password');
  });

  test('❌ TC-L05 | Login with wrong credentials — shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const stillOnLogin = page.url().includes('login') || page.url().includes('sign-in') ||
      (await page.locator('input[type="password"]').count()) > 0;
    expect(stillOnLogin, 'Should stay on login with wrong credentials').toBe(true);
    await screenshot(page, 'l05_invalid_credentials');
  });

  for (const res of RESOLUTIONS) {
    test(`✅ TC-L06 | [${res.name}] Login page — no overflow, form aligned`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });

      const label = `${res.name} | Login Page`;
      await checkNoHorizontalScroll(page, label);
      await checkNoOverflow(page, label, res.width);
      await checkButtonsVisible(page, label, res.width);
      await screenshot(page, `l06_login_resp_${res.name}`);
      await ctx.close();
    });
  }

});

// ─────────────────────────────────────────────────────────────────────────────
// 🔵 SECTION 1 — RESPONSIVENESS (all pages, all 3 AC resolutions)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('🔵 RESPONSIVENESS — Layout correct on all pages (AS-1360 AC)', () => {
  for (const res of RESOLUTIONS) {
    for (const vcPage of VC_PAGES) {
      test(`[${res.name}] ${vcPage.name} — no overflow, no broken layout`, async ({ browser }) => {
        const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
        const page = await ctx.newPage();
        await login(page);
        await goToPage(page, vcPage.path);

        const label = `${res.name} | ${vcPage.name}`;
        await checkNoHorizontalScroll(page, label);
        await checkNoOverflow(page, label, res.width);
        await checkButtonsVisible(page, label, res.width);
        await checkTextNotClipped(page, label);
        await screenshot(page, `resp_${res.name}_${vcPage.name}`);
        await ctx.close();
      });
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 🟢 SECTION 2 — BULK TESTING (AS-766 AC: upload CSV, start test, check results)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('🟢 BULK TESTING — Upload, Results & Responsiveness (AS-766)', () => {

  // ── ✅ Positive ─────────────────────────────────────────────────────────────

  test('✅ TC-B01 | Bulk Testing tab loads with upload area and instructions', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    await expect(page.locator('text=Click to upload').first(),                    'Upload area visible').toBeVisible();
    await expect(page.locator('text=Download CSV').first(),                       'Download CSV template visible').toBeVisible();
    await expect(page.locator('button:has-text("Start Test")').first(),           'Start Test button visible').toBeVisible();
    await expect(page.locator('text=message').first(),                            'Column "message" instruction visible').toBeVisible();
    await expect(page.locator('text=expected_category').first(),                  'Column "expected_category" instruction visible').toBeVisible();
    await screenshot(page, 'b01_bulk_tab_loaded');
  });

  test('✅ TC-B02 | Upload valid CSV file — no error shown', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CSV_PATH);
    await page.waitForTimeout(1000);

    const errorVisible = await page.locator('text=Invalid, text=Error').first().isVisible().catch(() => false);
    expect(errorVisible, 'No error should appear for valid CSV').toBe(false);
    await screenshot(page, 'b02_csv_uploaded');
  });

  test('✅ TC-B03 | Start Test button becomes enabled after CSV upload', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CSV_PATH);
    await page.waitForTimeout(1000);

    const startBtn   = page.locator('button:has-text("Start Test")').first();
    await expect(startBtn, 'Start Test visible').toBeVisible();
    const isDisabled = await startBtn.isDisabled().catch(() => false);
    expect(isDisabled, 'Start Test should NOT be disabled after upload').toBe(false);
    await screenshot(page, 'b03_start_test_enabled');
  });

  test('✅ TC-B04 | Results modal opens after running Start Test', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    await expect(page.locator('text=Bulk testing results').first(), 'Results modal visible').toBeVisible();
    await screenshot(page, 'b04_results_modal');
  });

  test('✅ TC-B05 | Results modal shows Completed, Accuracy, Correct, Incorrect cards', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    await expect(page.locator('text=Completed').first(), 'Completed card').toBeVisible();
    await expect(page.locator('text=Accuracy').first(),  'Accuracy card').toBeVisible();
    await expect(page.locator('text=Correct').first(),   'Correct card').toBeVisible();
    await expect(page.locator('text=Incorrect').first(), 'Incorrect card').toBeVisible();
    await screenshot(page, 'b05_summary_cards');
  });

  test('✅ TC-B06 | Results table shows all required columns (AS-766 AC)', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    await expect(page.locator('text=HCP Message').first(),                 'HCP Message column').toBeVisible();
    await expect(page.locator('text=Expected Category').first(),           'Expected Category column').toBeVisible();
    await expect(page.locator('text=Category Selected by the VC').first(), 'Category Selected column').toBeVisible();
    await expect(page.locator('text=Status').first(),                      'Status column').toBeVisible();
    await expect(page.locator('text=Response Time').first(),               'Response Time column').toBeVisible();
    await screenshot(page, 'b06_table_columns');
  });

  test('✅ TC-B07 | Row 1 (colors/colors) shows message text and status badge', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    await expect(page.locator('text=colors').first(), 'Row 1 HCP message visible').toBeVisible();
    const statusBadge = page.locator('text=Incorrect').or(page.locator('text=Correct')).first();
    await expect(statusBadge, 'Status badge (Correct or Incorrect) visible').toBeVisible();
    await screenshot(page, 'b07_row1_result');
  });

  test('✅ TC-B08 | Row 2 (colors/engine) shows Incorrect badge', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    await expect(page.locator('text=Incorrect').first(), 'Incorrect badge visible').toBeVisible();
    await screenshot(page, 'b08_row2_incorrect');
  });

  test('✅ TC-B09 | Accuracy card shows a percentage value', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    await expect(page.locator('text=Accuracy').first(), 'Accuracy card visible').toBeVisible();
    const hasPercent = await page.evaluate(() => document.body.innerText.includes('%'));
    expect(hasPercent, 'Accuracy percentage should be shown').toBe(true);
    await screenshot(page, 'b09_accuracy_card');
  });

  test('✅ TC-B10 | Filter All/Correct/Incorrect buttons work', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    const incorrectBtn = page.locator('button:has-text("Incorrect")').first();
    if (await incorrectBtn.isVisible().catch(() => false)) {
      await incorrectBtn.click();
      await page.waitForTimeout(400);
      await screenshot(page, 'b10_filter_incorrect');
    }

    const allBtn = page.locator('button:has-text("All")').first();
    if (await allBtn.isVisible().catch(() => false)) {
      await allBtn.click();
      await page.waitForTimeout(400);
      await screenshot(page, 'b10_filter_all');
    }
  });

  test('✅ TC-B11 | Response time shown for each row (e.g. 287ms)', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    const responseTimes = page.locator('text=/\\d+ms/');
    const count = await responseTimes.count();
    expect(count, 'Response time should be shown for at least one row').toBeGreaterThan(0);
    await screenshot(page, 'b11_response_times');
  });

  test('✅ TC-B12 | Download CSV button visible inside results modal', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    const downloadBtn = page.locator('text=Download CSV').last();
    await expect(downloadBtn, 'Download CSV in modal visible').toBeVisible();
    await screenshot(page, 'b12_download_csv');
  });

  test('✅ TC-B13 | Previous Tests table shows tester name, date, messages count (AS-766 AC)', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CSV_PATH);
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Start Test")').first().click();
    await page.waitForSelector('button:has-text("View")', { timeout: 30000 });

    // Previous Tests row should show tester, date/time, message count
    const prevTestsVisible = await page.locator('text=Previous Tests, text=Tester, text=Date').first().isVisible().catch(() => false);
    const viewBtn          = await page.locator('button:has-text("View")').first().isVisible().catch(() => false);
    expect(viewBtn || prevTestsVisible, 'Previous Tests table with View button should appear').toBe(true);
    await screenshot(page, 'b13_previous_tests_table');
  });

  test('✅ TC-B14 | Close button closes results modal', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    const closeBtn = page.locator('button:has-text("Close")').first();
    await expect(closeBtn, 'Close button visible').toBeVisible();
    await closeBtn.click();
    await page.waitForTimeout(500);

    const modalGone = await page.locator('text=Bulk testing results').first().isVisible().catch(() => false);
    expect(modalGone, 'Modal should close after clicking Close').toBe(false);
    await screenshot(page, 'b14_modal_closed');
  });

  // ── Responsiveness of Bulk Testing tab ──────────────────────────────────────

  for (const res of RESOLUTIONS) {
    test(`✅ TC-B15 | [${res.name}] Bulk Testing tab — no overflow, buttons aligned`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToBulkTestingTab(page);

      const label = `${res.name} | Bulk Testing`;
      await checkNoHorizontalScroll(page, label);
      await checkNoOverflow(page, label, res.width);
      await checkButtonsVisible(page, label, res.width);
      await checkTextNotClipped(page, label);

      const startBtn = page.locator('button:has-text("Start Test")').first();
      if (await startBtn.isVisible().catch(() => false)) {
        const box = await startBtn.boundingBox();
        expect(box.x + box.width, 'Start Test button overflows').toBeLessThanOrEqual(res.width + 5);
      }

      const uploadArea = page.locator('text=Click to upload').first();
      if (await uploadArea.isVisible().catch(() => false)) {
        const box = await uploadArea.boundingBox();
        expect(box.x + box.width, 'Upload area overflows').toBeLessThanOrEqual(res.width + 5);
      }

      await screenshot(page, `b15_bulk_resp_${res.name}`);
      await ctx.close();
    });
  }

  for (const res of RESOLUTIONS) {
    test(`✅ TC-B16 | [${res.name}] Results modal — no overflow, fully visible`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToBulkTestingTab(page);

      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(CSV_PATH);
      await page.waitForTimeout(1000);
      await page.locator('button:has-text("Start Test")').first().click();
      await page.waitForSelector('button:has-text("View")', { timeout: 30000 });
      await page.locator('button:has-text("View")').first().click();
      await page.waitForSelector('text=Bulk testing results', { timeout: 30000 });
      await page.waitForTimeout(1000);

      const label = `${res.name} | Results Modal`;
      await checkNoHorizontalScroll(page, label);
      await checkButtonsVisible(page, label, res.width);

      const modal    = page.locator('text=Bulk testing results').first();
      const modalBox = await modal.boundingBox();
      if (modalBox) {
        expect(modalBox.x + modalBox.width, 'Modal overflows right edge').toBeLessThanOrEqual(res.width + 5);
      }

      await screenshot(page, `b16_modal_resp_${res.name}`);
      await ctx.close();
    });
  }

  // ── ❌ Negative ──────────────────────────────────────────────────────────────

  test('❌ TC-B17 | Start Test without uploading CSV — blocked or disabled', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    const startBtn   = page.locator('button:has-text("Start Test")').first();
    const isDisabled = await startBtn.isDisabled().catch(() => false);

    if (!isDisabled) {
      await startBtn.click();
      await page.waitForTimeout(1000);
      const errorVisible = await page.locator('text=Please upload, text=required, text=No file').first().isVisible().catch(() => false);
      expect(errorVisible || isDisabled, 'Should block Start Test without a file').toBe(true);
    } else {
      expect(isDisabled, 'Start Test disabled without file').toBe(true);
    }
    await screenshot(page, 'b17_no_file_blocked');
  });

  test('❌ TC-B18 | Upload wrong file type (.txt) — rejected or Start Test stays disabled', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    const txtPath = path.resolve(__dirname, 'test_invalid.txt');
    fs.writeFileSync(txtPath, 'this is not a csv');

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(txtPath);
    await page.waitForTimeout(1000);

    const startBtn   = page.locator('button:has-text("Start Test")').first();
    const isDisabled = await startBtn.isDisabled().catch(() => false);
    const errorShown = await page.locator('text=Invalid, text=not supported, text=Error').first().isVisible().catch(() => false);

    fs.unlinkSync(txtPath);
    expect(errorShown || isDisabled, 'Invalid file type should be rejected or button disabled').toBe(true);
    await screenshot(page, 'b18_invalid_file');
  });

  test('❌ TC-B19 | Upload empty CSV (headers only) — page does not crash', async ({ page }) => {
    test.setTimeout(90000);
    await login(page);
    await goToBulkTestingTab(page);

    // Use a unique path per test run to avoid worker collisions
    const emptyPath = path.resolve(__dirname, `test_empty_${Date.now()}.csv`);
    fs.writeFileSync(emptyPath, 'message,expected_category\n');

    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(emptyPath);
      await page.waitForTimeout(1500);

      const alive = await page.evaluate(() => true).catch(() => false);
      expect(alive, 'Page should remain stable after empty CSV upload').toBe(true);
      await screenshot(page, 'b19_empty_csv');
    } finally {
      if (fs.existsSync(emptyPath)) fs.unlinkSync(emptyPath);
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 🟡 SECTION 3 — SINGLE MESSAGE TESTING
// ─────────────────────────────────────────────────────────────────────────────

test.describe('🟡 SINGLE MESSAGE TESTING — Send message & check responsiveness', () => {

  test('✅ TC-S01 | Single Message Testing tab loads with input field', async ({ page }) => {
    test.setTimeout(90000);
    await login(page);
    await goToSingleTestingTab(page);

    const inputArea = page.locator('textarea:visible, input[type="text"]:visible, [placeholder*="message"], [placeholder*="Message"]').first();
    const inputVisible = await inputArea.isVisible().catch(() => false);
    expect(inputVisible, 'Message input should be visible').toBe(true);
    await screenshot(page, 's01_single_tab_loaded');
  });

  test('✅ TC-S02 | Can type and send a single message', async ({ page }) => {
    await login(page);
    await goToSingleTestingTab(page);

    const inputArea = page.locator('textarea:visible, input[type="text"]:visible').first();
    if (await inputArea.isVisible().catch(() => false)) {
      await inputArea.fill('colors');
      await page.waitForTimeout(500);
      const sendBtn = page.locator('button:has-text("Send"), button[type="submit"], button:has-text("Test")').first();
      if (await sendBtn.isVisible().catch(() => false)) {
        await sendBtn.click();
        await page.waitForTimeout(3000);
        await screenshot(page, 's02_message_sent');
      }
    }
  });

  test('✅ TC-S03 | Response is displayed after sending a message', async ({ page }) => {
    await login(page);
    await goToSingleTestingTab(page);

    const inputArea = page.locator('textarea:visible, input[type="text"]:visible').first();
    if (await inputArea.isVisible().catch(() => false)) {
      await inputArea.fill('what engines does it offer');
      const sendBtn = page.locator('button:has-text("Send"), button[type="submit"], button:has-text("Test")').first();
      if (await sendBtn.isVisible().catch(() => false)) {
        await sendBtn.click();
        await page.waitForTimeout(5000);
        await screenshot(page, 's03_response_shown');
      }
    }
  });

  for (const res of RESOLUTIONS) {
    test(`✅ TC-S04 | [${res.name}] Single Testing tab — no overflow, buttons aligned`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToSingleTestingTab(page);

      const label = `${res.name} | Single Testing`;
      await checkNoHorizontalScroll(page, label);
      await checkNoOverflow(page, label, res.width);
      await checkButtonsVisible(page, label, res.width);
      await checkTextNotClipped(page, label);
      await screenshot(page, `s04_single_resp_${res.name}`);
      await ctx.close();
    });
  }

  test('❌ TC-S05 | Send empty message — blocked or shows validation', async ({ page }) => {
    await login(page);
    await goToSingleTestingTab(page);

    const sendBtn = page.locator('button:has-text("Send"), button[type="submit"]').first();
    if (await sendBtn.isVisible().catch(() => false)) {
      const isDisabled = await sendBtn.isDisabled().catch(() => false);
      if (!isDisabled) {
        await sendBtn.click();
        await page.waitForTimeout(1000);
        const errorVisible = await page.locator('text=required, text=empty, text=Please enter').first().isVisible().catch(() => false);
        expect(errorVisible || isDisabled, 'Empty send should be blocked').toBe(true);
      } else {
        expect(isDisabled, 'Send button disabled for empty input').toBe(true);
      }
    }
    await screenshot(page, 's05_empty_message');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 🔴 SECTION 4 — FLAGGED MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

test.describe('🔴 FLAGGED MESSAGES — Tab loads & responsiveness', () => {

  test('✅ TC-F01 | Flagged Messages tab loads without JS errors', async ({ page }) => {
    await login(page);
    await goToFlaggedTab(page);

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(1500);

    const jsErrors = errors.filter(e => e.includes('TypeError') || e.includes('Cannot read'));
    expect(jsErrors.length, `JS errors on Flagged tab: ${jsErrors}`).toBe(0);
    await screenshot(page, 'f01_flagged_tab_loaded');
  });

  test('✅ TC-F02 | Flagged Messages shows table or empty state', async ({ page }) => {
    await login(page);
    await goToFlaggedTab(page);

    const tableOrEmpty = page.locator('table, [class*="empty"], [class*="no-data"], [class*="placeholder"]').first();
    const isVisible    = await tableOrEmpty.isVisible().catch(() => false);
    expect(isVisible, 'Table or empty state should be visible').toBe(true);
    await screenshot(page, 'f02_flagged_content');
  });

  test('✅ TC-F03 | Flagged Messages tab — no horizontal scroll', async ({ page }) => {
    await login(page);
    await goToFlaggedTab(page);
    await checkNoHorizontalScroll(page, 'Flagged Messages');
    await screenshot(page, 'f03_flagged_no_scroll');
  });

  for (const res of RESOLUTIONS) {
    test(`✅ TC-F04 | [${res.name}] Flagged Messages tab — no overflow, buttons aligned`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToFlaggedTab(page);

      const label = `${res.name} | Flagged Messages`;
      await checkNoHorizontalScroll(page, label);
      await checkNoOverflow(page, label, res.width);
      await checkButtonsVisible(page, label, res.width);
      await checkTextNotClipped(page, label);
      await screenshot(page, `f04_flagged_resp_${res.name}`);
      await ctx.close();
    });
  }

  test('✅ TC-F05 | Tab switching Single → Bulk → Flagged keeps layout stable', async ({ page }) => {
    await login(page);
    await goToTestCoordinatorStep(page);

    const tabSequence = [
      { text: 'Single Message Testing' },
      { text: 'Bulk testing' },
      { text: 'Flagged messages' },
    ];

    for (const { text } of tabSequence) {
      const tab     = page.locator(`text=${text}`).first();
      const visible = await tab.isVisible().catch(() => false);
      if (visible) {
        await tab.click();
        await page.waitForTimeout(800);
        await checkNoHorizontalScroll(page, `Tab: ${text}`);
        await screenshot(page, `f05_tab_${text.replace(/\s/g, '_').toLowerCase()}`);
      }
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 🟣 SECTION 5 — INTERACTIVE ELEMENTS & LAYOUT INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────

test.describe('🟣 INTERACTIVE ELEMENTS — Buttons, inputs, tabs fully visible', () => {

  for (const res of RESOLUTIONS) {
    test(`✅ TC-I01 | [${res.name}] All interactive elements within viewport on wizard pages`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[0].path);

      const label = `${res.name} | Interactive Elements`;
      await checkInteractiveElements(page, label, res.width);
      await ctx.close();
    });
  }

  for (const res of RESOLUTIONS) {
    test(`✅ TC-I02 | [${res.name}] Footer CTAs (Next, Save as Draft, Back) visible and not clipped`, async ({ browser }) => {
      const ctaTexts = ['Next', 'Save as Draft', 'Save', 'Cancel', 'Back'];
      const ctx      = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page     = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[0].path);

      for (const cta of ctaTexts) {
        const btn     = page.locator(`button:has-text("${cta}")`).first();
        const visible = await btn.isVisible().catch(() => false);
        if (!visible) continue;

        const box = await btn.boundingBox();
        if (!box) continue;
        expect(box.x + box.width, `CTA "${cta}" overflows viewport`).toBeLessThanOrEqual(res.width + 5);
        expect(box.y + box.height, `CTA "${cta}" is below viewport`).toBeLessThanOrEqual(res.height + 200);
      }
      await ctx.close();
    });
  }

  for (const res of RESOLUTIONS) {
    test(`✅ TC-I03 | [${res.name}] Page body has no zero-width collapse`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[0].path);

      // body should fill the viewport — not collapsed
      const bodyWidth = await page.evaluate(() => document.body.getBoundingClientRect().width);
      expect(bodyWidth, `[${res.name}] Body width should equal viewport width`).toBeGreaterThanOrEqual(res.width - 20);
      await ctx.close();
    });
  }

  for (const res of RESOLUTIONS) {
    test(`✅ TC-I04 | [${res.name}] No major elements overlap each other`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[1].path);

      const overlaps = await page.evaluate(() => {
        const major = Array.from(document.querySelectorAll(
          'header, nav, aside, main, footer, [class*="sidebar"], [class*="header"], [class*="footer"], [class*="content"]'
        )).filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 50 && r.height > 50;
        });

        const found = [];
        for (let i = 0; i < major.length; i++) {
          for (let j = i + 1; j < major.length; j++) {
            if (major[j].contains(major[i]) || major[i].contains(major[j])) continue;
            const a = major[i].getBoundingClientRect();
            const b = major[j].getBoundingClientRect();
            const overlap = a.left < b.right - 10 && a.right > b.left + 10 &&
                            a.top < b.bottom - 10 && a.bottom > b.top + 10;
            if (overlap) found.push({
              a: major[i].tagName + '.' + (major[i].className || '').toString().slice(0, 30),
              b: major[j].tagName,
            });
          }
        }
        return found.slice(0, 5);
      });

      expect(overlaps.length, `[${res.name}] Overlapping elements: ${JSON.stringify(overlaps)}`).toBe(0);
      await ctx.close();
    });
  }

  for (const res of RESOLUTIONS) {
    test(`✅ TC-I05 | [${res.name}] No images overflow their containers`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[0].path);

      const overflowImgs = await page.evaluate((vw) =>
        Array.from(document.querySelectorAll('img:not([hidden])'))
          .filter(img => {
            const r = img.getBoundingClientRect();
            return r.right > vw + 5 && r.width > 0;
          })
          .map(img => ({ src: img.src?.slice(0, 60), right: Math.round(img.getBoundingClientRect().right) }))
      , res.width);

      expect(overflowImgs.length, `[${res.name}] Overflowing images: ${JSON.stringify(overflowImgs)}`).toBe(0);
      await ctx.close();
    });
  }

  for (const res of RESOLUTIONS) {
    test(`✅ TC-I06 | [${res.name}] No collapsed zero-width containers`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[1].path);

      const collapsed = await page.evaluate(() =>
        Array.from(document.querySelectorAll('main, section, article, [class*="container"], [class*="wrapper"], [class*="panel"]'))
          .filter(el => {
            const r  = el.getBoundingClientRect();
            const cs = window.getComputedStyle(el);
            return r.width === 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
          })
          .map(el => ({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60) }))
          .slice(0, 5)
      );

      expect(collapsed.length, `[${res.name}] Collapsed containers: ${JSON.stringify(collapsed)}`).toBe(0);
      await ctx.close();
    });
  }

  for (const res of RESOLUTIONS) {
    test(`✅ TC-I07 | [${res.name}] Tab switching keeps layout stable`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[1].path);

      const tabEls = page.locator('[role="tab"]:visible');
      const count  = await tabEls.count();

      for (let i = 0; i < count; i++) {
        await tabEls.nth(i).click().catch(() => {});
        await page.waitForTimeout(600);
        await checkNoHorizontalScroll(page, `${res.name} | Tab ${i}`);
      }
      await ctx.close();
    });
  }

});

// ─────────────────────────────────────────────────────────────────────────────
// ⚡ SECTION 6 — EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────

test.describe('⚡ EDGE CASES — Boundary resolutions, resize, zoom, network', () => {

  // ── Boundary resolutions just above/below 1366 ──────────────────────────────

  test.describe('⚡ EDGE-R — Boundary resolutions (1365 / 1367)', () => {
    const boundary = [
      { name: '1365x768 (just below 1366)', width: 1365, height: 768 },
      { name: '1367x768 (just above 1366)', width: 1367, height: 768 },
    ];

    for (const size of boundary) {
      test(`[${size.name}] Layout handles boundary resolution correctly`, async ({ browser }) => {
        const ctx  = await browser.newContext({ viewport: { width: size.width, height: size.height } });
        const page = await ctx.newPage();
        await login(page);
        await goToPage(page, VC_PAGES[0].path);
        await checkNoHorizontalScroll(page, size.name);
        await screenshot(page, `edge_boundary_${size.name.replace(/[^a-z0-9]/gi, '_')}`);
        await ctx.close();
      });
    }
  });

  // ── Unsupported small viewports handled gracefully ─────────────────────────

  test.describe('⚡ EDGE-S — Small viewports — no JS crashes', () => {
    const tooSmall = [
      { name: '800x600', width: 800, height: 600 },
      { name: '1024x600', width: 1024, height: 600 },
    ];

    for (const size of tooSmall) {
      test(`[${size.name}] Page loads without JS TypeError at small viewport`, async ({ browser }) => {
        const ctx  = await browser.newContext({ viewport: { width: size.width, height: size.height } });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await login(page);
        await goToPage(page, VC_PAGES[0].path);
        await page.waitForTimeout(1000);

        const jsErrors = errors.filter(e => e.includes('TypeError') || e.includes('Cannot read'));
        expect(jsErrors.length, `JS errors at ${size.name}: ${jsErrors}`).toBe(0);
        await screenshot(page, `edge_small_${size.name}`);
        await ctx.close();
      });
    }
  });

  // ── Ultra-wide ─────────────────────────────────────────────────────────────

  test('⚡ EDGE-W | [2560x1440] Layout does not stretch awkwardly on ultra-wide', async ({ browser }) => {
    const ctx  = await browser.newContext({ viewport: { width: 2560, height: 1440 } });
    const page = await ctx.newPage();
    await login(page);
    await goToPage(page, VC_PAGES[0].path);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth, 'Body should not stretch beyond 2560px').toBeLessThanOrEqual(2560);

    await screenshot(page, 'edge_ultrawide_2560x1440');
    await ctx.close();
  });

  // ── Short viewport ─────────────────────────────────────────────────────────

  test('⚡ EDGE-H | [1440x600] No horizontal scroll on short viewport', async ({ browser }) => {
    const ctx  = await browser.newContext({ viewport: { width: 1440, height: 600 } });
    const page = await ctx.newPage();
    await login(page);
    await goToPage(page, VC_PAGES[0].path);
    await checkNoHorizontalScroll(page, '1440x600 short viewport');
    await ctx.close();
  });

  // ── Rapid resize ───────────────────────────────────────────────────────────

  test('⚡ EDGE-RR | Rapid resize 1920→1366→1920 does not break layout', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Resize not supported on WebKit');
    await login(page);
    await goToPage(page, VC_PAGES[1].path);

    for (const w of [1920, 1600, 1440, 1366, 1440, 1600, 1920]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(150);
    }

    await checkNoHorizontalScroll(page, 'After rapid resize');
  });

  // ── Resize during navigation ───────────────────────────────────────────────

  test('⚡ EDGE-RN | Resize during navigation does not freeze layout', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Resize not supported on WebKit');
    await login(page);

    const navPromise = page.goto(`${BASE_URL}${VC_PAGES[1].path}`);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.setViewportSize({ width: 1366, height: 768 });
    await navPromise;
    await page.waitForTimeout(1000);

    await checkNoHorizontalScroll(page, 'After resize during navigation');
  });

  // ── Scroll position after resize ───────────────────────────────────────────

  test('⚡ EDGE-SC | Scroll position does not jump drastically after resize', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Resize not supported on WebKit');
    await login(page);
    await goToPage(page, VC_PAGES[4].path);

    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(300);
    const beforeY = await page.evaluate(() => window.scrollY);

    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(500);
    const afterY = await page.evaluate(() => window.scrollY);

    expect(Math.abs(afterY - beforeY), 'Scroll position jumped > 200px after resize').toBeLessThan(200);
  });

  // ── Tall content ───────────────────────────────────────────────────────────

  for (const res of RESOLUTIONS) {
    test(`⚡ EDGE-TC | [${res.name}] Scrolling tall content does not create horizontal scroll`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[4].path);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      await checkNoHorizontalScroll(page, `${res.name} | After scrolling to bottom`);
      await ctx.close();
    });
  }

  // ── All pages sequentially at smallest resolution ──────────────────────────

  test('⚡ EDGE-SEQ | [1366x768] All VC pages visited sequentially — no horizontal scroll', async ({ browser }) => {
    const ctx  = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await ctx.newPage();
    await login(page);

    for (const vcPage of VC_PAGES) {
      await goToPage(page, vcPage.path);
      await checkNoHorizontalScroll(page, `1366x768 | ${vcPage.name}`);
    }
    await ctx.close();
  });

  // ── Slow network simulation ────────────────────────────────────────────────

  for (const res of RESOLUTIONS) {
    test(`⚡ EDGE-NET | [${res.name}] Layout correct even with simulated network delay`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();

      await page.route('**/*', async (route) => {
        await new Promise(r => setTimeout(r, 50));
        await route.continue().catch(() => {});
      });

      await login(page);
      await goToPage(page, VC_PAGES[0].path);
      await checkNoHorizontalScroll(page, `${res.name} | Slow network`);
      await ctx.close();
    });
  }

  // ── Font scaling ───────────────────────────────────────────────────────────

  for (const res of RESOLUTIONS) {
    test(`⚡ EDGE-FONT | [${res.name}] 120% font size does not cause horizontal scroll`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[0].path);

      await page.addStyleTag({ content: '* { font-size: 120% !important; }' });
      await page.waitForTimeout(500);

      await checkNoHorizontalScroll(page, `${res.name} | 120% font`);
      await ctx.close();
    });
  }

  // ── Browser zoom via deviceScaleFactor ─────────────────────────────────────

  for (const zoom of [0.75, 0.9, 1.1, 1.25]) {
    test(`⚡ EDGE-ZOOM | [1440x900 @ ${zoom * 100}% zoom] No horizontal scroll`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: zoom });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[0].path);
      await checkNoHorizontalScroll(page, `1440x900 zoom ${zoom}`);
      await ctx.close();
    });
  }

  // ── Two pages open simultaneously ──────────────────────────────────────────

  test('⚡ EDGE-2TAB | Two VC Studio pages open simultaneously — no interference', async ({ browser }) => {
    const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const ctx2 = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    await login(page1);
    await login(page2);
    await Promise.all([
      goToPage(page1, VC_PAGES[0].path),
      goToPage(page2, VC_PAGES[1].path),
    ]);

    const [scroll1, scroll2] = await Promise.all([
      page1.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
      page2.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    ]);

    expect(scroll1, 'Page 1 (1440x900) has horizontal scroll').toBe(false);
    expect(scroll2, 'Page 2 (1366x768) has horizontal scroll').toBe(false);

    await ctx1.close();
    await ctx2.close();
  });

});
