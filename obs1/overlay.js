import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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

let targetEpoch = 0;
onValue(targetRef, (snap)=>{ targetEpoch = Number(snap.val()||0); });

const timers=[...document.querySelectorAll('.timer')];
const cds=[...document.querySelectorAll('.countdown')];
let idx=0;
const SWITCH=120000;

function fmt(ms) {
  if(ms<=0) return 'T-00:00:00';
  const s=Math.floor(ms/1000);
  const h=String(Math.floor(s/3600)).padStart(2,'0');
  const m=String(Math.floor(s%3600/60)).padStart(2,'0');
  const sec=String(s%60).padStart(2,'0');
  return `T-${h}:${m}:${sec}`;
}
function update() {
  const diff = targetEpoch - Date.now();
  const txt = fmt(diff);
  cds.forEach(el=>el.textContent = txt);
}
setInterval(update,1000);
update();

setInterval(()=>{ timers[idx].classList.remove('active'); idx=(idx+1)%timers.length; timers[idx].classList.add('active'); }, SWITCH);