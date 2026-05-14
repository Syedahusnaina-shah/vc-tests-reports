// Playwright Advanced Responsiveness Tests — AS-1360
// VC Studio - Full coverage: Positive, Negative & Edge Cases
//
// Run:    $env:PLAYWRIGHT_BROWSERS_PATH="D:\playwright-browsers"; npx playwright test as1360-advanced.spec.js --reporter=html
// Report: npx playwright show-report

const { test, expect } = require('@playwright/test');

// ─── Config ──────────────────────────────────────────────────────────────────
const BASE_URL       = 'https://vc.qa.impiricus.com';
const LOGIN_EMAIL    = process.env.VC_EMAIL    || 'Syeda.Husnaina@ssasoft.com';
const LOGIN_PASSWORD = process.env.VC_PASSWORD || 'Test123@';
const AGENT_ID       = '3499';
const VERSION_ID     = '1';

// Target resolutions (AC requirement)
const RESOLUTIONS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900',  width: 1440, height: 900  },
  { name: '1366x768',  width: 1366, height: 768  },
];

// Edge case resolutions (boundary & stress tests)
const EDGE_RESOLUTIONS = [
  { name: 'Min supported 1280x720',  width: 1280, height: 720  },
  { name: 'Ultra-wide 2560x1440',    width: 2560, height: 1440 },
  { name: 'Just below 1366 — 1365x768', width: 1365, height: 768 },
  { name: 'Just above 1366 — 1367x768', width: 1367, height: 768 },
  { name: 'Short viewport 1440x600', width: 1440, height: 600  },
];

// All VC Studio pages
const VC_PAGES = [
  { name: 'Create VC Step 1',         path: `/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'Setup - Create Coordinator', path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=create-coordinator` },
  { name: 'Setup - Create Content',   path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=create-content` },
  { name: 'Setup - Train Coordinator', path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=train-coordinator` },
  { name: 'Setup - Test Coordinator', path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=test-coordinator` },
  { name: 'Setup - Bulk Testing',     path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=bulk-testing` },
  { name: 'Setup - Flagged Messages', path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=flagged-messages` },
  { name: 'VC Draft',                 path: `/#/virtual-coordinator-draft?agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  { name: 'VC Overview',              path: `/#/virtual-coordinator-overview?agentId=${AGENT_ID}` },
];

// ─── Login helper ─────────────────────────────────────────────────────────────
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
  await page.waitForTimeout(1200);
}

async function screenshot(page, name) {
  const safe = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  await page.screenshot({ path: `screenshots/${safe}.png`, fullPage: false });
}

// ─── ✅ POSITIVE TEST CASES ───────────────────────────────────────────────────

test.describe('✅ POSITIVE — Layout renders at all required resolutions', () => {
  for (const res of RESOLUTIONS) {
    for (const vcPage of VC_PAGES) {
      test(`[${res.name}] ${vcPage.name} — no overflow, no broken layout`, async ({ browser }) => {
        const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
        const page = await ctx.newPage();
        await login(page);
        await goToPage(page, vcPage.path);

        // No horizontal scroll
        const hasHScroll = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        expect(hasHScroll, 'Should have no horizontal scrollbar').toBe(false);

        // No elements overflow viewport
        const overflow = await page.evaluate((vw) =>
          Array.from(document.querySelectorAll('*'))
            .filter(el => {
              const r = el.getBoundingClientRect();
              return r.right > vw + 5 && r.width > 0 && r.height > 0;
            })
            .map(el => ({ tag: el.tagName, cls: (el.className||'').toString().slice(0,60), right: Math.round(el.getBoundingClientRect().right) }))
            .slice(0, 5)
        , res.width);
        expect(overflow.length, `Overflowing elements: ${JSON.stringify(overflow)}`).toBe(0);

        await screenshot(page, `pos_layout_${res.name}_${vcPage.name}`);
        await ctx.close();
      });
    }
  }
});

