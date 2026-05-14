# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: as1360-complete.spec.js >> 🟢 BULK TESTING — Upload, Results & Responsiveness >> ✅ TC-B12 | Download CSV button visible in results modal
- Location: as1360-complete.spec.js:382:3

# Error details

```
Test timeout of 15000ms exceeded.
```

```
Error: locator.setInputFiles: Test timeout of 15000ms exceeded.
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
  317 |     const fileInput = page.locator('input[type="file"]').first();
  318 |     await fileInput.setInputFiles(CSV_PATH);
  319 |     await page.waitForTimeout(1000);
  320 |     await page.locator('button:has-text("Start Test")').first().click();
  321 |     await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  322 |     await page.waitForTimeout(3000);
  323 | 
  324 |     const accuracy = page.locator('text=66.7%').first();
  325 |     await expect(accuracy, 'Accuracy should be 66.7%').toBeVisible();
  326 |     await screenshot(page, 'b09_accuracy_66');
  327 |   });
  328 | 
  329 |   test('✅ TC-B10 | Filter All/Correct/Incorrect buttons work', async ({ page }) => {
  330 |     await login(page);
  331 |     await goToBulkTestingTab(page);
  332 | 
  333 |     const fileInput = page.locator('input[type="file"]').first();
  334 |     await fileInput.setInputFiles(CSV_PATH);
  335 |     await page.waitForTimeout(1000);
  336 |     await page.locator('button:has-text("Start Test")').first().click();
  337 |     await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  338 |     await page.waitForTimeout(3000);
  339 | 
  340 |     // Click Correct filter
  341 |     const correctBtn = page.locator('button:has-text("Correct")').first();
  342 |     if (await correctBtn.isVisible().catch(() => false)) {
  343 |       await correctBtn.click();
  344 |       await page.waitForTimeout(400);
  345 |       await screenshot(page, 'b10_filter_correct');
  346 |     }
  347 | 
  348 |     // Click Incorrect filter
  349 |     const incorrectBtn = page.locator('button:has-text("Incorrect")').first();
  350 |     if (await incorrectBtn.isVisible().catch(() => false)) {
  351 |       await incorrectBtn.click();
  352 |       await page.waitForTimeout(400);
  353 |       await screenshot(page, 'b10_filter_incorrect');
  354 |     }
  355 | 
  356 |     // Click All filter
  357 |     const allBtn = page.locator('button:has-text("All")').first();
  358 |     if (await allBtn.isVisible().catch(() => false)) {
  359 |       await allBtn.click();
  360 |       await page.waitForTimeout(400);
  361 |       await screenshot(page, 'b10_filter_all');
  362 |     }
  363 |   });
  364 | 
  365 |   test('✅ TC-B11 | Response time shown for each row (e.g. 2258ms)', async ({ page }) => {
  366 |     await login(page);
  367 |     await goToBulkTestingTab(page);
  368 | 
  369 |     const fileInput = page.locator('input[type="file"]').first();
  370 |     await fileInput.setInputFiles(CSV_PATH);
  371 |     await page.waitForTimeout(1000);
  372 |     await page.locator('button:has-text("Start Test")').first().click();
  373 |     await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  374 |     await page.waitForTimeout(3000);
  375 | 
  376 |     const responseTimes = page.locator('text=/\\d+ms/');
  377 |     const count = await responseTimes.count();
  378 |     expect(count, 'Response time should be shown for rows').toBeGreaterThan(0);
  379 |     await screenshot(page, 'b11_response_times');
  380 |   });
  381 | 
  382 |   test('✅ TC-B12 | Download CSV button visible in results modal', async ({ page }) => {
  383 |     await login(page);
  384 |     await goToBulkTestingTab(page);
  385 | 
  386 |     const fileInput = page.locator('input[type="file"]').first();
> 387 |     await fileInput.setInputFiles(CSV_PATH);
      |     ^ Error: locator.setInputFiles: Test timeout of 15000ms exceeded.
  388 |     await page.waitForTimeout(1000);
  389 |     await page.locator('button:has-text("Start Test")').first().click();
  390 |     await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  391 |     await page.waitForTimeout(2000);
  392 | 
  393 |     const downloadBtn = page.locator('text=Download CSV').last();
  394 |     await expect(downloadBtn, 'Download CSV in modal should be visible').toBeVisible();
  395 |     await screenshot(page, 'b12_download_csv');
  396 |   });
  397 | 
  398 |   test('✅ TC-B13 | Close button closes results modal', async ({ page }) => {
  399 |     await login(page);
  400 |     await goToBulkTestingTab(page);
  401 | 
  402 |     const fileInput = page.locator('input[type="file"]').first();
  403 |     await fileInput.setInputFiles(CSV_PATH);
  404 |     await page.waitForTimeout(1000);
  405 |     await page.locator('button:has-text("Start Test")').first().click();
  406 |     await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  407 |     await page.waitForTimeout(2000);
  408 | 
  409 |     const closeBtn = page.locator('button:has-text("Close")').first();
  410 |     await expect(closeBtn, 'Close button should be visible').toBeVisible();
  411 |     await closeBtn.click();
  412 |     await page.waitForTimeout(500);
  413 | 
  414 |     const modalGone = await page.locator('text=Bulk testing results').first().isVisible().catch(() => false);
  415 |     expect(modalGone, 'Modal should close after Close clicked').toBe(false);
  416 |     await screenshot(page, 'b13_modal_closed');
  417 |   });
  418 | 
  419 |   // ── Responsiveness of Bulk Testing tab ──────────────────────────────────────
  420 | 
  421 |   for (const res of RESOLUTIONS) {
  422 |     test(`✅ TC-B14 | [${res.name}] Bulk Testing tab — no overflow, buttons aligned`, async ({ browser }) => {
  423 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  424 |       const page = await ctx.newPage();
  425 |       await login(page);
  426 |       await goToBulkTestingTab(page);
  427 | 
  428 |       const label = `${res.name} | Bulk Testing`;
  429 |       await checkNoHorizontalScroll(page, label);
  430 |       await checkNoOverflow(page, label, res.width);
  431 |       await checkButtonsVisible(page, label, res.width);
  432 |       await checkTextNotClipped(page, label);
  433 | 
  434 |       // Start Test button alignment
  435 |       const startBtn = page.locator('button:has-text("Start Test")').first();
  436 |       const startVisible = await startBtn.isVisible().catch(() => false);
  437 |       if (startVisible) {
  438 |         const box = await startBtn.boundingBox();
  439 |         expect(box.x + box.width, 'Start Test button overflows').toBeLessThanOrEqual(res.width + 5);
  440 |       }
  441 | 
  442 |       // Upload area alignment
  443 |       const uploadArea = page.locator('text=Click to upload').first();
  444 |       const uploadVisible = await uploadArea.isVisible().catch(() => false);
  445 |       if (uploadVisible) {
  446 |         const box = await uploadArea.boundingBox();
  447 |         expect(box.x + box.width, 'Upload area overflows').toBeLessThanOrEqual(res.width + 5);
  448 |       }
  449 | 
  450 |       await screenshot(page, `b14_bulk_resp_${res.name}`);
  451 |       await ctx.close();
  452 |     });
  453 |   }
  454 | 
  455 |   for (const res of RESOLUTIONS) {
  456 |     test(`✅ TC-B15 | [${res.name}] Results modal — no overflow, fully visible`, async ({ browser }) => {
  457 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  458 |       const page = await ctx.newPage();
  459 |       await login(page);
  460 |       await goToBulkTestingTab(page);
  461 | 
  462 |       const fileInput = page.locator('input[type="file"]').first();
  463 |       await fileInput.setInputFiles(CSV_PATH);
  464 |       await page.waitForTimeout(1000);
  465 |       await page.locator('button:has-text("Start Test")').first().click();
  466 |       await page.waitForSelector('text=Bulk testing results', { timeout: 20000 });
  467 |       await page.waitForTimeout(3000);
  468 | 
  469 |       const label = `${res.name} | Results Modal`;
  470 |       await checkNoHorizontalScroll(page, label);
  471 |       await checkButtonsVisible(page, label, res.width);
  472 |       await checkTextNotClipped(page, label);
  473 | 
  474 |       // Modal should not overflow viewport
  475 |       const modal = page.locator('text=Bulk testing results').first();
  476 |       const modalBox = await modal.boundingBox();
  477 |       if (modalBox) {
  478 |         expect(modalBox.x + modalBox.width, 'Modal overflows right edge').toBeLessThanOrEqual(res.width + 5);
  479 |       }
  480 | 
  481 |       await screenshot(page, `b15_modal_resp_${res.name}`);
  482 |       await ctx.close();
  483 |     });
  484 |   }
  485 | 
  486 |   // ── ❌ Negative ──────────────────────────────────────────────────────────────
  487 | 
```