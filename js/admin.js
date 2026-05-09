// js/admin.js

// 🛑 FIREBASE IMPORTS COMMENTED OUT FOR DUMMY DEMO 🛑
// import { db, auth } from './firebase.js'; 
// import { collection, addDoc, query, where, getDocs, doc, updateDoc, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js"; 
// import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Wait for the HTML to fully load before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // 🌟 --- DUMMY DATA FOR TESTING --- 🌟
    const dummyMentees = [
        { id: "stu_001", name: "Aarav Sharma", status: "active", mentorRating: "ready", roadmapProgress: "React Fundamentals (80%)", portfolioLink: "portfolio.html?user=stu_001", mentorFeedback: "Great job on the API integration." },
        { id: "stu_002", name: "Piyush Gupta", status: "active", mentorRating: "needs_improvement", roadmapProgress: "JavaScript Basics (45%)", portfolioLink: "portfolio.html?user=stu_002", mentorFeedback: "Focus more on understanding Promises and async/await." },
        { id: "stu_003", name: "Neha Verma", status: "active", mentorRating: "not_ready", roadmapProgress: "HTML & CSS (15%)", portfolioLink: "portfolio.html?user=stu_003", mentorFeedback: "" },
        { id: "stu_004", name: "Kabir Singh", status: "active", mentorRating: "", roadmapProgress: "Node.js Backend (60%)", portfolioLink: "portfolio.html?user=stu_004", mentorFeedback: "" }
    ];

    const dummyAlumni = [
        { id: "alum_001", name: "Ishant Dimri", status: "alumni", readinessScore: 98, projectCount: 6, linkedIn: "https://linkedin.com/" },
        { id: "alum_002", name: "Riya Patel", status: "alumni", readinessScore: 85, projectCount: 4, linkedIn: "https://linkedin.com/" }
    ];
    // 🌟 ------------------------------ 🌟

    // ==========================================
    // 1. Handle Adding Global Tasks
    // ==========================================
    const taskForm = document.getElementById('admin-task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('task-title').value.trim();
            const desc = document.getElementById('task-desc').value.trim();
            
            // Simulate network delay
            setTimeout(() => {
                console.log(`[Mock DB Write] Task Added: ${title}`);
                alert('Global Task added successfully! (Simulated)');
                taskForm.reset();
            }, 500);
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
            
            // Simulate network delay
            setTimeout(() => {
                console.log(`[Mock DB Write] Resource Added: ${title}`);
                alert('Learning Resource added successfully! (Simulated)');
                resourceForm.reset();
            }, 500);
        });
    }

    // ==========================================
    // 3. Mentor Review Panel Logic
    // ==========================================
    const menteeListDiv = document.getElementById('mentee-list');
    const reviewPanel = document.getElementById('review-panel');
    const reviewForm = document.getElementById('mentor-review-form');

    // 🛑 Bypass Firebase Auth for Demo 🛑
    // Normally this waits for user login. We will just load data immediately.
    setTimeout(() => {
        loadMentees('dummy_mentor_123');
        loadAlumni('dummy_mentor_123');
    }, 300);

    // Fetch Active Students Assigned to this Mentor
    async function loadMentees(mentorUid) {
        if (!menteeListDiv) return;
        menteeListDiv.innerHTML = ""; // Clear list

        let activeCount = 0;

        // Loop through Dummy Data instead of Firestore snapshot
        dummyMentees.forEach(student => {
            if (student.status === "alumni") return; 
            
            activeCount++;

            // Determine current status indicator
            let statusDot = "⚪"; 
            if (student.mentorRating === "ready") statusDot = "🟢";
            if (student.mentorRating === "needs_improvement") statusDot = "🟡";
            if (student.mentorRating === "not_ready") statusDot = "🔴";

            const btn = document.createElement('button');
            btn.className = "btn btn-outline"; // Changed to outline for better UI look
            btn.innerHTML = `${statusDot} ${student.name}`;
            btn.style.cssText = "display: block; width: 100%; text-align: left; margin-bottom: 8px; justify-content: flex-start;";
            
            // When clicked, open their profile in the panel
            btn.onclick = () => {
                // Remove active class from all buttons, add to clicked
                Array.from(menteeListDiv.children).forEach(b => b.style.background = "transparent");
                btn.style.background = "rgba(255,255,255,0.1)";
                openReviewPanel(student.id, student);
            };
            menteeListDiv.appendChild(btn);
        });

        if (activeCount === 0) {
            menteeListDiv.innerHTML = "<p class='muted'>You have no active students assigned to you right now.</p>";
        }
    }

    // Populate the Right-Side Panel
    function openReviewPanel(studentId, studentData) {
        if (!reviewPanel) return;
        
        // UNHIDE THE PANEL
        reviewPanel.style.display = "block";
        reviewPanel.classList.remove('hidden'); // Just in case you are using a utility class
        
        // Fill in student info
        document.getElementById('review-student-name').innerText = studentData.name || "Student Profile";
        document.getElementById('review-roadmap').innerText = studentData.roadmapProgress || "0";
        document.getElementById('review-student-id').value = studentId;

        // Set previous review if it exists
        document.getElementById('review-rating').value = studentData.mentorRating || "";
        document.getElementById('review-feedback').value = studentData.mentorFeedback || "";
        
        document.getElementById('review-projects-list').innerHTML = `<li><a href="${studentData.portfolioLink || '#'}" target="_blank" style="color: var(--accent2); text-decoration: none;">View Live Portfolio</a></li>`;
        
        document.getElementById('review-status-msg').innerText = "";
    }

    // Submit the Review back to Firestore (Simulated)
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusMsg = document.getElementById('review-status-msg');
            
            const studentId = document.getElementById('review-student-id').value;
            const rating = document.getElementById('review-rating').value;
            const feedback = document.getElementById('review-feedback').value;

            statusMsg.style.color = "var(--accent1)"; 
            statusMsg.innerText = "Submitting review...";

            // Simulate network delay and update local dummy data
            setTimeout(() => {
                // Find student in dummy array and update them
                const studentIndex = dummyMentees.findIndex(s => s.id === studentId);
                if (studentIndex > -1) {
                    dummyMentees[studentIndex].mentorRating = rating;
                    dummyMentees[studentIndex].mentorFeedback = feedback;
                }

                statusMsg.style.color = "var(--success)"; 
                statusMsg.innerText = "✅ Review saved successfully!";
                
                // Reload the active list to update the colored dots!
                loadMentees('dummy_mentor_123');
            }, 600);
        });
    }

    // ==========================================
    // 4. Placement Ready Students Logic
    // ==========================================
    async function loadAlumni(mentorUid) {
        const alumniListDiv = document.getElementById('alumni-list');
        if (!alumniListDiv) return;

        alumniListDiv.innerHTML = ""; 

        if (dummyAlumni.length === 0) {
            alumniListDiv.innerHTML = "<p class='muted'>No students have completed the course under your mentorship yet.</p>";
            return;
        }

        // Render the Completed Student Cards
        dummyAlumni.forEach(data => {
            const card = document.createElement('div');
            card.className = "glass"; 
            card.style.cssText = "padding: 15px; border-radius: 8px; border-left: 4px solid var(--accent1); margin-bottom: 12px;";
            
            card.innerHTML = `
                <h4 style="margin: 0 0 10px 0; color: white;">${data.name || "Anonymous Student"}</h4>
                <div style="display: flex; gap: 15px; font-size: 0.9rem; color: #ccc;">
                    <span>🔥 Readiness: <strong style="color: var(--success);">${data.readinessScore || 0}</strong></span>
                    <span>📁 Projects: <strong style="color: var(--success);">${data.projectCount || 0}</strong></span>
                </div>
                <div style="margin-top: 10px;">
                    ${data.linkedIn 
                        ? `<a href="${data.linkedIn}" target="_blank" style="color: var(--accent1); text-decoration: none; font-weight: bold;">🔗 Review LinkedIn Profile</a>` 
                        : '<span class="muted" style="font-size: 0.8rem;">No contact info provided</span>'}
                </div>
            `;
            alumniListDiv.appendChild(card);
        });
    }

});
