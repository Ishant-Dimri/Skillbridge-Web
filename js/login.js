// js/nav.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const studentLinks = document.querySelectorAll('.nav-student');
    const recruiterLinks = document.querySelectorAll('.nav-recruiter');
    const adminLinks = document.querySelectorAll('.nav-admin');
    const authBtn = document.getElementById('nav-auth-btn');

    // Real-Time Firebase Auth Listener
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is logged in! Fetch their role.
            const userDoc = await getDoc(doc(db, "users", user.uid));
            let role = "student"; // Default fallback
            
            if (userDoc.exists()) {
                role = userDoc.data().role;
            }

            // Update Auth Button to Logout
            authBtn.innerText = `Logout`;
            authBtn.classList.remove('btn-outline');
            authBtn.classList.add('btn-ghost');
            authBtn.href = "#"; 
            
            // Handle Real Logout
            authBtn.onclick = (e) => {
                e.preventDefault();
                signOut(auth).then(() => {
                    window.location.href = 'index.html';
                });
            };

            // Unhide correct links based on real database role
            if (role === 'student') {
                studentLinks.forEach(link => link.style.display = 'inline-block');
            } else if (role === 'recruiter') {
                recruiterLinks.forEach(link => link.style.display = 'inline-block');
            } else if (role === 'admin' || role === 'mentor') {
                adminLinks.forEach(link => link.style.display = 'inline-block');
                recruiterLinks.forEach(link => link.style.display = 'inline-block'); 
            }

        } else {
            // User is logged out. Keep UI locked down.
            studentLinks.forEach(link => link.style.display = 'none');
            recruiterLinks.forEach(link => link.style.display = 'none');
            adminLinks.forEach(link => link.style.display = 'none');
            
            authBtn.innerText = "Login";
            authBtn.href = "login.html";
            authBtn.classList.add('btn-outline');
            authBtn.classList.remove('btn-ghost');
        }
    });
});
