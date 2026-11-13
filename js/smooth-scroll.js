/**
 * UFF Medicina 2027 - Smooth Scroll Físico (Lenis + GSAP ScrollTrigger)
 * Elimina saltos discretos do scroll do mouse e sincroniza 1:1 com GSAP Ticker a 60/120 FPS.
 */
(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion || typeof Lenis === 'undefined') {
            window.__lenis = null;
            return;
        }

        const lenis = new Lenis({
            duration: 1.05,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.4,
            syncTouch: false
        });

        window.__lenis = lenis;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            function fallbackRaf(time) {
                lenis.raf(time);
                requestAnimationFrame(fallbackRaf);
            }
            requestAnimationFrame(fallbackRaf);
        }
    });
})();
