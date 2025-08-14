import fetch from 'node-fetch';

export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body || '{}');

    const res = await fetch('https://script.google.com/macros/s/AKfycbxoBP0THGtnbbSGpEIp-0S4Y7UF1strZxNbo-T7loZXZ2LBVsgRge8Xw8AKOusHSEpr/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: err.message })
    };
  }
}
