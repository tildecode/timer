import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaw6V6stznHd2DOnjQUg1ZJ8Ep0hf0Q2s",
  authDomain: "obs-timer-ae3d8.firebaseapp.com",
  databaseURL: "https://obs-timer-ae3d8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "obs-timer-ae3d8",
  storageBucket: "obs-timer-ae3d8.firebasestorage.app",
  messagingSenderId: "239406191344",
  appId: "1:239406191344:web:c7930accba84abf5b56835"
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
