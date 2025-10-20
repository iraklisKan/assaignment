# Database Architecture

## Overview
PostgreSQL database with 5 core tables managing exchange rate integrations, rate data, and usage tracking.

## Tables

### 1. `integrations`
Stores configured API providers (ExchangeRate-API, Fixer, etc.)

```sql
- id: UUID primary key
- name: Display name (e.g., "My ExchangeRate-API")
- provider: Provider type (exchangerate-api, fixer, currencylayer, mock)
- base_url: API endpoint
- api_key_enc: Encrypted API key (AES-256-CBC)
- priority: Lower = higher priority (1 is first)
- poll_interval_seconds: How often to fetch (e.g., 300 = 5 minutes)
- active: Enable/disable without deleting
- created_at, updated_at: Timestamps
```

**Why?** Each provider needs different config (API key, endpoint). This table lets you manage multiple providers with fallback priorities.

### 2. `rates_latest`
Current exchange rates (one row per currency pair)

```sql
- pair: Primary key (e.g., "USD-EUR")
- base: Source currency (USD, EUR, etc.)
- target: Destination currency
- rate: Exchange rate (NUMERIC 20,10 precision)
- fetched_at: When the rate was retrieved
- source_integration_id: Which provider gave this rate
```

**Why?** The scheduler constantly updates this table. Your frontend shows these "latest" rates. One table = fast lookups.

### 3. `rates_history`
Historical rates for charting (append-only archive)

```sql
- id: UUID primary key
- base: Source currency
- target: Destination currency
- rate: Exchange rate (NUMERIC 20,10 precision)
- fetched_at: When the rate was retrieved
- source_integration_id: Which provider gave this rate
- created_at: Record creation timestamp
```

**Why?** Shows rate trends over time. Charts on the frontend pull from here. Never updated, only inserted.

### 4. `integration_usage`
Daily aggregated API usage metrics per integration

```sql
- id: UUID primary key
- integration_id: References integrations(id)
- date: Date of usage (unique per integration per day)
- calls_made: Total API calls made today
- calls_limit: Provider's rate limit
- calls_remaining: Calls left before hitting limit
- reset_at: When the limit resets
- last_error: Most recent error message
- last_error_at: When the error occurred
- created_at, updated_at: Timestamps
```

**Why?** Tracks daily usage per provider. Helps monitor approaching rate limits. One row per integration per day.

### 5. `rate_requests`
Detailed log of every API request to providers

```sql
- id: UUID primary key
- integration_id: Which provider was called
- base_currency: Requested base currency
- success: true/false
- response_time_ms: How long the API took (milliseconds)
- error_message: If failed, why
- created_at: When the request happened
```

**Why?** Monitoring dashboard shows success rates and performance trends. Helps debug provider issues. One row per API call.

### 6. `conversions`
Logs user conversion requests from the frontend

```sql
- id: UUID primary key
- from_currency: User's source currency
- to_currency: User's target currency
- amount: Amount converted (NUMERIC 20,10)
- result: Calculated result (NUMERIC 20,10)
- rate_used: Exchange rate applied (NUMERIC 20,10)
- created_at: When user made the conversion
```

**Why?** Tracks what users are converting. Can analyze popular currency pairs. Analytics for user behavior.

## Migrations
Database schema is version-controlled in `backend/migrations/`:

1. `001_create_integrations.sql` - Provider config table
2. `002_create_rates_latest.sql` - Current rates
3. `003_create_rates_history.sql` - Historical data
4. `004_create_integration_usage.sql` - Daily usage aggregates
5. `005_seed_demo_integration.sql` - Demo data (inactive)
6. `006_create_rate_requests.sql` - Detailed API call logs
7. `007_create_conversions.sql` - User conversion logs

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
