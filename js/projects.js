// skillbridge/js/projects.js
// Fetch and display projects from Firestore; fallback to rich sample projects with Unsplash images.
// Uses Firebase modular SDK (ensure this file is loaded as a module or via your module loader).

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const { db } = window.fb || { db: null };

// Helper: Unsplash query-based image (dynamic, no API key required for simple source)
function unsplash(query, width = 800, height = 450) {
  // Using source.unsplash.com featured query to get relevant images
  // Example: https://source.unsplash.com/featured/?civil-engineering
  return `https://source.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(query)}`;
}

// Rich sample projects across engineering branches
const SAMPLE_PROJECTS = [
  // Web / Frontend
  {
    title: 'Responsive Portfolio Website',
    description: 'A modern portfolio with animations, accessibility, and performance optimizations.',
    tech: ['HTML','CSS','JavaScript'],
    image: unsplash('web design,ui'),
    link: 'https://github.com/sample/portfolio',
    category: 'web'
  },
  {
    title: 'Progressive Web App (PWA) Shop',
    description: 'Offline-capable PWA with service workers, caching strategies, and push notifications.',
    tech: ['PWA','Service Worker','IndexedDB'],
    image: unsplash('progressive web app'),
    link: '#',
    category: 'web'
  },

  // AI / Data Science
  {
    title: 'Image Classifier Demo',
    description: 'A convolutional neural network demo that classifies images and shows model explainability.',
    tech: ['Python','TensorFlow','Flask'],
    image: unsplash('machine learning,ai'),
    link: '#',
    category: 'ai'
  },
  {
    title: 'Sales Forecast Dashboard',
    description: 'Time-series forecasting and interactive visualizations built with Plotly and Flask.',
    tech: ['Python','Pandas','Plotly'],
    image: unsplash('data visualization,analytics'),
    link: '#',
    category: 'datascience'
  },

  // Mobile
  {
    title: 'Cross-platform Task Manager',
    description: 'A React Native app with offline sync and push notifications for task management.',
    tech: ['React Native','SQLite','Redux'],
    image: unsplash('mobile app,ui'),
    link: '#',
    category: 'mobile'
  },

  // Civil Engineering
  {
    title: 'Bridge Load Analysis Simulator',
    description: 'Finite element simulation of bridge loads with visualization and safety factor reports.',
    tech: ['Python','FEM','Matlab'],
    image: unsplash('civil engineering,construction,bridge'),
    link: '#',
    category: 'civil'
  },
  {
    title: 'Site Planning Dashboard',
    description: 'GIS-based site planning tool for construction sequencing and resource allocation.',
    tech: ['GIS','Leaflet','PostGIS'],
    image: unsplash('construction site,aerial'),
    link: '#',
    category: 'civil'
  },

  // Mechanical Engineering
  {
    title: 'CNC Toolpath Visualizer',
    description: 'A tool that converts CAD geometry into optimized CNC toolpaths and simulates machining.',
    tech: ['CNC','CAM','Python'],
    image: unsplash('cnc machine,workshop'),
    link: '#',
    category: 'mechanical'
  },
  {
    title: 'Thermal System Optimizer',
    description: 'Modeling and optimization of heat exchangers for improved efficiency.',
    tech: ['MATLAB','CFD','Optimization'],
    image: unsplash('mechanical engineering,workshop'),
    link: '#',
    category: 'mechanical'
  },

  // Electrical Engineering
  {
    title: 'Smart Grid Monitoring Dashboard',
    description: 'Real-time telemetry, fault detection, and visualization for microgrid systems.',
    tech: ['IoT','MQTT','React'],
    image: unsplash('electrical circuit,grid'),
    link: '#',
    category: 'electrical'
  },
  {
    title: 'PCB Design & Prototype',
    description: 'End-to-end PCB design, fabrication files, and firmware for a sensor node.',
    tech: ['KiCad','C','Embedded'],
    image: unsplash('circuit board,pcb'),
    link: '#',
    category: 'electrical'
  },

  // Chemical Engineering
  {
    title: 'Batch Reactor Simulator',
    description: 'A chemical reactor simulator with kinetics, mass balance, and visualization.',
    tech: ['Python','SimPy','NumPy'],
    image: unsplash('chemical laboratory,beakers'),
    link: '#',
    category: 'chemical'
  },
  {
    title: 'Process Safety Checklist App',
    description: 'A web app for process hazard analysis and safety documentation for plants.',
    tech: ['React','Node.js','MongoDB'],
    image: unsplash('chemical plant,lab'),
    link: '#',
    category: 'chemical'
  },

  // Biomedical Engineering
  {
    title: '3D-Printed Prosthetic Hand',
    description: 'Design files, control firmware, and testing results for a low-cost prosthetic hand.',
    tech: ['3D Printing','Embedded','Python'],
    image: unsplash('prosthetic,biomedical'),
    link: '#',
    category: 'biomedical'
  },
  {
    title: 'Wearable Health Monitor',
    description: 'A wearable device that tracks vitals and streams data to a mobile dashboard.',
    tech: ['Embedded','Bluetooth','Mobile'],
    image: unsplash('wearable device,health'),
    link: '#',
    category: 'biomedical'
  },

  // Environmental Engineering
  {
    title: 'Solar Farm Performance Analyzer',
    description: 'A monitoring tool that analyzes solar panel output and suggests maintenance windows.',
    tech: ['IoT','Python','DataViz'],
    image: unsplash('solar panels,renewable energy'),
    link: '#',
    category: 'environmental'
  },
  {
    title: 'Water Quality Monitoring System',
    description: 'Low-cost sensors and dashboard for continuous water quality monitoring in rivers.',
    tech: ['Sensors','Arduino','React'],
    image: unsplash('water testing,environment'),
    link: '#',
    category: 'environmental'
  },

  // Embedded Systems
  {
    title: 'Autonomous Drone Controller',
    description: 'Flight control firmware, sensor fusion, and mission planning for a quadcopter.',
    tech: ['C++','RTOS','Sensors'],
    image: unsplash('drone,embedded'),
    link: '#',
    category: 'embedded'
  },
  {
    title: 'Smart Home Gateway',
    description: 'Edge gateway that aggregates sensor data and exposes secure APIs for home automation.',
    tech: ['Embedded Linux','MQTT','Docker'],
    image: unsplash('iot device,embedded'),
    link: '#',
    category: 'embedded'
  }
];

