import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrderPaymentStatus } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentId } = body

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const numericOrderId = Number(orderId)

    const order = await getOrderById(numericOrderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Optional: verify payment provider data if credentials are configured.
    try {
      const paymentProviderId = process.env.PAYMENT_PROVIDER_ID
      const paymentApiKey = process.env.PAYMENT_API_KEY

      // If a payment provider is used, we can optionally verify transaction details here.
      if (paymentProviderId && paymentApiKey && paymentId) {
        // Example: call the payment provider API to verify transaction details.
      }
    } catch (err) {
      console.warn('Payment verification step failed, proceeding without verification:', err)
    }

    // Update order in database
    await updateOrderPaymentStatus(numericOrderId, 'completed', paymentId)

    // Send a payment success email to admin and the customer
    try {
      const paymentResp = await fetch(new URL('/api/send-email', request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'payment_success',
          orderId: order.id,
          orderNumber: order.order_number,
          transactionId: paymentId,
          customerEmail: order.customer_email,
          customerName: (order as any).customer_name || null,
          vinNumber: (order as any).vin_number || (order as any).identification_value || null,
          packageType: order.package_type,
          amount: parseFloat(String(order.amount)),
          currency: order.currency,
        }),
      })

      try {
        const paymentJson = await paymentResp.json()
        if (!paymentResp.ok || paymentJson?.success === false) {
          console.error('Payment success email failed:', paymentResp.status, paymentJson)
        }
      } catch (e) {
        const text = await paymentResp.text().catch(() => null)
        console.error('Failed to parse send-email response for payment_success:', paymentResp.status, text)
      }
    } catch (emailError) {
      console.error('Failed to send payment success emails:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Order completed successfully',
    })
  } catch (error) {
    console.error('Error completing order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
