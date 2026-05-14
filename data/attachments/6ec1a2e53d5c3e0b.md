# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: as1360-complete.spec.js >> 🟢 BULK TESTING — Upload, Results & Responsiveness >> ✅ TC-B10 | Filter All/Correct/Incorrect buttons work
- Location: as1360-complete.spec.js:329:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('input[type="email"], input[name="email"]')

```

# Page snapshot

```yaml
- generic [ref=e10]:
  - img "IMPIRICUS VC STUDIO" [ref=e12]
  - generic [ref=e13]:
    - heading "Impiricus Virtual Coordinator" [level=1] [ref=e14]
    - paragraph [ref=e15]: Welcome Back! Please enter your details
  - generic [ref=e21]:
    - generic [ref=e22]: Email *
    - textbox "Please enter your email" [ref=e23]
  - generic [ref=e29]:
    - generic [ref=e30]: Password *
    - generic [ref=e31]:
      - textbox "Please enter your password" [ref=e32]
      - img "eye-invisible" [ref=e34] [cursor=pointer]:
        - img [ref=e35]
  - link "Forget Password?" [ref=e39] [cursor=pointer]:
    - /url: "#/forget-password"
  - button "Sign In" [ref=e40] [cursor=pointer]:
    - generic [ref=e41]: Sign In
