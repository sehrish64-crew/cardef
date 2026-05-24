# Paddle v2 Maintenance & Development Guide

## For Developers Working on This Project

This guide explains how Paddle v2 is integrated into this project and how to maintain/extend it.

---

## Architecture Decision

### Why Token-Based Authentication?

**Paddle v2 requires token-based client authentication** instead of Vendor ID for security reasons:

1. **Security:** Public client tokens (`ctok_` / `live_`) can be safely exposed in the browser
2. **No Seller ID:** Seller/Vendor ID stays private (server-side only)
3. **Modern Standard:** Follows OAuth/API key best practices
4. **Paddle Requirement:** v2 SDK only accepts token-based Setup

### Example Flow

```
┌─────────────────────────────────────┐
│ User visits app                     │
│ Browser loads app/layout.tsx        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Script tag loads Paddle v2 SDK      │
│ window.Paddle becomes available     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ PaddleInit component mounts         │
│ Polls for window.Paddle availability│
│ Calls Paddle.Setup({ token })       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Paddle SDK initialized              │
│ Paddle.Checkout.open() is ready     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Components can now open checkout    │
│ Call Paddle.Checkout.open(...)       │
│ Overlay/inline checkout renders     │
└─────────────────────────────────────┘
```

---

## File Structure

### Root Layout - Script Loading

**File:** `app/layout.tsx` (lines 100-101)
```tsx
<Script 
  src="https://cdn.paddle.com/paddle/v2/paddle.js" 
  strategy="afterInteractive" 
/>
<PaddleInit />
```

**Why this matters:**
- Script must load BEFORE any component tries to use Paddle
- `afterInteractive` strategy: loads after page interactive (good for UX)
- PaddleInit runs AFTER script loads, doing the actual Setup

---

### Global Initialization - PaddleInit Component

**File:** `components/PaddleInit.tsx`

**Key features:**
- Runs once globally (no duplicate initializations)
- Polls `window.Paddle.Setup` availability (max 10 seconds)
- Calls `Paddle.Setup({ token })` with public client token
- Logs initialization success/failure
- Token format determines environment (ctok_ = sandbox, live_ = production)

**Flow:**
```typescript
useEffect(() => {
  // Poll every 250ms for Paddle.Setup availability
  const interval = setInterval(() => {
    if (window.Paddle?.Setup) {
      // Setup Paddle with public token
      window.Paddle.Setup({ token: 'ctok_...' or 'live_...' })
      setInitialized(true)
      clearInterval(interval)
    }
  }, 250)
  
  // Timeout after 10 seconds
  setTimeout(() => clearInterval(interval), 10000)
}, [])
```

**Common issues:**
- Token missing → Check `.env.local` has `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
- Script not loading → Check CDN isn't blocked, browser cache
- Setup not called → Check PaddleInit component is rendered in layout

---

### Components Using Checkout

**Files:**
- `components/BuyButton.tsx`
- `components/PaddleCheckout.tsx`
- `app/register-vehicle/payment/[id]/page.tsx`

**Pattern:**
```typescript
// 1. Wait for Paddle.Checkout.open to be available
useEffect(() => {
  const check = setInterval(() => {
    if (window.Paddle?.Checkout?.open) {
      setReady(true)
      clearInterval(check)
    }
  }, 250)
}, [])

// 2. Call it when user initiates action
const handleCheckout = () => {
  window.Paddle.Checkout.open({
    items: [{ priceId: 'pri_...' }],
    settings: { displayMode: 'overlay' }
  })
}
```

**Important:**
- Each component waits for `Paddle.Checkout.open` to exist
- Don't assume it's ready immediately on mount
- Use `window.Paddle?.Checkout?.open` (safe navigation) to avoid crashes

---

## Environment Variables

### Development

**File:** `.env.local`
```bash
# Public token - safe for browser
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ctok_sandbox_abc123...
NEXT_PUBLIC_PADDLE_ENV=sandbox  # Optional, informational only
```

### Production

**File:** `.env.production`
```bash
# Public token - for browser checkout
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_abc123...
NEXT_PUBLIC_PADDLE_ENV=production  # Optional

