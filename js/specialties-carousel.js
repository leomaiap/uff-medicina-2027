document.addEventListener("DOMContentLoaded", () => {
        // 2. RENDERIZAR CARDS COM COR PREDOMINANTE & LOOP CIRCULAR INFINITO
        // -------------------------------------------------------------
        const specTrack = document.getElementById('spec-cards-track');
        let autoCycleTimer = null;
        let isAutoLooping = true;
        let isUserInteracting = false;
        let isTouchActive = false;
        let isCircularReady = false;
        let activeTargetLeft = null;
        let targetResetTimer = null;
        let resumeTimeout = null;
        let wrapTimer = null;

        const BUFFER_LEFT = 4;

        function getCardStep() {
            const firstCard = specTrack ? specTrack.querySelector('.spec-card') : null;
            if (!firstCard) return 320;
            const nextCard = firstCard.nextElementSibling;
            if (nextCard) {
                return nextCard.offsetLeft - firstCard.offsetLeft;
            }
            return firstCard.offsetWidth + 24;
        }

        function getTrackPaddingLeft() {
            if (!specTrack) return 0;
            return parseFloat(getComputedStyle(specTrack).paddingLeft) || 0;
        }

        // Lista circular real com apenas os 13 cards no DOM (sem clonar 3x)
        function rebalanceCircularTrack() {
            if (!isCircularReady || !specTrack || specTrack.children.length < 2) return;
            if (isTouchActive || specTrack.classList.contains('is-dragging')) return;

            const step = getCardStep();
            if (step <= 0) return;

            const padLeft = getTrackPaddingLeft();
            const minScroll = padLeft + (BUFFER_LEFT - 1) * step;
            const maxScroll = padLeft + (BUFFER_LEFT + 1) * step;

            if (specTrack.scrollLeft >= minScroll && specTrack.scrollLeft <= maxScroll) {
                return;
            }

            const prevSnap = specTrack.style.scrollSnapType;
            const prevBehavior = specTrack.style.scrollBehavior;
            specTrack.style.scrollSnapType = 'none';
            specTrack.style.scrollBehavior = 'auto';

            let guard = 0;
            while (specTrack.scrollLeft > maxScroll && guard < specialties.length) {
                const first = specTrack.firstElementChild;
                specTrack.appendChild(first);
                specTrack.scrollLeft -= step;
                if (activeTargetLeft !== null) activeTargetLeft -= step;
                guard++;
            }

            guard = 0;
            while (specTrack.scrollLeft < minScroll && guard < specialties.length) {
                const last = specTrack.lastElementChild;
                specTrack.insertBefore(last, specTrack.firstElementChild);
                specTrack.scrollLeft += step;
                if (activeTargetLeft !== null) activeTargetLeft += step;
                guard++;
            }

            // Garante commit de layout e scrollLeft antes de reativar scroll-snap
            void specTrack.offsetLeft;
            specTrack.style.scrollSnapType = prevSnap;
            specTrack.style.scrollBehavior = prevBehavior;
        }

        function stepCarousel(direction) {
            if (!specTrack || !isCircularReady) return;
            const step = getCardStep();
            const padLeft = getTrackPaddingLeft();

            if (activeTargetLeft === null) {
                rebalanceCircularTrack();
                const slot = Math.round((specTrack.scrollLeft - padLeft) / step);
                activeTargetLeft = padLeft + slot * step;
            }

            let nextLeft = activeTargetLeft + direction * step;
            const maxSafeLeft = specTrack.scrollWidth - specTrack.clientWidth - step * 0.5;
            if (nextLeft < padLeft + step || nextLeft > maxSafeLeft) {
                rebalanceCircularTrack();
                nextLeft = activeTargetLeft + direction * step;
            }

            activeTargetLeft = nextLeft;
            specTrack.scrollTo({ left: activeTargetLeft, behavior: 'smooth' });
            clearTimeout(targetResetTimer);
            targetResetTimer = setTimeout(() => {
                activeTargetLeft = null;
                rebalanceCircularTrack();
            }, 600);
        }

        function advanceCard() {
            stepCarousel(1);
        }

        function startAutoCycle() {
            if (autoCycleTimer) clearInterval(autoCycleTimer);
            autoCycleTimer = setInterval(() => {
                if (isAutoLooping && !isUserInteracting) {
                    advanceCard();
                }
            }, 3200);
        }

        function stopAutoCycle() {
            if (autoCycleTimer) clearInterval(autoCycleTimer);
            autoCycleTimer = null;
        }

        let specImagesHydrated = false;

        function hydrateSpecCardImages() {
            if (!specTrack || specImagesHydrated) return;
            specImagesHydrated = true;

            specTrack.querySelectorAll('img.spec-card-img').forEach((img) => {
                const targetSrc = img.getAttribute('data-src');
                if (targetSrc && !img.getAttribute('src')) {
                    img.setAttribute('src', targetSrc);
                }
                const markLoaded = () => img.classList.add('is-loaded');
                if (img.complete && img.naturalWidth > 0) {
                    markLoaded();
                } else {
                    img.addEventListener('load', markLoaded, { once: true });
                    img.addEventListener('error', markLoaded, { once: true });
                }
            });
        }

        function preloadSpecialtyImagesInBackground() {
            if (!window.__specPreloadStarted) {
                window.__specPreloadStarted = true;
                window.__preloadedSpecImages = window.__preloadedSpecImages || [];

                const uniqueUrls = [...new Set(specialties.map((s) => s.image))];
                uniqueUrls.forEach((url) => {
                    const preImg = new Image();
                    preImg.decoding = 'async';
                    if ('fetchPriority' in preImg) {
                        preImg.fetchPriority = 'low';
                    }
                    const markDomCards = () => {
                        if (!specTrack) return;
                        specTrack.querySelectorAll(`img.spec-card-img[data-src="${url}"]`).forEach((domImg) => {
                            if (!domImg.getAttribute('src')) {
                                domImg.setAttribute('src', url);
                            }
                            domImg.classList.add('is-loaded');
                        });
                    };
                    preImg.onload = () => {
                        if (typeof preImg.decode === 'function') {
                            preImg.decode().then(markDomCards).catch(markDomCards);
                        } else {
                            markDomCards();
                        }
                    };
                    preImg.onerror = markDomCards;
                    preImg.src = url;
                    window.__preloadedSpecImages.push(preImg);
                });
            }
            hydrateSpecCardImages();
        }

        function scheduleSpecialtyPreload() {
            const kick = () => {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(preloadSpecialtyImagesInBackground, { timeout: 350 });
                } else {
                    setTimeout(preloadSpecialtyImagesInBackground, 100);
                }
            };

            if (document.readyState === 'complete') {
                kick();
            } else {
                window.addEventListener('load', kick, { once: true });
            }

            // Garantia caso o usuário role rapidamente antes de window.load finalizar
            if ('IntersectionObserver' in window && specTrack) {
                const earlyObserver = new IntersectionObserver((entries) => {
                    if (entries.some((e) => e.isIntersecting)) {
                        earlyObserver.disconnect();
                        preloadSpecialtyImagesInBackground();
                    }
                }, { rootMargin: '1200px 0px' });
                earlyObserver.observe(specTrack);
            }
        }

        function rgbToCardNumColor(rgbStr) {
            const parts = (rgbStr || '').split(',').map((v) => Number(v.trim()) / 255);
            if (parts.length !== 3 || parts.some(Number.isNaN)) return '#34D399';
            const [r, g, b] = parts;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const d = max - min;
            let h = 0;
            if (d !== 0) {
                if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
                else if (max === g) h = ((b - r) / d + 2) * 60;
                else h = ((r - g) / d + 4) * 60;
            }
            const l = (max + min) / 2;
            const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
            const targetS = Math.round(Math.min(82, Math.max(58, s * 100)));
            return `hsl(${Math.round(h)}, ${targetS}%, 66%)`;
        }

        function buildSpecialtyCards() {
            if (!specTrack) return;

            // Apenas os 13 cards reais rotacionados em anel circular:
            // os últimos 4 ficam à esquerda do scroll inicial para permitir recuo imediato
            const total = specialties.length;
            const ringOrder = [];
            for (let offset = 0; offset < total; offset++) {
                ringOrder.push((total - BUFFER_LEFT + offset) % total);
            }

            specTrack.innerHTML = ringOrder.map((realIndex) => {
                const spec = specialties[realIndex];
                const numColor = rgbToCardNumColor(spec.rgb);
                return `
                    <article class="spec-card"
                             data-index="${realIndex}"
                             style="--card-rgb: ${spec.rgb}; --card-rgb-dark: ${spec.rgbDark}; --card-num-color: ${numColor};"
                             role="button"
                             tabindex="0"
                             aria-label="Ver detalhes de ${spec.title}">
                        <span class="spec-card-number">${realIndex + 1}</span>
                        <div class="spec-card-img-wrap">
                            <img data-src="${spec.image}"
                                 width="440"
                                 height="587"
                                 alt="${spec.title} - Faculdade de Medicina da UFF"
                                 class="spec-card-img"
                                 loading="eager"
                                 decoding="sync">
                        </div>
                        <div class="spec-card-gradient"></div>
                        <div class="spec-card-body">
                            <h3 class="spec-card-title">${spec.title}</h3>
                            <p class="spec-card-meta">${spec.vagasShort} • ${spec.duration} • ${spec.hours}</p>
                            <div class="spec-card-btn">
                                <span>Ver Detalhes</span>
                                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');

            scheduleSpecialtyPreload();

            // Posiciona no Card #1 (logo após o buffer esquerdo circular) antes de liberar o rebalanceamento
            const alignInitialTrack = () => {
                const step = getCardStep();
                const padLeft = getTrackPaddingLeft();
                const prevSnap = specTrack.style.scrollSnapType;
                const prevBehavior = specTrack.style.scrollBehavior;
                specTrack.style.scrollSnapType = 'none';
                specTrack.style.scrollBehavior = 'auto';
                specTrack.scrollLeft = padLeft + BUFFER_LEFT * step;
                void specTrack.offsetLeft;
                specTrack.style.scrollSnapType = prevSnap;
                specTrack.style.scrollBehavior = prevBehavior;
            };
            alignInitialTrack();
            requestAnimationFrame(() => {
                alignInitialTrack();
                requestAnimationFrame(() => {
                    clearTimeout(wrapTimer);
                    isCircularReady = true;
                });
            });

            // Click & keyboard handler to open specialty modal
            let dragMoved = false;
            specTrack.querySelectorAll('.spec-card').forEach((card) => {
                card.addEventListener('click', () => {
                    if (dragMoved) return;
                    const idx = Number(card.getAttribute('data-index'));
                    openSpecialtyModal(specialties[idx]);
                });
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const idx = Number(card.getAttribute('data-index'));
                        openSpecialtyModal(specialties[idx]);
                    }
                });
            });

            // Prev / Next navigation buttons
            const prevBtn = document.getElementById('spec-prev');
            const nextBtn = document.getElementById('spec-next');
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    isUserInteracting = true;
                    stepCarousel(-1);
                    clearTimeout(resumeTimeout);
                    resumeTimeout = setTimeout(() => { isUserInteracting = false; }, 3500);
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    isUserInteracting = true;
                    stepCarousel(1);
                    clearTimeout(resumeTimeout);
                    resumeTimeout = setTimeout(() => { isUserInteracting = false; }, 3500);
                });
            }

            // Loop Toggle button
            const loopToggleBtn = document.getElementById('spec-loop-toggle');
            const loopIndicator = document.getElementById('loop-indicator');
            const loopLabel = document.getElementById('loop-label');
            if (loopToggleBtn) {
                loopToggleBtn.addEventListener('click', () => {
                    isAutoLooping = !isAutoLooping;
                    if (isAutoLooping) {
                        loopIndicator.classList.remove('bg-slate-500');
                        loopIndicator.classList.add('bg-brand-emerald', 'animate-pulse');
                        loopLabel.textContent = 'Auto-Loop';
                        startAutoCycle();
                    } else {
                        loopIndicator.classList.remove('bg-brand-emerald', 'animate-pulse');
                        loopIndicator.classList.add('bg-slate-500');
                        loopLabel.textContent = 'Pausado';
                        stopAutoCycle();
                    }
                });
            }

            function scheduleRebalance(delay = 140) {
                clearTimeout(wrapTimer);
                wrapTimer = setTimeout(() => {
                    if (!isTouchActive && !specTrack.classList.contains('is-dragging') && activeTargetLeft === null) {
                        rebalanceCircularTrack();
                    }
                }, delay);
            }

            // Mouse hover / touch pause
            specTrack.addEventListener('mouseenter', () => { isUserInteracting = true; });
            specTrack.addEventListener('mouseleave', () => { isUserInteracting = false; });
            specTrack.addEventListener('wheel', () => {
                activeTargetLeft = null;
                clearTimeout(targetResetTimer);
            }, { passive: true });
            specTrack.addEventListener('touchstart', () => {
                isTouchActive = true;
                isUserInteracting = true;
                activeTargetLeft = null;
                clearTimeout(targetResetTimer);
                clearTimeout(wrapTimer);
            }, { passive: true });
            const handleTouchRelease = () => {
                isTouchActive = false;
                scheduleRebalance(140);
                clearTimeout(resumeTimeout);
                resumeTimeout = setTimeout(() => { isUserInteracting = false; }, 2800);
            };
            specTrack.addEventListener('touchend', handleTouchRelease, { passive: true });
            specTrack.addEventListener('touchcancel', handleTouchRelease, { passive: true });

            // Reequilibra o anel circular quando o scroll assenta
            specTrack.addEventListener('scroll', () => {
                if (!isCircularReady) return;
                if (!isTouchActive && !specTrack.classList.contains('is-dragging')) {
                    scheduleRebalance(140);
                }
            }, { passive: true });
            if ('onscrollend' in window) {
                specTrack.addEventListener('scrollend', () => {
                    if (!isCircularReady) return;
                    if (!isTouchActive && !specTrack.classList.contains('is-dragging')) {
                        activeTargetLeft = null;
                        clearTimeout(targetResetTimer);
                        rebalanceCircularTrack();
                    }
                }, { passive: true });
            }

            let resizeTimer = null;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    activeTargetLeft = null;
                    rebalanceCircularTrack();
                }, 150);
            }, { passive: true });

            // Mouse drag-to-scroll for desktop
            let isDown = false;
            let startX = 0;
            let scrollLeft = 0;
            specTrack.addEventListener('mousedown', (e) => {
                isDown = true;
                dragMoved = false;
                isUserInteracting = true;
                activeTargetLeft = null;
                clearTimeout(targetResetTimer);
                clearTimeout(wrapTimer);
                specTrack.classList.add('is-dragging');
                startX = e.pageX - specTrack.offsetLeft;
                scrollLeft = specTrack.scrollLeft;
            });
            window.addEventListener('mouseup', () => {
                if (!isDown) return;
                isDown = false;
                specTrack.classList.remove('is-dragging');
                scheduleRebalance(80);
                clearTimeout(resumeTimeout);
                resumeTimeout = setTimeout(() => { isUserInteracting = false; }, 2500);
                setTimeout(() => { dragMoved = false; }, 50);
            });
            specTrack.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                const x = e.pageX - specTrack.offsetLeft;
                const walk = (x - startX) * 1.3;
                if (Math.abs(walk) > 8) {
                    dragMoved = true;
                    e.preventDefault();
                    specTrack.scrollLeft = scrollLeft - walk;
                }
            });

            startAutoCycle();
        }

        // -------------------------------------------------------------
        // 2.1 RODA ORBITAL DE DISCIPLINAS (OPTION WHEEL + SELO FACMED UFF)
        // -------------------------------------------------------------
        function initDisciplinesOptionWheel() {
            const sectionEl = document.getElementById('disciplinas-section');
            const viewportEl = document.getElementById('credits-viewport');
            const wheelEl = document.getElementById('disciplines-wheel');
            const srListEl = document.getElementById('spec-accessible-list');

            if (!wheelEl || !viewportEl || !specialties.length) return;

            const n = specialties.length;
            const SMOOTHING_MS = 410;
            const CURVE = 1;
            const BLUR_STEP = 2;
            const FADE_STEP = 0.25;
            const MIN_OPACITY = 0.05;
            const AUTO_STEP_MS = 2300;

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const modIdx = (idx) => ((idx % n) + n) % n;
            const lerp = (a, b, t) => a + (b - a) * t;

            // Popula itens da roda orbital
            wheelEl.innerHTML = specialties.map((spec, idx) => `
                <div id="wheel-opt-${idx}"
                     class="option-wheel__item${idx === 0 ? ' option-wheel__item--selected' : ''}"
                     role="option"
                     data-index="${idx}"
                     aria-selected="${idx === 0 ? 'true' : 'false'}">
                    ${spec.title}
                </div>
            `).join('');

            const itemEls = Array.from(wheelEl.querySelectorAll('.option-wheel__item'));
            wheelEl.setAttribute('aria-activedescendant', 'wheel-opt-0');

            // Lista semântica acessível para leitores de tela
            if (srListEl) {
                srListEl.innerHTML = specialties.map((spec, index) => `
                    <li>
                        <strong>${index + 1}. ${spec.title}</strong>: ${spec.vagasShort}. Duração: ${spec.duration} (${spec.hours}). Início: ${spec.inicio}. Pré-requisito: ${spec.prereq}.
                    </li>
                `).join('');
            }

            let cfg = {
                fontSize: 2.8,
                spacing: 1.05,
                tilt: 7.4,
                cx: -26,
                inset: 338,
                rowH: 47.04,
                tiltRad: (7.4 * Math.PI) / 180,
                R: 364.2,
                emblemSize: 530
            };

            function updateGeometry() {
                const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
                const width = viewportEl.clientWidth || window.innerWidth;

                let fontSize;
                let spacing;
                let tilt;
                let cx;
                let emblemSize;

                if (width >= 1360) {
                    fontSize = 2.8;
                    spacing = 1.05;
                    tilt = 7.4;
                    cx = -26;
                } else if (width >= 1024) {
                    const t = (width - 1024) / (1360 - 1024);
                    fontSize = lerp(1.9, 2.55, t);
                    spacing = lerp(1.08, 1.05, t);
                    tilt = lerp(8.0, 7.4, t);
                    cx = lerp(-24, -26, t);
                } else if (width >= 640) {
                    const t = (width - 640) / (1024 - 640);
                    fontSize = lerp(1.5, 1.85, t);
                    spacing = lerp(1.22, 1.12, t);
                    tilt = lerp(8.8, 8.2, t);
                    cx = lerp(-22, -24, t);
                } else {
                    fontSize = width < 380 ? 1.1 : 1.18;
                    spacing = 1.44;
                    tilt = 9.6;
                    cx = -22;
                }

                const rowH = fontSize * remPx * spacing;
                const tiltRad = (tilt * Math.PI) / 180;
                const R = rowH / tiltRad;

                if (width >= 1024) {
                    const idealCx = width * 0.34 - 300;
                    const maxSafeCx = width - R - 760;
                    cx = Math.round(Math.max(-24, Math.min(idealCx, maxSafeCx)));
                }

                const inset = Math.round(cx + R);

                if (width >= 1360) {
                    emblemSize = 530;
                } else if (width >= 1024) {
                    emblemSize = Math.round(Math.min(510, Math.max(340, R * 1.44)));
                } else if (width >= 640) {
                    emblemSize = Math.round(Math.min(410, Math.max(270, R * 1.4)));
                } else {
                    emblemSize = Math.round(Math.min(228, Math.max(185, R * 1.36)));
                }

                cfg = { fontSize, spacing, tilt, cx, inset, rowH, tiltRad, R, emblemSize };

                viewportEl.style.setProperty('--ow-font-size', `${fontSize.toFixed(3)}rem`);
                viewportEl.style.setProperty('--ow-inset', `${inset}px`);
                viewportEl.style.setProperty('--ow-cx', `${cx.toFixed(1)}px`);
                viewportEl.style.setProperty('--ow-emblem-size', `${emblemSize}px`);
            }

            let pos = 0;
            let target = 0;
            let selectedIdx = 0;
            let rafId = null;
            let lastTime = 0;
            let isInView = true;
            let isHovering = false;
            let isDragging = false;
            let dragStartY = 0;
            let dragStartTarget = 0;
            let dragMoved = false;
            let pauseAutoUntil = 0;

            const isModalOpen = () => modal && !modal.classList.contains('pointer-events-none');

            function syncSelection(nextIdx) {
                if (nextIdx === selectedIdx) return;
                const prevEl = itemEls[selectedIdx];
                const nextEl = itemEls[nextIdx];
                if (prevEl) {
                    prevEl.classList.remove('option-wheel__item--selected');
                    prevEl.setAttribute('aria-selected', 'false');
                }
                if (nextEl) {
                    nextEl.classList.add('option-wheel__item--selected');
                    nextEl.setAttribute('aria-selected', 'true');
                    wheelEl.setAttribute('aria-activedescendant', nextEl.id);
                }
                selectedIdx = nextIdx;
            }

            function paint(value) {
                const { tiltRad, R } = cfg;
                const wrapped = ((value % n) + n) % n;

                for (let i = 0; i < n; i++) {
                    const el = itemEls[i];
                    if (!el) continue;

                    let d = i - wrapped;
                    if (d > n / 2) d -= n;
                    else if (d < -n / 2) d += n;

                    const absD = Math.abs(d);
                    const steps = absD;
                    let opacity = Math.max(MIN_OPACITY, 1 - steps * FADE_STEP);
                    if (absD > 5.4) {
                        opacity *= Math.max(0, 1 - (absD - 5.4) / 0.9);
                    }

                    if (opacity <= 0.004 || absD > 6.35) {
                        el.style.visibility = 'hidden';
                        el.style.opacity = '0';
                        continue;
                    }

                    const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
                    const y = R * Math.sin(ang);
                    const x = -R * (1 - Math.cos(ang)) * CURVE;
                    const rot = (ang * 180) / Math.PI;
                    const p = Math.max(0, Math.min(1, 1 - steps));
                    const blurPx = prefersReducedMotion ? 0 : (steps < 0.02 ? 0 : steps * BLUR_STEP);

                    el.style.visibility = 'visible';
                    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translateY(-50%) rotate(${rot.toFixed(2)}deg)`;
                    el.style.opacity = opacity.toFixed(3);
                    el.style.filter = blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : 'none';
                    el.style.setProperty('--ow-p', p.toFixed(3));
                    el.style.zIndex = String(Math.round(50 - steps * 4));
                }

                syncSelection(modIdx(Math.round(value)));
            }

            function stepFrame(now) {
                if (!lastTime) lastTime = now;
                const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
                lastTime = now;

                const diff = target - pos;
                if (prefersReducedMotion || Math.abs(diff) < 0.0008) {
                    pos = target;
                    paint(pos);
                    rafId = null;
                    lastTime = 0;
                    return;
                }

                const tau = SMOOTHING_MS / 1000;
                const k = isDragging ? Math.min(1, dt * 18) : (1 - Math.exp(-dt / tau));
                pos += diff * k;
                paint(pos);

                if (isInView && !document.hidden) {
                    rafId = requestAnimationFrame(stepFrame);
                } else {
                    rafId = null;
                    lastTime = 0;
                }
            }

            function ensureLoop() {
                if (prefersReducedMotion) {
                    pos = target;
                    paint(pos);
                    return;
                }
                if (!rafId && isInView && !document.hidden) {
                    lastTime = 0;
                    rafId = requestAnimationFrame(stepFrame);
                }
            }

            function goToShortestIndex(itemIdx, openIfCentered) {
                const curIdx = modIdx(Math.round(target));
                let diff = itemIdx - curIdx;
                if (diff > n / 2) diff -= n;
                else if (diff < -n / 2) diff += n;

                if (diff === 0 && openIfCentered) {
                    pauseAutoUntil = Date.now() + 4500;
                    openSpecialtyModal(specialties[itemIdx]);
                    return;
                }

                target = Math.round(target) + diff;
                pauseAutoUntil = Date.now() + 4500;
                ensureLoop();
            }

            // Cliques diretos nas opções da roda
            wheelEl.addEventListener('click', (e) => {
                if (dragMoved) {
                    dragMoved = false;
                    return;
                }
                const item = e.target.closest('.option-wheel__item');
                if (!item) return;
                const idx = Number(item.getAttribute('data-index'));
                if (Number.isNaN(idx)) return;
                goToShortestIndex(idx, true);
            });

            // Arraste vertical direto com mouse/caneta (mantém scroll vertical nativo da página no toque mobile)
            wheelEl.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'touch') return;
                if (e.button && e.button !== 0) return;
                isDragging = true;
                dragMoved = false;
                dragStartY = e.clientY;
                dragStartTarget = target;
                pauseAutoUntil = Date.now() + 5000;
                wheelEl.classList.add('option-wheel--dragging');
                try { wheelEl.setPointerCapture(e.pointerId); } catch (_) {}
                ensureLoop();
            });

            wheelEl.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const dy = e.clientY - dragStartY;
                if (Math.abs(dy) > 5) dragMoved = true;
                target = dragStartTarget - dy / Math.max(20, cfg.rowH);
                pauseAutoUntil = Date.now() + 5000;
                ensureLoop();
            });

            const finishDrag = (e) => {
                if (!isDragging) return;
                isDragging = false;
                wheelEl.classList.remove('option-wheel--dragging');
                try { wheelEl.releasePointerCapture(e.pointerId); } catch (_) {}
                target = Math.round(target);
                pauseAutoUntil = Date.now() + 3800;
                ensureLoop();
                setTimeout(() => { dragMoved = false; }, 40);
            };
            wheelEl.addEventListener('pointerup', finishDrag);
            wheelEl.addEventListener('pointercancel', finishDrag);

            // Teclado acessível (Setas / Enter)
            wheelEl.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    target = Math.round(target) + 1;
                    pauseAutoUntil = Date.now() + 4500;
                    ensureLoop();
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    target = Math.round(target) - 1;
                    pauseAutoUntil = Date.now() + 4500;
                    ensureLoop();
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openSpecialtyModal(specialties[selectedIdx]);
                }
            });

            // Pausa elegante durante hover na área de interação
            if (sectionEl) {
                sectionEl.addEventListener('mouseenter', () => { isHovering = true; });
                sectionEl.addEventListener('mouseleave', () => { isHovering = false; });
            }

            // Giro orbital cinematográfico ao chegar na seção e resposta suave ao scroll da página
            let hasPlayedEntrance = false;
            let lastScrollY = window.scrollY;
            let scrollSnapTimer = null;

            const triggerEntranceSpin = () => {
                if (hasPlayedEntrance || prefersReducedMotion) return;
                hasPlayedEntrance = true;
                pos = target - 3.6;
                paint(pos);
                pauseAutoUntil = Date.now() + 2600;
                ensureLoop();
            };

            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;
                const deltaY = currentScrollY - lastScrollY;
                lastScrollY = currentScrollY;

                if (!isInView || prefersReducedMotion || isDragging || isModalOpen()) return;
                if (!hasPlayedEntrance) {
                    const rect = (sectionEl || viewportEl).getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
                        triggerEntranceSpin();
                        return;
                    }
                }
                if (Math.abs(deltaY) < 1) return;

                target += deltaY * 0.0055;
                pauseAutoUntil = Date.now() + 2600;
                ensureLoop();

                clearTimeout(scrollSnapTimer);
                scrollSnapTimer = setTimeout(() => {
                    if (!isDragging) {
                        target = Math.round(target);
                        ensureLoop();
                    }
                }, 150);
            }, { passive: true });

            // Auto-rotação orbital suave para cima quando visível
            let autoTimer = null;
            if (!prefersReducedMotion) {
                autoTimer = setInterval(() => {
                    if (!isInView || document.hidden || isHovering || isDragging || isModalOpen()) return;
                    if (Date.now() < pauseAutoUntil) return;
                    target = Math.round(target) + 1;
                    ensureLoop();
                }, AUTO_STEP_MS);
            }

            // Pausar rAF quando a seção estiver fora da tela e disparar giro na chegada
            if ('IntersectionObserver' in window) {
                const viewObserver = new IntersectionObserver((entries) => {
                    isInView = entries.some((entry) => entry.isIntersecting);
                    if (isInView) {
                        const rect = (sectionEl || viewportEl).getBoundingClientRect();
                        if (!hasPlayedEntrance && rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
                            triggerEntranceSpin();
                        } else {
                            paint(pos);
                            if (Math.abs(target - pos) > 0.001) ensureLoop();
                        }
                    } else {
                        hasPlayedEntrance = false;
                        if (rafId) {
                            cancelAnimationFrame(rafId);
                            rafId = null;
                        }
                    }
                }, { rootMargin: '0px' });
                viewObserver.observe(sectionEl || viewportEl);
            }

            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && isInView && Math.abs(target - pos) > 0.001) {
                    ensureLoop();
                }
            });

            // Recalculo geométrico responsivo (ResizeObserver + window resize)
            const handleResize = () => {
                updateGeometry();
                paint(pos);
            };
            if ('ResizeObserver' in window) {
                const ro = new ResizeObserver(handleResize);
                ro.observe(viewportEl);
            } else {
                window.addEventListener('resize', handleResize, { passive: true });
            }

            updateGeometry();
            paint(pos);
        }

        buildSpecialtyCards();
        initDisciplinesOptionWheel();

        // -------------------------------------------------------------
        // 3. MODAL DE DETALHES DA ESPECIALIDADE (COM DADOS DO EDITAL)
        // -------------------------------------------------------------
        const modal = document.getElementById('specialty-modal');
        const modalContent = document.getElementById('modal-content');
        const modalClose = document.getElementById('modal-close');

        function openSpecialtyModal(spec) {
            isUserInteracting = true;
            modalContent.innerHTML = `
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-mono pb-2 mb-2 pr-8">
                    <span class="text-brand-gold font-bold uppercase tracking-wider text-[11px]">
                        Edital Unificado CMM Nº 1 / 2025 • UFF
                    </span>
                    <span class="text-brand-gold font-bold text-xs bg-brand-gold/15 px-3 py-1 rounded-full">
                        ${spec.vagas}
                    </span>
                </div>

                <h2 class="font-black text-2xl sm:text-3xl text-white mt-1">${spec.fullTitle || spec.title}</h2>
                <div class="text-xs font-mono text-slate-300 mt-1 uppercase tracking-wider">Início das Aulas: <strong class="text-white">${spec.inicio}</strong> • Mínimo: <strong class="text-white">${spec.minAlunos}</strong></div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5 text-xs sm:text-sm">
                    <div class="glass-card p-3.5 rounded-xl">
                        <span class="text-slate-400 block text-[11px] uppercase font-mono">Duração Oficial</span>
                        <strong class="text-white text-sm sm:text-base font-bold">${spec.duration}</strong>
                    </div>
                    <div class="glass-card p-3.5 rounded-xl">
                        <span class="text-slate-400 block text-[11px] uppercase font-mono">Carga Horária Total</span>
                        <strong class="text-white text-sm sm:text-base font-bold">${spec.hours}</strong>
                    </div>
                    <div class="glass-card p-3.5 rounded-xl">
                        <span class="text-slate-400 block text-[11px] uppercase font-mono">1ª Etapa (Prova Escrita)</span>
                        <strong class="text-slate-100 font-semibold text-xs sm:text-sm leading-relaxed block mt-1">${spec.stage1}</strong>
                    </div>
                    <div class="glass-card p-3.5 rounded-xl">
                        <span class="text-slate-400 block text-[11px] uppercase font-mono">2ª Etapa (Classificatória)</span>
                        <strong class="text-slate-100 font-semibold text-xs sm:text-sm leading-relaxed block mt-1">${spec.stage2}</strong>
                    </div>
                    <div class="glass-card p-3.5 rounded-xl sm:col-span-2">
                        <span class="text-slate-400 block text-[11px] uppercase font-mono">Pré-Requisito (Item 1.1 do Edital)</span>
                        <strong class="text-slate-200 font-medium text-xs sm:text-sm leading-relaxed block mt-1">${spec.prereq}</strong>
                    </div>
                    <div class="glass-card p-3.5 rounded-xl sm:col-span-2">
                        <span class="text-slate-400 block text-[11px] uppercase font-mono">Diploma Obtido no Exterior</span>
                        <strong class="text-slate-200 font-medium text-xs sm:text-sm leading-relaxed block mt-1">${spec.revalidacao}</strong>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <a href="https://editais.uff.br/sites/default/files/arquivos/Edital%20Unificado.pdf" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-white bg-brand-emerald hover:bg-emerald-500 text-center transition-all shadow-glow-emerald">
                        Consultar Edital Oficial (PDF)
                    </a>
                    <a href="mailto:concursos.cmm@id.uff.br" class="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white glass-pill text-center transition-all">
                        Contato Edital: concursos.cmm@id.uff.br
                    </a>
                </div>
            `;
            modal.classList.remove('opacity-0', 'pointer-events-none');
        }

        modalClose.onclick = () => {
            modal.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => { isUserInteracting = false; }, 1500);
        };
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('opacity-0', 'pointer-events-none');
                setTimeout(() => { isUserInteracting = false; }, 1500);
            }
        };

        // -------------------------------------------------------------
});
