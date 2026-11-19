        // -------------------------------------------------------------
        // 11. LISTA DE ESPERA (AGUARDANDO EDITAL) + TURNSTILE + HONEYPOT
        // -------------------------------------------------------------
        /**
         * Configuração do endpoint Cloudflare Worker + Turnstile.
         * Siga o passo a passo em waitlist-worker/README.md e preencha os valores abaixo
         * antes de publicar em produção (depois reconstrua js/bundle.min.js).
         */
        const WAITLIST_CONFIG = window.UFF_WAITLIST_CONFIG || {
            apiUrl: '',
            turnstileSiteKey: '',
            lgpdVersion: 'v1-2026-11'
        };

        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('waitlist-form');
            if (!form) return;

            const nameInput = document.getElementById('waitlist-name');
            const emailInput = document.getElementById('waitlist-email');
            const specialtySelect = document.getElementById('waitlist-specialty');
            const lgpdInput = document.getElementById('waitlist-lgpd');
            const honeypotInput = document.getElementById('waitlist-website');
            const submitBtn = document.getElementById('waitlist-submit');
            const feedbackEl = document.getElementById('waitlist-feedback');
            const turnstileContainer = document.getElementById('waitlist-turnstile');

            const formLoadedAt = Date.now();
            let turnstileWidgetId = null;
            let turnstileToken = '';
            let isSubmitting = false;

            // Popula o <select> com os 14 cursos oficiais da Minuta + opção "Ainda estou decidindo"
            if (specialtySelect && Array.isArray(specialties)) {
                const fragment = document.createDocumentFragment();
                specialties.forEach((spec) => {
                    const opt = document.createElement('option');
                    opt.value = spec.id;
                    opt.textContent = spec.title;
                    fragment.appendChild(opt);
                });
                const undecidedOpt = document.createElement('option');
                undecidedOpt.value = 'indeciso';
                undecidedOpt.textContent = 'Ainda estou decidindo';
                fragment.appendChild(undecidedOpt);
                specialtySelect.appendChild(fragment);
            }

            function setFeedback(type, message) {
                if (!feedbackEl) return;
                feedbackEl.className = 'waitlist-feedback waitlist-feedback--' + type;
                feedbackEl.textContent = message;
                feedbackEl.hidden = false;
            }

            function clearFeedback() {
                if (!feedbackEl) return;
                feedbackEl.hidden = true;
                feedbackEl.textContent = '';
                feedbackEl.className = 'waitlist-feedback';
            }

            function setLoading(loading) {
                isSubmitting = loading;
                if (!submitBtn) return;
                submitBtn.disabled = loading;
                submitBtn.classList.toggle('is-loading', loading);
                const label = submitBtn.querySelector('.waitlist-submit-label');
                if (label) {
                    label.textContent = loading ? 'Enviando cadastro...' : 'Avise-me quando o Edital sair';
                }
            }

            // Carrega Cloudflare Turnstile explicitamente quando a Site Key estiver configurada
            function initTurnstile() {
                if (!turnstileContainer || !WAITLIST_CONFIG.turnstileSiteKey) return;

                const renderWidget = () => {
                    if (!window.turnstile || turnstileWidgetId !== null) return;
                    turnstileContainer.hidden = false;
                    turnstileWidgetId = window.turnstile.render(turnstileContainer, {
                        sitekey: WAITLIST_CONFIG.turnstileSiteKey,
                        theme: 'dark',
                        language: 'pt-BR',
                        callback: (token) => {
                            turnstileToken = token || '';
                        },
                        'expired-callback': () => {
                            turnstileToken = '';
                        },
                        'error-callback': () => {
                            turnstileToken = '';
                        }
                    });
                };

                if (window.turnstile) {
                    renderWidget();
                    return;
                }

                window.__uffOnTurnstileLoad = renderWidget;
                const script = document.createElement('script');
                script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__uffOnTurnstileLoad';
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }

            initTurnstile();

            function resetTurnstile() {
                turnstileToken = '';
                if (window.turnstile && turnstileWidgetId !== null) {
                    try {
                        window.turnstile.reset(turnstileWidgetId);
                    } catch (_) {}
                }
            }

            // Permite pré-selecionar a especialidade a partir do modal de qualquer curso
            window.selectWaitlistSpecialty = (specialtyId) => {
                if (specialtySelect && specialtyId) {
                    const hasOption = Array.from(specialtySelect.options).some((o) => o.value === specialtyId);
                    if (hasOption) {
                        specialtySelect.value = specialtyId;
                    }
                }
                const target = document.getElementById('lista-espera');
                if (target) {
                    if (window.__lenis) {
                        window.__lenis.scrollTo(target, { duration: 1.0, offset: -24 });
                    } else {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
                if (nameInput) {
                    setTimeout(() => nameInput.focus({ preventScroll: true }), 650);
                }
            };

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                if (isSubmitting) return;
                clearFeedback();

                const fullName = (nameInput?.value || '').replace(/\s+/g, ' ').trim();
                const email = (emailInput?.value || '').trim().toLowerCase();
                const specialtyId = specialtySelect?.value || '';
                const lgpdConsent = Boolean(lgpdInput?.checked);
                const honeypotValue = honeypotInput?.value || '';

                if (fullName.length < 3 || fullName.length > 120) {
                    setFeedback('error', 'Informe seu nome completo (mínimo de 3 caracteres).');
                    nameInput?.focus();
                    return;
                }

                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setFeedback('error', 'Informe um endereço de e-mail válido.');
                    emailInput?.focus();
                    return;
                }

                if (!specialtyId) {
                    setFeedback('error', 'Selecione a especialidade de seu interesse.');
                    specialtySelect?.focus();
                    return;
                }

                if (!lgpdConsent) {
                    setFeedback('error', 'Marque a autorização LGPD para receber o aviso de publicação do edital.');
                    lgpdInput?.focus();
                    return;
                }

                // Se o backend Cloudflare ainda não foi conectado, informa com transparência
                if (!WAITLIST_CONFIG.apiUrl) {
                    setFeedback(
                        'info',
                        'O formulário está pronto e aguardando a ativação do servidor de lista de espera (Cloudflare Worker). Enquanto isso, acompanhe o Portal de Editais da UFF.'
                    );
                    return;
                }

                if (WAITLIST_CONFIG.turnstileSiteKey && !turnstileToken) {
                    setFeedback('error', 'Conclua a verificação anti-robô antes de enviar.');
                    return;
                }

                setLoading(true);
                try {
                    const response = await fetch(WAITLIST_CONFIG.apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fullName,
                            email,
                            specialtyId,
                            lgpdConsent,
                            website: honeypotValue,
                            elapsedMs: Date.now() - formLoadedAt,
                            turnstileToken,
                            sourcePage: window.location.pathname || 'index'
                        })
                    });

                    let data = null;
                    try {
                        data = await response.json();
                    } catch (_) {}

                    if (response.status === 429) {
                        setFeedback(
                            'error',
                            data?.message || 'Muitas tentativas a partir desta rede. Aguarde alguns minutos e tente novamente.'
                        );
                        resetTurnstile();
                        return;
                    }

                    if (!response.ok || !data?.ok) {
                        setFeedback(
                            'error',
                            data?.message || 'Não foi possível concluir o cadastro agora. Verifique os dados e tente novamente.'
                        );
                        resetTurnstile();
                        return;
                    }

                    setFeedback(
                        'success',
                        data.message || 'Cadastro registrado na lista de espera! Avisaremos por e-mail assim que o Edital Oficial 2027 for publicado.'
                    );
                    form.reset();
                    resetTurnstile();
                } catch (_) {
                    setFeedback('error', 'Falha de conexão ao enviar seu cadastro. Verifique sua internet e tente novamente.');
                    resetTurnstile();
                } finally {
                    setLoading(false);
                }
            });
        });
