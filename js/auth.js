// auth.js — Authentication logic (signup, login, logout)
// Uses Firebase v9 modular SDK loaded in firebase.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const { auth, db } = window.fb;

// Signup
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      // create user doc
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        progress: {},
        placementScore: 0
      });
      window.location.href = 'dashboard.html';
    } catch (err) {
      alert('Signup error: ' + err.message);
    }
  });
}

// Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'dashboard.html';
    } catch (err) {
      alert('Login error: ' + err.message);
    }
  });
}

// Google Sign-in
const googleBtn = document.getElementById('google-signin');
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // ensure user doc exists
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || '',
          email: user.email,
          createdAt: new Date().toISOString(),
          progress: {},
          placementScore: 0
        });
      }
      window.location.href = 'dashboard.html';
    } catch (err) {
      alert('Google sign-in error: ' + err.message);
    }
  });
}

// Logout
export async function logoutUser() {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (err) {
    alert('Logout error: ' + err.message);
  }
}

// Auth state listener
onAuthStateChanged(auth, (user) => {
  // If on dashboard, populate user info
  if (user && window.location.pathname.endsWith('dashboard.html')) {
    document.getElementById('welcome-user').innerText = `Welcome, ${user.displayName || 'Learner'}`;
  }
});
