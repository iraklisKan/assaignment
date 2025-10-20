# Currency Exchange Rate Hub# Currency Exchange Rate Hub# Currency Exchange Rate Hub# Currency Exchange Rate Hub# Currency Exchange Rate Hub# Currency Exchange Rate Hub# Currency Exchange Rate Hub



## Setup



```bash## Setup

git clone https://github.com/iraklisKan/assaignment.git

cd assaignment

docker-compose up -d

``````bashFull-stack application for managing real-time currency exchange rates from multiple providers.



- Frontend: http://localhost:3000git clone https://github.com/iraklisKan/assaignment.git

- API: http://localhost:3001

cd assaignment

**Add API Key:** http://localhost:3000/integrations → "Add Integration" → Choose provider (encrypted AES-256-CBC)

docker-compose up -d

---

```---A full-stack application for managing real-time currency exchange rates from multiple providers.

## Tests & Endpoints



```bash

cd backend && npm test**Access:**

cd frontend && npm test

```- Frontend: http://localhost:3000



| Method | Endpoint | Description |- API: http://localhost:3001## Setup Instructions

|--------|----------|-------------|

| GET | /api/rates/latest?base=USD | Current rates |

| GET | /api/rates/convert?from=USD&to=EUR&amount=100 | Convert |

| GET | /api/rates/history?base=USD&days=7 | History |**Add API Key:**

| GET | /api/integrations | List providers |

| POST | /api/integrations | Add provider |1. Go to http://localhost:3000/integrations

| PATCH | /api/integrations/:id | Update |

| DELETE | /api/integrations/:id | Delete |2. Click "Add Integration"**Prerequisites:** Docker & Docker Compose---A full-stack application for managing real-time currency exchange rates from multiple providers with automated scheduling and monitoring.

| GET | /api/monitoring/health | Health |

3. Select provider & enter API key (encrypted with AES-256-CBC)

---



## Design Decisions

---

- **Plugin architecture** (factory pattern) - extensible provider system

- **Priority fallback** - tries providers by priority until success**Steps:**

- **Built-in scheduler** (5 min) - portable, no external cron

- **Dual tables** - `rates_latest` (fast) + `rates_history` (time-series)## Tests & Endpoints

- **AES-256-CBC encryption** - API keys encrypted at rest

- **Redis + LRU cache** - 5-min TTL, in-memory fallback```bash

- **Docker Compose** - easy setup vs Kubernetes complexity

- **Single scheduler** - use leader election for distributed systems**Run Tests:**



---```bashgit clone https://github.com/iraklisKan/assaignment.git## Setup Instructions



## Pagescd backend && npm test



- http://localhost:3000 - Dashboardcd frontend && npm testcd assaignment

- http://localhost:3000/integrations - Manage providers

- http://localhost:3000/convert - Converter```

- http://localhost:3000/history - Charts

- http://localhost:3000/monitoring - Healthdocker-compose up -d


**API Endpoints:**

```

| Method | Endpoint | Purpose |

|--------|----------|---------|### 1. Clone and Start---A full-stack web application for managing and monitoring real-time currency exchange rates from multiple providers with automated scheduling, caching, and fallback mechanisms.A full-stack application for aggregating, caching, and managing exchange rates from multiple external APIs. Built with Express.js, React, PostgreSQL, and Redis.

| GET | /api/rates/latest?base=USD | Get current rates |

| GET | /api/rates/convert?from=USD&to=EUR&amount=100 | Convert currency |**Access:**

| GET | /api/rates/history?base=USD&days=7 | Historical data |

| GET | /api/integrations | List providers |- Frontend: http://localhost:3000```bash

| POST | /api/integrations | Add provider |

| PATCH | /api/integrations/:id | Update provider |- Backend API: http://localhost:3001

| DELETE | /api/integrations/:id | Delete provider |

| GET | /api/monitoring/health | System health |git clone https://github.com/iraklisKan/assaignment.git



------



## Design Decisionscd assaignment



**Architecture:**## Environment Variables

- Plugin-based providers (factory pattern) - easy to add new APIs

- Priority fallback - tries providers by priority until successdocker-compose up -d## Setup Instructions

- Built-in scheduler (every 5 min) - portable, no external cron needed

- Dual tables: `rates_latest` (fast lookups) + `rates_history` (time-series)All required variables are pre-configured in `docker-compose.yml`:



**Security:**```

- API keys encrypted (AES-256-CBC) before database storage

- `.env` gitignored - demo credentials in docker-compose only```env



**Performance:**DATABASE_PASSWORD=admin123                              # PostgreSQL password

- Redis cache + in-memory LRU fallback (5-min TTL)

- Indexed queries for fast lookupsAPP_DATA_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6        # Encryption key (32 chars)



