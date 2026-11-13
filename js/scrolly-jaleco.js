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
                    const TOTAL_FRAMES = 48;
                    const FRAMES = new Array(TOTAL_FRAMES).fill(null);

                    // 4 Sprite Sheets intercalados (3x4 = 12 frames por arquivo, 4 requests totais)
                    // O Sheet 0 já cobre do frame 0 ao 47 (100% da animação disponível logo no 1º request!)
                    const SHEET_SLOTS = [
                        [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 47],
                        [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 45],
                        [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 44],
                        [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 46]
                    ];

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
                        if (item.sheet) {
                            return Boolean(item.sheet.complete && item.sheet.naturalWidth > 0);
                        }
                        if (typeof ImageBitmap !== 'undefined' && item instanceof ImageBitmap) {
                            return item.width > 0;
                        }
                        return Boolean(item.complete && item.naturalWidth > 0);
                    }

                    function getReadyFrameEntry(index) {
                        const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));

                        if (isFrameReady(FRAMES[clamped])) {
                            return { item: FRAMES[clamped], index: clamped };
                        }
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

                    function drawFrame(item, sourceIdx) {
                        if (!canvas || !ctx || !item) return;
                        ctx.clearRect(0, 0, cachedW, cachedH);
                        if (item.sheet) {
                            ctx.drawImage(
                                item.sheet,
                                item.sx, item.sy, item.sw, item.sh,
                                cachedOffsetX, cachedOffsetY, cachedDrawW, cachedDrawH
                            );
                        } else {
                            ctx.drawImage(item, cachedOffsetX, cachedOffsetY, cachedDrawW, cachedDrawH);
                        }
                        if (typeof sourceIdx === 'number') {
                            displayedSourceIndex = sourceIdx;
                        }
                    }

                    function tickSmoothFrames() {
                        const diff = targetFrame - smoothFrame;

                        if (Math.abs(diff) > 0.04) {
                            const speed = Math.abs(diff) > 6 ? 0.34 : 0.24;
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
                        // Proporção exata 16:9 dos frames
                        cachedDrawW = (1600 / 900) * cachedDrawH;
                        cachedOffsetX = (cachedW - cachedDrawW) / 2;
                        cachedOffsetY = cachedH - cachedDrawH;

                        const entry = getReadyFrameEntry(Math.round(smoothFrame));
                        if (entry) drawFrame(entry.item, entry.index);
                    }

                    // ==========================================================
                    // CARREGAMENTO VIA SPRITE SHEET ATLAS + RECORTE GPU (4 REQUESTS TOTAIS)
                    // Reduz 94 requisições para 4 arquivos pré-escalados (desktop 1280x720 / mobile 768x432)
                    // e libera o atlas da VRAM logo após fatiar os ImageBitmaps.
                    // ==========================================================
                    const deviceMemory = navigator.deviceMemory || 8;
                    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
                    const useMobileTier = isMobileScroll || deviceMemory <= 2 || saveData;
                    const sheetTier = useMobileTier ? 'mobile' : 'desktop';
                    const cellW = useMobileTier ? 768 : 1280;
                    const cellH = useMobileTier ? 432 : 720;

                    function loadSheetViaImage(url) {
                        return new Promise((resolve, reject) => {
                            const img = new Image();
                            img.decoding = 'async';
                            img.onload = async () => {
                                if (typeof img.decode === 'function') await img.decode().catch(() => {});
                                resolve(img);
                            };
                            img.onerror = reject;
                            img.src = url;
                        });
                    }

                    async function sliceSheetIntoFrames(source, sheetIndex) {
                        const slots = SHEET_SLOTS[sheetIndex];
                        if (typeof createImageBitmap === 'function') {
                            try {
                                const bitmaps = await Promise.all(
                                    slots.map((_, pos) => {
                                        const sx = (pos % 3) * cellW;
                                        const sy = Math.floor(pos / 3) * cellH;
                                        return createImageBitmap(source, sx, sy, cellW, cellH);
                                    })
                                );
                                if (typeof source.close === 'function') source.close();
                                slots.forEach((frameIdx, pos) => {
                                    FRAMES[frameIdx] = bitmaps[pos];
                                });
                                return;
                            } catch (_) {
                                // Fallback abaixo para recorte direto no drawImage
                            }
                        }

                        slots.forEach((frameIdx, pos) => {
                            FRAMES[frameIdx] = {
                                sheet: source,
                                sx: (pos % 3) * cellW,
                                sy: Math.floor(pos / 3) * cellH,
                                sw: cellW,
                                sh: cellH
                            };
                        });
                    }

                    function refreshCanvasAfterSheetLoad() {
                        if (isLoopRunning) return;
                        const currentTargetIdx = Math.round(smoothFrame);
                        const best = getReadyFrameEntry(currentTargetIdx);
                        if (!best) return;

                        if (displayedIndex === -1 || best.index !== displayedSourceIndex) {
                            const prevDist = displayedSourceIndex === -1
                                ? Infinity
                                : Math.abs(currentTargetIdx - displayedSourceIndex);
                            const newDist = Math.abs(currentTargetIdx - best.index);
                            if (displayedIndex === -1 || newDist < prevDist) {
                                displayedIndex = currentTargetIdx;
                                drawFrame(best.item, best.index);
                            }
                        }
                    }

                    async function loadSheet(sheetIndex) {
                        const url = `assets/transformation/sheets/${currentGender}/${sheetTier}_${sheetIndex}.webp`;
                        let source = null;

                        if (typeof createImageBitmap === 'function') {
                            try {
                                const res = await fetch(url, sheetIndex === 0 ? { priority: 'high' } : undefined);
                                if (!res.ok) throw new Error('HTTP ' + res.status);
                                const blob = await res.blob();
                                source = await createImageBitmap(blob);
                            } catch (_) {
                                source = await loadSheetViaImage(url);
                            }
                        } else {
                            source = await loadSheetViaImage(url);
                        }

                        await sliceSheetIntoFrames(source, sheetIndex);
                        refreshCanvasAfterSheetLoad();
                    }

                    window.addEventListener('resize', resizeDoctorCanvas, { passive: true });
                    resizeDoctorCanvas();

                    // Sheet 0 exclusivo primeiro (0% -> 100% em 1 request), depois 1, depois 2 e 3 em paralelo
                    (async () => {
                        try {
                            await loadSheet(0);
                            await loadSheet(1);
                            await Promise.all([loadSheet(2), loadSheet(3)]);
                        } catch (_) {
                            // Silencioso caso algum request seja interrompido em navegação
                        }
                    })();

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
