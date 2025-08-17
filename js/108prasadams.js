async function initPrasadam() {
  const API_URL = "https://script.google.com/macros/s/AKfycbwbMrmHeCiy4-nZpaYmEQy_JUSVajgSr5FX48HLlOxnyTNbsfVhWxv1LrRTw4IA-u6o/exec";

  let blockFlatMap = {};
  let prasadamList = [];
  let userInteracted = false;

  function setLoading(isLoading) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = isLoading ? 'block' : 'none';
  }

  // ================== BLOCK/FLAT ==================
  async function loadBlockFlatMapping() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getBlockFlatMapping`);
      blockFlatMap = await res.json();
      populateBlockDropdown();
    } catch (err) {
      console.error(err);
      showPopup('Failed to load block mapping.', false);
    }
    setLoading(false);
  }

  function populateBlockDropdown() {
    const blockSel = document.getElementById('block');
    if (!blockSel) return;
    blockSel.innerHTML = '<option value="">-- Select Block --</option>';
    Object.keys(blockFlatMap).sort().forEach(block => {
      const opt = document.createElement('option');
      opt.value = block;
      opt.textContent = block;
      blockSel.appendChild(opt);
    });

    const flatSel = document.getElementById('flat');
    if (flatSel) {
      flatSel.innerHTML = '<option value="">-- Select Flat --</option>';
      flatSel.disabled = true;
    }
  }

  document.getElementById('block').addEventListener('change', function () {
    const block = this.value;
    const flatSel = document.getElementById('flat');
    if (!flatSel) return;

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
    userInteracted = true;
    validateFormAndUpdateStatus();
  });

  document.getElementById('flat').addEventListener('change', () => {
    userInteracted = true;
    validateFormAndUpdateStatus();
  });

  // ================== PRASADAMS ==================
  async function loadPrasadams() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=get108Prasadams`);
      prasadamList = await res.json(); // [{item:"Laddu",available:true}, ...]

      prasadamList.sort((a, b) => a.item.localeCompare(b.item));
      renderPrasadamDropdown();
    } catch (err) {
      console.error(err);
      showPopup('Failed to load Prasadam list.', false);
    }
    setLoading(false);
  }


function renderPrasadamDropdown() {
  const container = document.getElementById('prasadamContainer');
  if (!container) return;
  container.innerHTML = '';

  prasadamList.forEach(p => {
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = p.item;
    if (!p.available) div.classList.add('disabled');

    div.addEventListener('click', () => {
      if (div.classList.contains('disabled')) return;

      div.classList.toggle('selected');
      userInteracted = true;

      enforceMaxSelection();
      validateFormAndUpdateStatus();
    });

    container.appendChild(div);
  });
}

// Enforce max 2 selection
function enforceMaxSelection() {
  const selectedItems = prasadamContainer.querySelectorAll('.item.selected');
  if (selectedItems.length >= 2) {
    prasadamContainer.querySelectorAll('.item').forEach(item => {
      if (!item.classList.contains('selected') && !prasadamList.find(p => p.item === item.textContent && !p.available)) {
        item.classList.add('disabled');
      }
    });
  } else {
    prasadamContainer.querySelectorAll('.item').forEach(item => {
      if (!prasadamList.find(p => p.item === item.textContent && !p.available)) {
        item.classList.remove('disabled');
      }
    });
  }
}

// Update validateFormAndUpdateStatus to read from custom divs
function validateFormAndUpdateStatus() {
  const name = document.getElementById('name')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const block = document.getElementById('block')?.value.trim();
  const flat = document.getElementById('flat')?.value.trim();

  const selectedItems = [...prasadamContainer.querySelectorAll('.item.selected')].map(d => d.textContent);

  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('formStatus');

  if (!userInteracted) { 
    statusEl.textContent = ''; 
    submitBtn.disabled = true; 
    return; 
  }
  if (!name) { statusEl.textContent = 'Name is required.'; submitBtn.disabled = true; return; }
  if (!/^\d{10}$/.test(phone)) { statusEl.textContent = 'Phone must be exactly 10 digits.'; submitBtn.disabled = true; return; }
  if (!block) { statusEl.textContent = 'Please select a Block.'; submitBtn.disabled = true; return; }
  if (!flat) { statusEl.textContent = 'Please select a Flat.'; submitBtn.disabled = true; return; }
  if (selectedItems.length < 1) { statusEl.textContent = 'Select at least 1 prasadam.'; submitBtn.disabled = true; return; }

  statusEl.textContent = `Selected ${selectedItems.length} prasadam(s).`;
  submitBtn.disabled = false;
}
  

  // ================== POPUP ==================
  function showPopup(msg, success = true) {
    const overlay = document.getElementById('popupOverlay');
    const popup = document.getElementById('popup');
    if (!overlay || !popup) return;
    document.getElementById('popupMessage').textContent = msg;
    popup.className = success ? 'success' : 'error';
    overlay.style.display = 'flex';
    popup.focus();
  }

  document.getElementById('popupCloseBtn')?.addEventListener('click', () => {
    document.getElementById('popupOverlay').style.display = 'none';
  });

  // ================== SUBMIT ==================
  document.getElementById('submitBtn').addEventListener('click', async () => {
    const name = document.getElementById('name')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const block = document.getElementById('block')?.value.trim();
    const flat = document.getElementById('flat')?.value.trim();
    const prasadamSelect = document.getElementById('prasadamSelectList');
    const prasadamSelected = prasadamSelect ? [...prasadamSelect.selectedOptions].map(o => o.value) : [];

    if (prasadamSelected.length < 1) { showPopup("Please select at least one prasadam.", false); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=saveUserSelection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, block, flat, prasadam: prasadamSelected.join(", ") })
      });

      const result = await res.json();
      setLoading(false);

      if (result.success) {
        showPopup(result.message, true);
        document.getElementById('prasadamForm')?.reset();
        renderPrasadamDropdown();
      } else {
        showPopup(result.message, false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      showPopup('Failed to submit selection.', false);
    }
  });

  // ================== INIT ==================
  await loadBlockFlatMapping();
  await loadPrasadams();
}
