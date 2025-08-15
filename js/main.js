const middle = document.getElementById('middleContent');

// Default Ganapati Slokas content
const defaultContent = `
  <div id="scheduleContent">
    <p>
      <strong>Shuklaambara Dharam Vishnum</strong><br>
      Shashi Varnam Chatur Bhujam<br>
      Prasanna Vadanam Dhyaayet<br>
      Sarva Vighna Upashaanthaye
    </p>
    <p>
      <strong>Vakratunda Mahakaaya</strong><br>
      Suryakoti Samaprabha<br>
      Nirvighnam Kuru Mey Deva<br>
      Sarva Kaaryeshu Sarvada
    </p>
    <p>
      <strong>Agajaanana Padmaarkam</strong><br>
      Gajaananam Aharnisham<br>
      Anekadantham Bhaktaanaam<br>
      Ekadantam Upaasmahey
    </p>
  </div>
`;

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
