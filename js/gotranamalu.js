async function initGotranamalu() {
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
      showPopup("Failed to load block mapping.", false);
    }
    setLoading(false);
  }

  // Populate Block dropdown
  function populateBlockDropdown() {
    const blockSel = document.getElementById("block");
    blockSel.innerHTML = '<option value="">-- Select Block --</option>';
    Object.keys(blockFlatMap)
      .sort()
      .forEach((block) => {
        const opt = document.createElement("option");
        opt.value = block;
        opt.textContent = block;
        blockSel.appendChild(opt);
      });
    document.getElementById("flat").innerHTML =
      '<option value="">-- Select Flat --</option>';
    document.getElementById("flat").disabled = true;
  }

  // Block change → load Flats
  document.getElementById("block").addEventListener("change", function () {
    userInteracted = true;
    const block = this.value;
    const flatSel = document.getElementById("flat");
    flatSel.innerHTML = '<option value="">-- Select Flat --</option>';
    if (block && blockFlatMap[block]) {
      blockFlatMap[block].forEach((flat) => {
        const opt = document.createElement("option");
        opt.value = flat;
        opt.textContent = flat;
        flatSel.appendChild(opt);
      });
      flatSel.disabled = false;
    } else {
      flatSel.disabled = true;
    }
    validateForm();
  });

  document.getElementById("flat").addEventListener("change", () => {
    userInteracted = true;
    validateForm();
  });

  document
    .querySelectorAll("#gotram, #familyMembers")
    .forEach((el) =>
      el.addEventListener("input", () => {
        userInteracted = true;
        validateForm();
      })
    );

  // Form validation
  function validateForm() {
    const block = document.getElementById("block").value.trim();
    const flat = document.getElementById("flat").value.trim();
    const gotram = document.getElementById("gotram").value.trim();
    const familyMembers = document.getElementById("familyMembers").value.trim();
    const submitBtn = document.getElementById("submitBtn");

    if (!userInteracted) {
      submitBtn.disabled = true;
      return;
    }
    if (!block || !flat || !gotram || !familyMembers) {
      submitBtn.disabled = true;
      return;
    }
    submitBtn.disabled = false;
  }

  // Submit handler
  document.getElementById("submitBtn").addEventListener("click", async () => {
    const block = document.getElementById("block").value.trim();
    const flat = document.getElementById("flat").value.trim();
    const gotram = document.getElementById("gotram").value.trim();
    const familyMembers = document.getElementById("familyMembers").value.trim();

    if (!block || !flat || !gotram || !familyMembers) {
      showPopup("⚠️ Please fill all fields before submitting.", false);
      return;
    }

    setLoading(true);
    try {
        const res = await fetch("/.netlify/functions/submitGotranamalu", {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        mode: 'no-cors',  // disables preflight
        body: JSON.stringify({ block, flat, gotram, familyMembers }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();

      setLoading(false);
      if (result.status === "success") {
        showPopup("✅ Gotranamalu details submitted successfully!", true);
        document.getElementById("gotranamaluForm").reset();
        document.getElementById("flat").innerHTML =
          '<option value="">-- Select Flat --</option>';
        document.getElementById("flat").disabled = true;
        userInteracted = false;
        validateForm();
      } else {
        showPopup("❌ " + result.message, false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      showPopup("❌ Failed to submit gotranamalu details.", false);
    }
  });

  // Popup
  function showPopup(msg, success = true) {
    const overlay = document.getElementById("popupOverlay");
    const popup = document.getElementById("popup");
    document.getElementById("popupMessage").textContent = msg;
    popup.className = success ? "success" : "error";
    overlay.style.display = "flex";
    popup.focus();
  }

  document
    .getElementById("popupCloseBtn")
    .addEventListener("click", () => {
      document.getElementById("popupOverlay").style.display = "none";
    });

  // Loading spinner
  function setLoading(isLoading) {
    document.getElementById("loadingSpinner").style.display = isLoading
      ? "block"
      : "none";
  }

  // Initialize
  await loadBlockFlatMapping();
}
