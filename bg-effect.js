(function () {
    const canvas = document.querySelector('.bg-constellation');
    const glow = document.querySelector('.cursor-glow');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const style = getComputedStyle(document.documentElement);
    const inkColor = style.getPropertyValue('--ink').trim() || '#1C1A15';
    const accentColor = style.getPropertyValue('--accent').trim() || '#A8431F';

    const LINK_DIST = 110;
    const MOUSE_DIST = 160;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0, h = 0, particles = [];
    let mouseX = -9999, mouseY = -9999, hasMouse = false;

    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * DPR;
        canvas.height = h * DPR;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        const count = Math.min(90, Math.max(40, Math.round((w * h) / 16000)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
        }

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < LINK_DIST) {
                    ctx.strokeStyle = inkColor;
                    ctx.globalAlpha = (1 - d / LINK_DIST) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        if (hasMouse) {
            for (const p of particles) {
                const d = Math.hypot(p.x - mouseX, p.y - mouseY);
                if (d < MOUSE_DIST) {
                    ctx.strokeStyle = accentColor;
                    ctx.globalAlpha = (1 - d / MOUSE_DIST) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.stroke();
                }
            }
        }

        ctx.globalAlpha = 0.45;
        ctx.fillStyle = inkColor;
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function loop() {
        draw();
        requestAnimationFrame(loop);
    }

    if (reduceMotion) {
        canvas.style.display = 'none';
    } else {
        resize();
        window.addEventListener('resize', resize);
        requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        hasMouse = true;
        if (glow) {
            glow.style.left = mouseX + 'px';
            glow.style.top = mouseY + 'px';
        }
    });

    document.addEventListener('mouseleave', () => {
        hasMouse = false;
    });
})();
