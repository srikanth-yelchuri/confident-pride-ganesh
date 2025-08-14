const middle = document.getElementById('middleContent');

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

  // Dynamically load the JS file
  const script = document.createElement('script');
  script.src = 'js/dailyschedule.js';
  script.onload = () => {
    if (typeof initDailySchedule === 'function') initDailySchedule();
  };
  document.body.appendChild(script);
});
