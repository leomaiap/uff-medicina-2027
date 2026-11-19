/**
 * Cloudflare Worker — Lista de Espera Concurso Unificado FacMed UFF 2027
 *
 * Rotas públicas:
 *   GET  /api/health       -> verificação de saúde
 *   POST /api/waitlist     -> cadastro com Honeypot, Tempo mínimo, Rate Limit por IP (hash),
 *                             Cloudflare Turnstile, validação estrita e proteção anti-enumeração.
 *
 * Rotas administrativas (protegidas por Cloudflare Access):
 *   GET  /admin            -> painel visual de leads por especialidade
 *   GET  /admin/api/leads  -> listagem JSON filtrável + resumo por especialidade
 *   GET  /admin/api/export.csv -> exportação CSV UTF-8 (Excel/Brevo/Resend) com proteção anti-formula injection
 */

export const VALID_SPECIALTIES = Object.freeze({
    'analises-clinicas': 'Análises Clínicas',
    'anestesiologia': 'Anestesiologia',
    'cardiologia': 'Cardiologia',
    'dermatologia': 'Dermatologia',
    'gastroenterologia': 'Gastroenterologia',
    'gerontologia': 'Gerontologia e Geriatria Interdisciplinar',
    'hematologia': 'Hematologia Clínica',
    'neurologia': 'Neurologia',
    'otorrinolaringologia': 'Otorrinolaringologia',
    'pediatria': 'Pediatria',
    'pneumologia': 'Pneumologia',
    'psiquiatria': 'Psiquiatria',
    'radiologia': 'Radiologia',
    'radiologia-toracica': 'Radiologia Torácica',
    'indeciso': 'Ainda estou decidindo',
});

const NEUTRAL_SUCCESS_MESSAGE =
    'Cadastro registrado na lista de espera! Enviaremos um aviso por e-mail assim que o Edital Oficial 2027 for publicado.';

const MAX_BODY_BYTES = 4096;
const MIN_FILL_MS = 2000;
const EMAIL_REGEX = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

// Cache em memória das chaves públicas JWKS do Cloudflare Access (por instância do Worker)
let jwksCache = { keys: null, fetchedAt: 0 };

function baseSecurityHeaders(extra = {}) {
    return {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': 'no-store',
        ...extra,
    };
}

function getAllowedOrigins(env) {
    return String(env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function buildCorsHeaders(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = getAllowedOrigins(env);
    const isAllowed = origin && allowed.includes(origin);
    if (!isAllowed) return {};
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
    };
}

function jsonResponse(payload, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: baseSecurityHeaders({
            'Content-Type': 'application/json; charset=utf-8',
            ...extraHeaders,
        }),
    });
}

