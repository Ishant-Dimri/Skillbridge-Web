// js/login.js
// Handles dummy login routing based on role selection

document.addEventListener('DOMContentLoaded', () => {
    const roleCards = document.querySelectorAll('.role-card');

    roleCards.forEach(card => {
        
        // Add a nice hover effect purely via JS
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'var(--text-muted)';
            card.style.transform = 'translateY(-4px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = 'var(--surface-border)';
            card.style.transform = 'translateY(0)';
        });

        // Handle the actual click (Login)
        card.addEventListener('click', () => {
            const selectedRole = card.getAttribute('data-role');
            const btn = card.querySelector('button');
            
            // UI feedback
            btn.innerText = "Authenticating...";
            btn.classList.remove('btn-outline');
            btn.classList.add('btn-primary');

            // Simulate network delay
            setTimeout(() => {
                // 1. Save the role to local storage
                localStorage.setItem('skillbridge_role', selectedRole);

                // 2. Redirect to the correct dashboard
                if (selectedRole === 'student') {
                    window.location.href = 'dashboard.html';
                } else if (selectedRole === 'recruiter') {
                    window.location.href = 'talent.html';
                } else if (selectedRole === 'admin') {
                    window.location.href = 'admin.html';
                }
            }, 600);
        });
    });
});
