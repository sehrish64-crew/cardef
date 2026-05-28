import { NextRequest, NextResponse } from 'next/server'
export async function GET() {
  return new Response("Webhook is alive", { status: 200 })
}
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let body: any

    if (contentType.includes('application/json')) {
      body = await request.json()
    } else {
      const raw = await request.text()
      try {
        body = JSON.parse(raw)
      } catch {
        body = raw
      }
    }

    console.log('📬 Freemius webhook received:', body)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    )
  }
}