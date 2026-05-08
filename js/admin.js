// js/admin.js
import { db, auth } from './firebase.js'; 
import { collection, addDoc, query, where, getDocs, doc, updateDoc, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js"; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Wait for the HTML to fully load before running scripts
document.addEventListener('DOMContentLoaded', () => {

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

    // ==========================================
    // 3. Mentor Review Panel Logic
    // ==========================================
    const menteeListDiv = document.getElementById('mentee-list');
    const reviewPanel = document.getElementById('review-panel');
    const reviewForm = document.getElementById('mentor-review-form');

    // Wait for the mentor to log in using a reliable state listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadMentees(user.uid);
            loadAlumni(user.uid); // Load the completed students list too!
        } else {
            if (menteeListDiv) menteeListDiv.innerHTML = "<p class='muted'>Please log in to view your students.</p>";
            const alumniListDiv = document.getElementById('alumni-list');
            if (alumniListDiv) alumniListDiv.innerHTML = "<p class='muted'>Please log in.</p>";
        }
    });

    // Fetch Active Students Assigned to this Mentor
    async function loadMentees(mentorUid) {
        if (!menteeListDiv) return;

        try {
            const usersRef = collection(db, "users");
            // Find students who have this user set as their mentor
            const q = query(
                usersRef, 
                where("mentorId", "==", mentorUid)
            );
            
            const snapshot = await getDocs(q);
            menteeListDiv.innerHTML = ""; // Clear loading text

            // We only want to show students who are NOT alumni yet in this specific list
            let activeCount = 0;

            snapshot.forEach(doc => {
                const student = doc.data();
                const studentId = doc.id;
                
                // If they are finished with the course, skip them (they go to the other list)
                if (student.status === "alumni") return; 
                
                activeCount++;

                // Determine current status indicator
                let statusDot = "⚪"; 
                if (student.mentorRating === "ready") statusDot = "🟢";
                if (student.mentorRating === "needs_improvement") statusDot = "🟡";
                if (student.mentorRating === "not_ready") statusDot = "🔴";

                const btn = document.createElement('button');
                btn.className = "btn btn-ghost"; 
                btn.innerHTML = `${statusDot} ${student.name || "Unnamed Student"}`;
                btn.style.cssText = "display: block; width: 100%; text-align: left; margin-bottom: 8px;";
                
                // When clicked, open their profile in the panel
                btn.onclick = () => openReviewPanel(studentId, student);
                menteeListDiv.appendChild(btn);
            });

            if (activeCount === 0) {
                menteeListDiv.innerHTML = "<p class='muted'>You have no active students assigned to you right now.</p>";
            }

        } catch (error) {
            console.error("Error loading mentees:", error);
            if (menteeListDiv) menteeListDiv.innerHTML = "<p style='color: red;'>Error loading active students.</p>";
        }
    }

    // Populate the Right-Side Panel
    function openReviewPanel(studentId, studentData) {
        if (!reviewPanel) return;
        
        // UNHIDE THE PANEL
        reviewPanel.style.display = "block";
        
        // Fill in student info
        document.getElementById('review-student-name').innerText = studentData.name || "Student Profile";
        document.getElementById('review-roadmap').innerText = studentData.roadmapProgress || "0";
        document.getElementById('review-student-id').value = studentId;

        // Set previous review if it exists
        document.getElementById('review-rating').value = studentData.mentorRating || "";
        document.getElementById('review-feedback').value = studentData.mentorFeedback || "";
        
        document.getElementById('review-projects-list').innerHTML = `<li><a href="${studentData.portfolioLink || '#'}" target="_blank" style="color: #4CAF50;">View Live Portfolio</a></li>`;
        
        document.getElementById('review-status-msg').innerText = "";
    }

    // Submit the Review back to Firestore
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusMsg = document.getElementById('review-status-msg');
            
            const studentId = document.getElementById('review-student-id').value;
            const rating = document.getElementById('review-rating').value;
            const feedback = document.getElementById('review-feedback').value;

            try {
                statusMsg.style.color = "#8a2be2"; 
                statusMsg.innerText = "Submitting review...";

                // Update the specific student's document in Firestore
                const studentRef = doc(db, "users", studentId);
                await updateDoc(studentRef, {
                    mentorRating: rating,
                    mentorFeedback: feedback,
                    lastReviewedAt: serverTimestamp()
                });

                statusMsg.style.color = "#4CAF50"; 
                statusMsg.innerText = "✅ Review saved successfully!";
                
                // Reload the active list to update the colored dots!
                loadMentees(auth.currentUser.uid);

            } catch (error) {
                console.error("Error saving review:", error);
                statusMsg.style.color = "red";
                statusMsg.innerText = "❌ Error saving review. Check console.";
            }
        });
    }

    // ==========================================
    // 4. Placement Ready Students Logic
    // ==========================================
    async function loadAlumni(mentorUid) {
        const alumniListDiv = document.getElementById('alumni-list');
        if (!alumniListDiv) return;

        try {
            const usersRef = collection(db, "users");
            
            // Query: Only this mentor's students + Only completed ('alumni') + Sorted by Score & Projects
            const q = query(
                usersRef,
                where("mentorId", "==", mentorUid),
                where("status", "==", "alumni"), // Keeping the database status as 'alumni'
                orderBy("readinessScore", "desc"),
                orderBy("projectCount", "desc")
            );
            
            const snapshot = await getDocs(q);
            alumniListDiv.innerHTML = ""; 

            if (snapshot.empty) {
                alumniListDiv.innerHTML = "<p class='muted'>No students have completed the course under your mentorship yet.</p>";
                return;
            }

            // Render the Completed Student Cards
            snapshot.forEach(doc => {
                const data = doc.data();
                const card = document.createElement('div');
                card.className = "glass"; 
                card.style.cssText = "padding: 15px; border-radius: 8px; border-left: 4px solid #8a2be2;";
                
                card.innerHTML = `
                    <h4 style="margin: 0 0 10px 0; color: white;">${data.name || "Anonymous Student"}</h4>
                    <div style="display: flex; gap: 15px; font-size: 0.9rem; color: #ccc;">
                        <span>🔥 Readiness: <strong style="color: #4CAF50;">${data.readinessScore || 0}</strong></span>
                        <span>📁 Projects: <strong style="color: #4CAF50;">${data.projectCount || 0}</strong></span>
                    </div>
                    <div style="margin-top: 10px;">
                        ${data.linkedIn 
                            ? `<a href="${data.linkedIn}" target="_blank" style="color: #8a2be2; text-decoration: none; font-weight: bold;">🔗 Review LinkedIn Profile</a>` 
                            : '<span class="muted" style="font-size: 0.8rem;">No contact info provided</span>'}
                    </div>
                `;
                alumniListDiv.appendChild(card);
            });

        } catch (error) {
            console.error("Error loading completed students:", error);
            // This error message handles the crucial Firebase Index step!
            alumniListDiv.innerHTML = "<p style='color: #f44336;'>⚠️ Firebase Index Required. Please check your F12 Browser Console for the direct link to build the sorting index.</p>";
        }
    }

});