function sanitizeFullName(raw) {
    if (typeof raw !== 'string') return '';
    return raw
        .replace(/[\u0000-\u001F\u007F<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeEmail(raw) {
    if (typeof raw !== 'string') return '';
    if (/[\r\n]/.test(raw)) return '';
    return raw.trim().toLowerCase();
}

async function sha256Hex(input) {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function getClientIp(request) {
    return (
        request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
        '0.0.0.0'
    );
}

/**
 * Aplica rate limit atômico em duas janelas (15 min e 24h) sobre o hash do IP.
 */
async function checkAndIncrementRateLimit(env, ipHash) {
    const nowSec = Math.floor(Date.now() / 1000);
    const limit15m = Math.max(1, parseInt(env.RATE_LIMIT_15M || '5', 10) || 5);
    const limit24h = Math.max(1, parseInt(env.RATE_LIMIT_24H || '15', 10) || 15);

    const bucket15m = String(Math.floor(nowSec / 900));
    const bucket24h = String(Math.floor(nowSec / 86400));
    const expires15m = (Math.floor(nowSec / 900) + 1) * 900;
    const expires24h = (Math.floor(nowSec / 86400) + 1) * 86400;

    // Limpeza oportunista (~5% das requisições) para manter a tabela enxuta
    if (Math.random() < 0.05) {
        await env.DB.prepare('DELETE FROM rate_limit_hits WHERE expires_at < ?')
            .bind(nowSec)
            .run()
            .catch(() => {});
    }

    const upsertSql = `
        INSERT INTO rate_limit_hits (ip_hash, window_type, window_key, hit_count, expires_at)
        VALUES (?, ?, ?, 1, ?)
        ON CONFLICT(ip_hash, window_type, window_key)
        DO UPDATE SET hit_count = hit_count + 1
        RETURNING hit_count
    `;

    const row15m = await env.DB.prepare(upsertSql)
        .bind(ipHash, '15m', bucket15m, expires15m)
        .first();
    const count15m = Number(row15m?.hit_count || 1);

    if (count15m > limit15m) {
        return { allowed: false, retryAfter: Math.max(60, expires15m - nowSec) };
    }

    const row24h = await env.DB.prepare(upsertSql)
        .bind(ipHash, '24h', bucket24h, expires24h)
        .first();
    const count24h = Number(row24h?.hit_count || 1);

    if (count24h > limit24h) {
        return { allowed: false, retryAfter: Math.max(300, expires24h - nowSec) };
    }

    return { allowed: true, retryAfter: 0 };
}

/**
 * Validação obrigatória do token Cloudflare Turnstile no servidor.
 */
async function verifyTurnstile(token, clientIp, env) {
    const secret = env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        return { ok: false, reason: 'Turnstile não configurado no servidor.' };
    }
    if (!token || typeof token !== 'string' || token.length > 2048) {
        return { ok: false, reason: 'Confirme a verificação anti-robô antes de enviar.' };
    }

    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token);
    if (clientIp && clientIp !== '0.0.0.0') {
        body.set('remoteip', clientIp);
    }

    const verifyUrl = env.TURNSTILE_VERIFY_URL || 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const resp = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    if (!resp.ok) {
        return { ok: false, reason: 'Falha temporária na verificação anti-robô. Tente novamente.' };
    }
    const data = await resp.json();
    if (!data.success) {
        return { ok: false, reason: 'Verificação anti-robô expirada ou inválida. Atualize e tente novamente.' };
    }
    return { ok: true };
}

// ============================================================================
// VERIFICAÇÃO CLOUDFLARE ACCESS PARA ROTAS /admin
// ============================================================================
function base64UrlToUint8Array(str) {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

async function verifyCloudflareAccessJwt(jwt, teamDomain, expectedAud) {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(parts[0])));
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(parts[1])));
    const nowSec = Math.floor(Date.now() / 1000);

    if (typeof payload.exp !== 'number' || payload.exp < nowSec) return null;
    if (typeof payload.nbf === 'number' && payload.nbf > nowSec + 60) return null;

    const audList = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audList.includes(expectedAud)) return null;

    const normalizedDomain = teamDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (payload.iss !== `https://${normalizedDomain}`) return null;

    // Busca/revalida JWKS a cada 10 minutos
    if (!jwksCache.keys || Date.now() - jwksCache.fetchedAt > 600_000) {
        const res = await fetch(`https://${normalizedDomain}/cdn-cgi/access/certs`);
        if (!res.ok) return null;
        const data = await res.json();
        jwksCache = { keys: data.keys || [], fetchedAt: Date.now() };
    }

    const jwk = jwksCache.keys.find((k) => k.kid === header.kid);
    if (!jwk) return null;

    const cryptoKey = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const signingInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64UrlToUint8Array(parts[2]);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, signingInput);
    return valid ? payload : null;
}

