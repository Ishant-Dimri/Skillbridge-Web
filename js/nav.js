// nav.js
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const authBtn = document.getElementById('auth-btn');

function setAsLogin() {
  if (!authBtn) return;
  authBtn.textContent = 'Login';
  authBtn.onclick = () => {
    window.location.href = './login.html';
  };
}

function setAsLogout() {
  if (!authBtn) return;
  authBtn.textContent = 'Logout';
  authBtn.onclick = async () => {
    authBtn.disabled = true;
    try {
      await signOut(auth);
      // optional: redirect after sign out
      // window.location.href = './index.html';
    } catch (err) {
      console.error('Sign out error:', err);
      alert('Sign out failed. Check console for details.');
    } finally {
      authBtn.disabled = false;
    }
  };
}

// Update UI on auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    setAsLogout();
  } else {
    setAsLogin();
  }
});

// If the button is added dynamically after this script runs, observe DOM and attach behavior
if (!authBtn) {
  const observer = new MutationObserver(() => {
    const btn = document.getElementById('auth-btn');
    if (btn) {
      observer.disconnect();
      // re-run the same logic now that the button exists
      onAuthStateChanged(auth, (user) => {
        if (user) setAsLogout();
        else setAsLogin();
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
