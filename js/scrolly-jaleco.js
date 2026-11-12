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
                    const CACHE = { female: [], male: [] };
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
                            if (vagas) {
                                vagas.scrollIntoView({ behavior: 'smooth' });
                            }
                        });
                    }

                    // ==========================================================
                    // MOTOR DE INTERPOLAÇÃO SUAVE DESACOPLADA (LERP ASSISTIDO EM rAF)
                    // Permite controle 100% manual pelo scroll, enquanto o código
                    // suaviza a transição entre todos os 94 frames a 60/120 FPS.
                    // ==========================================================
                    let targetFrame = 0;
                    let smoothFrame = 0;
                    let displayedIndex = -1;
                    let isLoopRunning = false;

                    function getReadyImage(index) {
                        const list = CACHE[currentGender];
                        if (!list || list.length === 0) return null;
                        const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));

                        // 1. Se o frame exato já estiver baixado e decodificado, usa ele
                        if (list[clamped] && list[clamped].complete && list[clamped].naturalWidth > 0) {
                            return list[clamped];
                        }
                        // 2. Busca o frame pronto mais próximo para trás (evita congelamento em scroll rápido)
                        for (let i = clamped - 1; i >= 0; i--) {
                            if (list[i] && list[i].complete && list[i].naturalWidth > 0) return list[i];
                        }
                        // 3. Se não houver anterior, busca para frente
                        for (let i = clamped + 1; i < list.length; i++) {
                            if (list[i] && list[i].complete && list[i].naturalWidth > 0) return list[i];
                        }
                        return null;
                    }

                    function drawFrame(img) {
                        if (!canvas || !ctx || !img) return;
                        ctx.clearRect(0, 0, cachedW, cachedH);
                        ctx.drawImage(img, cachedOffsetX, cachedOffsetY, cachedDrawW, cachedDrawH);
                    }

                    function tickSmoothFrames() {
                        const diff = targetFrame - smoothFrame;

                        if (Math.abs(diff) > 0.04) {
                            // Interpolação adaptativa:
                            // Se a diferença for grande (giro brusco do mouse), acelera suavemente (0.22)
                            // Se for um ajuste fino, desacelera suavemente (0.16)
                            const speed = Math.abs(diff) > 15 ? 0.22 : 0.16;
                            smoothFrame += diff * speed;
                            const nextIdx = Math.round(smoothFrame);

                            if (nextIdx !== displayedIndex) {
                                displayedIndex = nextIdx;
                                const img = getReadyImage(nextIdx);
                                if (img) drawFrame(img);
                            }
                            requestAnimationFrame(tickSmoothFrames);
                        } else {
                            smoothFrame = targetFrame;
                            const finalIdx = Math.round(smoothFrame);
                            if (finalIdx !== displayedIndex) {
                                displayedIndex = finalIdx;
                                const img = getReadyImage(finalIdx);
                                if (img) drawFrame(img);
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

                        const currentImg = getReadyImage(Math.round(smoothFrame));
                        if (currentImg) drawFrame(currentImg);
                    }

                    // Preload dos 94 frames com decodificação assíncrona (evita travadas no main thread)
                    for (let i = 1; i <= TOTAL_FRAMES; i++) {
                        const img = new Image();
                        img.decoding = 'async';
                        const pad = String(i).padStart(3, '0');
                        img.src = `${PATHS[currentGender]}${pad}.webp`;
                        if (i === 1) {
                            img.onload = () => resizeDoctorCanvas();
                        } else {
                            img.onload = () => {
                                if (!isLoopRunning && Math.round(smoothFrame) === i - 1) {
                                    drawFrame(img);
                                }
                            };
                        }
                        img.onerror = () => {
                            img.src = `assets/transformation/${currentGender}/frame_${pad}.webp`;
                        };
                        CACHE[currentGender].push(img);
                    }
                    window.addEventListener('resize', resizeDoctorCanvas, { passive: true });
                    resizeDoctorCanvas();

                    const frameProxy = { frame: 0 };

                    const heroTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: pinnedStage,
                            start: 'top top',
                            end: () => '+=' + (window.innerWidth < 768 ? 320 : 520),
                            pin: true,
                            pinSpacing: true,
                            anticipatePin: 1,
                            scrub: 0.25, // ScrollTrigger ágil; o LERP em rAF interpola frame a frame
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
