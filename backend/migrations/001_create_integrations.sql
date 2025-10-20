-- Migration: Create integrations table
-- Description: Stores external API integration configurations

CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    base_url TEXT NOT NULL,
    api_key_enc TEXT,
    priority INTEGER NOT NULL DEFAULT 100,
    poll_interval_seconds INTEGER NOT NULL DEFAULT 300,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_integration_name UNIQUE(name)
);

CREATE INDEX IF NOT EXISTS idx_integrations_active_priority ON integrations(active, priority);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
