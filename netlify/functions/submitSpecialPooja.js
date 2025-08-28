// .netlify/functions/save108PrasadamSelection.js
export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_URL="https://script.google.com/macros/s/AKfycbzSCwwJ3_2KqhiYz3ae_lr6Yaj_vwIVweSQbrQvFfGsqpNQRILYPKwNLwcUKslMZkiy/exec?action=submitSpecialPooja";
  try {
    const body = JSON.parse(event.body);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" }, // important for CORS
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, message: err.message })
    };
  }
}
