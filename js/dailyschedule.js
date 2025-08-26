// Example daily cards data (overview)
const dailyScheduleCardsData = [
  {
    date: "2025-08-27",
    day: "Wednesday (బుధవారం)",
    morning: "వినాయక చవితి గణనాధుని ప్రాణప్రతిష్ఠాపన అనంతరం వినాయక చవితి పూజ, పత్రి పూజ, అభిషేకం, కథాశ్రవణం, ప్రసాద వితరణ",
    morningTime: "10:00 AM - 1:00 PM",
    evening: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    eveningTime: "7:00 PM - 8:00 PM",
    specialPooja: []
  },
  {
    date: "2025-08-28",
    day: "Thursday (గురువారం)",
    morning: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    morningTime: "10:30 AM - 11:30 AM",
    evening: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    eveningTime: "6:30 PM - 7:30 PM",
    specialPooja: []
  },
  {
    date: "2025-08-29",
    day: "Friday (శుక్రవారం)",
    morning: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    morningTime: "10:00 AM - 11:00 AM",
    evening: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    eveningTime: "6:30 PM - 7:30 PM",
    specialPooja: [
      { name: "కుంకుమపూజ", time: "7:30 PM - 8:30 PM", session: "evening" }
    ]
  },
  {
    date: "2025-08-30",
    day: "Saturday (శనివారం)",
    morning: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    morningTime: "10:30 AM - 11:30 AM",
    evening: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    eveningTime: "6:30 PM - 7:30 PM",
    specialPooja: []
  },
  {
    date: "2025-08-31",
    day: "Sunday (ఆదివారం)",
    morning: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    morningTime: "10:30 AM - 11:30 AM",
    evening: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    eveningTime: "6:30 PM - 7:30 PM",
    specialPooja: []
  },
  {
    date: "2025-09-01",
    day: "Monday (సోమవారం)",
    morning: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    morningTime: "10:30 AM - 11:30 AM",
    evening: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    eveningTime: "6:30 PM - 7:30 PM",
    specialPooja: []
  },
  {
    date: "2025-09-02",
    day: "Tuesday (మంగళవారం)",
    morning: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    morningTime: "10:30 AM - 11:30 AM",
    evening: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    eveningTime: "6:30 PM - 7:30 PM",
    specialPooja: [
      { name: "కుంకుమపూజ", time: "11:30 AM - 12:30 AM", session: "morning" },
      { name: "సరస్వతి పూజ", time: "7:30 PM - 8:30 PM", session: "evening" }
    ]
  },
  {
    date: "2025-09-03",
    day: "Wednesday (బుధవారం)",
    morning: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    morningTime: "10:30 AM - 11:30 AM",
    evening: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    eveningTime: "6:30 PM - 7:30 PM",
    specialPooja: [
      { name: "భజన", time: "7:30 PM - 9:30 PM", session: "evening" }
    ]
  },
  {
    date: "2025-09-04",
    day: "Thursday (గురువారం)",
    morning: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    morningTime: "10:30 AM - 11:30 AM",
    evening: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    eveningTime: "6:30 PM - 7:30 PM",
    specialPooja: []
  },
  {
    date: "2025-09-05",
    day: "Friday (శుక్రవారం)",
    morning: "వినాయక పూజ, అభిషేకం, ప్రసాద వితరణ",
    morningTime: "10:30 AM - 11:30 AM",
    evening: "వినాయక పూజ, 108 ప్రసాద మహా నైవేద్యం, ప్రసాద వితరణ",
    eveningTime: "6:30 PM - 7:30 PM",
    specialPooja: [
      { name: "హోమం", time: "07:00 AM - 10:00 AM", session: "morning" },
      { name: "కుంకుమపూజ", time: "11:30 AM - 12:30 PM", session: "morning" }
    ]
  },
  {
    date: "2025-09-06",
    day: "Saturday (శనివారం)",
    morning: "వినాయక పూజ, అభిషేకం, అన్నప్రసాద వితరణ అనంతరం లడ్డు వేలం పాట, వస్త్రాల వేలం పాట, ఉట్టి కొట్టటం, కోలాటం, నిమర్జనం",
    morningTime: "10:00 AM - 12:30 PM",
    evening: "",
    eveningTime: "",
    specialPooja: []
  }
];


async function initDailySchedule() {
  const container = document.getElementById("dailyScheduleCards");
  container.innerHTML = ""; // clear

    dailyScheduleCardsData.forEach(day => {
    const card = document.createElement("div");
    card.className = "day-card";
        card.setAttribute("data-date", day.date);
        card.innerHTML = `
          <div class="date">${day.date}</div>
          <div class="day">${day.day}</div>
              ${day.morning ? `
                  <div class="session">
                    <div class="session-title">🌞 Morning</div>
                    ${day.morning}${day.morningTime ? `<span class="time">${day.morningTime}</span>` : ""}
                    ${day.specialPooja ? day.specialPooja
                      .filter(p => p.session === "morning")
                      .map(p => `<div class="special-pooja">✨ ${p.name} (${p.time})</div>`).join("") : ""}
                  </div>` : ""}

                ${day.evening ? `
                  <div class="session">
                    <div class="session-title">🌙 Evening</div>
                    ${day.evening}${day.eveningTime ? `<span class="time">${day.eveningTime}</span>` : ""}
                    ${day.specialPooja ? day.specialPooja
                      .filter(p => p.session === "evening")
                      .map(p => `<div class="special-pooja">✨ ${p.name} (${p.time})</div>`).join("") : ""}
                  </div>` : ""}
              `;


   card.addEventListener("click", async () => {
        // Show blocking overlay
      document.getElementById("loadingOverlay").style.display = "flex"
      
      try {
        // Disable cards while fetching
        container.style.pointerEvents = "none";
        container.style.opacity = "0.5";
        
        // Completely hide all schedule cards
        document.getElementById("dailyScheduleCards").style.display = "none";
        
        // Fetch full day schedule from API
        const selectedDate = day.date;
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
      }  finally {
        // Hide blocking overlay
        document.getElementById("loadingOverlay").style.display = "none";
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
    let sectionHtml = `<div class="section"><h3 class="section-header">${title}</h3>
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
