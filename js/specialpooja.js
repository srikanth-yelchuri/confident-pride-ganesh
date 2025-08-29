async function initSpecialPooja() {
  const middle = document.getElementById('middleContent');

  let blockFlatMap = {};
  let userInteracted = false;

  // Load Block-Flat Mapping
  async function loadBlockFlatMapping() {
    setLoading(true);
    try {
      const cacheKey = "blockFlatMapCache";
      const cacheExpiryKey = "blockFlatMapExpiry";
      const now = Date.now();

      const cachedData = localStorage.getItem(cacheKey);
      const expiry = localStorage.getItem(cacheExpiryKey);

      if (cachedData && expiry && now < parseInt(expiry, 10)) {
        console.log("Using cached Block/Flat mapping");
        blockFlatMap = JSON.parse(cachedData);
        populateBlockDropdown();
        setLoading(false);
        return;
      }

      console.log("Fetching Block/Flat mapping from API");
      const res = await fetch(`${CONFIG.API_BASE_URL}?action=getBlockFlatMapping`);
      blockFlatMap = await res.json();

      localStorage.setItem(cacheKey, JSON.stringify(blockFlatMap));
      localStorage.setItem(cacheExpiryKey, now + 24 * 60 * 60 * 1000);

      populateBlockDropdown();
    } catch (err) {
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
  document.getElementById('block').addEventListener('change', function () {
    userInteracted = true;
    const block = this.value;
    const flatSel = document.getElementById('flat');
    flatSel.innerHTML = '<option value="">-- Select Flat --</option>';
    if (block && blockFlatMap[block]) {
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

  document.getElementById('flat').addEventListener('change', async () => {
    userInteracted = true;
    validateFormAndUpdateStatus();
    const block = document.getElementById('block').value;
    const flat = document.getElementById('flat').value;
    if (block && flat) {
      await loadExistingBooking(block, flat);
    }
  });

  // Input listeners
  document.querySelectorAll('#name, #phone').forEach(el =>
    el.addEventListener('input', () => { userInteracted = true; validateFormAndUpdateStatus(); })
  );

  // Name restriction
  document.getElementById("name").addEventListener("keypress", function (e) {
    const char = String.fromCharCode(e.which);
    if (!/^[A-Za-z ]$/.test(char)) e.preventDefault();
  });
  document.getElementById("name").addEventListener("input", function () {
    this.value = this.value.replace(/\s{2,}/g, ' ').replace(/^\s+/, '');
  });

  // Phone restriction
  document.getElementById("phone").addEventListener("keypress", function (e) {
    const char = String.fromCharCode(e.which);
    if (!/^[0-9]$/.test(char)) e.preventDefault();
  });
  document.getElementById("phone").addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, '');
    if (this.value.length > 10) this.value = this.value.slice(0, 10);
  });

    const slotContainer = document.getElementById('kumkumaSlotsContainer');
    slotContainer.addEventListener('change', (e) => {
    if (e.target && e.target.name === 'slotTime') {
        userInteracted = true;
        validateFormAndUpdateStatus();
    }
    });

    document.getElementById("kidsCount").addEventListener("input", validateFormAndUpdateStatus);

  /*document.querySelectorAll('input[name="slotTime"]').forEach(el =>
    el.addEventListener('change', () => { userInteracted = true; validateFormAndUpdateStatus(); })
  );*/

  // ✅ Load Existing Booking from Backend
  async function loadExistingBooking(block, flat) {
    try {
      setLoading(true);
      const phone = document.getElementById('phone').value.trim();
      const name = document.getElementById('name').value.trim();
      const res = await fetch(`${CONFIG.API_BASE_URL}?action=getUserSpecialPoojaData&name=${name}&block=${block}&flat=${flat}&phone=${phone}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        console.log("No existing booking → fresh form");
        resetForm();
        setLoading(false);
        return;
      }

      console.log("Found existing booking:", data);

      // Fill form values
      document.getElementById("name").value = data.name || "";
      document.getElementById("phone").value = data.phone || "";

      // Kumkuma Pooja
      if (data.kumkumapooja && data.kumkumapooja.slot) {
        document.getElementById("kumkumaCheckbox").checked = true;
        document.getElementById("kumkumaCheckbox").disabled = true;
        document.getElementById("kumkumaSlotsSection").style.display = "block";
        await renderKumkumaSlots(data.kumkumapooja.slot, true);
        
      } else {
        await renderKumkumaSlots();
      }

      // Saraswati
      if (data.saraswatipooja && data.saraswatipooja.kids) {
        document.getElementById("saraswatiCheckbox").checked = true;
        document.getElementById("kidsCount").value = data.saraswatipooja.kids || "";
        document.getElementById("kidsCount").readOnly = true;
        document.getElementById("saraswatiCheckbox").disabled = true;
        document.getElementById("kidsSection").style.display = "block";
      }

      // Homam
      if (data.homam === "Yes") {
        document.getElementById("homamCheckbox").checked = true;
         document.getElementById("homamCheckbox").disabled = true;
      }

    } catch (err) {
      console.error("Error loading booking:", err);
    }
    setLoading(false);
  }

  // Reset Form
  function resetForm() {
    document.getElementById("kumkumaCheckbox").checked = false;
    document.getElementById("saraswatiCheckbox").checked = false;
    document.getElementById("homamCheckbox").checked = false;
    document.getElementById("kidsCount").value = "";
    document.getElementById("kidsCount").readOnly = false;
    document.getElementById("kumkumaSlotsContainer").innerHTML = "";
  }

  // Render Kumkuma Slots
  // Render Kumkuma Slots
async function renderKumkumaSlots(selectedSlot = null, readonly = false) {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}?action=getKumkumaPoojaSlots`);
    const slots = await res.json();

    const container = document.getElementById("kumkumaSlotsContainer");
    container.innerHTML = "";

    const MAX_CAPACITY = 20;

    slots.forEach(slot => {
      const label = document.createElement("label");
      label.classList.add("slot-label");

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "slotTime";
      radio.value = slot.name;

      // split into date + session
      const [datePart, sessionPart] = slot.name.split(",").map(s => s.trim());

      const today = new Date();
      today.setHours(0, 0, 0, 0); // reset time to midnight

      const slotDate = new Date(datePart); // slot.date should be in YYYY-MM-DD format
      slotDate.setHours(0, 0, 0, 0);

      const isPast = slotDate < today;
      console.log('slotDate'+ slotDate);
       console.log('isPast'+ isPast);

      // Preselect if matches previously chosen
      if (selectedSlot === slot.name) {
        radio.checked = true;
      }

      // Disable logic → either readonly mode or slot is full
      if (readonly || isPast || slot.count >= MAX_CAPACITY) {
        radio.disabled = true;
        label.classList.add("slot-disabled"); // optional CSS class
      }

      // Re-run validation on change
      radio.addEventListener("change", validateFormAndUpdateStatus());

      label.appendChild(radio);
      label.append(
        ` ${slot.name} (${slot.count}/${MAX_CAPACITY}) ${
          slot.count >= MAX_CAPACITY ? "- Full" : ""
        }`
      );

      container.appendChild(label);
      container.appendChild(document.createElement("br"));

      // 🔄 ensure submit state reflects any preselected slot
        validateFormAndUpdateStatus();
    });

    // Show message if all slots are full
    if (slots.every(slot => slot.count >= MAX_CAPACITY)) {
      container.innerHTML += `<p style="color:red;font-weight:bold;">All slots are full</p>`;
    }
  } catch (err) {
    console.error("Error loading slots:", err);
  }
}


  document.getElementById('submitBtn').addEventListener('click', async ()=>{
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const block = document.getElementById('block').value.trim();
  const flat = document.getElementById('flat').value.trim();
  const kumkumapoojaslot = document.querySelector('input[name="slotTime"]:checked')?.value || "";
  
  console.log("Selected slot:", kumkumapoojaslot);

  const saraswatipoojakidcount = document.getElementById("kidsCount").value.trim();
  //const homam = document.querySelector('input[name="homamCheckbox"]:checked')?.value || null;
  const homam = document.getElementById("homamCheckbox").checked;
  console.log(homam); 
  
  setLoading(true);
  
  try {
    const res = await fetch("/.netlify/functions/submitSpecialPooja", {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      mode: 'no-cors',  // disables preflight
      body: JSON.stringify({name, phone, block, flat, kumkumapoojaslot, saraswatipoojakidcount, homam})
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
      document.getElementById('specialpoojaForm').reset();
      document.getElementById('flat').innerHTML='<option value="">-- Select Flat --</option>';
      document.getElementById('flat').disabled=true;
      validateFormAndUpdateStatus();
    } else { showPopup(result.message, false); }
  } catch(err){
    console.error(err);
    setLoading(false);
    showPopup('Failed to submit booking.', false);
  }
});

// === Checkbox listeners ===
document.getElementById("kumkumaCheckbox").addEventListener("change", async () => {
    setLoading(true);
    document.getElementById('submitBtn').disabled = true;
  if (document.getElementById("kumkumaCheckbox").checked) {
    await renderKumkumaSlots(); // load slots dynamically
    document.getElementById("kumkumaSlotsSection").style.display = "block";
  } else {
    document.getElementById("kumkumaSlotsContainer").innerHTML = "";
    document.getElementById("kumkumaSlotsSection").style.display = "none";
  }
  setLoading(false);
  validateFormAndUpdateStatus();
});

document.getElementById("saraswatiCheckbox").addEventListener("change", () => {
  const kidsSection = document.getElementById("kidsSection");
  kidsSection.style.display = document.getElementById("saraswatiCheckbox").checked ? "block" : "none";
  document.getElementById('submitBtn').disabled = true;
  validateFormAndUpdateStatus();
});

document.getElementById("homamCheckbox").addEventListener("change", () => {
  validateFormAndUpdateStatus();
});

  // Form validation
  function validateFormAndUpdateStatus() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const block = document.getElementById('block').value.trim();
    const flat = document.getElementById('flat').value.trim();
    const statusEl = document.getElementById('specialPoojaStatus');
    const submitBtn = document.getElementById('submitBtn');
    const kumkumaChecked = document.getElementById("kumkumaCheckbox").checked;
    const saraswatiChecked = document.getElementById("saraswatiCheckbox").checked;
    const homamChecked = document.getElementById("homamCheckbox").checked;
    const kumkumapoojaslot = document.querySelector('input[name="slotTime"]:checked')?.value || "";
    const saraswatipoojakidcount = document.getElementById("kidsCount").value.trim();
  

    
    if (!userInteracted) { statusEl.textContent = ''; statusEl.className = ''; submitBtn.disabled = true; return; }
    if (!name) { statusEl.textContent = 'Name is required.'; statusEl.className = 'msg error'; submitBtn.disabled = true; return; }
    if (!phone) { statusEl.textContent = 'Mobile number is required.'; statusEl.className = 'msg error'; submitBtn.disabled = true; return; }
    if (!/^\d{10}$/.test(phone)) { statusEl.textContent = 'Phone must be exactly 10 digits.'; statusEl.className = 'msg error'; submitBtn.disabled = true; return; }
    if (!block) { statusEl.textContent = 'Please select a Block.'; statusEl.className = 'msg error'; submitBtn.disabled = true; return; }
    if (!flat) { statusEl.textContent = 'Please select a Flat.'; statusEl.className = 'msg error'; submitBtn.disabled = true; return; }
    
    /* const anyChecked = document.getElementById("kumkumaCheckbox").checked ||
                     document.getElementById("saraswatiCheckbox").checked ||
                     document.getElementById("homamCheckbox").checked; */
    
        // validation logic
    let isValid = false;

    console.log('kumkumapoojaslot' +kumkumapoojaslot);
    if (kumkumaChecked && kumkumapoojaslot !== "") {
        isValid = true; // Kumkuma needs slot
    }
    if (saraswatiChecked && saraswatipoojakidcount !== "") {
        isValid = true; // Saraswati needs kids count
    }
    if (homamChecked) {
        isValid = true; // Homam needs no extra info
    }


  if (!isValid) {
    statusEl.textContent = "Please select at least one pooja.";
    statusEl.className = "msg error";
    submitBtn.disabled = true;
    return;
  }

  // other validations
  if (!name || !phone || !block || !flat) {
    statusEl.textContent = "Fill all required fields.";
    statusEl.className = "msg error";
    submitBtn.disabled = true;
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    statusEl.textContent = "Phone must be exactly 10 digits.";
    statusEl.className = "msg error";
    submitBtn.disabled = true;
    return;
  }

  statusEl.textContent = "";
  statusEl.className = "";
  submitBtn.disabled = false;

    }

  // Popup
  function showPopup(msg, success = true) {
    const overlay = document.getElementById('popupOverlay');
    const popup = document.getElementById('popup');
    document.getElementById('popupMessage').textContent = msg;
    popup.className = success ? 'success' : 'error';
    popup.dataset.resultType = success ? 'success' : 'error';
    overlay.style.display = 'flex';
    popup.focus();
  }

  document.getElementById('popupCloseBtn').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    const resultType = popup.dataset.resultType;
    document.getElementById('popupOverlay').style.display = 'none';
    document.getElementById('specialPoojaStatus').textContent = '';
    document.getElementById('specialPoojaStatus').className = '';
    document.getElementById('submitBtn').disabled = true;
    userInteracted = false;
    if (resultType === 'success') {
      window.location.href = 'index.html';
    }
  });

  function setLoading(isLoading) {
    document.getElementById('loadingSpinner').style.display = isLoading ? 'block' : 'none';
  }

  await loadBlockFlatMapping();
}
