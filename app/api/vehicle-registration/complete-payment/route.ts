import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const { registrationId, paymentId } = await req.json()

    if (!registrationId || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update registration with payment info
    await query(
      `UPDATE vehicle_registrations 
       SET payment_id = ?, payment_status = ?, updated_at = NOW()
       WHERE id = ?`,
      [paymentId, 'completed', registrationId]
    )

    // Get the registration details
    const result = await query(
      `SELECT owner_email, owner_name, registration_number, vehicle_title 
       FROM vehicle_registrations 
       WHERE id = ?`,
      [registrationId]
    )
    const registrations = result.rows

    if ((registrations as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    const registration = (registrations as any[])[0]

    const sendEmailUrl = new URL('/api/send-email', req.url).toString();

    // Send confirmation email to owner
    try {
      await fetch(sendEmailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment_success',
          orderId: registrationId,
          orderNumber: registration.registration_number,
          transactionId: paymentId,
          customerEmail: registration.owner_email,
          customerName: registration.owner_name,
          vinNumber: registration.vehicle_title,
          packageType: 'Vehicle Registration',
          amount: 0,
          currency: registration.currency || 'USD',
        }),
      })
    } catch (err) {
      console.error('Failed to send payment confirmation email:', err)
      // Don't fail the response, just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
    })
  } catch (error) {
    console.error('Error completing payment:', error)
    return NextResponse.json(
      { error: 'Failed to complete payment' },
      { status: 500 }
    )
  }
}
