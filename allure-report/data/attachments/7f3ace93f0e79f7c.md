# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: as1360-master.spec.js >> 🟢 BULK TESTING — Upload, Results & Responsiveness (AS-766) >> ❌ TC-B19 | Upload empty CSV (headers only) — handled gracefully
- Location: as1360-master.spec.js:588:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForTimeout: Target page, context or browser has been closed
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
    - textbox "Please enter your email" [ref=e23]: Syeda.Husnaina@ssasoft.com
  - generic [ref=e29]:
    - generic [ref=e30]: Password *
    - generic [ref=e31]:
      - textbox "Please enter your password" [ref=e32]: Test123@
      - img "eye-invisible" [ref=e34] [cursor=pointer]:
        - img [ref=e35]
  - link "Forget Password?" [ref=e39] [cursor=pointer]:
    - /url: "#/forget-password"
  - button "Sign In" [active] [ref=e40] [cursor=pointer]:
    - generic [ref=e41]: Sign In
```

# Test source

```ts
  1   | // ============================================================
  2   | // AS-1360 Master Test Suite — VC Studio
  3   | // Responsiveness + Login + Bulk Testing + Single Testing +
  4   | // Flagged Messages + Interactive Elements + Edge Cases
  5   | //
  6   | // Jira: AS-1360 (Page responsiveness across screen sizes)
  7   | //       AS-766  (Test Coordinator – Bulk Testing tab)
  8   | //
  9   | // Agent ID: 3631 | Version ID: 1
  10  | // CSV: f150_bulk_testing.csv (message, expected_category)
  11  | //
  12  | // Run:    $env:PLAYWRIGHT_BROWSERS_PATH="D:\playwright-browsers"; npx playwright test as1360-master.spec.js --reporter=html
  13  | // Allure: $env:PLAYWRIGHT_BROWSERS_PATH="D:\playwright-browsers"; $env:JAVA_HOME="C:\Program Files\Java\jre1.8.0_491"; npx playwright test as1360-master.spec.js; npx allure generate allure-results --clean -o allure-report
  14  | // ============================================================
  15  | 
  16  | const { test, expect } = require('@playwright/test');
  17  | const path = require('path');
  18  | const fs   = require('fs');
  19  | 
  20  | // ─── Config ──────────────────────────────────────────────────────────────────
  21  | const BASE_URL       = 'https://vc.qa.impiricus.com';
  22  | const LOGIN_EMAIL    = process.env.VC_EMAIL    || 'Syeda.Husnaina@ssasoft.com';
  23  | const LOGIN_PASSWORD = process.env.VC_PASSWORD || 'Test123@';
  24  | const AGENT_ID       = '3631';
  25  | const VERSION_ID     = '1';
  26  | 
  27  | // AC-required resolutions (AS-1360)
  28  | const RESOLUTIONS = [
  29  |   { name: '1920x1080', width: 1920, height: 1080 },
  30  |   { name: '1440x900',  width: 1440, height: 900  },
  31  |   { name: '1366x768',  width: 1366, height: 768  },
  32  | ];
  33  | 
  34  | // All VC Studio pages — agent 3631 uses wizard route (step=N), not tab route
  35  | const VC_PAGES = [
  36  |   { name: 'Create VC Step 1',           path: `/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  37  |   { name: 'Setup - Create Coordinator', path: `/#/create-virtual-coordinator?edit=true&step=0&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  38  |   { name: 'Setup - Train Coordinator',  path: `/#/create-virtual-coordinator?edit=true&step=1&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  39  |   { name: 'Setup - Create Content',     path: `/#/create-virtual-coordinator?edit=true&step=2&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  40  |   { name: 'Setup - Test Coordinator',   path: `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  41  |   { name: 'Setup - Bulk Testing',       path: `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  42  |   { name: 'Setup - Flagged Messages',   path: `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  43  |   { name: 'VC Draft',                   path: `/#/virtual-coordinator-draft?agentId=${AGENT_ID}&versionId=${VERSION_ID}` },
  44  |   { name: 'VC Overview',                path: `/#/virtual-coordinator-overview?agentId=${AGENT_ID}` },
  45  | ];
  46  | 
  47  | // CSV file for bulk testing
  48  | const CSV_PATH = path.resolve(__dirname, 'f150_bulk_testing.csv');
  49  | if (!fs.existsSync(CSV_PATH)) {
  50  |   fs.writeFileSync(CSV_PATH, 'message,expected_category\ncolors,colors\ncolors,engine\nwhat engines does it offer,engine\n');
  51  | }
  52  | 
  53  | // ─── Helpers ─────────────────────────────────────────────────────────────────
  54  | 
  55  | async function login(page) {
  56  |   await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  57  |   const needsLogin =
  58  |     page.url().includes('login') ||
  59  |     page.url().includes('sign-in') ||
  60  |     (await page.locator('input[type="password"]').count()) > 0;
  61  | 
  62  |   if (needsLogin) {
  63  |     await page.fill('input[type="email"], input[name="email"]', LOGIN_EMAIL);
  64  |     await page.fill('input[type="password"], input[name="password"]', LOGIN_PASSWORD);
  65  |     await page.click('button[type="submit"]');
  66  |     await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
> 67  |     await page.waitForTimeout(1500);
      |                ^ Error: page.waitForTimeout: Target page, context or browser has been closed
  68  |   }
  69  | }
  70  | 
  71  | async function goToPage(page, pagePath) {
  72  |   await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle' });
  73  |   await page.waitForTimeout(1500);
  74  | }
  75  | 
  76  | async function screenshot(page, name) {
  77  |   const safe = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  78  |   const dir  = path.resolve(__dirname, 'screenshots');
  79  |   if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  80  |   await page.screenshot({ path: `${dir}/${safe}.png`, fullPage: false });
  81  | }
  82  | 
  83  | async function checkNoHorizontalScroll(page, label) {
  84  |   const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  85  |   const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  86  |   expect(scrollWidth, `[${label}] Horizontal scroll present`).toBeLessThanOrEqual(clientWidth + 5);
  87  | }
  88  | 
  89  | async function checkNoOverflow(page, label, vw) {
  90  |   const overflow = await page.evaluate((vw) =>
  91  |     Array.from(document.querySelectorAll('*'))
  92  |       .filter(el => {
  93  |         const r = el.getBoundingClientRect();
  94  |         return r.right > vw + 5 && r.width > 0 && r.height > 0;
  95  |       })
  96  |       .map(el => ({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60) }))
  97  |       .slice(0, 5)
  98  |   , vw);
  99  |   expect(overflow.length, `[${label}] Overflowing: ${JSON.stringify(overflow)}`).toBe(0);
  100 | }
  101 | 
  102 | async function checkButtonsVisible(page, label, vw) {
  103 |   const buttons = page.locator('button:visible');
  104 |   const count   = await buttons.count();
  105 |   for (let i = 0; i < Math.min(count, 20); i++) {
  106 |     const box = await buttons.nth(i).boundingBox();
  107 |     if (!box) continue;
  108 |     expect(box.x + box.width, `[${label}] Button[${i}] overflows right`).toBeLessThanOrEqual(vw + 5);
  109 |     expect(box.x,             `[${label}] Button[${i}] outside left edge`).toBeGreaterThanOrEqual(-5);
  110 |     expect(box.width,         `[${label}] Button[${i}] zero width`).toBeGreaterThan(0);
  111 |     expect(box.height,        `[${label}] Button[${i}] zero height`).toBeGreaterThan(0);
  112 |   }
  113 | }
  114 | 
  115 | async function checkTextNotClipped(page, label) {
  116 |   const clipped = await page.evaluate(() =>
  117 |     Array.from(document.querySelectorAll('h1,h2,h3,h4,p,label,span,td,th,button'))
  118 |       .filter(el => {
  119 |         const s = window.getComputedStyle(el);
  120 |         return s.overflow === 'hidden' && el.scrollWidth > el.clientWidth + 2;
  121 |       })
  122 |       .map(el => ({ tag: el.tagName, text: el.innerText?.slice(0, 60) }))
  123 |       .slice(0, 5)
  124 |   );
  125 |   expect(clipped.length, `[${label}] Clipped text: ${JSON.stringify(clipped)}`).toBe(0);
  126 | }
  127 | 
  128 | async function checkInteractiveElements(page, label, vw) {
  129 |   const selectors = [
  130 |     { name: 'buttons',   sel: 'button:visible' },
  131 |     { name: 'inputs',    sel: 'input:visible, textarea:visible, select:visible' },
  132 |     { name: 'tabs',      sel: '[role="tab"]:visible' },
  133 |     { name: 'nav links', sel: 'nav a:visible' },
  134 |   ];
  135 |   for (const { name, sel } of selectors) {
  136 |     const els   = page.locator(sel);
  137 |     const count = await els.count();
  138 |     for (let i = 0; i < Math.min(count, 15); i++) {
  139 |       const box = await els.nth(i).boundingBox();
  140 |       if (!box) continue;
  141 |       expect(box.x + box.width, `[${label}] ${name}[${i}] overflows right`).toBeLessThanOrEqual(vw + 5);
  142 |       expect(box.x,             `[${label}] ${name}[${i}] starts before left edge`).toBeGreaterThanOrEqual(-5);
  143 |       expect(box.width,         `[${label}] ${name}[${i}] zero width`).toBeGreaterThan(0);
  144 |     }
  145 |   }
  146 | }
  147 | 
  148 | async function goToTestCoordinatorStep(page) {
  149 |   await goToPage(page, `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}`);
  150 | }
  151 | 
  152 | async function goToBulkTestingTab(page) {
  153 |   await goToTestCoordinatorStep(page);
  154 |   const tab = page.locator('text=Bulk testing').first();
  155 |   if (await tab.isVisible().catch(() => false)) {
  156 |     await tab.click();
  157 |     await page.waitForTimeout(800);
  158 |   }
  159 | }
  160 | 
  161 | async function goToSingleTestingTab(page) {
  162 |   await goToTestCoordinatorStep(page);
  163 |   const tab = page.locator('text=Single Message Testing').first();
  164 |   if (await tab.isVisible().catch(() => false)) {
  165 |     await tab.click();
  166 |     await page.waitForTimeout(800);
  167 |   }
```