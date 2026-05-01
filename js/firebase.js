// js/firebase.js
// Replace the firebaseConfig values with your project values
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCg4AaOf-fYGxNdhJVH4avHcosfVOw9vpk",
  authDomain: "skillbridge-94a17.firebaseapp.com",
  projectId: "skillbridge-94a17",
  storageBucket: "skillbridge-94a17.firebasestorage.app",
  messagingSenderId: "385458072778",
  appId: "1:385458072778:web:39d836ac674610fcab9833",
  measurementId: "G-QMSQYV2JN8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Expose a simple object on window for legacy code that expects window.fb
window.fb = window.fb || {};
window.fb.app = app;
window.fb.auth = auth;
window.fb.db = db;
window.fb.storage = storage;

// Also export for modules that import firebase.js
export { app, auth, db, storage };
