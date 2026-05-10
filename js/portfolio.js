// js/portfolio.js
// 🛑 FIREBASE COMMENTED OUT FOR DUMMY DEMO 🛑

// Dictionary to convert raw skill IDs to readable tags
const skillLabels = {
    cpp: 'C/C++', arduino: 'Arduino & Embedded', circuit: 'Circuit Design',
    iot: 'IoT & Sensors', matlab: 'MATLAB', python: 'Python', js: 'JavaScript',
    react: 'React', firebase: 'Firebase'
};

// 🌟 DUMMY EE USER PROFILE 🌟
const dummyUserProfile = {
    name: "Rohan",
    branch: "Electrical Engineering",
    email: "rohan@example.com",
    placementScore: 92,
    progress: { cpp: true, arduino: true, circuit: true, iot: true, python: true, js: true, firebase: true }
};

// 🌟 DUMMY EE PROJECTS DATA 🌟
const dummyProjectsData = [
    {
        title: "Autonomous Line-Following Robot",
        description: "Engineered the hardware integration and programmed PID tuning for an autonomous robot. Utilized an Arduino Nano, L298N motor drivers, and N20 motors for precise, real-time trajectory correction.",
        tech: ["C++", "Arduino", "PID Control"],
        link: "#"
    },
    {
        title: "SkillBridge Progress Engine (Software)",
        description: "Built a dynamic web application utilizing JavaScript and Firebase to calculate placement readiness, showcasing cross-disciplinary skills in both hardware and software environments.",
        tech: ["JavaScript", "Firebase", "Web Design"],
        link: "#"
    },
    {
        title: "Watch Brand E-Commerce Platform",
        description: "A complete digital storefront and marketing pipeline built for a premium watch brand, including social media integration.",
        tech: ["HTML/CSS", "JavaScript", "UI/UX"],
        link: "#"
    }
];

// 🌟 DUMMY CERTIFICATES DATA 🌟
const dummyCertificatesData = [
    { platform: "Cisco", courseName: "Campus Ambassador Brand Executive", link: "#" },
    { platform: "Coursera", courseName: "Introduction to Internet of Things (IoT)", link: "#" }
];

// ==========================================
// RENDER THE PORTFOLIO UI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Grab the Loading and Content containers from your HTML
    const loadingState = document.getElementById('loading-state');
    const profileContent = document.getElementById('profile-content');

    // Simulate a brief loading time so it looks professional
    setTimeout(() => {
        
        // 1. Populate Header & Score
        const nameEl = document.getElementById('user-name');
        if(nameEl) nameEl.innerHTML = `${dummyUserProfile.name} <span style="font-size: 14px; color: var(--accent2); font-weight: normal; margin-left: 10px;">| ${dummyUserProfile.branch}</span>`;
        
        const contactBtn = document.getElementById('contact-btn');
        if(contactBtn) contactBtn.href = `mailto:${dummyUserProfile.email}`;
        
        const scoreEl = document.getElementById('user-score');
        if(scoreEl) scoreEl.innerText = `${dummyUserProfile.placementScore}%`;
        
        const fillEl = document.getElementById('score-fill');
        if(fillEl) {
            fillEl.style.width = `${dummyUserProfile.placementScore}%`;
            fillEl.style.transition = "width 1s ease-in-out"; // Smooth animation
        }

        // 2. Populate Skills
        const skillsContainer = document.getElementById('user-skills');
        if (skillsContainer) {
            skillsContainer.innerHTML = "";
            Object.entries(dummyUserProfile.progress).forEach(([key, done]) => {
                if (done && skillLabels[key]) {
                    skillsContainer.innerHTML += `
                        <span style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.2); color: #a78bfa; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; display: inline-block; margin: 4px;">
                            ${skillLabels[key]}
                        </span>`;
                }
            });
        }

        // 3. Populate Projects
        const projectsContainer = document.getElementById('user-projects');
        if (projectsContainer) {
            projectsContainer.innerHTML = "";
            dummyProjectsData.forEach((p) => {
                projectsContainer.innerHTML += `
                    <div class="project-card glass" style="padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                        <div class="project-body">
                            <h4 style="margin-top: 0; margin-bottom: 8px; color: var(--text-main); font-size: 18px;">${p.title}</h4>
                            <p class="muted small" style="line-height: 1.6; margin-bottom: 16px;">${p.description}</p>
                            <div class="meta" style="margin-bottom: 16px; display:flex; gap:8px; flex-wrap:wrap;">
                                ${p.tech.map(t => `<span class="tech" style="font-size:0.8rem; background: rgba(16, 185, 129, 0.1); color:#10b981; padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.2);">${t}</span>`).join('')}
                            </div>
                            <a class="btn btn-sm btn-outline" style="display: block; text-align: center; text-decoration: none;" href="${p.link}" target="_blank">View Code / Demo</a>
                        </div>
                    </div>
                `;
            });
        }

        // 4. Populate Certificates
        const certsContainer = document.getElementById('portfolio-certificates') || document.getElementById('user-certificates');
        if (certsContainer) {
            certsContainer.innerHTML = ""; 
            dummyCertificatesData.forEach((cert) => {
                certsContainer.innerHTML += `
                    <div style="border: 1px solid rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.05); border-radius: 8px; padding: 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px;">
                                <i class="fa-solid fa-award" style="color: #3b82f6; font-size: 20px;"></i>
                            </div>
                            <div>
                                <h4 style="margin: 0 0 4px 0; font-size: 15px; color: var(--text-main);">${cert.courseName}</h4>
                                <p style="margin: 0; font-size: 13px; color: var(--text-muted);">${cert.platform} • Verified</p>
                            </div>
                        </div>
                        <a href="${cert.link}" target="_blank" class="btn btn-outline btn-sm">View</a>
                    </div>
                `;
            });
        }

        // 🚨 THE FIX: HIDE LOADING, SHOW PROFILE 🚨
        if (loadingState) loadingState.style.display = 'none';
        
        if (profileContent) {
            profileContent.style.display = 'block';
            profileContent.classList.remove('hidden'); // Just in case you used a class
        }

    }, 600); // 600ms delay
});
