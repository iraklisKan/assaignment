# Backend Architecture

## Overview
Node.js + Express REST API with automated scheduling, caching, and plugin-based provider system.

---

## Core Components

### 1. **Integrations** (`src/integrations/`)
Plugin system for different exchange rate providers.

**BaseIntegration.js**
- Abstract base class all providers extend
- Implements retry logic (3 attempts with exponential backoff)
- Health checks validate provider responses
- Template pattern: subclasses override `fetchLatestRates()`

**Providers:**
- `ExchangeRateAPI.js` - Best free tier (1,500 requests/month)
- `FixerIO.js` - 100 requests/month, EUR base only
- `CurrencyLayer.js` - 100 requests/month, USD base only
- `MockIntegration.js` - Testing provider with fake data

**index.js** - Factory pattern
```javascript
createIntegration('exchangerate-api', config) // Returns ExchangeRateAPI instance
getSupportedProviders() // Returns metadata for UI dropdown
```

**Why plugins?** Easy to add new providers without changing core logic.

---

### 2. **Services** (`src/services/`)
Business logic layer between routes and database.

**scheduler.js** - Automated rate updates
- Loads active integrations every 5 minutes
- Fetches rates for 4 base currencies (USD, EUR, GBP, JPY)
- Tries providers by priority until one succeeds
- Updates `rates_latest` and archives to `rates_history`
- Logs all attempts to `rate_requests`

**integrationService.js** - Manages providers
- CRUD operations on `integrations` table
- Encrypts/decrypts API keys (AES-256-CBC)
- Health checks test provider connectivity

**ratesService.js** - Handles rate data
- Fetches latest rates (checks cache first, then DB)
- Converts amounts (EUR → USD, etc.)
- Caches in Redis for 5 minutes

**usageService.js** - Tracking & monitoring
- Logs user conversions
- Aggregates provider statistics (success rate, avg response time)
- Provides data for monitoring dashboard

---

### 3. **Routes** (`src/routes/`)
REST API endpoints.

**integrations.js** - `/api/integrations`
```
GET    /           - List all integrations
POST   /           - Add new provider
GET    /:id        - Get one provider
PATCH  /:id        - Update provider
DELETE /:id        - Remove provider
GET    /providers  - Supported provider types
```

**rates.js** - `/api/rates`
```
GET /latest         - Current rates (e.g., ?base=USD)
GET /convert        - Convert amount (e.g., ?from=USD&to=EUR&amount=100)
GET /history        - Historical rates (e.g., ?base=USD&days=7)
```

**monitoring.js** - `/api/monitoring`
```
GET /stats          - Provider success rates
GET /health         - System health check
GET /usage          - Conversion logs
```

---

### 4. **Config** (`src/config/`)

**database.js**
- PostgreSQL connection pool
- Auto-runs migrations on startup
- Connection string from env variables

**redis.js**
- Redis client for caching
- Fallback to in-memory LRU cache if Redis unavailable
- 1000-item cache limit

**encryption.js**
- AES-256-CBC encryption for API keys
- Uses `APP_DATA_KEY` from env
- Encrypts before DB insert, decrypts on read

---

### 5. **Middleware** (`src/middleware/`)

**errorHandler.js**
- Catches all errors in routes
- Returns consistent JSON error format
- Logs stack traces in development

---

### 6. **Utils** (`src/utils/`)

**validation.js**
- Input validators (currency codes, amounts, IDs)
- Prevents invalid data from reaching DB
- Used in route handlers

---

## Request Flow Example

**User converts 100 USD to EUR:**

1. Frontend → `GET /api/rates/convert?from=USD&to=EUR&amount=100`
2. **routes/rates.js** validates params
3. **services/ratesService.js** checks Redis cache
4. If cache miss, queries `rates_latest` table
5. Calculates: `100 * 0.85 = 85 EUR`
6. Logs conversion to `conversions` table
7. Returns JSON: `{result: 85, rate: 0.85}`

---

## Scheduler Flow

**Every 5 minutes:**

1. **scheduler.js** queries active integrations
2. Sorts by priority (1, 2, 3...)
3. For each base currency (USD, EUR, GBP, JPY):
   - Try provider #1 → Success? Update DB, done.
   - Failed? Try provider #2
   - Failed? Try provider #3
   - All failed? Log error, keep old rates
4. Archive new rates to `rates_history`
5. Log all attempts to `rate_requests`

---

## Environment Variables

```
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=currency_exchange
DATABASE_USER=postgres
DATABASE_PASSWORD=admin123
REDIS_HOST=redis
REDIS_PORT=6379
APP_DATA_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6  # 32 chars for AES-256
PORT=3001
NODE_ENV=development
```

---

## Key Design Decisions

**Why services layer?**
- Keeps routes thin (just HTTP logic)
- Business logic reusable across routes
- Easy to test without HTTP

**Why scheduler over cron?**
- Built-in Node.js (no external dependencies)
- Easier to debug and monitor
- Can trigger manually via API

**Why encrypt API keys?**
- Database compromise doesn't leak keys
- Follows security best practices
- Decryption only happens in memory

**Why Redis cache?**
- Reduces DB load (rates requested often)
- 5-minute TTL keeps data fresh
- Graceful fallback to in-memory cache
