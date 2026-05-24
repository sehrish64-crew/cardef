# Paddle BuyButton - Complete Integration Guide

## Overview

The improved `BuyButton` component provides enterprise-grade Paddle Billing v2 integration for your Next.js application with:

- ✅ Sandbox & production environment support
- ✅ Dynamic Paddle script loading
- ✅ Comprehensive error handling & logging
- ✅ Multi-product checkout support
- ✅ CSP (Content Security Policy) compliant
- ✅ Accessible & responsive design

---

## 🚀 Quick Start

### 1. Basic Usage - Single Product

```tsx
import BuyButton from '@/components/BuyButton'

export default function PricingPage() {
  return (
    <BuyButton 
      priceId="pri_01aryz6z94z1smf44ehs2d9rbp"
      onCheckoutOpen={() => console.log('Checkout opened')}
      onCheckoutError={(err) => console.error('Checkout failed:', err.message)}
    >
      Buy Premium Plan
    </BuyButton>
  )
}
```

### 2. Multiple Products

```tsx
import BuyButton from '@/components/BuyButton'

export default function PricingCards() {
  const plans = [
    { name: 'Basic', priceId: 'pri_basic_sandbox_123', price: '$29' },
    { name: 'Standard', priceId: 'pri_standard_sandbox_456', price: '$79' },
    { name: 'Premium', priceId: 'pri_premium_sandbox_789', price: '$199' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <div key={plan.priceId} className="p-6 border rounded-lg">
          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <p className="text-4xl font-bold text-blue-600 mb-6">{plan.price}</p>
          <BuyButton 
            priceId={plan.priceId}
            className="w-full"
            onCheckoutError={(err) => {
              alert(`Failed to open ${plan.name} checkout: ${err.message}`)
            }}
          >
            Get {plan.name}
          </BuyButton>
        </div>
      ))}
    </div>
  )
}
```

### 3. With Custom Quantity & Callbacks

```tsx
<BuyButton
  priceId="pri_01aryz6z94z1smf44ehs2d9rbp"
  quantity={2}
  onCheckoutOpen={() => {
    console.log('✅ Checkout opened')
    // Track analytics, show confirmation message, etc.
  }}
  onCheckoutError={(err) => {
    console.error('❌ Checkout error:', err.message)
    // Show error toast/modal to user
  }}
  disabled={isLoading}
  className="w-full md:w-auto"
>
  Buy 2 Licenses
</BuyButton>
```

---

## 🔧 Configuration

### Environment Variables

Set these in your `.env.local` (development) and `.env.production` (live):

```bash
# Sandbox (Development)
# .env.local
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ctok_sandbox_xxxxx

# Production (Live)
# .env.production
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_xxxxx
```

Environment detection is automatic:
- `ctok_*` = Sandbox
- `live_*` = Production

No further configuration needed! ✅

### Content Security Policy (CSP)

The CSP headers are already configured in `next.config.js`:

```javascript
headers: async () => {
  return [{
    source: '/:path*',
    headers: [{
      key: 'Content-Security-Policy',
      value: [
        "frame-src 'self' https://buy.paddle.com https://*.paddle.com",
        "script-src 'self' https://cdn.paddle.com https://*.paddle.com",
        "connect-src 'self' https://*.paddle.com",
        // ... other directives
      ].join('; '),
    }],
  }]
}
```

This allows:
- ✅ Paddle's iframe (`buy.paddle.com`, `checkout.paddle.com`)
- ✅ Paddle's scripts & API
- ✅ Localhost in development

---

## 📋 Props Reference

### BuyButtonProps

```typescript
interface BuyButtonProps {
  // One of these is required:
  priceId?: string;           // Paddle price ID (e.g., 'pri_...')
  productId?: string;         // Paddle product ID (alternative to priceId)
  
  // Optional:
  quantity?: number;          // Default: 1
  children?: React.ReactNode; // Button label (default: 'Buy Now')
  onCheckoutOpen?: () => void;                    // Called when checkout opens
  onCheckoutError?: (error: Error) => void;      // Called on error
  className?: string;         // Custom CSS classes
  disabled?: boolean;         // Disable button
}
```

### Examples

```tsx
// Minimal
<BuyButton priceId="pri_..." />

// Full featured
<BuyButton
  priceId="pri_01aryz6z94z1smf44ehs2d9rbp"
  productId="prod_01aryz6z94z1smf44ehs2d9rbp" // If using product ID too
  quantity={1}
  children="Buy Now"
  onCheckoutOpen={() => console.log('Opened')}
  onCheckoutError={(err) => console.error('Error:', err)}
  className="custom-button-class"
  disabled={false}
/>

// With Toast Notifications
<BuyButton
  priceId="pri_..."
  onCheckoutOpen={() => {
    toast.info('Checkout opened. Please complete your purchase.')
  }}
  onCheckoutError={(err) => {
    toast.error(`Checkout failed: ${err.message}`)
  }}
>
  Buy Now
</BuyButton>
```

---

## 🐛 Error Handling

The component provides detailed error messages:

```tsx
<BuyButton
  priceId="pri_01aryz6z94z1smf44ehs2d9rbp"
  onCheckoutError={(err) => {
    const errorMsg = err.message;
    
    if (errorMsg.includes('refresh')) {
      // Suggest page refresh
      console.log('Try refreshing the page');
    } else if (errorMsg.includes('Paddle')) {
      // Paddle SDK issue
      console.log('Paddle SDK issue:', errorMsg);
    } else if (errorMsg.includes('Price')) {
      // Invalid price ID
      console.log('Check your price ID configuration');
    }
  }}
/>
```