async function authenticateAdmin(request, env) {
    // Bypass apenas explícito para desenvolvimento local (wrangler dev)
    if (env.DEV_ALLOW_ADMIN_BYPASS === 'true') {
        return { ok: true, email: 'dev-local@id.uff.br' };
    }

    const emailHeader = (request.headers.get('Cf-Access-Authenticated-User-Email') || '').trim().toLowerCase();
    const jwtHeader = request.headers.get('Cf-Access-Jwt-Assertion') || '';

    let verifiedEmail = emailHeader;

    // Se CF_ACCESS_TEAM_DOMAIN e CF_ACCESS_AUD estiverem configurados, valida assinatura RS256 do JWT
    if (env.CF_ACCESS_TEAM_DOMAIN && env.CF_ACCESS_AUD) {
        if (!jwtHeader) {
            return { ok: false, status: 401, reason: 'Acesso restrito via Cloudflare Access (JWT ausente).' };
        }
        const payload = await verifyCloudflareAccessJwt(
            jwtHeader,
            env.CF_ACCESS_TEAM_DOMAIN,
            env.CF_ACCESS_AUD
        );
        if (!payload || !payload.email) {
            return { ok: false, status: 403, reason: 'Token Cloudflare Access inválido ou expirado.' };
        }
        verifiedEmail = String(payload.email).trim().toLowerCase();
    } else if (!verifiedEmail) {
        return { ok: false, status: 401, reason: 'Acesso restrito. Proteja /admin com Cloudflare Access.' };
    }

    const allowedDomains = String(env.ADMIN_ALLOWED_DOMAINS || '')
        .split(',')
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);

    if (allowedDomains.length > 0) {
        const domain = verifiedEmail.split('@')[1] || '';
        if (!allowedDomains.includes(domain)) {
            return { ok: false, status: 403, reason: 'Domínio de e-mail não autorizado para este painel.' };
        }
    }

    return { ok: true, email: verifiedEmail };
}

