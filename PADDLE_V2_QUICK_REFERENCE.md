# Paddle v2 Quick Reference - API & Components

## 🔐 Environment Setup

**File: `.env.local`**
```bash
# Server-side only (NEVER expose)
PADDLE_API_KEY=apikey_01khy0jszpz7y2gf5ejrsazp0h
PADDLE_VENDOR_ID=46857
```

---

## 📡 API Route: POST /api/create-checkout

**Code Location:** `app/api/create-checkout/route.ts`

### Request
```typescript
POST /api/create-checkout
Content-Type: application/json

{
  "productId": "pro_01khy0x2qtbj6b0ha8b3gqwf4b"
}
```

### Response
```typescript
// Success (200)
{
  "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

// Error (400/500)
{
  "error": "Missing or invalid productId",
  "details": {...}  // Optional error details
}
```

### Implementation
```typescript
// Validates productId
// Retrieves Paddle API key from environment
// Calls Paddle API: https://sandbox-vendors.paddle.com/api/2.0/product/generate_pay_link
// Extracts JWT from response
// Returns JWT to frontend
```

---

## 🎨 React Component: PaddleInit

**Code Location:** `components/PaddleInit.tsx`

### Usage
```tsx
import PaddleInit from '@/components/PaddleInit'

export default function CheckoutPage() {
  return (
    <div>
      <h1>Checkout</h1>
      <PaddleInit />  {/* Renders checkout UI */}
    </div>
  )
}
```

### UI Output
```
┌─────────────────────────────────────┐
│   Paddle v2 Checkout                │
├─────────────────────────────────────┤
│ ✅ Paddle is ready. Choose a plan.  │
│                                     │
│ [🚗 Basic Plan]                     │
│ [🏎️ Pro Plan]                       │
│ [🔥 Premium Plan]                   │
│                                     │
│ 🔐 Security Note: ...               │
└─────────────────────────────────────┘
```

### Features
- Auto-loads Paddle SDK from CDN
- Auto-initializes with client token
- Fetches JWT on button click
- Opens Paddle checkout modal
- Handles all errors and timeouts
- Shows status messages to user
- Full TypeScript support

---

## 🛍️ Products Configuration

Hardcoded in `PaddleInit.tsx`:

```typescript
const PRODUCTS = [
  {
    id: 'pro_01khy0x2qtbj6b0ha8b3gqwf4b',
    name: '🚗 Basic Plan',
    color: 'bg-blue-500'
  },
  {
    id: 'pro_01khy0vcm33yqq36kg3q6t2yw6',
    name: '🏎️ Pro Plan',
    color: 'bg-green-500'
  },
  {
    id: 'pro_01khy0qsx0ph28p52ar8em6ztp',
    name: '🔥 Premium Plan',
    color: 'bg-purple-500'
  }
]
```

---

## 🔑 Credentials

| Credential | Type | Value | Scope |
|-----------|------|-------|-------|
| API Key | Secret | `apikey_01khy0jszpz7y2gf5ejrsazp0h` | Server-side only |
| Vendor ID | Public | `46857` | Server & optional frontend |
| Client Token | Public | `ctok_55cb328a758ec2fe22405a16de3` | Frontend only |

---

## 🔄 Data Flow Diagram

```
User clicks "Buy Product"
        ↓
Frontend: openCheckout(productId)
        ↓
Fetch: POST /api/create-checkout { productId }
        ↓
Server: Validate productId + Get API key
        ↓
Server: POST to Paddle API (sandbox)
        ↓
Server: Extract JWT from response
        ↓
Return: { jwt } to frontend
        ↓
Frontend: window.Paddle.Checkout.open({ jwt })
        ↓
Paddle: Opens checkout modal
        ↓
User: Enters payment details
        ↓
Paddle: Processes payment
        ↓
Paddle: Calls webhook (optional)
```

---

## 🧪 Test With cURL

```bash
# Generate JWT
curl -X POST https://sandbox-vendors.paddle.com/api/2.0/product/generate_pay_link \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_id": 46857,
    "vendor_auth_code": "apikey_01khy0jszpz7y2gf5ejrsazp0h",
    "product_id": "pro_01khy0x2qtbj6b0ha8b3gqwf4b",
    "quantity": 1
  }'

# Response should contain:
# {
#   "success": true,
#   "response": {
#     "client_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
#   }
# }
```

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `"Missing or invalid productId"` | productId not sent or invalid | Check request body |
| `"No JWT returned from Paddle"` | API key/vendor ID wrong | Check `.env.local` |
| `"Failed to load Paddle SDK"` | CDN unreachable | Check network/CORS |
| `"Paddle SDK not initialized"` | Component not ready yet | Wait for "Paddle is ready" message |
| `"Paddle Checkout not available"` | SDK loaded but Checkout missing | Hard refresh page |

---

## 🔐 Security Checklist

- [ ] API key in `.env.local` (not `.env`)
- [ ] API key NOT in frontend code or logs
- [ ] `.gitignore` includes `.env.local`
- [ ] API key never in `NEXT_PUBLIC_*` variables
- [ ] Client token (`ctok_*`) safe in frontend code
- [ ] HTTPS used in production
- [ ] CORS properly configured
- [ ] Webhook validation implemented (if using webhooks)

---

