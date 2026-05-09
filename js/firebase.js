// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCg4AaOf-fYGxNdhJVH4avHcosfVOw9vpk",
  authDomain: "skillbridge-94a17.firebaseapp.com",
  databaseURL: "https://skillbridge-94a17-default-rtdb.firebaseio.com",
  projectId: "skillbridge-94a17",
  storageBucket: "skillbridge-94a17.appspot.com",
  messagingSenderId: "385458072778",
  appId: "1:385458072778:web:39d836ac674610fcab9833",
  measurementId: "G-QMSQYV2JN8"
};

const app = initializeApp(firebaseConfig);

// Exported services for other modules to import
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
