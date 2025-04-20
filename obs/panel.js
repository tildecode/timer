// Password protect panel
if(!sessionStorage.getItem('timerAuth')){
  const pwd = prompt('Enter password to edit the timer:');
  if(pwd !== '!Qw2er4'){
    document.body.innerHTML = '<h2 style="color:white;font-family:sans-serif;text-align:center;margin-top:40vh;">Access denied</h2>';
    throw new Error('Unauthorized');
  }
  sessionStorage.setItem('timerAuth','1');
}

// Firebase SDK imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ...
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility functions for Firestore
async function saveEpoch(epoch){
  await setDoc(doc(db, 'config', 'timer'), { obsTargetEpoch: epoch });
}
async function loadEpoch(){
  const docSnap = await getDoc(doc(db, 'config', 'timer'));
  return docSnap.exists() ? docSnap.data().obsTargetEpoch : null;
}

// Generate overlay URL without .html
function overlayURL(){
  return location.origin + location.pathname.replace(/\/panel(\.html)?$/, '/');
}

const linkSpan = document.getElementById('obs-link');
linkSpan.textContent = overlayURL();
linkSpan.onclick = () => navigator.clipboard.writeText(overlayURL()).then(() => alert('Overlay URL copied'));

function toEpoch(d,t){
  const [y,m,day] = d.split('-').map(Number);
  const [hh,mm] = t.split(':').map(Number);
  return Date.UTC(y,m-1,day,hh,mm,0);
}

document.getElementById('apply').addEventListener('click', async ()=>{
  const d = document.getElementById('date').value;
  const t = document.getElementById('time').value;
  if(!d || !t || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(t)){
    alert('Enter valid date and 24‑hour time (HH:MM)');
    return;
  }
  const epoch = toEpoch(d,t);
  await saveEpoch(epoch);
  alert('Start time saved!');
});

// Populate inputs from Firestore on load
loadEpoch().then((stored)=>{
  if(stored){
    const dt = new Date(Number(stored));
    document.getElementById('date').value = dt.toISOString().slice(0,10);
    document.getElementById('time').value = dt.toISOString().slice(11,16);
  }
});
