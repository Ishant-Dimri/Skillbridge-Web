// js/talent.js
// Recruiter Dashboard Logic - Merit-based Candidate Sorting

// 🌟 DUMMY DATA FOR TESTING THE SORTING ENGINE 🌟
const dummyTalentPool = [
    { id: "u_001", name: "Aman Gupta", role: "Frontend Developer", skills: ["React", "CSS", "Firebase"], placementScore: 88, projectsCount: 4, portfolio: "portfolio.html?user=u_001" },
    { id: "u_002", name: "Riya Sharma", role: "AI Engineer", skills: ["Python", "TensorFlow", "Pandas"], placementScore: 96, projectsCount: 6, portfolio: "#" },
    { id: "u_003", name: "Karan Singh", role: "Embedded Systems", skills: ["C++", "Arduino", "IoT"], placementScore: 72, projectsCount: 2, portfolio: "#" },
    { id: "u_004", name: "Piyush", role: "Full-Stack Engineer", skills: ["JavaScript", "Node.js", "React"], placementScore: 85, projectsCount: 8, portfolio: "#" },
    { id: "u_005", name: "Neha Verma", role: "Data Scientist", skills: ["SQL", "Python", "Tableau"], placementScore: 85, projectsCount: 3, portfolio: "#" }
];

document.addEventListener('DOMContentLoaded', () => {
    const talentGrid = document.getElementById('talent-grid');
    const sortDropdown = document.getElementById('sort-engine');

    // 1. Function to Render the HTML Cards
    function renderTalent(candidatesArray) {
        talentGrid.innerHTML = ""; // Clear existing

        if (candidatesArray.length === 0) {
            talentGrid.innerHTML = "<p class='muted'>No candidates match your criteria.</p>";
            return;
        }

        candidatesArray.forEach(candidate => {
            const card = document.createElement('div');
            card.className = "glass";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            
            // Color code the score
            let scoreColor = "var(--success)"; // Green
            if (candidate.placementScore < 80) scoreColor = "var(--warning)"; // Orange
            if (candidate.placementScore < 60) scoreColor = "var(--danger)"; // Red

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0 0 4px 0; color: var(--text-main); font-size: 20px;">${candidate.name}</h3>
                        <p style="margin: 0; color: var(--accent1); font-weight: 600; font-size: 14px;">${candidate.role}</p>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--surface-border); text-align: center;">
                        <div style="font-size: 24px; font-weight: 800; color: ${scoreColor}; line-height: 1;">${candidate.placementScore}</div>
                        <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Readiness</div>
                    </div>
                </div>

                <p class="muted small" style="margin-bottom: 16px;"><strong>Verified Skills:</strong> ${candidate.skills.join(', ')}</p>
                <p class="muted small" style="margin-bottom: 24px;"><strong>Projects Shipped:</strong> ${candidate.projectsCount}</p>

                <div style="margin-top: auto; border-top: 1px solid var(--surface-border); padding-top: 16px; display: flex; justify-content: space-between;">
                    <a href="${candidate.portfolio}" target="_blank" class="btn btn-outline btn-sm">View Portfolio</a>
                    <button class="btn btn-primary btn-sm">Message</button>
                </div>
            `;
            talentGrid.appendChild(card);
        });
    }

    // 2. The Sorting Engine Logic
    function applySort() {
        const sortValue = sortDropdown.value;
        
        // Create a copy of the array so we don't mutate the original
        let sortedData = [...dummyTalentPool];

        if (sortValue === "score_desc") {
            // Highest score first
            sortedData.sort((a, b) => b.placementScore - a.placementScore);
        } 
        else if (sortValue === "score_asc") {
            // Lowest score first
            sortedData.sort((a, b) => a.placementScore - b.placementScore);
        } 
        else if (sortValue === "projects_desc") {
            // Most projects first
            sortedData.sort((a, b) => b.projectsCount - a.projectsCount);
        }

        renderTalent(sortedData);
    }

    // 3. Attach Listeners and Init
    sortDropdown.addEventListener('change', applySort);
    
    // Simulate initial network load, then apply default sort (Score High to Low)
    setTimeout(() => {
        applySort();
    }, 400);
});
