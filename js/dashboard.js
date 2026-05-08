// dashboard.js — Populate dashboard data, compute progress and placement score
// Requires firebase.js and auth.js to be loaded
import { collection, query, where, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
// (Keep whatever other imports you already have like getDoc, etc.)
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const { auth, db } = window.fb;

const defaultTasks = [
  { id: 't1', title: 'Complete Beginner Module: HTML', points: 10 },
  { id: 't2', title: 'Build a small project', points: 20 },
  { id: 't3', title: 'Mock interview practice', points: 15 }
];

function renderTasks(tasks, completed = {}) {
  const list = document.getElementById('tasks-list');
  if (!list) return;
  list.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.innerHTML = `<strong>${t.title}</strong><div class="muted small">Points: ${t.points}</div>`;
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!completed[t.id];
    cb.addEventListener('change', async () => {
      completed[t.id] = cb.checked;
      await saveProgress(completed);
      computePlacementScore(completed);
    });
    li.appendChild(left);
    li.appendChild(cb);
    list.appendChild(li);
  });
}

async function saveProgress(completed) {
  const user = auth.currentUser;
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  try {
    await updateDoc(userRef, { progress: completed });
  } catch (err) {
    console.warn('Could not save progress:', err.message);
  }
}

function computePlacementScore(completed) {
  // simple algorithm: sum points of completed tasks, normalize to 100
  let score = 0;
  defaultTasks.forEach(t => {
    if (completed[t.id]) score += t.points;
  });
  const max = defaultTasks.reduce((s, t) => s + t.points, 0);
  const percent = Math.round((score / max) * 100);
  const placementEl = document.getElementById('placement-score');
  const progressFill = document.getElementById('progress-fill');
  const progressPercent = document.getElementById('progress-percent');
  if (placementEl) placementEl.innerText = `${percent}`;
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressPercent) progressPercent.innerText = `${percent}%`;
  // update user doc
  if (auth.currentUser) {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    updateDoc(userRef, { placementScore: percent }).catch(() => {});
  }
}

function renderProjectsPreview(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';
  projects.slice(0,6).forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card glass';
    card.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/400x220.png?text=Project'}" alt="${p.title}" />
      <div class="project-body">
        <h4>${p.title}</h4>
        <p class="muted">${p.description.substring(0,120)}...</p>
        <div class="meta">
          <span class="tech">${(p.tech || []).join('; ')}</span>
          <a class="btn btn-sm btn-primary" href="${p.link || '#'}" target="_blank">View</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Load user data and projects
onAuthStateChanged(auth, async (user) => {window.fetchMyProjectApplications(user.uid);}
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
 const data = snap.exists() ? snap.data() : {};
  const completed = data.progress || {};
  renderTasks(defaultTasks, completed);
  computePlacementScore(completed);
  // Grab the button
const portfolioBtn = document.getElementById('portfolio-link-btn');

if (portfolioBtn && user) {
    portfolioBtn.onclick = (event) => {
        event.preventDefault(); // Stop the '#' from jumping the page
        
        // Open the portfolio in a new tab with your exact ID!
        window.open(`portfolio.html?user=${user.uid}`, '_blank');
    };
}
  renderSkillGapAnalyzer(completed); // <--- ADD THIS LINE
  // fetch projects (simple Firestore query)
  try {
    const projectsSnap = await window.fb.db.collection ? window.fb.db.collection('projects').get() : null;
    // If using modular SDK, the above won't work in this environment; projects.js will handle fetching.
  } catch (err) {
    // ignore — projects.js will populate projects
  }
});
// ==========================================
// SKILL GAP ANALYZER LOGIC
// ==========================================

