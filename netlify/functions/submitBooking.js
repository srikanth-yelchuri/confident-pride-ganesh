// .netlify/functions/submitBooking.js
import fetch from "node-fetch";

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_URL = "https://script.google.com/macros/s/AKfycbxoBP0THGtnbbSGpEIp-0S4Y7UF1strZxNbo-T7loZXZ2LBVsgRge8Xw8AKOusHSEpr/exec";

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