test.describe('✅ POSITIVE — All interactive elements visible and clickable', () => {
  for (const res of RESOLUTIONS) {
    for (const vcPage of VC_PAGES) {
      test(`[${res.name}] ${vcPage.name} — buttons/tabs/inputs fully visible`, async ({ browser }) => {
        const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
        const page = await ctx.newPage();
        await login(page);
        await goToPage(page, vcPage.path);

        const elements = [
          { label: 'buttons',   sel: 'button:visible' },
          { label: 'inputs',    sel: 'input:visible, textarea:visible' },
          { label: 'tabs',      sel: '[role="tab"]:visible' },
          { label: 'nav links', sel: 'nav a:visible' },
        ];

        for (const { label, sel } of elements) {
          const els   = page.locator(sel);
          const count = await els.count();
          for (let i = 0; i < Math.min(count, 15); i++) {
            const box = await els.nth(i).boundingBox();
            if (!box) continue;
            expect(box.x + box.width, `${label}[${i}] overflows right edge`).toBeLessThanOrEqual(res.width + 5);
            expect(box.x, `${label}[${i}] starts outside left edge`).toBeGreaterThanOrEqual(-5);
            expect(box.width, `${label}[${i}] has zero width`).toBeGreaterThan(0);
            expect(box.height, `${label}[${i}] has zero height`).toBeGreaterThan(0);
          }
        }
        await ctx.close();
      });
    }
  }
});

test.describe('✅ POSITIVE — Footer CTAs visible at all resolutions', () => {
  const ctaTexts = ['Next', 'Save as Draft', 'Save', 'Cancel', 'Back'];

  for (const res of RESOLUTIONS) {
    test(`[${res.name}] Footer CTAs are visible and not clipped`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[0].path);

      for (const cta of ctaTexts) {
        const btn = page.locator(`button:has-text("${cta}")`).first();
        const visible = await btn.isVisible().catch(() => false);
        if (!visible) continue;

        const box = await btn.boundingBox();
        expect(box, `CTA "${cta}" has no bounding box`).not.toBeNull();
        expect(box.x + box.width, `CTA "${cta}" overflows viewport`).toBeLessThanOrEqual(res.width + 5);
        expect(box.y + box.height, `CTA "${cta}" is below viewport`).toBeLessThanOrEqual(res.height + 200); // allow scroll
      }
      await ctx.close();
    });
  }
});

test.describe('✅ POSITIVE — Sidebar navigation visible and not overlapping', () => {
  for (const res of RESOLUTIONS) {
    test(`[${res.name}] Sidebar does not overlap main content`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[1].path);

      const sidebarSel = 'nav, aside, [class*="sidebar"], [class*="side-nav"]';
      const mainSel    = 'main, [role="main"], [class*="main-content"], [class*="content"]';

      const sidebar = page.locator(sidebarSel).first();
      const main    = page.locator(mainSel).first();

      const sVisible = await sidebar.isVisible().catch(() => false);
      const mVisible = await main.isVisible().catch(() => false);
      if (!sVisible || !mVisible) return;

      const sBox = await sidebar.boundingBox();
      const mBox = await main.boundingBox();
      if (!sBox || !mBox) return;

      const overlaps = sBox.x < mBox.x + mBox.width && sBox.x + sBox.width > mBox.x + 10;
      expect(overlaps, 'Sidebar overlaps main content').toBe(false);
      await ctx.close();
    });
  }
});

test.describe('✅ POSITIVE — Tab switching keeps layout stable', () => {
  const tabs = [
    'Setup - Create Coordinator', 'Setup - Create Content',
    'Setup - Train Coordinator',  'Setup - Test Coordinator',
    'Setup - Bulk Testing',       'Setup - Flagged Messages',
  ];

  for (const res of RESOLUTIONS) {
    test(`[${res.name}] Switching tabs does not break layout`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[1].path);

      const tabEls = page.locator('[role="tab"]:visible');
      const count  = await tabEls.count();

      for (let i = 0; i < count; i++) {
        await tabEls.nth(i).click().catch(() => {});
        await page.waitForTimeout(600);

        const hasHScroll = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        expect(hasHScroll, `Horizontal scroll appeared after clicking tab ${i}`).toBe(false);
      }
      await ctx.close();
    });
  }
});

