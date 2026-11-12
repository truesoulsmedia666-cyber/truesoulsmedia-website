document.addEventListener('DOMContentLoaded', () => {

    // 1. Scroll Reveal Animation for Glass Cards
    const revealOptions = {
        threshold: 0,
        rootMargin: "0px 0px 50px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // Safety fallback: reveal all sections after 1.8s in case observer fails
    setTimeout(() => {
        revealElements.forEach(el => el.classList.add('active'));
    }, 1800);

    // 2. Background Canvas Layer Switching
    const sections = document.querySelectorAll('.section');
    const bgLayers = document.querySelectorAll('.bg-layer');

    const bgObserverOptions = {
        threshold: 0.45
    };

    const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetIndex = entry.target.getAttribute('data-bg-index');

                if (targetIndex !== null) {
                    bgLayers.forEach(layer => layer.classList.remove('active'));
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
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 4. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        const svgMenu = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        const svgClose = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        const dropdowns = document.querySelectorAll('.nav-dropdown');

        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isActive = navLinks.classList.contains('active');
            document.body.classList.toggle('menu-open', isActive);
            if (isActive) {
                mobileMenuBtn.innerHTML = svgClose;
            } else {
                mobileMenuBtn.innerHTML = svgMenu;
                dropdowns.forEach(d => d.classList.remove('open'));
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (link.parentElement.classList.contains('nav-dropdown')) {
                    return;
                }
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                mobileMenuBtn.innerHTML = svgMenu;
                dropdowns.forEach(d => d.classList.remove('open'));
            });
        });

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

    // 5. TRUE SOULS — SALES CRM Lead Capture & Web3Forms Submission
    const contactForms = document.querySelectorAll('#contactForm, .tsm-crm-form');

    contactForms.forEach((contactForm) => {
        const formNotification = contactForm.parentElement.querySelector('.form-notification') || document.getElementById('formNotification');

        // Pre-select service if URL has ?service= or ?package=
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedService = urlParams.get('service');
        const preselectedPackage = urlParams.get('package');
        if (preselectedService) {
            const serviceSelect = contactForm.querySelector('[name="service"]');
            if (serviceSelect) {
                serviceSelect.value = preselectedService;
            }
        }
        if (preselectedPackage) {
            const msgField = contactForm.querySelector('[name="message"]');
            if (msgField && !msgField.value) {
                msgField.value = `Interested Package: ${preselectedPackage}\n`;
            }
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Honeypot anti-spam check
            const honeypot = contactForm.querySelector('[name="botcheck"], [name="website_hp"]');
            if (honeypot && honeypot.value) {
                return;
            }

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            btn.innerHTML = 'Sending to True Souls CRM...';
            btn.style.opacity = '0.75';
            btn.disabled = true;

            const formData = new FormData(contactForm);
            formData.set('crm_pipeline', 'TRUE SOULS — SALES CRM');
            formData.set('crm_stage', 'New Inquiry');
            formData.set('lead_source_url', window.location.href);
            formData.set('submitted_at_ist', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            // Build WhatsApp Fast-Track URL with submitted details
            const waText = encodeURIComponent(
                `Hello True Souls Media LLP! 👋\n\n` +
                `*New Project Inquiry (TRUE SOULS — SALES CRM)*\n` +
                `• *Name:* ${object.name || '-'}\n` +
                `• *Business:* ${object.company || '-'}\n` +
                `• *Service:* ${object.service || '-'}\n` +
                `• *Budget:* ${object.budget || '-'}\n` +
                `• *Timeline:* ${object.timeline || '-'}\n` +
                `• *Location:* ${object.city || '-'}\n` +
                `• *Details:* ${object.message || '-'}`
            );
            const waFastTrackUrl = `https://wa.me/919061286660?text=${waText}`;

            try {
                // Optional secondary CRM webhook (Google Sheets / Make / Airtable)
                if (window.TSM_CRM_WEBHOOK_URL) {
                    fetch(window.TSM_CRM_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: json
                    }).catch(() => {});
                }

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
                    btn.innerHTML = '✓ Logged in TRUE SOULS — SALES CRM';
                    btn.style.background = '#C8FF00';
                    btn.style.color = '#090A0C';
                    btn.style.opacity = '1';
                    if (formNotification) {
                        formNotification.innerHTML = `✅ <strong>Inquiry Received!</strong> Your request is logged in <strong>TRUE SOULS — SALES CRM</strong> (Stage: <em>New Inquiry</em>). We will respond within 2–4 business hours.<br><a href="${waFastTrackUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:0.4rem;margin-top:0.65rem;padding:0.5rem 1rem;background:#25d366;color:#fff;border-radius:999px;text-decoration:none;font-weight:700;font-size:0.84rem;">⚡ Instant WhatsApp Fast-Track →</a>`;
                        formNotification.className = 'form-notification success';
                    }
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
            } catch (error) {
                btn.innerHTML = 'Redirecting to WhatsApp...';
                btn.style.opacity = '1';
                if (formNotification) {
                    formNotification.innerHTML = `⚡ Connect with our team directly on WhatsApp to fast-track your quote: <a href="${waFastTrackUrl}" target="_blank" rel="noopener" style="color:#C8FF00;font-weight:700;text-decoration:underline;">Open WhatsApp with your details →</a>`;
                    formNotification.className = 'form-notification success';
                }
            }

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.opacity = '1';
                btn.disabled = false;
            }, 5000);
        });
    });

    // 6. Custom Select Dropdowns
    document.querySelectorAll('.custom-select-wrapper').forEach((customSelectWrapper) => {
        const trigger = customSelectWrapper.querySelector('.custom-select-trigger');
        const optionsList = customSelectWrapper.querySelector('.custom-select-options');
        const customOptions = customSelectWrapper.querySelectorAll('.custom-option');
        const nativeSelect = customSelectWrapper.querySelector('select');

        if (!trigger || !optionsList || !nativeSelect) return;
        const triggerText = trigger.querySelector('span');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            trigger.classList.toggle('active');
            optionsList.classList.toggle('open');
        });

        customOptions.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = opt.getAttribute('data-value');
                if (triggerText) triggerText.textContent = opt.textContent.trim();
                trigger.style.color = 'var(--text-white)';
                nativeSelect.value = val;
                nativeSelect.dispatchEvent(new Event('change'));
                customOptions.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                trigger.classList.remove('active');
                optionsList.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!customSelectWrapper.contains(e.target)) {
                trigger.classList.remove('active');
                optionsList.classList.remove('open');
            }
        });

        const parentForm = customSelectWrapper.closest('form');
        if (parentForm) {
            parentForm.addEventListener('reset', () => {
                if (triggerText) triggerText.textContent = 'Select Primary Service';
                trigger.style.color = '';
                customOptions.forEach(o => o.classList.remove('selected'));
            });
        }
    });

    // 7. Responsive Canvas Particles (Controlled Electric Lime)
    const canvas = document.getElementById('bg-canvas');
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (canvas && !prefersReducedMotion) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let lastWidth = 0;

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            if (Math.abs(width - lastWidth) > 50 || particles.length === 0) {
                initParticles();
                lastWidth = width;
            }
        }

        function initParticles() {
            particles = [];
            const numParticles = Math.min(Math.floor((width * height) / 14000), 65);
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.4 + 0.5,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    opacity: Math.random() * 0.32 + 0.08
                });
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 255, 0, ${p.opacity})`;
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i++) {
                const pi = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const pj = particles[j];
                    const dx = pi.x - pj.x;
                    const dy = pi.y - pj.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < 10000) {
                        const distance = Math.sqrt(distSq);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(200, 255, 0, ${0.11 - (distance / 100) * 0.11})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(pi.x, pi.y);
                        ctx.lineTo(pj.x, pj.y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

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

    // 8. Portfolio Filter
    const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card-item');

    if (filterBtns.length > 0 && portfolioCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                portfolioCards.forEach(card => {
                    card.style.opacity = '0.1';
                    card.style.transform = 'scale(0.96)';

                    setTimeout(() => {
                        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                            card.style.display = 'block';
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'scale(1)';
                            }, 40);
                        } else {
                            card.style.display = 'none';
                        }
                    }, 180);
                });
            });
        });
    }

    // 9. Local file protocol link resolution
    if (window.location.protocol === 'file:') {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

            if (href === '/') {
                e.preventDefault();
                window.location.href = 'index.html';
                return;
            }
            if (href.startsWith('/#')) {
                e.preventDefault();
                window.location.href = 'index.html' + href.substring(1);
                return;
            }
            const cleanHref = href.startsWith('/') ? href.substring(1) : href;
            const parts = cleanHref.split('#');
            if (parts[0] && !parts[0].includes('.')) {
                e.preventDefault();
                window.location.href = parts[0] + '.html' + (parts[1] ? '#' + parts[1] : '');
            }
        });
    }

});
