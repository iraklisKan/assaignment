-- Migration: Create conversions table
-- Description: Logs user currency conversion requests from the frontend

CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    amount NUMERIC(20, 10) NOT NULL,
    result NUMERIC(20, 10) NOT NULL,
    rate_used NUMERIC(20, 10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversions_currencies ON conversions(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversions_pair_created ON conversions(from_currency, to_currency, created_at DESC);
