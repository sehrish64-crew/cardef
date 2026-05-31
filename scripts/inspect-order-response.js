'use strict';

const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function main(){
  const payload = {
    customer_email: 'test-user@example.com',
    vehicle_type: 'car',
    identification_type: 'vin',
    identification_value: '1HGCM82633A004352',
    package_type: 'basic',
    country_code: 'US',
    currency: 'USD',
    amount: 9.99,
  };

  try{
    const res = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('Status:', res.status, 'OK:', res.ok);
    const ct = res.headers.get('content-type') || '';
    console.log('Content-Type:', ct);
    const text = await res.text();
    console.log('Body (first 1000 chars):\n', text.slice(0,1000));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

main();
