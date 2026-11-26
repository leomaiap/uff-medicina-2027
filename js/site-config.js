/**
 * ============================================================================
 * CONFIGURAÇÃO PRINCIPAL DO SITE — CONCURSO UNIFICADO FACMED UFF 2027
 * ============================================================================
 * Edite apenas este arquivo (inclusive direto pelo navegador no GitHub),
 * sem precisar rodar build.
 *
 * COMO VOLTAR O CRONOGRAMA QUANDO O EDITAL OFICIAL SAIR:
 *   - editalPublicado: false -> Modo "Aguardando Edital" (exibe Lista de Espera Tally e oculta #cronograma)
 *   - editalPublicado: true  -> Modo "Edital Publicado" (oculta Lista de Espera e reativa #cronograma + Countdown)
 */
window.UFF_SITE_CONFIG = {
    // Mude de `false` para `true` assim que o Edital Oficial for publicado:
    editalPublicado: true,

    // Link oficial do Edital (ou PDF publicado) usado nos botões do modo publicado:
    editalUrl: 'https://www.editais.uff.br',

    // Cole aqui o link do seu formulário Tally (ex.: 'https://tally.so/r/SEU_ID'):
    tallyUrl: 'https://tally.so/r/8NL40Y',

    // Cole aqui o App ID do OneSignal (Web Push gratuito para Chrome, Safari e iOS PWA):
    // Painel OneSignal -> Settings -> Keys & IDs -> OneSignal App ID
    oneSignalAppId: '',

    // Opcional (apenas Safari legado macOS <= 12; Safari 16+ usa VAPID automaticamente):
    oneSignalSafariWebId: ''
};

// Aplica o modo antes da primeira pintura (sem flash visual entre modos)
document.documentElement.dataset.siteMode = window.UFF_SITE_CONFIG.editalPublicado
    ? 'published'
    : 'waiting';
