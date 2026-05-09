import { db } from './firebase.js';
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const skillLabels = {
    html: 'HTML Semantics', css: 'CSS & Flexbox', js: 'JavaScript',
    react: 'React', api: 'REST APIs', node: 'Node.js', python: 'Python'
};

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUid = urlParams.get('user');
    if (!targetUid) return;

    // 1. Fetch Student Profile (Real-time Readiness & Skills)
    const userSnap = await getDoc(doc(db, "users", targetUid));
    if (userSnap.exists()) {
        const data = userSnap.data();
        document.getElementById('user-name').innerText = data.name;
        document.getElementById('user-score').innerText = `${data.placementScore || 0}%`;
        document.getElementById('score-fill').style.width = `${data.placementScore || 0}%`;
        
        const skillsContainer = document.getElementById('user-skills');
        Object.entries(data.progress || {}).forEach(([key, done]) => {
            if (done && skillLabels[key]) {
                skillsContainer.innerHTML += `<span class="tech-tag">${skillLabels[key]}</span>`;
            }
        });
    }

    // 2. Fetch Certificates (The ones uploaded in Step 1)
    const certList = document.getElementById('portfolio-certificates');
    const q = query(collection(db, "certificates"), where("studentId", "==", targetUid));
    const certSnap = await getDocs(q);

    certList.innerHTML = "";
    certSnap.forEach((doc) => {
        const cert = doc.data();
        certList.innerHTML += `
            <div class="glass flex-between" style="padding:15px; margin-bottom:10px;">
                <div>
                    <h4 style="margin:0;">${cert.courseName}</h4>
                    <p class="muted small">${cert.platform}</p>
                </div>
                <a href="${cert.fileUrl}" target="_blank" class="btn btn-sm btn-outline">View</a>
            </div>`;
    });
});
