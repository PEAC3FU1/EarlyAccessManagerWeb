// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('onclick')) return;
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll to download section
function scrollToDownload() {
    document.getElementById('download').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Login Modal Functions
function openLogin(e) {
    e.preventDefault();
    document.getElementById('loginModal').style.display = 'block';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

// Support Modal Functions
function openSupport() {
    document.getElementById('supportModal').style.display = 'block';
}

function closeSupport() {
    document.getElementById('supportModal').style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const supportModal = document.getElementById('supportModal');
    if (event.target == loginModal) {
        closeLogin();
    }
    if (event.target == supportModal) {
        closeSupport();
    }
}

// Handle form submissions
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Login functionality coming soon!');
        closeLogin();
    });

    document.getElementById('supportForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for contacting support! We will get back to you soon.');
        closeSupport();
    });
});

// Add scroll animation to elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.about, .support, .download');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
});

// Parallax effect for hero image
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Add particle effect on button hover
document.querySelectorAll('.play-btn, .download-btn, .support-btn').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.animation = 'pulse 0.5s ease';
    });
    
    button.addEventListener('animationend', function() {
        this.style.animation = '';
    });
});

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);
