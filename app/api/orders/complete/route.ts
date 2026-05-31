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
      const customerName = (order as any).customer_name || order.customer_email.split('@')[0];
      const vehicleInfo = order.vin_number || order.identification_value || '';
      const paymentResp = await fetch(new URL('/api/payments/notification', request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: order.order_number,
          customerName,
          customerEmail: order.customer_email,
          amount: parseFloat(String(order.amount)),
          currency: order.currency,
          packageType: order.package_type,
          transactionId: paymentId,
          paymentMethod: order.payment_provider || undefined,
          vehicleInfo,
          dashboardUrl: process.env.NEXT_PUBLIC_BASE_URL
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/orders/${order.order_number}`
            : undefined,
          supportEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || undefined,
        }),
      })

      try {
        const paymentJson = await paymentResp.json()
        if (!paymentResp.ok || paymentJson?.success === false) {
          console.error('Payment notification email failed:', paymentResp.status, paymentJson)
        }
      } catch (e) {
        const text = await paymentResp.text().catch(() => null)
        console.error('Failed to parse payment notification response:', paymentResp.status, text)
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
