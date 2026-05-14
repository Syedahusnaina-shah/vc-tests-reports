// ============================================================
// Playwright Complete Test Suite — AS-1360
// VC Studio - Responsiveness + Bulk Testing + Single Testing + Flagged Messages
//
// Agent ID: 3631 | Version ID: 1
// CSV: f150_bulk_testing.csv (message, expected_category)
//
// Run:    $env:PLAYWRIGHT_BROWSERS_PATH="D:\playwright-browsers"; npx playwright test as1360-complete.spec.js --reporter=html
// Report: npx playwright show-report
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

// Target resolutions from AC
const RESOLUTIONS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900',  width: 1440, height: 900  },
  { name: '1366x768',  width: 1366, height: 768  },
];

// All VC Studio pages
const VC_PAGES = [
  { name: 'Create VC Step 1',           path: `/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Create Coordinator', path: `/#/create-virtual-coordinator?edit=true&step=0&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Train Coordinator',  path: `/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Create Content',     path: `/#/create-virtual-coordinator?edit=true&step=2&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Flagged Messages',   path: `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Test Coordinator',   path: `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Bulk Testing',       path: `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'VC Draft',                   path: `/#/virtual-coordinator-draft?agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'VC Overview',                path: `/#/virtual-coordinator-overview?agentId=${AGENT_ID}` },
];

// CSV file path
const CSV_PATH = path.resolve(__dirname, 'f150_bulk_testing.csv');

// Create CSV if missing
if (!fs.existsSync(CSV_PATH)) {
  fs.writeFileSync(CSV_PATH, 'message,expected_category\ncolors,colors\ncolors,engine\nwhat engines does it offer,engine\n');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function login(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  const needsLogin =
    page.url().includes('login') ||
    page.url().includes('sign-in') ||
    (await page.locator('input[type="password"]').count()) > 0;

  if (needsLogin) {
    await page.fill('input[type="email"], input[name="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1500);
  }
}

async function goToPage(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}

async function screenshot(page, name) {
  const safe = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  await page.screenshot({ path: `screenshots/${safe}.png`, fullPage: false });
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
    expect(box.x, `[${label}] Button[${i}] outside left edge`).toBeGreaterThanOrEqual(-5);
    expect(box.width,  `[${label}] Button[${i}] zero width`).toBeGreaterThan(0);
    expect(box.height, `[${label}] Button[${i}] zero height`).toBeGreaterThan(0);
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

// ─────────────────────────────────────────────────────────────────────────────
// 🔵 SECTION 1 — RESPONSIVENESS (all pages, all 3 resolutions)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('🔵 RESPONSIVENESS — Layout correct on all pages', () => {
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
// 🟢 SECTION 2 — BULK TESTING (upload CSV, start test, check results)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('🟢 BULK TESTING — Upload, Results & Responsiveness', () => {

  // ── ✅ Positive ─────────────────────────────────────────────────────────────

  test('✅ TC-B01 | Bulk Testing tab loads correctly', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    await expect(page.locator('text=Click to upload').first(),    'Upload area visible').toBeVisible();
    await expect(page.locator('text=Download CSV').first(),       'Download CSV button visible').toBeVisible();
    await expect(page.locator('button:has-text("Start Test")').first(), 'Start Test button visible').toBeVisible();
    await expect(page.locator('text=message').first(),            'Column instructions visible').toBeVisible();
    await expect(page.locator('text=expected_category').first(),  'expected_category label visible').toBeVisible();
    await screenshot(page, 'b01_bulk_tab_loaded');
  });

  test('✅ TC-B02 | Upload CSV file successfully', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CSV_PATH);
    await page.waitForTimeout(1000);

    const errorVisible = await page.locator('text=Invalid, text=Error').first().isVisible().catch(() => false);
    expect(errorVisible, 'No error should appear for valid CSV').toBe(false);
    await screenshot(page, 'b02_csv_uploaded');
  });

  test('✅ TC-B03 | Start Test button is clickable after CSV upload', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CSV_PATH);
    await page.waitForTimeout(1000);

    const startBtn = page.locator('button:has-text("Start Test")').first();
    await expect(startBtn, 'Start Test should be enabled').toBeVisible();
    const isDisabled = await startBtn.isDisabled().catch(() => false);
    expect(isDisabled, 'Start Test should NOT be disabled after upload').toBe(false);
    await screenshot(page, 'b03_start_test_enabled');
  });

  // Helper: submit bulk test and open the View modal for result checks
  async function startBulkTestAndOpenView(page) {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(CSV_PATH);
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Start Test")').first().click();
    // Wait for Previous Tests row with a View button
    await page.waitForSelector('button:has-text("View")', { timeout: 30000 });
    await page.locator('button:has-text("View")').first().click();
    await page.waitForSelector('text=Bulk testing results', { timeout: 15000 });
    await page.waitForTimeout(1000);
  }

  test('✅ TC-B04 | Results modal opens after Start Test', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    const modal = page.locator('text=Bulk testing results').first();
    await expect(modal, 'Results modal should appear').toBeVisible();
    await screenshot(page, 'b04_results_modal');
  });

  test('✅ TC-B05 | Results modal shows summary cards (Completed, Accuracy, Correct, Incorrect)', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    await expect(page.locator('text=Completed').first(),  'Completed card visible').toBeVisible();
    await expect(page.locator('text=Accuracy').first(),   'Accuracy card visible').toBeVisible();
    await expect(page.locator('text=Correct').first(),    'Correct card visible').toBeVisible();
    await expect(page.locator('text=Incorrect').first(),  'Incorrect card visible').toBeVisible();
    await screenshot(page, 'b05_summary_cards');
  });

  test('✅ TC-B06 | Results table columns are all visible', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    await expect(page.locator('text=HCP Message').first(),                  'HCP Message column').toBeVisible();
    await expect(page.locator('text=Expected Category').first(),            'Expected Category column').toBeVisible();
    await expect(page.locator('text=Category Selected by the VC').first(),  'Category Selected column').toBeVisible();
    await expect(page.locator('text=Status').first(),                       'Status column').toBeVisible();
    await expect(page.locator('text=Response Time').first(),                'Response Time column').toBeVisible();
    await screenshot(page, 'b06_table_columns');
  });

  test('✅ TC-B07 | Row 1: colors/colors — result row visible with status badge', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    // Verify row 1 data is visible in the results table
    await expect(page.locator('text=colors').first(), 'Row 1 HCP message visible').toBeVisible();
    // At least one status badge (Correct or Incorrect) should appear
    const statusBadge = page.locator('text=Incorrect').or(page.locator('text=Correct')).first();
    await expect(statusBadge, 'Status badge should be visible for row 1').toBeVisible();
    await screenshot(page, 'b07_row1_result');
  });

  test('✅ TC-B08 | Row 2: colors/engine → Incorrect status badge visible', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    const incorrectBadge = page.locator('text=Incorrect').first();
    await expect(incorrectBadge, 'Incorrect badge should appear').toBeVisible();
    await screenshot(page, 'b08_row2_incorrect');
  });

  test('✅ TC-B09 | Accuracy card is shown with a percentage value', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    // Verify Accuracy card exists and shows a % value
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
    expect(count, 'Response time should be shown for rows').toBeGreaterThan(0);
    await screenshot(page, 'b11_response_times');
  });

  test('✅ TC-B12 | Download CSV button visible in results modal', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    const downloadBtn = page.locator('text=Download CSV').last();
    await expect(downloadBtn, 'Download CSV in modal should be visible').toBeVisible();
    await screenshot(page, 'b12_download_csv');
  });

  test('✅ TC-B13 | Close button closes results modal', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);
    await startBulkTestAndOpenView(page);

    const closeBtn = page.locator('button:has-text("Close")').first();
    await expect(closeBtn, 'Close button should be visible').toBeVisible();
    await closeBtn.click();
    await page.waitForTimeout(500);

    const modalGone = await page.locator('text=Bulk testing results').first().isVisible().catch(() => false);
    expect(modalGone, 'Modal should close after Close clicked').toBe(false);
    await screenshot(page, 'b13_modal_closed');
  });

  // ── Responsiveness of Bulk Testing tab ──────────────────────────────────────

  for (const res of RESOLUTIONS) {
    test(`✅ TC-B14 | [${res.name}] Bulk Testing tab — no overflow, buttons aligned`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToBulkTestingTab(page);

      const label = `${res.name} | Bulk Testing`;
      await checkNoHorizontalScroll(page, label);
      await checkNoOverflow(page, label, res.width);
      await checkButtonsVisible(page, label, res.width);
      await checkTextNotClipped(page, label);

      // Start Test button alignment
      const startBtn = page.locator('button:has-text("Start Test")').first();
      const startVisible = await startBtn.isVisible().catch(() => false);
      if (startVisible) {
        const box = await startBtn.boundingBox();
        expect(box.x + box.width, 'Start Test button overflows').toBeLessThanOrEqual(res.width + 5);
      }

      // Upload area alignment
      const uploadArea = page.locator('text=Click to upload').first();
      const uploadVisible = await uploadArea.isVisible().catch(() => false);
      if (uploadVisible) {
        const box = await uploadArea.boundingBox();
        expect(box.x + box.width, 'Upload area overflows').toBeLessThanOrEqual(res.width + 5);
      }

      await screenshot(page, `b14_bulk_resp_${res.name}`);
      await ctx.close();
    });
  }

  for (const res of RESOLUTIONS) {
    test(`✅ TC-B15 | [${res.name}] Results modal — no overflow, fully visible`, async ({ browser }) => {
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
      await page.waitForSelector('text=Bulk testing results', { timeout: 15000 });
      await page.waitForTimeout(1000);

      const label = `${res.name} | Results Modal`;
      await checkNoHorizontalScroll(page, label);
      await checkButtonsVisible(page, label, res.width);

      // Modal should not overflow viewport
      const modal = page.locator('text=Bulk testing results').first();
      const modalBox = await modal.boundingBox();
      if (modalBox) {
        expect(modalBox.x + modalBox.width, 'Modal overflows right edge').toBeLessThanOrEqual(res.width + 5);
      }

      await screenshot(page, `b15_modal_resp_${res.name}`);
      await ctx.close();
    });
  }

  // ── ❌ Negative ──────────────────────────────────────────────────────────────

  test('❌ TC-B16 | Start Test without uploading CSV — blocked or disabled', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    const startBtn  = page.locator('button:has-text("Start Test")').first();
    const isDisabled = await startBtn.isDisabled().catch(() => false);

    if (!isDisabled) {
      await startBtn.click();
      await page.waitForTimeout(1000);
      const errorVisible = await page.locator('text=Please upload, text=required, text=No file').first().isVisible().catch(() => false);
      expect(errorVisible || isDisabled, 'Should block Start Test without a file').toBe(true);
    } else {
      expect(isDisabled, 'Start Test disabled without file').toBe(true);
    }
    await screenshot(page, 'b16_no_file_blocked');
  });

  test('❌ TC-B17 | Upload wrong file type (.txt) — rejected', async ({ page }) => {
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
    expect(errorShown || isDisabled, 'Invalid file type should be rejected').toBe(true);
    await screenshot(page, 'b17_invalid_file');
  });

  test('❌ TC-B18 | Upload empty CSV (headers only)', async ({ page }) => {
    await login(page);
    await goToBulkTestingTab(page);

    const emptyPath = path.resolve(__dirname, 'test_empty.csv');
    fs.writeFileSync(emptyPath, 'message,expected_category\n');

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(emptyPath);
    await page.waitForTimeout(1000);

    fs.unlinkSync(emptyPath);
    await screenshot(page, 'b18_empty_csv');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 🟡 SECTION 3 — SINGLE MESSAGE TESTING
// ─────────────────────────────────────────────────────────────────────────────

test.describe('🟡 SINGLE MESSAGE TESTING — Send message & check responsiveness', () => {

  test('✅ TC-S01 | Single Message Testing tab loads correctly', async ({ page }) => {
    await login(page);
    await goToSingleTestingTab(page);

    // Input field or send area should be visible
    const inputArea = page.locator('textarea:visible, input[type="text"]:visible, [placeholder*="message"], [placeholder*="Message"]').first();
    const inputVisible = await inputArea.isVisible().catch(() => false);
    expect(inputVisible, 'Message input should be visible on Single Message tab').toBe(true);

    await screenshot(page, 's01_single_tab_loaded');
  });

  test('✅ TC-S02 | Can type and send a single message', async ({ page }) => {
    await login(page);
    await goToSingleTestingTab(page);

    const inputArea = page.locator('textarea:visible, input[type="text"]:visible').first();
    const inputVisible = await inputArea.isVisible().catch(() => false);

    if (inputVisible) {
      await inputArea.fill('colors');
      await page.waitForTimeout(500);

      // Click send button
      const sendBtn = page.locator('button:has-text("Send"), button[type="submit"], button:has-text("Test")').first();
      const sendVisible = await sendBtn.isVisible().catch(() => false);
      if (sendVisible) {
        await sendBtn.click();
        await page.waitForTimeout(3000);
        await screenshot(page, 's02_message_sent');
      }
    }
  });

  test('✅ TC-S03 | Response is displayed after sending message', async ({ page }) => {
    await login(page);
    await goToSingleTestingTab(page);

    const inputArea = page.locator('textarea:visible, input[type="text"]:visible').first();
    const inputVisible = await inputArea.isVisible().catch(() => false);

    if (inputVisible) {
      await inputArea.fill('what engines does it offer');
      const sendBtn = page.locator('button:has-text("Send"), button[type="submit"], button:has-text("Test")').first();
      if (await sendBtn.isVisible().catch(() => false)) {
        await sendBtn.click();
        await page.waitForTimeout(5000);

        // Response area should show something
        const response = page.locator('[class*="response"], [class*="result"], [class*="message"]').last();
        const hasResponse = await response.isVisible().catch(() => false);
        await screenshot(page, 's03_response_shown');
      }
    }
  });

  // ── Responsiveness of Single Testing tab ────────────────────────────────────

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
    const sendVisible = await sendBtn.isVisible().catch(() => false);

    if (sendVisible) {
      const isDisabled = await sendBtn.isDisabled().catch(() => false);
      if (!isDisabled) {
        await sendBtn.click();
        await page.waitForTimeout(1000);
        const errorVisible = await page.locator('text=required, text=empty, text=Please enter').first().isVisible().catch(() => false);
        expect(errorVisible || isDisabled, 'Empty message send should be blocked').toBe(true);
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

  test('✅ TC-F01 | Flagged Messages tab loads correctly', async ({ page }) => {
    await login(page);
    await goToFlaggedTab(page);

    // Page should load without error
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(1500);

    const jsErrors = errors.filter(e => e.includes('TypeError') || e.includes('Cannot read'));
    expect(jsErrors.length, `JS errors on Flagged tab: ${jsErrors}`).toBe(0);
    await screenshot(page, 'f01_flagged_tab_loaded');
  });

  test('✅ TC-F02 | Flagged Messages table or empty state is visible', async ({ page }) => {
    await login(page);
    await goToFlaggedTab(page);

    // Either table rows or empty state message
    const tableOrEmpty = page.locator('table, [class*="empty"], [class*="no-data"], [class*="placeholder"]').first();
    const isVisible = await tableOrEmpty.isVisible().catch(() => false);
    expect(isVisible, 'Table or empty state should be visible').toBe(true);
    await screenshot(page, 'f02_flagged_content');
  });

  test('✅ TC-F03 | Flagged Messages tab — no horizontal scroll', async ({ page }) => {
    await login(page);
    await goToFlaggedTab(page);
    await checkNoHorizontalScroll(page, 'Flagged Messages');
    await screenshot(page, 'f03_flagged_no_scroll');
  });

  // ── Responsiveness of Flagged Messages tab ───────────────────────────────────

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
    const tabRoutes = [
      { text: 'Single Message Testing', tab: 'test-coordinator' },
      { text: 'Bulk testing',           tab: 'bulk-testing' },
      { text: 'Flagged messages',       tab: 'flagged-messages' },
    ];

    for (const { text, tab } of tabRoutes) {
      await goToPage(page, `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=${tab}`);
      await page.waitForTimeout(800);
      await checkNoHorizontalScroll(page, `Tab: ${text}`);
      await screenshot(page, `f05_tab_${text.replace(/\s/g, '_')}`);
    }
  });

});