// js/firebase.js
// Firebase config kamu (sudah ada - dipakai ulang)
// File ini dimuat via <script src="js/firebase.js">
// setelah firebase-app-compat.js dll sudah dimuat

const firebaseConfig = {
  apiKey: "AIzaSyCc7ipjHy16mhX2zf6u-8cOTnz-TKgIgWs",
  authDomain: "presensi-hub.firebaseapp.com",
  projectId: "presensi-hub",
  storageBucket: "presensi-hub.appspot.com",
  messagingSenderId: "950859407156",
  appId: "1:950859407156:web:80a562c36d799588628f61"
};

// Inisialisasi (cek jika sudah ada agar tidak double init)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
