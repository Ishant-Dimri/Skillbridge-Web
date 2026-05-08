// Make sure this path points correctly to where your firebase.js is located!
import { db, auth } from './firebase.js'; 
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js"; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('post-project-form');
    const statusMessage = document.getElementById('post-status-message');
    
    let currentUser = null;

    // 1. Check if the user is logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
        } else {
            statusMessage.style.color = "red";
            statusMessage.innerText = "Error: You must be logged in to post a project.";
            postForm.querySelector('button').disabled = true; // Disable the button if not logged in
        }
    });

    // 2. Handle the Form Submission
    postForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Stop page from reloading

        if (!currentUser) {
            alert("You must be logged in to post a project!");
            return;
        }

        // Change button text so user knows it's working
        const submitBtn = postForm.querySelector('button');
        submitBtn.innerText = "Posting...";
        submitBtn.disabled = true;

        // Grab the values from the form
        const title = document.getElementById('project-title').value;
        const spots = parseInt(document.getElementById('project-spots').value);
        
        // Turn the comma-separated string into an array, and remove extra spaces
        const rawSkills = document.getElementById('project-skills').value;
        const skillsArray = rawSkills.split(',').map(skill => skill.trim());

        try {
            // Save it to Firestore in the "projects" collection
            await addDoc(collection(db, "projects"), {
                ownerId: currentUser.uid,
                title: title,
                requiredSkills: skillsArray,
                totalSpots: spots,
                filledSpots: 0,
                status: "Open",
                createdAt: serverTimestamp()
            });

            // Success feedback
            statusMessage.style.color = "green";
            statusMessage.innerText = "✅ Project posted successfully! Students can now apply.";
            postForm.reset(); // Clear the form
            
            // Reset button
            submitBtn.innerText = "Post Project";
            submitBtn.disabled = false;

        } catch (error) {
            console.error("Error posting project:", error);
            statusMessage.style.color = "red";
            statusMessage.innerText = "❌ Error posting project. Check the console.";
            submitBtn.innerText = "Post Project";
            submitBtn.disabled = false;
        }
    });
});