const roleRequirements = {
  'web': {
    name: 'Full-Stack Web Developer',
    skills: [
      { id: 'html', name: 'HTML Semantics' },
      { id: 'css', name: 'CSS & Flexbox' },
      { id: 'js', name: 'JavaScript Basics' },
      { id: 'react', name: 'React Fundamentals' },
      { id: 'api', name: 'API Integration' },
      { id: 'testing', name: 'Unit Testing' },
      { id: 'node', name: 'Node.js & Express' },
      { id: 'deploy', name: 'Deployment & Scaling' },
      { id: 'design', name: 'System Design' }
    ]
  },
  'ai': {
    name: 'AI / Machine Learning Engineer',
    skills: [
      { id: 'python', name: 'Python for Data Science' },
      { id: 'data', name: 'Data Cleaning' },
      { id: 'models', name: 'Regression & Classification' },
      { id: 'validation', name: 'Model Validation' },
      { id: 'nn', name: 'Neural Networks' },
      { id: 'mlops', name: 'MLOps Basics' }
    ]
  }
};

// Expose globally so roadmap.html buttons can update progress
window.markTopicComplete = async function(track, level, topicId) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to save progress.");
    return;
  }
  
  const userRef = doc(db, 'users', user.uid);
  try {
    // We update a specific nested key in the progress object
    await updateDoc(userRef, { [`progress.${topicId}`]: true });
    
    // Fetch fresh data to re-render UI
    const snap = await getDoc(userRef);
    if(snap.exists()) {
      const freshData = snap.data().progress || {};
      renderSkillGapAnalyzer(freshData); // Refresh Analyzer
      computePlacementScore(freshData);  // Refresh Dashboard Score
    }
  } catch (err) {
    console.error("Failed to mark complete:", err);
  }
};

