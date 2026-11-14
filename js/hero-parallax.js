/**
 * UFF Medicina 2027 - Hero Depth Parallax
 * Desktop Mouse Movement + Mobile Gyroscope (DeviceOrientation)
 */
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.getElementById('hero');
    const bgLayer = document.getElementById('hero-bg-layer');
    const textLayer = document.getElementById('hero-text-layer');
    const doctorsLayer = document.getElementById('hero-doctors-layer');

    // -----------------------------------------------------------------
    // CÁLCULO DINÂMICO DE ALTURA E POSIÇÃO DOS MÉDICOS & TÍTULO NO MOBILE
    // Calcula a posição do texto com base na navbar e a altura dos médicos
    // garantindo leitura 100% livre e visual 3D perfeito em qualquer resolução
    // -----------------------------------------------------------------
    function adjustHeroMobileLayout() {
        if (!hero || !textLayer || !doctorsLayer) return;

        if (window.innerWidth >= 768) {
            textLayer.style.top = '';
            textLayer.style.position = '';
            doctorsLayer.style.top = '';
            doctorsLayer.style.height = '';
            return;
        }

        textLayer.style.position = 'relative';
        textLayer.style.top = '0px';

        const heroH = hero.clientHeight || window.innerHeight;
        const titleTop = textLayer.offsetTop;
        const titleHeight = textLayer.offsetHeight || 76;
        const titleBottom = titleTop + titleHeight;

        const doctorsTop = Math.max(100, Math.min(Math.round(heroH * 0.30), titleBottom + 2));
        doctorsLayer.style.top = `${doctorsTop}px`;
        doctorsLayer.style.height = `${Math.max(240, heroH - doctorsTop)}px`;
    }

    adjustHeroMobileLayout();
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(adjustHeroMobileLayout).catch(() => {});
    }
    window.addEventListener('load', adjustHeroMobileLayout, { once: true });
    window.addEventListener('resize', adjustHeroMobileLayout, { passive: true });
    window.addEventListener('orientationchange', () => {
        setTimeout(adjustHeroMobileLayout, 100);
    }, { passive: true });

    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Subtle Depth Parallax between the 3 stacked planes (Desktop Mouse + Mobile Gyroscope)
    if (hero && bgLayer && textLayer && doctorsLayer) {
        // Desktop Mouse Parallax (otimizado com gsap.quickTo e suspenso durante o scroll)
        const setBgX = gsap.quickTo(bgLayer, 'x', { duration: 0.9, ease: 'power2.out' });
        const setBgY = gsap.quickTo(bgLayer, 'y', { duration: 0.9, ease: 'power2.out' });
        const setTextX = gsap.quickTo(textLayer, 'x', { duration: 0.8, ease: 'power2.out' });
        const setTextY = gsap.quickTo(textLayer, 'y', { duration: 0.8, ease: 'power2.out' });
        const setDocX = gsap.quickTo(doctorsLayer, 'x', { duration: 0.7, ease: 'power2.out' });
        const setDocY = gsap.quickTo(doctorsLayer, 'y', { duration: 0.7, ease: 'power2.out' });

        hero.addEventListener('mousemove', (e) => {
            if (window.pageYOffset > 10) return;

            const x = (e.clientX / window.innerWidth - 0.5);
            const y = (e.clientY / window.innerHeight - 0.5);

            setBgX(-x * 12);
            setBgY(-y * 8);
            setTextX(x * 18);
            setTextY(y * 10);
            setDocX(x * 32);
            setDocY(y * 14);
        }, { passive: true });

        hero.addEventListener('mouseleave', () => {
            if (window.pageYOffset > 10) return;
            setBgX(0);
            setBgY(0);
            setTextX(0);
            setTextY(0);
            setDocX(0);
            setDocY(0);
        });

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
            let isHeroVisible = true;
            if ('IntersectionObserver' in window) {
                const heroObserver = new IntersectionObserver((entries) => {
                    isHeroVisible = entries[0].isIntersecting;
                }, { threshold: 0.05 });
                heroObserver.observe(hero);
            }

            let initialBeta = null;
            let initialGamma = null;
            let orientationActive = false;

            const handleOrientation = (e) => {
                if (!isHeroVisible || e.beta === null || e.gamma === null) return;

                if (initialBeta === null) {
                    initialBeta = e.beta;
                    initialGamma = e.gamma;
                }

                const rawDeltaX = (e.gamma - initialGamma) / 18;
                const rawDeltaY = (e.beta - initialBeta) / 18;

                const deltaX = Math.max(-1, Math.min(1, rawDeltaX));
                const deltaY = Math.max(-1, Math.min(1, rawDeltaY));

                initialBeta += (e.beta - initialBeta) * 0.015;
                initialGamma += (e.gamma - initialGamma) * 0.015;

                const isMobile = window.innerWidth < 768;
                if (isMobile) return;

                const docDisplaceX = deltaX * 36;
                const docDisplaceY = deltaY * 16;
                const textDisplaceX = deltaX * 20;
                const textDisplaceY = deltaY * 12;
                const bgDisplaceX = -deltaX * 14;
                const bgDisplaceY = -deltaY * 10;

                gsap.to(bgLayer, { 
                    x: bgDisplaceX, 
                    y: bgDisplaceY, 
                    scale: 1.03, 
                    duration: 0.7, 
                    ease: 'power2.out', 
                    overwrite: 'auto' 
                });
                gsap.to(textLayer, { 
                    x: textDisplaceX, 
                    y: textDisplaceY, 
                    duration: 0.65, 
                    ease: 'power2.out', 
                    overwrite: 'auto' 
                });
                gsap.to(doctorsLayer, { 
                    x: docDisplaceX, 
                    y: docDisplaceY, 
                    duration: 0.55, 
                    ease: 'power2.out', 
                    overwrite: 'auto' 
                });
            };

            window.addEventListener('orientationchange', () => {
                initialBeta = null;
                initialGamma = null;
            });

            const requestOrientationPermission = () => {
                if (orientationActive) return;

                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                orientationActive = true;
                                window.addEventListener('deviceorientation', handleOrientation, { passive: true });
                            }
                        })
                        .catch(() => {});
                } else if ('DeviceOrientationEvent' in window) {
                    orientationActive = true;
                    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
                }
            };

            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
                requestOrientationPermission();
            }

            const enableOnFirstGesture = () => {
                requestOrientationPermission();
                window.removeEventListener('touchend', enableOnFirstGesture);
                window.removeEventListener('click', enableOnFirstGesture);
            };
            window.addEventListener('touchend', enableOnFirstGesture, { once: true, passive: true });
            window.addEventListener('click', enableOnFirstGesture, { once: true });
        }
    }
});