```

# Test source

```ts
  1   | // ============================================================
  2   | // Playwright Complete Test Suite — AS-1360
  3   | // VC Studio - Responsiveness + Bulk Testing + Single Testing + Flagged Messages
  4   | //
  5   | // Agent ID: 3631 | Version ID: 1
  6   | // CSV: f150_bulk_testing.csv (message, expected_category)
  7   | //
  8   | // Run:    $env:PLAYWRIGHT_BROWSERS_PATH="D:\playwright-browsers"; npx playwright test as1360-complete.spec.js --reporter=html
  9   | // Report: npx playwright show-report
  10  | // ============================================================
  11  | 
  12  | const { test, expect } = require('@playwright/test');
  13  | const path = require('path');
  14  | const fs   = require('fs');
  15  | 
  16  | // ─── Config ──────────────────────────────────────────────────────────────────
  17  | const BASE_URL       = 'https://vc.qa.impiricus.com';
  18  | const LOGIN_EMAIL    = process.env.VC_EMAIL    || 'Syeda.Husnaina@ssasoft.com';
  19  | const LOGIN_PASSWORD = process.env.VC_PASSWORD || 'Test123@';
  20  | const AGENT_ID       = '3631';
  21  | const VERSION_ID     = '1';
  22  | 
  23  | // Target resolutions from AC
  24  | const RESOLUTIONS = [
  25  |   { name: '1920x1080', width: 1920, height: 1080 },
  26  |   { name: '1440x900',  width: 1440, height: 900  },
  27  |   { name: '1366x768',  width: 1366, height: 768  },
  28  | ];
  29  | 
  30  | // All VC Studio pages
  31  | const VC_PAGES = [
  32  |   { name: 'Create VC Step 1',           path: `/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  33  |   { name: 'Setup - Create Coordinator', path: `/#/create-virtual-coordinator?edit=true&step=3&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  34  |   { name: 'Setup - Create Content',     path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=create-content` },
  35  |   { name: 'Setup - Train Coordinator',  path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=train-coordinator` },
  36  |   { name: 'Setup - Test Coordinator',   path: `/#/create-virtual-coordinator?edit=true&step=3&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  37  |   { name: 'Setup - Bulk Testing',       path: `/#/create-virtual-coordinator?edit=true&step=3&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  38  |   { name: 'Setup - Flagged Messages',   path: `/#/virtual-coordinator-setup?agentId=${AGENT_ID}&versionId=${VERSION_ID}&tab=flagged-messages` },
  39  |   { name: 'VC Draft',                   path: `/#/virtual-coordinator-draft?agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  40  |   { name: 'VC Overview',                path: `/#/virtual-coordinator-overview?agentId=${AGENT_ID}` },
  41  | ];
  42  | 
  43  | // CSV file path
  44  | const CSV_PATH = path.resolve(__dirname, 'f150_bulk_testing.csv');
  45  | 
  46  | // Create CSV if missing
  47  | if (!fs.existsSync(CSV_PATH)) {
  48  |   fs.writeFileSync(CSV_PATH, 'message,expected_category\ncolors,colors\ncolors,engine\nwhat engines does it offer,engine\n');
  49  | }
  50  | 
  51  | // ─── Helpers ─────────────────────────────────────────────────────────────────
  52  | async function login(page) {
  53  |   await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  54  |   const needsLogin =
  55  |     page.url().includes('login') ||
  56  |     page.url().includes('sign-in') ||
  57  |     (await page.locator('input[type="password"]').count()) > 0;
  58  | 
  59  |   if (needsLogin) {
> 60  |     await page.fill('input[type="email"], input[name="email"]', LOGIN_EMAIL);
      |                ^ Error: page.fill: Test timeout of 60000ms exceeded.
  61  |     await page.fill('input[type="password"], input[name="password"]', LOGIN_PASSWORD);
  62  |     await page.click('button[type="submit"]');
  63  |     await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  64  |     await page.waitForTimeout(1500);
  65  |   }
  66  | }
  67  | 
  68  | async function goToPage(page, path) {
  69  |   await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
  70  |   await page.waitForTimeout(1500);
  71  | }
  72  | 
  73  | async function screenshot(page, name) {
  74  |   const safe = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  75  |   await page.screenshot({ path: `screenshots/${safe}.png`, fullPage: false });
  76  | }
  77  | 
  78  | async function checkNoHorizontalScroll(page, label) {
  79  |   const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  80  |   const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  81  |   expect(scrollWidth, `[${label}] Horizontal scroll present`).toBeLessThanOrEqual(clientWidth + 5);
  82  | }
  83  | 
  84  | async function checkNoOverflow(page, label, vw) {
  85  |   const overflow = await page.evaluate((vw) =>
  86  |     Array.from(document.querySelectorAll('*'))
  87  |       .filter(el => {
  88  |         const r = el.getBoundingClientRect();
  89  |         return r.right > vw + 5 && r.width > 0 && r.height > 0;
  90  |       })
  91  |       .map(el => ({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60) }))
  92  |       .slice(0, 5)
  93  |   , vw);
  94  |   expect(overflow.length, `[${label}] Overflowing: ${JSON.stringify(overflow)}`).toBe(0);
  95  | }
  96  | 
  97  | async function checkButtonsVisible(page, label, vw) {
  98  |   const buttons = page.locator('button:visible');
  99  |   const count   = await buttons.count();
  100 |   for (let i = 0; i < Math.min(count, 20); i++) {
  101 |     const box = await buttons.nth(i).boundingBox();
  102 |     if (!box) continue;
  103 |     expect(box.x + box.width, `[${label}] Button[${i}] overflows right`).toBeLessThanOrEqual(vw + 5);
  104 |     expect(box.x, `[${label}] Button[${i}] outside left edge`).toBeGreaterThanOrEqual(-5);
  105 |     expect(box.width,  `[${label}] Button[${i}] zero width`).toBeGreaterThan(0);
  106 |     expect(box.height, `[${label}] Button[${i}] zero height`).toBeGreaterThan(0);
  107 |   }
  108 | }
  109 | 
  110 | async function checkTextNotClipped(page, label) {
  111 |   const clipped = await page.evaluate(() =>
  112 |     Array.from(document.querySelectorAll('h1,h2,h3,h4,p,label,span,td,th,button'))
  113 |       .filter(el => {
  114 |         const s = window.getComputedStyle(el);
  115 |         return s.overflow === 'hidden' && el.scrollWidth > el.clientWidth + 2;
  116 |       })
  117 |       .map(el => ({ tag: el.tagName, text: el.innerText?.slice(0, 60) }))
  118 |       .slice(0, 5)
  119 |   );
  120 |   expect(clipped.length, `[${label}] Clipped text: ${JSON.stringify(clipped)}`).toBe(0);
  121 | }
  122 | 
  123 | async function goToBulkTestingTab(page) {
  124 |   await goToPage(page, `/#/create-virtual-coordinator?edit=true&step=3&agentId=${AGENT_ID}&versionId=${VERSION_ID}`);
  125 |   const bulkTab = page.locator('text=Bulk testing').first();
  126 |   const visible = await bulkTab.isVisible().catch(() => false);
  127 |   if (visible) {
  128 |     await bulkTab.click();
  129 |     await page.waitForTimeout(800);
  130 |   }
  131 | }
  132 | 
  133 | async function goToSingleTestingTab(page) {
  134 |   await goToPage(page, `/#/create-virtual-coordinator?edit=true&step=3&agentId=${AGENT_ID}&versionId=${VERSION_ID}`);
  135 |   const singleTab = page.locator('text=Single Message Testing').first();
  136 |   const visible = await singleTab.isVisible().catch(() => false);
  137 |   if (visible) {
  138 |     await singleTab.click();
  139 |     await page.waitForTimeout(800);
  140 |   }
  141 | }
  142 | 
  143 | async function goToFlaggedTab(page) {
  144 |   await goToPage(page, `/#/create-virtual-coordinator?edit=true&step=3&agentId=${AGENT_ID}&versionId=${VERSION_ID}`);
  145 |   const flaggedTab = page.locator('text=Flagged messages').first();
  146 |   const visible = await flaggedTab.isVisible().catch(() => false);
  147 |   if (visible) {
  148 |     await flaggedTab.click();
  149 |     await page.waitForTimeout(800);
  150 |   }
  151 | }
  152 | 
  153 | // ─────────────────────────────────────────────────────────────────────────────
  154 | // 🔵 SECTION 1 — RESPONSIVENESS (all pages, all 3 resolutions)
  155 | // ─────────────────────────────────────────────────────────────────────────────
  156 | 
  157 | test.describe('🔵 RESPONSIVENESS — Layout correct on all pages', () => {
  158 |   for (const res of RESOLUTIONS) {
  159 |     for (const vcPage of VC_PAGES) {
  160 |       test(`[${res.name}] ${vcPage.name} — no overflow, no broken layout`, async ({ browser }) => {
```