// ============================================================================
// PROTEÇÃO CONTRA FORMULA INJECTION EM CSV (Excel / LibreOffice)
// ============================================================================
export function escapeCsvCell(value) {
    let str = String(value ?? '');
    if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
    }
    if (/[",\r\n;]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// ============================================================================
// HANDLER: POST /api/waitlist
// ============================================================================
async function handleWaitlistPost(request, env, corsHeaders) {
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
        return jsonResponse({ ok: false, message: 'Formato inválido. Use JSON.' }, 415, corsHeaders);
    }

    const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLength > MAX_BODY_BYTES) {
        return jsonResponse({ ok: false, message: 'Requisição excede o tamanho permitido.' }, 413, corsHeaders);
    }

    let rawText = '';
    try {
        rawText = await request.text();
    } catch {
        return jsonResponse({ ok: false, message: 'Não foi possível ler os dados enviados.' }, 400, corsHeaders);
    }

    if (rawText.length > MAX_BODY_BYTES) {
        return jsonResponse({ ok: false, message: 'Requisição excede o tamanho permitido.' }, 413, corsHeaders);
    }

    let body;
    try {
        body = JSON.parse(rawText);
    } catch {
        return jsonResponse({ ok: false, message: 'JSON malformado.' }, 400, corsHeaders);
    }

    // 1. HONEYPOT SILENCIOSO (se preenchido por bot, descarta sem avisar)
    if (
        (typeof body.website === 'string' && body.website.trim().length > 0) ||
        (typeof body.companyUrl === 'string' && body.companyUrl.trim().length > 0)
    ) {
        return jsonResponse({ ok: true, message: NEUTRAL_SUCCESS_MESSAGE }, 200, corsHeaders);
    }

    // 2. TEMPO MÍNIMO DE PREENCHIMENTO (< 2s sugere automação)
    const elapsedMs = Number(body.elapsedMs);
    if (Number.isFinite(elapsedMs) && elapsedMs >= 0 && elapsedMs < MIN_FILL_MS) {
        return jsonResponse({ ok: true, message: NEUTRAL_SUCCESS_MESSAGE }, 200, corsHeaders);
    }

    // 3. RATE LIMIT POR HASH DE IP (antes de chamar Turnstile/DB principal)
    const clientIp = getClientIp(request);
    const salt = env.IP_HASH_SALT || 'uff-default-change-me-in-secret';
    const ipHash = await sha256Hex(`${clientIp}:${salt}`);

    const rl = await checkAndIncrementRateLimit(env, ipHash);
    if (!rl.allowed) {
        return jsonResponse(
            {
                ok: false,
                message: 'Muitas tentativas a partir desta rede. Aguarde alguns minutos e tente novamente.',
            },
            429,
            {
                ...corsHeaders,
                'Retry-After': String(rl.retryAfter),
            }
        );
    }

    // 4. VALIDAÇÃO ESTRITA DOS CAMPOS
    const fullName = sanitizeFullName(body.fullName);
    const email = normalizeEmail(body.email);
    const specialtyId = typeof body.specialtyId === 'string' ? body.specialtyId.trim() : '';
    const lgpdConsent = body.lgpdConsent === true;

    if (fullName.length < 3 || fullName.length > 120) {
        return jsonResponse(
            { ok: false, message: 'Informe seu nome completo (entre 3 e 120 caracteres).' },
            400,
            corsHeaders
        );
    }

    if (!email || email.length > 160 || !EMAIL_REGEX.test(email)) {
        return jsonResponse({ ok: false, message: 'Informe um endereço de e-mail válido.' }, 400, corsHeaders);
    }

    if (!Object.prototype.hasOwnProperty.call(VALID_SPECIALTIES, specialtyId)) {
        return jsonResponse({ ok: false, message: 'Selecione uma especialidade válida.' }, 400, corsHeaders);
    }

    if (!lgpdConsent) {
        return jsonResponse(
            { ok: false, message: 'É necessário concordar com o uso do e-mail para aviso do edital (LGPD).' },
            400,
            corsHeaders
        );
    }

    // 5. CLOUDFLARE TURNSTILE (verificação server-side obrigatória)
    const turnstileResult = await verifyTurnstile(body.turnstileToken, clientIp, env);
    if (!turnstileResult.ok) {
        return jsonResponse({ ok: false, message: turnstileResult.reason }, 400, corsHeaders);
    }

    // 6. GRAVAÇÃO EM D1 COM ANTI-ENUMERAÇÃO (UPSERT POR E-MAIL NORMALIZADO)
    const nowIso = new Date().toISOString();
    const leadId = crypto.randomUUID();
    const specialtyLabel = VALID_SPECIALTIES[specialtyId];
    const consentVersion = String(env.LGPD_CONSENT_VERSION || 'v1-2026-11');
    const sourcePage = typeof body.sourcePage === 'string'
        ? body.sourcePage.slice(0, 60).replace(/[^a-zA-Z0-9/_-]/g, '')
        : 'index';

    await env.DB.prepare(
        `INSERT INTO waitlist_leads (
            id, full_name, email_normalized, specialty_id, specialty_label,
            lgpd_consent, lgpd_consent_version, lgpd_consent_at, source_page, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
         ON CONFLICT(email_normalized) DO UPDATE SET
            full_name = excluded.full_name,
            specialty_id = excluded.specialty_id,
            specialty_label = excluded.specialty_label,
            lgpd_consent_version = excluded.lgpd_consent_version,
            updated_at = excluded.updated_at`
    )
        .bind(
            leadId,
            fullName,
            email,
            specialtyId,
            specialtyLabel,
            consentVersion,
            nowIso,
            sourcePage || 'index',
            nowIso,
            nowIso
        )
        .run();

    // Resposta sempre idêntica (novo ou já cadastrado) para evitar enumeração de e-mails
    return jsonResponse({ ok: true, message: NEUTRAL_SUCCESS_MESSAGE }, 200, corsHeaders);
}

