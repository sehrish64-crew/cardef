# Paddle Billing v2 Migration Guide

## Overview
This guide covers the migration from Paddle v1 legacy initialization to Paddle Billing v2 using token-based authentication (no Seller ID).

## Issue Fixed
**Error:** `[PADDLE BILLING] You must specify your Paddle Seller ID or token.`

**Root Cause:** Legacy v1 methods like `Paddle.Setup()` and `Paddle.Environment.set()` were mixed with v2 expectations, and initialization was happening before the script fully loaded.

---

## Key Differences: Paddle v1 vs v2

### Paddle v1 (Legacy - DO NOT USE)
```typescript
// ❌ WRONG - These methods don't exist in v2
window.Paddle.Environment.set('sandbox');
window.Paddle.Setup({ vendor: 123456 });
window.Paddle.Initialize({ ... });
window.Paddle.Checkout.open({ product: 12345, ... });
```

### Paddle v2 (Current - USE THIS)
```typescript
// ✅ CORRECT - Token-based only
window.Paddle.Setup({ token: 'ctok_...' });
window.Paddle.Checkout.open({
  items: [{ priceId: 'pri_...' }],
  settings: { displayMode: 'overlay' }
});
```

---

## Environment Setup

### 1. Configure `.env.local` (Development)
```bash
# Sandbox token - starts with ctok_
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ctok_YOUR_SANDBOX_TOKEN_HERE
NEXT_PUBLIC_PADDLE_ENV=sandbox
```

### 2. Configure `.env.production` (Production)
```bash
# Live token - starts with live_
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_YOUR_PRODUCTION_TOKEN_HERE
NEXT_PUBLIC_PADDLE_ENV=production

# Server-only keys (should never be exposed)
PADDLE_API_KEY=pdl_live_apikey_...
PADDLE_VENDOR_ID=YOUR_VENDOR_ID  # Only for server-side APIs
```

### 3. Update `.env.example`
```bash
# Paddle (frontend client token - must be public)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ctok_YOUR_SANDBOX_TOKEN_HERE
NEXT_PUBLIC_PADDLE_ENV=sandbox

# Paddle API (server-only - NEVER expose)
PADDLE_VENDOR_ID=YOUR_VENDOR_ID
PADDLE_API_KEY=pdl_live_apikey_...
```

---

## Implementation Details

### Loading Paddle Script (in `app/layout.tsx`)
```typescript
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Load Paddle v2 script - must happen BEFORE initialization */}
        <Script 
          src="https://cdn.paddle.com/paddle/v2/paddle.js" 
          strategy="afterInteractive" 
        />
      </head>
      <body>
        <PaddleInit />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### Initializing Paddle (in `components/PaddleInit.tsx`)
```typescript
"use client"

import { useEffect, useState } from 'react'

export default function PaddleInit() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Poll until Paddle.Setup is available
    const interval = setInterval(() => {
      const w = window as any
      if (w?.Paddle?.Setup) {
        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
        
        if (!token) {
          console.error('❌ Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN')
          clearInterval(interval)
          return
        }

        // Initialize with token-based auth (required for v2)
        w.Paddle.Setup({ token })
        
        console.log('✅ Paddle v2 initialized with client token')
        setInitialized(true)
        clearInterval(interval)
      }
    }, 250)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (!initialized) {
        console.error('❌ Paddle initialization timeout')
      }
    }, 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [initialized])

  return null
}
```

### Opening Checkout
```typescript
// ✅ Simple Overlay Checkout
Paddle.Checkout.open({
  items: [{ priceId: 'pri_YOUR_PRICE_ID' }],
  settings: {
    displayMode: 'overlay',
    frameInitialHeight: 600,
  },
})

// ✅ Inline Checkout  
Paddle.Checkout.open({
  items: [{ priceId: 'pri_YOUR_PRICE_ID' }],
  settings: {
    displayMode: 'inline',
    frameTarget: '#paddle-checkout',
  },
})
```

---

## Common Integration Patterns

### Pattern 1: Buy Button Component
```typescript
"use client";
import { useState, useEffect } from "react";

export default function BuyButton({ priceId }: { priceId: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = setInterval(() => {
      if (window.Paddle?.Checkout?.open) {
        setReady(true);
        clearInterval(check);
      }
    }, 250);
    return () => clearInterval(check);
  }, []);

  const handleClick = () => {
    window.Paddle?.Checkout.open({
      items: [{ priceId }],
      settings: { displayMode: 'overlay' }
    });
  };

  return (
    <button onClick={handleClick} disabled={!ready}>
      {ready ? 'Buy Now' : 'Loading...'}
    </button>
  );
}
```

### Pattern 2: Product Pricing Grid
```typescript
const products = [
  { name: 'Basic', priceId: 'pri_basic_sandbox' },
  { name: 'Pro', priceId: 'pri_pro_sandbox' },
  { name: 'Enterprise', priceId: 'pri_enterprise_sandbox' },
];

