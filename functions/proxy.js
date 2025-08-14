// This is a Netlify serverless function
export async function handler(event, context) {
  const targetUrl = event.queryStringParameters.url;
  if (!targetUrl) {
    return {
      statusCode: 400,
      body: 'Missing "url" query parameter'
    };
  }

  try {
    const res = await fetch(targetUrl);
    let body = await res.text();

    // Return HTML content without X-Frame-Options
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        // No X-Frame-Options header here
      },
      body: body
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Error fetching target URL: ' + err.message
    };
  }
}
