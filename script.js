document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const page = e.target.dataset.page;

    let url = "";
    if (page === "pooja-slot") {
      url = "/.netlify/functions/pooja-slot";
    } else if (page === "daily-activities") {
      url = "/.netlify/functions/daily-activities";
    } else {
      document.getElementById("content").innerHTML = `<h2>${page}</h2><p>Coming soon...</p>`;
      return;
    }

    document.getElementById("content").innerHTML = "<p>Loading...</p>";
    try {
      const response = await fetch(url);
      const html = await response.text();
      document.getElementById("content").innerHTML = html;
    } catch {
      document.getElementById("content").innerHTML = "<p>Error loading content</p>";
    }
  });
});
