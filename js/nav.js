// js/nav.js
// Handles displaying the correct navbar links based on who is logged in

document.addEventListener('DOMContentLoaded', () => {
    
    // 🌟 DUMMY AUTH STATE FOR TESTING 🌟
    // Change this variable to 'student', 'recruiter', 'admin', or 'logged_out' 
    // to see how the navbar changes instantly!
    const currentUserRole = 'recruiter'; 
    const currentUserName = 'Google HR';

    const studentLinks = document.querySelectorAll('.nav-student');
    const recruiterLinks = document.querySelectorAll('.nav-recruiter');
    const adminLinks = document.querySelectorAll('.nav-admin');
    const authBtn = document.getElementById('nav-auth-btn');

    if (currentUserRole === 'logged_out') {
        // Do nothing, leave secure links hidden, keep "Login" button
        return; 
    }

    // Change "Login" button to "Logout / User Profile"
    authBtn.innerText = `Logout (${currentUserName})`;
    authBtn.classList.remove('btn-outline');
    authBtn.classList.add('btn-ghost');
    authBtn.href = "#"; // You would add your logout logic here later

    // Unhide the correct links based on role
    if (currentUserRole === 'student') {
        studentLinks.forEach(link => link.style.display = 'inline-block');
    } 
    else if (currentUserRole === 'recruiter') {
        recruiterLinks.forEach(link => link.style.display = 'inline-block');
    } 
    else if (currentUserRole === 'admin' || currentUserRole === 'mentor') {
        adminLinks.forEach(link => link.style.display = 'inline-block');
        // Admins usually get to see the talent pool too
        recruiterLinks.forEach(link => link.style.display = 'inline-block'); 
    }
});
