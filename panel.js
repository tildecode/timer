import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAaw6V6stznHd2DOnjQUg1ZJ8Ep0hf0Q2s",
  authDomain: "obs-timer-ae3d8.firebaseapp.com",
  databaseURL: "https://obs-timer-ae3d8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "obs-timer-ae3d8",
  storageBucket: "obs-timer-ae3d8.appspot.com",
  messagingSenderId: "239406191344",
  appId: "1:239406191344:web:c7930accba84abf5b56835"
};

const app  = initializeApp(firebaseConfig);
const db   = getDatabase(app);
const auth = getAuth(app);
const targetRef = ref(db, "targetEpoch");

const loader = document.getElementById('loader');
const noteEl = document.createElement('div');
noteEl.id = 'loaderNote';
noteEl.className = 'loader-note';
loader.appendChild(noteEl);

function setLoaderNote(text) {
  noteEl.textContent = text;
  noteEl.classList.add('animate');
  setTimeout(() => noteEl.classList.remove('animate'), 400);
}

const ADMIN_EMAIL = "panel@timer.local";
const TARGET_HASH = "acd44e3c041b6cfe4388c6038ffdf30edb3cedef6bb10cf388578fd21d15461e"; 

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function ensureLogin() {
  if (auth.currentUser) return;
  let pwd = localStorage.getItem('timerPassword');
  if (pwd && await sha256(pwd) === TARGET_HASH) {
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, pwd);
      return;
    } catch {
      localStorage.removeItem('timerPassword');
    }
  }
  pwd = prompt("Enter timer password:");
  if (!(pwd && await sha256(pwd) === TARGET_HASH)) {
    setLoaderNote("Wrong password");
    throw new Error("Unauthorized");
  }
  localStorage.setItem('timerPassword', pwd);
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, pwd)
        .catch(err => { setLoaderNote("Authentication failed"); throw err; });
}

setLoaderNote("Authenticating…");
try {
  await ensureLogin();
} catch (err) {
  throw err;
}

setLoaderNote("Connecting to server…");

document.querySelector('.card').style.visibility = 'hidden';

function overlayURL() {
  const basePath = location.pathname.replace(/\/(?:index(?:\.html)?)?\/?$/, '');
  return `${location.origin}${basePath}/overlay`;
}

const url = overlayURL();
document.getElementById('obs-link').textContent = url;

document.getElementById('copy-btn')
  .addEventListener('click', () =>
    navigator.clipboard.writeText(url)
      .then(() => alert('URL copied')));

onValue(targetRef, snap => {
  setLoaderNote("Fetching timer…");
  const v = Number(snap.val() || 0);
  if (v) {
    const dt = new Date(v);
    document.getElementById("date").value = dt.toISOString().slice(0, 10);
    document.getElementById("time").value = dt.toISOString().slice(11, 16);
  }
  setLoaderNote("Ready))");
  loader.classList.add('hidden');
  document.querySelector('.card').style.visibility = 'visible';
});

document.getElementById("apply").addEventListener("click", () => {
  const d = document.getElementById("date").value;
  const t = document.getElementById("time").value;
  if (!d || !t) { alert("Enter date and time"); return; }
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm] = t.split(":").map(Number);
  const epoch = Date.UTC(y, m - 1, day, hh, mm, 0);
  set(targetRef, epoch).then(() => alert("Start time saved!"));
});
