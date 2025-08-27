const middle = document.getElementById('middleContent');

// Default Ganapati Slokas content
const defaultContent = `
  <div id="scheduleContent">
    <div class="shloka-container">
      <div class="shloka">
        Shuklaambara Dharam Vishnum Shashi Varnam Chatur Bhujam Prasanna Vadanam Dhyaayet Sarva Vighna Upashaantaye
      </div>
    </div>
    </br>
    </br>

   <!-- Donors Section -->
    <div class="donors-container">
      <h3 class="donors-heading">🎉 Congratulations to the Donors 🎉</h3>
      <ul class="donors-list">
        <li><span class="item">Ganesh Idol :</span> <span class="name">Dhani (B-604)</span></li>
        <li><span class="item">Laddu :</span> <span class="name">Ramesh (C-407)</span></li>
        <li><span class="item">Pattu Vastralu :</span> <span class="name">Ramesh (B-107)</span></li>
        <li><span class="item">Gajamala - First Day :</span> <span class="name">Sudheer (A-802)</span></li>
        <li><span class="item">Gajamala - Last Day :</span> <span class="name">Ravi (B-703)</span></li>
      </ul>
    </div>
  </div>
`;

// Load default content on page load
middle.innerHTML = defaultContent;

// Home button resets middle content
document.getElementById('imgHome').addEventListener('click', () => {
  middle.innerHTML = defaultContent;
});


document.getElementById('imgBooking').addEventListener('click', async () => {
  const res = await fetch('booking.html');
  const html = await res.text();
  middle.innerHTML = html;
  // Initialize booking JS after loading
  if (typeof initBooking === 'function') initBooking();
});

document.getElementById('imgSchedule').addEventListener('click', async () => {
  const res = await fetch('dailyschedule.html');
  const html = await res.text();
  middle.innerHTML = html;

  // Manually initialize the JS after HTML is injected
  if (typeof initDailySchedule === 'function') initDailySchedule();
});

document.getElementById('img108Prasadam').addEventListener('click', async () => {
  const res = await fetch('108prasadams.html');
  const html = await res.text();
  middle.innerHTML = html;

  // Manually initialize the JS after HTML is injected
  if (typeof initPrasadam === 'function') initPrasadam();
});

document.getElementById('imgGotranamalu').addEventListener('click', async () => {
  const res = await fetch('gotranamalu.html');
  const html = await res.text();
  middle.innerHTML = html;

  // Manually initialize the JS after HTML is injected
  if (typeof initGotranamalu === 'function') initGotranamalu();
});

document.getElementById('imgSpecialPooja').addEventListener('click', async () => {
  const res = await fetch('specialpooja.html');
  const html = await res.text();
  middle.innerHTML = html;

  // Manually initialize the JS after HTML is injected
  if (typeof initSpecialPooja === 'function') initSpecialPooja();
});


const bgm = document.getElementById('bgm');
const soundGate = document.getElementById('soundGate');
const enableSoundBtn = document.getElementById('enableSoundBtn');
const muteToggle = document.getElementById('muteToggle');

// Recommended starting volume (quiet)
bgm.volume = 0.35;

// Try autoplay as early as possible after DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await bgm.play();               // Will work on desktop; may fail on mobile
    muteToggle.hidden = false;
  } catch (err) {
    // Autoplay blocked → show gate
    soundGate.hidden = false;
    muteToggle.hidden = true;
  }
});

// One-tap user gesture to start sound (mobile-safe)
enableSoundBtn?.addEventListener('click', async () => {
  try {
    await bgm.play();
    soundGate.hidden = true;
    muteToggle.hidden = false;
  } catch (err) {
    // If it still fails, keep the gate visible
    console.error('Play failed:', err);
  }
});

// Mute/unmute toggle
muteToggle?.addEventListener('click', () => {
  const muted = !bgm.muted;
  bgm.muted = muted;
  muteToggle.textContent = muted ? '🔈' : '🔊';
  muteToggle.setAttribute('aria-pressed', String(!muted));
});

// Nice-to-have: pause when tab is hidden, resume when visible
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    bgm.pause();
  } else {
    try { await bgm.play(); } catch (_) {/* ignore */}
  }
});

// iOS safety net: after first touch anywhere, try play once
let triedFirstTouch = false;
window.addEventListener('touchend', async () => {
  if (!triedFirstTouch && bgm.paused) {
    triedFirstTouch = true;
    try {
      await bgm.play();
      soundGate.hidden = true;
      muteToggle.hidden = false;
    } catch (_) { /* still blocked; user can tap the button */ }
  }
}, { passive: true });

