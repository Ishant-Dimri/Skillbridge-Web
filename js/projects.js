// js/projects.js
// Dual renderer: Live Recruiting Projects + Completed Showcase (WITH DUMMY DATA & UPVOTES)

import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const { db } = window.fb || { db: null };
const auth = getAuth();

// ======= 🌟 DUMMY ONGOING PROJECTS (Hiring Room) 🌟 =======
const DUMMY_ONGOING_PROJECTS = [
    { id: 'ong_1', title: 'SkillBridge Backend Microservices', ownerName: 'Aman Gupta', tech: ['Node.js', 'Firebase', 'Express'], category: 'web', totalSpots: 3, filledSpots: 1, upvotes: 14 },
    { id: 'ong_2', title: 'Autonomous Drone Navigation System', ownerName: 'Riya Sharma', tech: ['Python', 'ROS', 'Computer Vision'], category: 'ai', totalSpots: 4, filledSpots: 4, upvotes: 32 }, // Team Full Demo
    { id: 'ong_3', title: 'Campus Smart Grid IoT Simulator', ownerName: 'Karan Singh', tech: ['Arduino', 'C++', 'MQTT'], category: 'electrical', totalSpots: 2, filledSpots: 0, upvotes: 8 }
];

// ======= 🌟 DUMMY COMPLETED PROJECTS (Showcase) 🌟 =======
// Added "upvotes" field to your existing array
const SAMPLE_PROJECTS = [
  { title: 'Arduino Obstacle Avoiding Car', description: 'A 4WD Arduino-based robot that uses ultrasonic sensors to navigate.', tech: ['Arduino','Ultrasonic','L298N'], link: '#', category: 'electrical', upvotes: 45, details: 'Complete build guide.' },
  { title: 'Line Follower Robot LFR', description: 'A line follower robot using IR sensors and PID control.', tech: ['AVR','IR Sensors','PID'], link: '#', category: 'electrical', upvotes: 28, details: 'Includes hardware BOM.' },
  { title: 'Bridge Load Analysis Simulator', description: 'Finite element simulation of bridge loads with visualization.', tech: ['FEM','Python','Structural'], link: '#', category: 'civil', upvotes: 56, details: 'Includes load cases.' },
  { title: 'Sales Forecast Dashboard', description: 'Time-series forecasting and interactive visualizations.', tech: ['Pandas','Prophet','Plotly'], link: '#', category: 'datascience', upvotes: 89, details: 'Backtesting results included.' },
  { title: 'SkillBridge Learning Platform', description: 'A student platform featuring a Skill Gap Analyzer and progress decay system.', tech: ['React', 'Firebase', 'Node.js'], link: '#', category: 'web', upvotes: 124, details: 'Dynamic roadmaps included.' },
  { title: 'Campus Resource Coordinator App', description: 'Software to manage water/electricity distribution for resource-scarce campuses.', tech: ['JS', 'Express', 'MongoDB'], link: '#', category: 'environmental', upvotes: 33, details: 'Strict digital allocation system.' },
  { title: 'Cinematic 4D Video Generator', description: 'Generative AI models to produce cinematic visualizations of the fourth dimension.', tech: ['GenAI', 'Prompt Engineering'], link: '#', category: 'ai', upvotes: 210, details: 'Complex theoretical physics.' }
];

// ======= UPVOTE LOGIC =======
// This function adds a click listener to the heart button
function attachUpvoteListener(cardElement, initialUpvotes) {
    const upvoteBtn = cardElement.querySelector('.upvote-btn');
    const countSpan = upvoteBtn.querySelector('.upvote-count');
    const icon = upvoteBtn.querySelector('i');
    
    let hasUpvoted = false;
    let currentCount = initialUpvotes || 0;

    upvoteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents triggering other card clicks
        
        if (!hasUpvoted) {
            currentCount++;
            hasUpvoted = true;
            upvoteBtn.style.color = '#ef4444'; // Make it red/pink
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid'); // Fill the heart
            icon.classList.add('fa-beat'); // Small animation
            setTimeout(() => icon.classList.remove('fa-beat'), 500); // remove animation
        } else {
            currentCount--;
            hasUpvoted = false;
            upvoteBtn.style.color = 'var(--text-muted)'; // Reset color
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular'); // Empty the heart
        }
        countSpan.innerText = currentCount;
    });
}

