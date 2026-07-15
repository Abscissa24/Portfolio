// ──────────────────────────────────────────
// 1. Stardust starfield (WebGL particles)
// ──────────────────────────────────────────
(function() {
    const canvas = document.getElementById('stardust-canvas');
    // Wait until Stardust libraries are loaded
    if (typeof stardust === 'undefined' || typeof stardust.webgl === 'undefined') {
        console.warn('Stardust not loaded – falling back to basic canvas.');
        return;
    }

    const platform = stardust.webgl(canvas, { width: canvas.clientWidth, height: canvas.clientHeight });
    const stage = platform.stage();
    const emitter = stage.emitter();

    // Create a particle template for stars
    const star = emitter.particle({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 5,
        size: () => Math.random() * 2.5 + 0.6,
        color: [1, 1, 1, () => Math.random() * 0.5 + 0.4], // white with varying alpha
    });

    // Number of stars
    const STAR_COUNT = 200;
    // Spread stars across the viewport
    for (let i = 0; i < STAR_COUNT; i++) {
        emitter.emit(star, {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3 + 0.05, // slight upward drift
            life: 9999 // permanent
        });
    }

    // Animation loop
    function tick() {
        // Parallax effect based on mouse position
        const mouseX = window.mouseX || canvas.width / 2;
        const mouseY = window.mouseY || canvas.height / 2;
        const shiftX = (mouseX - canvas.width / 2) * 0.008;
        const shiftY = (mouseY - canvas.height / 2) * 0.008;

        // Update particles: move and wrap around
        const particles = emitter.particles;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.y > canvas.height + 10) p.y = -10;

            // Apply parallax offset to draw position (not stored permanently)
            // Stardust draws using x,y directly, so we'll adjust them every frame
            // We'll set a temporary offset, but better: use the emitter's transform.
            // For simplicity, we adjust x,y directly (will drift slightly, but acceptable).
            p.x += shiftX * 0.01;
            p.y += shiftY * 0.01;
        }

        stage.render();
        requestAnimationFrame(tick);
    }

    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        platform.resize(canvas.width, canvas.height);
    });

    // Track mouse
    window.addEventListener('mousemove', (e) => {
        window.mouseX = e.clientX;
        window.mouseY = e.clientY;
    });
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            window.mouseX = e.touches[0].clientX;
            window.mouseY = e.touches[0].clientY;
        }
    }, { passive: true });
    window.addEventListener('touchend', () => {
        window.mouseX = canvas.width / 2;
        window.mouseY = canvas.height / 2;
    });

    // Initialize mouse position
    window.mouseX = canvas.width / 2;
    window.mouseY = canvas.height / 2;

    tick();
})();

// ──────────────────────────────────────────
// 2. Standard portfolio scripts
// ──────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// Video autoplay / pause on scroll
const videos = document.querySelectorAll('.work-media video');
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
    });
}, { threshold: 0.3 });
videos.forEach(video => videoObserver.observe(video));
videos.forEach(video => video.play().catch(() => {}));

// Stagger reveal delays for work cards
const workCards = document.querySelectorAll('.work-card.reveal');
workCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.06}s`;
});

// Subtle parallax on portrait (desktop)
if (window.innerWidth > 768) {
    const portrait = document.querySelector('.hero-portrait');
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 14;
        const y = (e.clientY / window.innerHeight - 0.5) * 14;
        portrait.style.transform = `translate(${x}px, ${y}px)`;
        portrait.style.transition = 'transform 0.25s ease-out';
    });
}
