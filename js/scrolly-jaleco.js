/**
 * UFF Medicina 2027 - Scrollytelling do Jaleco & Iris Radial Mask
 * Transição de abertura circular + 94 frames WebP transparentes do médico se vestindo
 * Sorteio aleatório feminino/masculino + 4 pilares informativos
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    const hero = document.getElementById('hero');
    const textLayer = document.getElementById('hero-text-layer');
    const doctorsLayer = document.getElementById('hero-doctors-layer');

                ScrollTrigger.config({ ignoreMobileResize: true });

                const pinnedStage = document.getElementById('hero-pinned-stage');
                const stageBehind = document.getElementById('stage-behind');
                const isMobileScroll = window.innerWidth < 768;
                const D = isMobileScroll ? 320 : 520; // Pacing equilibrado: 520px desktop e 320px mobile

                if (pinnedStage && hero && stageBehind) {
                    const TOTAL_FRAMES = 94;
                    const FRAMES = new Array(TOTAL_FRAMES).fill(null);
                    const PATHS = {
                        female: 'assets/transformation/female_transparent/frame_',
                        male: 'assets/transformation/male_transparent/frame_'
                    };

                    // Sorteio aleatório a cada recarregamento (50% mulher / 50% homem)
                    const currentGender = Math.random() < 0.5 ? 'female' : 'male';
                    const canvas = document.getElementById('scrolly-canvas');
                    const ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                    }
                    const bgOutline = document.getElementById('scrolly-bg-outline');

                    // Cache de geometria do canvas para zero cálculos matemáticos por frame de scroll
                    let cachedW = 0;
                    let cachedH = 0;
                    let cachedDrawW = 0;
                    let cachedDrawH = 0;
                    let cachedOffsetX = 0;
                    let cachedOffsetY = 0;

                    // Elementos do HUD de Progresso e Navegação Rápida
                    const scrollyHud = document.getElementById('scrolly-hud');
                    const scrollyProgressBar = document.getElementById('scrolly-progress-bar');
                    const scrollyScrollCue = document.getElementById('scrolly-scroll-cue');

                    if (scrollyScrollCue) {
                        scrollyScrollCue.addEventListener('click', (e) => {
                            e.preventDefault();
                            const vagas = document.getElementById('vagas');
                            if (!vagas) return;
                            if (window.__lenis) {
                                window.__lenis.scrollTo(vagas, { duration: 1.1 });
                            } else {
                                vagas.scrollIntoView({ behavior: 'smooth' });
                            }
                        });
                    }

                    // ==========================================================
                    // MOTOR DE INTERPOLAÇÃO SUAVE DESACOPLADA (LERP ASSISTIDO EM rAF)
                    // Sincronizado ao Lenis Smooth Scroll para resposta imediata e 60/120 FPS.
                    // ==========================================================
                    let targetFrame = 0;
                    let smoothFrame = 0;
                    let displayedIndex = -1;
                    let displayedSourceIndex = -1;
                    let isLoopRunning = false;

                    function isFrameReady(item) {
                        if (!item) return false;
                        if (typeof ImageBitmap !== 'undefined' && item instanceof ImageBitmap) {
                            return item.width > 0;
                        }
                        return Boolean(item.complete && item.naturalWidth > 0);
                    }

                    function getReadyFrameEntry(index) {
                        const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));

                        // 1. Frame exato já pré-decodificado na GPU
                        if (isFrameReady(FRAMES[clamped])) {
                            return { item: FRAMES[clamped], index: clamped };
                        }
                        // 2. Busca o frame pronto mais próximo por distância mínima (evita congelamento em scrub rápido)
                        for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
                            const prev = clamped - offset;
                            if (prev >= 0 && isFrameReady(FRAMES[prev])) {
                                return { item: FRAMES[prev], index: prev };
                            }
                            const next = clamped + offset;
                            if (next < TOTAL_FRAMES && isFrameReady(FRAMES[next])) {
                                return { item: FRAMES[next], index: next };
                            }
                        }
                        return null;
                    }

                    function drawFrame(img, sourceIdx) {
                        if (!canvas || !ctx || !img) return;
                        ctx.clearRect(0, 0, cachedW, cachedH);
                        ctx.drawImage(img, cachedOffsetX, cachedOffsetY, cachedDrawW, cachedDrawH);
                        if (typeof sourceIdx === 'number') {
                            displayedSourceIndex = sourceIdx;
                        }
                    }

                    function tickSmoothFrames() {
                        const diff = targetFrame - smoothFrame;

                        if (Math.abs(diff) > 0.04) {
                            // Interpolação ágil sem double-lag com Lenis: preenche frames saltados no scroll
                            const speed = Math.abs(diff) > 10 ? 0.34 : 0.26;
                            smoothFrame += diff * speed;
                            const nextIdx = Math.round(smoothFrame);

                            if (nextIdx !== displayedIndex) {
                                displayedIndex = nextIdx;
                                const entry = getReadyFrameEntry(nextIdx);
                                if (entry) drawFrame(entry.item, entry.index);
                            }
                            requestAnimationFrame(tickSmoothFrames);
                        } else {
                            smoothFrame = targetFrame;
                            const finalIdx = Math.round(smoothFrame);
                            if (finalIdx !== displayedIndex) {
                                displayedIndex = finalIdx;
                                const entry = getReadyFrameEntry(finalIdx);
                                if (entry) drawFrame(entry.item, entry.index);
                            }
                            isLoopRunning = false;
                        }
                    }

                    function updateTargetFrame(val) {
                        targetFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, val));
                        if (!isLoopRunning) {
                            isLoopRunning = true;
                            requestAnimationFrame(tickSmoothFrames);
                        }
                    }

                    function resizeDoctorCanvas() {
                        if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        const dpr = Math.min(window.devicePixelRatio || 1, 2);
                        canvas.width = Math.round(rect.width * dpr);
                        canvas.height = Math.round(rect.height * dpr);

                        cachedW = canvas.width;
                        cachedH = canvas.height;

                        const isMobile = window.innerWidth < 768;
                        const targetHeightRatio = isMobile ? 0.84 : 0.90;
                        cachedDrawH = cachedH * targetHeightRatio;
                        // Proporção exata 16:9 dos frames (1600x900)
                        cachedDrawW = (1600 / 900) * cachedDrawH;
                        cachedOffsetX = (cachedW - cachedDrawW) / 2;
                        cachedOffsetY = cachedH - cachedDrawH;

                        const entry = getReadyFrameEntry(Math.round(smoothFrame));
                        if (entry) drawFrame(entry.item, entry.index);
                    }

                    // ==========================================================
                    // PRÉ-DECODIFICAÇÃO GPU (ImageBitmap) + FILA PRIORITÁRIA MULTI-PASS
                    // Carrega primeiro os keyframes principais com no máximo 6 requisições simultâneas,
                    // eliminando travamentos de decodificação WebP na CPU durante o scroll.
                    // ==========================================================
                    const deviceMemory = navigator.deviceMemory || 8;
                    const isLowMem = isMobileScroll || deviceMemory <= 2;
                    const bitmapW = isLowMem ? 768 : (deviceMemory <= 4 ? 960 : 1280);
                    const bitmapH = isLowMem ? 432 : (deviceMemory <= 4 ? 540 : 720);

                    async function toBitmap(source) {
                        if (typeof createImageBitmap !== 'function') return source;
                        try {
                            return await createImageBitmap(source, {
                                resizeWidth: bitmapW,
                                resizeHeight: bitmapH,
                                resizeQuality: 'high'
                            });
                        } catch (_) {
                            return await createImageBitmap(source);
                        }
                    }

                    function loadViaImage(url) {
                        return new Promise((resolve, reject) => {
                            const img = new Image();
                            img.decoding = 'async';
                            img.onload = async () => {
                                try {
                                    if (typeof img.decode === 'function') await img.decode().catch(() => {});
                                    const bmp = await toBitmap(img).catch(() => img);
                                    resolve(bmp);
                                } catch (_) {
                                    resolve(img);
                                }
                            };
                            img.onerror = reject;
                            img.src = url;
                        });
                    }

                    async function fetchAndDecodeBitmap(url) {
                        const res = await fetch(url);
                        if (!res.ok) throw new Error('HTTP ' + res.status);
                        const blob = await res.blob();
                        return await toBitmap(blob);
                    }

                    async function loadSingleFrame(idx) {
                        const pad = String(idx + 1).padStart(3, '0');
                        const primaryUrl = `${PATHS[currentGender]}${pad}.webp`;
                        const fallbackUrl = `assets/transformation/${currentGender}/frame_${pad}.webp`;

                        if (typeof createImageBitmap === 'function') {
                            try {
                                return await fetchAndDecodeBitmap(primaryUrl);
                            } catch (_) {
                                try {
                                    return await fetchAndDecodeBitmap(fallbackUrl);
                                } catch (__) {
                                    // Fallback para protocolo file:// ou navegadores sem fetch local
                                }
                            }
                        }
                        try {
                            return await loadViaImage(primaryUrl);
                        } catch (_) {
                            return await loadViaImage(fallbackUrl);
                        }
                    }

                    function buildPriorityQueue() {
                        const queue = [];
                        const seen = new Set();
                        const enqueue = (i) => {
                            if (i >= 0 && i < TOTAL_FRAMES && !seen.has(i)) {
                                seen.add(i);
                                queue.push(i);
                            }
                        };

                        // Pass 1: Keyframes (0, 93 e passos de 8) para scrubbing imediato
                        enqueue(0);
                        enqueue(TOTAL_FRAMES - 1);
                        for (let i = 8; i < TOTAL_FRAMES; i += 8) enqueue(i);
                        // Pass 2: Meio-termo (passos de 4)
                        for (let i = 4; i < TOTAL_FRAMES; i += 8) enqueue(i);
                        // Pass 3: Frames pares (passos de 2 — mobile/low-RAM encerra aqui com 48 keyframes)
                        for (let i = 2; i < TOTAL_FRAMES; i += 4) enqueue(i);
                        // Pass 4: Frames ímpares completos apenas em desktop com memória suficiente
                        if (!isLowMem) {
                            for (let i = 1; i < TOTAL_FRAMES; i += 2) enqueue(i);
                        }
                        return queue;
                    }

                    const priorityQueue = buildPriorityQueue();
                    let queueCursor = 0;
                    const MAX_CONCURRENT = 6;

                    async function runFrameWorker() {
                        while (queueCursor < priorityQueue.length) {
                            const idx = priorityQueue[queueCursor++];
                            try {
                                const readyItem = await loadSingleFrame(idx);
                                FRAMES[idx] = readyItem;

                                const currentTargetIdx = Math.round(smoothFrame);
                                const prevDist = displayedSourceIndex === -1
                                    ? Infinity
                                    : Math.abs(currentTargetIdx - displayedSourceIndex);
                                const newDist = Math.abs(currentTargetIdx - idx);

                                if (currentTargetIdx === 0) {
                                    if (idx === 0 && !isLoopRunning) {
                                        displayedIndex = 0;
                                        drawFrame(readyItem, 0);
                                    }
                                } else if (!isLoopRunning && newDist < prevDist) {
                                    displayedIndex = currentTargetIdx;
                                    drawFrame(readyItem, idx);
                                }
                            } catch (_) {
                                // Silencioso: motor busca frame vizinho pronto se algum asset falhar
                            }
                        }
                    }

                    window.addEventListener('resize', resizeDoctorCanvas, { passive: true });
                    resizeDoctorCanvas();

                    for (let w = 0; w < MAX_CONCURRENT; w++) {
                        runFrameWorker();
                    }

                    const frameProxy = { frame: 0 };

                    const heroTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: pinnedStage,
                            start: 'top top',
                            end: () => '+=' + (window.innerWidth < 768 ? 320 : 520),
                            pin: true,
                            pinSpacing: true,
                            anticipatePin: 1,
                            scrub: window.__lenis ? true : 0.25,
                            invalidateOnRefresh: true,
                            onUpdate: (self) => {
                                if (scrollyProgressBar) {
                                    scrollyProgressBar.style.transform = `scaleX(${self.progress})`;
                                }
                                if (scrollyHud) {
                                    if (self.progress <= 0.02) {
                                        scrollyHud.style.opacity = '0';
                                        scrollyHud.style.pointerEvents = 'none';
                                    } else if (self.progress > 0.88) {
                                        const fade = Math.max(0, (1 - self.progress) / 0.12);
                                        scrollyHud.style.opacity = String(fade);
                                        scrollyHud.style.pointerEvents = 'none';
                                    } else {
                                        scrollyHud.style.opacity = '1';
                                        scrollyHud.style.pointerEvents = 'auto';
                                    }
                                }
                            },
                            onLeave: () => {
                                hero.style.display = 'none';
                                if (scrollyHud) {
                                    scrollyHud.style.opacity = '0';
                                    scrollyHud.style.pointerEvents = 'none';
                                }
                            },
                            onEnterBack: () => {
                                hero.style.display = 'flex';
                                if (scrollyHud) {
                                    scrollyHud.style.opacity = '1';
                                    scrollyHud.style.pointerEvents = 'auto';
                                }
                            }
                        }
                    });

                    // FASE 1 (0.0 -> 0.32): Abertura da íris circular via clip-path 100% acelerado pela GPU (zero blur / zero re-rasterização)
                    heroTl.fromTo(stageBehind,
                        { clipPath: 'circle(0% at 50% 50%)' },
                        { 
                            clipPath: 'circle(140% at 50% 50%)', 
                            ease: 'power1.inOut', 
                            duration: 0.32,
                            onStart: () => { stageBehind.style.pointerEvents = 'auto'; },
                            onReverseComplete: () => { stageBehind.style.pointerEvents = 'none'; }
                        },
                        0
                    );

                    // Fade out suave e escala sutil do Hero frontal
                    heroTl.to(hero, {
                        opacity: 0,
                        scale: 0.95,
                        ease: 'power1.inOut',
                        duration: 0.28
                    }, 0.02);

                    // 3. Efeito de profundidade sutil nos elementos do Hero frontal durante a abertura
                    if (textLayer) {
                        heroTl.to(textLayer, {
                            scale: 0.94,
                            opacity: 0,
                            ease: 'power1.inOut',
                            duration: 0.22
                        }, 0);
                    }
                    if (doctorsLayer) {
                        heroTl.to(doctorsLayer, {
                            scale: 0.95,
                            opacity: 0,
                            ease: 'power1.inOut',
                            duration: 0.24
                        }, 0);
                    }
                    const bottomUI = hero.querySelector('.hero-bottom-ui');
                    if (bottomUI) {
                        heroTl.to(bottomUI, {
                            y: 30,
                            opacity: 0,
                            ease: 'power1.inOut',
                            duration: 0.20
                        }, 0);
                    }

                    // 4. Entrada do Título "Tradição Centenária, Ciência de Vanguarda." e do Texto Monumental
                    const sobreHeading = document.getElementById('sobre-heading');
                    if (sobreHeading && !sobreHeading.dataset.splitDone) {
                        sobreHeading.dataset.splitDone = 'true';
                        const rawWords = sobreHeading.innerText.trim().split(/\s+/);
                        sobreHeading.innerHTML = rawWords.map(w => `<span class="word-mask"><span class="word-inner">${w}</span></span>`).join(' ');
                    }
                    const sobreWordInners = sobreHeading ? sobreHeading.querySelectorAll('.word-inner') : [];
                    if (sobreWordInners.length) {
                        heroTl.fromTo(sobreWordInners,
                            { yPercent: 115, rotateZ: 4, opacity: 0 },
                            { yPercent: 0, rotateZ: 0, opacity: 1, stagger: 0.015, ease: 'power3.out', duration: 0.22 },
                            0.04
                        );
                    }

                    const line1 = document.getElementById('scrolly-text-line-1');
                    const line2 = document.getElementById('scrolly-text-line-2');

                    if (bgOutline) {
                        heroTl.fromTo(bgOutline,
                            { scale: 0.95, opacity: 0 },
                            { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.25 },
                            0.04
                        );
                    }

                    // Linha 1 ("CONCURSO") desliza da esquerda até o centro exato da página (xPercent: 0) e PARA de se mover
                    // Linha 2 ("UNIFICADO 27") desliza da direita até o centro exato da página (xPercent: 0) e PARA de se mover
                    if (line1) {
                        heroTl.fromTo(line1,
                            { xPercent: -36 },
                            { xPercent: 0, ease: 'power2.out', duration: 0.44 },
                            0
                        );
                    }
                    if (line2) {
                        heroTl.fromTo(line2,
                            { xPercent: 36 },
                            { xPercent: 0, ease: 'power2.out', duration: 0.44 },
                            0
                        );
                    }

                    // FASE 2 (0.08 -> 0.92): Veste o jaleco com motor de interpolação assistida por código
                    heroTl.to(frameProxy, {
                        frame: TOTAL_FRAMES - 1,
                        ease: 'none',
                        duration: 0.84,
                        onUpdate: () => {
                            updateTargetFrame(frameProxy.frame);
                        }
                    }, 0.08);

                    // Os 4 cards informativos surgem em sequência fluida durante a vestimenta do jaleco
                    const card1 = document.getElementById('scrolly-card-1');
                    const card2 = document.getElementById('scrolly-card-2');
                    const card3 = document.getElementById('scrolly-card-3');
                    const card4 = document.getElementById('scrolly-card-4');

                    if (card1) {
                        heroTl.fromTo(card1,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.20, onStart: () => card1.classList.add('scrolly-pillar-active'), onReverseComplete: () => card1.classList.remove('scrolly-pillar-active') },
                            0.18
                        );
                    }
                    if (card2) {
                        heroTl.fromTo(card2,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.20, onStart: () => card2.classList.add('scrolly-pillar-active'), onReverseComplete: () => card2.classList.remove('scrolly-pillar-active') },
                            0.38
                        );
                    }
                    if (card3) {
                        heroTl.fromTo(card3,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.20, onStart: () => card3.classList.add('scrolly-pillar-active'), onReverseComplete: () => card3.classList.remove('scrolly-pillar-active') },
                            0.58
                        );
                    }
                    if (card4) {
                        heroTl.fromTo(card4,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.20, onStart: () => card4.classList.add('scrolly-pillar-active'), onReverseComplete: () => card4.classList.remove('scrolly-pillar-active') },
                            0.76
                        );
                    }

                    // Respiro final enxuto (0.04) para transição imediata para #vagas
                    heroTl.to({}, { duration: 0.04 }, 0.96);
                }

});
