async function initPrasadam() {
  const API_URL = "https://script.google.com/macros/s/AKfycbwbMrmHeCiy4-nZpaYmEQy_JUSVajgSr5FX48HLlOxnyTNbsfVhWxv1LrRTw4IA-u6o/exec";

  let blockFlatMap = {};
  let prasadamList = [];
  let userInteracted = false;

  // Loading spinner
  function setLoading(isLoading) {
    document.getElementById('loadingSpinner').style.display = isLoading ? 'block' : 'none';
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

  document.getElementById('block').addEventListener('change', function () {
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
      prasadamList = await res.json(); // expect [{item:"Laddu",available:true}, ...]

      // sort alphabetically by item name
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
    container.innerHTML = '';

    const select = document.createElement('select');
    select.id = 'prasadamSelect';
    select.multiple = true;
    select.size = 8; // show 8 items without scrolling
    select.className = 'prasadam-dropdown';

    prasadamList.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.item;
      opt.textContent = p.item;
      if (!p.available) opt.disabled = true;
      select.appendChild(opt);
    });

    container.appendChild(select);

    // Selection logic: max 2
    select.addEventListener('change', function () {
      const selected = [...this.selectedOptions];
      if (selected.length > 2) {
        selected[selected.length - 1].selected = false;
        showPopup("You can select a maximum of 2 prasadam items.", false);
      }
      userInteracted = true;
      validateFormAndUpdateStatus();
    });
  }

  // ================== VALIDATION ==================
  function validateFormAndUpdateStatus() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const block = document.getElementById('block').value.trim();
    const flat = document.getElementById('flat').value.trim();

    const prasadamSelect = document.getElementById('prasadamSelect');
    const prasadamSelected = prasadamSelect ? [...prasadamSelect.selectedOptions].map(o => o.value) : [];

    const submitBtn = document.getElementById('submitBtn');
    const statusEl = document.getElementById('bookingStatus');

    if (!userInteracted) { statusEl.textContent = ''; submitBtn.disabled = true; return; }
    if (!name) { statusEl.textContent = 'Name is required.'; submitBtn.disabled = true; return; }
    if (!/^\d{10}$/.test(phone)) { statusEl.textContent = 'Phone must be exactly 10 digits.'; submitBtn.disabled = true; return; }
    if (!block) { statusEl.textContent = 'Please select a Block.'; submitBtn.disabled = true; return; }
    if (!flat) { statusEl.textContent = 'Please select a Flat.'; submitBtn.disabled = true; return; }
    if (prasadamSelected.length < 1) { statusEl.textContent = 'Select at least 1 prasadam.'; submitBtn.disabled = true; return; }

    statusEl.textContent = `Selected ${prasadamSelected.length} prasadam(s).`;
    submitBtn.disabled = false;
  }

  // ================== POPUP ==================
  function showPopup(msg, success = true) {
    const overlay = document.getElementById('popupOverlay');
    const popup = document.getElementById('popup');
    document.getElementById('popupMessage').textContent = msg;
    popup.className = success ? 'success' : 'error';
    overlay.style.display = 'flex';
    popup.focus();
  }

  document.getElementById('popupCloseBtn').addEventListener('click', () => {
    document.getElementById('popupOverlay').style.display = 'none';
  });

  // ================== SUBMIT ==================
  document.getElementById('submitBtn').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const block = document.getElementById('block').value.trim();
    const flat = document.getElementById('flat').value.trim();

    const prasadamSelect = document.getElementById('prasadamSelect');
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
        document.getElementById('prasadamForm').reset();
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
