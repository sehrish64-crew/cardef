import React from 'react'
import PaddleInit from '@/components/PaddleInit'

export const metadata = {
  title: 'Checkout | Vehicle History Report',
  description: 'Complete your purchase of a vehicle history report with Paddle secure checkout.',
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="container mx-auto px-4">
        <PaddleInit />
      </div>
    </div>
  )
}
