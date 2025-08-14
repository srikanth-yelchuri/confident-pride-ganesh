// Netlify Node 18+ has global fetch
exports.handler = async (event, context) => {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbx36gXaQ65PbWHiGf51lBg8CHeZNcySvV-kU__S0f2oDMlZA4RryM2OFMgiI2BV9OWb/exec";

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