Common errors & solutions:

| Error | Solution |
|-------|----------|
| "Paddle SDK not available" | Ensure script loaded - refresh page |
| "Either priceId or productId must be provided" | Provide at least one ID |
| "Paddle.Checkout.open is not available" | initialization failed - check token |
| "Failed to load Paddle script from CDN" | Check internet & CDC access |

---

## 🎯 Use Cases

### 1. Simple Pricing Page

```tsx
export default function Pricing() {
  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">Simple Pricing</h2>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Premium Plan</h3>
          <p className="text-3xl font-bold text-blue-600 mb-6">$99/month</p>
          <ul className="mb-6 space-y-2">
            <li>✓ Feature 1</li>
            <li>✓ Feature 2</li>
            <li>✓ Feature 3</li>
          </ul>
          
          <BuyButton 
            priceId="pri_premium_2024"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Get Started
          </BuyButton>
        </div>
      </div>
    </section>
  )
}
```

### 2. Product Grid

```tsx
export default function Products() {
  const products = [
    { id: 1, name: 'Starter', price: 'pri_starter' },
    { id: 2, name: 'Professional', price: 'pri_pro' },
    { id: 3, name: 'Enterprise', price: 'pri_enterprise' },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id}>
          <h3>{product.name}</h3>
          <BuyButton priceId={product.price}>{product.name}</BuyButton>
        </Card>
      ))}
    </div>
  )
}
```

### 3. Add-to-Cart Pattern

```tsx
export default function ProductDetail({ product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div>
      <h1>{product.name}</h1>
      
      <div className="flex items-center gap-4">
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-16 px-2 py-1 border rounded"
        />
        
        <BuyButton
          priceId={product.priceId}
          quantity={quantity}
          onCheckoutOpen={() => console.log(`Buying ${quantity} x ${product.name}`)}
        >
          Add to Cart
        </BuyButton>
      </div>
    </div>
  )
}
```

---

## 🔐 Security Notes

- ✅ Client token (ctok_ / live_) is **public** - safe to expose
- ✅ Server API keys are **NOT** sent to client (check .env.production)
- ✅ Seller ID is **server-side only** (check PADDLE_VENDOR_ID usage)
- ✅ CSP headers in next.config.js restrict Paddle iframe loading
- ✅ Never expose `PADDLE_API_KEY` to browser

---

## 📊 Logging & Debugging

The component logs detailed information to browser console:

```
✅ [BuyButton] Paddle script loaded successfully
✅ [BuyButton] Paddle.Checkout.open is ready
🎯 [BuyButton] Opening checkout with priceId: pri_01aryz...
📋 [BuyButton] Environment: production
✅ [BuyButton] Checkout opened successfully
```

Enable all logs in development:
```bash
NODE_ENV=development npm run dev
```

Disable in production:
```bash
NODE_ENV=production npm run build
```

---

## 🌍 Switching Environments

### Sandbox (Testing)
```bash
# .env.local
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ctok_sandbox_xxxxx
npm run dev
```

### Production (Live)
```bash
# .env.production
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_xxxxx
npm run build
npm start
```

Token prefix determines environment automatically - no code changes needed! ✅

---

## ⚠️ Common Issues

### Issue: "Paddle script not yet loaded"
**Solution:** Component waits up to 3.75 seconds. If still failing:
- Check CDN access: https://cdn.paddle.com/paddle/v2/paddle.js
- Check browser console for CSP violations
- Verify NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is set

### Issue: Button always shows "Loading..."
**Solution:**
- Clear browser cache & hard refresh
- Check token format (ctok_ or live_)
- Check Network tab for script load errors

### Issue: Checkout won't open
**Solution:**
- Verify priceId exists in Paddle dashboard
- Verify token is correct (sandbox token for sandbox price)
- Check browser console for detailed error message

---

## 📚 Resources

- **Paddle Docs:** https://biz.paddle.com/docs/
- **API Reference:** https://biz.paddle.com/docs/api-reference/
- **Checkout Guide:** https://biz.paddle.com/docs/checkout/
- **Webhooks:** https://biz.paddle.com/docs/webhooks/

---

## ✨ Advanced Usage

### With Redux/Zustand (State Management)

```tsx
import { useDispatch } from 'react-redux'

export default function BuyForm() {
  const dispatch = useDispatch()

  return (
    <BuyButton
      priceId="pri_..."
      onCheckoutOpen={() => {
        dispatch(setCheckoutOpen(true))
      }}
      onCheckoutError={(err) => {
        dispatch(setCheckoutError(err.message))
      }}
    />
  )
}
```

### With Next.js Middleware (Authentication)

```tsx
// components/ProtectedBuyButton.tsx
import { useSession } from 'next-auth/react'
import BuyButton from '@/components/BuyButton'

export default function ProtectedBuyButton() {
  const { data: session } = useSession()

  if (!session) {
    return <p>Please sign in to purchase</p>
  }

  return (
    <BuyButton
      priceId="pri_..."
      onCheckoutOpen={() => {
        // Send user ID to webhook handler
        fetch('/api/checkout-started', {
          method: 'POST',
          body: JSON.stringify({ userId: session.user.id })
        })
      }}
    />
  )
}
```

---

## Summary

✅ Drop-in component ready to use  
✅ Automatic environment detection  
✅ Comprehensive error handling  
✅ CSP compliant for secure deployments  
✅ Supports sandbox & production simultaneously  

**Get started:** Import BuyButton and provide a priceId! 🚀
