// Firebase SDK imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getFirestore, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ...
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let targetEpoch = 0;
// Listen for real-time updates
onSnapshot(doc(db,'config','timer'), snapshot=>{
  const data = snapshot.data();
  if(data && data.obsTargetEpoch){
    targetEpoch = data.obsTargetEpoch;
    update();
  }
});

// Generate overlay URL without .html
function overlayURL(){
  return location.origin + location.pathname.replace(/\/panel(\.html)?$/, '/');
}

const timers = [...document.querySelectorAll('.timer')];
const cds = [...document.querySelectorAll('.countdown')];
let idx = 0;
const SWITCH = 120000;

function target(){ return targetEpoch; }
function format(ms){
  if(ms<=0) return 'T-00:00:00';
  const s = Math.floor(ms/1000);
  const h=String(Math.floor(s/3600)).padStart(2,'0');
  const m=String(Math.floor(s%3600/60)).padStart(2,'0');
  const sec=String(s%60).padStart(2,'0');
  return `T-${h}:${m}:${sec}`;
}

function update(){
  const diff = target() - Date.now();
  const txt = format(diff);
  cds.forEach(el=>el.textContent=txt);
}

update();
setInterval(update,1000);
setInterval(()=>{
  timers[idx].classList.remove('active');
  idx=(idx+1)%timers.length;
  timers[idx].classList.add('active');
},SWITCH);

window.addEventListener('storage',e=>{
  if(e.key==='obsTargetEpoch') update();
});
