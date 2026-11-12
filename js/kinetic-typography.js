/**
 * UFF Medicina 2027 - Tipografia Cinética e Revelações no Scroll
 * Curtain Rise nos títulos, leitura iluminada nos parágrafos e micro-interações
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

            // Image reveals in lower sections
            gsap.utils.toArray('.img-reveal-wrap').forEach((wrap) => {
                const img = wrap.querySelector('img');
                if (img) {
                    gsap.fromTo(img, 
                        { scale: 1.15, y: -15 }, 
                        {
                            scale: 1,
                            y: 15,
                            scrollTrigger: {
                                trigger: wrap,
                                start: 'top bottom',
                                end: 'bottom top',
                                scrub: true
                            }
                        }
                    );
                }
            });


            // 10. KINETIC TYPOGRAPHY & SCROLL-INTERACTIVE CHOREOGRAPHY
            //     (INSPIRADO EM THE ROMANS — AUTÊNTICO & FLUIDO)
            // -------------------------------------------------------------
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!reduceMotion) {

                // Helper: Divide títulos em máscaras de palavras para revelação editorial (Curtain Rise)
                const splitHeadingWords = (el) => {
                    if (!el || el.dataset.splitDone) return [];
                    el.dataset.splitDone = 'true';
                    const words = el.innerText.trim().split(/\s+/);
                    el.innerHTML = words.map(w => `<span class="word-mask"><span class="word-inner">${w}</span></span>`).join(' ');
                    return el.querySelectorAll('.word-inner');
                };

                // Helper: Divide parágrafos em palavras que acendem progressivamente com o scroll (Scrub Reading)
                const splitParagraphLitWords = (el) => {
                    if (!el || el.dataset.litDone) return [];
                    el.dataset.litDone = 'true';
                    const words = el.innerText.trim().split(/\s+/);
                    el.innerHTML = words.map(w => `<span class="scroll-lit-word" style="opacity: 0.25;">${w}</span>`).join(' ');
                    return el.querySelectorAll('.scroll-lit-word');
                };

                // 10.1. Títulos de todas as seções no <main>: Subida cinética das palavras + reação elástica ao scroll
                const sectionHeadings = document.querySelectorAll('#main-content h2, #especialidades h3');
                sectionHeadings.forEach((heading) => {
                    const wordInners = splitHeadingWords(heading);
                    if (!wordInners.length) return;

                    gsap.fromTo(wordInners,
                        { yPercent: 120, rotateZ: 5, opacity: 0 },
                        {
                            yPercent: 0,
                            rotateZ: 0,
                            opacity: 1,
                            stagger: 0.045,
                            duration: 0.85,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: heading,
                                start: 'top 88%',
                                end: 'top 55%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );
                });

                // 10.2. Subtítulos editoriais com iluminação progressiva palavra por palavra controlada pelo Scroll (Scrub)
                const scrubSubtitles = document.querySelectorAll(
                    '#especialidades > div:first-child p, #cronograma > div:first-child p, #selecao > div:first-child p, #main-content > section:last-of-type p'
                );
                scrubSubtitles.forEach((p) => {
                    const litWords = splitParagraphLitWords(p);
                    if (!litWords.length) return;

                    gsap.fromTo(litWords,
                        { opacity: 0.22, y: 6 },
                        {
                            opacity: 1,
                            y: 0,
                            stagger: 0.05,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: p,
                                start: 'top 88%',
                                end: 'top 52%',
                                scrub: 0.4
                            }
                        }
                    );
                });

                // 10.3. Cards de Indicadores (#vagas): Entrada 3D com inclinação e surgimento escalonado
                const statCards = gsap.utils.toArray('#vagas .stat-card');
                if (statCards.length) {
                    gsap.fromTo(statCards,
                        { y: 65, opacity: 0, scale: 0.92, rotateX: 12 },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            rotateX: 0,
                            stagger: 0.14,
                            duration: 0.9,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: '#vagas',
                                start: 'top 86%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );
                }

                // 10.4. Seção Especialidades: Controles de navegação, Carrossel de Cards e Créditos surgindo em cascata
                const specControls = document.querySelector('#especialidades > div:first-child > div:last-child');
                if (specControls) {
                    gsap.fromTo(specControls,
                        { x: 35, opacity: 0 },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 0.8,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: '#especialidades',
                                start: 'top 82%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );
                }

                const specTrackWrap = document.getElementById('spec-cards-track');
                if (specTrackWrap) {
                    gsap.fromTo(specTrackWrap,
                        { y: 60, opacity: 0, scale: 0.97 },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 1,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: specTrackWrap,
                                start: 'top 88%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );
                }

                const creditsViewport = document.getElementById('credits-viewport');
                if (creditsViewport) {
                    gsap.fromTo(creditsViewport,
                        { y: 45, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.9,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: creditsViewport,
                                start: 'top 88%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );
                }

                // 10.5. Seção Cronograma: Painel HUD de Contagem Regressiva + Linha do Tempo desenhada pelo Scroll
                const hudPanel = document.querySelector('#cronograma .glass-card');
                if (hudPanel) {
                    gsap.fromTo(hudPanel,
                        { y: 55, opacity: 0, scale: 0.96 },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.9,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: hudPanel,
                                start: 'top 86%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );

                    const hudDigits = hudPanel.querySelectorAll('.grid-cols-4 > div');
                    if (hudDigits.length) {
                        gsap.fromTo(hudDigits,
                            { y: 30, opacity: 0, scale: 0.88 },
                            {
                                y: 0,
                                opacity: 1,
                                scale: 1,
                                stagger: 0.09,
                                duration: 0.7,
                                ease: 'back.out(1.5)',
                                scrollTrigger: {
                                    trigger: hudPanel,
                                    start: 'top 80%',
                                    toggleActions: 'play none none reverse'
                                }
                            }
                        );
                    }
                }

                // Animação dos passos do Cronograma conforme o scroll
                const timelineContainer = document.querySelector('#cronograma .border-l-2');
                if (timelineContainer) {
                    const timelineSteps = timelineContainer.querySelectorAll('.group');
                    timelineSteps.forEach((step, idx) => {
                        const dot = step.querySelector('.timeline-dot') || step.querySelector('div:first-child');
                        const dateTag = step.querySelector('.step-date-tag') || step.querySelector('span');
                        const stepTitle = step.querySelector('h4');
                        const stepDesc = step.querySelector('p');
                        const highlightCard = step.querySelector('.timeline-highlight-card');

                        const stepTl = gsap.timeline({
                            scrollTrigger: {
                                trigger: step,
                                start: 'top 86%',
                                end: 'top 55%',
                                toggleActions: 'play none none reverse'
                            }
                        });

                        if (dot) {
                            stepTl.fromTo(dot,
                                { scale: 0, opacity: 0 },
                                { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
                                0
                            );
                        }
                        if (highlightCard) {
                            stepTl.fromTo(highlightCard,
                                { y: 28, opacity: 0, scale: 0.98 },
                                { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out' },
                                0.04
                            );
                        }
                        if (dateTag) {
                            stepTl.fromTo(dateTag,
                                { x: -20, opacity: 0 },
                                { x: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
                                0.08
                            );
                        }
                        if (stepTitle) {
                            stepTl.fromTo(stepTitle,
                                { x: 25, opacity: 0 },
                                { x: 0, opacity: 1, duration: 0.55, ease: 'power3.out' },
                                0.12
                            );
                        }
                        if (stepDesc) {
                            stepTl.fromTo(stepDesc,
                                { y: 15, opacity: 0 },
                                { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
                                0.18
                            );
                        }
                    });
                }

                // 10.6. Seção Seleção (#selecao): Cards de Fase 1 e Fase 2 surgindo em convergência 3D com textos animados
                const selecaoCards = gsap.utils.toArray('#selecao .glass-card');
                selecaoCards.forEach((card, i) => {
                    const fromX = i === 0 ? -45 : 45;
                    const rotZ = i === 0 ? -1.5 : 1.5;

                    gsap.fromTo(card,
                        { x: fromX, y: 50, rotateZ: rotZ, opacity: 0, scale: 0.95 },
                        {
                            x: 0,
                            y: 0,
                            rotateZ: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.9,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: card,
                                start: 'top 86%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );

                    const cardTitle = card.querySelector('h3');
                    const cardDesc = card.querySelector('p');
                    if (cardTitle) {
                        const titleWords = splitHeadingWords(cardTitle);
                        if (titleWords.length) {
                            gsap.fromTo(titleWords,
                                { yPercent: 110, opacity: 0 },
                                {
                                    yPercent: 0,
                                    opacity: 1,
                                    stagger: 0.05,
                                    duration: 0.65,
                                    ease: 'power3.out',
                                    scrollTrigger: {
                                        trigger: card,
                                        start: 'top 80%',
                                        toggleActions: 'play none none reverse'
                                    }
                                }
                            );
                        }
                    }
                    if (cardDesc) {
                        const litWords = splitParagraphLitWords(cardDesc);
                        if (litWords.length) {
                            gsap.fromTo(litWords,
                                { opacity: 0.25 },
                                {
                                    opacity: 1,
                                    stagger: 0.03,
                                    ease: 'none',
                                    scrollTrigger: {
                                        trigger: card,
                                        start: 'top 78%',
                                        end: 'bottom 65%',
                                        scrub: 0.3
                                    }
                                }
                            );
                        }
                    }
                });

                // 10.7. Seção FAQ (#faq): Surgimento em cascata rítmica (Domino Unfold) conforme rola
                const faqCards = gsap.utils.toArray('#faq .faq-card');
                if (faqCards.length) {
                    faqCards.forEach((card, i) => {
                        gsap.fromTo(card,
                            { y: 35, x: i % 2 === 0 ? -20 : 20, opacity: 0, scale: 0.98 },
                            {
                                y: 0,
                                x: 0,
                                opacity: 1,
                                scale: 1,
                                duration: 0.65,
                                ease: 'power3.out',
                                scrollTrigger: {
                                    trigger: card,
                                    start: 'top 90%',
                                    toggleActions: 'play none none reverse'
                                }
                            }
                        );
                    });
                }

                // 10.8. Seção Final CTA: Expansão cinematográfica ligada ao scroll + botões em destaque
                const finalCtaCard = document.querySelector('#main-content > section:last-of-type .glass-card');
                if (finalCtaCard) {
                    gsap.fromTo(finalCtaCard,
                        { y: 60, scale: 0.92, opacity: 0 },
                        {
                            y: 0,
                            scale: 1,
                            opacity: 1,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: finalCtaCard,
                                start: 'top 90%',
                                end: 'top 55%',
                                scrub: 0.4
                            }
                        }
                    );

                    const ctaButtons = finalCtaCard.querySelectorAll('a');
                    if (ctaButtons.length) {
                        gsap.fromTo(ctaButtons,
                            { y: 25, opacity: 0, scale: 0.95 },
                            {
                                y: 0,
                                opacity: 1,
                                scale: 1,
                                stagger: 0.12,
                                duration: 0.7,
                                ease: 'back.out(1.4)',
                                scrollTrigger: {
                                    trigger: finalCtaCard,
                                    start: 'top 70%',
                                    toggleActions: 'play none none reverse'
                                }
                            }
                        );
                    }
                }
            }

});
