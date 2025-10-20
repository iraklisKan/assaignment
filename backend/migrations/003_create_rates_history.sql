-- Migration: Create rates_history table
-- Description: Stores historical exchange rate data for trend analysis

CREATE TABLE IF NOT EXISTS rates_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base TEXT NOT NULL,
    target TEXT NOT NULL,
    rate NUMERIC(20, 10) NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL,
    source_integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rates_history_base_target_fetched ON rates_history(base, target, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_rates_history_fetched_at ON rates_history(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_rates_history_source ON rates_history(source_integration_id);
