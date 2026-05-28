const fetch = globalThis.fetch || require('node-fetch');

async function main() {
  const BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const payload = {
    orderId: process.argv[2] || 647660,
    paymentId: process.argv[3] || 'TEST-PAY-1234',
  }

  console.log('Calling order complete with', payload)
  const res = await fetch(`${BASE}/api/orders/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  console.log('Status:', res.status)
  console.log('Body:', text)
}

main().catch(err => { console.error(err); process.exit(1) })
