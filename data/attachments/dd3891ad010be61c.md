# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: as1360-master.spec.js >> 🔴 FLAGGED MESSAGES — Tab loads & responsiveness >> ✅ TC-F02 | Flagged Messages shows table or empty state
- Location: as1360-master.spec.js:718:3

# Error details

```
Error: page.screenshot: Protocol error (Page.captureScreenshot): Unable to capture screenshot
Call log:
  - taking page screenshot
  - waiting for fonts to load...
  - fonts loaded

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e8]:
    - generic [ref=e10]:
      - generic [ref=e11]:
        - img [ref=e13]
        - heading "Virtual Coordinator Setup" [level=1] [ref=e17]
      - img "close" [ref=e19] [cursor=pointer]:
        - img [ref=e20]
    - generic [ref=e22]:
      - generic [ref=e25]:
        - generic [ref=e27]:
          - img [ref=e32] [cursor=pointer]
          - generic [ref=e39] [cursor=pointer]:
            - generic [ref=e40]: Create Coordinator
            - generic [ref=e41]: Add details to your project
        - generic [ref=e43]:
          - img [ref=e48] [cursor=pointer]
          - generic [ref=e55] [cursor=pointer]:
            - generic [ref=e56]: Train Coordinator
            - generic [ref=e57]: Upload data to start the training process
        - generic [ref=e59]:
          - img [ref=e64] [cursor=pointer]
          - generic [ref=e71] [cursor=pointer]:
            - generic [ref=e72]: Create Content
            - generic [ref=e73]: Manage VC response content
        - generic [ref=e75]:
          - img [ref=e80] [cursor=pointer]
          - generic [ref=e87] [cursor=pointer]:
            - generic [ref=e88]: Configure Notifications
            - generic [ref=e89]: Manage alerts based on VC categorizations
        - generic [ref=e91]:
          - img [ref=e96] [cursor=pointer]
          - generic [ref=e101] [cursor=pointer]:
            - generic [ref=e102]: Test Coordinator
            - generic [ref=e103]: Test the VC with example HCP messages
      - generic [ref=e108]:
        - generic [ref=e109]:
          - heading "Test Coordinator" [level=3] [ref=e110]
          - text: Test the VC with example HCP messages
        - generic [ref=e111]:
          - button "Single Message Testing" [ref=e112] [cursor=pointer]:
            - img [ref=e113]
            - text: Single Message Testing
          - button "Bulk testing" [ref=e115] [cursor=pointer]:
            - img [ref=e116]
            - text: Bulk testing
          - button "Flagged messages 2" [active] [ref=e118] [cursor=pointer]:
            - img [ref=e119]
            - text: Flagged messages
            - generic [ref=e121]: "2"
        - generic [ref=e126]:
          - table [ref=e130]:
            - rowgroup [ref=e131]:
              - row "Source HCP Message Expected Category Category Selected by VC Status Actions" [ref=e132]:
                - columnheader "Source" [ref=e133]
                - columnheader "HCP Message" [ref=e134]
                - columnheader "Expected Category" [ref=e135]
                - columnheader "Category Selected by VC" [ref=e136]
                - columnheader "Status" [ref=e137]
                - columnheader "Actions" [ref=e138]
            - rowgroup [ref=e139]:
              - row [ref=e140]:
                - columnheader [ref=e141]
                - columnheader [ref=e142]
                - columnheader [ref=e143]
                - columnheader [ref=e144]
                - columnheader [ref=e145]
                - columnheader [ref=e146]
              - row "Single hi N/A general_info Incorrect check-circle edit" [ref=e147]:
                - cell "Single" [ref=e148]
                - cell "hi" [ref=e149]:
                  - generic [ref=e150] [cursor=pointer]: hi
                - cell "N/A" [ref=e151]:
                  - generic [ref=e152]: N/A
                - cell "general_info" [ref=e153]:
                  - generic [ref=e154]: general_info
                - cell "Incorrect" [ref=e155]:
                  - generic [ref=e156]: Incorrect
                - cell "check-circle edit" [ref=e157]:
                  - generic [ref=e158]:
                    - button "check-circle" [ref=e159] [cursor=pointer]:
                      - img "check-circle" [ref=e160]:
                        - img [ref=e161]
                    - button "edit" [ref=e163] [cursor=pointer]:
                      - img "edit" [ref=e164]:
                        - img [ref=e165]
              - row "Single test N/A general_info Incorrect check-circle edit" [ref=e167]:
                - cell "Single" [ref=e168]
                - cell "test" [ref=e169]:
                  - generic [ref=e170] [cursor=pointer]: test
                - cell "N/A" [ref=e171]:
                  - generic [ref=e172]: N/A
                - cell "general_info" [ref=e173]:
                  - generic [ref=e174]: general_info
                - cell "Incorrect" [ref=e175]:
                  - generic [ref=e176]: Incorrect
                - cell "check-circle edit" [ref=e177]:
                  - generic [ref=e178]:
                    - button "check-circle" [ref=e179] [cursor=pointer]:
                      - img "check-circle" [ref=e180]:
                        - img [ref=e181]
                    - button "edit" [ref=e183] [cursor=pointer]:
                      - img "edit" [ref=e184]:
                        - img [ref=e185]
          - list [ref=e187]:
            - listitem [ref=e188]: 1-2 of 2
            - listitem "Previous Page" [ref=e189]:
              - button "double-left Prev" [disabled] [ref=e190] [cursor=pointer]:
                - generic:
                  - img "double-left":
                    - img
                - generic: Prev
            - listitem "1" [ref=e191] [cursor=pointer]:
              - button "1" [ref=e192]
            - listitem "Next Page" [ref=e193]:
              - button "Next double-right" [disabled] [ref=e194] [cursor=pointer]:
                - generic: Next
                - img "double-right":
                  - img
    - button "Next" [ref=e197] [cursor=pointer]:
      - generic [ref=e198]: Next
  - generic [ref=e200]:
    - alert [ref=e202]:
      - img "close-circle" [ref=e208]:
        - img [ref=e209]
      - generic [ref=e211]: Error
      - generic [ref=e212]: Failed to fetch categories, contact an administrator
    - generic "Close" [ref=e213] [cursor=pointer]:
      - img "close" [ref=e214]:
        - img [ref=e215]
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
  56  |   await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  57  |   await page.waitForTimeout(800);
  58  |   const needsLogin =
  59  |     page.url().includes('login') ||
  60  |     page.url().includes('sign-in') ||
  61  |     (await page.locator('input[type="password"]').count()) > 0;
  62  | 
  63  |   if (needsLogin) {
  64  |     await page.fill('input[type="email"], input[name="email"]', LOGIN_EMAIL);
  65  |     await page.fill('input[type="password"], input[name="password"]', LOGIN_PASSWORD);
  66  |     await page.click('button[type="submit"]');
  67  |     await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});
  68  |     await page.waitForTimeout(1500);
  69  |   }
  70  | }
  71  | 
  72  | async function goToPage(page, pagePath) {
  73  |   await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle' });
  74  |   await page.waitForTimeout(1500);
  75  | }
  76  | 
  77  | async function screenshot(page, name) {
  78  |   const safe = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  79  |   const dir  = path.resolve(__dirname, 'screenshots');
  80  |   if (!fs.existsSync(dir)) fs.mkdirSync(dir);
> 81  |   await page.screenshot({ path: `${dir}/${safe}.png`, fullPage: false });
      |              ^ Error: page.screenshot: Protocol error (Page.captureScreenshot): Unable to capture screenshot
  82  | }
  83  | 
  84  | async function checkNoHorizontalScroll(page, label) {
  85  |   const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  86  |   const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  87  |   expect(scrollWidth, `[${label}] Horizontal scroll present`).toBeLessThanOrEqual(clientWidth + 5);
  88  | }
  89  | 
  90  | async function checkNoOverflow(page, label, vw) {
  91  |   const overflow = await page.evaluate((vw) =>
  92  |     Array.from(document.querySelectorAll('*'))
  93  |       .filter(el => {
  94  |         const r = el.getBoundingClientRect();
  95  |         return r.right > vw + 5 && r.width > 0 && r.height > 0;
  96  |       })
  97  |       .map(el => ({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60) }))
  98  |       .slice(0, 5)
  99  |   , vw);
  100 |   expect(overflow.length, `[${label}] Overflowing: ${JSON.stringify(overflow)}`).toBe(0);
  101 | }
  102 | 
  103 | async function checkButtonsVisible(page, label, vw) {
  104 |   const buttons = page.locator('button:visible');
  105 |   const count   = await buttons.count();
  106 |   for (let i = 0; i < Math.min(count, 20); i++) {
  107 |     const box = await buttons.nth(i).boundingBox();
  108 |     if (!box) continue;
  109 |     expect(box.x + box.width, `[${label}] Button[${i}] overflows right`).toBeLessThanOrEqual(vw + 5);
  110 |     expect(box.x,             `[${label}] Button[${i}] outside left edge`).toBeGreaterThanOrEqual(-5);
  111 |     expect(box.width,         `[${label}] Button[${i}] zero width`).toBeGreaterThan(0);
  112 |     expect(box.height,        `[${label}] Button[${i}] zero height`).toBeGreaterThan(0);
  113 |   }
  114 | }
  115 | 
  116 | async function checkTextNotClipped(page, label) {
  117 |   const clipped = await page.evaluate(() =>
  118 |     Array.from(document.querySelectorAll('h1,h2,h3,h4,p,label,span,td,th,button'))
  119 |       .filter(el => {
  120 |         const s = window.getComputedStyle(el);
  121 |         return s.overflow === 'hidden' && el.scrollWidth > el.clientWidth + 2;
  122 |       })
  123 |       .map(el => ({ tag: el.tagName, text: el.innerText?.slice(0, 60) }))
  124 |       .slice(0, 5)
  125 |   );
  126 |   expect(clipped.length, `[${label}] Clipped text: ${JSON.stringify(clipped)}`).toBe(0);
  127 | }
  128 | 
  129 | async function checkInteractiveElements(page, label, vw) {
  130 |   const selectors = [
  131 |     { name: 'buttons',   sel: 'button:visible' },
  132 |     { name: 'inputs',    sel: 'input:visible, textarea:visible, select:visible' },
  133 |     { name: 'tabs',      sel: '[role="tab"]:visible' },
  134 |     { name: 'nav links', sel: 'nav a:visible' },
  135 |   ];
  136 |   for (const { name, sel } of selectors) {
  137 |     const els   = page.locator(sel);
  138 |     const count = await els.count();
  139 |     for (let i = 0; i < Math.min(count, 15); i++) {
  140 |       const box = await els.nth(i).boundingBox();
  141 |       if (!box) continue;
  142 |       expect(box.x + box.width, `[${label}] ${name}[${i}] overflows right`).toBeLessThanOrEqual(vw + 5);
  143 |       expect(box.x,             `[${label}] ${name}[${i}] starts before left edge`).toBeGreaterThanOrEqual(-5);
  144 |       expect(box.width,         `[${label}] ${name}[${i}] zero width`).toBeGreaterThan(0);
  145 |     }
  146 |   }
  147 | }
  148 | 
  149 | async function goToTestCoordinatorStep(page) {
  150 |   await goToPage(page, `/#/create-virtual-coordinator?edit=true&step=4&agentId=${AGENT_ID}&versionId=${VERSION_ID}`);
  151 | }
  152 | 
  153 | async function goToBulkTestingTab(page) {
  154 |   await goToTestCoordinatorStep(page);
  155 |   const tab = page.locator('text=Bulk testing').first();
  156 |   if (await tab.isVisible().catch(() => false)) {
  157 |     await tab.click();
  158 |     await page.waitForTimeout(800);
  159 |   }
  160 | }
  161 | 
  162 | async function goToSingleTestingTab(page) {
  163 |   await goToTestCoordinatorStep(page);
  164 |   const tab = page.locator('text=Single Message Testing').first();
  165 |   if (await tab.isVisible().catch(() => false)) {
  166 |     await tab.click();
  167 |     await page.waitForTimeout(800);
  168 |   }
  169 | }
  170 | 
  171 | async function goToFlaggedTab(page) {
  172 |   await goToTestCoordinatorStep(page);
  173 |   const tab = page.locator('text=Flagged messages').first();
  174 |   if (await tab.isVisible().catch(() => false)) {
  175 |     await tab.click();
  176 |     await page.waitForTimeout(800);
  177 |   }
  178 | }
  179 | 
  180 | // Upload CSV → Start Test → click View → wait for results modal
  181 | async function startBulkTestAndOpenView(page) {
```