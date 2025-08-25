async function initBooking() {
  const middle = document.getElementById('middleContent');


let blockFlatMap = {};
let availability = {};
let uniqueDates = [];
let fullyBookedDates = [];
let userInteracted = false;

// Load Block-Flat Mapping
async function loadBlockFlatMapping() {
  setLoading(true);
  try {
    const cacheKey = "blockFlatMapCache";
    const cacheExpiryKey = "blockFlatMapExpiry";
    const now = Date.now();

    // ✅ Check if we have cached data and it’s not expired
    const cachedData = localStorage.getItem(cacheKey);
    const expiry = localStorage.getItem(cacheExpiryKey);

    if (cachedData && expiry && now < parseInt(expiry, 10)) {
      console.log("Using cached Block/Flat mapping");
      blockFlatMap = JSON.parse(cachedData);
      populateBlockDropdown();
      setLoading(false);
      return;
    }

    // ❌ No valid cache → Fetch from API
    console.log("Fetching Block/Flat mapping from API");
    const res = await fetch(`${CONFIG.API_BASE_URL}?action=getBlockFlatMapping`);
    blockFlatMap = await res.json();

    // Save to localStorage with 24-hour expiry
    localStorage.setItem(cacheKey, JSON.stringify(blockFlatMap));
    localStorage.setItem(cacheExpiryKey, now + 24 * 60 * 60 * 1000); // 24h

    populateBlockDropdown();
  } catch(err){
    console.error(err);
    showPopup('Failed to load block mapping.', false);
  }
  setLoading(false);
}

 // Helper: Populate block dropdown from blockFlatMap
function populateBlockDropdown() {
  const blockSel = document.getElementById('block');
  blockSel.innerHTML = '<option value="">-- Select Block --</option>';
  Object.keys(blockFlatMap).sort().forEach(block => {
    const opt = document.createElement('option');
    opt.value = block;
    opt.textContent = block;
    blockSel.appendChild(opt);
  });
  document.getElementById('flat').innerHTML = '<option value="">-- Select Flat --</option>';
  document.getElementById('flat').disabled = true;
}

// Block change event
document.getElementById('block').addEventListener('change', function() {
  userInteracted = true;
  const block = this.value;
  const flatSel = document.getElementById('flat');
  flatSel.innerHTML = '<option value="">-- Select Flat --</option>';
  if(block && blockFlatMap[block]) {
    blockFlatMap[block].forEach(flat => {
      const opt = document.createElement('option');
      opt.value = flat;
      opt.textContent = flat;
      flatSel.appendChild(opt);
    });
    flatSel.disabled = false;
  } else {
    flatSel.disabled = true;
  }
  validateFormAndUpdateStatus();
});

document.getElementById('flat').addEventListener('change', () => {
  userInteracted = true;
  validateFormAndUpdateStatus();
});

// Load Availability
async function loadSlots() {
  setLoading(true);
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}?action=getAvailability`);
    availability = await res.json();

    uniqueDates = [...new Set(Object.keys(availability).map(s => s.split(',')[0].trim()))].sort();

    fullyBookedDates = uniqueDates.filter(date => {
      const morning = availability[`${date}, Morning`];
      const evening = availability[`${date}, Evening`];
      return (!morning || morning.status==="Full") && (!evening || evening.status==="Full");
    });

    //initializeDatePicker();
    const dateInput = document.getElementById('eventDate');
    dateInput.value = '';
    dateInput.disabled = uniqueDates.length === 0;

    // If you are using flatpickr or similar, update its options without destroying it
    if (dateInput._flatpickr) {
      dateInput._flatpickr.set('enable', uniqueDates);
      dateInput._flatpickr.redraw(); // just refresh, no full re-render
    } else {
      initializeDatePicker(); // only if not initialized yet
    }

    document.querySelectorAll('input[name="slotTime"]').forEach(r => { r.checked=false; r.disabled=true; });
  } catch(err){
    console.error(err);
    showPopup('Failed to load slots.', false);
  }
  setLoading(false);
}

function initializeDatePicker() {
  flatpickr("#eventDate", {
    disableMobile: true,
    dateFormat: "Y-m-d",
    disable: fullyBookedDates,
    minDate: uniqueDates[0] || null,
    maxDate: uniqueDates[uniqueDates.length-1] || null,
    onChange: function(_, dateStr) {
      userInteracted = true;
      const morning = availability[`${dateStr}, Morning`];
      const evening = availability[`${dateStr}, Evening`];
      const morningRadio = document.querySelector('input[name="slotTime"][value="Morning"]');
      const eveningRadio = document.querySelector('input[name="slotTime"][value="Evening"]');
      morningRadio.checked = false;
      eveningRadio.checked = false;
      morningRadio.disabled = !morning || morning.status==="Full";
      eveningRadio.disabled = !evening || evening.status==="Full";
      if(morningRadio.disabled && eveningRadio.disabled){
        showPopup('Selected date has no available slots. Please choose another date.', false);
        document.getElementById('eventDate').value = '';
      }
      validateFormAndUpdateStatus();
    }
  });
}

// Input listeners
document.querySelectorAll('#name, #phone').forEach(el => el.addEventListener('input', ()=>{userInteracted=true;validateFormAndUpdateStatus();}));
// ✅ Add name restriction logic here
document.getElementById("name").addEventListener("keypress", function (e) {
  const char = String.fromCharCode(e.which);
  if (!/^[A-Za-z ]$/.test(char)) {
    e.preventDefault();
  }
});
document.getElementById("name").addEventListener("input", function () {
  this.value = this.value.replace(/\s{2,}/g, ' ').replace(/^\s+/, '');
});

// Phone field validation: allow only digits
document.getElementById("phone").addEventListener("keypress", function (e) {
  const char = String.fromCharCode(e.which);
  if (!/^[0-9]$/.test(char)) {
    e.preventDefault(); // block anything that is not a digit
  }
});

// Cleanup: remove non-digits if pasted
document.getElementById("phone").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, ''); // only keep digits
  if (this.value.length > 10) {
    this.value = this.value.slice(0, 10); // max 10 digits
  }
});

document.querySelectorAll('input[name="slotTime"]').forEach(el => el.addEventListener('change', ()=>{userInteracted=true;validateFormAndUpdateStatus();}));

// Form validation
function validateFormAndUpdateStatus() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const block = document.getElementById('block').value.trim();
  const flat = document.getElementById('flat').value.trim();
  const dateVal = document.getElementById('eventDate').value;
  const timeVal = Array.from(document.querySelectorAll('input[name="slotTime"]:checked')).map(r=>r.value)[0];
  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('bookingStatus');

  if(!userInteracted){ statusEl.textContent=''; statusEl.className=''; submitBtn.disabled=true; return; }
  if(!name){ statusEl.textContent='Name is required.'; statusEl.className='msg error'; submitBtn.disabled=true; return; }
  if(!phone){ statusEl.textContent='Mobile number is required.'; statusEl.className='msg error'; submitBtn.disabled=true; return; }
  if(!/^\d{10}$/.test(phone)){ statusEl.textContent='Phone must be exactly 10 digits.'; statusEl.className='msg error'; submitBtn.disabled=true; return; }
  if(!block){ statusEl.textContent='Please select a Block.'; statusEl.className='msg error'; submitBtn.disabled=true; return; }
  if(!flat){ statusEl.textContent='Please select a Flat.'; statusEl.className='msg error'; submitBtn.disabled=true; return; }
  if(!dateVal){ statusEl.textContent='Please select a valid event date.'; statusEl.className='msg error'; submitBtn.disabled=true; return; }
  if(!timeVal){ statusEl.textContent='Please select Morning or Evening slot.'; statusEl.className='msg warn'; submitBtn.disabled=true; return; }

  const slotKey = `${dateVal}, ${timeVal}`;
  const slotData = availability[slotKey];
  if(!slotData){ statusEl.textContent='No slot data available.'; statusEl.className='msg error'; submitBtn.disabled=true; return; }

  if(slotData.status==="Full"){ statusEl.textContent=`Fully booked (${slotData.booked}/${slotData.max})`; statusEl.className='msg error'; submitBtn.disabled=true; }
  else if(slotData.status==="Almost Full"){ statusEl.textContent=`Almost full (${slotData.booked}/${slotData.max})`; statusEl.className='msg warn'; submitBtn.disabled=false; }
  else{ statusEl.textContent=`Available (${slotData.booked}/${slotData.max})`; statusEl.className='msg success'; submitBtn.disabled=false; }
}

// Popup
function showPopup(msg, success=true){
  const overlay=document.getElementById('popupOverlay');
  const popup=document.getElementById('popup');
  document.getElementById('popupMessage').textContent=msg;
  popup.className = success?'success':'error';
  popup.dataset.resultType = success ? 'success' : 'error'; // store type in dataset
  overlay.style.display='flex';
  popup.focus();
}

document.getElementById('popupCloseBtn').addEventListener('click', ()=>{
  const popup = document.getElementById('popup');
  // ✅ Get resultType that was stored when showing the popup
  const resultType = popup.dataset.resultType;
  
  document.getElementById('popupOverlay').style.display='none';
  document.getElementById('bookingStatus').textContent=''; 
  document.getElementById('bookingStatus').className='';
  document.getElementById('submitBtn').disabled=true;
  userInteracted=false;
  if (resultType === 'success') {
    window.location.href = 'index.html'; // Navigate to home page only if success
  } 
});

// Loading spinner
function setLoading(isLoading){ document.getElementById('loadingSpinner').style.display = isLoading?'block':'none'; }

// Submit booking
document.getElementById('submitBtn').addEventListener('click', async ()=>{
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const block = document.getElementById('block').value.trim();
  const flat = document.getElementById('flat').value.trim();
  const dateVal = document.getElementById('eventDate').value.trim();
  const timeVal = Array.from(document.querySelectorAll('input[name="slotTime"]:checked')).map(e=>e.value)[0];

  if(!name || !phone || !block || !flat || !dateVal || !timeVal){ showPopup('Please fill all fields.', false); return; }
  if(!/^\d{10}$/.test(phone)){ showPopup('Phone must be exactly 10 digits.', false); return; }

  setLoading(true);
  const slot = `${dateVal}, ${timeVal}`;
  try {
    const res = await fetch("/.netlify/functions/submitBooking", {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      mode: 'no-cors',  // disables preflight
      body: JSON.stringify({name, phone, block, flat, slot})
    });
    // check if response is ok
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const text = await res.text(); // get raw response
    let result = {};
    try {
      result = JSON.parse(text); // parse safely
    } catch(e) {
      throw new Error(`Invalid JSON response: ${text}`);
    }

    setLoading(false);
    if(result.success){
      showPopup(result.message, true);
      document.getElementById('bookingForm').reset();
      document.getElementById('flat').innerHTML='<option value="">-- Select Flat --</option>';
      document.getElementById('flat').disabled=true;
      loadSlots();
      validateFormAndUpdateStatus();
    } else { showPopup(result.message, false); }
  } catch(err){
    console.error(err);
    setLoading(false);
    showPopup('Failed to submit booking.', false);
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("bookingForm");
    const fields = Array.from(bookingForm.querySelectorAll("input, select, textarea"));

    fields.forEach((field, index) => {
      field.addEventListener("input", () => {
        // If field has maxlength and is fully filled, move to next
        if (field.maxLength > 0 && field.value.length === field.maxLength) {
          moveToNext(index);
        }

        // For select dropdowns (Block → Flat)
        if (field.tagName === "SELECT" && field.value) {
          moveToNext(index);
        }
      });

      // For Enter key → go to next field instead of submitting
      field.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          moveToNext(index);
        }
      });
    });

    function moveToNext(currentIndex) {
      if (currentIndex < fields.length - 1) {
        fields[currentIndex + 1].focus();
      }
    }
  });

document.getElementById('refreshBtn').addEventListener('click', loadSlots);
//setInterval(loadSlots, 60000);

// Initialize
await loadSlots();
await loadBlockFlatMapping();


}
