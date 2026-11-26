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
        // 5. COUNTDOWN DINÂMICO POR ETAPA (ITEM 13 DO EDITAL CMM 01/2026)
        // -------------------------------------------------------------
        const COUNTDOWN_STAGES = [
            {
                until: '2026-12-07T00:00:00-03:00',
                target: '2026-12-07T00:00:00-03:00',
                eyebrow: 'Próxima etapa · Edital Unificado CMM Nº 01/2026',
                title: 'Período de Isenção da Taxa',
                desc: 'De <strong class="text-white">07/12</strong> a <strong class="text-white">11/12/2026</strong>, para inscritos no CadÚnico e servidores da UFF. Resultado em <strong class="text-white">16/12/2026</strong>.'
            },
            {
                until: '2026-12-11T23:59:59-03:00',
                target: '2026-12-11T23:59:59-03:00',
                eyebrow: 'Etapa em andamento · Encerra em',
                title: 'Período de Isenção da Taxa',
                desc: 'Solicitação aberta até <strong class="text-white">11/12/2026</strong> para inscritos no CadÚnico e servidores da UFF.'
            },
            {
                until: '2026-12-16T17:00:00-03:00',
                target: '2026-12-16T17:00:00-03:00',
                eyebrow: 'Próxima etapa · Edital Unificado CMM Nº 01/2026',
                title: 'Resultado da Análise de Isenção',
                desc: 'Divulgação prevista para <strong class="text-white">16/12/2026</strong> em <span class="font-mono text-slate-200">www.editais.uff.br</span>.'
            },
            {
                until: '2027-01-01T11:00:00-03:00',
                target: '2027-01-01T11:00:00-03:00',
                eyebrow: 'Próxima etapa · Edital Unificado CMM Nº 01/2026',
                title: 'Abertura das Inscrições (PASSUFF)',
                desc: 'Exclusivamente via <strong class="text-white">PASSUFF</strong> (<span class="font-mono text-slate-200">app.uff.br/pasuff</span>), de <strong class="text-white">01/01/2027 (11h)</strong> a <strong class="text-white">22/01/2027 (16h)</strong>.'
            },
            {
                until: '2027-01-22T16:00:00-03:00',
                target: '2027-01-22T16:00:00-03:00',
                eyebrow: 'Etapa em andamento · Encerra em',
                title: 'Período de Inscrições e Pagamento',
                desc: 'Inscrições abertas no <strong class="text-white">PASSUFF</strong> (<span class="font-mono text-slate-200">app.uff.br/pasuff</span>). Pagamento obrigatório até <strong class="text-white">22/01/2027 (16h)</strong>.'
            },
            {
                until: '2027-01-26T17:00:00-03:00',
                target: '2027-01-26T17:00:00-03:00',
                eyebrow: 'Próxima etapa · Edital Unificado CMM Nº 01/2026',
                title: 'Homologação das Inscrições',
                desc: 'Homologação e locais de prova divulgados em <strong class="text-white">26/01/2027</strong> em <span class="font-mono text-slate-200">www.editais.uff.br</span>.'
            },
            {
                until: '2027-01-31T09:00:00-03:00',
                target: '2027-01-31T09:00:00-03:00',
                eyebrow: 'Próxima etapa · 1ª Etapa',
                title: 'Prova Escrita Presencial',
                desc: 'Dia <strong class="text-white">31/01/2027</strong> na FacMed UFF (Rua Ataíde Parreiras, 100 — Niterói). Portões às 9h; prova das 10h às 13h.'
            },
            {
                until: '2027-02-04T17:00:00-03:00',
                target: '2027-02-04T17:00:00-03:00',
                eyebrow: 'Próxima etapa · 1ª Etapa',
                title: 'Resultado da Prova Escrita',
                desc: 'Divulgação em <strong class="text-white">04/02/2027</strong> em <span class="font-mono text-slate-200">www.editais.uff.br</span>. Recursos em 04 e 05/02/2027.'
            },
            {
                until: '2027-02-05T23:59:59-03:00',
                target: '2027-02-05T23:59:59-03:00',
                eyebrow: 'Etapa em andamento · Encerra em',
                title: 'Recurso da Prova Escrita',
                desc: 'Prazo para recursos da 1ª etapa aberto até <strong class="text-white">05/02/2027</strong>.'
            },
            {
                until: '2027-02-12T10:00:00-03:00',
                target: '2027-02-12T10:00:00-03:00',
                eyebrow: 'Próxima etapa · 1ª Etapa',
                title: 'Convocação para a 2ª Etapa',
                desc: 'Resultado dos recursos da prova escrita e convocação para análise curricular em <strong class="text-white">12/02/2027</strong>.'
            },
            {
                until: '2027-02-15T09:00:00-03:00',
                target: '2027-02-15T09:00:00-03:00',
                eyebrow: 'Próxima etapa · 2ª Etapa',
                title: 'Entrega de Comprovantes (SGPG)',
                desc: 'De <strong class="text-white">15/02</strong> a <strong class="text-white">17/02/2027 (9h às 15h)</strong> na FacMed UFF, para candidatos habilitados.'
            },
            {
                until: '2027-02-17T15:00:00-03:00',
                target: '2027-02-17T15:00:00-03:00',
                eyebrow: 'Etapa em andamento · Encerra em',
                title: '2ª Etapa: Análise Curricular (SGPG)',
                desc: 'Entrega presencial de comprovantes na SGPG aberta até <strong class="text-white">17/02/2027 (15h)</strong>.'
            },
            {
                until: '2027-02-25T17:00:00-03:00',
                target: '2027-02-25T17:00:00-03:00',
                eyebrow: 'Próxima etapa · 2ª Etapa',
                title: 'Resultado da Análise Curricular',
                desc: 'Divulgação em <strong class="text-white">25/02/2027</strong> em <span class="font-mono text-slate-200">www.editais.uff.br</span>. Recursos em 25 e 26/02/2027.'
            },
            {
                until: '2027-02-26T23:59:59-03:00',
                target: '2027-02-26T23:59:59-03:00',
                eyebrow: 'Etapa em andamento · Encerra em',
                title: 'Recurso da Análise Curricular',
                desc: 'Prazo para recursos da 2ª etapa aberto até <strong class="text-white">26/02/2027</strong>.'
            },
            {
                until: '2027-03-01T13:00:00-03:00',
                target: '2027-03-01T13:00:00-03:00',
                eyebrow: 'Próxima etapa · Resultado Final',
                title: 'Divulgação do Resultado Final',
                desc: 'Resultado dos recursos e classificação final em <strong class="text-white">01/03/2027</strong>.'
            },
            {
                until: '2027-03-04T23:59:59-03:00',
                target: '2027-03-04T23:59:59-03:00',
                eyebrow: 'Etapa em andamento · Encerra em',
                title: 'Matrícula dos Classificados',
                desc: 'Pré-matrícula eletrônica aberta de <strong class="text-white">01/03</strong> a <strong class="text-white">04/03/2027</strong>.'
            },
            {
                until: '2027-03-05T17:00:00-03:00',
                target: '2027-03-05T09:00:00-03:00',
                eyebrow: 'Etapa final · Edital Unificado CMM Nº 01/2026',
                title: 'Curso de Integração Acadêmica',
                desc: 'Integração obrigatória em <strong class="text-white">05/03/2027</strong> na Faculdade de Medicina da UFF.'
            }
        ];

        const hudEyebrowEl = document.getElementById('hud-eyebrow');
        const hudTitleEl = document.getElementById('hud-title');
        const hudDescEl = document.getElementById('hud-desc');
        const daysEl = document.getElementById('hud-days');
        const hoursEl = document.getElementById('hud-hours');
        const minutesEl = document.getElementById('hud-minutes');
        const secondsEl = document.getElementById('hud-seconds');
        let lastStageKey = null;

        function syncTimelineStepStates(nowMs) {
            document.querySelectorAll('.timeline-step[data-step-start][data-step-end]').forEach((step) => {
                const startMs = Date.parse(step.getAttribute('data-step-start'));
                const endMs = Date.parse(step.getAttribute('data-step-end'));
                if (Number.isNaN(startMs) || Number.isNaN(endMs)) return;
                step.classList.toggle('is-current', nowMs >= startMs && nowMs <= endMs);
                step.classList.toggle('is-past', nowMs > endMs);
            });
        }

        function updateCountdown() {
            if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
            const nowMs = Date.now();
            const stage = COUNTDOWN_STAGES.find((s) => nowMs <= Date.parse(s.until));
            const stageKey = stage ? stage.until : 'done';

            if (stageKey !== lastStageKey) {
                lastStageKey = stageKey;
                if (stage) {
                    if (hudEyebrowEl) hudEyebrowEl.textContent = stage.eyebrow;
                    if (hudTitleEl) hudTitleEl.textContent = stage.title;
                    if (hudDescEl) hudDescEl.innerHTML = stage.desc;
                } else {
                    if (hudEyebrowEl) hudEyebrowEl.textContent = 'Edital Unificado CMM Nº 01/2026 · Turmas 2027';
                    if (hudTitleEl) hudTitleEl.textContent = 'Processo Seletivo Concluído';
                    if (hudDescEl) hudDescEl.innerHTML = 'Todas as etapas previstas no cronograma foram encerradas. Acompanhe convocações em <span class="font-mono text-slate-200">www.editais.uff.br</span>.';
                }
                syncTimelineStepStates(nowMs);
            }

            const diff = stage ? Math.max(0, Date.parse(stage.target) - nowMs) : 0;
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
        } else {
            syncTimelineStepStates(Date.now());
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

            // 9. ANIMATED STAT COUNTERS ON SCROLL (104+ VAGAS & 14 CURSOS)
            // -------------------------------------------------------------
            const vagasSection = document.getElementById('vagas');
            if (vagasSection) {
                const counters = [
                    { id: 'counter-vagas', target: 104, duration: 2.2 },
                    { id: 'counter-especialidades', target: 14, duration: 1.6 },
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
                    details: 'Edital Unificado CMM 01/2026: envio do formulário assinado via GOV.BR e PDFs (até 5 MB cada) para concursos.cmm@id.uff.br entre 07/12 e 11/12/2026. Resultado em 16/12/2026 (17h).',
                    startUtc: '20261207T120000Z',
                    endUtc: '20261207T210000Z',
                    startIso: '2026-12-07T09:00:00-03:00',
                    endIso: '2026-12-07T18:00:00-03:00',
                    ics: 'assets/cal/uff-2027-isencao.ics'
                },
                inscricoes: {
                    title: 'UFF Medicina 2027 — Abertura das Inscrições (PASSUFF)',
                    location: 'PASSUFF (https://app.uff.br/pasuff)',
                    details: 'Edital Unificado CMM 01/2026: inscrições de 01/01/2027 (11h) a 22/01/2027 (16h) exclusivamente no PASSUFF, com taxa de R$ 400,00 paga no CPF do candidato. Homologação e salas em 26/01/2027 (17h).',
                    startUtc: '20270101T140000Z',
                    endUtc: '20270101T150000Z',
                    startIso: '2027-01-01T11:00:00-03:00',
                    endIso: '2027-01-01T12:00:00-03:00',
                    ics: 'assets/cal/uff-2027-inscricoes.ics'
                },
                fase1: {
                    title: 'UFF Medicina 2027 — 1ª Etapa: Prova Escrita Presencial',
                    location: 'Faculdade de Medicina da UFF - Rua Ataíde Parreiras, 100, Niterói/RJ',
                    details: 'Edital Unificado CMM 01/2026: Prova escrita em 31/01/2027 (fechamento dos portões às 9h; prova das 10h às 13h, ou 10h às 11h para Radiologia/Tórax). Resultado em 04/02, recursos até 05/02 e convocação em 12/02/2027.',
                    startUtc: '20270131T120000Z',
                    endUtc: '20270131T160000Z',
                    startIso: '2027-01-31T09:00:00-03:00',
                    endIso: '2027-01-31T13:00:00-03:00',
                    ics: 'assets/cal/uff-2027-fase1.ics'
                },
                fase2: {
                    title: 'UFF Medicina 2027 — 2ª Etapa: Entrega de Currículo (SGPG)',
                    location: 'Faculdade de Medicina da UFF (SGPG - 6º andar), Rua Ataíde Parreiras, 100, Niterói/RJ',
                    details: 'Edital Unificado CMM 01/2026: entrega presencial de Currículo Lattes e comprovantes em envelope pardo lacrado de 15/02 a 17/02/2027 (9h às 15h), exceto cursos em etapa única. Resultado em 25/02 e recursos até 26/02/2027.',
                    startUtc: '20270215T120000Z',
                    endUtc: '20270215T180000Z',
                    startIso: '2027-02-15T09:00:00-03:00',
                    endIso: '2027-02-15T15:00:00-03:00',
                    ics: 'assets/cal/uff-2027-fase2.ics'
                },
                integracao: {
                    title: 'UFF Medicina 2027 — Curso de Integração Obrigatório',
                    location: 'Faculdade de Medicina da UFF, Niterói/RJ',
                    details: 'Edital Unificado CMM 01/2026: Resultado final em 01/03 (13h), pré-matrícula no CANDIDATURAPOS de 01/03 a 04/03 (RG ou CIN; CNH não aceita), Curso de Integração obrigatório em 05/03/2027 e início das aulas a partir de 05/03/2027.',
                    startUtc: '20270305T120000Z',
                    endUtc: '20270305T150000Z',
                    startIso: '2027-03-05T09:00:00-03:00',
                    endIso: '2027-03-05T12:00:00-03:00',
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
