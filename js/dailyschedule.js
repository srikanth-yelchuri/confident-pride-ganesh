async function initDailySchedule() {
  const container = document.getElementById('scheduleContent');
  container.innerHTML = "<p>Loading schedule...</p>";
  
  const API_URL = "https://script.google.com/macros/s/AKfycbxw_Cs6hXoWw2I7tSy_8yo2VhT-qTqxfY9jjMtEq4uvhcZu1-ZNi7Pa8kh0MduTvsy-/exec";
  const selectedDate = "2025-09-03"; // Or get from URL params

  try {
    const res = await fetch(`${API_URL}?action=getScheduleData&date=${selectedDate}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    renderSchedule(data);
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='no-data'>Failed to load schedule.</p>";
  }
}

function renderSchedule(data) {
  const container = document.getElementById('scheduleContent');
  if (!data) return container.innerHTML = "<p class='no-data'>No schedule available.</p>";

  let html = `<h2>Schedule for ${data.date || "NA"}</h2>`;

  function renderSection(title, poojaTime, poojaMembers, prasadam, games) {
    let sectionHtml = `<div class="section"><h3>${title}</h3>`;
    sectionHtml += `<p>Pooja Time: ${poojaTime || "NA"}</p>`;
    sectionHtml += renderTable("Pooja Members", poojaMembers, ["Name","Phone","Block","Flat"]);
    sectionHtml += renderTable("Prasadam", prasadam, ["Name","Sponsor"]);
    sectionHtml += renderTable("Games/Events", games, ["Name","Time"]);
    sectionHtml += `</div>`;
    return sectionHtml;
  }

  function renderTable(title, rows, headers) {
    if(!rows || rows.length === 0) return `<p>${title}: NA</p>`;
    let table = `<p>${title}:</p><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
    rows.forEach(r => {
      table += `<tr>${headers.map(h => `<td>${r[h.toLowerCase()] || "NA"}</td>`).join("")}</tr>`;
    });
    table += "</table>";
    return table;
  }

  html += renderSection("Morning", data.morningPoojaTime, data.morningPooja, data.morningPrasadam, data.morningGames);
  html += renderSection("Evening", data.eveningPoojaTime, data.eveningPooja, data.eveningPrasadam, data.eveningGames);

  container.innerHTML = html;
}
