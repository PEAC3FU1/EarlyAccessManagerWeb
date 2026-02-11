// Smooth scroll animation for cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.event-card-preview, .info-card');
    const rewardImage = document.querySelector('.reward-image');
    
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
    
    // Fade in reward image on scroll
    if (rewardImage) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });
        
        imageObserver.observe(rewardImage);
    }
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

// Video gallery hover functionality
document.addEventListener('DOMContentLoaded', () => {
    const videoItems = document.querySelectorAll('.video-item');
    const volumeToggle = document.getElementById('volumeToggle');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = volumeToggle.querySelector('.volume-icon');
    
    let isMuted = false;
    let currentVolume = 1.0;
    
    // Update all video volumes
    function updateAllVideos() {
        videoItems.forEach(item => {
            const video = item.querySelector('.gallery-video');
            if (video) {
                video.volume = currentVolume;
                video.muted = isMuted;
            }
        });
    }
    
    // Volume slider control
    volumeSlider.addEventListener('input', (e) => {
        currentVolume = e.target.value / 100;
        isMuted = currentVolume === 0;
        updateVolumeIcon();
        updateAllVideos();
    });
    
    // Mute/unmute toggle
    volumeToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        updateVolumeIcon();
        updateAllVideos();
    });
    
    // Update volume icon based on state
    function updateVolumeIcon() {
        if (isMuted || currentVolume === 0) {
            volumeIcon.className = 'fi fi-rr-volume-slash volume-icon';
        } else if (currentVolume < 0.5) {
            volumeIcon.className = 'fi fi-rr-volume-down volume-icon';
        } else {
            volumeIcon.className = 'fi fi-rr-volume volume-icon';
        }
    }
    
    videoItems.forEach(item => {
        const video = item.querySelector('.gallery-video');
        
        if (video) {
            // Set initial volume
            video.volume = currentVolume;
            video.muted = true; // Start muted until hover
            
            // Play video with current volume settings on hover
            item.addEventListener('mouseenter', () => {
                video.muted = isMuted;
                video.volume = currentVolume;
                video.play().catch(err => {
                    console.log('Video play failed:', err);
                    // Fallback: play muted if audio fails
                    video.muted = true;
                    video.play();
                });
            });
            
            // Pause and reset on mouse leave
            item.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
                video.muted = true;
            });
        }
    });
});
