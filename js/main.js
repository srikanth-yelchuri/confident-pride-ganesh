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
  // Initialize schedule JS after loading
  if (typeof initDailySchedule === 'function') initDailySchedule();
});