**Assumptions:**```### 2. Access URLs

- ISO 4217 currency codes (USD, EUR, GBP, etc.)

- Min polling interval: 60s (respects free tier limits)

- All timestamps UTC

- Single scheduler instance (use leader election for distributed systems)**Adding API Keys:**- **Frontend:** http://localhost:3000### Prerequisites## 🚀 Quick Start## 🎯 Overview



**Trade-offs:**1. Go to http://localhost:3000/integrations

- Docker Compose (easy setup) vs Kubernetes (production scale)

- In-app scheduler (portable) vs external cron (distributed systems)2. Click "Add Integration"- **Backend API:** http://localhost:3001

- Data duplication (performance) vs single table (storage efficiency)

3. Select provider (ExchangeRate-API, Fixer.io, CurrencyLayer, or Mock)

---

4. Enter API key (get free key from provider website)- Docker & Docker Compose

## Frontend Pages

5. API keys are encrypted before storage (AES-256-CBC)

- http://localhost:3000 - Dashboard (latest rates)

- http://localhost:3000/integrations - Manage providers### 3. Environment Variables

- http://localhost:3000/convert - Currency converter

- http://localhost:3000/history - Rate trends**Note:** `.env` file is gitignored for security.

- http://localhost:3000/monitoring - System health

- Git

---

All required variables are pre-configured in `docker-compose.yml`:

## Running Tests



**Backend:**

```bash```env

cd backend

npm test                  # Run all testsDATABASE_PASSWORD=admin123### Installation Steps### PrerequisitesThis system provides:

npm run test:coverage     # With coverage

```APP_DATA_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6



**Frontend:**```

```bash

cd frontend

npm test

```**API Keys:** Not included for security. Add via UI at http://localhost:3000/integrations1. **Clone the repository**- Docker & Docker Compose- **Multi-provider integration**: Connect to multiple exchange rate APIs with automatic failover



---



## API EndpointsSupported providers:```bash



