// js/login.js

// 🛑 FIREBASE IMPORTS (Commented out for Dummy Demo) 🛑
// import { auth } from './firebase.js'; 
// import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('real-login-form');
    const loginError = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Capture inputs
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const role = document.getElementById('user-role').value; // Get selected role

            if (!role) {
                showError("Please select a role to continue.");
                return;
            }

            // --- SIMULATED LOGIN LOGIC ---
            console.log(`Attempting login for: ${email} as ${role}`);
            
            // Show loading state on button
            const loginBtn = document.getElementById('login-btn');
            const originalText = loginBtn.innerText;
            loginBtn.innerText = "Authenticating...";
            loginBtn.disabled = true;

            // Simulate network delay
            setTimeout(() => {
                // For the Hackathon demo, we accept any credentials
                if (email && password) {
                    console.log("Login Successful (Simulated)");
                    
                    // REDIRECTION LOGIC BASED ON ROLE
                    if (role === 'admin') {
                        window.location.href = 'admin.html';
                    } else if (role === 'student') {
                        window.location.href = 'dashboard.html';
                    } else if (role === 'alumni') {
                        window.location.href = 'talent.html';
                    }
                } else {
                    showError("Invalid email or password.");
                    loginBtn.innerText = originalText;
                    loginBtn.disabled = false;
                }
            }, 1000);
        });
    }

    function showError(message) {
        if (loginError) {
            loginError.innerText = message;
            loginError.style.display = 'block';
            
            // Hide error after 3 seconds
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 3000);
        }
    }
});
