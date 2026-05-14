# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: as1360-master.spec.js >> 🟡 SINGLE MESSAGE TESTING — Send message & check responsiveness >> ✅ TC-S04 | [1920x1080] Single Testing tab — no overflow, buttons aligned
- Location: as1360-master.spec.js:662:5

# Error details

```
Test timeout of 60000ms exceeded.
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