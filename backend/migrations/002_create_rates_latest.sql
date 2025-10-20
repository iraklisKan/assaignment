-- Migration: Create rates_latest table
-- Description: Stores the most recent exchange rates for quick lookups

CREATE TABLE IF NOT EXISTS rates_latest (
    pair TEXT PRIMARY KEY,
    base TEXT NOT NULL,
    target TEXT NOT NULL,
    rate NUMERIC(20, 10) NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL,
    source_integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_rates_latest_base_target ON rates_latest(base, target);
CREATE INDEX IF NOT EXISTS idx_rates_latest_fetched_at ON rates_latest(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_rates_latest_source ON rates_latest(source_integration_id);
