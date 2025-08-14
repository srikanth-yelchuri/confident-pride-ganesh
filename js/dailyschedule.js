// Get date from URL parameter if exists
const urlParams = new URLSearchParams(window.location.search);
//const selectedDate = urlParams.get("date") || null;
const selectedDate = 2025-09-03;
// Replace with your deployed Google Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbyGO0OQMjTush-jko0xE7ka4CAYHcayNqoYVe-K_l2z-kbQQ4t6cFqpZhnhNcZBpWEk/exec";

async function loadSchedule() {
  try {
    const res = await fetch(`${API_URL}?date=2025-09-03`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    renderSchedule(data);
  } catch (err) {
    console.error("Failed to load schedule:", err);
    document.getElementById("scheduleContent").innerHTML = "<p class='no-data'>Failed to load schedule.</p>";
  }
}

function renderSchedule(data) {
  if (!data) {
    document.getElementById("scheduleContent").innerHTML = "<p class='no-data'>No schedule available.</p>";
    return;
  }

  let html = `<h2>Schedule for ${data.date || "NA"}</h2>`;

  function renderSection(title, poojaTime, poojaMembers, prasadam, games, sectionClass) {
    let sectionHtml = `<div class="section ${sectionClass}"><h2>${title}</h2>`;
    sectionHtml += `<p class="subheader">Pooja Time: ${poojaTime || "NA"}</p>`;
    sectionHtml += renderTable("Pooja Members", poojaMembers, ["Name","Phone","Block","Flat"]);
    sectionHtml += renderTable("Prasadam", prasadam, ["Name","Sponsor"]);
    sectionHtml += renderTable("Games/Events", games, ["Name","Time"]);
    sectionHtml += `</div>`;
    return sectionHtml;
  }

  function renderTable(title, rows, headers) {
    if(!rows || rows.length === 0) return `<p class="subheader">${title}: NA</p>`;
    let table = `<p class="subheader">${title}:</p><table><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr>`;
    rows.forEach(r => {
      table += `<tr>${headers.map(h=>`<td>${r[h.toLowerCase()] || "NA"}</td>`).join("")}</tr>`;
    });
    table += "</table>";
    return table;
  }

  html += renderSection("Morning", data.morningPoojaTime, data.morningPooja, data.morningPrasadam, data.morningGames, "morning");
  html += renderSection("Evening", data.eveningPoojaTime, data.eveningPooja, data.eveningPrasadam, data.eveningGames, "evening");

  document.getElementById("scheduleContent").innerHTML = html;

  const sections = document.querySelectorAll(".section");
  sections.forEach((sec, idx) => setTimeout(() => sec.classList.add("visible"), idx * 500));

  const music = document.getElementById("bgMusic");
  music.volume = 0.3; 
  music.play().catch(e => console.log("Autoplay blocked:", e));
}

document.addEventListener("DOMContentLoaded", loadSchedule);
