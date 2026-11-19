-- ============================================================================
-- Schema D1 (SQLite) — Lista de Espera Concurso Unificado FacMed UFF 2027
-- ============================================================================
-- Aplicar localmente:  npx wrangler d1 execute uff-waitlist-2027 --local --file=./schema.sql
-- Aplicar em produção: npx wrangler d1 execute uff-waitlist-2027 --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS waitlist_leads (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email_normalized TEXT NOT NULL UNIQUE,
    specialty_id TEXT NOT NULL,
    specialty_label TEXT NOT NULL,
    lgpd_consent INTEGER NOT NULL DEFAULT 1 CHECK (lgpd_consent = 1),
    lgpd_consent_version TEXT NOT NULL,
    lgpd_consent_at TEXT NOT NULL,
    source_page TEXT NOT NULL DEFAULT 'index',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_waitlist_specialty ON waitlist_leads(specialty_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist_leads(created_at DESC);

-- Tabela temporária de rate limit por hash de IP (nunca armazena IP em texto puro).
-- Linhas expiradas são limpas automaticamente em chamadas subsequentes.
CREATE TABLE IF NOT EXISTS rate_limit_hits (
    ip_hash TEXT NOT NULL,
    window_type TEXT NOT NULL,   -- '15m' ou '24h'
    window_key TEXT NOT NULL,    -- bucket temporal UTC
    hit_count INTEGER NOT NULL DEFAULT 1,
    expires_at INTEGER NOT NULL, -- epoch seconds
    PRIMARY KEY (ip_hash, window_type, window_key)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_expires ON rate_limit_hits(expires_at);
