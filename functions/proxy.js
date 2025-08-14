// functions/proxy.js
import fetch from "node-fetch";

export async function handler(event) {
  const targetUrl = event.queryStringParameters.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      body: "Missing 'url' parameter",
    };
  }

  try {
    const response = await fetch(targetUrl);
    const body = await response.text();

    // Clone all headers except X-Frame-Options and CSP
    const headers = {};
    response.headers.forEach((value, key) => {
      if (!["x-frame-options", "content-security-policy"].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "content-type": response.headers.get("content-type") || "text/html",
        "cache-control": "no-cache",
      },
      body: body,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error fetching URL: ${err.message}`,
    };
  }
}
