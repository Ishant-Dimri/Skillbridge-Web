// js/portfolio.js
import { app, db } from './firebase.js';
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Dictionary to convert raw skill IDs to readable tags
const skillLabels = {
  html: 'HTML Semantics', css: 'CSS & Flexbox', js: 'JavaScript',
  react: 'React', api: 'REST APIs', testing: 'Unit Testing',
  node: 'Node.js', deploy: 'Cloud Deployment', design: 'System Design',
  python: 'Python', data: 'Data Analysis', models: 'ML Models', nn: 'Neural Networks'
};

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Extract User ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user');

  const loadingState = document.getElementById('loading-state');
  const profileContent = document.getElementById('profile-content');

  if (!userId) {
    loadingState.innerHTML = `<h2 style="color:#ef4444;">Invalid Profile Link</h2>`;
    return;
  }

  try {
    // 2. Fetch User Data
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      loadingState.innerHTML = `<h2 style="color:#ef4444;">Candidate Not Found</h2>`;
      return;
    }

    const userData = userSnap.data();

    // 3. Populate Header & Score
    document.getElementById('user-name').innerText = userData.name || userData.email || 'SkillBridge Candidate';
    document.getElementById('contact-btn').href = `mailto:${userData.email || ''}`;
    
    const score = userData.placementScore || 0;
    document.getElementById('user-score').innerText = `${score}%`;
    document.getElementById('score-fill').style.width = `${score}%`;

    // 4. Populate Skills from 'progress' object
    const skillsContainer = document.getElementById('user-skills');
    const completedProgress = userData.progress || {};
    let skillCount = 0;

    for (const [key, isCompleted] of Object.entries(completedProgress)) {
      if (isCompleted && skillLabels[key]) {
        skillsContainer.innerHTML += `
          <span style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.2); color: #a78bfa; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600;">
            ${skillLabels[key]}
          </span>`;
        skillCount++;
      }
    }
    
    if (skillCount === 0) {
      skillsContainer.innerHTML = '<span class="muted small">Currently building foundational skills...</span>';
    }

    // 5. Fetch User's Specific Projects
    const projectsContainer = document.getElementById('user-projects');
    const q = query(collection(db, 'projects'), where('authorId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      projectsContainer.innerHTML = '<div class="glass" style="grid-column:1/-1; padding:18px; text-align:center;"><p class="muted">No public projects uploaded yet.</p></div>';
    } else {
      querySnapshot.forEach((doc) => {
        const p = doc.data();
        projectsContainer.innerHTML += `
          <div class="project-card glass">
            <div class="project-body">
              <h4>${p.title || 'Untitled'}</h4>
              <p class="muted small">${(p.description || '').substring(0, 150)}...</p>
              <div class="meta" style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
                <span class="tech" style="font-size:0.8rem; color:var(--accent2);">${(p.tech || []).join(' • ')}</span>
              </div>
              <a class="btn btn-sm btn-outline" style="margin-top: 12px; width: 100%; justify-content: center;" href="${p.link || '#'}" target="_blank">View Code / Demo</a>
            </div>
          </div>
        `;
      });
    }

    // Hide loading, show profile
    loadingState.classList.add('hidden');
    profileContent.classList.remove('hidden');

  } catch (error) {
    console.error("Error loading profile:", error);
    loadingState.innerHTML = `<h2 style="color:#ef4444;">Error loading profile data.</h2>`;
  }
});
