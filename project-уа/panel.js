import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

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

// Auth gate: only authorized users can edit
const auth = getAuth(app);
if (!sessionStorage.getItem('timerAuth')) {
  const email = prompt('Enter admin email:');
  const password = prompt('Enter admin password:');
  try {
    await signInWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem('timerAuth','1');
  } catch (error) {
    document.body.innerHTML = '<h2 style="color:white;font-family:sans-serif;text-align:center;margin-top:40vh;">Access denied</h2>';
    throw new Error('Unauthorized');
  }
}

// OBS link without .html
function overlayURL() {
  return location.origin + '/overlay';
}
const linkSpan = document.getElementById('obs-link');
linkSpan.textContent = overlayURL();
linkSpan.addEventListener('click', () => navigator.clipboard.writeText(overlayURL()).then(() => alert('URL copied')));

// Prefill existing
onValue(targetRef, (snap) => {
  const v = Number(snap.val() || 0);
  if (v) {
    const dt = new Date(v);
    document.getElementById('date').value = dt.toISOString().slice(0,10);
    document.getElementById('time').value = dt.toISOString().slice(11,16);
  }
});

// save
document.getElementById('apply').addEventListener('click', () => {
  const d = document.getElementById('date').value;
  const t = document.getElementById('time').value;
  if (!d || !t) { alert('Enter date and time'); return; }
  const [y,m,day] = d.split('-').map(Number);
  const [hh,mm] = t.split(':').map(Number);
  const epoch = Date.UTC(y,m-1,day,hh,mm,0);
  set(targetRef, epoch).then(() => alert('Start time saved!'));
});
