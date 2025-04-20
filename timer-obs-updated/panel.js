// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
import { getDatabase, ref, set, onValue } from "firebase/database";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaw6V6stznHd2DOnjQUg1ZJ8Ep0hf0Q2s",
  authDomain: "obs-timer-ae3d8.firebaseapp.com",
  projectId: "obs-timer-ae3d8",
  storageBucket: "obs-timer-ae3d8.firebasestorage.app",
  messagingSenderId: "239406191344",
  appId: "1:239406191344:web:c7930accba84abf5b56835"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const targetRef = ref(db,'targetEpoch');

// password gate
const targetHash="acd44e3c041b6cfe4388c6038ffdf30edb3cedef6bb10cf388578fd21d15461e";
async function sha256(t) { const b=new TextEncoder().encode(t); const h=await crypto.subtle.digest('SHA-256',b); return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join(''); }
if(!sessionStorage.getItem('timerAuth')) {
  const pw=prompt('Enter password to edit the timer:');
  const h=await sha256(pw);
  if(h!==targetHash) {
    document.body.innerHTML='<h2 style="color:white;font-family:sans-serif;text-align:center;margin-top:40vh;">Access denied</h2>';
    throw new Error('Unauthorized');
  }
  sessionStorage.setItem('timerAuth','1');
}

// OBS link
function overlayURL() {
  return location.origin + location.pathname.replace(/\/index\.html$/, '/overlay');
}
const linkSpan=document.getElementById('obs-link');
linkSpan.textContent=overlayURL();
linkSpan.addEventListener('click',()=>navigator.clipboard.writeText(overlayURL()).then(()=>alert('URL copied')));

// Prefill existing
onValue(targetRef,(snap)=>{
  const v=Number(snap.val()||0);
  if(v) {
    const dt=new Date(v);
    document.getElementById('date').value=dt.toISOString().slice(0,10);
    document.getElementById('time').value=dt.toISOString().slice(11,16);
  }
});

// save
document.getElementById('apply').addEventListener('click',()=>{
  const d=document.getElementById('date').value;
  const t=document.getElementById('time').value;
  if(!d||!t) { alert('Enter date and time'); return; }
  const [y,m,day]=d.split('-').map(Number);
  const [hh,mm]=t.split(':').map(Number);
  const epoch=Date.UTC(y,m-1,day,hh,mm,0);
  set(targetRef, epoch).then(()=>alert('Start time saved!'));
});