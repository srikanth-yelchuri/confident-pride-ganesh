const middle = document.getElementById('middleContent');

// Default Ganapati Slokas content
const defaultContent = `
  <div id="scheduleContent">
    <div class="shloka-container">
      <div class="shloka">
        <p><b>Shuklaambara Dharam Vishnum</b><br>
        Shashi Varnam Chatur Bhujam<br>
        Prasanna Vadanam Dhyaayet<br>
        Sarva Vighna Upashaantaye</p>
    
        <p><b>Vakratunda Mahakaaya</b><br>
        Suryakoti Samaprabha<br>
        Nirvighnam Kuru Mey Deva<br>
        Sarva Kaaryeshu Sarvada</p>
    
        <p><b>Agajaanana Padmaarkam</b><br>
        Gajaananam Aharnisham<br>
        Anekadantam Bhaktaanaam<br>
        Ekadantam Upaasmahey</p>
      </div>
    </div>
</div>
;

// Load default content on page load
middle.innerHTML = defaultContent;

// Home button resets middle content
document.getElementById('btnHome').addEventListener('click', () => {
  middle.innerHTML = defaultContent;
});


document.getElementById('btnBooking').addEventListener('click', async () => {
  const res = await fetch('booking.html');
  const html = await res.text();
  middle.innerHTML = html;
  // Initialize booking JS after loading
  if (typeof initBooking === 'function') initBooking();
});

document.getElementById('btnSchedule').addEventListener('click', async () => {
  const res = await fetch('dailyschedule.html');
  const html = await res.text();
  middle.innerHTML = html;

  // Manually initialize the JS after HTML is injected
  if (typeof initDailySchedule === 'function') initDailySchedule();
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

