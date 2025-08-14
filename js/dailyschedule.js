const API_URL = "https://script.google.com/macros/s/AKfycbwwmuwT09O3DGHoMr0VsGGGmY2eEWH7Ojt375R6YzLw_JMykunCP5FdPkZ3Q7QfkQXTjg/exec";

async function initDailySchedule(selectedDate = "2025-09-03") {
  const container = document.getElementById('scheduleContent');
  container.innerHTML = "<p class='no-data'>Loading schedule...</p>";

  try {
    const res = await fetch(`${API_URL}?action=getScheduleData&date=${selectedDate}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    renderSchedule(data);
  } catch (err) {
    console.error("Failed to load schedule:", err);
    container.innerHTML = "<p class='no-data'>Failed to load schedule.</p>";
  }
}

function renderSchedule(data) {
  const container = document.getElementById('scheduleContent');
  if (!data) {
    container.innerHTML = "<p class='no-data'>No schedule available.</p>";
    return;
  }

  let html = `<h2>Schedule for ${data.date || "NA"}</h2>`;

  function renderSection(title, poojaTime, poojaMembers, prasadam, games, sectionClass) {
    let sectionHtml = `<div class="section ${sectionClass}"><h3>${title}</h3>`;
    sectionHtml += `<p class="subheader">Pooja Time: ${poojaTime || "NA"}</p>`;
    sectionHtml += renderTable("Pooja Members", poojaMembers, ["Name","Phone","Block","Flat"]);
    sectionHtml += renderTable("Prasadam", prasadam, ["Name","Sponsor"]);
    sectionHtml += renderTable("Games/Events", games, ["Name","Time"]);
    sectionHtml += `</div>`;
    return sectionHtml;
  }

  function renderTable(title, rows, headers) {
    if (!rows || rows.length === 0) return `<p class="subheader">${title}: NA</p>`;
    let table = `<p class="subheader">${title}:</p><table><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr>`;
    rows.forEach(r => {
      table += `<tr>${headers.map(h=>`<td>${r[h.toLowerCase()] || 'NA'}</td>`).join('')}</tr>`;
    });
    table += "</table>";
    return table;
  }

  html += renderSection("Morning", data.morningPoojaTime, data.morningPooja, data.morningPrasadam, data.morningGames, "morning");
  html += renderSection("Evening", data.eveningPoojaTime, data.eveningPooja, data.eveningPrasadam, data.eveningGames, "evening");

  container.innerHTML = html;

  // Sequential fade-in animation
  const sections = container.querySelectorAll(".section");
  sections.forEach((sec, idx) => setTimeout(() => sec.classList.add("visible"), idx * 500));

  // Background music
  const music = document.getElementById("bgMusic");
  if (music) {
    music.volume = 0.3;
    music.play().catch(e => console.log("Autoplay blocked:", e));
  }
}