// Attempt to fetch projects from Firestore; if fails, return sample projects
async function fetchProjects() {
  if (!db) {
    console.warn('Firestore not available, using sample projects.');
    return SAMPLE_PROJECTS;
  }
  try {
    const col = collection(db, 'projects');
    const snapshot = await getDocs(col);
    const projects = [];
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    // If Firestore has no projects, fallback to sample
    if (projects.length === 0) return SAMPLE_PROJECTS;
    return projects;
  } catch (err) {
    console.warn('Error fetching projects from Firestore:', err.message);
    return SAMPLE_PROJECTS;
  }
}

async function renderAllProjects() {
  const projects = await fetchProjects();
  const target = document.getElementById('projects-container');
  if (!target) return;
  target.innerHTML = '';
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card glass';
    card.dataset.category = (p.category || 'web').toLowerCase();
    const imageSrc = p.image || unsplash(p.category || 'project');
    card.innerHTML = `
      <img src="${imageSrc}" alt="${escapeHtml(p.title)}" />
      <div class="project-body">
        <h4>${escapeHtml(p.title)}</h4>
        <p class="muted">${escapeHtml(p.description)}</p>
        <div class="meta">
          <span class="tech">${(p.tech || []).join('; ')}</span>
          <a class="btn btn-sm btn-primary" href="${p.link || '#'}" target="_blank" rel="noopener">View</a>
        </div>
      </div>
    `;
    target.appendChild(card);
  });
  // ensure filters work after rendering
  window.filterProjects && window.filterProjects('all');
}

// Simple filter function (exposed globally)
function filterProjects(filter) {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(c => {
    if (filter === 'all' || c.dataset.category === filter) {
      c.style.display = '';
    } else {
      c.style.display = 'none';
    }
  });
}
window.filterProjects = filterProjects;

// small helper to avoid XSS in sample text
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderAllProjects();
});
