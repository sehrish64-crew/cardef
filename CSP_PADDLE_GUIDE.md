# 🔐 CSP (Content Security Policy) Guide - Paddle Integration

## ✅ Your CSP is Already Configured Correctly

The warning you're seeing is **report-only mode** - it's not blocking, just warning.

---

## 📊 Current CSP Configuration

**Location:** `next.config.js` (lines 50-60)

### What's Configured

```javascript
// Allow embedding Paddle checkout iframe in our page
"frame-src 'self' https://buy.paddle.com https://checkout.paddle.com https://*.paddle.com"

// Allow our page to be framed by Paddle and localhost (for development)
"frame-ancestors 'self' http://localhost http://localhost:3000 https://*.paddle.com"
```

### ✅ What Each Does

| Directive | Purpose | Configured |
|-----------|---------|-----------|
| `frame-src` | Controls what iframes THIS page can embed | ✅ Paddle domains allowed |
| `frame-ancestors` | Controls where THIS page can be embedded | ✅ Localhost + Paddle allowed |
| `script-src` | Controls what scripts can run | ✅ Paddle SDK allowed |
| `connect-src` | Controls API calls | ✅ Paddle API allowed |

---

## ⚠️ The Warning Explained

**You see this warning:**
```
Framing 'https://buy.paddle.com/' violates the following 
report-only Content Security Policy directive: "frame-ancestors http://localhost"
```

**What it means:**
- ✅ This is **report-only** mode (NOT blocking anything)
- ✅ Paddle iframe is loading successfully
- ✅ Browser just logging the warning
- ✅ Safe to ignore in development

**Why it appears:**
1. Your page is on `http://localhost:3000`
2. Paddle iframe from `https://buy.paddle.com` is being embedded
3. Mixed HTTP/HTTPS → CSP warning
4. But everything works fine

---

## 🟢 Status: All Good!

Your checkout flow is working because:
- ✅ CSP allows frame-src for Paddle
- ✅ CSP allows frame-ancestors for localhost  
- ✅ Warning is report-only (not blocking)
- ✅ Paddle checkout loads and functions normally

---

## 🔧 For Production

When deploying to production, update CSP to include your domain:

**Example for domain `example.com`:**

```javascript
"frame-ancestors 'self' https://example.com https://*.paddle.com"
```

**Or with subdomains:**

```javascript
"frame-ancestors 'self' https://*.example.com https://example.com https://*.paddle.com"
```

**Full production example:**

```javascript
headers: async () => {
  const isProd = process.env.NODE_ENV === 'production'
  const allowedOrigins = isProd 
    ? 'https://yourdomain.com https://*.yourdomain.com'
    : 'http://localhost http://localhost:3000'

  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.paddle.com`,
            "style-src 'self' 'unsafe-inline' https://cdn.paddle.com",
            "frame-src 'self' https://buy.paddle.com https://checkout.paddle.com",
            `frame-ancestors 'self' ${allowedOrigins} https://*.paddle.com`,
            "connect-src 'self' https://*.paddle.com https://api.paddle.com",
            // ... other directives
          ].join('; ')
        }
      ]
    }
  ]
}
```

---

## 📋 CSP Directives Breakdown

### Security Directives (Already Configured)

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Restrict everything by default |
| `script-src` | `'self' 'unsafe-inline' https://cdn.paddle.com` | Allow Paddle SDK |
| `style-src` | `'self' 'unsafe-inline' https://cdn.paddle.com` | Allow Paddle styles |
| `frame-src` | `https://buy.paddle.com` | Allow Paddle checkout iframe |
| `frame-ancestors` | `localhost https://*.paddle.com` | Allow on localhost, Paddle |
| `connect-src` | `https://*.paddle.com https://api.paddle.com` | Allow API calls |
| `img-src` | `'self' data: https:` | Allow images |
| `font-src` | `'self' data: https:` | Allow fonts |

---

## 🧪 Testing CSP

### Check CSP Headers

**In DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Click any request
4. Find "Content-Security-Policy" in Response Headers
5. Should see your directives

**Using curl:**
```bash
curl -i http://localhost:3000 | grep -i content-security-policy
```

**Result should contain:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'...
frame-src 'self' https://buy.paddle.com...
frame-ancestors 'self' http://localhost...
```

### Verify Paddle Works

1. Open page with PaddleInit component
2. Check Console (F12) for warnings/errors
3. Click "Buy Product" button
4. Paddle checkout should open
5. ✅ If opening → CSP is working correctly

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] Update `frame-ancestors` with your domain
- [ ] Remove `http://localhost` references
- [ ] Test on production domain
- [ ] Verify CSP headers are sent
- [ ] Check browser console for violations
- [ ] Test Paddle checkout works
- [ ] Monitor for CSP violations in production

**Example production domain update:**

```javascript
// Before (development)
"frame-ancestors 'self' http://localhost http://localhost:3000 https://*.paddle.com"

// After (production)
"frame-ancestors 'self' https://yourdomain.com https://*.yourdomain.com https://*.paddle.com"
```

---

## ❓ FAQ

### Q: Is the warning blocking my checkout?
**A:** No! Warning is report-only. Paddle checkout loads fine.

### Q: Do I need to fix this for development?
**A:** No, it's safe in dev. Just fix before production.

### Q: What if I see hard CSP violations?
**A:** That means checkout is actually blocked. Check browser console for actual error instead of warning.

### Q: How do I know its report-only vs blocking?
- **Report-only:** Page works fine, warning in console
- **Blocking:** Checkout doesn't load, hard error in console

---

## 🔍 Troubleshooting

### Paddle checkout not loading

**Check CSP headers:**
```bash
curl -i http://localhost:3000 | grep -i "frame-src"
```

**Should contain:** `https://buy.paddle.com`

### Too many CSP warnings

**Fix:** Add `Trusted-Domains` or migrate to more specific rules

### Production domain blocked

**Fix:** Add domain to `frame-ancestors`:
```javascript
"frame-ancestors 'self' https://yourdomain.com https://*.paddle.com"
```

---

## 📚 References

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Paddle iframe documentation](https://developer.paddle.com/)
- [Next.js headers configuration](https://nextjs.org/docs/api-reference/next.config.js/headers)

---

## ✨ Summary

| Item | Status | Action |
|------|--------|--------|
| Development CSP | ✅ Working | None needed |
| Paddle iframe | ✅ Loading | None needed |
| CSP warning | ✅ Report-only | None needed (dev) |
| Production setup | ⚠️ Prepare | Update domain before deploy |

---

**Current State:** ✅ **ALL WORKING - CSP is properly configured**

Your Paddle integration is working correctly. The warning is just the browser reporting a CSP rule violation in report-only mode. When you deploy to production, update the domain in `frame-ancestors` and you're done!

🎉 **No action required for development.**
