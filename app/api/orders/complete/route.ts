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

    // Send admin notification and customer confirmation
    try {
      const notificationResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order_notification',
          orderId: order.id,
          orderNumber: order.order_number,
          customerEmail: order.customer_email,
          vehicleType: order.vehicle_type,
          identificationType: order.identification_type,
          identificationValue: order.identification_value,
          packageType: order.package_type,
          amount: parseFloat(String(order.amount)),
          currency: order.currency,
          paymentStatus: 'completed',
        }),
      })

      try {
        const notifJson = await notificationResp.json()
        if (!notificationResp.ok || notifJson?.success === false) {
          console.error('Order completion notification failed:', notificationResp.status, notifJson)
        }
      } catch (e) {
        const text = await notificationResp.text().catch(() => null)
        console.error('Failed to parse send-email response for order_notification:', notificationResp.status, text)
      }

      const confirmationResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order_confirmation',
          orderId: order.id,
          orderNumber: order.order_number,
          customerEmail: order.customer_email,
          vehicleType: order.vehicle_type,
          identificationType: order.identification_type,
          identificationValue: order.identification_value,
          packageType: order.package_type,
          amount: parseFloat(String(order.amount)),
          currency: order.currency,
          paymentStatus: 'completed',
        }),
      })

      try {
        const confJson = await confirmationResp.json()
        if (!confirmationResp.ok || confJson?.success === false) {
          console.error('Order completion confirmation email failed:', confirmationResp.status, confJson)
        }
      } catch (e) {
        const text = await confirmationResp.text().catch(() => null)
        console.error('Failed to parse send-email response for order_confirmation:', confirmationResp.status, text)
      }
    } catch (emailError) {
      console.error('Failed to send email notifications:', emailError)
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
