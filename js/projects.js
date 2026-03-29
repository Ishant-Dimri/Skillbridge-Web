// skillbridge/js/projects.js
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const { db } = window.fb || { db: null };

// Unsplash helper (featured query)
function unsplash(query, w = 1200, h = 700) 
// Rich sample projects per branch
const SAMPLE_PROJECTS = [
  // Electrical
  {
    title: 'Arduino Obstacle Avoiding Car',
    description: 'A 4WD Arduino-based robot that uses ultrasonic sensors to detect obstacles and navigate autonomously. Includes motor driver, battery management, and a small telemetry dashboard.',
    tech: ['Arduino','Ultrasonic','L298N','C++'],
    image:'https://github.com/Ishant-Dimri/Skillbridge-Web/blob/main/aurdinocar.png',
    link: 'https://github.com/Ishant-Dimri/aurdinocar',
    category: 'electrical',
    details: 'Complete build guide, wiring diagrams, and firmware. Learn PID tuning for smooth motion and battery optimization.'
  },
  {
    title: 'Line Follower Robot (LFR) with PID',
    description: 'A line follower robot using IR sensors and PID control for high-speed track following. Includes race-ready tuning and data logging.',
    tech: ['8051/AVR','IR Sensors','PID'],
    image: unsplash('line follower robot'),
    link: '#',
    category: 'electrical',
    details: 'Includes simulation, hardware BOM, and race performance logs.'
  },
  {
    title: 'PCB Prototype & Sensor Node',
    description: 'Design and prototype of a compact PCB for a sensor node (temp, humidity, light) with low-power firmware.',
    tech: ['KiCad','PCB','Embedded C'],
    image: unsplash('pcb prototype'),
    link: '#',
    category: 'electrical',
    details: 'Gerber files, BOM, and firmware for sleep/wake cycles to maximize battery life.'
  },

  // Embedded
  {
    title: 'Autonomous Quadcopter Controller',
    description: 'Flight controller firmware with sensor fusion (IMU + barometer) and mission planning.',
    tech: ['C++','RTOS','Sensors'],
    image: unsplash('drone embedded'),
    link: '#',
    category: 'embedded',
    details: 'Includes PID tuning, telemetry, and safety failsafes.'
  },
  {
    title: 'Smart Home Gateway (Edge)',
    description: 'Edge gateway aggregating sensor data and exposing secure APIs for home automation.',
    tech: ['Embedded Linux','MQTT','Docker'],
    image: unsplash('iot device embedded'),
    link: '#',
    category: 'embedded',
    details: 'Edge processing, local rules engine, and secure remote access.'
  },

  // Mechanical
  {
    title: 'CNC Toolpath Visualizer',
    description: 'Converts CAD geometry into optimized CNC toolpaths and simulates machining.',
    tech: ['CAM','Python','G-code'],
    image: unsplash('cnc machine workshop'),
    link: '#',
    category: 'mechanical',
    details: 'Includes collision detection and feedrate optimization.'
  },
  {
    title: 'Thermal System Optimizer',
    description: 'Modeling and optimization of heat exchangers for improved efficiency.',
    tech: ['CFD','MATLAB','Optimization'],
    image: unsplash('mechanical engineering'),
    link: '#',
    category: 'mechanical',
    details: 'Parametric studies and performance charts included.'
  },

  // Civil
  {
    title: 'Bridge Load Analysis Simulator',
    description: 'Finite element simulation of bridge loads with visualization and safety factor reports.',
    tech: ['FEM','Python','Structural'],
    image: unsplash('bridge construction'),
    link: '#',
    category: 'civil',
    details: 'Includes load cases, material models, and design recommendations.'
  },
  {
    title: 'Site Planning & GIS Dashboard',
    description: 'GIS-based site planning tool for construction sequencing and resource allocation.',
    tech: ['GIS','Leaflet','PostGIS'],
    image: unsplash('construction site aerial'),
    link: '#',
    category: 'civil',
    details: 'Interactive maps, phasing, and resource heatmaps.'
  },

  // Environmental
  {
    title: 'Solar Farm Performance Analyzer',
    description: 'Monitoring tool that analyzes solar panel output and suggests maintenance windows.',
    tech: ['IoT','Python','DataViz'],
    image: unsplash('solar panels'),
    link: '#',
    category: 'environmental',
    details: 'Time-series analysis, anomaly detection, and maintenance scheduling.'
  },
  {
    title: 'Water Quality Monitoring Buoy',
    description: 'Low-cost sensors and dashboard for continuous water quality monitoring in rivers.',
    tech: ['ESP32','Sensors','MQTT'],
    image: unsplash('water quality monitoring'),
    link: '#',
    category: 'environmental',
    details: 'Includes calibration routines and cloud ingestion pipeline.'
  },

  // Biomedical
  {
    title: '3D-Printed Prosthetic Hand',
    description: 'Design files, control firmware, and testing results for a low-cost prosthetic hand.',
    tech: ['3D Printing','Embedded','Python'],
    image: unsplash('prosthetic hand'),
    link: '#',
    category: 'biomedical',
    details: 'Includes STL files, actuator selection, and EMG control examples.'
  },

  // Chemical
  {
    title: 'Batch Reactor Simulator',
    description: 'Chemical reactor simulator with kinetics, mass balance, and visualization.',
    tech: ['Python','SimPy','NumPy'],
    image: unsplash('chemical laboratory'),
    link: '#',
    category: 'chemical',
    details: 'Parameter sweeps and yield optimization included.'
  },

  // AI / Data Science
  {
    title: 'Image Classifier with Explainability',
    description: 'CNN model with Grad-CAM visualizations and a web demo for inference.',
    tech: ['TensorFlow','Flask','Docker'],
    image: unsplash('machine learning ai'),
    link: '#',
    category: 'ai',
    details: 'Training logs, model weights, and explainability notebooks.'
  },
  {
    title: 'Sales Forecast Dashboard',
    description: 'Time-series forecasting and interactive visualizations built with Plotly.',
    tech: ['Pandas','Prophet','Plotly'],
    image: unsplash('data visualization analytics'),
    link: '#',
    category: 'datascience',
    details: 'Backtesting results and deployment instructions.'
  },

  // Web / Mobile
  {
    title: 'Portfolio Website (Responsive)',
    description: 'A modern portfolio with animations, accessibility, and performance optimizations.',
    tech: ['HTML','CSS','JavaScript'],
    image: unsplash('web design ui'),
    link: '#',
    category: 'web',
    details: 'Includes Lighthouse report and accessibility checklist.'
  },
  {
    title: 'Cross-platform Task Manager (Mobile)',
    description: 'React Native app with offline sync and push notifications.',
    tech: ['React Native','SQLite','Redux'],
    image: unsplash('mobile app ui'),
    link: '#',
    category: 'mobile',
    details: 'Sync strategy and background sync examples.'
  }
];

