# Paddle Integration Testing & Troubleshooting Guide

## 🎯 Quick Testing Checklist

Run through these checks to verify your Paddle v2 integration is working:

### 1. Environment Variables ✅
```bash
# Check .env.local has sandbox token
grep NEXT_PUBLIC_PADDLE_CLIENT_TOKEN .env.local

# Expected output:
# NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ctok_sandbox_xxxxx
```

### 2. Server Startup 🚀
```bash
npm run dev
# Should start without errors
# Watch for: ✅ [Paddle] Setup completed successfully
```

### 3. Browser Console ✅
Open DevTools (F12) → Console tab and check for:
```
✅ [Paddle] Setup completed successfully
✅ [Paddle] Environment: sandbox
✅ [BuyButton] Paddle script loaded successfully
```

### 4. CSP Violations ✅
Console should NOT show:
```
❌ Refused to frame 'https://buy.paddle.com/' because...
❌ Refused to load the script from 'https://cdn.paddle.com/paddle/v2/'...
```

If you see these errors, see **CSP Troubleshooting** below.

### 5. Click a BuyButton 🛒
Navigate to any page with a BuyButton and click it. You should see:
- [ ] Paddle checkout overlay appears
- [ ] No console errors
- [ ] Can interact with checkout form
- [ ] "✅ [Paddle] Checkout opened successfully" in console

---

## 🔍 Detailed Testing Procedures

### Test 1: Verify Script Loading

```javascript
// Open console and run:
console.log('Paddle loaded?', typeof window.Paddle !== 'undefined');
console.log('Paddle.Checkout available?', 
  typeof window.Paddle?.Checkout?.open === 'function');
```

Expected output:
```
Paddle loaded? true
Paddle.Checkout available? true
```

### Test 2: Verify Configuration

```javascript
// Check if Paddle initialized with token
if (window.Paddle) {
  console.log('✅ Paddle is available');
  console.log('Token starts with:', 
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.substring(0, 6) + '***');
} else {
  console.log('❌ Paddle not loaded');
}
```

### Test 3: Manual Checkout Test

```javascript
// Open console and run this directly:
if (window.Paddle?.Checkout?.open) {
  window.Paddle.Checkout.open({
    items: [
      { 
        priceId: 'pri_01aryz6z94z1smf44ehs2d9rbp' // or your price ID
      }
    ]
  });
} else {
  console.error('Paddle.Checkout.open not available');
}
```

### Test 4: Check CSP Headers

```javascript
// In DevTools Console, check response headers:
fetch(window.location.href, { method: 'HEAD' })
  .then(r => {
    const csp = r.headers.get('content-security-policy');
    console.log('CSP Header:', csp);
  });
```

Expected:
```
CSP Header: frame-src 'self' https://buy.paddle.com https://*.paddle.com; script-src 'self' https://cdn.paddle.com...
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Paddle is not defined"

**Symptoms:**
```
❌ ReferenceError: Paddle is not defined
```

**Causes:**
1. Script not loaded yet
2. Token is invalid
3. CDN blocked

**Solutions:**

**Step 1:** Check token format
```bash
grep NEXT_PUBLIC_PADDLE_CLIENT_TOKEN .env.local
# Should say: ctok_sandbox_xxxxx or live_xxxxx
```

**Step 2:** Hard refresh browser
```
Windows: Ctrl+Shift+R
Mac: Cmd+Shift+R
```

**Step 3:** Check if script loaded
```javascript
// In console:
document.querySelectorAll('script')
  .forEach(s => {
    if (s.src.includes('paddle')) console.log('✅ Found:', s.src);
  });
```

Expected:
```
✅ Found: https://cdn.paddle.com/paddle/v2/paddle.js
```

**Step 4:** Check Network tab
- Open DevTools → Network tab
- Reload page
- Filter for "paddle.js"
- Should see 200 status (not 404 or blocked)
- If blocked: CSP issue (see below)

---

### Issue 2: CSP Violations (Frame-Ancestors)

**Symptoms:**
```
❌ Refused to frame 'https://buy.paddle.com/' because 
   it violates the following Content Security Policy directive: 
   "frame-src 'none'".
```

**Solution:**

Your next.config.js has been updated with CSP headers. If still seeing errors:

**Step 1:** Verify next.config.js has CSP

```bash
grep -A 10 "Content-Security-Policy" next.config.js

# Should show:
# frame-src 'self' https://buy.paddle.com https://*.paddle.com
# script-src 'self' https://cdn.paddle.com
# connect-src 'self' https://*.paddle.com
```

**Step 2:** Clear Next.js cache
```bash
# Stop dev server (Ctrl+C)
rm -rf .next
npm run dev
```

**Step 3:** Hard refresh browser
```
Windows: Ctrl+Shift+R
Mac: Cmd+Shift+R
```

**Step 4:** Check CSP in Response Headers

```javascript
// In console (DevTools → Network tab):
// Click any request → Response Headers
// Look for: Content-Security-Policy
```

Should contain:
```
frame-src 'self' https://buy.paddle.com https://*.paddle.com
```

---

### Issue 3: Checkout Doesn't Open

**Symptoms:**
- Click button, nothing happens
- No error in console
- Button shows "Loading..." indefinitely

**Diagnosis:**

```javascript
// Run in console:
if (!window.Paddle) {
  console.log('❌ Paddle not loaded');
} else if (typeof window.Paddle.Checkout?.open !== 'function') {
  console.log('❌ Paddle.Checkout.open not available');
} else {
  console.log('✅ Paddle ready');
}
```

**Solutions:**

**If Paddle not loaded:**
1. Wait 5 seconds (script loading can take time)
2. Hard refresh browser
3. Check Network tab for paddle.js 404 errors

**If Paddle.Checkout.open not available:**
1. Check token is valid: `process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Check PaddleInit.tsx is in your layout.tsx or _app.tsx

