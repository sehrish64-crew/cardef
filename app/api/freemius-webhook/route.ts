import { NextRequest, NextResponse } from 'next/server'

function normalizeString(value: unknown): string {
  return String(value || '').trim()
}

function parseJsonSafe(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function getPayload(body: any) {
  if (!body || typeof body !== 'object') return body
  return body.payload || body.data || body
}

function isSuccessEvent(eventName: string): boolean {
  const normalized = eventName.toLowerCase()
  return [
    'payment.completed',
    'payment.succeeded',
    'sale.completed',
    'invoice.payment_succeeded',
    'checkout.success',
    'order.completed',
    'payment_success',
    'paid',
    'succeeded',
  ].some((keyword) => normalized.includes(keyword))
}

export async function GET() {
  return new Response('Webhook is alive', { status: 200 })
}
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let body: any

    if (contentType.includes('application/json')) {
      body = await request.json()
    } else {
      const raw = await request.text()
      body = parseJsonSafe(raw)
    }

    console.log('📬 Freemius webhook received:', body)

    const payload = getPayload(body)
    const eventData = payload && typeof payload === 'object' ? payload : {}
    const eventName = normalizeString(
      body.event || body.event_name || body.type || body.action || eventData.status || eventData.state
    )

    if (!isSuccessEvent(eventName)) {
      console.log('📬 Freemius webhook ignored event type:', eventName)
      return NextResponse.json({ ok: true, message: 'Ignored event type' })
    }

    const customerEmail = normalizeString(
      eventData.customer_email ||
      eventData.customerEmail ||
      eventData.buyer_email ||
      eventData.buyerEmail ||
      eventData.email ||
      eventData.payer_email ||
      eventData.payerEmail,
    )

    const customerName = normalizeString(
      eventData.customer_name ||
      eventData.customerName ||
      eventData.buyer_name ||
      eventData.buyerName ||
      eventData.name ||
      customerEmail.split('@')[0],
    )

    const orderNumber = normalizeString(
      eventData.order_number ||
      eventData.orderNumber ||
      eventData.order_id ||
      eventData.orderId ||
      eventData.invoice_number ||
      eventData.invoiceId ||
      eventData.id,
    )

    const amount = Number(
      eventData.amount ||
      eventData.total ||
      eventData.amount_paid ||
      eventData.gross_total ||
      eventData.price ||
      eventData.payment_amount ||
      eventData.base_price ||
      0,
    )

    const currency = normalizeString(
      eventData.currency ||
      eventData.currency_code ||
      eventData.currencyCode ||
      eventData.currencyType ||
      'USD',
    ).toUpperCase()

    const packageType = normalizeString(
      eventData.plan_name ||
      eventData.planName ||
      eventData.product_name ||
      eventData.productName ||
      eventData.package_type ||
      eventData.packageType ||
      eventData.description ||
      'Report Purchase',
    )

    const transactionId = normalizeString(
      eventData.transaction_id ||
      eventData.transactionId ||
      eventData.txn_id ||
      eventData.txnId ||
      eventData.invoice_id ||
      eventData.invoiceId,
    )

    if (!customerEmail) {
      console.error('Freemius webhook missing customer email:', body)
      return NextResponse.json(
        { error: 'Missing customer email in webhook payload' },
        { status: 400 },
      )
    }

    const notificationUrl = new URL('/api/payments/notification', request.url).toString()
    const response = await fetch(notificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: orderNumber || `Freemius-${transactionId || Date.now()}`,
        customerName: customerName || customerEmail.split('@')[0],
        customerEmail,
        amount: amount || 0,
        currency: currency || 'USD',
        packageType: packageType || 'Freemius Purchase',
        transactionId: transactionId || undefined,
        paymentMethod: normalizeString(eventData.payment_method || eventData.paymentMethod || eventData.gateway || eventData.gateway_name || eventData.payment_gateway),
        vehicleInfo: normalizeString(eventData.vin || eventData.vehicle || eventData.vehicle_info || eventData.vehicleInfo || ''),
        dashboardUrl: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/orders/${orderNumber}` : undefined,
        supportEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || undefined,
      }),
    })

    const responseBody = await response.json().catch(() => null)

    if (!response.ok || responseBody?.success === false) {
      console.error('Freemius webhook payment notification failed:', response.status, responseBody)
      return NextResponse.json(
        { error: 'Payment notification dispatch failed', details: responseBody },
        { status: 500 },
      )
    }

    console.log('📬 Freemius webhook forwarded payment notification successfully')
    return NextResponse.json({ ok: true, message: 'Payment notification sent' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    )
  }
}