**Base URL:** `http://localhost:3001/api`- ExchangeRate-API (https://www.exchangerate-api.com/) - 1,500 free requests/month



### Rates- Fixer.io (https://fixer.io/) - 100 requests/monthgit clone https://github.com/iraklisKan/assaignment.git- Node.js 18+ (for local development)- **Intelligent caching**: Redis-based caching with in-memory LRU fallback

- `GET /rates/latest?base=USD` - Get current rates

- `GET /rates/convert?from=USD&to=EUR&amount=100` - Convert currency- CurrencyLayer (https://currencylayer.com/) - 100 requests/month

- `GET /rates/history?base=USD&target=EUR&days=7` - Historical data

- Mock Provider - No key neededcd assaignment

### Integrations

- `GET /integrations` - List all providers

- `POST /integrations` - Add provider (body: `{name, provider, baseUrl, apiKey, priority, pollIntervalSeconds}`)

- `PATCH /integrations/:id` - Update provider---```- Git- **Scheduled polling**: Configurable per-integration rate fetching

- `DELETE /integrations/:id` - Remove provider

- `GET /integrations/providers` - Supported provider types



### Monitoring## Running Tests

- `GET /monitoring/health` - System health

- `GET /monitoring/stats` - Provider statistics

- `GET /monitoring/usage` - API call logs

```bash2. **Start all services**- **REST API**: Complete endpoints for integration management, rates, conversion, and monitoring

---

# Backend tests

## Frontend URLs

cd backend```bash

- **Dashboard:** http://localhost:3000 - View latest rates

- **Integrations:** http://localhost:3000/integrations - Manage API providersnpm test

- **Converter:** http://localhost:3000/convert - Convert currencies

- **History:** http://localhost:3000/history - View rate trendsdocker-compose up -d### Setup (Using Docker - Recommended)- **Admin UI**: React-based interface for CRUD operations and data visualization

- **Monitoring:** http://localhost:3000/monitoring - System health & stats

# Frontend tests

---

cd frontend```

## Design Decisions & Assumptions

npm test

**Architecture:**

- Plugin-based provider system (factory pattern) for easy extensibility```- **Secure**: API keys encrypted at rest using AES-256-CBC

- Priority-based fallback: tries providers by priority until success

- Automated scheduler (every 5 minutes) instead of external cron

- Separate tables: `rates_latest` (current) and `rates_history` (time-series)

---The application will start automatically:

**Security:**

- API keys encrypted with AES-256-CBC before database storage

- `.env` file gitignored, demo credentials in docker-compose only

## API Endpoints- **Frontend:** http://localhost:30001. **Clone the repository**- **Scalable**: Stateless architecture ready for horizontal scaling

**Performance:**

- Redis cache with in-memory LRU fallback (5-minute TTL)

- Indexed database queries for fast lookups

**Base URL:** `http://localhost:3001/api`- **Backend API:** http://localhost:3001

**Assumptions:**

- Currency codes follow ISO 4217 (USD, EUR, GBP, etc.)

- Minimum polling interval: 60 seconds (respects API rate limits)

- Scheduler fetches 4 base currencies: USD, EUR, GBP, JPY### Rates```bash

- All timestamps stored as UTC

- Single scheduler instance (use leader election for multi-instance)- `GET /rates/latest?base=USD` - Get latest rates



**Trade-offs:**- `GET /rates/convert?from=USD&to=EUR&amount=100` - Convert currency---

- Docker Compose (easy setup) vs Kubernetes (production scale)

- In-app scheduler (portable) vs cron (distributed systems)- `GET /rates/history?base=USD&target=EUR&days=7` - Historical data

- Data duplication (latest + history tables) vs single table (performance gain justifies duplication)

git clone https://github.com/iraklisKan/assaignment.git## 🏗️ Architecture

### Integrations

- `GET /integrations` - List all providers## Environment Variables

- `POST /integrations` - Add provider (body: `{name, provider, baseUrl, apiKey, priority, pollIntervalSeconds}`)

- `PATCH /integrations/:id` - Update providercd assaignment

- `DELETE /integrations/:id` - Delete provider

- `GET /integrations/providers` - Supported provider types### Required Variables (Already configured in docker-compose.yml)



### Monitoring```### Backend (Node.js + Express)

- `GET /monitoring/health` - System health

- `GET /monitoring/stats` - Provider statistics```env

- `GET /monitoring/usage` - Usage logs

# Database Configuration- **Plugin-based integrations**: Each external API implements a common interface

---

DATABASE_HOST=postgres

## Frontend Access

DATABASE_PORT=54322. **Start all services**- **Scheduler service**: Polls integrations based on configurable intervals

- **Dashboard:** http://localhost:3000 - View latest rates

- **Converter:** http://localhost:3000/convert - Convert currenciesDATABASE_NAME=currency_exchange

- **History:** http://localhost:3000/history - View rate trends

- **Integrations:** http://localhost:3000/integrations - Manage API providersDATABASE_USER=postgres```bash- **Database layer**: PostgreSQL for persistent storage

- **Monitoring:** http://localhost:3000/monitoring - System health dashboard

DATABASE_PASSWORD=admin123

---

docker-compose up -d- **Cache layer**: Redis (with in-memory fallback) for latest rates

## Design Decisions

# Redis Cache

1. **Plugin Architecture:** Factory pattern for easy provider addition without core changes

2. **Priority Fallback:** Tries providers by priority until one succeeds (graceful degradation)REDIS_HOST=redis```- **Encryption**: API keys encrypted before database storage

3. **Dual Caching:** Redis (primary) + in-memory LRU (fallback) for high performance

4. **Separate Tables:** `rates_latest` (fast current lookups) vs `rates_history` (time-series analysis)REDIS_PORT=6379

5. **API Key Encryption:** AES-256-CBC encryption before database storage

6. **Built-in Scheduler:** Node.js interval (platform-independent, easier debugging)- **Error handling**: Comprehensive error handling and logging

7. **Docker Compose:** Single-command setup for consistent environments

# Security - Encryption Key (32 characters)

### Trade-offs

APP_DATA_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p63. **Access the application**

- **Scheduler in-process:** Simple but not ideal for distributed systems (acceptable for single-instance)

- **Data duplication:** Latest rates stored in both tables (performance over storage)

- **Cache overhead:** Memory usage for LRU cache (acceptable given speed benefits)

- **No committed keys:** Users add their own (security best practice, demonstrates integration feature)# Server- Frontend: http://localhost:3000### Frontend (React)



---PORT=3001



## AssumptionsNODE_ENV=production- Backend API: http://localhost:3001- **Integrations Management**: CRUD operations for external API configurations



- Currency codes follow ISO 4217 standard (USD, EUR, GBP, etc.)```

- Minimum polling interval: 60 seconds (respects free tier rate limits)

- Timestamps stored in UTC- Health Check: http://localhost:3001/api/monitoring/health- **Rates Viewer**: Search, filter, and view current exchange rates

- Historical data retained indefinitely

- Single scheduler instance (no distributed coordination)### API Keys (User-Provided)


- **Historical Charts**: Visualize rate trends using Chart.js

API keys are NOT committed to the repository for security. Add them via the web interface:

4. **Add your API integration**- **Currency Converter**: Real-time currency conversion

1. Navigate to http://localhost:3000/integrations

2. Click "Add Integration"- Navigate to http://localhost:3000/integrations- **Monitoring Dashboard**: System health and usage metrics

3. Choose a provider:

   - **ExchangeRate-API** (recommended, 1,500 free requests/month) - Get key at https://www.exchangerate-api.com/- Click "Add Integration"

   - **Fixer.io** (100 requests/month, EUR base only) - Get key at https://fixer.io/

   - **CurrencyLayer** (100 requests/month, USD base only) - Get key at https://currencylayer.com/- Select provider (e.g., ExchangeRate-API)### Database Schema

   - **Mock Provider** (no API key needed, unlimited, perfect for testing)

4. Enter your API key (encrypted with AES-256-CBC before storage)- Enter your API key- `integrations`: API integration configurations

5. Set priority (1 = highest) and poll interval (e.g., 300 seconds)

- Set priority and polling interval- `rates_latest`: Most recent exchange rates (fast lookups)

**Note:** The `.env` file is gitignored. See `.env.example` for template.

- Save- `rates_history`: Historical rate data for trend analysis

---

- `integration_usage`: API usage tracking and monitoring

## Running Tests

That's it! The scheduler will automatically start fetching rates every 5 minutes.

### Backend Tests

## 📋 Prerequisites

```bash

# Navigate to backend directory---

cd backend

- Docker and Docker Compose

# Install dependencies (if not using Docker)

npm install## 📋 Features- Node.js 18+ (for local development)



# Run all tests- Git

npm test

### Core Functionality

# Run with coverage report

npm run test:coverage✅ **Multi-Provider Support** - Integrate with ExchangeRate-API, Fixer.io, CurrencyLayer, or Mock providers  ## 🚀 Quick Start

```

✅ **Automated Scheduling** - Fetch rates every 5 minutes with priority-based fallback  

**Test Coverage:**

- Integration providers (ExchangeRate-API, Fixer.io, CurrencyLayer, Mock)✅ **Real-Time Conversion** - Convert between 160+ currencies instantly  ### 1. Clone and Setup

- Services (rates, integrations, scheduler, usage tracking)

- Routes (REST API endpoints)✅ **Historical Charts** - Visualize rate trends over 7, 30, or 90 days  

- Utilities (encryption, validation)

✅ **Caching Layer** - Redis cache with in-memory LRU fallback  ```bash

### Frontend Tests

✅ **Health Monitoring** - Dashboard showing provider uptime and performance  # Clone the repository

```bash

# Navigate to frontend directorygit clone <your-repo-url>

cd frontend

### Securitycd assaignment

# Install dependencies (if not using Docker)

npm install🔒 **API Key Encryption** - AES-256-CBC encryption for stored credentials  



# Run tests🔒 **Environment Variables** - Sensitive config never committed  # Copy environment variables

npm test

```🔒 **Input Validation** - All user inputs sanitized  copy .env.example .env



---



## API Endpoints### Architecture# Edit .env and set your encryption key (required)



### Base URL🏗️ **Plugin System** - Easy to add new providers  # APP_DATA_KEY should be a 32-character string

```

http://localhost:3001/api🏗️ **Layered Design** - Routes → Services → Database  ```

```

🏗️ **Docker Compose** - One-command deployment  

### 1. Rates Endpoints

🏗️ **PostgreSQL** - Reliable data persistence  ### 2. Start with Docker Compose

#### Get Latest Rates

```http🏗️ **Redis Cache** - Fast rate lookups  

GET /rates/latest?base=USD

```bash

Response:

{---# Build and start all services

  "success": true,

  "data": {docker-compose up --build

    "base": "USD",

    "timestamp": "2025-10-20T14:00:00Z",## 🏛️ Architecture

    "rates": {

      "EUR": 0.85,# Or run in detached mode

      "GBP": 0.73,

      "JPY": 149.50,```docker-compose up -d --build

      ...

    }┌─────────────────┐```

  }

}│  React Frontend │ (Port 3000)

```

│   Tailwind CSS  │This will start:

#### Convert Currency

```http└────────┬────────┘- **Backend API**: http://localhost:3001

GET /rates/convert?from=USD&to=EUR&amount=100

         │ REST API- **Frontend UI**: http://localhost:3000

Response:

{         ▼- **PostgreSQL**: localhost:5432

  "success": true,

  "data": {┌─────────────────┐- **Redis**: localhost:6379

    "from": "USD",

    "to": "EUR",│ Express Backend │ (Port 3001)

    "amount": 100,

    "result": 85,│  - Scheduler    │### 3. Verify Installation

    "rate": 0.85

  }│  - Integrations │

}

```│  - Services     │1. Open http://localhost:3000 in your browser



#### Get Historical Rates└────────┬────────┘2. Go to "Integrations" and click "Add Integration"

```http

GET /rates/history?base=USD&target=EUR&days=7         │3. Create a test integration using the "Mock Provider"



Response:    ┌────┴─────┐

{

  "success": true,    ▼          ▼### 4. Stop Services

  "data": [

    {┌─────────┐ ┌────────┐

      "base": "USD",

      "target": "EUR",│PostgreSQL│ │ Redis  │```bash

      "rate": 0.85,

      "fetched_at": "2025-10-20T14:00:00Z"│  (5432) │ │ (6379) │docker-compose down

    },

    ...└─────────┘ └────────┘

  ]

}```# To remove volumes (database data):

```

