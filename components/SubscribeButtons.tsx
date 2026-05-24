"use client"

import React, { useEffect, useState } from 'react'
import { getPaddlePriceId } from '@/lib/prices'

const packages = [
  { key: 'basic', name: 'Basic Plan' },
  { key: 'standard', name: 'Standard Plan' },
  { key: 'premium', name: 'Premium Plan' },
]

export default function SubscribeButtons() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const checkPaddle = () => {
      const w = window as any
      if (w.Paddle && w.Paddle.Checkout) {
        setInitialized(true)
      } else {
        setTimeout(checkPaddle, 500)
      }
    }
    checkPaddle()
  }, [])

  const handleCheckout = async (pkgKey: string) => {
    const w = window as any
    if (!w.Paddle?.Checkout?.open) {
      alert('Paddle SDK not yet ready. Please wait a moment.')
      return
    }

    const priceId = getPaddlePriceId(pkgKey as any)
    if (!priceId) {
      alert('Product ID not configured for this plan.')
      return
    }

    w.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: {
        displayMode: 'overlay',
      },
    })
  }

  return (
    <div className="flex gap-3">
      {packages.map((pkg) => (
        <button
          key={pkg.key}
          onClick={() => handleCheckout(pkg.key)}
          className={`px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition ${!initialized ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!initialized}
        >
          Subscribe to {pkg.name}
        </button>
      ))}
    </div>
  )
}
