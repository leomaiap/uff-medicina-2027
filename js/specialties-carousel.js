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
                return `
                    <article class="spec-card"
                             data-index="${realIndex}"
                             style="--card-rgb: ${spec.rgb}; --card-rgb-dark: ${spec.rgbDark};"
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
                                <span>Explorar Programa</span>
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
        // 2.1 RENDERIZAR CRÉDITOS DE ESPECIALIDADES EM LOOP INFINITO (CINEMATOGRÁFICO)
        // -------------------------------------------------------------
        function buildCreditsRoll() {
            const rollEl = document.getElementById('credits-roll');
            const srListEl = document.getElementById('spec-accessible-list');
            const toggleBtn = document.getElementById('credits-toggle-btn');
            const toggleIcon = document.getElementById('credits-toggle-icon');
            const toggleLabel = document.getElementById('credits-toggle-label');

            if (!rollEl) return;

            // Duplicamos as 13 especialidades para loop sem fim contínuo
            const loopItems = [...specialties, ...specialties];

            rollEl.innerHTML = loopItems.map((spec, index) => {
                const realIndex = index % specialties.length;
                return `
                    <div class="credits-item"
                         data-index="${realIndex}"
                         role="button"
                         tabindex="0"
                         aria-label="${spec.title} - Ver detalhes do programa">
                        <span class="credits-item-text">${spec.title}</span>
                    </div>
                `;
            }).join('');

            // Clique ou teclado para abrir detalhes da especialidade
            rollEl.querySelectorAll('.credits-item').forEach((item) => {
                item.addEventListener('click', () => {
                    const idx = Number(item.getAttribute('data-index'));
                    openSpecialtyModal(specialties[idx]);
                });
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const idx = Number(item.getAttribute('data-index'));
                        openSpecialtyModal(specialties[idx]);
                    }
                });
            });

            // Botão de pausa/reprodução manual
            let isCreditsPaused = false;
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    isCreditsPaused = !isCreditsPaused;
                    rollEl.classList.toggle('is-paused', isCreditsPaused);
                    if (toggleIcon) toggleIcon.textContent = isCreditsPaused ? '▶' : '⏸';
                    if (toggleLabel) toggleLabel.textContent = isCreditsPaused ? 'Continuar' : 'Pausar';
                });
            }

            // Lista semântica acessível para leitores de tela (TalkBack, VoiceOver, NVDA)
            if (srListEl) {
                srListEl.innerHTML = specialties.map((spec, index) => `
                    <li>
                        <strong>${index + 1}. ${spec.title}</strong>: ${spec.vagasShort}. Duração: ${spec.duration} (${spec.hours}). Início: ${spec.inicio}. Pré-requisito: ${spec.prereq}.
                    </li>
                `).join('');
            }
        }

        buildSpecialtyCards();
        buildCreditsRoll();

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
                        Edital Unificado CMM • Faculdade de Medicina UFF
                    </span>
                    <span class="text-brand-gold font-bold text-xs bg-brand-gold/15 px-3 py-1 rounded-full">
                        ${spec.vagas}
                    </span>
                </div>

                <h2 class="font-black text-2xl sm:text-3xl text-white mt-1">${spec.fullTitle || spec.title}</h2>
                <div class="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">${spec.category} • Início das Aulas: <strong class="text-white">${spec.inicio}</strong></div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5 text-xs sm:text-sm">
                    <div class="glass-card p-3.5 rounded-xl">
                        <span class="text-slate-400 block text-[11px] uppercase font-mono">Duração Oficial</span>
                        <strong class="text-white text-base font-bold">${spec.duration}</strong>
                    </div>
                    <div class="glass-card p-3.5 rounded-xl">
                        <span class="text-slate-400 block text-[11px] uppercase font-mono">Carga Horária Total</span>
                        <strong class="text-white text-base font-bold">${spec.hours}</strong>
                    </div>
                    <div class="glass-card p-3.5 rounded-xl sm:col-span-2">
                        <span class="text-slate-400 block text-[11px] uppercase font-mono">Pré-Requisito Regulamentar (Edital)</span>
                        <strong class="text-slate-200 font-medium text-xs sm:text-sm leading-relaxed block mt-1">${spec.prereq}</strong>
                    </div>
                    <div class="glass-card p-3.5 rounded-xl sm:col-span-2">
                        <span class="text-slate-400 block text-[11px] uppercase font-mono">Coordenação Acadêmica</span>
                        <strong class="text-white text-sm font-bold">${spec.coordinator}</strong>
                    </div>
                </div>

                <p class="text-sm text-slate-200 leading-relaxed mb-6 font-light">${spec.desc}</p>

                <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <a href="mailto:${spec.email}" class="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-white bg-brand-emerald hover:bg-emerald-500 text-center transition-all shadow-glow-emerald">
                        Coordenação: ${spec.email}
                    </a>
                    <a href="mailto:concursos.cmm@id.uff.br" class="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white glass-pill text-center transition-all">
                        Dúvidas Edital: concursos.cmm@id.uff.br
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
