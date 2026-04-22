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

    // 4. Form Submit
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Initializing...';
            btn.style.opacity = '0.7';
            
            const formData = new FormData(contactForm);
            
            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })
            .then(() => {
                btn.innerText = 'Protocol Confirmed';
                btn.style.backgroundColor = '#25d366'; // Green success
                btn.style.color = 'black';
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                    btn.style.opacity = '1';
                }, 3000);
            })
            .catch((error) => {
                console.error('Form submission error:', error);
                btn.innerText = 'Connection Failed';
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.opacity = '1';
                }, 3000);
            });
        });
    }

});
