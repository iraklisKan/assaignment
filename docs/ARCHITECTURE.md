# System Architecture Overview

## High-Level Design

```
┌─────────────┐
│   Browser   │
│  (React 18) │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────┐
│         Express Backend             │
│                                     │
│  ┌─────────┐  ┌─────────────────┐  │
│  │ Routes  │→ │    Services     │  │
│  └─────────┘  └────────┬────────┘  │
│                        │            │
│  ┌─────────────────────▼─────────┐ │
│  │   Integrations (Plugins)      │ │
│  │  - ExchangeRate-API           │ │
│  │  - Fixer.io                   │ │
│  │  - CurrencyLayer              │ │
│  └───────────────────────────────┘ │
└──────────┬──────────────────────────┘
           │
      ┌────┴────┐
      ▼         ▼
┌──────────┐ ┌─────────┐
│PostgreSQL│ │  Redis  │
│  (Data)  │ │ (Cache) │
└──────────┘ └─────────┘
```

---

## Components

### **Frontend (React SPA)**
- **Purpose:** User interface for viewing rates, converting currencies, managing integrations
- **Tech:** React 18, React Router, Tailwind CSS, Chart.js
- **Port:** 3000
- **Key Features:**
  - Dashboard with live rates
  - Currency converter
  - Historical charts
  - Provider management
  - Monitoring dashboard

### **Backend (Node.js API)**
- **Purpose:** Business logic, data management, provider orchestration
- **Tech:** Express.js, PostgreSQL, Redis, Jest
- **Port:** 3001
- **Key Features:**
  - REST API (17 endpoints)
  - Automated scheduler (updates rates every 5 min)
  - Plugin-based provider system
  - API key encryption (AES-256-CBC)
  - Caching layer (Redis + in-memory fallback)

### **Database (PostgreSQL)**
- **Purpose:** Persistent storage for rates, integrations, logs
- **Port:** 5432
- **Tables:** 5 (integrations, rates_latest, rates_history, rate_requests, conversions)
- **Migrations:** 5 SQL files auto-run on startup

### **Cache (Redis)**
- **Purpose:** Speed up rate lookups (5-minute TTL)
- **Port:** 6379
- **Fallback:** In-memory LRU cache (1000 items) if Redis unavailable

---

## Request Flow

### User Converts Currency

1. **User** enters 100 USD → EUR in browser
2. **Frontend** calls `GET /api/rates/convert?from=USD&to=EUR&amount=100`
3. **Backend Route** (`rates.js`) validates params
4. **Service** (`ratesService.js`) checks Redis cache
   - Cache hit? Return cached rate
   - Cache miss? Query `rates_latest` table
5. **Calculation:** `100 * 0.85 = 85 EUR`
6. **Log** conversion to `conversions` table
7. **Response** `{ result: 85, rate: 0.85 }`
8. **Frontend** displays result

**Time:** ~50ms (cached) or ~150ms (DB query)

---

## Scheduler Flow

### Automated Rate Updates (Every 5 Minutes)

1. **Scheduler** wakes up
2. Query `integrations` table for active providers
3. Sort by priority (1, 2, 3...)
4. For each base currency (USD, EUR, GBP, JPY):
   
   **Try Priority 1 Provider:**
   - Call `ExchangeRateAPI.fetchLatestRates('USD')`
   - Success? → Update `rates_latest`, archive to `rates_history`, log to `rate_requests`
   - Failed? → Continue to Priority 2
   
   **Try Priority 2 Provider:**
   - Call `FixerIO.fetchLatestRates('USD')`
   - Success? → Update DB
   - Failed? → Continue to Priority 3
   
   **All failed?** → Keep old rates, log error

5. **Cache invalidation:** Clear Redis cache for updated currencies
6. **Frontend auto-refreshes** (30-second polling or WebSocket in future)

---

## Data Flow

### Rate Storage

```
External API → Integration → Service → Database → Cache → Frontend
```

**Example:**
```
ExchangeRate-API returns { USD: { EUR: 0.85 } }
  ↓
ExchangeRateAPI.fetchLatestRates() normalizes response
  ↓
ratesService.saveRates() inserts to rates_latest
  ↓
Also inserted to rates_history for charting
  ↓
Redis caches for 5 minutes
  ↓
Frontend fetches and displays
```

---

## Security Layers

### 1. **API Key Encryption**
- Keys encrypted with AES-256-CBC before DB insert
- `APP_DATA_KEY` env variable (32 characters)
- Decryption only in memory when making API calls

