// skillbridge/js/projects.js
// Dual renderer: Live Recruiting Projects (Firestore) + Completed Showcase (Static & Firestore)

import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const { db } = window.fb || { db: null };
const auth = getAuth(); // Need auth to know who is posting/applying

// ======= SAMPLE PROJECTS (Fallback/Showcase) =======
const SAMPLE_PROJECTS = [
  { title: 'Arduino Obstacle Avoiding Car', description: 'A 4WD Arduino-based robot that uses ultrasonic sensors to detect obstacles and navigate autonomously.', tech: ['Arduino','Ultrasonic','L298N','C++'], link: 'https://github.com/your-username/arduino-car', category: 'electrical', details: 'Complete build guide, wiring diagrams, and firmware.' },
  { title: 'Line Follower Robot LFR', description: 'A line follower robot using IR sensors and PID control for high-speed track following.', tech: ['AVR','IR Sensors','PID'], link: 'https://github.com/your-username/lfr', category: 'electrical', details: 'Includes simulation, hardware BOM, and race performance logs.' },
  { title: 'Bridge Load Analysis Simulator', description: 'Finite element simulation of bridge loads with visualization and safety factor reports.', tech: ['FEM','Python','Structural'], link: '#', category: 'civil', details: 'Includes load cases, material models, and design recommendations.' },
  { title: 'Sales Forecast Dashboard', description: 'Time-series forecasting and interactive visualizations built with Plotly.', tech: ['Pandas','Prophet','Plotly'], link: '#', category: 'datascience', details: 'Backtesting results and deployment instructions.' },
  { title: 'SkillBridge Learning Platform', description: 'A student-focused platform featuring a Skill Gap Analyzer and a unique 5% progress decay system with quiz-based recovery.', tech: ['React', 'Firebase', 'Node.js'], link: '#', category: 'web', details: 'Includes user authentication, dynamic roadmaps, and automated progress tracking.' },
  { title: 'Piezoelectric Ghost Power Harvester', description: 'Multidisciplinary engineering hardware-simulation hybrid focusing on energy scavenging using piezoelectric systems and digital twins.', tech: ['Arduino', 'Piezo Sensors', 'MATLAB'], link: '#', category: 'electrical', details: 'Simulates energy capture metrics and hardware efficiency in low-power environments.' },
  { title: 'Campus Resource Coordinator App', description: 'A coordination-based software solution designed to manage and track water and electricity distribution for resource-scarce campus environments.', tech: ['JavaScript', 'Express', 'MongoDB'], link: '#', category: 'environmental', details: 'Replaces assumption of natural water access with a strict digital allocation and tracking system.' },
  { title: 'Seve Perfume E-Commerce SPA', description: 'A modular, single-page web application featuring dynamic routing for home, contact, and cart sections with localized INR currency formatting.', tech: ['HTML5', 'CSS3', 'Vanilla JS'], link: '#', category: 'web', details: 'Focuses on modern UI/UX design principles and seamless state management without heavy frameworks.' },
  { title: 'Heart Connect Emotion Engine', description: 'A mobile application architecture focused on emotion-based matching, including comprehensive growth projections and risk assessments.', tech: ['Flutter', 'Firebase Auth', 'Dart'], link: '#', category: 'mobile', details: 'Includes foundational business logic, user flow diagrams, and backend schema planning.' },
  { title: 'Cinematic 4D Video Generator', description: 'Utilized advanced generative AI models and highly structured prompt engineering to produce 4K cinematic visualizations of the fourth dimension.', tech: ['GenAI Tools', 'Prompt Engineering', 'Video Editing'], link: '#', category: 'ai', details: 'Explores the intersection of generative artificial intelligence and complex theoretical physics visualization.' }
];