docker-compose down -v

### 2. Integration Management Endpoints

**See detailed documentation in `/docs`:**```

#### List All Integrations

```http- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design and data flows

GET /integrations

- [BACKEND.md](docs/BACKEND.md) - API routes and services## 🛠️ Development Setup

Response:

{- [FRONTEND.md](docs/FRONTEND.md) - React components and pages

  "success": true,

  "data": [- [DATABASE.md](docs/DATABASE.md) - Schema and migrations### Backend Development

    {

      "id": "uuid",- [TESTS.md](docs/TESTS.md) - Testing strategy

      "name": "My ExchangeRate-API",

      "provider": "exchangerate-api",```bash

      "base_url": "https://v6.exchangerate-api.com",

      "priority": 1,---cd backend

      "poll_interval_seconds": 300,

      "active": true,

      "created_at": "2025-10-20T10:00:00Z"

    }## 🔌 API Documentation# Install dependencies

  ]

}npm install

```

### Base URL

#### Add New Integration

```http```# Set up environment variables

POST /integrations

Content-Type: application/jsonhttp://localhost:3001/apicopy ..\.env.example .env



{```

  "name": "My Provider",

  "provider": "exchangerate-api",# Run database migrations

  "baseUrl": "https://v6.exchangerate-api.com",

  "apiKey": "your-api-key-here",### Endpointsnpm run migrate

  "priority": 1,

  "pollIntervalSeconds": 300

}

#### Rates# Start development server (with auto-reload)

Response:

{```httpnpm run dev

  "success": true,

  "data": {GET /rates/latest?base=USD

    "id": "uuid",

    "name": "My Provider",# Response: { base: "USD", rates: { EUR: 0.85, GBP: 0.73, ... } }# Run tests

    ...

  }npm test

}

```GET /rates/convert?from=USD&to=EUR&amount=100



#### Update Integration# Response: { from: "USD", to: "EUR", amount: 100, result: 85, rate: 0.85 }# Run tests with coverage

```http

PATCH /integrations/:idnpm run test:coverage

Content-Type: application/json

GET /rates/history?base=USD&days=7```

{

  "active": false,# Response: [{ date: "2025-10-20", rates: {...} }, ...]

  "priority": 2

}```### Frontend Development

```



#### Delete Integration

```http#### Integrations```bash

DELETE /integrations/:id

``````httpcd frontend



#### Get Supported ProvidersGET    /integrations              # List all providers

```http

GET /integrations/providersPOST   /integrations              # Add new provider# Install dependencies



Response:GET    /integrations/:id          # Get one providernpm install

{

  "success": true,PATCH  /integrations/:id          # Update provider

  "data": [

    {DELETE /integrations/:id          # Remove provider# Start development server

      "name": "exchangerate-api",

      "displayName": "ExchangeRate-API",GET    /integrations/providers    # Supported provider typesnpm start

      "defaultBaseUrl": "https://v6.exchangerate-api.com",

      "freeTierLimit": 1500,```

      "description": "Best free tier with 1,500 requests/month"

    },# Run tests

    ...

  ]#### Monitoringnpm test

}

