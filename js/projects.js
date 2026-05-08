// skillbridge/js/projects.js
// Text-only project renderer with Firestore fallback and robust checks.
// This file is an ES module and expects to be loaded with type="module".

import { collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const { db } = window.fb || { db: null };
const auth = getAuth(); // Need auth to know who is posting/applying

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
  },
  {
        title: 'SkillBridge Learning Platform',
        description: 'A student-focused platform featuring a Skill Gap Analyzer and a unique 5% progress decay system with quiz-based recovery.',
        tech: ['React', 'Firebase', 'Node.js'],
        link: '#',
        category: 'web',
        details: 'Includes user authentication, dynamic roadmaps, and automated progress tracking.'
    },
    {
        title: 'Piezoelectric Ghost Power Harvester',
        description: 'Multidisciplinary engineering hardware-simulation hybrid focusing on energy scavenging using piezoelectric systems and digital twins.',
        tech: ['Arduino', 'Piezo Sensors', 'MATLAB'],
        link: '#',
        category: 'electrical',
        details: 'Simulates energy capture metrics and hardware efficiency in low-power environments.'
    },
    {
        title: 'Campus Resource Coordinator App',
        description: 'A coordination-based software solution designed to manage and track water and electricity distribution for resource-scarce campus environments.',
        tech: ['JavaScript', 'Express', 'MongoDB'],
        link: '#',
        category: 'environmental',
        details: 'Replaces assumption of natural water access with a strict digital allocation and tracking system.'
    },
    {
        title: 'Seve Perfume E-Commerce SPA',
        description: 'A modular, single-page web application featuring dynamic routing for home, contact, and cart sections with localized INR currency formatting.',
        tech: ['HTML5', 'CSS3', 'Vanilla JS'],
        link: '#',
        category: 'web',
        details: 'Focuses on modern UI/UX design principles and seamless state management without heavy frameworks.'
    },
    {
        title: 'Heart Connect Emotion Engine',
        description: 'A mobile application architecture focused on emotion-based matching, including comprehensive growth projections and risk assessments.',
        tech: ['Flutter', 'Firebase Auth', 'Dart'],
        link: '#',
        category: 'mobile',
        details: 'Includes foundational business logic, user flow diagrams, and backend schema planning.'
    },
    {
        title: 'Cinematic 4D Video Generator',
        description: 'Utilized advanced generative AI models and highly structured prompt engineering to produce 4K cinematic visualizations of the fourth dimension.',
        tech: ['GenAI Tools', 'Prompt Engineering', 'Video Editing'],
        link: '#',
        category: 'ai',
        details: 'Explores the intersection of generative artificial intelligence and complex theoretical physics visualization.'
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
   // Text-only card markup with new Apply functionality
    card.innerHTML = `
      <div class="project-body">
        <h4>${escapeHtml(p.title)}</h4>
        <p class="muted">${escapeHtml(truncate(p.description, 220))}</p>
        <div class="meta" style="margin-top:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span class="tech" style="font-size:0.9rem;color:var(--muted)">${escapeHtml((p.tech || []).join('; '))}</span>
          
          ${p.id ? `<button class="btn btn-sm btn-primary apply-btn" data-id="${p.id}">Apply Anonymously</button>` : ''}
          
          <a class="btn btn-sm btn-ghost" href="${p.link || '#'}" target="_blank" rel="noopener">View</a>
          <button class="btn btn-sm btn-ghost details-btn">Details</button>
        </div>
      </div>
    `;

    // Add listener for the Apply button
    const applyBtn = card.querySelector('.apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            document.getElementById('apply-project-id').value = p.id; // Store ID in hidden input
            document.getElementById('modal-apply').style.display = 'flex'; // Open modal
        });
    }

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
// ======= MODAL & BLIND AUDITION LOGIC =======

document.addEventListener('DOMContentLoaded', () => {
    // Modal Selectors
    const modalPost = document.getElementById('modal-post');
    const modalApply = document.getElementById('modal-apply');
    
    // Open Post Modal
    document.getElementById('btn-open-post').addEventListener('click', () => {
        modalPost.style.display = 'flex';
    });

    // Close Modals
    document.getElementById('close-post').addEventListener('click', () => modalPost.style.display = 'none');
    document.getElementById('close-apply').addEventListener('click', () => modalApply.style.display = 'none');

    // Handle Posting a Project
    document.getElementById('form-post-project').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return alert("You must be logged in to post a project!");

        try {
            await addDoc(collection(db, "projects"), {
                ownerId: user.uid,
                title: document.getElementById('post-title').value,
                tech: document.getElementById('post-skills').value.split(',').map(s => s.trim()),
                category: document.getElementById('post-category').value,
                totalSpots: parseInt(document.getElementById('post-spots').value),
                filledSpots: 0,
                status: "Open",
                createdAt: serverTimestamp()
            });
            alert("Project posted successfully!");
            modalPost.style.display = 'none';
            e.target.reset();
            location.reload(); // Quick refresh to show new project
        } catch (err) {
            console.error("Error posting:", err);
            alert("Failed to post project.");
        }
    });

    // Handle Applying to a Project (Blind Audition)
    document.getElementById('form-apply').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return alert("You must be logged in to apply!");

        try {
            await addDoc(collection(db, "applications"), {
                projectId: document.getElementById('apply-project-id').value,
                applicantUid: user.uid,
                applicantName: user.displayName || "SkillBridge User", // Stored but hidden from owner
                branch: document.getElementById('apply-branch').value,
                skills: document.getElementById('apply-skills').value.split(',').map(s => s.trim()),
                pitch: document.getElementById('apply-pitch').value,
                status: "pending",
                appliedAt: serverTimestamp()
            });
            alert("Application submitted anonymously! Good luck.");
            modalApply.style.display = 'none';
            e.target.reset();
        } catch (err) {
            console.error("Error applying:", err);
            alert("Failed to submit application.");
        }
    });
});
