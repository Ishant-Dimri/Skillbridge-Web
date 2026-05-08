// admin.js — Admin actions: add tasks, resources
// Uses Firestore to store admin-created tasks and resources

import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const { db } = window.fb;

// ==========================================
// 1. Handle Adding Global Tasks
// ==========================================
const taskForm = document.getElementById('admin-task-form');
if (taskForm) {
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    
    try {
      await addDoc(collection(db, 'tasks'), {
        title: title,
        description: desc,
        createdAt: new Date().toISOString()
      });
      alert('Global Task added successfully!');
      taskForm.reset();
    } catch (err) {
      console.error("Error adding task:", err);
      alert('Error adding task: ' + err.message);
    }
  });
}

// ==========================================
// 2. Handle Adding Learning Resources
// ==========================================
const resourceForm = document.getElementById('admin-resource-form');
if (resourceForm) {
  resourceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('resource-title').value.trim();
    const link = document.getElementById('resource-link').value.trim();
    
    try {
      await addDoc(collection(db, 'resources'), {
        title: title,
        link: link,
        createdAt: new Date().toISOString()
      });
      alert('Learning Resource added successfully!');
      resourceForm.reset();
    } catch (err) {
      console.error("Error adding resource:", err);
      alert('Error adding resource: ' + err.message);
    }
  });
}

import { db, auth } from './firebase.js'; 
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore"; 

const menteeListDiv = document.getElementById('mentee-list');
const reviewPanel = document.getElementById('review-panel');
const reviewForm = document.getElementById('mentor-review-form');

// Wait for the mentor to log in
document.addEventListener('DOMContentLoaded', () => {
    // We need to wait for Firebase auth to initialize
    setTimeout(() => {
        const user = auth.currentUser;
        if (user) {
            loadMentees(user.uid);
        } else {
            menteeListDiv.innerHTML = "<p>Please log in to view your students.</p>";
        }
    }, 1000); 
});

// 1. Fetch Students Assigned to this Mentor
async function loadMentees(mentorUid) {
    try {
        const usersRef = collection(db, "users");
        // Find students who have this user set as their mentor
        const q = query(usersRef, where("mentorId", "==", mentorUid));
        const snapshot = await getDocs(q);

        menteeListDiv.innerHTML = ""; // Clear loading text

        if (snapshot.empty) {
            menteeListDiv.innerHTML = "<p>You have no students assigned to you yet.</p>";
            return;
        }

        snapshot.forEach(doc => {
            const student = doc.data();
            const studentId = doc.id;
            
            // Determine current status indicator
            let statusDot = "⚪"; // Default unreviewed
            if (student.mentorRating === "ready") statusDot = "🟢";
            if (student.mentorRating === "needs_improvement") statusDot = "🟡";
            if (student.mentorRating === "not_ready") statusDot = "🔴";

            const btn = document.createElement('button');
            btn.innerHTML = `${statusDot} ${student.name || "Unnamed Student"}`;
            btn.style.cssText = "display: block; width: 100%; text-align: left; margin-bottom: 5px; padding: 10px;";
            
            // When clicked, open their profile in the panel
            btn.onclick = () => openReviewPanel(studentId, student);
            menteeListDiv.appendChild(btn);
        });
    } catch (error) {
        console.error("Error loading mentees:", error);
    }
}

// 2. Populate the Right-Side Panel
function openReviewPanel(studentId, studentData) {
    reviewPanel.style.display = "block";
    
    // Fill in student info
    document.getElementById('review-student-name').innerText = studentData.name || "Student Profile";
    document.getElementById('review-roadmap').innerText = studentData.roadmapProgress || "0";
    document.getElementById('review-student-id').value = studentId;

    // Set previous review if it exists
    document.getElementById('review-rating').value = studentData.mentorRating || "";
    document.getElementById('review-feedback').value = studentData.mentorFeedback || "";
    
    // (Optional) If you have a separate 'projects' collection, you would fetch those here
    // based on the studentId and list them in 'review-projects-list'
    document.getElementById('review-projects-list').innerHTML = `<li><a href="${studentData.portfolioLink || '#'}" target="_blank">View Live Portfolio</a></li>`;
    
    document.getElementById('review-status-msg').innerText = "";
}

// 3. Submit the Review back to Firestore
reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('review-status-msg');
    
    const studentId = document.getElementById('review-student-id').value;
    const rating = document.getElementById('review-rating').value;
    const feedback = document.getElementById('review-feedback').value;

    try {
        statusMsg.style.color = "blue";
        statusMsg.innerText = "Submitting review...";

        // Update the specific student's document in Firestore
        const studentRef = doc(db, "users", studentId);
        await updateDoc(studentRef, {
            mentorRating: rating,
            mentorFeedback: feedback,
            lastReviewedAt: serverTimestamp()
        });

        statusMsg.style.color = "green";
        statusMsg.innerText = "Review saved successfully! Student will see this on their dashboard.";
        
        // Reload the list to update the colored dots!
        loadMentees(auth.currentUser.uid);

    } catch (error) {
        console.error("Error saving review:", error);
        statusMsg.style.color = "red";
        statusMsg.innerText = "Error saving review. Check console.";
    }
});
