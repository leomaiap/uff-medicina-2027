document.addEventListener("DOMContentLoaded", () => {
        // 2. RENDERIZAR CARDS COM COR PREDOMINANTE & LOOP CIRCULAR INFINITO
        // -------------------------------------------------------------
        const specTrack = document.getElementById('spec-cards-track');
        let autoCycleTimer = null;
        let isAutoLooping = true;
        let isUserInteracting = false;
        let resumeTimeout = null;
        let wrapTimer = null;

        function getCardStep() {
            const firstCard = specTrack ? specTrack.querySelector('.spec-card') : null;
            if (!firstCard) return 320;
            const nextCard = firstCard.nextElementSibling;
            if (nextCard) {
                return nextCard.offsetLeft - firstCard.offsetLeft;
            }
            return firstCard.offsetWidth + 24;
        }

        function checkSeamlessWrap() {
            if (!specTrack) return;
            const step = getCardStep();
            const oneSetWidth = specialties.length * step;
            if (oneSetWidth <= 0) return;

            // Se avançou além do segundo conjunto, ajusta 1 conjunto para trás (imperceptível)
            if (specTrack.scrollLeft >= oneSetWidth * 2) {
                specTrack.scrollLeft -= oneSetWidth;
            }
            // Se recuou antes do segundo conjunto, ajusta 1 conjunto para frente (imperceptível)
            else if (specTrack.scrollLeft <= oneSetWidth * 0.3) {
                specTrack.scrollLeft += oneSetWidth;
            }
        }

        function advanceCard() {
            if (!specTrack) return;
            const step = getCardStep();
            specTrack.scrollBy({ left: step, behavior: 'smooth' });
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

        function buildSpecialtyCards() {
            if (!specTrack) return;
            
            // Buffer triplo (39 cards) para circulação infinita sem fim e sem sobressaltos
            const loopItems = [...specialties, ...specialties, ...specialties];

            specTrack.innerHTML = loopItems.map((spec, index) => {
                const realIndex = index % specialties.length;
                return `
                    <article class="spec-card"
                             data-index="${realIndex}"
                             style="--card-rgb: ${spec.rgb}; --card-rgb-dark: ${spec.rgbDark};"
                             role="button"
                             tabindex="0"
                             aria-label="Ver detalhes de ${spec.title}">
                        <span class="spec-card-number">${realIndex + 1}</span>
                        <div class="spec-card-img-wrap">
                            <img src="${spec.image}"
                                 alt="${spec.title} - Faculdade de Medicina da UFF"
                                 class="spec-card-img"
                                 loading="lazy"
                                 decoding="async">
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

            // Inicia no conjunto do meio para permitir rolagem bidirecional circular infinita
            requestAnimationFrame(() => {
                const step = getCardStep();
                specTrack.scrollLeft = specialties.length * step;
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
                    const step = getCardStep();
                    specTrack.scrollBy({ left: -step, behavior: 'smooth' });
                    clearTimeout(resumeTimeout);
                    resumeTimeout = setTimeout(() => { isUserInteracting = false; }, 3500);
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    isUserInteracting = true;
                    advanceCard();
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

            // Mouse hover / touch pause
            specTrack.addEventListener('mouseenter', () => { isUserInteracting = true; });
            specTrack.addEventListener('mouseleave', () => { isUserInteracting = false; });
            specTrack.addEventListener('touchstart', () => { isUserInteracting = true; }, { passive: true });
            specTrack.addEventListener('touchend', () => {
                clearTimeout(resumeTimeout);
                resumeTimeout = setTimeout(() => { isUserInteracting = false; }, 2800);
            }, { passive: true });

            // Wrap transparente quando o scroll termina de assentar
            specTrack.addEventListener('scroll', () => {
                clearTimeout(wrapTimer);
                wrapTimer = setTimeout(checkSeamlessWrap, 120);
            }, { passive: true });

            // Mouse drag-to-scroll for desktop
            let isDown = false;
            let startX = 0;
            let scrollLeft = 0;
            specTrack.addEventListener('mousedown', (e) => {
                isDown = true;
                dragMoved = false;
                isUserInteracting = true;
                specTrack.classList.add('is-dragging');
                startX = e.pageX - specTrack.offsetLeft;
                scrollLeft = specTrack.scrollLeft;
            });
            window.addEventListener('mouseup', () => {
                if (!isDown) return;
                isDown = false;
                specTrack.classList.remove('is-dragging');
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
                <div class="flex items-center justify-between text-xs font-mono pb-3 mb-3 border-b border-white/10">
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

                <div class="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/10">
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