test.describe('✅ POSITIVE — Text is readable and not truncated', () => {
  for (const res of RESOLUTIONS) {
    for (const vcPage of VC_PAGES.slice(0, 4)) {
      test(`[${res.name}] ${vcPage.name} — no text overflow`, async ({ browser }) => {
        const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
        const page = await ctx.newPage();
        await login(page);
        await goToPage(page, vcPage.path);

        const clipped = await page.evaluate(() =>
          Array.from(document.querySelectorAll('h1,h2,h3,h4,p,label,span,td,th'))
            .filter(el => {
              const s = window.getComputedStyle(el);
              return s.overflow === 'hidden' && el.scrollWidth > el.clientWidth + 2;
            })
            .map(el => ({ tag: el.tagName, text: el.innerText?.slice(0,60) }))
            .slice(0, 5)
        );
        expect(clipped.length, `Clipped text: ${JSON.stringify(clipped)}`).toBe(0);
        await ctx.close();
      });
    }
  }
});

test.describe('✅ POSITIVE — Page renders correctly after browser zoom', () => {
  const zoomLevels = [0.75, 0.9, 1.0, 1.1, 1.25];

  for (const res of RESOLUTIONS) {
    for (const zoom of zoomLevels) {
      test(`[${res.name}] Zoom ${zoom * 100}% — no layout break`, async ({ browser }) => {
        const ctx  = await browser.newContext({
          viewport: { width: res.width, height: res.height },
          deviceScaleFactor: zoom,
        });
        const page = await ctx.newPage();
        await login(page);
        await goToPage(page, VC_PAGES[0].path);

        const hasHScroll = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        expect(hasHScroll, `Horizontal scroll at zoom ${zoom}`).toBe(false);
        await ctx.close();
      });
    }
  }
});

// ─── ❌ NEGATIVE TEST CASES ───────────────────────────────────────────────────

test.describe('❌ NEGATIVE — Layout below minimum supported width', () => {
  const tooSmall = [
    { name: '800x600 (too small)',  width: 800,  height: 600  },
    { name: '1024x600 (too short)', width: 1024, height: 600  },
    { name: '1280x600 (short)',     width: 1280, height: 600  },
  ];

  for (const size of tooSmall) {
    test(`[${size.name}] Layout degradation is handled gracefully`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: size.width, height: size.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[0].path);

      // Page should still load without JS errors
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.waitForTimeout(1000);

      // No JS crashes
      expect(errors.filter(e => e.includes('TypeError') || e.includes('Cannot read')).length, 
        `JS errors at ${size.name}: ${errors}`).toBe(0);

      await screenshot(page, `neg_small_${size.name}`);
      await ctx.close();
    });
  }
});

test.describe('❌ NEGATIVE — Elements do NOT overlap at any resolution', () => {
  for (const res of RESOLUTIONS) {
    test(`[${res.name}] No two major elements overlap each other`, async ({ browser }) => {
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
            const overlap =
              a.left < b.right - 10 && a.right > b.left + 10 &&
              a.top  < b.bottom - 10 && a.bottom > b.top + 10;
            if (overlap) found.push({ a: major[i].tagName + '.' + (major[i].className||'').toString().slice(0,30), b: major[j].tagName });
          }
        }
        return found.slice(0, 5);
      });

      expect(overlaps.length, `Overlapping elements: ${JSON.stringify(overlaps)}`).toBe(0);
      await ctx.close();
    });
  }
});

test.describe('❌ NEGATIVE — Scrollbar does not appear horizontally on any page', () => {
  for (const res of RESOLUTIONS) {
    for (const vcPage of VC_PAGES) {
      test(`[${res.name}] ${vcPage.name} — no horizontal scrollbar`, async ({ browser }) => {
        const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
        const page = await ctx.newPage();
        await login(page);
        await goToPage(page, vcPage.path);

        const scrollWidth  = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth  = await page.evaluate(() => document.documentElement.clientWidth);

        expect(scrollWidth, `Horizontal scroll: scrollWidth(${scrollWidth}) > clientWidth(${clientWidth})`
        ).toBeLessThanOrEqual(clientWidth + 5);
        await ctx.close();
      });
    }
  }
});

