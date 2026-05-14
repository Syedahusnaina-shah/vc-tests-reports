// Playwright Responsiveness Test — AS-1360
// VC Studio - Page responsiveness across screen sizes
// Target resolutions: 1920x1080, 1440x900, 1366x768
//
// Run:   npx playwright test as1360-responsiveness.spec.js
// Report: npx playwright test as1360-responsiveness.spec.js --reporter=html

const { test, expect } = require('@playwright/test');

// ─── Config ──────────────────────────────────────────────────────────────────
const BASE_URL = 'https://vc.qa.impiricus.com';
const LOGIN_EMAIL    = process.env.VC_EMAIL    || 'Syeda.Husnaina@ssasoft.com';
const LOGIN_PASSWORD = process.env.VC_PASSWORD || 'Test123@';

const AGENT_ID   = '3499';
const VERSION_ID = '1';

// Target resolutions from AC
const RESOLUTIONS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900',  width: 1440, height: 900  },
  { name: '1366x768',  width: 1366, height: 768  },
];

// All VC Studio pages to test
const VC_PAGES = [
  {
    name: 'Create Virtual Coordinator (Step 1)',
    path: `/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}`,
  },
  {
    name: 'Setup - Create Coordinator tab',
    path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=create-coordinator`,
  },
  {
    name: 'Setup - Create Content tab',
    path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=create-content`,
  },
  {
    name: 'Setup - Train Coordinator tab',
    path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=train-coordinator`,
  },
  {
    name: 'Setup - Test Coordinator (Single Message) tab',
    path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=test-coordinator`,
  },
  {
    name: 'Setup - Bulk Testing tab',
    path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=bulk-testing`,
  },
  {
    name: 'Setup - Flagged Messages tab',
    path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=flagged-messages`,
  },
  {
    name: 'VC Draft page',
    path: `/#/virtual-coordinator-draft?agentId=${AGENT_ID}&versionId=${VERSION_ID}`,
  },
  {
    name: 'VC Overview page',
    path: `/#/virtual-coordinator-overview?agentId=${AGENT_ID}`,
  },
];

// ─── Login helper ─────────────────────────────────────────────────────────────
async function login(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  const isLoginPage =
    page.url().includes('login') ||
    page.url().includes('sign-in') ||
    (await page.locator('input[type="password"]').count()) > 0;

  if (isLoginPage) {
    await page.fill('input[type="email"], input[name="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1500);
  }
}

// ─── Reusable check helpers ───────────────────────────────────────────────────

// TC-01/02/03: No horizontal scroll
async function checkNoHorizontalScroll(page, label) {
  const hasScroll = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasScroll, `[${label}] Horizontal scrollbar should not be present`).toBe(false);
}

// TC-01/02/03: No elements overflow viewport
async function checkNoOverflow(page, label, viewportWidth) {
  const offenders = await page.evaluate((vw) => {
    return Array.from(document.querySelectorAll('*'))
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.right > vw + 5 && r.width > 0 && r.height > 0;
      })
      .map(el => ({
        tag: el.tagName,
        class: (el.className || '').toString().slice(0, 80),
        right: Math.round(el.getBoundingClientRect().right),
      }))
      .slice(0, 10);
  }, viewportWidth);

  if (offenders.length > 0) {
    console.log(`[${label}] Overflowing elements:`, offenders);
  }
  expect(offenders.length, `[${label}] No elements should overflow the viewport`).toBe(0);
}

// TC-04: Interactive elements visible and not clipped
async function checkInteractiveElements(page, label, viewportWidth) {
  const selectors = [
    { name: 'buttons',    sel: 'button:visible' },
    { name: 'inputs',     sel: 'input:visible, textarea:visible, select:visible' },
    { name: 'tabs',       sel: '[role="tab"]:visible' },
    { name: 'nav links',  sel: 'nav a:visible, [class*="sidebar"] a:visible' },
  ];

  for (const { name, sel } of selectors) {
    const els = page.locator(sel);
    const count = await els.count();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const el  = els.nth(i);
      const box = await el.boundingBox();
      if (!box) continue;
      expect(
        box.x + box.width,
        `[${label}] ${name}[${i}] should not overflow viewport`
      ).toBeLessThanOrEqual(viewportWidth + 5);
      expect(box.x, `[${label}] ${name}[${i}] should not start before viewport`).toBeGreaterThanOrEqual(-5);
      expect(box.width, `[${label}] ${name}[${i}] should have positive width`).toBeGreaterThan(0);
    }
  }
}

