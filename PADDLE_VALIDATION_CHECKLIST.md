# ✅ Paddle v2 Integration - Validation Checklist

## 📋 Pre-Launch Validation (DO THIS FIRST)

Use this checklist to verify ALL fixes are properly applied before going to production.

---

## Phase 1: Code Verification ✅

### Check 1.1: BuyButton.tsx Updated
```bash
# Should show 285 lines (was 77)
wc -l components/BuyButton.tsx

# Should show interface and type definitions
grep -A 15 "interface BuyButtonProps" components/BuyButton.tsx
```

**Expected Result:**
```
285 components/BuyButton.tsx
interface BuyButtonProps {
  priceId?: string;
  productId?: string;
  ...
}
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 1.2: next.config.js Has CSP Headers
```bash
# Should show CSP configuration
grep "Content-Security-Policy" next.config.js

# Should show frame-src for Paddle
grep "frame-src" next.config.js
```

**Expected Result:**
```
key: 'Content-Security-Policy',
frame-src 'self' https://buy.paddle.com https://*.paddle.com
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 1.3: Environment Token Set
```bash
# Should show ctok_ or live_ format
grep NEXT_PUBLIC_PADDLE_CLIENT_TOKEN .env.local

# Should NOT be empty
test -n "$(grep NEXT_PUBLIC_PADDLE_CLIENT_TOKEN .env.local | cut -d= -f2)" && echo "✅ Token present" || echo "❌ Token missing"
```

**Expected Result:**
```
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ctok_55cb328a758ec2fe22405a16de3
✅ Token present
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 1.4: manifest.json Icons Updated
```bash
# Should reference favicon-192.png, favicon-512.png, etc.
grep -o '"src": "/favicon[^"]*' public/manifest.json
```

**Expected Result:**
```
"src": "/favicon-192.png"
"src": "/favicon-512.png"
"src": "/favicon-192-maskable.png"
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 1.5: PaddleInit.tsx Uses Paddle.Setup()
```bash
# Should use Paddle.Setup, not Paddle.Initialize
grep -c "Paddle.Setup" components/PaddleInit.tsx

# Should have 0 occurrences of old API
grep -c "Paddle.Initialize" components/PaddleInit.tsx
```

**Expected Result:**
```
1
0
```

✅ **Status:** PASS / ❌ FAIL

---

## Phase 2: Runtime Verification 🚀

### Check 2.1: Server Starts
```bash
# Start dev server
npm run dev

# Should see:
# ✓ Ready in 2.5s
# ✓ Local: http://localhost:3000
```

