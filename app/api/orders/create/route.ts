import { NextRequest, NextResponse } from 'next/server'
import { insertOrder } from '@/lib/database'

async function forwardOrderToGetform(data: {
  customer_email: string
  vehicle_type: string
  identification_type: string
  identification_value: string
  package_type: string
  country_code?: string
  currency?: string
  amount: number
}) {
  const getformEndpoint = process.env.GETFORM_ENDPOINT?.trim()
  if (!getformEndpoint) {
    console.warn('[ORDER CREATE] GETFORM_ENDPOINT is not configured; skipping Getform forwarding.')
    return null
  }

  try {
    const payload = new URLSearchParams()
    payload.append('name', 'Get Report Request')
    payload.append('email', data.customer_email)
    payload.append('subject', `Report request: ${data.package_type}`)
    payload.append('message', `Vehicle type: ${data.vehicle_type}\nIdentification type: ${data.identification_type}\nIdentification value: ${data.identification_value}\nPackage: ${data.package_type}\nCountry: ${data.country_code || 'US'}\nCurrency: ${data.currency || 'USD'}\nAmount: ${data.amount}`)
    payload.append('formType', 'get-report')
    payload.append('package_type', data.package_type)
    payload.append('vehicle_type', data.vehicle_type)
    payload.append('identification_type', data.identification_type)
    payload.append('identification_value', data.identification_value)
    payload.append('country_code', data.country_code || 'US')
    payload.append('currency', data.currency || 'USD')
    payload.append('amount', String(data.amount))

    const response = await fetch(getformEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    })

    const responseBody = await response.text()
    if (!response.ok) {
      throw new Error(`Getform response ${response.status}: ${responseBody}`)
    }

    return { success: true, body: responseBody }
  } catch (error: any) {
    console.error('[ORDER CREATE] Getform forwarding failed:', error)
    return { success: false, error: error?.message || 'Unknown Getform error' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
      const getformResult = await forwardOrderToGetform({
        customer_email,
        vehicle_type,
        identification_type,
        identification_value,
        package_type,
        country_code,
        currency,
        amount: Number(amount),
      })
      if (getformResult && getformResult.success) {
        console.log('[ORDER CREATE] Forwarded report request to Getform successfully')
      }
    } catch (forwardError) {
      console.warn('[ORDER CREATE] Getform forwarding exception:', forwardError)
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
