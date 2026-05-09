// js/admin.js

// 🛑 FIREBASE IMPORTS (Commented out for Hackathon Dummy Demo) 🛑
// import { auth, db } from './firebase.js'; 
// import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('real-login-form');
    const loginError = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // 1. Capture user inputs from the form
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const role = document.getElementById('user-role').value; // Captures 'admin', 'student', or 'alumni'

            // 2. Validate that a role was selected
            if (!role) {
                showError("Please select your access role.");
                return;
            }

            // 3. UI Feedback: Show the user that authentication is happening
            const loginBtn = document.getElementById('login-btn');
            const originalText = loginBtn.innerText;
            loginBtn.innerText = "Verifying Credentials...";
            loginBtn.disabled = true;

            // 4. Simulated Backend Logic (Hackathon Speed Setup)
            // Replace this block with real Firebase Auth when ready to go live
            setTimeout(() => {
                if (email && password) {
                    console.log(`Login successful: Redirecting ${email} as ${role}`);
                    
                    // 5. Role-Based Routing Logic
                    if (role === 'admin') {
                        // Admins go to the project management/mentor panel
                        window.location.href = 'admin.html';
                    } else if (role === 'student') {
                        // Students go to their learning dashboard
                        window.location.href = 'dashboard.html';
                    } else if (role === 'alumni') {
                        // Alumni/Recruiters go to the verified talent pool
                        window.location.href = 'talent.html';
                    }
                } else {
                    showError("Invalid email or password. Please try again.");
                    loginBtn.innerText = originalText;
                    loginBtn.disabled = false;
                }
            }, 1200);
        });
    }

    /**
     * Helper function to display professional error messages
     */
    function showError(message) {
        if (loginError) {
            loginError.innerText = message;
            loginError.style.display = 'block';
            
            // Auto-hide error message after a few seconds
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 4000);
        }
    }
});
