// skillbridge/js/projects.js
// Text-only project renderer with Firestore fallback and robust checks.
// This file is an ES module and expects to be loaded with type="module".

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const { db } = window.fb || { db: null };

// ======= SAMPLE PROJECTS =======
// Text-only entries. Add or edit items here.
const SAMPLE_PROJECTS = [
  {
    title: 'Arduino Obstacle Avoiding Car',
    description: 'A 4WD Arduino-based robot that uses ultrasonic sensors to detect obstacles and navigate autonomously.',
    tech: ['Arduino','Ultrasonic','L298N','C++'],
    link: 'https://github.com/your-username/arduino-car',
    category: 'electrical',
    details: 'Complete build guide, wiring diagrams, and firmware.'
  },
  {
    title: 'Line Follower Robot LFR',
    description: 'A line follower robot using IR sensors and PID control for high-speed track following.',
    tech: ['AVR','IR Sensors','PID'],
    link: 'https://github.com/your-username/lfr',
    category: 'electrical',
    details: 'Includes simulation, hardware BOM, and race performance logs.'
  },
  {
    title: 'Bridge Load Analysis Simulator',
    description: 'Finite element simulation of bridge loads with visualization and safety factor reports.',
    tech: ['FEM','Python','Structural'],
    link: '#',
    category: 'civil',
    details: 'Includes load cases, material models, and design recommendations.'
  },
  {
    title: 'Sales Forecast Dashboard',
    description: 'Time-series forecasting and interactive visualizations built with Plotly.',
    tech: ['Pandas','Prophet','Plotly'],
    link: '#',
    category: 'datascience',
    details: 'Backtesting results and deployment instructions.'
  }
];

// ======= DATA FETCH =======
async function fetchProjects() {
  // If Firestore is not available, return sample projects immediately
  if (!db) {
    console.warn('Firestore not available, using sample projects.');
    return SAMPLE_PROJECTS;
  }

  try {
    const col = collection(db, 'projects');
    const snapshot = await getDocs(col);
    const projects = [];
    snapshot.forEach(doc => projects.push({ id: doc.id, ...doc.data() }));
    // If Firestore returned nothing, fallback to sample projects
    if (!projects.length) return SAMPLE_PROJECTS;
    // Normalize: ensure required fields exist and remove image references
    return projects.map(p => ({
      title: p.title || 'Untitled Project',
      description: p.description || '',
      tech: Array.isArray(p.tech) ? p.tech : (p.tech ? [p.tech] : []),
      link: p.link || '#',
      category: (p.category || 'web').toLowerCase(),
      details: p.details || ''
    }));
  } catch (err) {
    console.warn('Error fetching projects from Firestore:', err && err.message);
    return SAMPLE_PROJECTS;
  }
}

// ======= RENDERING =======
function renderCards(projects = []) {
  const container = document.getElementById('projects-container');
  if (!container) return;
  // remove loading placeholder if present
  const loading = document.getElementById('loading-placeholder');
  if (loading) loading.remove();

  container.innerHTML = '';
  if (!projects || projects.length === 0) {
    container.innerHTML = '<div class="glass" style="grid-column:1/-1;padding:18px;text-align:center;"><strong>No projects found</strong><p class="muted">Add sample projects or seed Firestore.</p></div>';
    return;
  }
  document.addEventListener('DOMContentLoaded', async () => {
  try {
    const projects = await fetchProjects();
    renderCards(projects || []);
  } catch (err) {
    console.error('fetchProjects failed', err);
    renderCards([]); // fallback
  }
});


  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card glass';
    card.dataset.category = (p.category || 'web').toLowerCase();

    // Text-only card markup
    card.innerHTML = `
      <div class="project-body">
        <h4>${escapeHtml(p.title)}</h4>
        <p class="muted">${escapeHtml(truncate(p.description, 220))}</p>
        <div class="meta" style="margin-top:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span class="tech" style="font-size:0.9rem;color:var(--muted)">${escapeHtml((p.tech || []).join('; '))}</span>
          <a class="btn btn-sm btn-primary" href="${p.link || '#'}" target="_blank" rel="noopener">View</a>
          <button class="btn btn-sm btn-ghost details-btn">Details</button>
        </div>
      </div>
    `;

    // Details button opens a simple inline details panel
    const detailsBtn = card.querySelector('.details-btn');
    detailsBtn.addEventListener('click', () => {
      showDetailsInline(card, p);
    });

    container.appendChild(card);
  });

  // Apply current filter if any
  const active = document.querySelector('[data-filter].active');
  const filter = active ? active.dataset.filter : 'all';
  filterProjects(filter);
}

// Inline details panel (text-only)
function showDetailsInline(card, project) {
  // toggle existing details
  const existing = card.querySelector('.project-details');
  if (existing) {
    existing.remove();
    return;
  }
  const details = document.createElement('div');
  details.className = 'project-details';
  details.style.marginTop = '12px';
  details.innerHTML = `
    <div class="glass" style="padding:12px;border-radius:8px">
      <p>${escapeHtml(project.details || project.description || '')}</p>
      <p class="muted small">Category: <strong>${escapeHtml(project.category)}</strong></p>
      <p class="muted small">Tech: <strong>${escapeHtml((project.tech || []).join(', '))}</strong></p>
    </div>
  `;
  card.appendChild(details);
}

// ======= FILTERS =======
function filterProjects(filter) {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(c => {
    if (filter === 'all' || c.dataset.category === filter) c.style.display = '';
    else c.style.display = 'none';
  });
}
window.filterProjects = filterProjects;

// ======= UTILITIES =======
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
function truncate(s, n) { return s && s.length > n ? s.slice(0,n-1) + '…' : s || ''; }

// ======= INIT =======
document.addEventListener('DOMContentLoaded', async () => {
  // Wire filter buttons
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProjects(btn.dataset.filter);
    });
  });

  // Fetch and render
  const projects = await fetchProjects();
  renderCards(projects);
});
