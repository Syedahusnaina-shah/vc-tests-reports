# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: as1360-master.spec.js >> 🟣 INTERACTIVE ELEMENTS — Buttons, inputs, tabs fully visible >> ✅ TC-I03 | [1440x900] Main content area is not crushed (has usable width)
- Location: as1360-master.spec.js:818:5

# Error details

```
Error: [1440x900] Main content area should be at least 300px wide

expect(received).toBeGreaterThan(expected)

Expected: > 300
Received:   226.203125
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
        - heading "Create Coordinator" [level=2] [ref=e108]
        - paragraph [ref=e109]: Add details to your project
      - generic [ref=e110]:
        - generic [ref=e111]:
          - generic [ref=e117]:
            - generic [ref=e118]: Account
            - textbox "Account" [disabled] [ref=e119]: Apex Pharma Solutions
          - generic [ref=e125]:
            - generic [ref=e126]: Therapeutic Area *
            - generic [ref=e127] [cursor=pointer]:
              - generic [ref=e129]:
                - combobox [ref=e131]
                - generic: Select Therapeutic Area
              - img [ref=e132]:
                - img [ref=e133]
        - generic [ref=e140]:
          - generic [ref=e141]: Project Name *
          - textbox "e.g. Cardiology Assistant" [ref=e142]: Test Agent
        - generic [ref=e148]:
          - generic [ref=e149]: Project Description (optional)
          - generic [ref=e150]:
            - textbox "Brief description of your Virtual Coordinator..." [ref=e151]
            - generic:
              - generic: 0 / 500
        - generic [ref=e152]:
          - heading "Channels" [level=3] [ref=e153]
          - generic [ref=e159]:
            - generic [ref=e160]: Channels *
            - generic [ref=e161] [cursor=pointer]:
              - generic [ref=e163]:
                - combobox [ref=e165]
                - generic: Select Channel
              - img [ref=e166]:
                - img [ref=e167]
        - generic [ref=e169]:
          - heading "Integrations (Optional)" [level=3] [ref=e170]
          - paragraph [ref=e171]: Integrations can be included during the VC build process.
          - generic [ref=e172]:
            - generic [ref=e178]:
              - generic [ref=e179]: Connect
              - generic [ref=e180] [cursor=pointer]:
                - generic [ref=e182]:
                  - combobox [ref=e184]
                  - generic: Select Connect Integration
                - img [ref=e185]:
                  - img [ref=e186]
            - generic [ref=e193]:
              - generic [ref=e194]: Samples
              - generic [ref=e195] [cursor=pointer]:
                - generic [ref=e197]:
                  - combobox [ref=e199]
                  - generic: Select Sample Integration
                - img [ref=e200]:
                  - img [ref=e201]
  - generic [ref=e204]:
    - button "Save as Draft" [disabled] [ref=e205]:
      - generic: Save as Draft
    - button "Update" [ref=e206] [cursor=pointer]:
      - generic [ref=e207]: Update
```

# Test source

