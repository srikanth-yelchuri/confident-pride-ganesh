// CONFIG — pick A or B
const USE_NETLIFY_FUNCTIONS = true; // true => use proxy (Option B), false => fetch GAS directly (Option A)

// A) If fetching straight from GAS (CORS must be allowed there)
const GAS_DIRECT = {
  pooja: "https://script.google.com/macros/s/AKfycbx36gXaQ65PbWHiGf51lBg8CHeZNcySvV-kU__S0f2oDMlZA4RryM2OFMgiI2BV9OWb/exec",
  daily: "https://script.google.com/macros/s/AKfycbxdapuDETHHq2nIaOlgN7nVblJg8B69m-w7qpMgLFENOCUZWkHHfiNU--rT-TUwriUBzA/exec?date=2025-09-03"
};

// B) If using Netlify Functions proxy
const NETLIFY_FN = {
  pooja: "/.netlify/functions/pooja-slot",
  daily: "/.netlify/functions/daily-activities"
};

const routes = {
  pooja: USE_NETLIFY_FUNCTIONS ? NETLIFY_FN.pooja : GAS_DIRECT.pooja,
  daily: USE_NETLIFY_FUNCTIONS ? NETLIFY_FN.daily : GAS_DIRECT.daily
};

const content = document.getElementById("content");
const toast = document.getElementById("toast");

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"), 1800);
}

function setActive(button){
  document.querySelectorAll(".menu__item").forEach(b => b.classList.remove("is-active"));
  button.classList.add("is-active");
}

function skeleton(){
  content.innerHTML = `
    <div class="skeleton" style="height:28px;width:220px;"></div>
    <div class="skeleton" style="width:100%;height:12px;"></div>
    <div class="skeleton" style="width:96%;height:12px;"></div>
    <div class="skeleton" style="width:92%;height:12px;"></div>
    <div class="skeleton" style="width:88%;height:12px;"></div>
  `;
}

async function loadPage(key){
  skeleton();
  try{
    const res = await fetch(routes[key], { method: "GET", headers: { "Accept": "text/html" } });
    if(!res.ok) throw new Error(res.statusText);
    const html = await res.text();
    content.innerHTML = html;
    showToast("Loaded");
  }catch(err){
    content.innerHTML = `<h2 class="card__title">Oops</h2><p>Could not load ${key.replace('-',' ')} right now.</p>`;
    showToast("Error loading content");
  }
}

// Menu listeners
document.querySelectorAll(".menu__item").forEach(btn=>{
  btn.addEventListener("click", (e)=>{
    const key = e.currentTarget.dataset.page;
    setActive(e.currentTarget);

    if(key === "pooja") return loadPage("pooja");
    if(key === "daily") return loadPage("daily");

    // Static placeholders for Games & Activities (edit freely)
    if(key === "games"){
      content.innerHTML = `
        <h2 class="card__title">Games</h2>
        <ul>
          <li>Day 3 – Musical Chairs</li>
          <li>Day 5 – Antakshari</li>
          <li>Day 7 – Rangoli Contest</li>
          <li>Day 9 – Treasure Hunt</li>
        </ul>
      `;
      return;
    }
    if(key === "activities"){
      content.innerHTML = `
        <h2 class="card__title">Activities</h2>
        <p>Join us for seva, prasadam distribution, bhajans, cultural evenings, and community programs throughout the 11 days.</p>
      `;
      return;
    }
  });
});

// Load Pooja by default on first paint (optional)
// loadPage("pooja");
