import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/mysql'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const conn = await pool.getConnection()
    try {
      await conn.execute(
        'INSERT INTO contact_submissions (name, email, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [name, email, subject, message, 'new']
      )
    } catch (dbError: any) {
      console.error('Contact form DB insert failed:', {
        code: dbError?.code,
        message: dbError?.message,
        stack: dbError?.stack,
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Database insert failed',
          details: dbError?.message || 'Unknown database error',
        },
        { status: 500 },
      )
    } finally {
      conn.release()
    }

    // Forward contact form data to the centralized forms/submit endpoint so it uses the same email templates and delivery flow.
    try {
      const submitUrl = new URL('/api/forms/submit', request.url).toString()

      const resp = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, formType: 'contact' }),
      })

      try {
        const json = await resp.json()
        if (!resp.ok || json?.success === false) {
          console.error('Contact form email failed via forms/submit:', resp.status, json)
          throw new Error(json?.message || json?.error || 'Failed to send contact email')
        }
      } catch (e) {
        const text = await resp.text().catch(() => null)
        console.error('Failed to parse forms/submit response for contact_form:', resp.status, text)
        throw e
      }
    } catch (err: any) {
      console.error('Failed to send contact notification:', err)
      return NextResponse.json(
        {
          success: false,
          error: 'Contact form submitted, but email delivery failed.',
          details: String(err),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
    })
  } catch (error: any) {
    console.error('Error processing contact form:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    })
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
