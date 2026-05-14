# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: as1360-complete.spec.js >> 🟢 BULK TESTING — Upload, Results & Responsiveness >> ✅ TC-B03 | Start Test button is clickable after CSV upload
- Location: as1360-complete.spec.js:211:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.setInputFiles: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('input[type="file"]').first()

```

# Page snapshot

```yaml
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
        - img [ref=e95] [cursor=pointer]
        - generic [ref=e100] [cursor=pointer]:
          - generic [ref=e101]: Test Coordinator
          - generic [ref=e102]: Test the VC with example HCP messages
    - generic [ref=e106]:
      - generic [ref=e107]:
        - heading "Configure Notifications (Optional)" [level=2] [ref=e108]
        - paragraph [ref=e109]: Manage alerts based on VC categorizations
      - generic [ref=e110]:
        - generic [ref=e111]:
          - generic [ref=e117]:
            - generic [ref=e118]: When category is selected
            - generic [ref=e119] [cursor=pointer]:
              - generic [ref=e121]:
                - combobox [ref=e125]
                - generic: e.g. General Info, Treatment Recommendation, Safety
              - generic:
                - img:
                  - img
          - generic [ref=e131]:
            - generic [ref=e132]: Notify
            - generic [ref=e133] [cursor=pointer]:
              - generic [ref=e135]:
                - combobox [ref=e139]
                - generic: e.g. People (drop down list of accounts)
              - generic:
                - img:
                  - img
        - generic [ref=e141]:
          - heading "Channels Notification delivery channels" [level=2] [ref=e142]:
            - text: Channels
            - generic [ref=e144]: Notification delivery channels
          - generic [ref=e145]:
            - generic:
              - generic:
                - checkbox "Slack" [checked]
              - generic:
                - generic:
                  - generic: Slack
        - button "Add Notification" [ref=e147] [cursor=pointer]:
          - generic [ref=e148]: Add Notification
  - generic [ref=e150]:
    - button "Save as Draft" [ref=e151] [cursor=pointer]:
      - generic [ref=e152]: Save as Draft
    - button "Next" [ref=e153] [cursor=pointer]:
      - generic [ref=e154]: Next
