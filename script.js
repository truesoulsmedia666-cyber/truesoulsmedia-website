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

});
