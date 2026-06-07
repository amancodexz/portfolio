/**
 * Aman Kumar - Holographic 3D Space Portfolio
 * Core Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initHeaderScroll();
    initTypewriter();
    init3DTilt();
    initFormValidation();
    initSystemTime();
    initScrollReveal();
});

/* ==========================================================================
   1. CANVAS STARFIELD PARTICLE SYSTEM
   ========================================================================== */
function initParticles() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };
    
    // Configs
    const particleCount = calculateParticleCount();
    const connectionDistance = 110;
    const repulsionStrength = 0.55;
    
    function calculateParticleCount() {
        // Adapt density based on screen size
        const area = window.innerWidth * window.innerHeight;
        return Math.floor(area / 9000);
    }
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Re-generate particles if screen changes significantly
        if (particles.length === 0) {
            createParticles();
        }
    }
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // Velocity
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            // Appearance
            this.radius = Math.random() * 2 + 0.5;
            this.color = Math.random() > 0.4 ? 'rgba(0, 245, 255, ' : 'rgba(123, 47, 255, ';
            this.alpha = Math.random() * 0.5 + 0.2;
            this.baseAlpha = this.alpha;
            this.pulseDir = Math.random() > 0.5 ? 0.005 : -0.005;
        }
        
        update() {
            // Screen boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
            
            // Mouse repulsion physics
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.hypot(dx, dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Vector direction away from mouse
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * repulsionStrength * 4;
                    this.y += Math.sin(angle) * force * repulsionStrength * 4;
                }
            }
            
            // Standard inertia movement
            this.x += this.vx;
            this.y += this.vy;
            
            // Subtle pulse alpha
            this.alpha += this.pulseDir;
            if (this.alpha > this.baseAlpha + 0.15 || this.alpha < this.baseAlpha - 0.15) {
                this.pulseDir = -this.pulseDir;
            }
            
            // Bound checks to ensure values stay valid
            this.alpha = Math.max(0.1, Math.min(0.8, this.alpha));
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${this.color}${this.alpha})`;
            ctx.shadowBlur = this.radius * 2;
            ctx.shadowColor = this.color.includes('0, 245') ? '#00f5ff' : '#7b2fff';
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow for lines performance
        }
    }
    
    function createParticles() {
        particles = [];
        const count = calculateParticleCount();
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.hypot(dx, dy);
                
                if (distance < connectionDistance) {
                    // Draw neon connecting constellation strings
                    const alpha = (1 - (distance / connectionDistance)) * 0.12;
                    ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        connectParticles();
        requestAnimationFrame(animate);
    }
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Init execution
    resizeCanvas();
    animate();
}

/* ==========================================================================
   2. TYPEWRITER / GLITCH EFFECT
   ========================================================================== */
function initTypewriter() {
    const target = document.querySelector('.sub-title .typewriter');
    if (!target) return;
    
    const words = JSON.parse(target.getAttribute('data-words') || '[]');
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentText = '';
    
    function type() {
        const fullWord = words[wordIndex];
        
        if (isDeleting) {
            // Backspacing
            currentText = fullWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            // Typing
            currentText = fullWord.substring(0, charIndex + 1);
            charIndex++;
        }
        
        target.innerHTML = currentText;
        
        let typeSpeed = isDeleting ? 40 : 80;
        
        if (!isDeleting && currentText === fullWord) {
            // Word completed - pause before deleting
            typeSpeed = 1800;
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            // Word deleted - switch to next word
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 400; // Small delay before typing next word
        }
        
        setTimeout(type, typeSpeed);
    }
    
    // Start typing cycle
    setTimeout(type, 1000);
}

/* ==========================================================================
   3. NATIVE JS 3D CARD TILT
   ========================================================================== */
function init3DTilt() {
    const cards = document.querySelectorAll('.tilt-element');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate tilt angle ratio
            const maxTilt = parseFloat(card.getAttribute('data-tilt-max') || '10');
            const rotateX = ((y - centerY) / centerY) * -maxTilt;
            const rotateY = ((x - centerX) / centerX) * maxTilt;
            
            card.style.setProperty('--rx', `${rotateX}deg`);
            card.style.setProperty('--ry', `${rotateY}deg`);
            
            // Dynamic spotlight shadow gradient follows mouse
            const pctX = (x / rect.width) * 100;
            const pctY = (y / rect.height) * 100;
            card.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(0, 242, 254, 0.05) 0%, var(--color-bg-card) 60%)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset transforms smoothly
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
            card.style.background = 'var(--color-bg-card)';
        });
    });
}

/* Unused 3D Skill Cube code removed to optimize performance */

/* ==========================================================================
   5. NAVIGATION SCROLL & ACTIVE INDICATORS
   ========================================================================== */
function initHeaderScroll() {
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // Header shadow on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Nav Toggle Mobile Menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Animate hamburger lines
            const bars = navToggle.querySelectorAll('.bar');
            if (navToggle.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
        
        // Auto-close menu on link clicks
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.querySelectorAll('.bar').forEach(bar => bar.style.transform = 'none');
                navToggle.querySelectorAll('.bar')[1].style.opacity = '1';
            });
        });
    }
    
    // ScrollSpy Highlight Navigation links using IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // Narrow active target band in view center
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   6. SCROLL REVEAL / DIAGNOSTIC STAT NUMBERS INCREMENT
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-3d');
    const statsSection = document.querySelector('#about');
    let statsTriggered = false;
    
    // Timeline slide-in reveals
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('scroll-reveal-3d')) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
                // Unobserve once shown to prevent looping
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    
    revealElements.forEach(el => {
        if (!el.classList.contains('scroll-reveal-3d')) {
            // Init styles for reveal transitions
            el.style.opacity = '0';
            el.style.transform = 'translateY(35px)';
            el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        }
        revealObserver.observe(el);
    });
    
    // Stats incremental animation observer
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !statsTriggered) {
                statsTriggered = true;
                animateStatsNumbers();
            }
        }, { threshold: 0.25 });
        
        statsObserver.observe(statsSection);
    }
    
    function animateStatsNumbers() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(num => {
            const isTextResolver = num.classList.contains('text-resolver');
            
            if (isTextResolver) {
                // Holographic cryptographic decrypt animation for text stats
                const targetText = num.getAttribute('data-target') || '';
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=-_/';
                let currentIteration = 0;
                
                const decryptInterval = setInterval(() => {
                    num.textContent = targetText
                        .split('')
                        .map((char, index) => {
                            if (char === ' ') return ' ';
                            if (index < currentIteration) {
                                return targetText[index];
                            }
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join('');
                    
                    if (currentIteration >= targetText.length) {
                        clearInterval(decryptInterval);
                    }
                    
                    currentIteration += 1 / 3;
                }, 30);
            } else {
                // Standard number count-up animation supporting floats and integers
                const targetStr = num.getAttribute('data-target') || '0';
                const targetValue = parseFloat(targetStr);
                const isFloat = targetStr.includes('.');
                const hasPlus = targetStr === '3'; // For Hackathons: 3+
                
                let startValue = 0;
                const duration = 1800; // ms
                const interval = 20; // tick step
                const totalSteps = duration / interval;
                const stepIncrement = targetValue / totalSteps;
                
                const counter = setInterval(() => {
                    startValue += stepIncrement;
                    if (startValue >= targetValue) {
                        num.textContent = (isFloat ? targetValue.toFixed(2) : targetValue) + (hasPlus ? '+' : '');
                        clearInterval(counter);
                    } else {
                        num.textContent = (isFloat ? startValue.toFixed(2) : Math.floor(startValue)) + (hasPlus ? '+' : '');
                    }
                }, interval);
            }
        });
    }
}

/* ==========================================================================
   7. CONTACT GLOW FORM VALIDATIONS
   ========================================================================== */
function initFormValidation() {
    const form = document.getElementById('cyber-contact-form');
    const overlay = document.getElementById('form-feedback-overlay');
    const resetBtn = document.getElementById('feedback-reset-btn');
    if (!form) return;
    
    const inputs = form.querySelectorAll('.cyber-input');
    
    // Realtime label animations / blur validations
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            // Clear validation borders on keystrokes
            const group = input.parentElement;
            group.classList.remove('invalid');
        });
    });
    
    function validateField(input) {
        const group = input.parentElement;
        const msg = group.querySelector('.validation-msg');
        let isValid = true;
        
        if (input.required && !input.value.trim()) {
            isValid = false;
            if (msg) msg.textContent = 'ERR: STACK_EMPTY_REQUIRED_FIELD';
        } else if (input.type === 'email' && input.value.trim()) {
            // Regex validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                isValid = false;
                if (msg) msg.textContent = 'ERR: MALFORMED_EMAIL_PROTOCOL';
            }
        }
        
        if (!isValid) {
            group.classList.add('invalid');
        } else {
            group.classList.remove('invalid');
        }
        
        return isValid;
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isFormValid = true;
        
        inputs.forEach(input => {
            const isFieldValid = validateField(input);
            if (!isFieldValid) isFormValid = false;
        });
        
        if (isFormValid) {
            // Transmit packet animation sequence
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.querySelector('.btn-text').textContent;
            
            submitBtn.disabled = true;
            submitBtn.querySelector('.btn-text').textContent = 'TRANSMITTING_PACKETS...';
            submitBtn.querySelector('.btn-icon i').className = 'fa-solid fa-sync fa-spin';
            
            setTimeout(() => {
                // Fade-in success modal overlay
                if (overlay) overlay.classList.remove('hidden');
                
                // Reset submit button state
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').textContent = originalText;
                submitBtn.querySelector('.btn-icon i').className = 'fa-solid fa-paper-plane';
                
                // Reset form values
                form.reset();
                inputs.forEach(i => i.blur());
            }, 1800);
        }
    });
    
    if (resetBtn && overlay) {
        resetBtn.addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
    }
}

/* ==========================================================================
   8. SYSTEM LATENCY CLOCK TIMER
   ========================================================================== */
function initSystemTime() {
    const timer = document.getElementById('system-time');
    if (!timer) return;
    
    function updateClock() {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
        
        // Show military sci-fi format with milliseconds
        timer.textContent = `${hrs}:${mins}:${secs}.${ms}`;
    }
    
    setInterval(updateClock, 45);
}