export function renderSkillGapAnalyzer(completed) {
  const selectEl = document.getElementById('target-role');
  const resultsEl = document.getElementById('gap-results');
  
  // Safe exit if we are on a page without the analyzer (like dashboard.html)
  if (!selectEl || !resultsEl) return;

  function updateUI() {
    const roleKey = selectEl.value;
    
    if (!roleKey) {
      resultsEl.classList.add('hidden');
      return;
    }
    
    resultsEl.classList.remove('hidden');
    const role = roleRequirements[roleKey];
    const required = role.skills;
    
    // Check which required skills are marked true in the 'completed' object
    const acquiredSkills = required.filter(s => completed[s.id]);
    const missingSkills = required.filter(s => !completed[s.id]);
    
    const percentage = required.length === 0 ? 0 : Math.round((acquiredSkills.length / required.length) * 100);

    resultsEl.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span class="muted">Readiness Percentage</span>
          <span style="font-weight:800; font-size: 18px; color: var(--accent2);">${percentage}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%; background: linear-gradient(90deg, var(--accent1), var(--accent2));"></div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px;">
        <!-- Acquired Skills -->
        <div class="glass" style="background: rgba(16, 185, 129, 0.03); border-color: rgba(16, 185, 129, 0.1);">
          <h4 style="margin-top:0; color:#10b981;"><i class="fa-solid fa-check-circle"></i> Acquired</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
            ${acquiredSkills.length ? acquiredSkills.map(s => 
              `<span style="color:#10b981; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); padding:4px 10px; border-radius:8px; font-size: 12px;">✓ ${s.name}</span>`
            ).join('') : '<span class="muted small">Start completing roadmap topics!</span>'}
          </div>
        </div>

        <!-- Missing Skills -->
        <div class="glass" style="background: rgba(239, 68, 68, 0.03); border-color: rgba(239, 68, 68, 0.1);">
          <h4 style="margin-top:0; color:#ef4444;"><i class="fa-solid fa-xmark-circle"></i> Missing</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
            ${missingSkills.length ? missingSkills.map(s => 
              `<span style="color:#ef4444; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); padding:4px 10px; border-radius:8px; font-size: 12px;">× ${s.name}</span>`
            ).join('') : '<span class="muted small" style="color:#10b981;">You have mastered this role!</span>'}
          </div>
        </div>
      </div>

      <!-- Action Item -->
      <div class="glass" style="margin-top: 18px; border-left: 4px solid var(--accent1);">
        <h4 style="margin: 0 0 4px 0;">Recommended Next Step</h4>
        <p class="small muted" style="margin:0;">
          ${missingSkills.length > 0 
            ? `To increase your readiness, return to your roadmap and complete the module for <strong>${missingSkills[0].name}</strong>.` 
            : `You are 100% placement ready for ${role.name}! Update your public portfolio.`}
        </p>
      </div>
    `;
  }

  selectEl.removeEventListener('change', updateUI);
  selectEl.addEventListener('change', updateUI);
  updateUI();
}
// ==========================================
// PEER-TO-PEER: Review Blind Auditions
// ==========================================
const appsContainer = document.getElementById('my-applications-list');

// We will call this function inside your existing onAuthStateChanged block!
window.fetchMyProjectApplications = async function(userUid) {
    if (!appsContainer) return;
    appsContainer.innerHTML = "<p>Scanning for your projects...</p>";
    
    try {
        // Find projects created by this specific user
        const qProjects = query(collection(db, "projects"), where("ownerId", "==", userUid));
        const projectsSnap = await getDocs(qProjects);
        
        const projectMap = {}; // Store { projectId: "Project Title" }
        projectsSnap.forEach(doc => { projectMap[doc.id] = doc.data().title; });

        if (Object.keys(projectMap).length === 0) {
            appsContainer.innerHTML = "<p class='muted'>You haven't posted any projects looking for teammates yet.</p>";
            return;
        }

        // Find applications that belong to this user's projects
        appsContainer.innerHTML = ""; 
        let foundApps = false;

        for (const projectId of Object.keys(projectMap)) {
            const qApps = query(collection(db, "applications"), where("projectId", "==", projectId));
            const appsSnap = await getDocs(qApps);

            appsSnap.forEach(appDoc => {
                foundApps = true;
                renderApplicationCard(appDoc.id, appDoc.data(), projectMap[projectId]);
            });
        }

        if (!foundApps) {
            appsContainer.innerHTML = "<p class='muted'>No applications received yet. Check back later!</p>";
        }

    } catch (error) {
        console.error("Error fetching applications:", error);
        appsContainer.innerHTML = "<p style='color:red;'>Failed to load applications.</p>";
    }
}

function renderApplicationCard(appId, appData, projectTitle) {
    const card = document.createElement('div');
    card.className = "application-card glass"; // Reusing your glass style!
    card.style.padding = "20px";
    card.style.borderRadius = "8px";
    card.style.border = "1px solid rgba(255,255,255,0.1)";

    const isPending = appData.status === "pending";
    const displayName = isPending ? "🕵️ Anonymous Candidate" : `✅ ${appData.applicantName}`;
    const badgeColor = isPending ? "#ff9800" : "#4caf50";
    const badgeText = isPending ? "Awaiting Review" : "Accepted";

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px;">
            <h4 style="margin:0;">${displayName}</h4>
            <span style="background: ${badgeColor}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">${badgeText}</span>
        </div>
        <p class="muted small" style="margin-bottom: 10px;">Applying for: <strong>${projectTitle}</strong></p>
        
        <p><strong>Branch:</strong> ${appData.branch}</p>
        <p><strong>Skills:</strong> ${appData.skills.join(', ')}</p>
        <p><strong>Pitch:</strong> "${appData.pitch}"</p>
        
        <div style="margin-top: 15px;">
            ${isPending 
                ? `<button class="btn btn-primary btn-sm accept-btn">Accept Candidate</button>` 
                : `<p style="color: #4caf50; font-weight: bold;">Identity revealed! You can now contact this teammate.</p>`
            }
        </div>
    `;

    if (isPending) {
        card.querySelector('.accept-btn').addEventListener('click', () => acceptTeammate(appId, appData.projectId));
    }

    appsContainer.appendChild(card);
}

async function acceptTeammate(appId, projectId) {
    if (!confirm("Accept this teammate? This will reveal their identity and take up a spot in your project.")) return;

    try {
        await updateDoc(doc(db, "applications", appId), { status: "accepted" });
        await updateDoc(doc(db, "projects", projectId), { filledSpots: increment(1) });
        
        alert("Teammate accepted! Identity revealed.");
        
        // Refresh the list
        const user = auth.currentUser;
        if (user) window.fetchMyProjectApplications(user.uid);

    } catch (error) {
        console.error("Error accepting teammate:", error);
        alert("Something went wrong.");
    }
}

