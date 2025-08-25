// Example daily cards data (overview)
const dailyScheduleCardsData = [
  {
    date: "2025-08-27",
    day: "Wednesday (బుధవారం)",
    morning: "వినాయక చవితి పత్రీ పూజ, కథాశ్రవణం",
    morningTime: "9:00 AM - 12:00 PM",
    evening: "వినాయక పూజ, అబిషేకం",
    eveningTime: "7:00 PM - 8:00 PM"
  },
  {
    date: "2025-08-29",
    day: "Friday (శుక్రవారం)",
    morning: "వినాయక పూజ, అబిషేకం, కుంకుమార్చన",
    morningTime: "10:00 AM - 12:00 PM",
    evening: "వినాయక పూజ, అబిషేకం",
    eveningTime: "6:30 PM - 7:30 PM"
  },
  {
    date: "2025-09-02",
    day: "Tuesday (మంగళవారం)",
    morning: "వినాయక పూజ, అబిషేకం",
    morningTime: "10:30 AM - 11:30 AM",
    evening: "వినాయక పూజ, అబిషేకం, సహస్రనామ పూజ",
    eveningTime: "6:30 PM - 8:30 PM"
  }
];


async function initDailySchedule() {
  const container = document.getElementById("dailyScheduleCards");
  document.getElementById("dailyScheduleCards").disabled = false;

  container.innerHTML = ""; // clear

    dailyScheduleCardsData.forEach(day => {
    const card = document.createElement("div");
    card.className = "day-card";
        card.setAttribute("data-date", day.date);
        card.innerHTML = `
          <div class="date">${day.date}</div>
          <div class="day">${day.day}</div>
          ${day.morning ? `<div class="session"><div class="session-title">🌞 Morning</div>${day.morning}${day.morningTime ? `<span class="time">${day.morningTime}</span>` : ""}</div>` : ""}
          ${day.evening ? `<div class="session"><div class="session-title">🌙 Evening</div>${day.evening}${day.eveningTime ? `<span class="time">${day.eveningTime}</span>` : ""}</div>` : ""}
        `;

   card.addEventListener("click", async () => {
      try {
        // Disable cards while fetching
        container.style.pointerEvents = "none";
        container.style.opacity = "0.5";
        document.getElementById("dailyScheduleCards").disabled = true;
        // Fetch full day schedule from API
        const selectedDate = cardData.date;
        const res = await fetch(`${CONFIG.API_BASE_URL}?action=getScheduleData&date=${encodeURIComponent(selectedDate)}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        // Render the schedule using your existing renderSchedule function
        renderSchedule(data);

      } catch (err) {
        console.error("Failed to fetch schedule data:", err);
        alert("Failed to fetch schedule data. Please try again.");
        container.style.pointerEvents = "auto";
        container.style.opacity = "1";
      }
    });

    container.appendChild(card);
  });
}

function renderSchedule(data) {
  const container = document.getElementById('scheduleContent');
  if (!data) return container.innerHTML = "<p class='no-data'>No schedule available.</p>";
  
  let html="";


  function renderSection(title, poojaTime, poojaMembers, prasadam, games) {
    let sectionHtml = `<div class="section"><h3 class="section-header">${title} Pooja : ${poojaTime || "NA"}</h3>
      <div class="section-body">
      ${renderTable("Members", poojaMembers, ["Name","Phone","Block","Flat"])}
      ${renderTable("Prasadam", prasadam, ["Name","Sponsor"])}
      ${renderTable("Cultural Activities", games, ["Name","Time"])}
      </div>
    </div>`;
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
