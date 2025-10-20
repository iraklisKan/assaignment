-- Seed initial integration for demo/testing
-- Note: For security, API keys should be added via the UI/API which handles encryption
-- This seed creates an integration WITHOUT an API key - users must add their own

-- Insert a demo integration (API key must be added via UI)
INSERT INTO integrations (
  name, 
  provider, 
  base_url,
  priority, 
  poll_interval_seconds, 
  active
) VALUES (
  'ExchangeRate-API (Add Your Key)',
  'exchangerate-api',
  'https://v6.exchangerate-api.com',
  1,
  60,
  false
)
ON CONFLICT (name) DO NOTHING;