✅ **Status:** PASS / ❌ FAIL (if port in use, that's OK)

---

### Check 2.2: Console Shows Setup Completed
```
Open browser console (DevTools → Console)
After page loads, should see:

✅ [Paddle] Setup completed successfully
✅ [Paddle] Environment: sandbox
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 2.3: No Paddle Errors in Console
```
Console should NOT show:

❌ [PADDLE BILLING] You must specify your Paddle Seller ID
❌ Refused to frame 'https://buy.paddle.com/'
❌ Palette.Initialize is not a function
❌ PADDLE_CLIENT_TOKEN is undefined
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 2.4: Image Component Warnings Gone
```
Console should NOT show:

❌ Image with src '/cars.webp' was detected as LCP
❌ Image ... was detected as LCP. Please add loading='eager'
❌ Image ... has 'fill' but missing 'sizes' prop
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 2.5: Manifest Warnings Gone
```
Console should NOT show:

❌ Error while trying to use icon from Manifest
❌ Resource size not correct (for favicon icons)
```

✅ **Status:** PASS / ❌ FAIL

---

## Phase 3: Functional Testing 🎯

### Check 3.1: Click BuyButton
```
1. Navigate to any page with BuyButton
2. Click the button
3. Checkout overlay should appear
4. No console errors
```

Expected Console Output:
```
✅ [BuyButton] Paddle.Checkout.open is ready
🎯 [BuyButton] Opening checkout with priceId: pri_01ar...
✅ [BuyButton] Checkout opened successfully
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 3.2: Multiple Buttons Work
```
1. If page has multiple BuyButtons
2. Click each one separately
3. Each should open correct checkout
4. No "Paddle undefined" errors
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 3.3: Error Handling Works
```
1. Open console
2. Manually test with invalid price:
   window.Paddle.Checkout.open({ items: [{ priceId: 'pri_invalid' }] })
3. Should show error in console
4. Should show error message in UI (if error callback implemented)
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 3.4: Favicon Visible
```
1. Check browser tab
2. Should show custom favicon (not default browser icon)
3. On mobile, share/install menu should show correct icon
```

✅ **Status:** PASS / ❌ FAIL

---

## Phase 4: CSP Compliance 🔒

### Check 4.1: Network Tab Shows No CSP Blocks
```
1. Open DevTools → Network tab
2. Reload page
3. Filter for "paddle.js"
4. Should see 200 status (not 304, not blocked)
5. Inspect Response Headers
6. Should see "Content-Security-Policy" with frame-src for buy.paddle.com
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 4.2: Hard Refresh Clears Warnings
```
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. DevTools Console should be completely clean
3. No warnings related to Paddle, favicon, or images
4. Only dev/debug messages (if any)
```

✅ **Status:** PASS / ❌ FAIL

---

## Phase 5: Browser Compatibility 🌐

### Check 5.1: Test on Chrome
```
1. Open in Google Chrome
2. Run Phase 3 checks above
3. All should pass
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 5.2: Test on Firefox
```
1. Open in Mozilla Firefox
2. Run Phase 3 checks above
3. All should pass
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 5.3: Test on Safari (if Mac)
```
1. Open in Safari
2. Run Phase 3 checks above
3. All should pass (may have different console format)
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 5.4: Test on Mobile (if available)
```
1. Open http://[YOUR_IP]:3000 on mobile
   (get IP: ipconfig getall on Windows / ifconfig on Mac)
2. Click BuyButton
3. Checkout should open
4. Should be responsive
```

✅ **Status:** PASS / ❌ FAIL

---

## Phase 6: Pre-Production Checklist 🚀

### Check 6.1: Verify .env.production Exists
```bash
test -f .env.production && echo "✅ File exists" || echo "❌ Missing"
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 6.2: Check Production Token Format
```bash
grep NEXT_PUBLIC_PADDLE_CLIENT_TOKEN .env.production | head -c 10
# Should show: "NEXT_PUBLIC" or "live_a2b67" (not ctok_)
```

Expected:
- Starts with `live_` (production) or `ctok_` (sandbox)
- NOT empty
- NOT same as .env.local (if using different environments)

✅ **Status:** PASS / ❌ FAIL

---

### Check 6.3: Build Without Errors
```bash
npm run build

# Should complete without errors
# May show warnings (OK if not Paddle-related)
# Should create .next folder
```

✅ **Status:** PASS / ❌ FAIL

---

### Check 6.4: No Secrets in Code
```bash
# Should NOT find these strings in source
grep -r "PADDLE_API_KEY\|PADDLE_VENDOR_ID\|pdl_" app components --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l

# Should show: 0
```

✅ **Status:** PASS / ❌ FAIL

---

## Phase 7: Documentation Check 📚

### Check 7.1: Guides Exist
```bash
ls -1 PADDLE*.md FAVICON*.md | wc -l

# Should show: 10+ documentation files
```

Verify these exist:
- [ ] PADDLE_BUYBUTTON_GUIDE.md
- [ ] PADDLE_INTEGRATION_TESTING.md
- [ ] PADDLE_QUICK_REFERENCE.md
- [ ] PADDLE_V2_MIGRATION_GUIDE.md
- [ ] PADDLE_V2_COMPLETE_STATUS.md
- [ ] FAVICON_SETUP_GUIDE.md

✅ **Status:** PASS / ❌ FAIL

---

### Check 7.2: BuyButton Examples Documented
```bash
grep -l "BuyButton" PADDLE*.md | wc -l

# Should find examples in at least 2 files
```

✅ **Status:** PASS / ❌ FAIL

---

## Summary Results

| Phase | Checks | Status |
|-------|--------|--------|
| 1. Code | 5 | ✅ / ❌ |
| 2. Runtime | 5 | ✅ / ❌ |
| 3. Functional | 4 | ✅ / ❌ |
| 4. CSP | 2 | ✅ / ❌ |
| 5. Browser | 4 | ✅ / ❌ |
| 6. Pre-Prod | 4 | ✅ / ❌ |
| 7. Docs | 2 | ✅ / ❌ |
| **TOTAL** | **26** | **?** |

---

## ✅ All Checks Passed?

If all checks are **PASS**, you're ready for production! 🎉

**Next Steps:**
1. Create favicon asset files if needed (see FAVICON_SETUP_GUIDE.md)
2. Get real priceIds from Paddle dashboard
3. Update BuyButton instances
4. Deploy to staging first
5. Test full checkout flow
6. Deploy to production

---

## ❌ Some Checks Failed?

1. **Code Verification Failed:** Check file actually updated (not cached)
   ```bash
   # Verify file modification time
   ls -l components/BuyButton.tsx next.config.js
   ```

2. **Runtime Error:** Clear cache and restart
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Console Errors:** See [PADDLE_INTEGRATION_TESTING.md](PADDLE_INTEGRATION_TESTING.md)

4. **CSP Errors:** Hard refresh browser (Ctrl+Shift+R)

5. **Build Errors:** Check for typos in code files
   ```bash
   npm run build -- --debug
   ```

---

## 📞 Need Help?

See corresponding documentation:
- Code issues → [PADDLE_BUYBUTTON_GUIDE.md](PADDLE_BUYBUTTON_GUIDE.md)
- Runtime/console issues → [PADDLE_INTEGRATION_TESTING.md](PADDLE_INTEGRATION_TESTING.md)
- Favicon issues → [FAVICON_SETUP_GUIDE.md](FAVICON_SETUP_GUIDE.md)
- Quick answers → [PADDLE_QUICK_REFERENCE.md](PADDLE_QUICK_REFERENCE.md)
- General overview → [PADDLE_V2_COMPLETE_STATUS.md](PADDLE_V2_COMPLETE_STATUS.md)

---

## 🎯 Pro Tips

**Tip 1:** Print this checklist and check off as you go

**Tip 2:** Run all checks twice (sometimes caching causes false failures)

**Tip 3:** If one check fails, don't skip ahead - fix it first

**Tip 4:** Keep DevTools open during testing for real-time feedback

**Tip 5:** Test on actual Paddle sandbox environment (not just localhost)

---

**Status:** Ready for Validation ✅  
**Last Updated:** January 2025  
**Estimated Time:** 15-30 minutes
