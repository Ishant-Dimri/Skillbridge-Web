// 🛑 FIREBASE COMMENTED OUT FOR DUMMY DEMO 🛑
// import { db } from './firebase.js';
// import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const skillLabels = {
    html: 'HTML Semantics', css: 'CSS & Flexbox', js: 'JavaScript',
    react: 'React', api: 'REST APIs', node: 'Node.js', python: 'Python'
};

// 🌟 DUMMY USER PROFILE DATA 🌟
const dummyUserProfile = {
    name: "Rohan",
    branch: "Electrical Engineering",
    placementScore: 92,
    projectsCount: 3,
    progress: { html: true, css: true, js: true, react: true, node: true }
};

// 🌟 DUMMY CERTIFICATES DATA 🌟
const dummyCertificates = [
    { courseName: "Complete Web Development Bootcamp", platform: "Udemy", fileUrl: "#" },
    { courseName: "Cloud Computing Fundamentals", platform: "Coursera", fileUrl: "#" }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Populate Dummy Student Profile
    const nameEl = document.getElementById('user-name');
    if(nameEl) nameEl.innerText = dummyUserProfile.name;

    const scoreEl = document.getElementById('user-score');
    if(scoreEl) scoreEl.innerText = `${dummyUserProfile.placementScore}%`;

    const fillEl = document.getElementById('score-fill');
    if(fillEl) fillEl.style.width = `${dummyUserProfile.placementScore}%`;

    // 2. Populate Skills
    const skillsContainer = document.getElementById('user-skills');
    if(skillsContainer) {
        skillsContainer.innerHTML = "";
        Object.entries(dummyUserProfile.progress).forEach(([key, done]) => {
            if (done && skillLabels[key]) {
                skillsContainer.innerHTML += `<span class="tech-tag" style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.2); color: #a78bfa; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-right: 6px; display: inline-block;">${skillLabels[key]}</span>`;
            }
        });
    }

    // 3. Populate Dummy Certificates
    const certList = document.getElementById('portfolio-certificates');
    if(certList) {
        certList.innerHTML = "";
        dummyCertificates.forEach((cert) => {
            certList.innerHTML += `
                <div class="glass flex-between" style="padding:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="margin:0; color:var(--text-main);">${cert.courseName}</h4>
                        <p class="muted small" style="margin:0;">${cert.platform}</p>
                    </div>
                    <a href="${cert.fileUrl}" target="_blank" class="btn btn-sm btn-outline">View</a>
                </div>`;
        });
    }
});