```

# Test source

```ts
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
  161 |         const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  162 |         const page = await ctx.newPage();
  163 |         await login(page);
  164 |         await goToPage(page, vcPage.path);
  165 | 
  166 |         const label = `${res.name} | ${vcPage.name}`;
  167 |         await checkNoHorizontalScroll(page, label);
  168 |         await checkNoOverflow(page, label, res.width);
  169 |         await checkButtonsVisible(page, label, res.width);
  170 |         await checkTextNotClipped(page, label);
  171 |         await screenshot(page, `resp_${res.name}_${vcPage.name}`);
  172 |         await ctx.close();
  173 |       });
  174 |     }
  175 |   }
  176 | });
  177 | 
  178 | // ─────────────────────────────────────────────────────────────────────────────
  179 | // 🟢 SECTION 2 — BULK TESTING (upload CSV, start test, check results)
  180 | // ─────────────────────────────────────────────────────────────────────────────
  181 | 
  182 | test.describe('🟢 BULK TESTING — Upload, Results & Responsiveness', () => {
  183 | 
  184 |   // ── ✅ Positive ─────────────────────────────────────────────────────────────
  185 | 
  186 |   test('✅ TC-B01 | Bulk Testing tab loads correctly', async ({ page }) => {
  187 |     await login(page);
  188 |     await goToBulkTestingTab(page);
  189 | 
  190 |     await expect(page.locator('text=Click to upload').first(),    'Upload area visible').toBeVisible();
  191 |     await expect(page.locator('text=Download CSV').first(),       'Download CSV button visible').toBeVisible();
  192 |     await expect(page.locator('button:has-text("Start Test")').first(), 'Start Test button visible').toBeVisible();
  193 |     await expect(page.locator('text=message').first(),            'Column instructions visible').toBeVisible();
  194 |     await expect(page.locator('text=expected_category').first(),  'expected_category label visible').toBeVisible();
  195 |     await screenshot(page, 'b01_bulk_tab_loaded');
  196 |   });
  197 | 
  198 |   test('✅ TC-B02 | Upload CSV file successfully', async ({ page }) => {
  199 |     await login(page);
  200 |     await goToBulkTestingTab(page);
  201 | 
  202 |     const fileInput = page.locator('input[type="file"]').first();
  203 |     await fileInput.setInputFiles(CSV_PATH);
  204 |     await page.waitForTimeout(1000);
  205 | 
  206 |     const errorVisible = await page.locator('text=Invalid, text=Error').first().isVisible().catch(() => false);
  207 |     expect(errorVisible, 'No error should appear for valid CSV').toBe(false);
  208 |     await screenshot(page, 'b02_csv_uploaded');
  209 |   });
  210 | 
  211 |   test('✅ TC-B03 | Start Test button is clickable after CSV upload', async ({ page }) => {
  212 |     await login(page);
  213 |     await goToBulkTestingTab(page);
  214 | 
  215 |     const fileInput = page.locator('input[type="file"]').first();
> 216 |     await fileInput.setInputFiles(CSV_PATH);
      |     ^ Error: locator.setInputFiles: Test timeout of 60000ms exceeded.
  217 |     await page.waitForTimeout(1000);
  218 | 
  219 |     const startBtn = page.locator('button:has-text("Start Test")').first();
  220 |     await expect(startBtn, 'Start Test should be enabled').toBeVisible();
  221 |     const isDisabled = await startBtn.isDisabled().catch(() => false);
  222 |     expect(isDisabled, 'Start Test should NOT be disabled after upload').toBe(false);
  223 |     await screenshot(page, 'b03_start_test_enabled');
  224 |   });
  225 | 
  226 |   test('✅ TC-B04 | Results modal opens after Start Test', async ({ page }) => {
  227 |     await login(page);
  228 |     await goToBulkTestingTab(page);
  229 | 
  230 |     const fileInput = page.locator('input[type="file"]').first();
  231 |     await fileInput.setInputFiles(CSV_PATH);
  232 |     await page.waitForTimeout(1000);
  233 | 
  234 |     await page.locator('button:has-text("Start Test")').first().click();
  235 |     await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  236 |     await page.waitForTimeout(2000);
  237 | 
  238 |     const modal = page.locator('text=Bulk testing results').first();
  239 |     await expect(modal, 'Results modal should appear').toBeVisible();
  240 |     await screenshot(page, 'b04_results_modal');
  241 |   });
  242 | 
  243 |   test('✅ TC-B05 | Results modal shows summary cards (Completed, Accuracy, Correct, Incorrect)', async ({ page }) => {
  244 |     await login(page);
  245 |     await goToBulkTestingTab(page);
  246 | 
  247 |     const fileInput = page.locator('input[type="file"]').first();
  248 |     await fileInput.setInputFiles(CSV_PATH);
  249 |     await page.waitForTimeout(1000);
  250 |     await page.locator('button:has-text("Start Test")').first().click();
  251 |     await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  252 |     await page.waitForTimeout(3000);
  253 | 
  254 |     await expect(page.locator('text=Completed').first(),  'Completed card visible').toBeVisible();
  255 |     await expect(page.locator('text=Accuracy').first(),   'Accuracy card visible').toBeVisible();
  256 |     await expect(page.locator('text=Correct').first(),    'Correct card visible').toBeVisible();
  257 |     await expect(page.locator('text=Incorrect').first(),  'Incorrect card visible').toBeVisible();
  258 |     await screenshot(page, 'b05_summary_cards');
  259 |   });
  260 | 
  261 |   test('✅ TC-B06 | Results table columns are all visible', async ({ page }) => {
  262 |     await login(page);
  263 |     await goToBulkTestingTab(page);
  264 | 
  265 |     const fileInput = page.locator('input[type="file"]').first();
  266 |     await fileInput.setInputFiles(CSV_PATH);
  267 |     await page.waitForTimeout(1000);
  268 |     await page.locator('button:has-text("Start Test")').first().click();
  269 |     await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  270 |     await page.waitForTimeout(3000);
  271 | 
  272 |     await expect(page.locator('text=HCP Message').first(),                  'HCP Message column').toBeVisible();
  273 |     await expect(page.locator('text=Expected Category').first(),            'Expected Category column').toBeVisible();
  274 |     await expect(page.locator('text=Category Selected by the VC').first(),  'Category Selected column').toBeVisible();
  275 |     await expect(page.locator('text=Status').first(),                       'Status column').toBeVisible();
  276 |     await expect(page.locator('text=Response Time').first(),                'Response Time column').toBeVisible();
  277 |     await screenshot(page, 'b06_table_columns');
  278 |   });
  279 | 
  280 |   test('✅ TC-B07 | Row 1: colors/colors → Correct', async ({ page }) => {
  281 |     await login(page);
  282 |     await goToBulkTestingTab(page);
  283 | 
  284 |     const fileInput = page.locator('input[type="file"]').first();
  285 |     await fileInput.setInputFiles(CSV_PATH);
  286 |     await page.waitForTimeout(1000);
  287 |     await page.locator('button:has-text("Start Test")').first().click();
  288 |     await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  289 |     await page.waitForTimeout(3000);
  290 | 
  291 |     const correctBadges = page.locator('text=Correct');
  292 |     const count = await correctBadges.count();
  293 |     expect(count, 'At least 2 Correct badges should be present').toBeGreaterThanOrEqual(2);
  294 |     await screenshot(page, 'b07_row1_correct');
  295 |   });
  296 | 
  297 |   test('✅ TC-B08 | Row 2: colors/engine → Incorrect', async ({ page }) => {
  298 |     await login(page);
  299 |     await goToBulkTestingTab(page);
  300 | 
  301 |     const fileInput = page.locator('input[type="file"]').first();
  302 |     await fileInput.setInputFiles(CSV_PATH);
  303 |     await page.waitForTimeout(1000);
  304 |     await page.locator('button:has-text("Start Test")').first().click();
  305 |     await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  306 |     await page.waitForTimeout(3000);
  307 | 
  308 |     const incorrectBadge = page.locator('text=Incorrect').first();
  309 |     await expect(incorrectBadge, 'Incorrect badge should appear').toBeVisible();
  310 |     await screenshot(page, 'b08_row2_incorrect');
  311 |   });
  312 | 
  313 |   test('✅ TC-B09 | Accuracy shows 66.7%', async ({ page }) => {
  314 |     await login(page);
  315 |     await goToBulkTestingTab(page);
  316 | 
```