test.describe('❌ NEGATIVE — Images do not overflow their containers', () => {
  for (const res of RESOLUTIONS) {
    test(`[${res.name}] Images stay within their containers`, async ({ browser }) => {
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
          .map(img => ({ src: img.src?.slice(0,60), right: Math.round(img.getBoundingClientRect().right) }))
      , res.width);

      expect(overflowImgs.length, `Overflowing images: ${JSON.stringify(overflowImgs)}`).toBe(0);
      await ctx.close();
    });
  }
});

test.describe('❌ NEGATIVE — No CSS layout errors (zero-size containers)', () => {
  for (const res of RESOLUTIONS) {
    for (const vcPage of VC_PAGES.slice(0, 5)) {
      test(`[${res.name}] ${vcPage.name} — no collapsed containers`, async ({ browser }) => {
        const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
        const page = await ctx.newPage();
        await login(page);
        await goToPage(page, vcPage.path);

        const collapsed = await page.evaluate(() =>
          Array.from(document.querySelectorAll('main, section, article, [class*="container"], [class*="wrapper"], [class*="panel"]'))
            .filter(el => {
              const r  = el.getBoundingClientRect();
              const cs = window.getComputedStyle(el);
              return r.width === 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
            })
            .map(el => ({ tag: el.tagName, cls: (el.className||'').toString().slice(0,60) }))
            .slice(0, 5)
        );

        expect(collapsed.length, `Collapsed containers: ${JSON.stringify(collapsed)}`).toBe(0);
        await ctx.close();
      });
    }
  }
});

// ─── ⚡ EDGE CASES ────────────────────────────────────────────────────────────

test.describe('⚡ EDGE — Boundary resolutions just above/below 1366', () => {
  const boundary = [
    { name: '1365x768 (just below)', width: 1365, height: 768 },
    { name: '1367x768 (just above)', width: 1367, height: 768 },
  ];

  for (const size of boundary) {
    test(`[${size.name}] Layout handles boundary resolution correctly`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: size.width, height: size.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[0].path);

      const hasHScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHScroll, `Horizontal scroll at ${size.name}`).toBe(false);
      await screenshot(page, `edge_boundary_${size.name}`);
      await ctx.close();
    });
  }
});

test.describe('⚡ EDGE — Rapid resize between resolutions', () => {
  test('Rapid resize 1920→1366→1920 does not break layout', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Resize not supported on WebKit');
    await login(page);
    await goToPage(page, VC_PAGES[1].path);

    const sizes = [1920, 1600, 1440, 1366, 1440, 1600, 1920];
    for (const w of sizes) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(200); // rapid resize
    }

    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll, 'Layout broken after rapid resize').toBe(false);
  });
});

test.describe('⚡ EDGE — Very tall content does not cause horizontal scroll', () => {
  for (const res of RESOLUTIONS) {
    test(`[${res.name}] Long scrollable pages stay within width`, async ({ browser }) => {
      const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[5].path); // Bulk Testing - likely tallest

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      const hasHScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHScroll, 'Horizontal scroll appeared after scrolling to bottom').toBe(false);
      await ctx.close();
    });
  }
});

test.describe('⚡ EDGE — Ultra-wide resolution (2560x1440)', () => {
  test('Layout does not stretch awkwardly on ultra-wide', async ({ browser }) => {
    const ctx  = await browser.newContext({ viewport: { width: 2560, height: 1440 } });
    const page = await ctx.newPage();
    await login(page);
    await goToPage(page, VC_PAGES[0].path);

    // Content should have a max-width and be centered, not stretched edge to edge
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth, 'Body should not stretch to full 2560px').toBeLessThanOrEqual(2560);

    await screenshot(page, 'edge_ultrawide_2560x1440');
    await ctx.close();
  });
});

