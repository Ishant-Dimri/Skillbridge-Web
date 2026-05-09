// Use the modular v9 CDN imports (only once per module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Example usage
// auth, db, storage, analytics are ready to use