# Server-side only - NEVER NEXT_PUBLIC_
PADDLE_API_KEY=pdl_live_apikey_xyz789...
PADDLE_VENDOR_ID=123456
```

### Deployment

When deploying:
1. Set `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` to live token
2. Set `PADDLE_API_KEY` (server-side, no NEXT_PUBLIC_)
3. Set `PADDLE_VENDOR_ID` (server-side, no NEXT_PUBLIC_)
4. Verify in prod: token should start with `live_`

---

## How to Extend

### Adding a New Checkout Button

```typescript
import PaddleButtonSimple from '@/components/PaddleButtonSimple'

export default function MyComponent() {
  return (
    <PaddleButtonSimple 
      priceId="pri_my_product_123"
      label="Get Started"
      onCheckoutOpen={() => console.log('Checkout opened')}
      onError={(err) => toast.error(err.message)}
    />
  )
}
```

### Adding Custom Data to Checkout

```typescript
window.Paddle.Checkout.open({
  items: [{ priceId: 'pri_xyz' }],
  customData: {
    userId: user.id,
    planType: 'premium',
    referralCode: ref || undefined
  },
  settings: { displayMode: 'overlay' }
})
```

This data is passed to webhooks for verification.

### Handling Checkout Events

```typescript
// Listen for checkout events
const setupEventListener = () => {
  // Paddle v2 supports event callbacks via settings
  window.Paddle.Checkout.open({
    items: [{ priceId: 'pri_xyz' }],
    settings: { 
      displayMode: 'overlay',
      // Events emitted to your webhook handler
    }
    // Webhooks are server-side via /api/paddle/webhook
  })
}
```

### Server-Side Webhook Verification

```typescript
// pages/api/paddle/webhook.ts
export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('Paddle-Signature')
  
  // Verify signature using PADDLE_API_KEY
  const isValid = verifyWebhookSignature(body, signature)
  
  if (!isValid) {
    return new Response('Invalid', { status: 401 })
  }
  
  const event = JSON.parse(body)
  
  // Handle events
  if (event.type === 'transaction.completed') {
    // Process successful payment
    console.log('Payment successful:', event.data)
  }
  
  return new Response('OK', { status: 200 })
}
```

---

## Testing

### Unit Testing Components

```typescript
// __tests__/BuyButton.test.tsx
import { render, screen } from '@testing-library/react'
import BuyButton from '@/components/BuyButton'

describe('BuyButton', () => {
  it('should render button', () => {
    render(<BuyButton priceId="pri_test" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should wait for Paddle to be ready', async () => {
    // Mock window.Paddle
    ;(window as any).Paddle = {
      Checkout: { open: jest.fn() }
    }
    
    render(<BuyButton priceId="pri_test" />)
    
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toHaveAttribute('disabled')
    })
  })
})
```

### End-to-End Testing

```typescript
// e2e/paddle.spec.ts
import { test, expect } from '@playwright/test'

test('checkout flow', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Check Paddle loaded
  const paddleLoaded = await page.evaluate(() => !!window.Paddle)
  expect(paddleLoaded).toBe(true)
  
  // Click buy button
  await page.click('[data-testid="buy-button"]')
  
  // Checkout overlay should appear
  await page.waitForSelector('[data-paddle-checkout]')
})
```

---

## Troubleshooting Guide

### Problem: "You must specify your Paddle Seller ID or token"

**Diagnosis:**
```javascript
console.log('Token:', process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)
console.log('Paddle:', window.Paddle)
console.log('Setup:', window.Paddle?.Setup)
```

**Solutions:**
1. Check `.env.local` has `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
2. Token should start with `ctok_` (sandbox) or `live_` (production)
3. Rebuild: `npm run build` then `npm run dev`
4. Clear browser cache / DevTools cache

### Problem: Paddle.Checkout.open not a function

**Diagnosis:**
```javascript
console.log('Checkout:', window.Paddle?.Checkout)
console.log('Open:', typeof window.Paddle?.Checkout?.open)
```

**Solutions:**
1. Wait longer for initialization (PaddleInit takes max 10 seconds)
2. Check script loaded by checking Network tab
3. Verify Setup was called: `window.Paddle.Setup` should show the call
4. Look for errors in console (red messages)

