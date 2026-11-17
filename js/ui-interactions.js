document.addEventListener("DOMContentLoaded", () => {
        // 4. FAQ ACCORDION INTERATIVO
        // -------------------------------------------------------------
        document.querySelectorAll('.faq-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const answer = btn.nextElementSibling;
                const icon = btn.querySelector('.faq-icon');
                const isHidden = answer.classList.contains('hidden');

                document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
                document.querySelectorAll('.faq-icon').forEach(i => { i.textContent = '+'; i.style.transform = 'rotate(0deg)'; });

                if (isHidden) {
                    answer.classList.remove('hidden');
                    icon.textContent = '−';
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        });

        // -------------------------------------------------------------
        // 5. COUNTDOWN TIMER (PREVISÃO DE ABERTURA DAS INSCRIÇÕES 2027)
        // -------------------------------------------------------------
        const targetDate = new Date('2027-01-05T10:00:00-03:00');
        const daysEl = document.getElementById('hud-days');
        const hoursEl = document.getElementById('hud-hours');
        const minutesEl = document.getElementById('hud-minutes');
        const secondsEl = document.getElementById('hud-seconds');

        function updateCountdown() {
            if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
            const diff = Math.max(0, targetDate - new Date());

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            daysEl.textContent = d < 10 ? '0' + d : String(d);
            hoursEl.textContent = h < 10 ? '0' + h : String(h);
            minutesEl.textContent = m < 10 ? '0' + m : String(m);
            secondsEl.textContent = s < 10 ? '0' + s : String(s);
        }

        if (daysEl) {
            setInterval(updateCountdown, 1000);
            updateCountdown();
        }

        // -------------------------------------------------------------
        // 6. SMOOTH ANCHOR NAVIGATION (INTEGRADA AO LENIS)
        // -------------------------------------------------------------
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    if (window.__lenis) {
                        window.__lenis.scrollTo(targetEl, { duration: 1.1 });
                    } else {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // -------------------------------------------------------------

            // 9. ANIMATED STAT COUNTERS ON SCROLL (107 VAGAS & MÉTRICAS)
            // -------------------------------------------------------------
            const vagasSection = document.getElementById('vagas');
            if (vagasSection) {
                const counters = [
                    { id: 'counter-vagas', target: 107, duration: 2.2 },
                    { id: 'counter-especialidades', target: 13, duration: 1.6 },
                    { id: 'counter-gratuito', target: 100, duration: 2.0 }
                ];

                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                if (prefersReducedMotion || typeof gsap === 'undefined') {
                    counters.forEach(c => {
                        const el = document.getElementById(c.id);
                        if (el) el.textContent = c.target;
                    });
                } else {
                    // Incremento numerico suave (0 -> target) engatilhado no scroll
                    counters.forEach(c => {
                        const el = document.getElementById(c.id);
                        if (!el) return;
                        const proxy = { val: 0 };
                        gsap.to(proxy, {
                            val: c.target,
                            duration: c.duration,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: '#vagas',
                                start: 'top 85%',
                                once: true
                            },
                            onUpdate: () => {
                                el.textContent = Math.round(proxy.val);
                            }
                        });
                    });
                }
            }

            // -------------------------------------------------------------
            // 10. ADICIONAR AO CALENDÁRIO (PC, ANDROID E iOS)
            // -------------------------------------------------------------
            const CALENDAR_EVENTS = {
                isencao: {
                    title: 'UFF Medicina 2027 — Solicitação de Isenção da Taxa',
                    location: 'concursos.cmm@id.uff.br',
                    details: 'Previsão: envio da solicitação de isenção da taxa em PDF para concursos.cmm@id.uff.br (09/12 a 12/12/2026). Resultado previsto em 18/12/2026.',
                    startUtc: '20261209T190000Z',
                    endUtc: '20261209T200000Z',
                    startIso: '2026-12-09T16:00:00-03:00',
                    endIso: '2026-12-09T17:00:00-03:00',
                    ics: 'assets/cal/uff-2027-isencao.ics'
                },
                inscricoes: {
                    title: 'UFF Medicina 2027 — Abertura das Inscrições',
                    location: 'PASSUFF (app.uff.br/pasuff) e SISPOS (app.uff.br/sispos/candidatura)',
                    details: 'Previsão: período de inscrições de 05/01 a 02/02/2027. Taxa de R$ 400,00 no PASSUFF e envio dos documentos no SISPOS. Homologação prevista em 06/02/2027.',
                    startUtc: '20270105T130000Z',
                    endUtc: '20270105T140000Z',
                    startIso: '2027-01-05T10:00:00-03:00',
                    endIso: '2027-01-05T11:00:00-03:00',
                    ics: 'assets/cal/uff-2027-inscricoes.ics'
                },
                fase1: {
                    title: 'UFF Medicina 2027 — Fase 1: Prova Escrita Presencial',
                    location: 'Faculdade de Medicina da UFF - Rua Ataíde Parreiras, 100, Niterói/RJ',
                    details: 'Previsão: 1ª Fase nos dias 24/02 e 25/02/2027 (10h às 13h), conforme especialidade. Resultado previsto em 03/03/2027 e convocação em 06/03/2027.',
                    startUtc: '20270224T130000Z',
                    endUtc: '20270224T160000Z',
                    startIso: '2027-02-24T10:00:00-03:00',
                    endIso: '2027-02-24T13:00:00-03:00',
                    ics: 'assets/cal/uff-2027-fase1.ics'
                },
                fase2: {
                    title: 'UFF Medicina 2027 — Fase 2: Documentos, Entrevista e/ou Currículo',
                    location: 'Faculdade de Medicina da UFF (SGPG - 6º andar), Niterói/RJ',
                    details: 'Previsão: entrega presencial do Currículo Lattes e comprovantes em 09/03/2027 e avaliações presenciais entre 11/03 e 13/03/2027.',
                    startUtc: '20270309T120000Z',
                    endUtc: '20270309T200000Z',
                    startIso: '2027-03-09T09:00:00-03:00',
                    endIso: '2027-03-09T17:00:00-03:00',
                    ics: 'assets/cal/uff-2027-fase2.ics'
                },
                integracao: {
                    title: 'UFF Medicina 2027 — Curso de Integração Obrigatório',
                    location: 'Faculdade de Medicina da UFF, Niterói/RJ',
                    details: 'Previsão: resultado final em 18/03/2027, Curso de Integração Acadêmica obrigatório em 25/03/2027 e início das aulas previsto em 30/03/2027.',
                    startUtc: '20270325T130000Z',
                    endUtc: '20270325T160000Z',
                    startIso: '2027-03-25T10:00:00-03:00',
                    endIso: '2027-03-25T13:00:00-03:00',
                    ics: 'assets/cal/uff-2027-resultado-integracao.ics'
                }
            };

            const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

            function closeAllCalMenus() {
                document.querySelectorAll('.cal-menu.is-open').forEach(menu => {
                    menu.classList.remove('is-open');
                    const wrap = menu.closest('.cal-wrap');
                    const btn = wrap ? wrap.querySelector('.cal-btn') : null;
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                    const step = menu.closest('.group');
                    if (step) step.classList.remove('timeline-step-open');
                });
            }

            document.querySelectorAll('.cal-wrap[data-cal-event]').forEach(wrap => {
                const key = wrap.getAttribute('data-cal-event');
                const ev = CALENDAR_EVENTS[key];
                if (!ev) return;

                const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
                    + '&text=' + encodeURIComponent(ev.title)
                    + '&dates=' + encodeURIComponent(ev.startUtc + '/' + ev.endUtc)
                    + '&details=' + encodeURIComponent(ev.details)
                    + '&location=' + encodeURIComponent(ev.location);

                const outlookUrl = 'https://outlook.live.com/calendar/0/action/compose?rru=addevent'
                    + '&startdt=' + encodeURIComponent(ev.startIso)
                    + '&enddt=' + encodeURIComponent(ev.endIso)
                    + '&subject=' + encodeURIComponent(ev.title)
                    + '&body=' + encodeURIComponent(ev.details)
                    + '&location=' + encodeURIComponent(ev.location);

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'cal-btn';
                btn.setAttribute('aria-expanded', 'false');
                btn.setAttribute('aria-haspopup', 'true');
                btn.innerHTML = ''
                    + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
                    + '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>'
                    + '<line x1="16" y1="2" x2="16" y2="6"></line>'
                    + '<line x1="8" y1="2" x2="8" y2="6"></line>'
                    + '<line x1="3" y1="10" x2="21" y2="10"></line>'
                    + '</svg>'
                    + '<span>Adicionar ao calendário</span>'
                    + '<svg class="cal-btn-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';

                const menu = document.createElement('div');
                menu.className = 'cal-menu';
                menu.setAttribute('role', 'menu');

                const icsAttr = isIOSDevice ? '' : ` download="${ev.ics.split('/').pop()}"`;
                menu.innerHTML = ''
                    + `<a class="cal-menu-item" role="menuitem" href="${googleUrl}" target="_blank" rel="noopener noreferrer"><span>Google Agenda</span><span class="cal-menu-sub">Android • Web</span></a>`
                    + `<a class="cal-menu-item" role="menuitem" href="${outlookUrl}" target="_blank" rel="noopener noreferrer"><span>Outlook</span><span class="cal-menu-sub">Windows • Web</span></a>`
                    + `<a class="cal-menu-item" role="menuitem" href="${ev.ics}"${icsAttr}><span>Apple / Outros (.ics)</span><span class="cal-menu-sub">iOS • Mac • PC</span></a>`;

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const willOpen = !menu.classList.contains('is-open');
                    closeAllCalMenus();
                    if (willOpen) {
                        menu.classList.add('is-open');
                        btn.setAttribute('aria-expanded', 'true');
                        const step = wrap.closest('.group');
                        if (step) step.classList.add('timeline-step-open');
                    }
                });

                menu.addEventListener('click', () => {
                    setTimeout(closeAllCalMenus, 80);
                });

                wrap.appendChild(btn);
                wrap.appendChild(menu);
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.cal-wrap')) closeAllCalMenus();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeAllCalMenus();
            });
});
