// Netlify Node 18+ has global fetch
exports.handler = async (event, context) => {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxdapuDETHHq2nIaOlgN7nVblJg8B69m-w7qpMgLFENOCUZWkHHfiNU--rT-TUwriUBzA/exec?date=2025-09-03";

  try {
    const res = await fetch(GAS_URL, { method: "GET" });
    const text = await res.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*"
      },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "text/plain" },
      body: "Failed to fetch Pooja content."
    };
  }
};