### Problem: Checkout won't open

**Debug:**
```javascript
// Verify price ID exists
console.log('Price ID:', 'pri_test_123')

// Try opening manually
window.Paddle.Checkout.open({
  items: [{ priceId: 'pri_test_123' }],
  settings: { displayMode: 'overlay' }
})
// Should open overlay or show error in console
```

**Solutions:**
1. Verify price ID exists in Paddle dashboard
2. Check if price belongs to same product/account
3. Look for error messages in browser console
4. Check browser CSP headers (Paddle v2 handles this automatically)

---

## Performance Considerations

### Script Loading
- Uses `afterInteractive` strategy = good UX (doesn't block page interactive)
- CDN: https://cdn.paddle.com/paddle/v2/paddle.js ~150KB gzipped
- One-time load per page visit

### Initialization Polling
- Polls every 250ms with 10 second timeout
- After Setup, no additional polling in other components
- Components poll individually for Checkout.open (similar timing)

### Best Practices
```typescript
// ✅ Good: Initialize once globally
// In root layout, PaddleInit runs once

// ✅ Good: Check before use
if (window.Paddle?.Checkout?.open) { ... }

// ✅ Good: Handle errors
try { window.Paddle.Checkout.open(...) } catch(e) { ... }

// ❌ Avoid: Multiple Setup calls
// Don't call Setup in multiple components

// ❌ Avoid: Assuming immediate ready
// Always poll or wait, don't assume synchronous availability
```

---

## Common Patterns

### Pattern 1: Simple Buy Button

See `PADDLE_V2_BEST_PRACTICES.tsx`

### Pattern 2: Product Pricing Grid

```typescript
const products = [
  { name: 'Basic', priceId: 'pri_basic' },
  { name: 'Pro', priceId: 'pri_pro' }
]

export default function Pricing() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map(({ name, priceId }) => (
        <PaddleButtonSimple 
          key={priceId}
          priceId={priceId}
          label={`Buy ${name}`}
        />
      ))}
    </div>
  )
}
```

### Pattern 3: With Custom Data

```typescript
const handleCheckout = (userId: string, planId: string) => {
  window.Paddle.Checkout.open({
    items: [{ priceId: 'pri_xyz' }],
    customData: { userId, planId }
  })
}
```

---

## Monitoring & Alerts

### What to Monitor

1. **Initialization** - Check if PaddleInit logs success
2. **Checkout Opens** - Track how many checkouts initiated
3. **Conversion Rate** - Monitor payment completion
4. **Errors** - Watch for Paddle-related errors in error tracking service

### Logging

```typescript
// Production logging
console.log('✅ [Paddle] Setup completed')          // Success
console.error('❌ [Paddle] Setup error:', e)         // Error
console.warn('⚠️ [Paddle] Token may be invalid')     // Warning

// Integrate with error tracking (Sentry, etc)
Sentry.captureException(paddleError, {
  tags: { service: 'paddle-billing' }
})
```

---

## Migration / Upgrade Path

### If Paddle Releases v3

1. Check backward compatibility (likely maintained)
2. Review SDK changes in documentation
3. Update script URL if changed
4. Test thoroughly in staging
5. Deploy with feature flag if possible

### If Changing Payment Providers

1. Keep Paddle initialization but add parallel setup
2. Update checkout buttons to have provider switch
3. Test both flows
4. Migrate customer data as needed
5. Deprecate old provider

---

## Resources

- **Official Docs:** https://biz.paddle.com/docs/
- **API Reference:** https://biz.paddle.com/docs/api-reference/
- **SDK GitHub:** https://github.com/PaddleHQ/paddle-js
- **Webhooks:** https://biz.paddle.com/docs/webhooks/
- **Support:** https://support.paddle.com/

---

## Summary

**Key Points for Developers:**

1. **Setup is global and happens once** via PaddleInit
2. **Components wait for Paddle.Checkout.open** before using it
3. **Token format determines environment** (ctok_ = sandbox, live_ = prod)
4. **No Seller ID in client code** - keeps app secure
5. **Always check Paddle availability** before use (safe navigation)
6. **Errors are logged** - check browser console for debugging

Good luck maintaining this integration! 🎣