## 📋 Constants

```typescript
// Timeouts
const SDK_LOAD_TIMEOUT_MS = 10000        // 10 seconds
const API_CALL_TIMEOUT_MS = 5000         // 5 seconds

// URLs
const PADDLE_SCRIPT_URL = 'https://cdn.paddle.com/paddle/v2/paddle.js'
const PADDLE_API_URL = 'https://sandbox-vendors.paddle.com/api/2.0/product/generate_pay_link'

// Tokens
const PADDLE_CLIENT_TOKEN = 'ctok_55cb328a758ec2fe22405a16de3'  // Sandbox

// Response key for JWT
const JWT_KEY = 'data.response.client_token'
```

---

## 🚀 Quick Start for New Dev

1. **Ensure `.env.local` exists with:**
   ```
   PADDLE_API_KEY=apikey_01khy0jszpz7y2gf5ejrsazp0h
   PADDLE_VENDOR_ID=46857
   ```

2. **Import component in your page:**
   ```tsx
   import PaddleInit from '@/components/PaddleInit'
   ```

3. **Add to JSX:**
   ```tsx
   <PaddleInit />
   ```

4. **Test:**
   - Open DevTools Console (F12)
   - Look for ✅ success messages
   - Click a product button
   - Verify checkout opens

5. **Debug:**
   - Use console logs: `[Paddle]`, `[create-checkout]`
   - Check Network tab for requests
   - Check for errors in red

---

## 📱 Responsive Design

Component includes:
- Mobile-friendly buttons
- Responsive layout with max-width
- Touch-friendly spacing (py-3 px-4)
- Proper font sizing for readability
- Dark mode compatible colors

---

## 🎯 Files Summary

| File | Purpose | Modified |
|------|---------|----------|
| `app/api/create-checkout/route.ts` | JWT generation API | ✅ |
| `components/PaddleInit.tsx` | Checkout UI & SDK init | ✅ |
| `.env.local` | Credentials (create if missing) | ⚠️ |
| `PADDLE_V2_IMPLEMENTATION_GUIDE.md` | Full documentation | ✅ |

---

## 🎉 Ready to Use!

Copy-paste and go:

```tsx
// In your page component
import PaddleInit from '@/components/PaddleInit'

export default function Example() {
  return <PaddleInit />
}
```

That's it! 🚀
Paddle.Environment.set()
Paddle.Initialize()
Paddle.Setup({ vendor: 123 })
Paddle.Checkout.open({ product: 123 })
Paddle.Setup({ seller: 123 })
```

## 📌 Token Format

| Type | Format | Environment | Exposure |
|------|--------|-------------|----------|
| Client Token | `ctok_...` | Sandbox | Public (NEXT_PUBLIC_) |
| Live Token | `live_...` | Production | Public (NEXT_PUBLIC_) |
| API Key | `pdl_...` | Server | Private only |

## ⚡ Common Patterns

### Simple Buy Button
```tsx
<button onClick={() => {
  window.Paddle?.Checkout.open({
    items: [{ priceId: 'pri_xyz' }],
    settings: { displayMode: 'overlay' }
  })
}}>
  Buy Now
</button>
```

### Wait for Ready
```tsx
const [ready, setReady] = useState(false)

useEffect(() => {
  const check = setInterval(() => {
    if (window.Paddle?.Checkout?.open) {
      setReady(true)
      clearInterval(check)
    }
  }, 250)
}, [])
```

### Multiple Items
```tsx
window.Paddle.Checkout.open({
  items: [
    { priceId: 'pri_basic', quantity: 1 },
    { priceId: 'pri_addon', quantity: 2 }
  ],
  settings: { displayMode: 'overlay' }
})
```

## 🔍 Debugging

```typescript
// Check if Paddle loaded
console.log(window.Paddle) // Should exist

// Check Setup status
console.log(window.Paddle?.Setup) // Should be a function

// Check Checkout status
console.log(window.Paddle?.Checkout?.open) // Should be a function

// Verify token
console.log(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)
// Should start with ctok_ or live_
```

## 🎯 Error Messages

| Error | Solution |
|-------|----------|
| "You must specify your Paddle Seller ID or token" | Add `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` to `.env.local` |
| "Paddle.Checkout.open is not a function" | Call `Paddle.Setup()` first and wait for script to load |
| "Price not found" | Verify `priceId` exists in Paddle dashboard |
| "CSP violation" | Paddle v2 handles CSP automatically - no special config needed |

## 📝 Files to Check

- `app/layout.tsx` - Script loading ✅
- `components/PaddleInit.tsx` - Initialization ✅
- `.env.local` - Token set ✅
- Components using `Paddle.Checkout.open()` - Check they use v2 API ✅

## 🚀 How to Test

1. **Sandbox (Development)**
   ```bash
   # Use ctok_ token
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ctok_sandbox_...
   ```

2. **Production (Live)**
   ```bash
   # Use live_ token
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_...
   ```

3. **Verify in Browser**
   ```javascript
   // Open DevTools Console
   window.Paddle.Checkout.open({
     items: [{ priceId: 'pri_test' }],
     settings: { displayMode: 'overlay' }
   })
   ```

## 📚 Full Guide

See `PADDLE_V2_MIGRATION_GUIDE.md` for complete documentation.