products.forEach(({ priceId }) => {
  document.getElementById(priceId)?.addEventListener('click', () => {
    window.Paddle?.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: { displayMode: 'overlay' }
    });
  });
});
```

### Pattern 3: With Custom Data
```typescript
// Send custom metadata with transaction
Paddle.Checkout.open({
  items: [{ priceId: 'pri_xyz', quantity: 1 }],
  customData: {
    userId: user.id,
    registrationId: vehicle.id,
    referralCode: ref,
  },
  settings: { displayMode: 'overlay' }
});
```

---

## Token Format Reference

### Sandbox Tokens (Development)
- **Client Token:** Starts with `ctok_` 
- Can be used in browser code
- Required for testing

Example: `ctok_sandbox_a1b2c3d4e5f6g7h8i9j0`

### Production Tokens (Live)
- **Client Token:** Starts with `live_`
- Used in browser for real transactions
- Used in `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`

Example: `live_0315ac06b1b66c0e808184756dc...`

- **API Key:** Starts with `pdl_` (server-side only)
- Never expose to browser
- Used for server-side API calls

Example: `pdl_live_apikey_01khxygj4s6...`

---

## Debugging Checklist

### Problem: "You must specify your Paddle Seller ID or token"

**Solutions:**
1. ✅ Verify `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` is set in `.env.local`
2. ✅ Ensure token starts with `ctok_` (sandbox) or `live_` (production)
3. ✅ Check that `PaddleInit` component is rendered in root layout
4. ✅ Look for timing issues - Paddle script must load before use
5. ✅ Check browser console for missing token error message

### Problem: "Paddle.Checkout.open is not a function"

**Solutions:**
1. ✅ Wait for `Paddle.Checkout` to be available (poll with timeout)
2. ✅ Ensure `Paddle.Setup()` was called with valid token
3. ✅ Verify the Paddle script loaded: check `window.Paddle` in console
4. ✅ Remove old polling mechanisms - use the one in `PaddleInit`

### Problem: Checkout overlay won't open

**Solutions:**
1. ✅ Check the `priceId` format: should be `pri_...`
2. ✅ Verify price exists in your Paddle workspace
3. ✅ Check browser console for specific error messages
4. ✅ Ensure `displayMode: 'overlay'` is set in settings

---

## Server-Side Integration (Optional)

For webhook verification and server-side operations:

```typescript
// pages/api/paddle/webhook.ts
import { validateWebhookSignature } from '@/lib/paddle';

export async function POST(req: Request) {
  const signature = req.headers.get('Paddle-Signature');
  const body = await req.text();

  // Verify webhook is from Paddle
  const isValid = validateWebhookSignature(body, signature);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);

  // Handle different event types
  switch (event.type) {
    case 'transaction.completed':
      // Transaction successful
      console.log('Payment confirmed:', event.data);
      break;
    case 'transaction.updated':
      // Transaction status changed
      console.log('Payment updated:', event.data);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

---

## Testing Checklist

- [ ] Development: Use sandbox token (`ctok_...`)
- [ ] Checkout opens with overlay/inline mode
- [ ] Price displays correctly in checkout
- [ ] Custom data passes through (if used)
- [ ] Error handling works for missing token
- [ ] Page refreshes don't break initialization
- [ ] Multiple price buttons work independently
- [ ] Production: Test with live token (`live_...`)

---

## Files Modified

1. **[app/layout.tsx](app/layout.tsx#L101)** - Paddle script loading
2. **[components/PaddleInit.tsx](components/PaddleInit.tsx)** - Token-based initialization
3. **[components/PaddleCheckout.tsx](components/PaddleCheckout.tsx)** - v2 API
4. **[components/BuyButton.tsx](components/BuyButton.tsx)** - v2 checkout
5. **[app/register-vehicle/payment/[id]/page.tsx](app/register-vehicle/payment/[id]/page.tsx)** - v2 payment

---

## Resources

- [Paddle Billing v2 Documentation](https://biz.paddle.com/docs/)
- [Paddle.js SDK Reference](https://biz.paddle.com/docs/api-reference/client-side/)
- [Checkout Integration Guide](https://biz.paddle.com/docs/checkout/)
- [Webhook Events Reference](https://biz.paddle.com/docs/webhooks/)

---

## Support

If you encounter issues:

1. Check browser console for error messages
2. Verify envirIonment variables are loaded: `console.log(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)`
3. Ensure Paddle script loaded: `console.log(window.Paddle)`
4. Check network tab for CDN access issues
5. Review Paddle dashboard for account status