// TC-05: Bulk Testing table check
async function checkBulkTestingTable(page, label, viewportWidth) {
  const tableLocator = page.locator('table:visible').first();
  const tableVisible = await tableLocator.isVisible().catch(() => false);

  if (!tableVisible) {
    console.warn(`[${label}] No table found on Bulk Testing page`);
    return;
  }

  const box = await tableLocator.boundingBox();
  if (!box) return;

  expect(
    box.x + box.width,
    `[${label}] Table should not overflow viewport`
  ).toBeLessThanOrEqual(viewportWidth + 5);

  // Check table rows are visible
  const rows = page.locator('table tr:visible');
  const rowCount = await rows.count();
  expect(rowCount, `[${label}] Table should have at least one row`).toBeGreaterThan(0);
}

// TC-07: Modal renders correctly
async function checkModal(page, label, viewportWidth) {
  // Try to find any open modal
  const modalLocator = page.locator(
    '[role="dialog"]:visible, [class*="modal"]:visible, [class*="overlay"]:visible'
  ).first();
  const modalVisible = await modalLocator.isVisible().catch(() => false);

  if (!modalVisible) return; // skip if no modal open

  const box = await modalLocator.boundingBox();
  if (!box) return;

  expect(box.x, `[${label}] Modal left edge should be within viewport`).toBeGreaterThanOrEqual(0);
  expect(box.y, `[${label}] Modal top edge should be within viewport`).toBeGreaterThanOrEqual(0);
  expect(
    box.x + box.width,
    `[${label}] Modal right edge should be within viewport`
  ).toBeLessThanOrEqual(viewportWidth + 5);
}

// TC-08: Dropdowns render correctly
async function checkDropdowns(page, label, viewportWidth, viewportHeight) {
  const dropdownTriggers = page.locator(
    'select:visible, [class*="dropdown"]:visible, [class*="select"]:visible'
  );
  const count = await dropdownTriggers.count();

  for (let i = 0; i < Math.min(count, 5); i++) {
    const trigger = dropdownTriggers.nth(i);
    const box = await trigger.boundingBox();
    if (!box) continue;

    expect(
      box.x + box.width,
      `[${label}] Dropdown[${i}] should not overflow viewport horizontally`
    ).toBeLessThanOrEqual(viewportWidth + 5);
    expect(
      box.y + box.height,
      `[${label}] Dropdown[${i}] should not overflow viewport vertically`
    ).toBeLessThanOrEqual(viewportHeight + 5);
  }
}

// TC-09: Toast notifications
async function checkToasts(page, label, viewportWidth) {
  const toastLocator = page.locator(
    '[class*="toast"]:visible, [class*="snackbar"]:visible, [class*="notification"]:visible, [role="alert"]:visible'
  ).first();
  const toastVisible = await toastLocator.isVisible().catch(() => false);
  if (!toastVisible) return;

  const box = await toastLocator.boundingBox();
  if (!box) return;

  expect(
    box.x + box.width,
    `[${label}] Toast should not overflow viewport`
  ).toBeLessThanOrEqual(viewportWidth + 5);
  expect(box.x, `[${label}] Toast left edge in viewport`).toBeGreaterThanOrEqual(0);
}

// ─── Test Suites ─────────────────────────────────────────────────────────────

