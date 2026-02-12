// Countdown Timer for After Dark
function updateCountdown() {
    // February 12, 2026 at 5:00 PM EST (UTC-5)
    const eventDate = new Date('2026-02-12T17:00:00-05:00').getTime();
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
        document.getElementById('countdown').innerHTML = '<div style="font-size: 2rem; color: #ff6b6b; font-weight: bold;">EVENT IS LIVE!</div>';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Update countdown every second
updateCountdown();
setInterval(updateCountdown, 1000);

// Smooth scroll animation for cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.event-card, .rewards-section, .activities-section, .countdown-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideIn 0.6s ease forwards';
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
});

// Add CSS animation dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Voting System
document.addEventListener('DOMContentLoaded', () => {
    const voteBtn = document.getElementById('voteBtn');
    const voteCountSpan = document.getElementById('voteCount');
    
    // Load vote count from localStorage
    let voteCount = parseInt(localStorage.getItem('cosmeticVotes') || '0');
    let hasVoted = localStorage.getItem('hasVoted') === 'true';
    
    // Update display
    voteCountSpan.textContent = voteCount;
    
    if (hasVoted) {
        voteBtn.classList.add('voted');
        voteBtn.innerHTML = '<i class="fi fi-rr-check"></i> You Voted!';
    }
    
    // Handle vote button click
    voteBtn.addEventListener('click', () => {
        if (!hasVoted) {
            voteCount++;
            localStorage.setItem('cosmeticVotes', voteCount);
            localStorage.setItem('hasVoted', 'true');
            voteCountSpan.textContent = voteCount;
            voteBtn.classList.add('voted');
            voteBtn.innerHTML = '<i class="fi fi-rr-check"></i> You Voted!';
            hasVoted = true;
        }
    });
});