```ts
  731 |     await checkNoHorizontalScroll(page, 'Flagged Messages');
  732 |     await screenshot(page, 'f03_flagged_no_scroll');
  733 |   });
  734 | 
  735 |   for (const res of RESOLUTIONS) {
  736 |     test(`✅ TC-F04 | [${res.name}] Flagged Messages tab — no overflow, buttons aligned`, async ({ browser }) => {
  737 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  738 |       const page = await ctx.newPage();
  739 |       await login(page);
  740 |       await goToFlaggedTab(page);
  741 | 
  742 |       const label = `${res.name} | Flagged Messages`;
  743 |       await checkNoHorizontalScroll(page, label);
  744 |       await checkNoOverflow(page, label, res.width);
  745 |       await checkButtonsVisible(page, label, res.width);
  746 |       await checkTextNotClipped(page, label);
  747 |       await screenshot(page, `f04_flagged_resp_${res.name}`);
  748 |       await ctx.close();
  749 |     });
  750 |   }
  751 | 
  752 |   test('✅ TC-F05 | Tab switching Single → Bulk → Flagged keeps layout stable', async ({ page }) => {
  753 |     await login(page);
  754 |     await goToTestCoordinatorStep(page);
  755 | 
  756 |     const tabSequence = [
  757 |       { text: 'Single Message Testing' },
  758 |       { text: 'Bulk testing' },
  759 |       { text: 'Flagged messages' },
  760 |     ];
  761 | 
  762 |     for (const { text } of tabSequence) {
  763 |       const tab     = page.locator(`text=${text}`).first();
  764 |       const visible = await tab.isVisible().catch(() => false);
  765 |       if (visible) {
  766 |         await tab.click();
  767 |         await page.waitForTimeout(800);
  768 |         await checkNoHorizontalScroll(page, `Tab: ${text}`);
  769 |         await screenshot(page, `f05_tab_${text.replace(/\s/g, '_').toLowerCase()}`);
  770 |       }
  771 |     }
  772 |   });
  773 | 
  774 | });
  775 | 
  776 | // ─────────────────────────────────────────────────────────────────────────────
  777 | // 🟣 SECTION 5 — INTERACTIVE ELEMENTS & LAYOUT INTEGRITY
  778 | // ─────────────────────────────────────────────────────────────────────────────
  779 | 
  780 | test.describe('🟣 INTERACTIVE ELEMENTS — Buttons, inputs, tabs fully visible', () => {
  781 | 
  782 |   for (const res of RESOLUTIONS) {
  783 |     test(`✅ TC-I01 | [${res.name}] All interactive elements within viewport on wizard pages`, async ({ browser }) => {
  784 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  785 |       const page = await ctx.newPage();
  786 |       await login(page);
  787 |       await goToPage(page, VC_PAGES[0].path);
  788 | 
  789 |       const label = `${res.name} | Interactive Elements`;
  790 |       await checkInteractiveElements(page, label, res.width);
  791 |       await ctx.close();
  792 |     });
  793 |   }
  794 | 
  795 |   for (const res of RESOLUTIONS) {
  796 |     test(`✅ TC-I02 | [${res.name}] Footer CTAs (Next, Save as Draft, Back) visible and not clipped`, async ({ browser }) => {
  797 |       const ctaTexts = ['Next', 'Save as Draft', 'Save', 'Cancel', 'Back'];
  798 |       const ctx      = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  799 |       const page     = await ctx.newPage();
  800 |       await login(page);
  801 |       await goToPage(page, VC_PAGES[0].path);
  802 | 
  803 |       for (const cta of ctaTexts) {
  804 |         const btn     = page.locator(`button:has-text("${cta}")`).first();
  805 |         const visible = await btn.isVisible().catch(() => false);
  806 |         if (!visible) continue;
  807 | 
  808 |         const box = await btn.boundingBox();
  809 |         if (!box) continue;
  810 |         expect(box.x + box.width, `CTA "${cta}" overflows viewport`).toBeLessThanOrEqual(res.width + 5);
  811 |         expect(box.y + box.height, `CTA "${cta}" is below viewport`).toBeLessThanOrEqual(res.height + 200);
  812 |       }
  813 |       await ctx.close();
  814 |     });
  815 |   }
  816 | 
  817 |   for (const res of RESOLUTIONS) {
  818 |     test(`✅ TC-I03 | [${res.name}] Main content area is not crushed (has usable width)`, async ({ browser }) => {
  819 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  820 |       const page = await ctx.newPage();
  821 |       await login(page);
  822 |       await goToPage(page, VC_PAGES[1].path);
  823 | 
  824 |       // Main content must have a meaningful width (not collapsed by a sidebar)
  825 |       const mainWidth = await page.evaluate(() => {
  826 |         const el = document.querySelector('main, [role="main"], [class*="main-content"], [class*="content"]');
  827 |         return el ? el.getBoundingClientRect().width : null;
  828 |       });
  829 | 
  830 |       if (mainWidth !== null) {
> 831 |         expect(mainWidth, `[${res.name}] Main content area should be at least 300px wide`).toBeGreaterThan(300);
      |                                                                                            ^ Error: [1440x900] Main content area should be at least 300px wide
  832 |       }
  833 |       await ctx.close();
  834 |     });
  835 |   }
  836 | 
  837 |   for (const res of RESOLUTIONS) {
  838 |     test(`✅ TC-I04 | [${res.name}] No major elements overlap each other`, async ({ browser }) => {
  839 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  840 |       const page = await ctx.newPage();
  841 |       await login(page);
  842 |       await goToPage(page, VC_PAGES[1].path);
  843 | 
  844 |       const overlaps = await page.evaluate(() => {
  845 |         const major = Array.from(document.querySelectorAll(
  846 |           'header, nav, aside, main, footer, [class*="sidebar"], [class*="header"], [class*="footer"], [class*="content"]'
  847 |         )).filter(el => {
  848 |           const r = el.getBoundingClientRect();
  849 |           return r.width > 50 && r.height > 50;
  850 |         });
  851 | 
  852 |         const found = [];
  853 |         for (let i = 0; i < major.length; i++) {
  854 |           for (let j = i + 1; j < major.length; j++) {
  855 |             if (major[j].contains(major[i]) || major[i].contains(major[j])) continue;
  856 |             const a = major[i].getBoundingClientRect();
  857 |             const b = major[j].getBoundingClientRect();
  858 |             const overlap = a.left < b.right - 10 && a.right > b.left + 10 &&
  859 |                             a.top < b.bottom - 10 && a.bottom > b.top + 10;
  860 |             if (overlap) found.push({
  861 |               a: major[i].tagName + '.' + (major[i].className || '').toString().slice(0, 30),
  862 |               b: major[j].tagName,
  863 |             });
  864 |           }
  865 |         }
  866 |         return found.slice(0, 5);
  867 |       });
  868 | 
  869 |       expect(overlaps.length, `[${res.name}] Overlapping elements: ${JSON.stringify(overlaps)}`).toBe(0);
  870 |       await ctx.close();
  871 |     });
  872 |   }
  873 | 
  874 |   for (const res of RESOLUTIONS) {
  875 |     test(`✅ TC-I05 | [${res.name}] No images overflow their containers`, async ({ browser }) => {
  876 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  877 |       const page = await ctx.newPage();
  878 |       await login(page);
  879 |       await goToPage(page, VC_PAGES[0].path);
  880 | 
  881 |       const overflowImgs = await page.evaluate((vw) =>
  882 |         Array.from(document.querySelectorAll('img:not([hidden])'))
  883 |           .filter(img => {
  884 |             const r = img.getBoundingClientRect();
  885 |             return r.right > vw + 5 && r.width > 0;
  886 |           })
  887 |           .map(img => ({ src: img.src?.slice(0, 60), right: Math.round(img.getBoundingClientRect().right) }))
  888 |       , res.width);
  889 | 
  890 |       expect(overflowImgs.length, `[${res.name}] Overflowing images: ${JSON.stringify(overflowImgs)}`).toBe(0);
  891 |       await ctx.close();
  892 |     });
  893 |   }
  894 | 
  895 |   for (const res of RESOLUTIONS) {
  896 |     test(`✅ TC-I06 | [${res.name}] No collapsed zero-width containers`, async ({ browser }) => {
  897 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  898 |       const page = await ctx.newPage();
  899 |       await login(page);
  900 |       await goToPage(page, VC_PAGES[1].path);
  901 | 
  902 |       const collapsed = await page.evaluate(() =>
  903 |         Array.from(document.querySelectorAll('main, section, article, [class*="container"], [class*="wrapper"], [class*="panel"]'))
  904 |           .filter(el => {
  905 |             const r  = el.getBoundingClientRect();
  906 |             const cs = window.getComputedStyle(el);
  907 |             return r.width === 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
  908 |           })
  909 |           .map(el => ({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60) }))
  910 |           .slice(0, 5)
  911 |       );
  912 | 
  913 |       expect(collapsed.length, `[${res.name}] Collapsed containers: ${JSON.stringify(collapsed)}`).toBe(0);
  914 |       await ctx.close();
  915 |     });
  916 |   }
  917 | 
  918 |   for (const res of RESOLUTIONS) {
  919 |     test(`✅ TC-I07 | [${res.name}] Tab switching keeps layout stable`, async ({ browser }) => {
  920 |       const ctx  = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  921 |       const page = await ctx.newPage();
  922 |       await login(page);
  923 |       await goToPage(page, VC_PAGES[1].path);
  924 | 
  925 |       const tabEls = page.locator('[role="tab"]:visible');
  926 |       const count  = await tabEls.count();
  927 | 
  928 |       for (let i = 0; i < count; i++) {
  929 |         await tabEls.nth(i).click().catch(() => {});
  930 |         await page.waitForTimeout(600);
  931 |         await checkNoHorizontalScroll(page, `${res.name} | Tab ${i}`);
```