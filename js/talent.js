import { db } from './firebase.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const feed = document.getElementById('live-project-feed');
const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));

// REAL-TIME LISTENER: This makes it work for multiple students simultaneously
onSnapshot(q, (snapshot) => {
    if (!feed) return;
    feed.innerHTML = ""; 
    
    snapshot.forEach((doc) => {
        const project = doc.data();
        feed.innerHTML += `
            <div class="glass" style="margin-bottom: 15px; padding: 20px;">
                <div style="display:flex; justify-content:space-between;">
                    <h3 style="color:var(--accent1); margin:0;">${project.title}</h3>
                    <span class="badge">Live Project</span>
                </div>
                <p class="muted small">Submitted by: ${project.studentId.substring(0,6)}...</p>
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <a href="${project.link}" target="_blank" class="btn btn-sm btn-primary">View Code</a>
                    <a href="portfolio.html?user=${project.studentId}" class="btn btn-sm btn-outline">View Student Portfolio</a>
                </div>
            </div>
        `;
    });
});
