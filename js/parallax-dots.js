/**
 * UFF Medicina 2027 - Textura de Pontinhos com Inércia Física Real
 * 1. Rola na MESMA VELOCIDADE da página (escala 1:1, targetY = scrollY).
 * 2. Demora para acelerar (inércia na partida) e demora para desacelerar (continua rolando até o repouso).
 * 3. Aplicado diretamente no background do <body> com background-attachment: fixed,
 *    garantindo que fique SEMPRE atrás de todos os textos, caixas, cards e imagens.
 */
(() => {
    'use strict';

    function initInertialDots() {
        const body = document.body;
        if (!body) return;

        // Respeita preferência por redução de movimento
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Inicializa na posição atual de scroll sem saltos
        const initialScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        let targetY = initialScrollY;
        let currentY = initialScrollY;
        let velocity = 0;
        let isLoopRunning = false;
        let rafId = null;

        // Parâmetros de Física:
        // - Rigidez baixa (stiffness: 0.026): demora para acelerar (inércia)
        // - Amortecimento crítico (damping: 0.28): desaceleração aveludada sem repiques elásticos (~0.7s)
        const STIFFNESS = 0.026;
        const DAMPING = 0.28;
        const SNAP_THRESHOLD = 0.2;
        const VELOCITY_THRESHOLD = 0.05;

        // Aplica posição inicial
        body.style.backgroundPosition = `0px ${Math.round(-currentY * 10) / 10}px`;

        function updatePhysics() {
            const delta = targetY - currentY;
            const force = delta * STIFFNESS;

            // Integração física: acelera com a força da mola e freia com amortecimento viscoso
            velocity += (force - velocity * DAMPING);
            currentY += velocity;

            // Renderiza no background do body (sempre atrás de todo conteúdo, cards e fotos)
            const posY = Math.round(-currentY * 10) / 10;
            body.style.backgroundPosition = `0px ${posY}px`;

            // Verifica se estabilizou no destino exato
            if (Math.abs(delta) < SNAP_THRESHOLD && Math.abs(velocity) < VELOCITY_THRESHOLD) {
                currentY = targetY;
                velocity = 0;
                body.style.backgroundPosition = `0px ${Math.round(-currentY * 10) / 10}px`;
                isLoopRunning = false;
                rafId = null;
                return;
            }

            // Continua a desaceleração quadro a quadro
            rafId = requestAnimationFrame(updatePhysics);
        }

        function startLoop() {
            if (!isLoopRunning) {
                isLoopRunning = true;
                rafId = requestAnimationFrame(updatePhysics);
            }
        }

        function onScroll() {
            targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
            startLoop();
        }

        // Listener passivo para scroll da página (desktop, mobile e teclado)
        window.addEventListener('scroll', onScroll, { passive: true });

        // Suporte adicional para wheel enquanto seções pinadas estão em scrub
        window.addEventListener('wheel', () => {
            targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
            startLoop();
        }, { passive: true });

        // Recalibra ao redimensionar
        window.addEventListener('resize', () => {
            targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
            startLoop();
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInertialDots);
    } else {
        initInertialDots();
    }
})();
