'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCountry } from '@/contexts/CountryContext'
import { PRICING_MAP, CURRENCY_SYMBOLS, formatCurrency, getPaddlePriceId } from '@/lib/prices'

interface PaddleProduct {
  key: 'basic' | 'standard' | 'premium'
  name: string
  color: string
  price: string
  description: string
}

interface PaddleWindow extends Window {
  Paddle?: any
}

const PADDLE_SCRIPT_URL = 'https://cdn.paddle.com/paddle/v2/paddle.js'
const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox'
const isProd = paddleEnv === 'production' || paddleEnv === 'live'

const PADDLE_CLIENT_TOKEN = isProd 
  ? (process.env.NEXT_PUBLIC_LIVE_PADDLE_BILLING_TOKEN || process.env.NEXT_PUBLIC_PADDLE_BILLING_TOKEN)
  : (process.env.NEXT_PUBLIC_PADDLE_BILLING_TOKEN || process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)

const PACKAGE_INFO: Record<'basic' | 'standard' | 'premium', { color: string; description: string }> = {
  basic: { color: 'bg-blue-500 hover:bg-blue-600', description: 'Essential vehicle history' },
  standard: { color: 'bg-cyan-500 hover:bg-cyan-600', description: 'Comprehensive report' },
  premium: { color: 'bg-primary hover:bg-primary/90', description: 'Complete vehicle history' },
}

const PACKAGE_NAMES: Record<'basic' | 'standard' | 'premium', string> = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
}

export default function PaddleInit() {
  const searchParams = useSearchParams()
  const { selectedCountry } = useCountry()
  const [initialized, setInitialized] = useState(false)
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null)

  // Load Paddle SDK
  useEffect(() => {
    if (!PADDLE_CLIENT_TOKEN) {
      setMessage({ type: 'error', text: 'Paddle client token missing or invalid (pt_...)' })
      return
    }

    const w = window as PaddleWindow

    if (w.Paddle) {
      if (!isProd) w.Paddle.Environment.set('sandbox');
      w.Paddle.Initialize?.({ 
        token: PADDLE_CLIENT_TOKEN
      })
      setInitialized(true)
      return
    }

    const script = document.createElement('script')
    script.src = PADDLE_SCRIPT_URL
    script.async = true
    script.onload = () => {
      if (!isProd) w.Paddle.Environment.set('sandbox');
      w.Paddle?.Initialize?.({ 
        token: PADDLE_CLIENT_TOKEN
      })
      setInitialized(true)
      console.log('[Paddle] SDK initialized')
    }
    script.onerror = () => setMessage({ type: 'error', text: 'Failed to load Paddle SDK' })
    document.head.appendChild(script)
  }, [])

  // Prepare products array
  const products: PaddleProduct[] = (['basic', 'standard', 'premium'] as const).map((key) => {
    const pricing = PRICING_MAP[selectedCountry.currency] || PRICING_MAP['USD']
    const currencySymbol = CURRENCY_SYMBOLS[selectedCountry.currency] || '$'
    return {
      key,
      name: PACKAGE_NAMES[key],
      color: PACKAGE_INFO[key].color,
      description: PACKAGE_INFO[key].description,
      price: formatCurrency(pricing[key], selectedCountry.currency),
    }
  })

  // Open Paddle checkout
  const openCheckout = useCallback(
    async (productKey: 'basic' | 'standard' | 'premium') => {
      if (!initialized) {
        setMessage({ type: 'error', text: 'Paddle SDK not initialized yet' })
        return
      }

      setLoadingPackage(productKey)
      setMessage({ type: 'info', text: `Opening checkout for ${productKey}...` })

      try {
        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ package: productKey }),
        })

        if (!res.ok) throw new Error('Failed to create checkout session')
        const data = await res.json()

        const w = window as PaddleWindow
        w.Paddle?.Checkout?.open({ override: data.checkoutUrl })

        setMessage({ type: 'info', text: 'Checkout opened!' })
      } catch (err) {
        console.error(err)
        setMessage({ type: 'error', text: `Checkout failed: ${(err as Error).message}` })
      } finally {
        setLoadingPackage(null)
      }
    },
    [initialized]
  )

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>

      {message && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            message.type === 'error'
              ? 'bg-red-100 text-red-800'
              : message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <button
            key={p.key}
            onClick={() => openCheckout(p.key)}
            disabled={!initialized || loadingPackage !== null}
            className={`py-3 px-4 rounded-lg font-semibold text-white transition transform duration-200 ${
              p.color
            } ${!initialized || loadingPackage !== null ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}`}
          >
            {loadingPackage === p.key ? '⏳ Processing...' : `Pay ${p.price}`}
          </button>
        ))}
      </div>
    </div>
  )
}