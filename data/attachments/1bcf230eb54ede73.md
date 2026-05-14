# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: as1360-complete.spec.js >> 🔴 FLAGGED MESSAGES — Tab loads & responsiveness >> ✅ TC-F02 | Flagged Messages table or empty state is visible
- Location: as1360-complete.spec.js:667:3

# Error details

```
Error: Table or empty state should be visible

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
  635 |         await page.waitForTimeout(1000);
  636 |         const errorVisible = await page.locator('text=required, text=empty, text=Please enter').first().isVisible().catch(() => false);
  637 |         expect(errorVisible || isDisabled, 'Empty message send should be blocked').toBe(true);
  638 |       } else {
  639 |         expect(isDisabled, 'Send button disabled for empty input').toBe(true);
  640 |       }
  641 |     }
  642 |     await screenshot(page, 's05_empty_message');
  643 |   });
  644 | 
  645 | });
  646 | 
  647 | // ─────────────────────────────────────────────────────────────────────────────
  648 | // 🔴 SECTION 4 — FLAGGED MESSAGES
  649 | // ─────────────────────────────────────────────────────────────────────────────
  650 | 
  651 | test.describe('🔴 FLAGGED MESSAGES — Tab loads & responsiveness', () => {
  652 | 
  653 |   test('✅ TC-F01 | Flagged Messages tab loads correctly', async ({ page }) => {
  654 |     await login(page);
  655 |     await goToFlaggedTab(page);
  656 | 
  657 |     // Page should load without error
  658 |     const errors = [];
  659 |     page.on('pageerror', err => errors.push(err.message));
  660 |     await page.waitForTimeout(1500);
  661 | 
  662 |     const jsErrors = errors.filter(e => e.includes('TypeError') || e.includes('Cannot read'));
  663 |     expect(jsErrors.length, `JS errors on Flagged tab: ${jsErrors}`).toBe(0);
  664 |     await screenshot(page, 'f01_flagged_tab_loaded');
  665 |   });
  666 | 
  667 |   test('✅ TC-F02 | Flagged Messages table or empty state is visible', async ({ page }) => {
  668 |     await login(page);
  669 |     await goToFlaggedTab(page);
  670 | 
  671 |     // Either table rows or empty state message
  672 |     const tableOrEmpty = page.locator('table:visible, text=No flagged, text=No messages, [class*="empty"]').first();
  673 |     const isVisible = await tableOrEmpty.isVisible().catch(() => false);
> 674 |     expect(isVisible, 'Table or empty state should be visible').toBe(true);
      |                                                                 ^ Error: Table or empty state should be visible
  675 |     await screenshot(page, 'f02_flagged_content');
  676 |   });
  677 | 
  678 |   test('✅ TC-F03 | Flagged Messages tab — no horizontal scroll', async ({ page }) => {
  679 |     await login(page);
  680 |     await goToFlaggedTab(page);
  681 |     await checkNoHorizontalScroll(page, 'Flagged Messages');
  682 |     await screenshot(page, 'f03_flagged_no_scroll');
  683 |   });
  684 | 
  685 |   // ── Responsiveness of Flagged Messages tab ───────────────────────────────────
  686 | 
  687 |   for (const res of RESOLUTIONS) {
  688 |     test(`✅ TC-F04 | [${res.name}] Flagged Messages tab — no overflow, buttons aligned`, async ({ browser }) => {
  689 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  690 |       const page = await ctx.newPage();
  691 |       await login(page);
  692 |       await goToFlaggedTab(page);
  693 | 
  694 |       const label = `${res.name} | Flagged Messages`;
  695 |       await checkNoHorizontalScroll(page, label);
  696 |       await checkNoOverflow(page, label, res.width);
  697 |       await checkButtonsVisible(page, label, res.width);
  698 |       await checkTextNotClipped(page, label);
  699 |       await screenshot(page, `f04_flagged_resp_${res.name}`);
  700 |       await ctx.close();
  701 |     });
  702 |   }
  703 | 
  704 |   test('✅ TC-F05 | Tab switching Single → Bulk → Flagged keeps layout stable', async ({ page }) => {
  705 |     await login(page);
  706 |     await goToPage(page, `/#/create-virtual-coordinator?edit=true&step=3&agentId=${AGENT_ID}&versionId=${VERSION_ID}`);
  707 |     await page.waitForTimeout(1000);
  708 | 
  709 |     const tabs = [
  710 |       'Single Message Testing',
  711 |       'Bulk testing',
  712 |       'Flagged messages',
  713 |     ];
  714 | 
  715 |     for (const tabText of tabs) {
  716 |       const tab = page.locator(`text=${tabText}`).first();
  717 |       const visible = await tab.isVisible().catch(() => false);
  718 |       if (visible) {
  719 |         await tab.click();
  720 |         await page.waitForTimeout(800);
  721 |         await checkNoHorizontalScroll(page, `Tab: ${tabText}`);
  722 |         await screenshot(page, `f05_tab_${tabText.replace(/\s/g, '_')}`);
  723 |       }
  724 |     }
  725 |   });
  726 | 
  727 | });
```