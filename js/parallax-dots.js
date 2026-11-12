/**
 * UFF Medicina 2027 - Parallax da Textura de Pontinhos com Inércia e Desaceleração
 * Movimento vertical suave acoplado ao scroll com inércia física real.
 * Ao parar de rolar, a textura continua rolando e desacelera suavemente até parar.
 */
(() => {
    'use strict';

    function initParallaxDots() {
        const dotsLayer = document.getElementById('parallax-dots-layer');
        if (!dotsLayer) return;

        // Respeita preferência do usuário por redução de movimento
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Parâmetros de Física & Inércia
        const PARALLAX_FACTOR = 0.32;   // Velocidade da textura em relação ao scroll da página
        const ACCELERATION = 0.22;       // Quão rápido a textura ganha impulso com a rolagem
        const FRICTION = 0.935;          // Taxa de atrito/desaceleração por frame (~0.8s de rolagem contínua residual)
        const VELOCITY_CUTOFF = 0.02;    // Limite para pausar o loop e economizar 100% de CPU/bateria

        let currentY = 0;
        let currentVelocity = 0;
        let targetVelocity = 0;
        let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        let isLoopRunning = false;
        let rafId = null;

        function updatePhysics() {
            // 1. Acelera suavemente a velocidade atual na direção do impulso alvo
            currentVelocity += (targetVelocity - currentVelocity) * ACCELERATION;

            // 2. Aplica atrito contínuo para amortecer o impulso
            targetVelocity *= FRICTION;

            // 3. Atualiza o deslocamento vertical acumulado
            currentY += currentVelocity;

            // 4. Aplica na camada de fundo (apenas eixo Y)
            // Usa 1 casa decimal para renderização subpixel suave e eficiente
            const posY = (Math.round(-currentY * 10) / 10);
            dotsLayer.style.backgroundPosition = `0px ${posY}px`;

            // 5. Continua o loop enquanto houver velocidade residual ou impulso ativo
            if (Math.abs(currentVelocity) > VELOCITY_CUTOFF || Math.abs(targetVelocity) > VELOCITY_CUTOFF) {
                rafId = requestAnimationFrame(updatePhysics);
            } else {
                // Ao desacelerar completamente, zera as velocidades e encerra o loop para economizar CPU
                currentVelocity = 0;
                targetVelocity = 0;
                isLoopRunning = false;
                rafId = null;
            }
        }

        function startLoop() {
            if (!isLoopRunning) {
                isLoopRunning = true;
                rafId = requestAnimationFrame(updatePhysics);
            }
        }

        function onScroll() {
            const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
            const deltaY = currentScrollY - lastScrollY;
            lastScrollY = currentScrollY;

            if (deltaY === 0) return;

            // Transfere impulso proporcional ao deslocamento do scroll
            targetVelocity += deltaY * PARALLAX_FACTOR;

            // Limita velocidade máxima para evitar saltos visuais bruscos em saltos de âncora
            if (targetVelocity > 45) targetVelocity = 45;
            if (targetVelocity < -45) targetVelocity = -45;

            startLoop();
        }

        // Listener passivo para scroll de alta performance (desktop, touch e teclado)
        window.addEventListener('scroll', onScroll, { passive: true });

        // Suporte adicional para wheel em momentos em que o scroll está pinado ou em micro-movimentos
        window.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) > 0.5) {
                targetVelocity += (e.deltaY * 0.2) * PARALLAX_FACTOR;
                if (targetVelocity > 45) targetVelocity = 45;
                if (targetVelocity < -45) targetVelocity = -45;
                startLoop();
            }
        }, { passive: true });

        // Ajuste de redimensionamento
        window.addEventListener('resize', () => {
            lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParallaxDots);
    } else {
        initParallaxDots();
    }
})();
