/**
 * UFF Medicina 2027 - Hero Parallax Exit & Scrollytelling do Jaleco
 * Saída natural do Hero com paralaxe multi-plano + pinagem dedicada aos 48 keyframes do médico
 * Sorteio aleatório feminino/masculino + 4 pilares informativos
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    const hero = document.getElementById('hero');
    const bgLayer = document.getElementById('hero-bg-layer');
    const textLayer = document.getElementById('hero-text-layer');
    const doctorsLayer = document.getElementById('hero-doctors-layer');

                ScrollTrigger.config({ ignoreMobileResize: true });

                const scrollyStage = document.getElementById('scrolly-stage');
                const isMobileScroll = window.innerWidth < 768;

                if (scrollyStage) {
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

                    // ==========================================================
                    // 1. SAÍDA NATURAL DO HERO COM PARALAXE MULTI-PLANO AO ROLAR
                    // Usa yPercent/scale/opacity (não colide com x/y do mousemove em hero-parallax.js)
                    // ==========================================================
                    if (hero) {
                        const heroExitTl = gsap.timeline({
                            scrollTrigger: {
                                trigger: hero,
                                start: 'top top',
                                end: 'bottom top',
                                scrub: true,
                                invalidateOnRefresh: true
                            }
                        });

                        if (bgLayer) {
                            heroExitTl.to(bgLayer, {
                                yPercent: 22,
                                scale: 1.07,
                                opacity: 0.35,
                                ease: 'none',
                                duration: 1
                            }, 0);
                        }
                        if (textLayer) {
                            heroExitTl.to(textLayer, {
                                yPercent: 34,
                                scale: 0.92,
                                opacity: 0,
                                ease: 'power1.in',
                                duration: 0.85
                            }, 0);
                        }
                        if (doctorsLayer) {
                            heroExitTl.to(doctorsLayer, {
                                yPercent: 10,
                                scale: 1.04,
                                opacity: 0.15,
                                ease: 'none',
                                duration: 1
                            }, 0);
                        }
                        const bottomUI = hero.querySelector('.hero-bottom-ui');
                        if (bottomUI) {
                            heroExitTl.to(bottomUI, {
                                y: -44,
                                opacity: 0,
                                ease: 'power1.out',
                                duration: 0.55
                            }, 0);
                        }
                    }

                    // ==========================================================
                    // 2. ENTRADA PREPARATÓRIA DO PALCO ANTES DE TRAVAR A PINAGEM
                    // Enquanto #scrolly-stage sobe até o topo, título e texto monumental
                    // já se alinham perfeitamente no centro antes do pin começar.
                    // ==========================================================
                    const sobreHeading = document.getElementById('sobre-heading');
                    if (sobreHeading && !sobreHeading.dataset.splitDone) {
                        sobreHeading.dataset.splitDone = 'true';
                        const rawWords = sobreHeading.innerText.trim().split(/\s+/);
                        sobreHeading.innerHTML = rawWords.map(w => `<span class="word-mask"><span class="word-inner">${w}</span></span>`).join(' ');
                    }
                    const sobreWordInners = sobreHeading ? sobreHeading.querySelectorAll('.word-inner') : [];
                    const line1 = document.getElementById('scrolly-text-line-1');
                    const line2 = document.getElementById('scrolly-text-line-2');

                    const entranceTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: scrollyStage,
                            start: 'top 85%',
                            end: 'top top',
                            scrub: true,
                            invalidateOnRefresh: true
                        }
                    });

                    if (sobreWordInners.length) {
                        entranceTl.fromTo(sobreWordInners,
                            { yPercent: 105, rotateZ: 3, opacity: 0 },
                            { yPercent: 0, rotateZ: 0, opacity: 1, stagger: 0.03, ease: 'power3.out', duration: 0.9 },
                            0
                        );
                    }
                    if (bgOutline) {
                        entranceTl.fromTo(bgOutline,
                            { scale: 0.94, opacity: 0.2 },
                            { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.9 },
                            0
                        );
                    }
                    if (line1) {
                        entranceTl.fromTo(line1,
                            { xPercent: -26 },
                            { xPercent: 0, ease: 'power2.out', duration: 1 },
                            0
                        );
                    }
                    if (line2) {
                        entranceTl.fromTo(line2,
                            { xPercent: 26 },
                            { xPercent: 0, ease: 'power2.out', duration: 1 },
                            0
                        );
                    }

                    // ==========================================================
                    // 3. PINAGEM DEDICADA EXCLUSIVAMENTE À ANIMAÇÃO DO MÉDICO + 4 PILARES
                    // 100% da distância pinada veste o jaleco e revela os 4 cards com precisão.
                    // ==========================================================
                    const coatTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: scrollyStage,
                            start: 'top top',
                            end: () => '+=' + (window.innerWidth < 768 ? 360 : 560),
                            pin: true,
                            pinSpacing: true,
                            anticipatePin: 1,
                            scrub: window.__lenis ? true : 0.2,
                            invalidateOnRefresh: true,
                            onUpdate: (self) => {
                                if (scrollyProgressBar) {
                                    scrollyProgressBar.style.transform = `scaleX(${self.progress})`;
                                }
                                if (scrollyHud) {
                                    if (self.progress <= 0.01) {
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
                                if (scrollyHud) {
                                    scrollyHud.style.opacity = '0';
                                    scrollyHud.style.pointerEvents = 'none';
                                }
                            },
                            onLeaveBack: () => {
                                if (scrollyHud) {
                                    scrollyHud.style.opacity = '0';
                                    scrollyHud.style.pointerEvents = 'none';
                                }
                            },
                            onEnterBack: () => {
                                if (scrollyHud) {
                                    scrollyHud.style.opacity = '1';
                                    scrollyHud.style.pointerEvents = 'auto';
                                }
                            }
                        }
                    });

                    // Veste o jaleco ao longo de praticamente toda a pinagem (0.00 -> 0.92)
                    coatTl.to(frameProxy, {
                        frame: TOTAL_FRAMES - 1,
                        ease: 'none',
                        duration: 0.92,
                        onUpdate: () => {
                            updateTargetFrame(frameProxy.frame);
                        }
                    }, 0);

                    // Os 4 cards informativos surgem em sequência fluida durante a vestimenta do jaleco
                    const card1 = document.getElementById('scrolly-card-1');
                    const card2 = document.getElementById('scrolly-card-2');
                    const card3 = document.getElementById('scrolly-card-3');
                    const card4 = document.getElementById('scrolly-card-4');

                    if (card1) {
                        coatTl.fromTo(card1,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.18, onStart: () => card1.classList.add('scrolly-pillar-active'), onReverseComplete: () => card1.classList.remove('scrolly-pillar-active') },
                            0.08
                        );
                    }
                    if (card2) {
                        coatTl.fromTo(card2,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.18, onStart: () => card2.classList.add('scrolly-pillar-active'), onReverseComplete: () => card2.classList.remove('scrolly-pillar-active') },
                            0.28
                        );
                    }
                    if (card3) {
                        coatTl.fromTo(card3,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.18, onStart: () => card3.classList.add('scrolly-pillar-active'), onReverseComplete: () => card3.classList.remove('scrolly-pillar-active') },
                            0.48
                        );
                    }
                    if (card4) {
                        coatTl.fromTo(card4,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.18, onStart: () => card4.classList.add('scrolly-pillar-active'), onReverseComplete: () => card4.classList.remove('scrolly-pillar-active') },
                            0.68
                        );
                    }

                    // Respiro final (0.92 -> 1.00) exibindo o médico completo antes de despinar para #vagas
                    coatTl.to({}, { duration: 0.08 }, 0.92);

                    window.addEventListener('load', () => {
                        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                    }, { once: true });
                }

});
