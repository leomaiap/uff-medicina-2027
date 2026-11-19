        // -------------------------------------------------------------
        // 11. MODO AGUARDANDO EDITAL (GOOGLE FORMS EMBED) & INTERRUPTOR
        // -------------------------------------------------------------
        /**
         * Lê window.UFF_SITE_CONFIG de js/site-config.js:
         *  - editalPublicado: false -> exibe #lista-espera (Google Forms) e oculta #cronograma
         *  - editalPublicado: true  -> oculta #lista-espera e reativa #cronograma + Countdown
         */
        const SITE_CONFIG = window.UFF_SITE_CONFIG || {};

        function toGoogleFormsEmbedUrl(rawUrl) {
            if (!rawUrl || typeof rawUrl !== 'string') return '';
            const trimmed = rawUrl.trim();
            if (!trimmed) return '';
            try {
                const parsed = new URL(trimmed);
                if (!parsed.searchParams.has('embedded')) {
                    parsed.searchParams.set('embedded', 'true');
                }
                return parsed.toString();
            } catch (_) {
                return trimmed;
            }
        }

        function toGoogleFormsDirectUrl(rawUrl) {
            if (!rawUrl || typeof rawUrl !== 'string') return '';
            const trimmed = rawUrl.trim();
            if (!trimmed) return '';
            try {
                const parsed = new URL(trimmed);
                parsed.searchParams.delete('embedded');
                return parsed.toString();
            } catch (_) {
                return trimmed;
            }
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

            // Permite rolar direto para a Lista de Espera a partir do modal de qualquer curso
            window.selectWaitlistSpecialty = () => {
                const target = document.getElementById('lista-espera');
                if (!target) return;
                if (window.__lenis) {
                    window.__lenis.scrollTo(target, { duration: 1.0, offset: -24 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };

            if (isPublished) return;

            const embedContainer = document.getElementById('waitlist-embed-container');
            const placeholderEl = document.getElementById('waitlist-embed-placeholder');
            const externalLinkEl = document.getElementById('waitlist-external-link');
            const embedUrl = toGoogleFormsEmbedUrl(SITE_CONFIG.googleFormsUrl);
            const directUrl = toGoogleFormsDirectUrl(SITE_CONFIG.googleFormsUrl);

            if (!embedContainer || !embedUrl) return;

            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.title = 'Formulário de Lista de Espera — Concurso Unificado FacMed UFF 2027';
            iframe.className = 'waitlist-iframe';
            iframe.loading = 'lazy';
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('marginheight', '0');
            iframe.setAttribute('marginwidth', '0');

            if (placeholderEl) placeholderEl.remove();
            embedContainer.appendChild(iframe);
            embedContainer.classList.add('has-iframe');

            if (externalLinkEl && directUrl) {
                externalLinkEl.href = directUrl;
                externalLinkEl.hidden = false;
            }
        });
