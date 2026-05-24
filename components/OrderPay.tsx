"use client"

import React from 'react'
import BuyButton from './BuyButton'

export default function OrderPay({ priceId, currency, amount }: { priceId?: string; currency?: string; amount?: number | string }) {
  const displayAmount = amount ? Number(amount).toFixed(2) : ''

  return (
    <div className="mt-6 text-center">
      <div className="mb-3 text-sm text-gray-700">Pay with Paddle</div>
      {priceId ? (
        <div className="inline-block">
          <BuyButton priceId={priceId} quantity={1}>
            <div className="flex items-center gap-2 px-6 py-3">
              <span className="text-sm">Pay</span>
              <span className="font-semibold">{currency} {displayAmount}</span>
            </div>
          </BuyButton>
        </div>
      ) : (
        <div className="text-sm text-red-600">Payment not available for this package.</div>
      )}
    </div>
  )
}