for (const res of RESOLUTIONS) {
  test.describe(`AS-1360 | ${res.name}`, () => {
    test.use({ viewport: { width: res.width, height: res.height } });

    let loggedIn = false;

    test.beforeEach(async ({ page }) => {
      if (!loggedIn) {
        await login(page);
        loggedIn = true;
      }
    });

    // ── TC-01/02/03: Layout renders correctly on all pages ─────────────────
    for (const vcPage of VC_PAGES) {
      test(`TC-01/02/03 | Layout renders correctly — ${vcPage.name}`, async ({ page }) => {
        await login(page);
        await page.goto(`${BASE_URL}${vcPage.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        const label = `${res.name} | ${vcPage.name}`;
        await checkNoHorizontalScroll(page, label);
        await checkNoOverflow(page, label, res.width);

        // Screenshot for visual review
        const safeName = vcPage.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        await page.screenshot({
          path: `screenshots/${res.name}_${safeName}.png`,
          fullPage: false,
        });
      });
    }

    // ── TC-04: Interactive elements accessible on all pages ────────────────
    for (const vcPage of VC_PAGES) {
      test(`TC-04 | Interactive elements accessible — ${vcPage.name}`, async ({ page }) => {
        await login(page);
        await page.goto(`${BASE_URL}${vcPage.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        const label = `${res.name} | ${vcPage.name}`;
        await checkInteractiveElements(page, label, res.width);
      });
    }

    // ── TC-05: Bulk Testing table ──────────────────────────────────────────
    test('TC-05 | Bulk Testing table — no clipping or horizontal overflow', async ({ page }) => {
      await login(page);
      const bulkPage = VC_PAGES.find(p => p.name.includes('Bulk Testing'));
      await page.goto(`${BASE_URL}${bulkPage.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      const label = `${res.name} | Bulk Testing`;
      await checkBulkTestingTable(page, label, res.width);
    });

    // ── TC-06: Window resize does not break layout ─────────────────────────
    test('TC-06 | Window resize does not break layout', async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', 'Resize not supported in WebKit');

      await login(page);
      await page.goto(
        `${BASE_URL}/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}`,
        { waitUntil: 'networkidle' }
      );

      // Resize from current resolution down to 1366x768 in steps
      const steps = [
        { width: res.width,  height: res.height },
        { width: 1600,       height: 900 },
        { width: 1440,       height: 900 },
        { width: 1366,       height: 768 },
      ].filter(s => s.width <= res.width); // only resize down

      for (const step of steps) {
        await page.setViewportSize({ width: step.width, height: step.height });
        await page.waitForTimeout(500);

        const label = `${res.name}→${step.width}x${step.height}`;
        await checkNoHorizontalScroll(page, label);
        await checkInteractiveElements(page, label, step.width);
      }
    });

    // ── TC-07: Modals render correctly ─────────────────────────────────────
    test('TC-07 | Modals render fully on-screen', async ({ page }) => {
      await login(page);
      await page.goto(
        `${BASE_URL}/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}`,
        { waitUntil: 'networkidle' }
      );
      await page.waitForTimeout(1500);

      // Try to trigger a modal by clicking common modal triggers
      const modalTriggers = page.locator(
        'button:has-text("Cancel"), button:has-text("Delete"), button:has-text("Confirm"), [data-modal], [data-toggle="modal"]'
      );
      const count = await modalTriggers.count();

      if (count > 0) {
        await modalTriggers.first().click();
        await page.waitForTimeout(800);
        const label = `${res.name} | Modal`;
        await checkModal(page, label, res.width);
        // Close modal
        await page.keyboard.press('Escape');
      } else {
        console.warn(`[${res.name}] No modal triggers found — skipping modal check`);
      }
    });

    // ── TC-08: Dropdowns render correctly ─────────────────────────────────
    for (const vcPage of VC_PAGES.slice(0, 3)) {
      test(`TC-08 | Dropdowns render correctly — ${vcPage.name}`, async ({ page }) => {
        await login(page);
        await page.goto(`${BASE_URL}${vcPage.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        const label = `${res.name} | ${vcPage.name}`;
        await checkDropdowns(page, label, res.width, res.height);
      });
    }

    // ── TC-09: Toast notifications render correctly ────────────────────────
    test('TC-09 | Toast notifications render fully on-screen', async ({ page }) => {
      await login(page);
      await page.goto(
        `${BASE_URL}/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}`,
        { waitUntil: 'networkidle' }
      );
      await page.waitForTimeout(1500);

      // Try to trigger a toast by saving
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Save as Draft")').first();
      const saveVisible = await saveBtn.isVisible().catch(() => false);

      if (saveVisible) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
        const label = `${res.name} | Toast`;
        await checkToasts(page, label, res.width);
      } else {
        console.warn(`[${res.name}] No save button found — skipping toast check`);
      }
    });

  });
}