// ======= RENDER ONGOING PROJECTS =======
async function fetchAndRenderOngoing() {
    const container = document.getElementById('ongoing-projects-container');
    if (!container) return;

    // Simulate network load
    setTimeout(() => {
        container.innerHTML = ''; 

        if (DUMMY_ONGOING_PROJECTS.length === 0) {
            container.innerHTML = '<div class="glass" style="grid-column:1/-1;padding:18px;text-align:center;"><p class="muted">No active collaborations right now. Be the first to post one!</p></div>';
            return;
        }

        DUMMY_ONGOING_PROJECTS.forEach(p => {
            const spotsAvailable = p.totalSpots - (p.filledSpots || 0);
            const isFull = spotsAvailable <= 0;
            const projectId = p.id;

            const card = document.createElement('div');
            card.className = 'project-card glass';
            
            card.innerHTML = `
                <div class="project-body" style="border-top: 3px solid ${isFull ? '#ef4444' : 'var(--accent1)'}; padding-top: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <h4 style="margin: 0;">${escapeHtml(p.title)}</h4>
                        <span style="background: ${isFull ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}; color: ${isFull ? "#ef4444" : "#10b981"}; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; white-space: nowrap;">${isFull ? "Team Full" : `${spotsAvailable} Spots Open`}</span>
                    </div>
                    
                    <p class="muted small" style="margin-bottom: 10px;">🛠 <strong>Led by:</strong> ${escapeHtml(p.ownerName)}</p>
                    <p class="muted" style="font-size: 0.9rem;"><strong>Looking for:</strong> ${p.tech ? escapeHtml(p.tech.join(', ')) : 'Various Skills'}</p>
                    
                    <div class="meta" style="margin-top:15px; display:flex; align-items:center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                        <div>
                            ${!isFull 
                                ? `<button class="btn btn-sm btn-primary apply-btn" data-id="${projectId}">Apply</button>` 
                                : `<button class="btn btn-sm btn-ghost" disabled style="opacity: 0.5;">Closed</button>`
                            }
                        </div>
                        
                        <!-- THE NEW UPVOTE BUTTON -->
                        <button class="btn btn-sm btn-ghost upvote-btn" style="color: var(--text-muted); font-size: 14px;">
                            <i class="fa-regular fa-heart"></i> <span class="upvote-count">${p.upvotes || 0}</span>
                        </button>
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

            // Attach Upvote Logic
            attachUpvoteListener(card, p.upvotes);

            container.appendChild(card);
        });
    }, 500);
}

// ======= RENDER COMPLETED SHOWCASE =======
async function fetchAndRenderCompleted() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    // Simulate network load
    setTimeout(() => {
        container.innerHTML = '';

        // Render the static SAMPLE_PROJECTS with Dummy Data
        SAMPLE_PROJECTS.forEach(p => createShowcaseCard(p, container));

        // Apply current filter if any
        const active = document.querySelector('.filter-row [data-filter].active');
        const filter = active ? active.dataset.filter : 'all';
        filterProjects(filter);
    }, 500);
}

// Helper to build the Completed/Showcase Card
function createShowcaseCard(p, container) {
    const card = document.createElement('div');
    card.className = 'project-card glass';
    card.dataset.category = (p.category || 'web').toLowerCase();

    card.innerHTML = `
      <div class="project-body">
        <div style="display: flex; justify-content: space-between; align-items: start;">
            <h4 style="margin: 0 0 10px 0;">${escapeHtml(p.title)}</h4>
            <!-- THE NEW UPVOTE BUTTON FOR COMPLETED PROJECTS -->
            <button class="btn btn-ghost upvote-btn" style="color: var(--text-muted); padding: 0;">
                <i class="fa-regular fa-heart"></i> <span class="upvote-count" style="font-size: 12px;">${p.upvotes || 0}</span>
            </button>
        </div>
        
        <p class="muted" style="font-size: 14px; margin-bottom: 12px;">${escapeHtml(truncate(p.description || "", 150))}</p>
        
        <div class="meta" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
          ${(p.tech || []).map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}
        </div>
        
        <div style="margin-top: 16px; display: flex; gap: 10px;">
            ${p.link && p.link !== '#' ? `<a class="btn btn-sm btn-outline" href="${p.link}" target="_blank" rel="noopener">Code</a>` : ''}
            <button class="btn btn-sm btn-outline details-btn">Details</button>
        </div>
      </div>
    `;

    // Details button opens a simple inline details panel
    const detailsBtn = card.querySelector('.details-btn');
    detailsBtn.addEventListener('click', () => showDetailsInline(card, p));

    // Attach Upvote Logic
    attachUpvoteListener(card, p.upvotes);

    container.appendChild(card);
}

// ======= FILTERS & UTILITIES =======
function filterProjects(filter) {
  const cards = document.querySelectorAll('#projects-container .project-card');
  cards.forEach(c => {
    if (filter === 'all' || c.dataset.category === filter) c.style.display = 'block';
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
  details.className = 'project-details glass';
  details.style.marginTop = '12px';
  details.style.padding = '12px';
  details.style.background = 'rgba(0,0,0,0.2)';
  details.innerHTML = `
      <p style="margin: 0 0 10px 0; font-size: 13px;">${escapeHtml(project.details || project.description || '')}</p>
      <p class="muted small" style="margin: 0;">Category: <strong>${escapeHtml(project.category)}</strong></p>
  `;
  card.querySelector('.project-body').appendChild(details);
}

function escapeHtml(str = '') { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function truncate(s, n) { return s && s.length > n ? s.slice(0,n-1) + '…' : s || ''; }

// ======= INIT & UI LOGIC =======
document.addEventListener('DOMContentLoaded', () => {
  const tabOngoing = document.getElementById('tab-ongoing');
  const tabCompleted = document.getElementById('tab-completed');
  const sectionOngoing = document.getElementById('section-ongoing');
  const sectionCompleted = document.getElementById('section-completed');

  // Tab Switching Logic
  if (tabOngoing && tabCompleted && sectionOngoing && sectionCompleted) {
      tabOngoing.addEventListener('click', () => {
          tabOngoing.className = "btn btn-primary";
          tabCompleted.className = "btn btn-outline"; // Changed to outline for better UI
          sectionOngoing.style.display = "block";
          sectionCompleted.style.display = "none";
      });

      tabCompleted.addEventListener('click', () => {
          tabCompleted.className = "btn btn-primary";
          tabOngoing.className = "btn btn-outline";
          sectionCompleted.style.display = "block";
          sectionOngoing.style.display = "none";
      });
  }
    
  // Fetch both lists on load
  fetchAndRenderOngoing();
  fetchAndRenderCompleted();

  // Filter Buttons Logic 
  document.querySelectorAll('.filter-row [data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-row [data-filter]').forEach(b => {
          b.classList.remove('active');
          b.classList.remove('btn-primary');
          b.classList.add('btn-outline');
      });
      btn.classList.add('active');
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary'); // Highlight selected filter
      filterProjects(btn.dataset.filter);
    });
  });

  // Modal Logic
  const modalPost = document.getElementById('modal-post');
  const modalApply = document.getElementById('modal-apply');
  
  if (modalPost) {
      const btnOpenPost = document.getElementById('btn-open-post');
      const btnClosePost = document.getElementById('close-post');
      if (btnOpenPost) btnOpenPost.addEventListener('click', () => modalPost.style.display = 'flex');
      if (btnClosePost) btnClosePost.addEventListener('click', () => modalPost.style.display = 'none');
  }
  
  if (modalApply) {
      const btnCloseApply = document.getElementById('close-apply');
      if (btnCloseApply) btnCloseApply.addEventListener('click', () => modalApply.style.display = 'none');
  }

  // Handle Posting a Project (Simulated for Dummy Mode)
  const formPostProject = document.getElementById('form-post-project');
  if (formPostProject) {
      formPostProject.addEventListener('submit', async (e) => {
          e.preventDefault();
          const btn = formPostProject.querySelector('button');
          btn.innerText = "Publishing...";
          btn.disabled = true;

          setTimeout(() => {
              alert("DUMMY SUCCESS: Project posted successfully!");
              if (modalPost) modalPost.style.display = 'none';
              e.target.reset();
              btn.innerText = "Publish Project";
              btn.disabled = false;
          }, 800);
      });
  }

  // Handle Applying (Simulated for Dummy Mode)
  const formApply = document.getElementById('form-apply');
  if (formApply) {
      formApply.addEventListener('submit', async (e) => {
          e.preventDefault();
          const btn = formApply.querySelector('button');
          btn.innerText = "Submitting...";
          btn.disabled = true;

          setTimeout(() => {
              alert("DUMMY SUCCESS: Application submitted anonymously! Good luck.");
              if (modalApply) modalApply.style.display = 'none';
              e.target.reset();
              btn.innerText = "Submit Application";
              btn.disabled = false;
          }, 800);
      });
  }
});
