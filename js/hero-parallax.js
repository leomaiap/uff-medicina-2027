/**
 * UFF Medicina 2027 - Hero Depth Parallax
 * Desktop Mouse Movement + Mobile Gyroscope (DeviceOrientation)
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

            const hero = document.getElementById('hero');
            const bgLayer = document.getElementById('hero-bg-layer');
            const textLayer = document.getElementById('hero-text-layer');
            const doctorsLayer = document.getElementById('hero-doctors-layer');

            // Subtle Depth Parallax between the 3 stacked planes (Desktop Mouse + Mobile Gyroscope)
            if (hero && bgLayer && textLayer && doctorsLayer) {
                // Desktop Mouse Parallax
                hero.addEventListener('mousemove', (e) => {
                    const x = (e.clientX / window.innerWidth - 0.5);
                    const y = (e.clientY / window.innerHeight - 0.5);

                    gsap.to(bgLayer, { x: -x * 12, y: -y * 8, scale: 1.03, duration: 1, ease: 'power2.out', overwrite: 'auto' });
                    gsap.to(textLayer, { x: x * 18, y: y * 10, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
                    gsap.to(doctorsLayer, { x: x * 32, y: y * 14, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
                });

                hero.addEventListener('mouseleave', () => {
                    gsap.to(bgLayer, { x: 0, y: 0, scale: 1.03, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
                    gsap.to(textLayer, { x: 0, y: 0, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
                    gsap.to(doctorsLayer, { x: 0, y: 0, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
                });

                // -----------------------------------------------------------------
                // Mobile Motion Parallax (Giroscópio / DeviceOrientation suave)
                // Compatível com Android (Chrome) e iOS (Safari com requestPermission)
                // -----------------------------------------------------------------
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
                        // Economia de bateria: só processa se o Hero estiver visível na tela
                        if (!isHeroVisible || e.beta === null || e.gamma === null) return;

                        // Calibra a postura natural do usuário na primeira leitura
                        if (initialBeta === null) {
                            initialBeta = e.beta;
                            initialGamma = e.gamma;
                        }

                        // Variação angular confortável (~18 graus de inclinação do pulso = deflexão máxima)
                        const rawDeltaX = (e.gamma - initialGamma) / 18;
                        const rawDeltaY = (e.beta - initialBeta) / 18;

                        const deltaX = Math.max(-1, Math.min(1, rawDeltaX));
                        const deltaY = Math.max(-1, Math.min(1, rawDeltaY));

                        // Recentralização gradual contínua (evita saltos se o usuário mudar de postura devagar)
                        initialBeta += (e.beta - initialBeta) * 0.015;
                        initialGamma += (e.gamma - initialGamma) * 0.015;

                        // Deflexão calibrada para telas móveis (mantém os médicos 100% seguros sem encostar nas bordas)
                        const isMobile = window.innerWidth < 768;
                        const docDisplaceX = isMobile ? deltaX * 12 : deltaX * 36;
                        const docDisplaceY = isMobile ? deltaY * 8 : deltaY * 16;
                        const textDisplaceX = isMobile ? deltaX * 8 : deltaX * 20;
                        const textDisplaceY = isMobile ? deltaY * 6 : deltaY * 12;
                        const bgDisplaceX = isMobile ? -deltaX * 6 : -deltaX * 14;
                        const bgDisplaceY = isMobile ? -deltaY * 5 : -deltaY * 10;

                        // Amortecimento cinematográfico via GSAP (elimina micro-tremores naturais da mão)
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

                    // Re-calibra centro se o usuário girar o aparelho entre modo retrato e paisagem
                    window.addEventListener('orientationchange', () => {
                        initialBeta = null;
                        initialGamma = null;
                    });

                    const requestOrientationPermission = () => {
                        if (orientationActive) return;

                        // iOS 13+ Safari exige permissão via gesto do usuário (click / touchend)
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
                            // Android Chrome e outros navegadores sem necessidade de popup
                            orientationActive = true;
                            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
                        }
                    };

                    // No Android Chrome, inicia imediatamente sem esperar toque
                    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
                        requestOrientationPermission();
                    }

                    // No iOS Safari, ativa com o primeiro gesto/toque na página
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
