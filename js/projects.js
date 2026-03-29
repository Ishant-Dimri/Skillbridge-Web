// projects.js — text‑only project cards (no images)
// Uses Firestore if available, otherwise falls back to SAMPLE_PROJECTS

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const { db } = window.fb || { db: null };

// Sample projects (text only)
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
    title: 'Line Follower Robot (LFR)',
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
  }
  // add more projects here as needed
   {     title: 'Site Planning & GIS Dashboard',     description: 'GIS-based site planning tool for construction sequencing and resource allocation.',     tech: ['GIS','Leaflet','PostGIS'],     link: '#',     category: 'civil',     details: 'Interactive maps, phasing, and resource heatmaps.'   },    // Environmental   {     title: 'Solar Farm Performance Analyzer',     description: 'Monitoring tool that analyzes solar panel output and suggests maintenance windows.',     tech: ['IoT','Python','DataViz'],     link: '#',     category: 'environmental',     details: 'Time-series analysis, anomaly detection, and maintenance scheduling.'   },   {     title: 'Water Quality Monitoring Buoy',     description: 'Low-cost sensors and dashboard for continuous water quality monitoring in rivers.',     tech: ['ESP32','Sensors','MQTT'],     link: '#',     category: 'environmental',     details: 'Includes calibration routines and cloud ingestion pipeline.'   },    // Biomedical   {     title: '3D-Printed Prosthetic Hand',     description: 'Design files, control firmware, and testing results for a low-cost prosthetic hand.',     tech: ['3D Printing','Embedded','Python'],     link: '#',     category: 'biomedical',     details: 'Includes STL files, actuator selection, and EMG control examples.'   },    // Chemical   {     title: 'Batch Reactor Simulator',     description: 'Chemical reactor simulator with kinetics, mass balance, and visualization.',     tech: ['Python','SimPy','NumPy'],     link: '#',     category: 'chemical',     details: 'Parameter sweeps and yield optimization included.'   },    // AI / Data Science   {     title: 'Image Classifier with Explainability',     description: 'CNN model with Grad-CAM visualizations and a web demo for inference.',     tech: ['TensorFlow','Flask','Docker'],          link: '#',     category: 'ai',     details: 'Training logs, model weights, and explainability notebooks.'   },   {     title: 'Sales Forecast Dashboard',     description: 'Time-series forecasting and interactive visualizations built with Plotly.',     tech: ['Pandas','Prophet','Plotly'],         link: '#',     category: 'datascience',     details: 'Backtesting results and deployment instructions.'   },    // Web / Mobile   {     title: 'Portfolio Website (Responsive)',     description: 'A modern portfolio with animations, accessibility, and performance optimizations.',     tech: ['HTML','CSS','JavaScript'],          link: '#',     category: 'web',     details: 'Includes Lighthouse report and accessibility checklist.'   },   {     title: 'Cross-platform Task Manager (Mobile)',     description: 'React Native app with offline sync and push notifications.',     tech: ['React Native','SQLite','Redux'],          link: '#',     category: 'mobile',     details: 'Sync strategy and background sync examples.'   }
];

// Fetch projects from Firestore or fallback
async function fetchProjects() {
  if (!db) {
    console.warn('Firestore not available, using sample projects.');
    return SAMPLE_PROJECTS;
  }
  try {
    const col = collection(db, 'projects');
    const snapshot = await getDocs(col);
    const projects = [];
    snapshot.forEach(doc => projects.push({ id: doc.id, ...doc.data() }));
    return projects.length ? projects : SAMPLE_PROJECTS;
  } catch (err) {
    console.warn('Error fetching projects from Firestore:', err.message);
    return SAMPLE_PROJECTS;
  }
}

// Render text‑only cards
function renderCards(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;
  container.innerHTML = '';
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card glass';
    card.dataset.category = (p.category || 'web').toLowerCase();
    card.innerHTML = `
      <div class="project-body">
        <h4>${escapeHtml(p.title)}</h4>
        <p class="muted">${escapeHtml(truncate(p.description, 160))}</p>
        <div class="meta">
          <span class="tech">${(p.tech || []).join('; ')}</span>
          <a class="btn btn-sm btn-primary" href="${p.link || '#'}" target="_blank">View</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  window.filterProjects && window.filterProjects('all');
}

// Filtering
function filterProjects(filter) {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(c => {
    if (filter === 'all' || c.dataset.category === filter) c.style.display = '';
    else c.style.display = 'none';
  });
}
window.filterProjects = filterProjects;

// Utilities
function escapeHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function truncate(s, n) { return s && s.length > n ? s.slice(0,n-1) + '…' : s || ''; }

// Init
document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProjects(btn.dataset.filter);
    });
  });
  const projects = await fetchProjects();
  renderCards(projects);
});
