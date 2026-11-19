# Backend da Lista de Espera — Cloudflare Workers + D1 + Turnstile + Access

Backend serverless (custo zero no plano gratuito Cloudflare, sem pausa automática) para coletar interessados no **Concurso Unificado de Pós-Graduação Lato Sensu 2027 (FacMed UFF)** enquanto se aguarda a publicação oficial do edital.

## Camadas de Segurança Implementadas

- **Honeypot invisível** (`website`) + **tempo mínimo de preenchimento** (`< 2s`): descarta bots silenciosamente com resposta neutra (`200 OK`).
- **Rate limit por hash de IP** (`SHA-256(IP + salt secreto)` — o IP puro **nunca** é salvo no banco):
  - Padrão calibrado para redes compartilhadas (ex.: NAT do HUAP / FacMed UFF): **5 envios / 15 min** e **15 envios / 24h** por IP, retornando HTTP `429` com `Retry-After`.
- **Cloudflare Turnstile**: validação server-side obrigatória do token antes de gravar no banco.
- **Anti-enumeração de e-mails**: se o e-mail já estiver cadastrado, atualiza a especialidade escolhida (sem duplicar) e retorna a mesma resposta neutra.
- **CORS restrito** (`ALLOWED_ORIGINS`) + limite de payload (`4 KB`) + validação estrita dos 14 cursos + cabeçalhos de segurança (`nosniff`, `DENY`, `no-store`, `CSP`).
- **Painel `/admin` protegido por Cloudflare Access**: aceita apenas operadores autenticados (com suporte a verificação RS256 do JWT + filtro por domínio `@id.uff.br`) e exporta CSV UTF-8 com proteção contra *CSV Formula Injection*.

---

## Passo a Passo de Implantação (Cloudflare)

### 1. Instalar dependências e autenticar no Wrangler
```bash
cd waitlist-worker
npm install
npx wrangler login
```

### 2. Criar o banco D1 e aplicar o schema
```bash
npx wrangler d1 create uff-waitlist-2027
```
Copie o `database_id` retornado pelo comando acima e cole em `waitlist-worker/wrangler.toml`. Em seguida, crie as tabelas:
```bash
npm run db:init:remote
```

### 3. Criar o widget Cloudflare Turnstile
1. No painel da Cloudflare, acesse **Turnstile → Add widget**.
2. Adicione os domínios permitidos (ex.: `leomaiap.github.io` e, se quiser testar localmente, `localhost`).
3. Escolha o modo **Managed** (recomendado — quase sempre invisível ao usuário).
4. Copie a **Site Key** (pública, vai no front-end) e a **Secret Key** (privada, vai apenas no Worker).

### 4. Configurar os Secrets no Worker
```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
# Cole a Secret Key do Turnstile

npx wrangler secret put IP_HASH_SALT
# Cole uma string aleatória longa (ex.: gerada com `openssl rand -hex 32`)
```

### 5. Publicar o Worker
```bash
npm run deploy
```
Anote a URL publicada (ex.: `https://uff-medicina-2027-waitlist.<seu-subdominio>.workers.dev`).

### 6. Proteger `/admin` com Cloudflare Access (Zero Trust)
1. No painel da Cloudflare, acesse **Zero Trust → Access → Applications → Add an application → Self-hosted**.
2. Em **Application domain**, informe o domínio do Worker (ou subdomínio próprio) e o path **`/admin*`**.
3. Crie uma política **Allow** com regra **Emails** ou **Emails ending in** `@id.uff.br` (ou os e-mails específicos da equipe da FacMed / SGPG).
4. *(Recomendado para validação criptográfica extra)* Copie o **Application Audience (AUD) Tag** e o **Team Domain** (`<sua-equipe>.cloudflareaccess.com`) e adicione-os em `[vars]` no `wrangler.toml`, rodando `npm run deploy` novamente.

### 7. Conectar o Front-end (GitHub Pages — sem precisar rodar build!)
Abra **`js/site-config.js`** (pode editar até direto pelo navegador no GitHub) e preencha `waitlist`:
```js
window.UFF_SITE_CONFIG = {
    editalPublicado: false,
    editalUrl: 'https://www.editais.uff.br',
    waitlist: {
        apiUrl: 'https://uff-medicina-2027-waitlist.<seu-subdominio>.workers.dev/api/waitlist',
        turnstileSiteKey: '0x4AAAAAAA...',
        lgpdVersion: 'v1-2026-11'
    }
};
```
Salve/commite na `main` — o GitHub Pages publica em ~1 minuto.

---

## Como Visualizar e Disparar E-mails Quando o Edital Sair

1. Acesse `https://<url-do-worker>/admin` e faça login via código enviado ao seu e-mail autorizado no Cloudflare Access.
2. Veja o total de interessados, o ranking de demanda por especialidade e filtre/busque registros.
3. Clique em **Exportar CSV** (lista completa ou filtrada por uma especialidade específica).
4. Importe o CSV em uma ferramenta de disparo com SPF/DKIM/DMARC configurados (ex.: **Brevo**, **Resend** ou mala direta institucional da STI/UFF), incluindo link de descadastro (LGPD). Evite envio em massa via CCO de webmail comum.

---

## Como Voltar o Cronograma Quando o Edital Oficial Sair (1 linha!)

Abra **`js/site-config.js`** e troque apenas uma palavra:
```js
editalPublicado: true,
editalUrl: 'https://www.editais.uff.br/...', // opcional: link direto do PDF oficial
```
Ao commitar essa alteração:
- A seção **Lista de Espera** (`#lista-espera`) é ocultada automaticamente;
- A seção **Cronograma 2027** (`#cronograma`) + Countdown + botões de calendário `.ics` reaparecem automaticamente;
- Hero, menu, modais das 14 especialidades, CTA final e rodapé passam automaticamente para o modo **Edital Publicado**.
- O Worker e o banco D1 permanecem disponíveis em `/admin` para consulta/exportação final até a exclusão programada dos leads após o encerramento do processo seletivo (boas práticas LGPD).
