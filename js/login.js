// login.js
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-submit');
  const loginError = document.getElementById('login-error');

  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (loginForm['email']?.value || '').trim();
    const password = loginForm['password']?.value || '';

    if (!email || !password) {
      if (loginError) loginError.textContent = 'Please enter both email and password.';
      return;
    }

    loginBtn.disabled = true;
    const prevText = loginBtn.textContent;
    loginBtn.textContent = 'Signing in...';
    if (loginError) loginError.textContent = '';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in nav.js will update nav UI to Logout automatically
      // Redirect to dashboard or desired page after successful sign-in
      window.location.href = './dashboard.html';
    } catch (err) {
      console.error('Login failed:', err);
      let message = 'Login failed. Please try again.';
      if (err?.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            message = 'Invalid email address.';
            break;
          case 'auth/user-disabled':
            message = 'This account has been disabled.';
            break;
          case 'auth/user-not-found':
            message = 'No account found with this email.';
            break;
          case 'auth/wrong-password':
            message = 'Incorrect password.';
            break;
          case 'auth/too-many-requests':
            message = 'Too many attempts. Try again later.';
            break;
          default:
            message = err.message || message;
        }
      }
      if (loginError) loginError.textContent = message;
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = prevText || 'Secure Login';
    }
  });
});
