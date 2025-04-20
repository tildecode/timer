import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyApGrKt03vicerYjGkCgr7qE_VDOzmZwnM",
  authDomain: "timer-obs-cd14d.firebaseapp.com",
  databaseURL: "https://timer-obs-cd14d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "timer-obs-cd14d",
  storageBucket: "timer-obs-cd14d.appspot.com",
  messagingSenderId: "271470559324",
  appId: "1:271470559324:web:83d81275e2da3df9e76699"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const targetRef = ref(db,'targetEpoch');

// Auth gate: single password for edits
const targetHash = "acd44e3c041b6cfe4388c6038ffdf30edb3cedef6bb10cf388578fd21d15461e";
async function sha256(t) {
  const b = new TextEncoder().encode(t);
  const h = await crypto.subtle.digest('SHA-256', b);
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('');
}
if (!sessionStorage.getItem('timerAuth')) {
  const pw = prompt('Enter password to edit the timer:');
  const h = await sha256(pw);
  if (h !== targetHash) {
    document.body.innerHTML = '<h2 style="color:white;font-family:sans-serif;text-align:center;margin-top:40vh;">Access denied</h2>';
    throw new Error('Unauthorized');
  }
  sessionStorage.setItem('timerAuth','1');
}

// OBS link without .html
// Compute overlay URL based on current path (works with GitHub project pages)
function overlayURL() {
  // take everything up to the final “/” in the current path (e.g. “/namerep/”), then add “overlay/”
  const base = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
  return location.origin + base + 'overlay/';
};

// Save new target time
document.getElementById('apply').addEventListener('click', () => {
  const d = document.getElementById('date').value;
  const t = document.getElementById('time').value;
  if (!d || !t) { alert('Enter date and time'); return; }
  const [y,m,day] = d.split('-').map(Number);
  const [hh,mm] = t.split(':').map(Number);
  const epoch = Date.UTC(y,m-1,day,hh,mm,0);
  set(targetRef, epoch).then(() => alert('Start time saved!'));
});