``````http



### 3. Monitoring EndpointsGET /monitoring/health            # System health check# Build for production



#### System Health CheckGET /monitoring/stats             # Provider statisticsnpm run build

```http

GET /monitoring/healthGET /monitoring/usage             # Conversion logs```



Response:```

{

  "success": true,## 📚 API Documentation

  "data": {

    "database": "connected",---

    "redis": "connected",

    "scheduler": {### Base URL

      "status": "running",

      "lastUpdate": "2025-10-20T14:00:00Z"## 🗄️ Database Schema```

    }

  }http://localhost:3001/api

}

```### Tables```



#### Provider Statistics

```http

GET /monitoring/stats**integrations** - API provider configurations### Integrations Endpoints



Response:```sql

{

  "success": true,- id, name, provider, base_url, api_key (encrypted)#### Get All Integrations

  "data": [

    {- priority, poll_interval_seconds, active```http

      "integration_id": "uuid",

      "name": "My Provider",- created_at, updated_atGET /api/integrations

      "total_requests": 150,

      "successful_requests": 148,```Query Parameters:

      "failed_requests": 2,

      "success_rate": 98.67,  - active: boolean (filter by active status)

      "avg_response_time_ms": 245

    }**rates_latest** - Current exchange rates  - provider: string (filter by provider)

  ]

}```sql

```

- id, base_currency, target_currency, rateResponse:

#### Usage Logs

```http- integration_id, fetched_at{

GET /monitoring/usage?limit=50

```  "success": true,

Response:

{  "data": [

  "success": true,

  "data": [**rates_history** - Historical rates for charting    {

    {

      "integration_id": "uuid",```sql      "id": "uuid",

      "base_currency": "USD",

      "success": true,- Same as rates_latest (append-only)      "name": "My API",

      "response_time_ms": 234,

      "created_at": "2025-10-20T14:00:00Z"```      "provider": "exchangerate-api",

    },

    ...      "base_url": "https://...",

  ]

}**rate_requests** - API call logs      "priority": 100,

```

```sql      "poll_interval_seconds": 300,

---

- id, integration_id, base_currency      "active": true,

## Accessing the Frontend

- success, response_time_ms, error_message      "created_at": "2024-01-01T00:00:00Z",

### Integration Management

- **URL:** http://localhost:3000/integrations```      "updated_at": "2024-01-01T00:00:00Z"

- **Purpose:** Add, edit, delete, and monitor exchange rate providers

- **Features:**    }

  - Add new API integrations with encrypted key storage

  - Set provider priority for fallback chain**conversions** - User conversion tracking  ],

  - Configure polling intervals

  - Toggle integrations active/inactive```sql  "count": 1

  - View provider status and health

- id, from_currency, to_currency, amount}

### Rate Viewing

- **URL:** http://localhost:3000/ (Dashboard)- result, rate_used, created_at```