### 2. **Environment Variables**
- `.env` file gitignored (local secrets)
- `.env.example` committed (safe placeholders)
- Docker-compose uses env vars

### 3. **Input Validation**
- `validation.js` checks all user inputs
- Currency codes must be 3 uppercase letters
- Amounts must be positive numbers
- IDs must be integers

### 4. **Error Handling**
- Global error middleware catches all exceptions
- Never expose stack traces in production
- Log errors server-side only

---

## Scalability Considerations

### Current Limits
- **Database:** Single PostgreSQL instance (1M+ rows no problem)
- **Cache:** Single Redis instance (can handle 10K+ requests/sec)
- **Scheduler:** Single-threaded (fine for <50 integrations)

### Future Scaling
1. **Horizontal Scaling:**
   - Run multiple backend instances behind load balancer
   - Use Redis for shared cache
   - Scheduler runs on one instance only (leader election)

2. **Database Optimization:**
   - Index on `(base_currency, target_currency)` for fast lookups
   - Partition `rates_history` by date (archive old data)
   - Read replicas for reporting queries

3. **Caching Strategy:**
   - Increase Redis TTL for rarely changing rates
   - CDN for frontend static assets
   - API response caching (HTTP Cache-Control headers)

---

## Failure Handling

### Provider Failure
- **Retry:** 3 attempts with exponential backoff (1s, 2s, 4s)
- **Fallback:** Try next priority provider
- **Graceful Degradation:** Show last known rates if all fail

### Database Failure
- **Connection Pool:** Retry failed queries (max 3 retries)
- **Circuit Breaker:** Stop trying if DB down >5 minutes
- **Cache Fallback:** Serve from Redis if DB unavailable

### Redis Failure
- **In-Memory Cache:** Automatic fallback to LRU cache
- **No Data Loss:** Rates still in PostgreSQL
- **Performance Hit:** Slower queries without cache

---

## Monitoring Points

### Health Checks
- `GET /api/monitoring/health` - System status
  - Database connected?
  - Redis connected?
  - Scheduler running?
  - Last rate update timestamp

### Metrics
- Provider success rate (% of successful API calls)
- Average response time per provider
- Cache hit ratio (Redis vs DB queries)
- Conversion volume (popular currency pairs)

### Alerts (Future)
- Provider down >10 minutes
- No rate updates >1 hour
- Database connection errors
- High error rate (>5%)

---

## Technology Choices

### Why This Stack?

**Node.js Backend:**
- ✅ Fast async I/O (many external API calls)
- ✅ JavaScript everywhere (shared code with frontend)
- ✅ Huge ecosystem (npm packages)

**PostgreSQL Database:**
- ✅ ACID compliance (financial data)
- ✅ Excellent query performance
- ✅ JSON support (flexible rate storage)

**Redis Cache:**
- ✅ Sub-millisecond latency
- ✅ Built-in TTL (auto-expire old data)
- ✅ Simple key-value model

**React Frontend:**
- ✅ Component reusability
- ✅ Virtual DOM (fast updates)
- ✅ Large community (help available)

**Docker:**
- ✅ Consistent dev/prod environments
- ✅ Easy deployment (one command)
- ✅ Service isolation

---

## Design Patterns Used

1. **Factory Pattern** - `createIntegration()` creates provider instances
2. **Template Pattern** - `BaseIntegration` defines algorithm, subclasses fill details
3. **Strategy Pattern** - Different providers = different strategies for same goal
4. **Repository Pattern** - Services abstract DB access from routes
5. **Singleton** - Database pool, Redis client (one instance shared)

---

## File Organization

```
backend/
├── src/
│   ├── config/          # DB, Redis, encryption setup
│   ├── integrations/    # Provider plugins
│   ├── middleware/      # Error handling
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── utils/           # Validation, helpers
│   └── index.js         # Express app entry
├── migrations/          # DB schema versions
└── tests/               # Jest tests

frontend/
├── public/              # Static assets
└── src/
    ├── components/      # Reusable UI components
    ├── pages/           # Route pages
    ├── services/        # API client
    └── App.jsx          # Main component
```

---

## Key Design Decisions

**Why separate latest/history tables?**
- Latest stays small (fast queries)
- History grows forever (analytics)

**Why plugins for providers?**
- Easy to add new APIs
- No core logic changes needed

**Why scheduler instead of cron?**
- Portable (works on Windows)
- Easier debugging (logs visible)
- Can trigger manually via API

**Why REST not GraphQL?**
- Simpler for this use case
- No over/under-fetching issues
- Easier to cache
