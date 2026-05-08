import { db } from './firebase.js'; 
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"; 

const alumniListDiv = document.getElementById('alumni-list');

// Replace this with whoever the student's current mentor is
const currentMentorId = "Mentor_XYZ"; 

async function fetchTopAlumni(mentorId) {
    try {
        // 1. Build the Query
        const alumniRef = collection(db, "users");
        const q = query(
            alumniRef,
            where("status", "==", "alumni"),          // Only get finished students
            where("mentorId", "==", mentorId),        // Only under THIS mentor
            orderBy("readinessScore", "desc"),        // Sort 1: Highest score first
            orderBy("projectCount", "desc")           // Sort 2: Tie-breaker is project count
        );

        // 2. Fetch the Data
        const querySnapshot = await getDocs(q);
        
        // 3. Clear the loading text
        alumniListDiv.innerHTML = ""; 

        if (querySnapshot.empty) {
            alumniListDiv.innerHTML = "<p>No alumni found for this mentor yet.</p>";
            return;
        }

        // 4. Render the Alumni Cards
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Create a card for each alumni
            const card = document.createElement('div');
            card.style.border = "1px solid #ddd";
            card.style.padding = "15px";
            card.style.borderRadius = "8px";
            
            card.innerHTML = `
                <h4 style="margin: 0;">${data.name}</h4>
                <p style="margin: 5px 0; color: #555;">
                    🔥 Readiness Score: <strong>${data.readinessScore}</strong> | 
                    📁 Projects: <strong>${data.projectCount}</strong>
                </p>
                <a href="${data.linkedIn || '#'}" target="_blank" class="btn btn-sm btn-outline-primary">Connect</a>
            `;
            
            alumniListDiv.appendChild(card);
        });

    } catch (error) {
        console.error("Error fetching alumni:", error);
    }
}

// Run the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchTopAlumni(currentMentorId);
});