- **Purpose:** View latest exchange rates

- **Features:**```

  - Real-time rate display for 160+ currencies

  - Select base currency (USD, EUR, GBP, JPY)#### Create Integration

  - Search and filter currencies

  - Auto-refresh every 30 seconds---```http



### Currency ConverterPOST /api/integrations

- **URL:** http://localhost:3000/convert

- **Purpose:** Convert amounts between currencies## ⚙️ Environment VariablesContent-Type: application/json

- **Features:**

  - Input amount and select currencies

  - Instant conversion

  - Swap currencies button### Required Variables{

  - View current exchange rate

  "name": "My Exchange Rate API",

### Historical Charts

- **URL:** http://localhost:3000/historyCreate a `.env` file in the root directory (or use docker-compose defaults):  "provider": "exchangerate-api",

- **Purpose:** Visualize rate trends over time

- **Features:**  "base_url": "https://v6.exchangerate-api.com",

  - Interactive line charts

  - Date range selector (7, 30, 90 days)```env  "api_key": "your-api-key",

  - Min/Max/Average statistics

  - Period change percentage# Database  "priority": 100,

  - Hover for exact values

DATABASE_HOST=postgres  "poll_interval_seconds": 300,

### Monitoring Dashboard

- **URL:** http://localhost:3000/monitoringDATABASE_PORT=5432  "active": true

- **Purpose:** System health and performance metrics

- **Features:**DATABASE_NAME=currency_exchange}

  - Provider uptime and success rates

  - API call logsDATABASE_USER=postgres

  - Response time graphs

  - Error trackingDATABASE_PASSWORD=your-secure-passwordResponse: 201 Created

  - Scheduler status

{

---

# Redis  "success": true,

## Design Decisions

REDIS_HOST=redis  "data": { /* integration object */ },

### 1. Plugin-Based Architecture

- **Decision:** Factory pattern for exchange rate providersREDIS_PORT=6379  "message": "Integration created successfully"

- **Rationale:** Easy to add new providers without modifying core code. Each provider encapsulates its own API logic.

- **Trade-off:** Slightly more complex than hardcoding, but much more maintainable.}



### 2. Automated Scheduler# Security```

- **Decision:** Built-in Node.js scheduler instead of external cron

- **Rationale:** Platform-independent, easier to debug, can be triggered via APIAPP_DATA_KEY=your-32-character-encryption-key

- **Trade-off:** Runs in application process (not ideal for distributed systems, but fine for single-instance deployment)

#### Update Integration

### 3. Priority-Based Fallback

- **Decision:** Try providers in priority order until one succeeds# Server```http

- **Rationale:** Handles API outages gracefully, maximizes uptime

- **Trade-off:** Slower when primary provider fails (waits for timeout), but ensures data availabilityPORT=3001PUT /api/integrations/:id



### 4. Redis Cache with In-Memory FallbackNODE_ENV=productionContent-Type: application/json

- **Decision:** Two-tier caching (Redis → LRU in-memory)

- **Rationale:** Fast lookups (sub-millisecond), graceful degradation if Redis fails```

- **Trade-off:** Memory usage for cache, cache invalidation complexity

{

### 5. Separate Latest/History Tables

- **Decision:** `rates_latest` for current rates, `rates_history` for time-series data**Note:** The `.env` file is gitignored. See `.env.example` for template.  "name": "Updated Name",

- **Rationale:** `rates_latest` stays small (fast queries), `rates_history` optimized for range scans

- **Trade-off:** Data duplication, but significant performance gain  "priority": 50,



### 6. API Key Encryption---  "active": false

- **Decision:** AES-256-CBC encryption for stored API keys

- **Rationale:** Database compromise doesn't leak keys, follows security best practices}

- **Trade-off:** Decryption overhead on every API call (negligible ~1ms)

## 🧪 Testing```

### 7. Docker Compose for Deployment

- **Decision:** Multi-container orchestration with docker-compose

- **Rationale:** One-command setup, consistent environments, easy for evaluators

- **Trade-off:** Not production-ready (use Kubernetes for scale), but perfect for development/demo### Backend Tests#### Delete Integration (Soft Delete)



### 8. No Real API Keys Committed```http

- **Decision:** `.env` file gitignored, demo credentials in docker-compose