// ============================================================================
// HANDLERS ADMIN (/admin, /admin/api/leads, /admin/api/export.csv)
// ============================================================================
async function handleAdminLeadsApi(request, env, adminEmail) {
    const url = new URL(request.url);
    const specialty = (url.searchParams.get('specialty') || '').trim();
    const search = (url.searchParams.get('q') || '').trim().toLowerCase();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(200, Math.max(10, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
    const offset = (page - 1) * pageSize;

    const whereClauses = [];
    const params = [];

    if (specialty && Object.prototype.hasOwnProperty.call(VALID_SPECIALTIES, specialty)) {
        whereClauses.push('specialty_id = ?');
        params.push(specialty);
    }
    if (search) {
        whereClauses.push('(LOWER(full_name) LIKE ? OR email_normalized LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const totalRow = await env.DB.prepare('SELECT COUNT(*) AS total FROM waitlist_leads').first();
    const last7dIso = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
    const recentRow = await env.DB.prepare('SELECT COUNT(*) AS total FROM waitlist_leads WHERE created_at >= ?')
        .bind(last7dIso)
        .first();
    const filteredCountRow = await env.DB.prepare(`SELECT COUNT(*) AS total FROM waitlist_leads ${whereSql}`)
        .bind(...params)
        .first();

    const bySpecialtyRes = await env.DB.prepare(
        `SELECT specialty_id, specialty_label, COUNT(*) AS count
         FROM waitlist_leads
         GROUP BY specialty_id, specialty_label
         ORDER BY count DESC, specialty_label ASC`
    ).all();

    const leadsRes = await env.DB.prepare(
        `SELECT id, full_name, email_normalized, specialty_id, specialty_label,
                lgpd_consent_version, created_at, updated_at
         FROM waitlist_leads
         ${whereSql}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
    )
        .bind(...params, pageSize, offset)
        .all();

    return jsonResponse({
        ok: true,
        operator: adminEmail,
        summary: {
            total: Number(totalRow?.total || 0),
            last7Days: Number(recentRow?.total || 0),
            filteredTotal: Number(filteredCountRow?.total || 0),
            bySpecialty: bySpecialtyRes.results || [],
        },
        pagination: { page, pageSize },
        leads: leadsRes.results || [],
    });
}

async function handleAdminExportCsv(request, env) {
    const url = new URL(request.url);
    const specialty = (url.searchParams.get('specialty') || '').trim();

    let query = `SELECT full_name, email_normalized, specialty_id, specialty_label,
                        lgpd_consent_version, lgpd_consent_at, created_at, updated_at
                 FROM waitlist_leads`;
    const binds = [];

    if (specialty && Object.prototype.hasOwnProperty.call(VALID_SPECIALTIES, specialty)) {
        query += ' WHERE specialty_id = ?';
        binds.push(specialty);
    }
    query += ' ORDER BY created_at DESC';

    const { results } = await env.DB.prepare(query).bind(...binds).all();

    const header = [
        'Nome Completo',
        'E-mail',
        'Slug Especialidade',
        'Especialidade de Interesse',
        'Versão LGPD',
        'Data Consentimento LGPD (UTC)',
        'Cadastrado em (UTC)',
        'Atualizado em (UTC)',
    ];

    const lines = [header.map(escapeCsvCell).join(',')];
    for (const row of results || []) {
        lines.push(
            [
                row.full_name,
                row.email_normalized,
                row.specialty_id,
                row.specialty_label,
                row.lgpd_consent_version,
                row.lgpd_consent_at,
                row.created_at,
                row.updated_at,
            ]
                .map(escapeCsvCell)
                .join(',')
        );
    }

    const dateTag = new Date().toISOString().slice(0, 10);
    const suffix = specialty && VALID_SPECIALTIES[specialty] ? `-${specialty}` : '-todos';
    const csvContent = '\uFEFF' + lines.join('\r\n'); // BOM UTF-8 para Excel PT-BR

    return new Response(csvContent, {
        status: 200,
        headers: baseSecurityHeaders({
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="uff-medicina-2027-lista-espera${suffix}-${dateTag}.csv"`,
        }),
    });
}

function renderAdminHtml(adminEmail) {
    const safeEmail = adminEmail.replace(/[<>&"']/g, '');
    const specialtyOptions = Object.entries(VALID_SPECIALTIES)
        .map(([id, label]) => `<option value="${id}">${label}</option>`)
        .join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Painel Lista de Espera | FacMed UFF 2027</title>
<style>
  :root { color-scheme: dark; --bg:#072c22; --card:#0d3e31; --border:rgba(255,255,255,.12); --text:#f8fafc; --muted:#94a3b8; --accent:#10b981; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:system-ui,-apple-system,sans-serif; background:var(--bg); color:var(--text); line-height:1.5; }
  .wrap { max-width:1180px; margin:0 auto; padding:28px 20px 60px; }
  header { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:14px; padding-bottom:20px; border-bottom:1px solid var(--border); }
  h1 { margin:0; font-size:1.35rem; font-weight:800; }
  .badge { font-size:.78rem; color:#d1fae5; background:rgba(16,185,129,.16); border:1px solid rgba(16,185,129,.35); padding:6px 12px; border-radius:999px; }
  .kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:14px; margin:22px 0; }
  .card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:18px; }
  .kpi-label { font-size:.74rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); }
  .kpi-val { font-size:2rem; font-weight:800; margin-top:4px; }
  .grid-2 { display:grid; grid-template-columns:1fr; gap:18px; }
  @media (min-width:960px) { .grid-2 { grid-template-columns:340px 1fr; } }
  .bar-row { margin-bottom:10px; }
  .bar-head { display:flex; justify-content:space-between; font-size:.82rem; margin-bottom:4px; gap:8px; }
  .bar-track { height:7px; border-radius:999px; background:rgba(255,255,255,.08); overflow:hidden; }
  .bar-fill { height:100%; background:var(--accent); border-radius:999px; }
  .controls { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:14px; }
  input, select, button, a.btn { font:inherit; font-size:.85rem; border-radius:10px; padding:9px 12px; border:1px solid var(--border); background:#082920; color:var(--text); }
  input { flex:1; min-width:190px; }
  a.btn, button.btn { background:var(--accent); color:#04241a; font-weight:700; border:none; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:6px; }
  a.btn:hover, button.btn:hover { background:#34d399; }
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:.84rem; }
  th, td { text-align:left; padding:10px 10px; border-bottom:1px solid var(--border); }
  th { font-size:.72rem; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); }
  .muted { color:var(--muted); font-size:.8rem; }
  .pager { display:flex; align-items:center; justify-content:space-between; margin-top:14px; gap:10px; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div>
      <h1>Lista de Espera • Concurso Unificado FacMed UFF 2027</h1>
      <div class="muted">Painel institucional protegido por Cloudflare Access • Dados LGPD</div>
    </div>
    <span class="badge">Operador: ${safeEmail}</span>
  </header>

  <section class="kpis">
    <div class="card"><div class="kpi-label">Total de Interessados</div><div class="kpi-val" id="kpi-total">—</div></div>
    <div class="card"><div class="kpi-label">Últimos 7 dias</div><div class="kpi-val" id="kpi-7d">—</div></div>
    <div class="card"><div class="kpi-label">Especialidade Líder</div><div class="kpi-val" style="font-size:1.2rem;margin-top:10px" id="kpi-top">—</div></div>
  </section>

  <div class="grid-2">
    <aside class="card">
      <h2 style="margin:0 0 14px;font-size:1rem">Demanda por Especialidade</h2>
      <div id="breakdown" class="muted">Carregando...</div>
    </aside>

    <main class="card">
      <div class="controls">
        <input id="q" type="search" placeholder="Buscar por nome ou e-mail...">
        <select id="spec">
          <option value="">Todas as especialidades</option>
          ${specialtyOptions}
        </select>
        <a id="export-btn" class="btn" href="/admin/api/export.csv">Exportar CSV</a>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Nome</th><th>E-mail</th><th>Especialidade</th><th>Data (UTC)</th></tr>
          </thead>
          <tbody id="tbody"><tr><td colspan="4" class="muted">Carregando...</td></tr></tbody>
        </table>
      </div>
      <div class="pager">
        <span class="muted" id="pager-info"></span>
        <div style="display:flex;gap:8px">
          <button type="button" id="prev">Anterior</button>
          <button type="button" id="next">Próxima</button>
        </div>
      </div>
    </main>
  </div>
</div>
<script>
  let page = 1;
  const qEl = document.getElementById('q');
  const specEl = document.getElementById('spec');
  const exportBtn = document.getElementById('export-btn');

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  async function load() {
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (qEl.value.trim()) params.set('q', qEl.value.trim());
    if (specEl.value) params.set('specialty', specEl.value);
    exportBtn.href = '/admin/api/export.csv' + (specEl.value ? '?specialty=' + encodeURIComponent(specEl.value) : '');

    const res = await fetch('/admin/api/leads?' + params.toString(), { credentials: 'same-origin' });
    const data = await res.json();
    if (!data.ok) return;

    document.getElementById('kpi-total').textContent = data.summary.total;
    document.getElementById('kpi-7d').textContent = data.summary.last7Days;
    const top = data.summary.bySpecialty[0];
    document.getElementById('kpi-top').textContent = top ? top.specialty_label + ' (' + top.count + ')' : '—';

    const maxCount = top ? top.count : 1;
    const bd = document.getElementById('breakdown');
    bd.innerHTML = data.summary.bySpecialty.length
      ? data.summary.bySpecialty.map(item => {
          const pct = Math.max(4, Math.round((item.count / maxCount) * 100));
          return '<div class="bar-row"><div class="bar-head"><span>' + esc(item.specialty_label) + '</span><strong>' + item.count + '</strong></div><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div></div>';
        }).join('')
      : '<p class="muted">Nenhum cadastro ainda.</p>';

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = data.leads.length
      ? data.leads.map(l => '<tr><td>' + esc(l.full_name) + '</td><td>' + esc(l.email_normalized) + '</td><td>' + esc(l.specialty_label) + '</td><td class="muted">' + esc(l.created_at.slice(0, 16).replace('T', ' ')) + '</td></tr>').join('')
      : '<tr><td colspan="4" class="muted">Nenhum registro encontrado com os filtros atuais.</td></tr>';

    const totalFiltered = data.summary.filteredTotal;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / data.pagination.pageSize));
    document.getElementById('pager-info').textContent = 'Mostrando página ' + page + ' de ' + totalPages + ' (' + totalFiltered + ' registros)';
    document.getElementById('prev').disabled = page <= 1;
    document.getElementById('next').disabled = page >= totalPages;
  }

  let timer;
  qEl.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { page = 1; load(); }, 250); });
  specEl.addEventListener('change', () => { page = 1; load(); });
  document.getElementById('prev').addEventListener('click', () => { if (page > 1) { page--; load(); } });
  document.getElementById('next').addEventListener('click', () => { page++; load(); });
  load();
