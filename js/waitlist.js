        // -------------------------------------------------------------
        // 11. MODO AGUARDANDO EDITAL (TALLY EMBED) & INTERRUPTOR
        // -------------------------------------------------------------
        /**
         * Lê window.UFF_SITE_CONFIG de js/site-config.js:
         *  - editalPublicado: false -> exibe #lista-espera (Tally transparente) e oculta #cronograma
         *  - editalPublicado: true  -> oculta #lista-espera e reativa #cronograma + Countdown
         */
        const SITE_CONFIG = window.UFF_SITE_CONFIG || {};

        function toTallyEmbedUrl(rawUrl, specialtyTitle) {
            if (!rawUrl || typeof rawUrl !== 'string') return '';
            const trimmed = rawUrl.trim();
            if (!trimmed) return '';
            try {
                const parsed = new URL(trimmed);
                // Aceita tanto link de compartilhamento (/r/ID) quanto link direto (/embed/ID)
                if (parsed.hostname.includes('tally.so') && parsed.pathname.startsWith('/r/')) {
                    parsed.pathname = parsed.pathname.replace(/^\/r\//, '/embed/');
                }
                if (parsed.hostname.includes('tally.so')) {
                    if (!parsed.searchParams.has('alignLeft')) parsed.searchParams.set('alignLeft', '1');
                    if (!parsed.searchParams.has('hideTitle')) parsed.searchParams.set('hideTitle', '1');
                    if (!parsed.searchParams.has('transparentBackground')) parsed.searchParams.set('transparentBackground', '1');
                    if (!parsed.searchParams.has('dynamicHeight')) parsed.searchParams.set('dynamicHeight', '1');
                }
                if (specialtyTitle) {
                    parsed.searchParams.set('especialidade', specialtyTitle);
                }
                return parsed.toString();
            } catch (_) {
                return trimmed;
            }
        }

        function toTallyDirectUrl(rawUrl) {
            if (!rawUrl || typeof rawUrl !== 'string') return '';
            const trimmed = rawUrl.trim();
            if (!trimmed) return '';
            try {
                const parsed = new URL(trimmed);
                if (parsed.hostname.includes('tally.so') && parsed.pathname.startsWith('/embed/')) {
                    parsed.pathname = parsed.pathname.replace(/^\/embed\//, '/r/');
                }
                ['alignLeft', 'hideTitle', 'transparentBackground', 'dynamicHeight'].forEach((p) => {
                    parsed.searchParams.delete(p);
                });
                return parsed.toString();
            } catch (_) {
                return trimmed;
            }
        }

        function loadTallyEmbedScript(onFail) {
            if (window.Tally && typeof window.Tally.loadEmbeds === 'function') {
                window.Tally.loadEmbeds();
                return;
            }
            if (document.querySelector('script[data-tally-embed-js]')) return;
            const s = document.createElement('script');
            s.src = 'https://tally.so/widgets/embed.js';
            s.async = true;
            s.dataset.tallyEmbedJs = '1';
            s.onload = () => {
                if (window.Tally && typeof window.Tally.loadEmbeds === 'function') {
                    window.Tally.loadEmbeds();
                } else if (typeof onFail === 'function') {
                    onFail();
                }
            };
            s.onerror = () => {
                if (typeof onFail === 'function') onFail();
            };
            document.body.appendChild(s);
        }

        document.addEventListener('DOMContentLoaded', () => {
            const isPublished = Boolean(SITE_CONFIG.editalPublicado);
            document.documentElement.dataset.siteMode = isPublished ? 'published' : 'waiting';

            // Sincroniza links oficiais do Edital
            if (SITE_CONFIG.editalUrl) {
                document.querySelectorAll('a[data-edital-link]').forEach((a) => {
                    a.setAttribute('href', SITE_CONFIG.editalUrl);
                });
            }

            const embedContainer = document.getElementById('waitlist-embed-container');
            const placeholderEl = document.getElementById('waitlist-embed-placeholder');
            const successBoxEl = document.getElementById('waitlist-success-box');
            const resetBtnEl = document.getElementById('waitlist-reset-btn');
            const rawFormUrl = SITE_CONFIG.tallyUrl || SITE_CONFIG.googleFormsUrl || '';
            let activeIframe = null;
            let fallbackTimer = null;

            function showWaitlistConfirmation() {
                if (activeIframe) {
                    activeIframe.hidden = true;
                }
                if (embedContainer) {
                    embedContainer.classList.remove('has-iframe');
                    embedContainer.classList.add('is-submitted');
                }
                if (successBoxEl) {
                    successBoxEl.hidden = false;
                }
            }

            function resetWaitlistForm(specialtyTitle) {
                if (successBoxEl) {
                    successBoxEl.hidden = true;
                }
                if (embedContainer) {
                    embedContainer.classList.remove('is-submitted');
                }
                if (activeIframe) {
                    activeIframe.remove();
                    activeIframe = null;
                }
                mountTallyIframe(specialtyTitle || '');
            }

            function mountTallyIframe(specialtyTitle) {
                const embedUrl = toTallyEmbedUrl(rawFormUrl, specialtyTitle);
                if (!embedContainer || !embedUrl) return;

                if (successBoxEl) successBoxEl.hidden = true;
                embedContainer.classList.remove('is-submitted');

                if (!activeIframe) {
                    activeIframe = document.createElement('iframe');
                    activeIframe.title = 'Formulário de Lista de Espera — Concurso Unificado FacMed UFF 2027';
                    activeIframe.className = 'waitlist-iframe';
                    activeIframe.width = '100%';
                    activeIframe.height = '260';
                    activeIframe.loading = 'eager';
                    activeIframe.setAttribute('frameborder', '0');
                    activeIframe.setAttribute('marginheight', '0');
                    activeIframe.setAttribute('marginwidth', '0');
                    activeIframe.setAttribute('allowtransparency', 'true');
                    if (placeholderEl) placeholderEl.remove();
                    embedContainer.appendChild(activeIframe);
                    embedContainer.classList.add('has-iframe');
                } else {
                    activeIframe.hidden = false;
                    embedContainer.classList.add('has-iframe');
                }

                activeIframe.setAttribute('data-tally-src', embedUrl);

                const applyFallbackSrc = () => {
                    const targetSrc = activeIframe && activeIframe.getAttribute('data-tally-src');
                    if (activeIframe && targetSrc && activeIframe.getAttribute('src') !== targetSrc) {
                        activeIframe.src = targetSrc;
                    }
                };

                if (window.Tally && typeof window.Tally.loadEmbeds === 'function') {
                    activeIframe.removeAttribute('src');
                    window.Tally.loadEmbeds();
                } else {
                    loadTallyEmbedScript(applyFallbackSrc);
                    clearTimeout(fallbackTimer);
                    fallbackTimer = setTimeout(applyFallbackSrc, 1200);
                }
            }

            // Oculta o formulário e exibe confirmação ao receber Tally.FormSubmitted via postMessage
            window.addEventListener('message', (e) => {
                if (isPublished || !e.origin || !/^https:\/\/([a-z0-9-]+\.)?tally\.so$/i.test(e.origin)) {
                    return;
                }
                let payload = e.data;
                if (typeof payload === 'string') {
                    if (!payload.includes('Tally.FormSubmitted')) return;
                    try {
                        payload = JSON.parse(payload);
                    } catch (_) {
                        return;
                    }
                }
                if (payload && (payload.event === 'Tally.FormSubmitted' || payload.name === 'Tally.FormSubmitted')) {
                    showWaitlistConfirmation();
                }
            });

            if (resetBtnEl) {
                resetBtnEl.addEventListener('click', () => {
                    resetWaitlistForm('');
                });
            }

            // Permite rolar até a Lista de Espera a partir do modal e repassar ?especialidade=... ao Tally
            window.selectWaitlistSpecialty = (specialtyId) => {
                if (specialtyId && Array.isArray(specialties)) {
                    const spec = specialties.find((s) => s.id === specialtyId);
                    if (spec) {
                        if (successBoxEl && !successBoxEl.hidden) {
                            resetWaitlistForm(spec.title);
                        } else if (activeIframe) {
                            mountTallyIframe(spec.title);
                        }
                    }
                }
                const target = document.getElementById('lista-espera');
                if (!target) return;
                if (window.__lenis) {
                    window.__lenis.scrollTo(target, { duration: 1.0, offset: -24 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };

            if (isPublished || !rawFormUrl.trim()) return;
            mountTallyIframe('');
        });
