# Database Architecture

## Overview
PostgreSQL database with 5 core tables managing exchange rate integrations, rate data, and usage tracking.

## Tables

### 1. `integrations`
Stores configured API providers (ExchangeRate-API, Fixer, etc.)

```sql
- id: Auto-incrementing primary key
- name: Display name (e.g., "My ExchangeRate-API")
- provider: Provider type (exchangerate-api, fixer, currencylayer, mock)
- base_url: API endpoint
- api_key: Encrypted API key (AES-256-CBC)
- priority: Lower = higher priority (1 is first)
- poll_interval_seconds: How often to fetch (e.g., 300 = 5 minutes)
- active: Enable/disable without deleting
- created_at, updated_at: Timestamps
```

**Why?** Each provider needs different config (API key, endpoint). This table lets you manage multiple providers with fallback priorities.

### 2. `rates_latest`
Current exchange rates (one row per currency pair)

```sql
- id: Auto-incrementing primary key
- base_currency: Source currency (USD, EUR, etc.)
- target_currency: Destination currency
- rate: Exchange rate (e.g., 1.23)
- integration_id: Which provider gave this rate
- fetched_at: When the rate was retrieved
- created_at, updated_at: Timestamps
```

**Why?** The scheduler constantly updates this table. Your frontend shows these "latest" rates. One table = fast lookups.

### 3. `rates_history`
Historical rates for charting (read-only archive)

```sql
- Same columns as rates_latest
```

**Why?** Shows rate trends over time. Charts on the frontend pull from here. Never updated, only inserted.

### 4. `rate_requests`
Logs every API request to providers

```sql
- id: Auto-incrementing primary key
- integration_id: Which provider was called
- base_currency: Requested base currency
- success: true/false
- response_time_ms: How long the API took
- error_message: If failed, why
- created_at: When the request happened
```

**Why?** Monitoring dashboard shows success rates and performance. Helps debug provider issues.

### 5. `conversions`
Logs user conversion requests from the frontend

```sql
- id: Auto-incrementing primary key
- from_currency: User's source currency
- to_currency: User's target currency
- amount: Amount converted
- result: Calculated result
- rate_used: Exchange rate applied
- created_at: When user made the conversion
```

**Why?** Tracks what users are converting. Could show popular currency pairs later.

## Migrations
Database schema is version-controlled in `backend/migrations/`:

1. `001_create_integrations.sql` - Provider config table
2. `002_create_rates_latest.sql` - Current rates
3. `003_create_rates_history.sql` - Historical data
4. `004_create_rate_requests.sql` - API call logs
5. `005_create_conversions.sql` - User activity logs

Run automatically on startup via `database.js`.

## Connection
- **Host**: `postgres` (Docker service name)
- **Port**: 5432
- **Database**: `currency_exchange`
- **User**: `postgres`
- **Password**: From `DATABASE_PASSWORD` env variable

## Key Design Decisions

**Why PostgreSQL?**
- ACID compliance for financial data
- Excellent JOIN performance for reports
- Native timestamp support for history

**Why separate latest/history tables?**
- Latest table stays small (only current rates)
- History table grows forever (archives)
- Fast queries on latest, historical analysis on history

**Why log every API call?**
- Monitors provider reliability
- Tracks rate limits
- Debugging when rates fail to update
