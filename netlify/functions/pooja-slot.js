export async function handler(event, context) {
  const url = "https://script.google.com/macros/s/AKfycbzeGQ6am3Pklzh2QcYHrazwLD2UjkqMbt1DC8VnCWEvBp2ogH2vqVzpMbJhfkYsiVMF/exec";

  try {
    const response = await fetch(url);
    const text = await response.text(); // For HTML content

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*"
      },
      body: text
    };
  } catch (error) {
    return { statusCode: 500, body: "Error fetching Pooja Slot content" };
  }
}
