/**
 * ============================================================================
 * CONFIGURAÇÃO PRINCIPAL DO SITE — CONCURSO UNIFICADO FACMED UFF 2027
 * ============================================================================
 * Arquivo editável diretamente (mesmo pelo navegador no GitHub), sem precisar
 * reconstruir bundles.
 *
 * COMO ALTERNAR ENTRE OS MODOS:
 *   - editalPublicado: false -> Modo "Aguardando Edital"
 *       • Exibe a seção Lista de Espera (#lista-espera) em destaque
 *       • Oculta o Cronograma provisório (#cronograma)
 *       • Direciona os botões do Hero, Modal e CTA final para a Lista de Espera
 *
 *   - editalPublicado: true  -> Modo "Edital Publicado"
 *       • Oculta a Lista de Espera (#lista-espera)
 *       • Reativa automaticamente o Cronograma completo (#cronograma) + Countdown
 *       • Direciona os botões para os 14 cursos, Cronograma e Edital Oficial
 */
window.UFF_SITE_CONFIG = {
    // Mude de `false` para `true` assim que o Edital Oficial for publicado:
    editalPublicado: false,

    // Link oficial do Edital (ou do PDF publicado) — usado nos botões do modo publicado:
    editalUrl: 'https://www.editais.uff.br',

    // Conexão com o backend Cloudflare Workers + D1 + Turnstile (ver waitlist-worker/README.md):
    waitlist: {
        // Ex.: 'https://uff-medicina-2027-waitlist.SEU-SUBDOMINIO.workers.dev/api/waitlist'
        apiUrl: '',
        // Ex.: '0x4AAAAAAA...' (Site Key pública do Cloudflare Turnstile)
        turnstileSiteKey: '',
        lgpdVersion: 'v1-2026-11'
    }
};

// Aplica o modo antes da primeira pintura (evita qualquer flash visual entre modos)
document.documentElement.dataset.siteMode = window.UFF_SITE_CONFIG.editalPublicado
    ? 'published'
    : 'waiting';
