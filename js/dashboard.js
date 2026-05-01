// dashboard.js — Populate dashboard data, compute progress and placement score
// Requires firebase.js and auth.js to be loaded

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
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
 const data = snap.exists() ? snap.data() : {};
  const completed = data.progress || {};
  renderTasks(defaultTasks, completed);
  computePlacementScore(completed);
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
// THE ALERT TEST
document.addEventListener('DOMContentLoaded', () => {
    const portfolioBtn = document.getElementById('portfolio-link-btn');
    
    if (portfolioBtn) {
        portfolioBtn.addEventListener('click', (event) => {
            event.preventDefault(); 
            alert("The button is successfully wired to the JavaScript!");
            console.log("Current User Status:", auth.currentUser);
        });
    } else {
        console.error("JavaScript cannot find the button ID!");
    }
});

