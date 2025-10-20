-- Migration: Create integration_usage table
-- Description: Tracks API usage metrics for monitoring and rate limiting

CREATE TABLE IF NOT EXISTS integration_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calls_made INTEGER NOT NULL DEFAULT 0,
    calls_limit INTEGER,
    calls_remaining INTEGER,
    reset_at TIMESTAMPTZ,
    last_error TEXT,
    last_error_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_integration_date UNIQUE(integration_id, date)
);

CREATE INDEX IF NOT EXISTS idx_integration_usage_integration_date ON integration_usage(integration_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_integration_usage_date ON integration_usage(date DESC);

DROP TRIGGER IF EXISTS update_integration_usage_updated_at ON integration_usage;
CREATE TRIGGER update_integration_usage_updated_at BEFORE UPDATE ON integration_usage
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