- **Rationale:** Security best practice, prevents API key leakage```bashDELETE /api/integrations/:id

- **Trade-off:** Evaluators must add their own keys (but this demonstrates the integration feature)

cd backend

---

npm installResponse: 200 OK

## Assumptions

npm test                    # Run all tests{

1. **Currency Codes:** ISO 4217 standard (3-letter codes like USD, EUR, GBP)

2. **Rate Precision:** Stored as NUMERIC(20,10) for high precision financial calculationsnpm run test:coverage       # Generate coverage report  "success": true,

3. **Polling Interval:** Minimum 60 seconds to respect free tier rate limits

4. **Base Currencies:** Scheduler fetches USD, EUR, GBP, JPY (configurable in code)```  "message": "Integration deactivated successfully"

5. **Historical Data:** Kept indefinitely (production systems would archive/delete old data)

6. **Time Zone:** All timestamps stored as UTC (TIMESTAMPTZ in PostgreSQL)}

7. **Concurrent Requests:** Single scheduler instance (scale with leader election in production)

8. **Provider Availability:** At least one active provider with valid API key for live data**Test Coverage:**```



---- Integration providers (ExchangeRate-API, Fixer, CurrencyLayer, Mock)



## Troubleshooting- Services (rates, integrations, scheduler, usage)#### Get Integration Usage



### Services Not Starting- Routes (REST endpoints)```http

```bash

# Check container status- Utilities (encryption, validation)GET /api/integrations/:id/usage?days=30

docker-compose ps



# View logs

docker-compose logs backend### Frontend TestsResponse:

docker-compose logs frontend

{

# Restart services

docker-compose restart```bash  "success": true,

```

cd frontend  "data": {

### No Rates Displaying

1. Check if scheduler is running: `curl http://localhost:3001/api/monitoring/health`npm install    "today": {

2. Verify integration is active with valid API key

3. Wait 5 minutes for first scheduler runnpm test                    # Run React tests      "calls_made": 10,

4. Check backend logs: `docker-compose logs backend`

```      "calls_limit": 1500,

### Database Connection Failed

```bash      "calls_remaining": 1490

# Verify PostgreSQL is running

docker ps | grep postgres---    },



# Check password matches in docker-compose.yml and backend environment    "history": [...]

```

## 🔧 Development  }

---

}

## License

### Local Development (Without Docker)```

This project is created for educational purposes as part of a technical assessment.



#### 1. Start PostgreSQL & Redis### Rates Endpoints

```bash

docker run -d --name postgres-db -e POSTGRES_PASSWORD=admin123 -p 5432:5432 postgres:18-alpine#### Get Latest Rates

docker run -d --name redis-cache -p 6379:6379 redis:7-alpine```http

```GET /api/rates

Query Parameters:

#### 2. Backend  - base: string (e.g., USD)

```bash  - target: string (e.g., EUR)

cd backend  - q: string (search query)

npm install

export DATABASE_PASSWORD=admin123Response:

