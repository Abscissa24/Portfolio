// ───────────────────────────────────────────────
// WebGL Stardust – lvardox style
// ───────────────────────────────────────────────
(function() {
    const canvas = document.getElementById('stardust-canvas');
    const gl = canvas.getContext('webgl', { alpha: false }) || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.warn('WebGL not supported – falling back to plain background.');
        return;
    }

    // Vertex shader
    const vertexShaderSource = `
        attribute vec2 a_position;
        attribute float a_size;
        attribute float a_alpha;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        varying float v_alpha;
        void main() {
            // gentle parallax (reduced)
            vec2 offset = (u_mouse - u_resolution * 0.5) * 0.001 * a_size;
            vec2 pos = a_position + offset;
            vec2 clipSpace = (pos / u_resolution) * 2.0 - 1.0;
            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            gl_PointSize = a_size;
            v_alpha = a_alpha;
        }
    `;

    // Fragment shader – soft glow
    const fragmentShaderSource = `
        precision mediump float;
        varying float v_alpha;
        void main() {
            float dist = length(gl_PointCoord - 0.5);
            float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
            alpha *= v_alpha;
            gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    // Star data
    const STAR_COUNT = 500;
    const positions = new Float32Array(STAR_COUNT * 2);
    const sizes = new Float32Array(STAR_COUNT);
    const alphas = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
        positions[i * 2] = Math.random();
        positions[i * 2 + 1] = Math.random();
        sizes[i] = Math.random() * 3.0 + 0.3;   // 0.3 – 3.0
        alphas[i] = Math.random() * 0.8 + 0.2;
    }

    // Buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    const sizeLoc = gl.getAttribLocation(program, 'a_size');
    gl.enableVertexAttribArray(sizeLoc);
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);

    const alphaBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.STATIC_DRAW);
    const alphaLoc = gl.getAttribLocation(program, 'a_alpha');
    gl.enableVertexAttribArray(alphaLoc);
    gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, 0, 0);

    // Uniforms
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    function resize() {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    }, { passive: true });
    window.addEventListener('touchend', () => {
        mouseX = canvas.width / 2;
        mouseY = canvas.height / 2;
    });

    // Twinkling
    function updateAlphas(time) {
        for (let i = 0; i < STAR_COUNT; i++) {
            const speed = (i * 0.01) % 0.5 + 0.3;
            const twinkle = Math.sin(time * speed + i) * 0.1 + 0.9;  // gentler
            alphas[i] = (Math.random() * 0.2 + 0.4) * twinkle;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.DYNAMIC_DRAW);
    }

    let lastTime = 0;
    function animate(now) {
        resize();
        const dt = now - lastTime;
        if (dt > 200 || lastTime === 0) {
            updateAlphas(now * 0.001);
            lastTime = now;
        }

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
        gl.uniform2f(mouseLoc, mouseX, mouseY);

        gl.drawArrays(gl.POINTS, 0, STAR_COUNT);
        requestAnimationFrame(animate);
    }

    resize();
    animate(0);
})();

// ───────────────────────────────────────────────
// Portfolio interactions (unchanged)
// ───────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

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

const workCards = document.querySelectorAll('.work-card.reveal');
workCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.06}s`;
});

if (window.innerWidth > 768) {
    const portrait = document.querySelector('.hero-portrait');
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 14;
        const y = (e.clientY / window.innerHeight - 0.5) * 14;
        portrait.style.transform = `translate(${x}px, ${y}px)`;
        portrait.style.transition = 'transform 0.25s ease-out';
    });
}
