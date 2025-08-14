const API_URL = "https://script.google.com/macros/s/AKfycbytW6AkFxEIKZw5_RTVoVmMUBFJnokxnG1mz94u4xfWfWB01cqOsfdYqbO4b9Lj8e4d/exec";

let blockFlatMap = {};
let availability = {};
let uniqueDates = [];
let fullyBookedDates = [];
let userInteracted = false;

// Load Block-Flat Mapping
async function loadBlockFlatMapping() {
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}?action=getBlockFlatMapping`);
    blockFlatMap = await res.json();
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
  } catch(err){
    console.error(err);
    showPopup('Failed to load block mapping.', false);
  }
  setLoading(false);
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
    const res = await fetch(`${API_URL}?action=getAvailability`);
    availability = await res.json();

    uniqueDates = [...new Set(Object.keys(availability).map(s => s.split(',')[0].trim()))].sort();

    fullyBookedDates = uniqueDates.filter(date => {
      const morning = availability[`${date}, Morning`];
      const evening = availability[`${date}, Evening`];
      return (!morning || morning.status==="Full") && (!evening || evening.status==="Full");
    });

    initializeDatePicker();
    const dateInput = document.getElementById('eventDate');
    dateInput.value = '';
    dateInput.disabled = uniqueDates.length === 0;

    document.querySelectorAll('input[name="slotTime"]').forEach(r => { r.checked=false; r.disabled=true; });
  } catch(err){
    console.error(err);
    showPopup('Failed to load slots.', false);
  }
  setLoading(false);
}

function initializeDatePicker() {
  flatpickr("#eventDate", {
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
  overlay.style.display='flex';
  popup.focus();
}

document.getElementById('popupCloseBtn').addEventListener('click', ()=>{
  document.getElementById('popupOverlay').style.display='none';
  document.getElementById('bookingStatus').textContent=''; 
  document.getElementById('bookingStatus').className='';
  document.getElementById('submitBtn').disabled=true;
  userInteracted=false;
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
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({name, phone, block, flat, slot})
    });
    const result = await res.json();
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

document.getElementById('refreshBtn').addEventListener('click', loadSlots);
setInterval(loadSlots, 60000);

// Initialize
loadBlockFlatMapping();
loadSlots();
