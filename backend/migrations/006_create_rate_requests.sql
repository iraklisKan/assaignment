-- Migration: Create rate_requests table
-- Description: Logs every API request to external providers for monitoring and debugging

CREATE TABLE IF NOT EXISTS rate_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    base_currency TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_requests_integration ON rate_requests(integration_id);
CREATE INDEX IF NOT EXISTS idx_rate_requests_created_at ON rate_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_requests_success ON rate_requests(success);
CREATE INDEX IF NOT EXISTS idx_rate_requests_integration_created ON rate_requests(integration_id, created_at DESC);
