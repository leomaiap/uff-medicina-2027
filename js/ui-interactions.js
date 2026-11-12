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
        // 5. COUNTDOWN TIMER EM TEMPO REAL (HUD & STICKY BAR)
        // -------------------------------------------------------------
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 18);
        targetDate.setHours(targetDate.getHours() + 9);
        targetDate.setMinutes(targetDate.getMinutes() + 42);

        function updateCountdown() {
            const now = new Date();
            const diff = targetDate - now;
            if (diff <= 0) return;

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            const dStr = d < 10 ? '0' + d : d;
            const hStr = h < 10 ? '0' + h : h;
            const mStr = m < 10 ? '0' + m : m;
            const sStr = s < 10 ? '0' + s : s;

            document.getElementById('hud-days').innerText = dStr;
            document.getElementById('hud-hours').innerText = hStr;
            document.getElementById('hud-minutes').innerText = mStr;
            document.getElementById('hud-seconds').innerText = sStr;

            const barTimer = document.getElementById('bar-timer');
            if (barTimer) barTimer.innerText = `${dStr}d ${hStr}h ${mStr}m ${sStr}s`;
        }

        setInterval(updateCountdown, 1000);
        updateCountdown();

        // -------------------------------------------------------------
        // 6. STICKY CONVERSION BAR NO SCROLL
        // -------------------------------------------------------------
        const stickyBar = document.getElementById('sticky-bar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 450) {
                stickyBar.classList.remove('translate-y-full');
            } else {
                stickyBar.classList.add('translate-y-full');
            }
        });

        // -------------------------------------------------------------
        // 7. SMOOTH ANCHOR NAVIGATION (ZERO SLINGSHOT / NATIVE FLUID SCROLL)
        // -------------------------------------------------------------
        document.addEventListener("DOMContentLoaded", () => {
            // Suaviza rolagem ao clicar em links internos (#faq, #cronograma, etc.) sem sequestrar o scroll do mouse
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                });
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

                if (prefersReducedMotion) {
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