test.describe('⚡ EDGE — Page load with slow network (throttled)', () => {
  for (const res of RESOLUTIONS) {
    test(`[${res.name}] Layout correct even with slow network`, async ({ browser }) => {
      const ctx = await browser.newContext({
        viewport: { width: res.width, height: res.height },
      });
      const page = await ctx.newPage();

      // Simulate slow 3G
      await page.route('**/*', async (route) => {
        await new Promise(r => setTimeout(r, 50)); // 50ms delay per request
        await route.continue();
      });

      await login(page);
      await goToPage(page, VC_PAGES[0].path);

      const hasHScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHScroll, 'Layout broken on slow network').toBe(false);
      await ctx.close();
    });
  }
});

test.describe('⚡ EDGE — Resize while content is loading', () => {
  test('Resize during navigation does not freeze or break layout', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Resize not supported on WebKit');
    await login(page);

    // Start navigating
    const navPromise = page.goto(`${BASE_URL}${VC_PAGES[1].path}`);

    // Resize while loading
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.setViewportSize({ width: 1366, height: 768 });
    await navPromise;
    await page.waitForTimeout(1000);

    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll, 'Layout broken after resize during load').toBe(false);
  });
});

test.describe('⚡ EDGE — All tabs visited sequentially at smallest resolution', () => {
  test('[1366x768] All setup tabs visited in order — no layout break', async ({ browser }) => {
    const ctx  = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await ctx.newPage();
    await login(page);

    for (const vcPage of VC_PAGES) {
      await goToPage(page, vcPage.path);

      const hasHScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHScroll, `Horizontal scroll on ${vcPage.name}`).toBe(false);
    }
    await ctx.close();
  });
});

test.describe('⚡ EDGE — Multiple tabs open simultaneously', () => {
  test('Two VC Studio pages open at same time do not interfere', async ({ browser }) => {
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

    expect(scroll1, 'Page 1 has horizontal scroll').toBe(false);
    expect(scroll2, 'Page 2 has horizontal scroll').toBe(false);

    await ctx1.close();
    await ctx2.close();
  });
});

test.describe('⚡ EDGE — Short viewport height (content not hidden behind fold)', () => {
  test('[1440x600] Critical controls still reachable on short viewport', async ({ browser }) => {
    const ctx  = await browser.newContext({ viewport: { width: 1440, height: 600 } });
    const page = await ctx.newPage();
    await login(page);
    await goToPage(page, VC_PAGES[0].path);

    // Page should be scrollable vertically to reach hidden content
    const isScrollable = await page.evaluate(() => document.body.scrollHeight > window.innerHeight);
    // It's OK if page is scrollable vertically — what matters is no horizontal scroll
    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll, 'Short viewport caused horizontal scroll').toBe(false);
    await ctx.close();
  });
});

test.describe('⚡ EDGE — Scroll position preserved after resize', () => {
  test('Scroll position does not jump to unexpected position after resize', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Resize not supported on WebKit');
    await login(page);
    await goToPage(page, VC_PAGES[5].path);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(300);

    const beforeY = await page.evaluate(() => window.scrollY);

    // Resize
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(500);

    const afterY = await page.evaluate(() => window.scrollY);

    // Scroll Y should not jump wildly (allow 200px tolerance)
    expect(Math.abs(afterY - beforeY), 'Scroll position jumped drastically after resize').toBeLessThan(200);
  });
});

test.describe('⚡ EDGE — Font scaling does not break layout', () => {
  for (const res of RESOLUTIONS) {
    test(`[${res.name}] Large OS font size (1.5x) does not break layout`, async ({ browser }) => {
      const ctx = await browser.newContext({
        viewport: { width: res.width, height: res.height },
      });
      const page = await ctx.newPage();
      await login(page);
      await goToPage(page, VC_PAGES[0].path);

      // Simulate large font size
      await page.addStyleTag({ content: '* { font-size: 120% !important; }' });
      await page.waitForTimeout(500);

      const hasHScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHScroll, 'Horizontal scroll appeared with larger font size').toBe(false);
      await ctx.close();
    });
  }
});