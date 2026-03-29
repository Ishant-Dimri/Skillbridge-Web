// projects.js — Fetch and display projects from Firestore and implement filtering
// Uses modular SDK functions where possible

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const { db } = window.fb;

async function fetchProjects() {
  try {
    const col = collection(db, 'projects');
    const snapshot = await getDocs(col);
    const projects = [];
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return projects;
  } catch (err) {
    console.warn('Error fetching projects:', err.message);
    // return sample data if Firestore not configured
    return [
      {
        title: 'Portfolio Website',
        description: 'A personal portfolio built with responsive design and accessible components.',
        tech: ['HTML','CSS','JS'],
        image: 'https://via.placeholder.com/400x220.png?text=Portfolio',
        link: '#',
        category: 'web'
      },
      {
        title: 'Image Classifier',
        description: 'An image classification model deployed as a web demo.',
        tech: ['Python','TensorFlow','Flask'],
        image: 'https://via.placeholder.com/400x220.png?text=AI+Project',
        link: '#',
        category: 'ai'
      }
    ];
  }
}

async function renderAllProjects() {
  const projects = await fetchProjects();
  const container = document.getElementById('projects-container') || document.getElementById('projects-grid') || document.getElementById('projects');
  const grid = document.getElementById('projects-container') || document.getElementById('projects-grid') || document.getElementById('projects');
  const target = document.getElementById('projects-container') || document.getElementById('projects-grid') || document.getElementById('projects');
  if (!target) return;
  target.innerHTML = '';
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card glass';
    card.dataset.category = p.category || 'web';
    card.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/400x220.png?text=Project'}" alt="${p.title}" />
      <div class="project-body">
        <h4>${p.title}</h4>
        <p class="muted">${p.description}</p>
        <div class="meta">
          <span class="tech">${(p.tech || []).join('; ')}</span>
          <a class="btn btn-sm btn-primary" href="${p.link || '#'}" target="_blank">View</a>
        </div>
      </div>
    `;
    target.appendChild(card);
  });
}

window.filterProjects = function(filter) {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(c => {
    if (filter === 'all' || c.dataset.category === filter) {
      c.style.display = '';
    } else {
      c.style.display = 'none';
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  renderAllProjects();
});
