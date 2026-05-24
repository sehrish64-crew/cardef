"use client";
import React, { useEffect, useState } from 'react';
import { getPaddlePriceId } from '@/lib/prices';

const PRODUCTS = [
  { name: 'Basic', key: 'basic' },
  { name: 'Standard', key: 'standard' },
  { name: 'Premium', key: 'premium' },
];

export default function PaddleCheckout() {
  const [paddleReady, setPaddleReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Paddle v2 should already be loaded by the root layout
    // Just wait for it to be initialized
    const checkPaddleReady = () => {
      if (typeof window === 'undefined') return;
      
      const Paddle = (window as any).Paddle;
      if (!Paddle) {
        console.log('⏳ [PaddleCheckout] Paddle script not yet loaded');
        setTimeout(checkPaddleReady, 250);
        return;
      }

      if (Paddle.Checkout && typeof Paddle.Checkout.open === 'function') {
        console.log('✅ [PaddleCheckout] Paddle.Checkout is ready');
        setPaddleReady(true);
      } else {
        console.log('⏳ [PaddleCheckout] Waiting for Paddle.Checkout initialization');
        setTimeout(checkPaddleReady, 250);
      }
    };

    // Give PaddleInit time to run
    setTimeout(checkPaddleReady, 500);
  }, []);

  const openCheckout = async (priceKey: 'basic' | 'standard' | 'premium') => {
    const Paddle = (window as any).Paddle;
    const priceId = getPaddlePriceId(priceKey);
    
    if (!priceId) {
      setError(`Price ID not configured for ${priceKey}`);
      return;
    }

    if (!Paddle || !paddleReady) {
      setError('Paddle SDK not ready. Please refresh the page.');
      return;
    }

    if (!Paddle.Checkout || typeof Paddle.Checkout.open !== 'function') {
      setError('Paddle.Checkout.open not available. Check that Paddle SDK is properly loaded.');
      return;
    }

    try {
      console.log('🎯 [PaddleCheckout] Opening checkout for priceId:', priceId);
      // Paddle v2 API - simple and clean
      Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        settings: {
          displayMode: 'overlay',
          frameInitialHeight: 600,
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ [PaddleCheckout] Failed to open checkout:', errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Choose Your Plan</h2>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <div className="flex gap-3">
        {PRODUCTS.map((p) => (
          <button
            key={p.key}
            onClick={() => openCheckout(p.key as any)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!paddleReady}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
