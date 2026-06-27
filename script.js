document.addEventListener('DOMContentLoaded', () => {

    // 1. Scroll Reveal Animation for Glass Cards
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: observer.unobserve(entry.target); // remove if you want them to animate out when scrolling up
            } else {
                entry.target.classList.remove('active'); // Retrigger on scroll up
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 2. Background Canvas Layer Switching
    const sections = document.querySelectorAll('.section');
    const bgLayers = document.querySelectorAll('.bg-layer');

    // We'll use an intersection observer to detect which section is currently focused in the viewport
    const bgObserverOptions = {
        threshold: 0.5 // trigger when section is 50% visible
    };

    const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetIndex = entry.target.getAttribute('data-bg-index');

                if (targetIndex !== null) {
                    // Deactivate all layers
                    bgLayers.forEach(layer => layer.classList.remove('active'));

                    // Activate target layer
                    const targetLayer = document.querySelector(`.bg-layer[data-index="${targetIndex}"]`);
                    if (targetLayer) {
                        targetLayer.classList.add('active');
                    }
                }
            }
        });
    }, bgObserverOptions);

    sections.forEach(sec => bgObserver.observe(sec));

    // 3. Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        const svgMenu = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        const svgClose = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        const dropdowns = document.querySelectorAll('.nav-dropdown');

        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            if (navLinks.classList.contains('active')) {
                mobileMenuBtn.innerHTML = svgClose;
            } else {
                mobileMenuBtn.innerHTML = svgMenu;
                // Clean reset dropdowns when closing menu
                dropdowns.forEach(d => d.classList.remove('open'));
            }
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // If it is the main Services dropdown trigger, do not close the mobile menu
                if (link.parentElement.classList.contains('nav-dropdown')) {
                    return;
                }
                navLinks.classList.remove('active');
                mobileMenuBtn.innerHTML = svgMenu;
                // Reset dropdowns
                dropdowns.forEach(d => d.classList.remove('open'));
            });
        });

        // Mobile dropdown toggle
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector(':scope > a');
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        dropdown.classList.toggle('open');
                    }
                });
            }
        });
    }

    // 4. Form Submit — Web3Forms
    const contactForm = document.getElementById('contactForm');
    const formNotification = document.getElementById('formNotification');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            // Loading state
            btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });

                const result = await response.json();

                if (result.success) {
                    // Success
                    btn.innerHTML = '<i class="bx bx-check-circle"></i> Message Sent!';
                    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
                    btn.style.opacity = '1';
                    if (formNotification) {
                        formNotification.textContent = '✅ Thank you! We received your message and will respond within 24 hours.';
                        formNotification.className = 'form-notification success';
                    }
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
            } catch (error) {
                // Error
                btn.innerHTML = '<i class="bx bx-x-circle"></i> Failed — Try Again';
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                btn.style.opacity = '1';
                if (formNotification) {
                    formNotification.textContent = '❌ Something went wrong. Please WhatsApp us directly at +91 90612 86660.';
                    formNotification.className = 'form-notification error';
                }
                console.error('Form error:', error);
            }

            // Reset button after 4 seconds
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.opacity = '1';
                btn.disabled = false;
            }, 4000);
        });
    }

    // 6. Custom Select Dropdown for Contact Form
    const customSelectWrapper = document.querySelector('.custom-select-wrapper');
    if (customSelectWrapper) {
        const trigger = customSelectWrapper.querySelector('#customSelectTrigger');
        const triggerText = trigger.querySelector('span');
        const optionsList = customSelectWrapper.querySelector('#customSelectOptions');
        const customOptions = customSelectWrapper.querySelectorAll('.custom-option');
        const nativeSelect = customSelectWrapper.querySelector('#service');

        // Toggle dropdown open/close
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            trigger.classList.toggle('active');
            optionsList.classList.toggle('open');
        });

        // Click on an option
        customOptions.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const val = opt.getAttribute('data-value');

                // Update trigger appearance
                triggerText.textContent = opt.textContent.trim();
                trigger.style.color = 'var(--text-white)'; // make it look selected

                // Update native select value
                nativeSelect.value = val;
                nativeSelect.dispatchEvent(new Event('change'));

                // Update selected option state
                customOptions.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');

                // Close dropdown
                trigger.classList.remove('active');
                optionsList.classList.remove('open');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!customSelectWrapper.contains(e.target)) {
                trigger.classList.remove('active');
                optionsList.classList.remove('open');
            }
        });

        // Reset custom select when form is reset
        if (contactForm) {
            contactForm.addEventListener('reset', () => {
                triggerText.textContent = 'Select Service';
                trigger.style.color = '';
                customOptions.forEach(o => o.classList.remove('selected'));
            });
        }
    }

    // 5. Responsive Canvas Particles
        const canvas = document.getElementById('bg-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let width, height;
            let particles = [];

            let lastWidth = window.innerWidth;

            function resize() {
                width = window.innerWidth;
                height = window.innerHeight;
                // Support high-DPI displays (Retina/Mobile)
                const dpr = window.devicePixelRatio || 1;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);

                // Only reinitialize if width changes significantly or first load
                if (Math.abs(width - lastWidth) > 50 || particles.length === 0) {
                    initParticles();
                    lastWidth = width;
                }
            }

            function initParticles() {
                particles = [];
                // Calculate number of particles based on screen size (responsive count)
                const numParticles = Math.min(Math.floor((width * height) / 12000), 80);
                for (let i = 0; i < numParticles; i++) {
                    particles.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        radius: Math.random() * 1.5 + 0.5,
                        vx: (Math.random() - 0.5) * 0.4,
                        vy: (Math.random() - 0.5) * 0.4,
                        opacity: Math.random() * 0.4 + 0.1
                    });
                }
            }

            function animate() {
                ctx.clearRect(0, 0, width, height);

                // Draw particles
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;

                    // Wrap around edges
                    if (p.x < 0) p.x = width;
                    if (p.x > width) p.x = 0;
                    if (p.y < 0) p.y = height;
                    if (p.y > height) p.y = 0;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(168, 85, 247, ${p.opacity})`;
                    if (width > 768) {
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
                    } else {
                        ctx.shadowBlur = 0;
                    }
                    ctx.fill();
                });

                // Connect nearby particles with lines for a constellation effect
                for (let i = 0; i < particles.length; i++) {
                    const pi = particles[i];
                    for (let j = i + 1; j < particles.length; j++) {
                        const pj = particles[j];
                        const dx = pi.x - pj.x;
                        const dy = pi.y - pj.y;
                        const distSq = dx * dx + dy * dy;

                        if (distSq < 10000) { // 100px threshold squared (100 * 100)
                            const distance = Math.sqrt(distSq);
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 - (distance / 100) * 0.15})`;
                            ctx.lineWidth = 0.5;
                            ctx.moveTo(pi.x, pi.y);
                            ctx.lineTo(pj.x, pj.y);
                            ctx.stroke();
                        }
                    }
                }

                requestAnimationFrame(animate);
            }

            // Add resize listener and initialize deferred
            window.addEventListener('resize', resize);
            
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => {
                    resize();
                    animate();
                });
            } else {
                setTimeout(() => {
                    resize();
                    animate();
                }, 200);
            }
        }

        // 7. Portfolio Filter
        const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
        const portfolioCards = document.querySelectorAll('.portfolio-card-item');

        if (filterBtns.length > 0 && portfolioCards.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all buttons
                    filterBtns.forEach(b => b.classList.remove('active'));
                    // Add active class to clicked button
                    btn.classList.add('active');

                    const filterValue = btn.getAttribute('data-filter');

                    portfolioCards.forEach(card => {
                        // Reset animations
                        card.style.opacity = '0.1';
                        card.style.transform = 'scale(0.95)';
                        
                        setTimeout(() => {
                            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                                card.style.display = 'block';
                                setTimeout(() => {
                                    card.style.opacity = '1';
                                    card.style.transform = 'scale(1)';
                                }, 50);
                            } else {
                                card.style.display = 'none';
                            }
                        }, 200);
                    });
                });
            });
        }
    });