</script>
</body>
</html>`;

    return new Response(html, {
        status: 200,
        headers: baseSecurityHeaders({
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none';",
        }),
    });
}

// ============================================================================
// ENTRYPOINT PRINCIPAL
// ============================================================================
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const corsHeaders = buildCorsHeaders(request, env);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: baseSecurityHeaders(corsHeaders) });
        }

        if (url.pathname === '/api/health' && request.method === 'GET') {
            return jsonResponse({ ok: true, service: 'uff-medicina-2027-waitlist' }, 200, corsHeaders);
        }

        if (url.pathname === '/api/waitlist' && request.method === 'POST') {
            return handleWaitlistPost(request, env, corsHeaders);
        }

        if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
            const auth = await authenticateAdmin(request, env);
            if (!auth.ok) {
                return jsonResponse({ ok: false, message: auth.reason }, auth.status);
            }
            if (url.pathname === '/admin' && request.method === 'GET') {
                return renderAdminHtml(auth.email);
            }
            if (url.pathname === '/admin/api/leads' && request.method === 'GET') {
                return handleAdminLeadsApi(request, env, auth.email);
            }
            if (url.pathname === '/admin/api/export.csv' && request.method === 'GET') {
                return handleAdminExportCsv(request, env);
            }
        }

        return jsonResponse({ ok: false, message: 'Rota não encontrada.' }, 404, corsHeaders);
    },
};
