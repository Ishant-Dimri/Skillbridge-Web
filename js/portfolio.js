// js/portfolio.js

// 🛑 FIREBASE COMMENTED OUT FOR DUMMY DEMO 🛑
// import { app, db } from './firebase.js';
// import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Dictionary to convert raw skill IDs to readable tags
const skillLabels = {
  html: 'HTML Semantics', css: 'CSS & Flexbox', js: 'JavaScript',
  react: 'React', api: 'REST APIs', testing: 'Unit Testing',
  node: 'Node.js', deploy: 'Cloud Deployment', design: 'System Design',
  python: 'Python', data: 'Data Analysis', models: 'ML Models', nn: 'Neural Networks'
};

// 🌟 --- DUMMY DATA --- 🌟
const dummyUserData = {
  name: "Piyush",
  email: "contact@ishantdimri.com",
  placementScore: 85,
  progress: {
    html: true, css: true, js: true, react: true, api: true, deploy: true, models: true
  }
};

const dummyProjectsData = [
  {
    title: "SkillBridge Progress Engine",
    description: "A dynamic algorithm that calculates placement readiness based on completed tasks, featuring a 5% progress decay logic to ensure active knowledge retention.",
    tech: ["JavaScript", "Firebase", "React"],
    link: "#"
  },
  {
    title: "Autonomous Line-Following Robot",
    description: "Hardware integration and PID tuning for an autonomous line-following robot utilizing an Arduino Nano, L298N motor drivers, and N20 motors for precise movement.",
    tech: ["C++", "Arduino", "Embedded Systems"],
    link: "#"
  },
  {
    title: "Watch Brand E-Commerce Platform",
    description: "A complete digital storefront and marketing pipeline built for a premium watch brand, including social media integration.",
    tech: ["HTML/CSS", "JavaScript", "UI/UX"],
    link: "#"
  }
];

const dummyCertificatesData = [
  {
    platform: "Udemy",
    courseName: "Machine Learning A-Z: AI, Python & R",
    link: "#"
  },
  {
    platform: "Coursera",
    courseName: "Google Data Analytics Professional Certificate",
    link: "#"
  }
];
// 🌟 ------------------- 🌟

document.addEventListener('DOMContentLoaded', async () => {
  const loadingState = document.getElementById('loading-state');
  const profileContent = document.getElementById('profile-content');

  try {
    // Simulate a network request taking 800ms to show off the loading state
    setTimeout(() => {
      
      // 1. Populate Header & Score
      document.getElementById('user-name').innerText = dummyUserData.name;
      document.getElementById('contact-btn').href = `mailto:${dummyUserData.email}`;
      
      const score = dummyUserData.placementScore;
      document.getElementById('user-score').innerText = `${score}%`;
      
      // Animate the progress bar fill
      setTimeout(() => {
        document.getElementById('score-fill').style.width = `${score}%`;
        document.getElementById('score-fill').style.transition = "width 1s ease-in-out";
      }, 100);

      // 2. Populate Skills from 'progress' object
      const skillsContainer = document.getElementById('user-skills');
      const completedProgress = dummyUserData.progress;
      let skillCount = 0;

      for (const [key, isCompleted] of Object.entries(completedProgress)) {
        if (isCompleted && skillLabels[key]) {
          skillsContainer.innerHTML += `
            <span style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.2); color: #a78bfa; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600;">
              ${skillLabels[key]}
            </span>`;
          skillCount++;
        }
      }
      
      if (skillCount === 0) {
        skillsContainer.innerHTML = '<span class="muted small">Currently building foundational skills...</span>';
      }

      // 3. Populate Projects
      const projectsContainer = document.getElementById('user-projects');
      projectsContainer.innerHTML = ""; // clear existing

      dummyProjectsData.forEach((p) => {
        projectsContainer.innerHTML += `
          <div class="project-card glass" style="padding: 20px; border-radius: 12px; margin-bottom: 16px;">
            <div class="project-body">
              <h4 style="margin-top: 0; margin-bottom: 8px;">${p.title}</h4>
              <p class="muted small" style="line-height: 1.5; margin-bottom: 16px;">${p.description}</p>
              <div class="meta" style="margin-bottom: 16px; display:flex; gap:8px; flex-wrap:wrap;">
                ${p.tech.map(t => `<span class="tech" style="font-size:0.8rem; background: rgba(16, 185, 129, 0.1); color:#10b981; padding: 4px 8px; border-radius: 4px;">${t}</span>`).join('')}
              </div>
              <a class="btn btn-sm btn-outline" style="display: block; text-align: center; text-decoration: none; padding: 8px; border: 1px solid #4f46e5; color: #4f46e5; border-radius: 6px;" href="${p.link}" target="_blank">View Code / Demo</a>
            </div>
          </div>
        `;
      });

      // 3.5 Populate Dummy Certificates
      // MOVED THIS INSIDE THE DOMContentLoaded EVENT LISTENER
      const certsContainer = document.getElementById('user-certificates');
      if (certsContainer) {
        certsContainer.innerHTML = ""; 

        if (dummyCertificatesData.length > 0) {
          dummyCertificatesData.forEach((cert) => {
            certsContainer.innerHTML += `
              <div style="border: 1px solid rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.05); border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px;">
                  <i class="fa-solid fa-award" style="color: #3b82f6; font-size: 20px;"></i>
                </div>
                <div style="flex-grow: 1;">
                  <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #fff;">${cert.courseName}</h4>
                  <p style="margin: 0; font-size: 13px; color: #94a3b8;">${cert.platform} • Verified Proof</p>
                </div>
                <a href="${cert.link}" target="_blank" class="btn btn-outline" style="font-size: 12px; padding: 6px 12px;">View</a>
              </div>
            `;
          });
        } else {
          certsContainer.innerHTML = '<p class="muted small">No external credentials verified yet.</p>';
        }
      } else {
        console.warn("Could not find 'user-certificates' div in the HTML.");
      }

      // 4. Hide loading, show profile
      loadingState.classList.add('hidden');
      profileContent.classList.remove('hidden');

    }, 800); // End of simulated delay

  } catch (error) {
    console.error("Error loading profile:", error);
    loadingState.innerHTML = `<h2 style="color:#ef4444;">Error loading profile data.</h2>`;
  }
});
