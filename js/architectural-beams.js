/**
 * UFF Medicina 2027 - Feixes de Luz Arquitetônicos (Ultra-Leve / GPU Only)
 * - Usa apenas transform: translate3d (camada compositora da GPU, 0 repaints/0 blur)
 * - Loop vertical contínuo sem costura (período exato de 1200px a 120deg)
 * - Inércia suave: acelera e desacelera progressivamente com o scroll
 * - Modo econômico automático em dispositivos fracos ou com redução de movimento
 */
(() => {
    'use strict';

    function initArchitecturalBeams() {
        const track = document.getElementById('arch-beams-track');
        if (!track) return;

        // Respeita preferência de acessibilidade ou economia de dados/hardware muito limitado:
        // mantém os feixes arquitetônicos estáticos no fundo com 0% de custo de CPU/JS
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const lowCores = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2;
        const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2;
        const saveData = navigator.connection && navigator.connection.saveData === true;

        if (prefersReducedMotion || lowCores || lowMemory || saveData) {
            return;
        }

        // Período vertical exato para gradiente de 120deg com ciclo de 600px (600 / cos(60°) = 1200px)
        const TILE_PERIOD = 1200;
        const SPEED_RATIO = 0.28; // Deslocamento sutil e cinematográfico (28% da velocidade da página)

        // Física com inércia leve e zero repique (amortecimento crítico)
        const STIFFNESS = 0.028;
        const DAMPING = 0.29;
        const SNAP_THRESHOLD = 0.2;
        const VELOCITY_THRESHOLD = 0.05;

        const initialY = (window.pageYOffset || document.documentElement.scrollTop || 0) * SPEED_RATIO;
        let targetY = initialY;
        let currentY = initialY;
        let velocity = 0;
        let isLoopRunning = false;
        let rafId = null;

        function applyTransform(y) {
            // Módulo positivo garante loop infinito contínuo dentro de [0, 1200px)
            const offset = ((y % TILE_PERIOD) + TILE_PERIOD) % TILE_PERIOD;
            track.style.transform = `translate3d(0, ${(-offset).toFixed(1)}px, 0)`;
        }

        applyTransform(currentY);

        function updatePhysics() {
            const delta = targetY - currentY;
            const force = delta * STIFFNESS;

            velocity += (force - velocity * DAMPING);
            currentY += velocity;

            applyTransform(currentY);

            if (Math.abs(delta) < SNAP_THRESHOLD && Math.abs(velocity) < VELOCITY_THRESHOLD) {
                currentY = targetY;
                velocity = 0;
                applyTransform(currentY);
                isLoopRunning = false;
                rafId = null;
                return;
            }

            rafId = requestAnimationFrame(updatePhysics);
        }

        function startLoop() {
            if (!isLoopRunning) {
                isLoopRunning = true;
                rafId = requestAnimationFrame(updatePhysics);
            }
        }

        function onScroll() {
            targetY = (window.pageYOffset || document.documentElement.scrollTop || 0) * SPEED_RATIO;
            startLoop();
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initArchitecturalBeams);
    } else {
        initArchitecturalBeams();
    }
})();