// ======= RENDER ONGOING PROJECTS (Hiring Room) =======
async function fetchAndRenderOngoing() {
    const container = document.getElementById('ongoing-projects-container');
    if (!db || !container) return;

    try {
        // QUERY: Fetch ONLY projects marked as "Open"
        const q = query(collection(db, 'projects'), where("status", "==", "Open"), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        container.innerHTML = ''; 

        if (snapshot.empty) {
            container.innerHTML = '<div class="glass" style="grid-column:1/-1;padding:18px;text-align:center;"><p class="muted">No active collaborations right now. Be the first to post one!</p></div>';
            return;
        }

        snapshot.forEach(doc => {
            const p = doc.data();
            const projectId = doc.id;
            
            const spotsAvailable = p.totalSpots - (p.filledSpots || 0);
            const isFull = spotsAvailable <= 0;
            const ownerName = p.ownerName || "SkillBridge Learner";

            const card = document.createElement('div');
            card.className = 'project-card glass';
            
            card.innerHTML = `
                <div class="project-body" style="border-top: 3px solid ${isFull ? '#f44336' : '#8a2be2'}; padding-top: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <h4 style="margin: 0;">${escapeHtml(p.title)}</h4>
                        <span style="background: ${isFull ? "#f44336" : "#4caf50"}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; white-space: nowrap;">${isFull ? "Team Full" : `${spotsAvailable} Spots Open`}</span>
                    </div>
                    
                    <p class="muted small" style="margin-bottom: 10px;">🛠 <strong>Led by:</strong> ${escapeHtml(ownerName)}</p>
                    <p class="muted" style="font-size: 0.9rem;"><strong>Looking for:</strong> ${p.tech ? escapeHtml(p.tech.join(', ')) : 'Various Skills'}</p>
                    
                    <div class="meta" style="margin-top:15px;display:flex;align-items:center;gap:12px;">
                        ${!isFull 
                            ? `<button class="btn btn-sm btn-primary apply-btn" data-id="${projectId}">Apply Anonymously</button>` 
                            : `<button class="btn btn-sm btn-ghost" disabled style="opacity: 0.5;">Applications Closed</button>`
                        }
                    </div>
                </div>
            `;

            // Attach listener for the Apply Modal
            if (!isFull) {
                card.querySelector('.apply-btn').addEventListener('click', () => {
                    document.getElementById('apply-project-id').value = projectId;
                    document.getElementById('modal-apply').style.display = 'flex';
                });
            }

            container.appendChild(card);
        });

    } catch (err) {
        console.error('Error fetching ongoing projects:', err);
        container.innerHTML = '<div class="glass" style="grid-column:1/-1;padding:18px;text-align:center;"><p style="color:red;">Error loading active projects. Did you create the Firebase Index?</p></div>';
    }
}

// ======= RENDER COMPLETED SHOWCASE (Hall of Fame) =======
async function fetchAndRenderCompleted() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    const loading = document.getElementById('loading-placeholder');
    if (loading) loading.remove();
    container.innerHTML = '';

    // 1. Fetch real Firebase projects marked as "Completed"
    if (db) {
        try {
            const q = query(collection(db, 'projects'), where("status", "==", "Completed"), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            
            snapshot.forEach(doc => {
                const p = doc.data();
                createShowcaseCard(p, container, true);
            });
        } catch (err) {
            console.warn("Error fetching completed projects from Firebase:", err);
        }
    }

    // 2. Render the static SAMPLE_PROJECTS below them
    SAMPLE_PROJECTS.forEach(p => createShowcaseCard(p, container, false));

    // Apply current filter if any
    const active = document.querySelector('.filter-row [data-filter].active');
    const filter = active ? active.dataset.filter : 'all';
    filterProjects(filter);
}

// Helper to build the Completed/Showcase Card
function createShowcaseCard(p, container, isRealDatabaseProject) {
    const card = document.createElement('div');
    card.className = 'project-card glass';
    card.dataset.category = (p.category || 'web').toLowerCase();

    // If it's a real completed project from Firebase, show who built it!
    const ownerInfo = isRealDatabaseProject && p.ownerName 
        ? `<p class="muted small" style="margin-bottom: 10px;">🏆 <strong>Built by:</strong> ${escapeHtml(p.ownerName)} & Team</p>` 
        : '';

    card.innerHTML = `
      <div class="project-body">
        <h4>${escapeHtml(p.title)}</h4>
        ${ownerInfo}
        <p class="muted" style="margin-top: 10px;">${escapeHtml(truncate(p.description || "A completed SkillBridge project.", 220))}</p>
        <div class="meta" style="margin-top:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span class="tech" style="font-size:0.9rem;color:var(--muted)">${escapeHtml((p.tech || []).join('; '))}</span>
          ${p.link && p.link !== '#' ? `<a class="btn btn-sm btn-ghost" href="${p.link}" target="_blank" rel="noopener">View Code</a>` : ''}
          <button class="btn btn-sm btn-ghost details-btn">Details</button>
        </div>
      </div>
    `;

    // Details button opens a simple inline details panel
    const detailsBtn = card.querySelector('.details-btn');
    detailsBtn.addEventListener('click', () => showDetailsInline(card, p));

    container.appendChild(card);
}

// ======= FILTERS & UTILITIES =======
function filterProjects(filter) {
  const cards = document.querySelectorAll('#projects-container .project-card');
  cards.forEach(c => {
    if (filter === 'all' || c.dataset.category === filter) c.style.display = '';
    else c.style.display = 'none';
  });
}
window.filterProjects = filterProjects;

function showDetailsInline(card, project) {
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

function escapeHtml(str = '') { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function truncate(s, n) { return s && s.length > n ? s.slice(0,n-1) + '…' : s || ''; }

// ======= INIT & UI LOGIC =======
document.addEventListener('DOMContentLoaded', () => {
    
  // 1. Fetch both lists
  fetchAndRenderOngoing();
  fetchAndRenderCompleted();

  // 2. Tab Switching Logic
  const tabOngoing = document.getElementById('tab-ongoing');
  const tabCompleted = document.getElementById('tab-completed');
  const sectionOngoing = document.getElementById('section-ongoing');
  const sectionCompleted = document.getElementById('section-completed');

  if (tabOngoing && tabCompleted) {
      tabOngoing.addEventListener('click', () => {
          tabOngoing.className = "btn btn-primary";
          tabCompleted.className = "btn btn-ghost";
          sectionOngoing.style.display = "block";
          sectionCompleted.style.display = "none";
      });

      tabCompleted.addEventListener('click', () => {
          tabCompleted.className = "btn btn-primary";
          tabOngoing.className = "btn btn-ghost";
          sectionCompleted.style.display = "block";
          sectionOngoing.style.display = "none";
      });
  }

  // 3. Filter Buttons Logic (applies to the Completed Showcase)
  document.querySelectorAll('.filter-row [data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-row [data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProjects(btn.dataset.filter);
    });
  });

  // 4. Modal Logic
  const modalPost = document.getElementById('modal-post');
  const modalApply = document.getElementById('modal-apply');
  
  if (modalPost) {
      document.getElementById('btn-open-post').addEventListener('click', () => modalPost.style.display = 'flex');
      document.getElementById('close-post').addEventListener('click', () => modalPost.style.display = 'none');
  }
  
  if (modalApply) {
      document.getElementById('close-apply').addEventListener('click', () => modalApply.style.display = 'none');
  }

  // 5. Handle Posting a Project
  const formPostProject = document.getElementById('form-post-project');
  if (formPostProject) {
      formPostProject.addEventListener('submit', async (e) => {
          e.preventDefault();
          const user = auth.currentUser;
          if (!user) return alert("You must be logged in to post a project!");

          try {
              await addDoc(collection(db, "projects"), {
                  ownerId: user.uid,
                  ownerName: user.displayName || "SkillBridge Learner", // Now tracking the owner!
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
              fetchAndRenderOngoing(); // Refresh without reloading page
          } catch (err) {
              console.error("Error posting:", err);
              alert("Failed to post project.");
          }
      });
  }

  // 6. Handle Applying (Blind Audition)
  const formApply = document.getElementById('form-apply');
  if (formApply) {
      formApply.addEventListener('submit', async (e) => {
          e.preventDefault();
          const user = auth.currentUser;
          if (!user) return alert("You must be logged in to apply!");

          try {
              await addDoc(collection(db, "applications"), {
                  projectId: document.getElementById('apply-project-id').value,
                  applicantUid: user.uid,
                  applicantName: user.displayName || "SkillBridge User",
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
  }
});
