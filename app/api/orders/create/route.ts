import { NextRequest, NextResponse } from 'next/server'
import { insertOrder } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    if (!bodyText) {
      console.error('❌ Empty request body received')
      return NextResponse.json(
        { error: 'Request body is required and must be valid JSON' },
        { status: 400 }
      )
    }

    let body: any
    try {
      body = JSON.parse(bodyText)
    } catch (parseError) {
      console.error('❌ Invalid JSON body:', parseError)
      return NextResponse.json(
        { error: 'Request body must be valid JSON' },
        { status: 400 }
      )
    }

    const clientIp =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || request.headers.get('referrer') || 'unknown'

    console.log('➡️ Incoming /api/orders/create request URL:', request.url)
    console.log('➡️ Client IP:', clientIp)
    console.log('➡️ User-Agent:', userAgent)
    console.log('➡️ Referer:', referer)
    console.log('➡️ Full request body:', JSON.stringify(body))
    const {
      customer_email,
      vehicle_type,
      identification_type,
      identification_value,
      vin_number,
      package_type,
      country_code,
      currency,
      amount,
      paymentProvider,
    } = body

    console.log('\n📝 Creating order with data:', { 
      customer_email, 
      vehicle_type, 
      package_type,
      amount,
      currency,
      paymentProvider
    })

    if (!customer_email || !vehicle_type || !identification_type || !identification_value || !package_type || !amount) {
      console.error('❌ Missing required fields:', { 
        customer_email: !!customer_email,
        vehicle_type: !!vehicle_type,
        identification_type: !!identification_type,
        identification_value: !!identification_value,
        package_type: !!package_type,
        amount: !!amount,
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('✓ All required fields present, inserting order with package_type:', package_type)
    const order = await insertOrder({
      customer_email,
      vehicle_type,
      identification_type,
      identification_value,
      vin_number: vin_number || null,
      package_type,
      country_code: country_code || 'US',
      currency: currency || 'USD',
      amount,
      payment_provider: paymentProvider || undefined,
    })

    console.log('✅ Order created successfully:', { 
      orderId: order?.id, 
      orderNumber: order?.order_number,
      packageType: order?.package_type,
      amount: order?.amount,
      fullOrder: JSON.stringify(order)
    })

    if (!order?.id) {
      console.error('❌ Order created but no ID returned:', order)
      return NextResponse.json(
        { error: 'Order created but no ID returned: ' + JSON.stringify(order) },
        { status: 500 }
      )
    }

    try {
      const sendEmailUrl = new URL('/api/send-email', request.url).toString()

      const emailResponse = await fetch(sendEmailUrl, {
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
          paymentStatus: 'pending',
        }),
      })

      const emailJson = await emailResponse.json().catch(() => null)
      if (!emailResponse.ok || emailJson?.success === false) {
        console.error('Order creation email failed:', emailResponse.status, emailJson)
      }
    } catch (emailError) {
      console.error('Failed to send order creation notification email:', emailError)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ Error creating order:', errorMsg)
    console.error('Full error:', error)
    return NextResponse.json(
      { error: 'Failed to create order: ' + errorMsg },
      { status: 500 }
    )
  }
}
