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
                const D = isMobileScroll ? 650 : 1000; // 650px no celular conforme solicitado

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
                    const ctx = canvas ? canvas.getContext('2d') : null;
                    const bgOutline = document.getElementById('scrolly-bg-outline');
                    let currentFrame = 0;

                    function renderDoctorFrame(index) {
                        if (!canvas || !ctx) return;
                        const list = CACHE[currentGender];
                        if (!list || !list[index] || !list[index].complete) return;

                        const img = list[index];
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        const isMobile = window.innerWidth < 768;
                        const targetHeightRatio = isMobile ? 0.84 : 0.90;
                        let drawHeight = canvas.height * targetHeightRatio;
                        let drawWidth = img.width * (drawHeight / img.height);

                        const offsetX = (canvas.width - drawWidth) / 2;
                        const offsetY = canvas.height - drawHeight;

                        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                    }

                    function resizeDoctorCanvas() {
                        if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        const dpr = Math.min(window.devicePixelRatio || 1, 2);
                        canvas.width = rect.width * dpr;
                        canvas.height = rect.height * dpr;
                        renderDoctorFrame(currentFrame);
                    }

                    // Preload dos 94 frames do médico sorteado
                    for (let i = 1; i <= TOTAL_FRAMES; i++) {
                        const img = new Image();
                        const pad = String(i).padStart(3, '0');
                        img.src = `${PATHS[currentGender]}${pad}.webp`;
                        if (i === 1) {
                            img.onload = () => resizeDoctorCanvas();
                        } else {
                            img.onload = () => {
                                if (currentFrame === i - 1) renderDoctorFrame(currentFrame);
                            };
                        }
                        img.onerror = () => {
                            img.src = `assets/transformation/${currentGender}/frame_${pad}.webp`;
                        };
                        CACHE[currentGender].push(img);
                    }
                    window.addEventListener('resize', resizeDoctorCanvas);
                    resizeDoctorCanvas();

                    const maskProxy = { radius: 0 };
                    const frameProxy = { frame: 0 };

                    const heroTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: pinnedStage,
                            start: 'top top',
                            end: () => '+=' + (window.innerWidth < 768 ? 650 : 1000),
                            pin: true,
                            pinSpacing: true,
                            anticipatePin: 1,
                            scrub: true,
                            invalidateOnRefresh: true,
                            onLeave: () => {
                                hero.style.display = 'none';
                            },
                            onEnterBack: () => {
                                hero.style.display = 'flex';
                            }
                        }
                    });

                    // FASE 1 (0.0 -> 0.55): A máscara radial abre do centro rapidamente com arestas aveludadas (+18% smooth feather)
                    heroTl.to(maskProxy, {
                        radius: 140,
                        ease: 'power1.in',
                        duration: 0.55,
                        onUpdate: () => {
                            const r = maskProxy.radius;
                            if (r <= 0.5) {
                                hero.style.webkitMaskImage = 'none';
                                hero.style.maskImage = 'none';
                                hero.style.opacity = '1';
                                hero.style.pointerEvents = 'auto';
                            } else {
                                const mask = `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${r}%, black ${r + 18}%)`;
                                hero.style.webkitMaskImage = mask;
                                hero.style.maskImage = mask;
                                if (r >= 135) {
                                    hero.style.opacity = '0';
                                    hero.style.pointerEvents = 'none';
                                } else {
                                    hero.style.opacity = '1';
                                    hero.style.pointerEvents = 'auto';
                                }
                            }
                        }
                    }, 0);

                    // 2. O blur começa em 20px e zera já no início da abertura da íris
                    heroTl.fromTo(stageBehind, 
                        { filter: 'blur(20px)' }, 
                        { filter: 'blur(0px)', ease: 'power2.out', duration: 0.28 }, 
                        0
                    );

                    // 3. Efeito de profundidade 3D sutil nos elementos do Hero frontal durante a abertura
                    if (textLayer) {
                        heroTl.to(textLayer, {
                            scale: 0.93,
                            opacity: 0.2,
                            ease: 'power1.inOut',
                            duration: 0.45
                        }, 0);
                    }
                    if (doctorsLayer) {
                        heroTl.to(doctorsLayer, {
                            scale: 0.94,
                            opacity: 0.3,
                            ease: 'power1.inOut',
                            duration: 0.48
                        }, 0);
                    }
                    const bottomUI = hero.querySelector('.hero-bottom-ui');
                    if (bottomUI) {
                        heroTl.to(bottomUI, {
                            y: 35,
                            opacity: 0.2,
                            ease: 'power1.inOut',
                            duration: 0.38
                        }, 0);
                    }

                    // 4. Entrada do Título "Tradição Centenária, Ciência de Vanguarda." e do Texto Outlined "CONCURSO UNIFICADO 27"
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
                            { yPercent: 0, rotateZ: 0, opacity: 1, stagger: 0.025, ease: 'power3.out', duration: 0.35 },
                            0.08
                        );
                    }

                    const line1 = document.getElementById('scrolly-text-line-1');
                    const line2 = document.getElementById('scrolly-text-line-2');

                    if (bgOutline) {
                        heroTl.fromTo(bgOutline,
                            { scale: 0.94, opacity: 0 },
                            { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.4 },
                            0.08
                        );
                    }

                    // ANIMAÇÃO CONFORME SOLICITADO:
                    // Linha 1 ("CONCURSO") desliza da esquerda para a direita com o scroll
                    // Linha 2 ("UNIFICADO 27") desliza da direita para a esquerda com o scroll
                    if (line1) {
                        heroTl.fromTo(line1,
                            { xPercent: -24 },
                            { xPercent: 24, ease: 'none', duration: 2.30 },
                            0
                        );
                    }
                    if (line2) {
                        heroTl.fromTo(line2,
                            { xPercent: 24 },
                            { xPercent: -24, ease: 'none', duration: 2.30 },
                            0
                        );
                    }

                    // FASE 2 (0.28 -> 2.15): Já começa a vestir o jaleco assim que o centro da íris abre (zero scroll morto)
                    heroTl.to(frameProxy, {
                        frame: TOTAL_FRAMES - 1,
                        ease: 'none',
                        duration: 1.87,
                        onUpdate: () => {
                            const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(frameProxy.frame)));
                            if (idx !== currentFrame) {
                                currentFrame = idx;
                                renderDoctorFrame(idx);
                            }
                        }
                    }, 0.28);

                    // As 4 informações (cards) vão aparecendo de forma ágil enquanto o médico se veste
                    const card1 = document.getElementById('scrolly-card-1');
                    const card2 = document.getElementById('scrolly-card-2');
                    const card3 = document.getElementById('scrolly-card-3');
                    const card4 = document.getElementById('scrolly-card-4');

                    if (card1) {
                        heroTl.fromTo(card1,
                            { y: 28, scale: 0.93, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.25)', duration: 0.32, onStart: () => card1.classList.add('scrolly-pillar-active'), onReverseComplete: () => card1.classList.remove('scrolly-pillar-active') },
                            0.42
                        );
                    }
                    if (card2) {
                        heroTl.fromTo(card2,
                            { y: 28, scale: 0.93, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.25)', duration: 0.32, onStart: () => card2.classList.add('scrolly-pillar-active'), onReverseComplete: () => card2.classList.remove('scrolly-pillar-active') },
                            0.85
                        );
                    }
                    if (card3) {
                        heroTl.fromTo(card3,
                            { y: 28, scale: 0.93, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.25)', duration: 0.32, onStart: () => card3.classList.add('scrolly-pillar-active'), onReverseComplete: () => card3.classList.remove('scrolly-pillar-active') },
                            1.28
                        );
                    }
                    if (card4) {
                        heroTl.fromTo(card4,
                            { y: 28, scale: 0.93, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.25)', duration: 0.32, onStart: () => card4.classList.add('scrolly-pillar-active'), onReverseComplete: () => card4.classList.remove('scrolly-pillar-active') },
                            1.70
                        );
                    }

                    // Breve respiro final (0.15) antes de liberar o pin para #vagas
                    heroTl.to({}, { duration: 0.15 }, 2.15);
                }

});