// Fetch projects from Firestore or fallback to sample
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

// Render cards
function renderCards(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;
  container.innerHTML = '';
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card glass';
    card.dataset.category = (p.category || 'web').toLowerCase();
    const img = p.image || unsplash(p.category || 'project');
    card.innerHTML = `
      <img src="${img}" alt="${escapeHtml(p.title)}" />
      <div class="project-body">
        <h4>${escapeHtml(p.title)}</h4>
        <p class="muted">${escapeHtml(truncate(p.description, 140))}</p>
        <div class="meta">
          <span class="tech">${(p.tech || []).join('; ')}</span>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-primary view-btn">View</button>
            <a class="btn btn-sm btn-outline" href="${p.link || '#'}" target="_blank" rel="noopener">Code</a>
          </div>
        </div>
      </div>
    `;
    // attach project data for modal
    card.querySelector('.view-btn').addEventListener('click', () => openModal(p));
    container.appendChild(card);
  });
  // ensure filters apply
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

// Modal logic
function openModal(project) {
  const modal = document.getElementById('project-modal');
  const content = document.getElementById('modal-content');
  modal.classList.remove('hidden');
  const image = project.image || unsplash(project.category || 'project', 1600, 900);
  content.innerHTML = `
    <h2 style="margin-top:0">${escapeHtml(project.title)}</h2>
    <img src="${image}" alt="${escapeHtml(project.title)}" />
    <div class="modal-body">
      <div>
        <p class="muted">${escapeHtml(project.description)}</p>
        <p>${escapeHtml(project.details || '')}</p>
        <p class="muted small">Category: <strong>${escapeHtml(project.category)}</strong></p>
        <p class="muted small">Tech stack: <strong>${(project.tech || []).join(', ')}</strong></p>
        <div style="margin-top:12px">
          <a class="btn btn-primary" href="${project.link || '#'}" target="_blank" rel="noopener">Open Code / Demo</a>
        </div>
      </div>
      <aside class="meta-list">
        <div class="chip"><strong>Author</strong><div class="muted small">Community contributor</div></div>
        <div class="chip"><strong>Created</strong><div class="muted small">${project.createdAt || '2026'}</div></div>
        <div class="chip"><strong>Tags</strong><div class="muted small">${(project.tech || []).join('; ')}</div></div>
      </aside>
    </div>
  `;
}

// Modal close handlers
function closeModal() {
  const modal = document.getElementById('project-modal');
  modal.classList.add('hidden');
}

// Utilities
function escapeHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function truncate(s, n) { return s && s.length > n ? s.slice(0,n-1) + '…' : s || ''; }

// Init
document.addEventListener('DOMContentLoaded', async () => {
  // wire filter buttons
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      filterProjects(f);
    });
  });

  // modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);

  const projects = await fetchProjects();
  renderCards(projects);
});
