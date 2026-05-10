// 🛑 FIREBASE COMMENTED OUT FOR DUMMY DEMO 🛑

// 🌟 DUMMY TALENT POOL DATA 🌟
const dummyTalentPool = [
    { id: "u_001", name: "Rohan", branch: "Electrical Engineering", role: "Full-Stack Developer", skills: ["React", "JavaScript", "Firebase"], placementScore: 92, projectsCount: 3, portfolio: "portfolio.html" },
    { id: "u_002", name: "Aman Gupta", branch: "Computer Science", role: "Frontend Developer", skills: ["HTML", "CSS", "UI/UX"], placementScore: 85, projectsCount: 4, portfolio: "portfolio.html" },
    { id: "u_003", name: "Riya Sharma", branch: "Information Technology", role: "Backend Engineer", skills: ["Node.js", "Python", "SQL"], placementScore: 78, projectsCount: 2, portfolio: "portfolio.html" }
];

document.addEventListener('DOMContentLoaded', () => {
    const talentGrid = document.getElementById('talent-grid');
    const sortDropdown = document.getElementById('sort-engine');

    function renderTalent(candidatesArray) {
        if (!talentGrid) return;
        talentGrid.innerHTML = ""; // Clears the "Loading pipeline..." text

        candidatesArray.forEach(candidate => {
            let scoreColor = candidate.placementScore >= 80 ? "var(--success)" : "var(--warning)";

            talentGrid.innerHTML += `
                <div class="glass" style="display: flex; flex-direction: column; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                        <div>
                            <h3 style="margin: 0 0 4px 0; color: var(--text-main); font-size: 20px;">${candidate.name}</h3>
                            <p style="margin: 0; color: var(--accent1); font-weight: 600; font-size: 14px;">${candidate.role} • ${candidate.branch}</p>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--surface-border); text-align: center;">
                            <div style="font-size: 24px; font-weight: 800; color: ${scoreColor}; line-height: 1;">${candidate.placementScore}</div>
                            <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Readiness</div>
                        </div>
                    </div>

                    <p class="muted small" style="margin-bottom: 12px;"><strong>Verified Skills:</strong> ${candidate.skills.join(', ')}</p>
                    <p class="muted small" style="margin-bottom: 24px;"><strong>Projects Shipped:</strong> ${candidate.projectsCount}</p>

                    <div style="margin-top: auto; border-top: 1px solid var(--surface-border); padding-top: 16px; display: flex; justify-content: space-between;">
                        <a href="${candidate.portfolio}" class="btn btn-outline btn-sm">View Portfolio</a>
                        <button class="btn btn-primary btn-sm">Message</button>
                    </div>
                </div>
            `;
        });
    }

    // Sorting Engine Logic
    function applySort() {
        if (!sortDropdown) return;
        let sortedData = [...dummyTalentPool];
        const sortValue = sortDropdown.value;
        
        if (sortValue === "score_desc") sortedData.sort((a, b) => b.placementScore - a.placementScore);
        else if (sortValue === "score_asc") sortedData.sort((a, b) => a.placementScore - b.placementScore);
        else if (sortValue === "projects_desc") sortedData.sort((a, b) => b.projectsCount - a.projectsCount);

        renderTalent(sortedData);
    }

    if (sortDropdown) sortDropdown.addEventListener('change', applySort);
    
    // Simulate initial loading time, then render
    setTimeout(() => applySort(), 300);
});
