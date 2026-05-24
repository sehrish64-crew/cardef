import { NextRequest, NextResponse } from 'next/server'

// NOTE: Paddle v2 does NOT support server-side checkout creation via REST API.
// Checkouts MUST be created client-side using Paddle.Checkout.open()
// This endpoint returns an error indicating client-side usage is required.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, priceId } = body

    if (!priceId) {
      return NextResponse.json({ success: false, error: 'Missing priceId' }, { status: 400 })
    }

    // Paddle v2 DOES NOT support server-side checkout creation
    console.log('⚠️  Server-side checkout creation attempted for priceId:', priceId)
    console.log('⚠️  Paddle v2 requires CLIENT-SIDE Paddle.Checkout.open() - not a server API')
    
    return NextResponse.json({ 
      success: false, 
      error: 'Server-side checkout creation is not supported by Paddle v2. Use client-side Paddle.Checkout.open() instead.',
      status: 'client_only',
      note: 'Load Paddle SDK, call Paddle.Setup({token}), then Paddle.Checkout.open({items: [{priceId}]})',
    }, { status: 501 })
  } catch (err) {
    console.error('❌ Error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
