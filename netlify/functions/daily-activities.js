export async function handler(event, context) {
  const url = "https://script.google.com/macros/s/AKfycbxdapuDETHHq2nIaOlgN7nVblJg8B69m-w7qpMgLFENOCUZWkHHfiNU--rT-TUwriUBzA/exec?date=2025-09-03";

  try {
    const response = await fetch(url);
    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*"
      },
      body: text
    };
  } catch (error) {
    return { statusCode: 500, body: "Error fetching Daily Activities content" };
  }
}
