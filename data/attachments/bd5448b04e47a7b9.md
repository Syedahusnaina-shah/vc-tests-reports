# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: as1360-complete.spec.js >> 🟢 BULK TESTING — Upload, Results & Responsiveness >> ❌ TC-B18 | Upload empty CSV (headers only)
- Location: as1360-complete.spec.js:526:3

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
  488 |   test('❌ TC-B16 | Start Test without uploading CSV — blocked or disabled', async ({ page }) => {
  489 |     await login(page);
  490 |     await goToBulkTestingTab(page);
  491 | 
  492 |     const startBtn  = page.locator('button:has-text("Start Test")').first();
  493 |     const isDisabled = await startBtn.isDisabled().catch(() => false);
  494 | 
  495 |     if (!isDisabled) {
  496 |       await startBtn.click();
  497 |       await page.waitForTimeout(1000);
  498 |       const errorVisible = await page.locator('text=Please upload, text=required, text=No file').first().isVisible().catch(() => false);
  499 |       expect(errorVisible || isDisabled, 'Should block Start Test without a file').toBe(true);
  500 |     } else {
  501 |       expect(isDisabled, 'Start Test disabled without file').toBe(true);
  502 |     }
  503 |     await screenshot(page, 'b16_no_file_blocked');
  504 |   });
  505 | 
  506 |   test('❌ TC-B17 | Upload wrong file type (.txt) — rejected', async ({ page }) => {
  507 |     await login(page);
  508 |     await goToBulkTestingTab(page);
  509 | 
  510 |     const txtPath = path.resolve(__dirname, 'test_invalid.txt');
  511 |     fs.writeFileSync(txtPath, 'this is not a csv');
  512 | 
  513 |     const fileInput = page.locator('input[type="file"]').first();
  514 |     await fileInput.setInputFiles(txtPath);
  515 |     await page.waitForTimeout(1000);
  516 | 
  517 |     const startBtn   = page.locator('button:has-text("Start Test")').first();
  518 |     const isDisabled = await startBtn.isDisabled().catch(() => false);
  519 |     const errorShown = await page.locator('text=Invalid, text=not supported, text=Error').first().isVisible().catch(() => false);
  520 | 
  521 |     fs.unlinkSync(txtPath);
  522 |     expect(errorShown || isDisabled, 'Invalid file type should be rejected').toBe(true);
  523 |     await screenshot(page, 'b17_invalid_file');
  524 |   });
  525 | 
  526 |   test('❌ TC-B18 | Upload empty CSV (headers only)', async ({ page }) => {
  527 |     await login(page);
  528 |     await goToBulkTestingTab(page);
  529 | 
  530 |     const emptyPath = path.resolve(__dirname, 'test_empty.csv');
  531 |     fs.writeFileSync(emptyPath, 'message,expected_category\n');
  532 | 
  533 |     const fileInput = page.locator('input[type="file"]').first();
> 534 |     await fileInput.setInputFiles(emptyPath);
      |     ^ Error: locator.setInputFiles: Test timeout of 15000ms exceeded.
  535 |     await page.waitForTimeout(1000);
  536 | 
  537 |     fs.unlinkSync(emptyPath);
  538 |     await screenshot(page, 'b18_empty_csv');
  539 |   });
  540 | 
  541 | });
  542 | 
  543 | // ─────────────────────────────────────────────────────────────────────────────
  544 | // 🟡 SECTION 3 — SINGLE MESSAGE TESTING
  545 | // ─────────────────────────────────────────────────────────────────────────────
  546 | 
  547 | test.describe('🟡 SINGLE MESSAGE TESTING — Send message & check responsiveness', () => {
  548 | 
  549 |   test('✅ TC-S01 | Single Message Testing tab loads correctly', async ({ page }) => {
  550 |     await login(page);
  551 |     await goToSingleTestingTab(page);
  552 | 
  553 |     // Input field or send area should be visible
  554 |     const inputArea = page.locator('textarea:visible, input[type="text"]:visible, [placeholder*="message"], [placeholder*="Message"]').first();
  555 |     const inputVisible = await inputArea.isVisible().catch(() => false);
  556 |     expect(inputVisible, 'Message input should be visible on Single Message tab').toBe(true);
  557 | 
  558 |     await screenshot(page, 's01_single_tab_loaded');
  559 |   });
  560 | 
  561 |   test('✅ TC-S02 | Can type and send a single message', async ({ page }) => {
  562 |     await login(page);
  563 |     await goToSingleTestingTab(page);
  564 | 
  565 |     const inputArea = page.locator('textarea:visible, input[type="text"]:visible').first();
  566 |     const inputVisible = await inputArea.isVisible().catch(() => false);
  567 | 
  568 |     if (inputVisible) {
  569 |       await inputArea.fill('colors');
  570 |       await page.waitForTimeout(500);
  571 | 
  572 |       // Click send button
  573 |       const sendBtn = page.locator('button:has-text("Send"), button[type="submit"], button:has-text("Test")').first();
  574 |       const sendVisible = await sendBtn.isVisible().catch(() => false);
  575 |       if (sendVisible) {
  576 |         await sendBtn.click();
  577 |         await page.waitForTimeout(3000);
  578 |         await screenshot(page, 's02_message_sent');
  579 |       }
  580 |     }
  581 |   });
  582 | 
  583 |   test('✅ TC-S03 | Response is displayed after sending message', async ({ page }) => {
  584 |     await login(page);
  585 |     await goToSingleTestingTab(page);
  586 | 
  587 |     const inputArea = page.locator('textarea:visible, input[type="text"]:visible').first();
  588 |     const inputVisible = await inputArea.isVisible().catch(() => false);
  589 | 
  590 |     if (inputVisible) {
  591 |       await inputArea.fill('what engines does it offer');
  592 |       const sendBtn = page.locator('button:has-text("Send"), button[type="submit"], button:has-text("Test")').first();
  593 |       if (await sendBtn.isVisible().catch(() => false)) {
  594 |         await sendBtn.click();
  595 |         await page.waitForTimeout(5000);
  596 | 
  597 |         // Response area should show something
  598 |         const response = page.locator('[class*="response"], [class*="result"], [class*="message"]').last();
  599 |         const hasResponse = await response.isVisible().catch(() => false);
  600 |         await screenshot(page, 's03_response_shown');
  601 |       }
  602 |     }
  603 |   });
  604 | 
  605 |   // ── Responsiveness of Single Testing tab ────────────────────────────────────
  606 | 
  607 |   for (const res of RESOLUTIONS) {
  608 |     test(`✅ TC-S04 | [${res.name}] Single Testing tab — no overflow, buttons aligned`, async ({ browser }) => {
  609 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  610 |       const page = await ctx.newPage();
  611 |       await login(page);
  612 |       await goToSingleTestingTab(page);
  613 | 
  614 |       const label = `${res.name} | Single Testing`;
  615 |       await checkNoHorizontalScroll(page, label);
  616 |       await checkNoOverflow(page, label, res.width);
  617 |       await checkButtonsVisible(page, label, res.width);
  618 |       await checkTextNotClipped(page, label);
  619 |       await screenshot(page, `s04_single_resp_${res.name}`);
  620 |       await ctx.close();
  621 |     });
  622 |   }
  623 | 
  624 |   test('❌ TC-S05 | Send empty message — blocked or shows validation', async ({ page }) => {
  625 |     await login(page);
  626 |     await goToSingleTestingTab(page);
  627 | 
  628 |     const sendBtn = page.locator('button:has-text("Send"), button[type="submit"]').first();
  629 |     const sendVisible = await sendBtn.isVisible().catch(() => false);
  630 | 
  631 |     if (sendVisible) {
  632 |       const isDisabled = await sendBtn.isDisabled().catch(() => false);
  633 |       if (!isDisabled) {
  634 |         await sendBtn.click();
```