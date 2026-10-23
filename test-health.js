async function checkBackend() {
  try {
    const res = await fetch('https://fitness-species-backend.onrender.com/api/health');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}
checkBackend();
