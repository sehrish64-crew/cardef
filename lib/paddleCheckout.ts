/* Client-side helper for initializing Paddle and opening checkout.
   Uses the CDN-loaded window.Paddle for Paddle v2.
   
   Credentials used:
   - NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: live_0315ac06b1b66c0e808184756dc (required for authentication)
   
   Note: This module must only be imported/used on the client.
   Paddle.Initialize() is the correct v2 method (replaces deprecated Paddle.Setup()).
*/
let paddleInstance: any = null;

function getWindowPaddle(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).Paddle || null;
}

export function initializePaddle(opts?: { token?: string; pwCustomer?: { id: string } }) {
  if (typeof window === 'undefined') return null;

  const token = opts?.token ?? process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  if (!token) {
    console.error('[Paddle] ❌ Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN - cannot initialize Paddle');
    return null;
  }

  console.log('[Paddle] Initializing with client token...');

  const wp = getWindowPaddle();
  if (wp) {
    try {
      // Initialize Paddle with client-side token (required for Paddle.js v2)
      // This is the correct method - replaces deprecated Paddle.Setup()
      const initConfig: any = { token };
      
      // Add customer for Retain if provided
      if (opts?.pwCustomer?.id) {
        initConfig.pwCustomer = { id: opts.pwCustomer.id };
        console.log('[Paddle] Configuring with customer for Retain');
      }
      
      wp.Initialize(initConfig);
      console.log(`[Paddle] ✅ Initialized with token: ${token.substring(0, 10)}...${token.substring(token.length - 5)}`);
      
      // Verify Checkout is available
      if (wp.Checkout && typeof wp.Checkout.open === 'function') {
        console.log('[Paddle] ✅ Checkout.open is available');
      }
      
      // Log Retain status (live accounts only)
      if (token.startsWith('live_')) {
        console.log('[Paddle] ✅ Retain loaded for live account');
      }
      
      paddleInstance = wp;
      return paddleInstance;
    } catch (err) {
      console.error('[Paddle] ❌ Error during initialization:', err);
    }
  } else {
    console.warn('[Paddle] ⚠️  Window.Paddle not available yet');
  }
  
  return null;
}

export function openCheckout(opts: { price?: string; items?: any[]; [k: string]: any }) {
  const inst = paddleInstance || getWindowPaddle();
  if (!inst) {
    console.error('[Paddle] ❌ Paddle not initialized');
    throw new Error('Paddle is not initialized');
  }
  if (!inst.Checkout || typeof inst.Checkout.open !== 'function') {
    console.error('[Paddle] ❌ Checkout.open not available');
    throw new Error('Paddle.Checkout.open not available');
  }

  // Build checkout payload with price token
  const payload: any = opts.items ? { items: opts.items } : opts.price ? { items: [{ price: opts.price }] } : opts;
  console.log('[Paddle] Opening checkout with:', payload);
  return inst.Checkout.open(payload);
}

export function getPaddleInstance() {
  return paddleInstance || getWindowPaddle();
}

export default initializePaddle;