export APP_DATA_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6{

npm run dev  "success": true,

```  "data": [

    {

#### 3. Frontend      "pair": "USD-EUR",

```bash      "base": "USD",

cd frontend      "target": "EUR",

npm install      "rate": "0.92",

npm start      "fetched_at": "2024-01-01T00:00:00Z",

```      "source_integration_id": "uuid"

    }

### Adding a New Provider  ],

  "count": 1

1. Create new class in `backend/src/integrations/YourProvider.js`}

2. Extend `BaseIntegration` class```

3. Implement `fetchLatestRates(baseCurrency)` method

4. Register in `backend/src/integrations/index.js`#### Get Historical Rates

5. Add to `SUPPORTED_PROVIDERS` array```http

GET /api/rates/history?base=USD&target=EUR&start=2024-01-01&end=2024-01-31

Example:

```javascriptResponse:

import BaseIntegration from './BaseIntegration.js';{

  "success": true,

class YourProvider extends BaseIntegration {  "data": [

  async fetchLatestRates(baseCurrency) {    {

    const response = await this.makeRequest(      "id": "uuid",

      `${this.baseUrl}/latest?base=${baseCurrency}&apikey=${this.apiKey}`      "base": "USD",

    );      "target": "EUR",

    return {      "rate": "0.92",

      base: baseCurrency,      "fetched_at": "2024-01-01T00:00:00Z"

      timestamp: new Date().toISOString(),    }

      rates: response.data.rates  ],

    };  "count": 30

  }}

}```

```

### Conversion Endpoint

---

#### Convert Currency

## 📊 Supported Providers```http

GET /api/convert?from=USD&to=EUR&amount=100

| Provider | Free Tier | Base Currencies | API Key Required |

|----------|-----------|-----------------|------------------|Response:

| **ExchangeRate-API** | 1,500 req/month | All | ✅ Yes |{

| **Fixer.io** | 100 req/month | EUR only | ✅ Yes |  "success": true,

| **CurrencyLayer** | 100 req/month | USD only | ✅ Yes |  "data": {

| **Mock** | Unlimited | All | ❌ No |    "from": "USD",

    "to": "EUR",

**Recommendation:** ExchangeRate-API offers the best free tier with no credit card required.    "amount": 100,

    "result": 92.00,

---    "rate": 0.92,

    "timestamp": "2024-01-01T00:00:00Z"

## 🚀 Deployment  }

}

### Using Docker Compose (Production)```



```bash### Monitoring Endpoints

# Build and start all services

docker-compose up -d --build#### Health Check

```http

# View logsGET /api/monitoring/health

docker-compose logs -f

Response:

# Stop all services{

docker-compose down  "success": true,

  "data": {

# Stop and remove volumes (reset database)    "status": "healthy",

docker-compose down -v    "scheduler": {

```      "running": true,

      "activeJobs": 2

### Manual Deployment    },

    "redis": "connected",

1. **Build Frontend**    "uptime": 3600

```bash  }

cd frontend}

npm run build```

# Serve the /build folder with nginx or serve

```#### Get Aggregated Usage

```http

2. **Run Backend**GET /api/monitoring/usage?days=7

```bash

cd backendResponse:

npm install --production{

export NODE_ENV=production  "success": true,

export DATABASE_PASSWORD=your-password  "data": [

export APP_DATA_KEY=your-32-char-key    {

npm start      "id": "uuid",

```      "name": "My API",

      "provider": "exchangerate-api",

---      "active": true,

      "total_calls": 150,

## 🛠️ Troubleshooting      "last_error": null

    }

### Scheduler Not Running  ]

- Check `/api/monitoring/health` - scheduler status should be "running"}

- Verify at least one integration is active with valid API key```

- Check backend logs: `docker-compose logs backend`

## 🔒 Security

### No Rates Showing

- Ensure scheduler has run (wait 5 minutes after adding integration)### API Key Encryption

- Check provider health: `/api/monitoring/stats`API keys are encrypted using AES-256-CBC before storage:

- Verify API key is correct (test manually with curl)- Encryption key is set via `APP_DATA_KEY` environment variable

- Each encrypted value includes a unique initialization vector (IV)

### Database Connection Failed- Keys are decrypted only when needed for API calls

- Verify PostgreSQL is running: `docker ps | grep postgres`

- Check DATABASE_PASSWORD matches in docker-compose.yml and .env### Best Practices

- Run migrations manually: `cd backend && npm run migrate`- Never commit real API keys to version control

- Use strong, unique `APP_DATA_KEY` in production

### Redis Connection Issues- Use HTTPS in production (configure reverse proxy/load balancer)

- Check Redis is running: `docker ps | grep redis`- Regularly rotate API keys

- App will fallback to in-memory cache automatically- Monitor usage metrics for anomalies

- No data loss, only performance impact

## 🧪 Testing

---

### Backend Tests

## 📦 Project Structure```bash

cd backend

```npm test

assaignment/

├── backend/# With coverage report

│   ├── src/npm run test:coverage

│   │   ├── config/          # Database, Redis, encryption```

│   │   ├── integrations/    # Provider plugins

│   │   ├── middleware/      # Error handlingTest coverage includes:

│   │   ├── routes/          # API endpoints- Integration modules (mock external APIs)

│   │   ├── services/        # Business logic- Encryption utilities

│   │   └── utils/           # Helpers- Validation functions

│   ├── migrations/          # Database schema- API endpoints (integration tests planned)

│   ├── tests/               # Jest tests

│   └── package.json### Frontend Tests

├── frontend/```bash

│   ├── src/cd frontend

│   │   ├── components/      # Reusable UInpm test -- --coverage --watchAll=false

│   │   ├── pages/           # Routes```

│   │   └── services/        # API client

│   └── package.json### CI/CD

├── docs/                    # DocumentationGitHub Actions workflow (`.github/workflows/ci.yml`) automatically:

├── docker-compose.yml       # Multi-container setup- Runs backend and frontend tests

├── .env.example            # Environment template- Generates coverage reports

└── README.md               # This file- Builds Docker images on main branch

```

## 📦 Docker Deployment

---

### Production Build

## 🎯 Design Decisions```bash

# Build images

### Why PostgreSQL?docker-compose build

- ACID compliance for financial data

- Excellent performance for complex queries# Run in production mode

- Native JSON support for flexible rate storagedocker-compose up -d

```

### Why Redis Cache?

- Sub-millisecond response times### Environment Variables

- Built-in TTL (auto-expire old data)Key environment variables for production:

- Graceful fallback to in-memory cache

```env

### Why Plugin Architecture?NODE_ENV=production

- Easy to add new providers without touching core codeAPP_DATA_KEY=<your-secure-32-char-key>

- Each provider encapsulates its own API logicDATABASE_HOST=postgres

- Factory pattern for clean instantiationDATABASE_PASSWORD=<secure-password>

REDIS_HOST=redis

### Why Separate Latest/History Tables?REACT_APP_API_URL=https://your-api-domain.com

- Latest table stays small (only current rates)```

- History table optimized for time-series queries

- Better index performance on both## 🔧 Configuration


