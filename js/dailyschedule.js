const container = document.getElementById('scheduleContent');
  const dropdown = document.getElementById("dateDropdown");
  const API_URL = "https://script.google.com/macros/s/AKfycbzNbGl3mg935n_B1blkweQ4LD7WmdwNAi2f4_5upoFNGy6neflxbjvEjRbg32kwe5_A/exec";

  // Load dates into dropdown
  try {
    const res = await fetch(`${API_URL}?action=getDates`);
    const dates = await res.json();

    dropdown.innerHTML = '<option value="">-- Select Date --</option>';
    dates.forEach(date => {
      const option = document.createElement("option");
      option.value = date;
      option.textContent = date;
      dropdown.appendChild(option);
    });

    container.innerHTML = `<p class="no-data">Please select a date to view schedule</p>`;
  } catch (err) {
    console.error("Error fetching dates:", err);
    container.innerHTML = `<p class="no-data">Failed to load dates.</p>`;
  }

  // On change event for dropdown
  dropdown.addEventListener("change", async function () {
    const selectedDate = this.value;
    if (!selectedDate) {
      container.innerHTML = `<p class="no-data">Please select a date to view schedule</p>`;
      return;
    }

    container.innerHTML = `<p>Loading schedule...</p>`;


  try {
    const res = await fetch(`${API_URL}?action=getScheduleData&date=${encodeURIComponent(selectedDate)}`);
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
