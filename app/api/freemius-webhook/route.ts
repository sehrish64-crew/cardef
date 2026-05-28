import { NextRequest, NextResponse } from 'next/server'

const SECRET_TOKEN = process.env.FREEMIUS_WEBHOOK_TOKEN

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!SECRET_TOKEN || !token || token !== SECRET_TOKEN) {
    console.warn('Unauthorized Freemius webhook request', { token })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contentType = request.headers.get('content-type') || ''
    let body: unknown

    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const raw = await request.text()
      body = Object.fromEntries(new URLSearchParams(raw))
    } else {
      const raw = await request.text()
      try {
        body = JSON.parse(raw)
      } catch {
        body = raw
      }
    }

    console.log('📬 Freemius webhook received', {
      token: token?.slice(0, 4) + '***',
      body,
      contentType,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error processing Freemius webhook', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}