**If everything works but checkout doesn't open:**
1. Verify priceId in BuyButton matches your Paddle dashboard
2. Check Network tab for failed requests to api.paddle.com
3. Comment out error callbacks to see real error:
   ```tsx
   <BuyButton priceId="pri_test" />
   ```

---

### Issue 4: Invalid Price ID

**Symptoms:**
```
❌ Error: price_id could not be found
```

**Cause:** Price ID doesn't exist in Paddle dashboard or is for wrong environment (sandbox price with live token)

**Solution:**

1. Go to https://vendors.paddle.com/products (sandbox)
2. Find a product and click it
3. Copy the Price ID (starts with `pri_01...`)
4. Use that in BuyButton:
   ```tsx
   <BuyButton priceId="pri_01aryz6z94z1smf44ehs2d9rbp" />
   ```

**For production:**
1. Go to live.paddle.com (requires account switch)
2. Create a price if not already done
3. Update BuyButton with live price ID
4. Switch to .env.production token (live_xxx)

---

### Issue 5: CORS Errors

**Symptoms:**
```
❌ Access to XMLHttpRequest blocked by CORS policy
```

**Cause:** Rare - usually means Paddle CDN is down

**Solution:**
1. Check Paddle status: https://status.paddle.com/
2. Try different browser (rule out browser extensions)
3. Check your internet connection

---

## 🧪 Integration Test Scenarios

### Scenario 1: Test Checkout Opens (Without Payment)

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Click any BuyButton
# Verify checkout overlay appears
# Close overlay (X button)
# No payment made (overlay only)
```

**Expected:** 
- Checkout opens in overlay
- Can interact with form
- Can close without payment
- No console errors

---

### Scenario 2: Test Error Handling

```tsx
// Temporarily test with invalid price ID:
<BuyButton priceId="pri_invalid_test_12345" />

// Click button
// Should show error message below button
// Console shows: "Error: price_id could not be found"
```

**Expected:**
- Error displays gracefully
- User sees helpful message
- Not a app-breaking failure

---

### Scenario 3: Test Multiple Products

```tsx
<BuyButton priceId="pri_price_1" quantity={1}>Buy 1 License</BuyButton>
<BuyButton priceId="pri_price_2" quantity={2}>Buy 2 Licenses</BuyButton>

// Click each - should open separate checkouts
```

**Expected:**
- Each button opens correct item
- Quantity appears in checkout

---

### Scenario 4: Environment Switching

```bash
# In .env.local, verify:
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ctok_sandbox_xxxxx

# In console after loading:
// Should show: ✅ [Paddle] Environment: sandbox
```

---

## 📊 Verification Commands

Run these to verify setup:

```bash
# Check token exists
grep NEXT_PUBLIC_PADDLE_CLIENT_TOKEN .env.local

# Check BuyButton.tsx exists and is updated
head -20 components/BuyButton.tsx | grep -i "interface\|priceId"

# Check next.config.js has CSP
grep "frame-src" next.config.js

# Check PaddleInit.tsx exists
test -f components/PaddleInit.tsx && echo "✅ PaddleInit exists" || echo "❌ Missing"

# Check layout.tsx imports PaddleInit
grep -i "paddleinit" app/layout.tsx

# Count all BuyButton usages
grep -r "BuyButton" app components --include="*.tsx" | wc -l
```

---

## 🚀 Production Checklist

Before deploying to Hostinger:

- [ ] .env.production has live_ token (not ctok_)
- [ ] No console errors on localhost
- [ ] BuyButton opens checkout overlay
- [ ] CSP headers pass security audit
- [ ] Favicon icons visible
- [ ] No Image component warnings
- [ ] Webhook endpoint is ready for payment notifications
- [ ] Database connection tested
- [ ] Error logging working (Sentry, LogRocket, etc.)

---

## 📞 Getting Help

**If issues persist:**

1. **Check Paddle Status:** https://status.paddle.com/
2. **Paddle Support:** https://biz.paddle.com/help-center/
3. **API Reference:** https://biz.paddle.com/docs/api-reference/
4. **Community:** https://discord.gg/paddle

**Provide this info when asking for help:**
- Error message (exact)
- Steps to reproduce
- Browser & OS
- Token format (ctok_ or live_)
- Next.js version: `npm list next`
- Node version: `node -v`

---

## ✅ All Tests Passed!

If all above tests pass, your Paddle integration is working! 🎉

Next steps:
1. Customize BuyButton styling as needed
2. Integrate payment webhooks for order fulfillment
3. Deploy to production with live tokens
4. Monitor error logs
5. Test live checkout in sandbox mode first

---

## 📝 Notes

- Sandbox mode recommended for testing
- Switch to live mode only after sandbox testing complete
- Keep tokens secure (never commit to git)
- Monitor Paddle webhook notifications for order updates

---

Happy integrating! 🚀
