// js/dashboard.js
// 🛑 FIREBASE COMMENTED OUT FOR DUMMY DEMO 🛑

const skillLabels = {
    html: 'HTML Semantics', css: 'CSS & Flexbox', js: 'JavaScript',
    react: 'React', api: 'REST APIs', testing: 'Unit Testing',
    node: 'Node.js', deploy: 'Cloud Deployment', design: 'System Design',
    python: 'Python', data: 'Data Analysis', models: 'ML Models', nn: 'Neural Networks'
};

// 🌟 DUMMY STUDENT DATA 🌟
const dummyUserData = {
    name: "Ishant Dimri",
    email: "ishant@example.com",
    placementScore: 92,
    progress: { html: true, css: true, js: true, react: true, api: true }
};

const defaultTasks = [
    { id: 't1', title: 'Complete Beginner Module: HTML', points: 10 },
    { id: 't2', title: 'Build a small project', points: 20 },
    { id: 't3', title: 'Mock interview practice', points: 15 }
];

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. POPULATE HEADER, SCORE, & PROGRESS BARS
    // ==========================================
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.innerText = dummyUserData.name;

    const scoreEl = document.getElementById('user-score');
    const fillEl = document.getElementById('score-fill');
    const placementEl = document.getElementById('placement-score');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');

    // Helper function to update all visual scores at once
    function updateScores() {
        if (scoreEl) scoreEl.innerText = `${dummyUserData.placementScore}%`;
        if (placementEl) placementEl.innerText = `${dummyUserData.placementScore}`;
        if (progressPercent) progressPercent.innerText = `${dummyUserData.placementScore}%`;
        
        if (fillEl) {
            fillEl.style.width = `${dummyUserData.placementScore}%`;
            fillEl.style.transition = "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        }
        if (progressFill) {
            progressFill.style.width = `${dummyUserData.placementScore}%`;
            progressFill.style.transition = "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        }
    }

    // Set initial scores on page load
    updateScores();


    // ==========================================
    // 2. POPULATE SKILLS
    // ==========================================
    const skillsContainer = document.getElementById('user-skills');
    if (skillsContainer) {
        skillsContainer.innerHTML = "";
        Object.entries(dummyUserData.progress).forEach(([key, done]) => {
            if (done && skillLabels[key]) {
                skillsContainer.innerHTML += `<span class="tech-tag" style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.2); color: #a78bfa; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-right: 6px; display: inline-block; margin-bottom: 6px;">${skillLabels[key]}</span>`;
            }
        });
    }

    // ==========================================
    // 3. VIEW PORTFOLIO BUTTON
    // ==========================================
    const portfolioBtn = document.getElementById('portfolio-link-btn');
    if (portfolioBtn) {
        portfolioBtn.onclick = (event) => {
            event.preventDefault(); 
            window.open('portfolio.html', '_blank'); // Instantly opens dummy portfolio
        };
    }

    // ==========================================
    // 4. RENDER DUMMY TASKS
    // ==========================================
    const list = document.getElementById('tasks-list');
    if (list) {
        list.innerHTML = '';
        defaultTasks.forEach(t => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.marginBottom = '12px';
            li.style.paddingBottom = '12px';
            li.style.borderBottom = '1px solid var(--surface-border)';
            
            li.innerHTML = `<div><strong style="color: var(--text-main);">${t.title}</strong><div class="muted small" style="margin-top: 4px;">Points: ${t.points}</div></div>`;
            
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = true; // Checked for dummy display
            cb.style.width = "18px";
            cb.style.height = "18px";
            
            li.appendChild(cb);
            list.appendChild(li);
        });
    }

    // ==========================================
    // 5. CERTIFICATE UPLOAD: +2% SCORE LOGIC
    // ==========================================
    const certForm = document.getElementById('upload-cert-form');
    
    if (certForm) {
        certForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop the page from reloading

            const btn = document.getElementById('cert-submit-btn');
            
            // Visual feedback for the user
            btn.innerText = "Verifying Credential...";
            btn.disabled = true;

            // Simulate a brief 1-second network delay for realism
            setTimeout(() => {
                // Increase the score by 2, capped at a maximum of 100
                dummyUserData.placementScore = Math.min(dummyUserData.placementScore + 2, 100);

                // Re-run the score function to animate the progress bars to the new number
                updateScores();

                // Success message and reset
                alert("Certificate verified! Your placement readiness score increased by +2%.");
                certForm.reset();
                btn.innerText = "Upload to Portfolio";
                btn.disabled = false;
                
            }, 1000); 
        });
    }
});
