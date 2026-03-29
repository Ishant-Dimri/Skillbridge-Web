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

  // fetch projects (simple Firestore query)
  try {
    const projectsSnap = await window.fb.db.collection ? window.fb.db.collection('projects').get() : null;
    // If using modular SDK, the above won't work in this environment; projects.js will handle fetching.
  } catch (err) {
    // ignore — projects.js will populate projects
  }
});
