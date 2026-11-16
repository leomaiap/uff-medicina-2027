document.addEventListener("DOMContentLoaded", () => {
        // 4. FAQ ACCORDION INTERATIVO
        // -------------------------------------------------------------
        document.querySelectorAll('.faq-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const answer = btn.nextElementSibling;
                const icon = btn.querySelector('.faq-icon');
                const isHidden = answer.classList.contains('hidden');

                document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
                document.querySelectorAll('.faq-icon').forEach(i => { i.textContent = '+'; i.style.transform = 'rotate(0deg)'; });

                if (isHidden) {
                    answer.classList.remove('hidden');
                    icon.textContent = '−';
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        });

        // -------------------------------------------------------------
        // 5. COUNTDOWN TIMER (PREVISÃO DE ABERTURA DAS INSCRIÇÕES 2027)
        // -------------------------------------------------------------
        const targetDate = new Date('2027-01-05T10:00:00-03:00');
        const daysEl = document.getElementById('hud-days');
        const hoursEl = document.getElementById('hud-hours');
        const minutesEl = document.getElementById('hud-minutes');
        const secondsEl = document.getElementById('hud-seconds');

        function updateCountdown() {
            if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
            const diff = Math.max(0, targetDate - new Date());

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            daysEl.textContent = d < 10 ? '0' + d : String(d);
            hoursEl.textContent = h < 10 ? '0' + h : String(h);
            minutesEl.textContent = m < 10 ? '0' + m : String(m);
            secondsEl.textContent = s < 10 ? '0' + s : String(s);
        }

        if (daysEl) {
            setInterval(updateCountdown, 1000);
            updateCountdown();
        }

        // -------------------------------------------------------------
        // 6. SMOOTH ANCHOR NAVIGATION (INTEGRADA AO LENIS)
        // -------------------------------------------------------------
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    if (window.__lenis) {
                        window.__lenis.scrollTo(targetEl, { duration: 1.1 });
                    } else {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // -------------------------------------------------------------

            // 9. ANIMATED STAT COUNTERS ON SCROLL (107 VAGAS & MÉTRICAS)
            // -------------------------------------------------------------
            const vagasSection = document.getElementById('vagas');
            if (vagasSection) {
                const counters = [
                    { id: 'counter-vagas', target: 107, duration: 2.2 },
                    { id: 'counter-especialidades', target: 13, duration: 1.6 },
                    { id: 'counter-gratuito', target: 100, duration: 2.0 }
                ];

                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                if (prefersReducedMotion || typeof gsap === 'undefined') {
                    counters.forEach(c => {
                        const el = document.getElementById(c.id);
                        if (el) el.textContent = c.target;
                    });
                } else {
                    // Incremento numerico suave (0 -> target) engatilhado no scroll
                    counters.forEach(c => {
                        const el = document.getElementById(c.id);
                        if (!el) return;
                        const proxy = { val: 0 };
                        gsap.to(proxy, {
                            val: c.target,
                            duration: c.duration,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: '#vagas',
                                start: 'top 85%',
                                once: true
                            },
                            onUpdate: () => {
                                el.textContent = Math.round(proxy.val);
                            }
                        });
                    });
                }
            }

            // -------------------------------------------------------------
});
