# Currency Exchange Rate Hub# Currency Exchange Rate Hub



A full-stack web application for managing and monitoring real-time currency exchange rates from multiple providers with automated scheduling, caching, and fallback mechanisms.A full-stack application for aggregating, caching, and managing exchange rates from multiple external APIs. Built with Express.js, React, PostgreSQL, and Redis.



## 🚀 Quick Start## 🎯 Overview



### PrerequisitesThis system provides:

- Docker & Docker Compose- **Multi-provider integration**: Connect to multiple exchange rate APIs with automatic failover

- Node.js 18+ (for local development)- **Intelligent caching**: Redis-based caching with in-memory LRU fallback

- Git- **Scheduled polling**: Configurable per-integration rate fetching

- **REST API**: Complete endpoints for integration management, rates, conversion, and monitoring

### Setup (Using Docker - Recommended)- **Admin UI**: React-based interface for CRUD operations and data visualization

- **Secure**: API keys encrypted at rest using AES-256-CBC

1. **Clone the repository**- **Scalable**: Stateless architecture ready for horizontal scaling

```bash

git clone https://github.com/iraklisKan/assaignment.git## 🏗️ Architecture

cd assaignment

```### Backend (Node.js + Express)

- **Plugin-based integrations**: Each external API implements a common interface

2. **Start all services**- **Scheduler service**: Polls integrations based on configurable intervals

```bash- **Database layer**: PostgreSQL for persistent storage

docker-compose up -d- **Cache layer**: Redis (with in-memory fallback) for latest rates

```- **Encryption**: API keys encrypted before database storage

- **Error handling**: Comprehensive error handling and logging

3. **Access the application**

- Frontend: http://localhost:3000### Frontend (React)

- Backend API: http://localhost:3001- **Integrations Management**: CRUD operations for external API configurations

- Health Check: http://localhost:3001/api/monitoring/health- **Rates Viewer**: Search, filter, and view current exchange rates

- **Historical Charts**: Visualize rate trends using Chart.js

4. **Add your API integration**- **Currency Converter**: Real-time currency conversion

- Navigate to http://localhost:3000/integrations- **Monitoring Dashboard**: System health and usage metrics

- Click "Add Integration"

- Select provider (e.g., ExchangeRate-API)### Database Schema

- Enter your API key- `integrations`: API integration configurations

- Set priority and polling interval- `rates_latest`: Most recent exchange rates (fast lookups)

- Save- `rates_history`: Historical rate data for trend analysis

- `integration_usage`: API usage tracking and monitoring

That's it! The scheduler will automatically start fetching rates every 5 minutes.

## 📋 Prerequisites

---

- Docker and Docker Compose

## 📋 Features- Node.js 18+ (for local development)

- Git

### Core Functionality

✅ **Multi-Provider Support** - Integrate with ExchangeRate-API, Fixer.io, CurrencyLayer, or Mock providers  ## 🚀 Quick Start

✅ **Automated Scheduling** - Fetch rates every 5 minutes with priority-based fallback  

✅ **Real-Time Conversion** - Convert between 160+ currencies instantly  ### 1. Clone and Setup

✅ **Historical Charts** - Visualize rate trends over 7, 30, or 90 days  

✅ **Caching Layer** - Redis cache with in-memory LRU fallback  ```bash

✅ **Health Monitoring** - Dashboard showing provider uptime and performance  # Clone the repository

git clone <your-repo-url>

### Securitycd assaignment

🔒 **API Key Encryption** - AES-256-CBC encryption for stored credentials  

🔒 **Environment Variables** - Sensitive config never committed  # Copy environment variables

🔒 **Input Validation** - All user inputs sanitized  copy .env.example .env



### Architecture# Edit .env and set your encryption key (required)

🏗️ **Plugin System** - Easy to add new providers  # APP_DATA_KEY should be a 32-character string

🏗️ **Layered Design** - Routes → Services → Database  ```

🏗️ **Docker Compose** - One-command deployment  

🏗️ **PostgreSQL** - Reliable data persistence  ### 2. Start with Docker Compose

🏗️ **Redis Cache** - Fast rate lookups  

```bash

---# Build and start all services

docker-compose up --build

## 🏛️ Architecture

# Or run in detached mode

```docker-compose up -d --build

┌─────────────────┐```

│  React Frontend │ (Port 3000)

│   Tailwind CSS  │This will start:

└────────┬────────┘- **Backend API**: http://localhost:3001

         │ REST API- **Frontend UI**: http://localhost:3000

         ▼- **PostgreSQL**: localhost:5432

┌─────────────────┐- **Redis**: localhost:6379

│ Express Backend │ (Port 3001)

│  - Scheduler    │### 3. Verify Installation

│  - Integrations │

│  - Services     │1. Open http://localhost:3000 in your browser

└────────┬────────┘2. Go to "Integrations" and click "Add Integration"

         │3. Create a test integration using the "Mock Provider"

    ┌────┴─────┐

    ▼          ▼### 4. Stop Services

┌─────────┐ ┌────────┐

│PostgreSQL│ │ Redis  │```bash

│  (5432) │ │ (6379) │docker-compose down

└─────────┘ └────────┘

```# To remove volumes (database data):

docker-compose down -v

**See detailed documentation in `/docs`:**```

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design and data flows

- [BACKEND.md](docs/BACKEND.md) - API routes and services## 🛠️ Development Setup

- [FRONTEND.md](docs/FRONTEND.md) - React components and pages

- [DATABASE.md](docs/DATABASE.md) - Schema and migrations### Backend Development

- [TESTS.md](docs/TESTS.md) - Testing strategy

```bash

---cd backend



## 🔌 API Documentation# Install dependencies

npm install

### Base URL

```# Set up environment variables

http://localhost:3001/apicopy ..\.env.example .env

```

# Run database migrations

### Endpointsnpm run migrate



#### Rates# Start development server (with auto-reload)

```httpnpm run dev

GET /rates/latest?base=USD

# Response: { base: "USD", rates: { EUR: 0.85, GBP: 0.73, ... } }# Run tests

npm test

GET /rates/convert?from=USD&to=EUR&amount=100

# Response: { from: "USD", to: "EUR", amount: 100, result: 85, rate: 0.85 }# Run tests with coverage

npm run test:coverage

GET /rates/history?base=USD&days=7```

# Response: [{ date: "2025-10-20", rates: {...} }, ...]

```### Frontend Development



#### Integrations```bash

```httpcd frontend

GET    /integrations              # List all providers

POST   /integrations              # Add new provider# Install dependencies

GET    /integrations/:id          # Get one providernpm install

PATCH  /integrations/:id          # Update provider

DELETE /integrations/:id          # Remove provider# Start development server

GET    /integrations/providers    # Supported provider typesnpm start

```

# Run tests

#### Monitoringnpm test

```http

GET /monitoring/health            # System health check# Build for production

GET /monitoring/stats             # Provider statisticsnpm run build

GET /monitoring/usage             # Conversion logs```

```

## 📚 API Documentation

---

### Base URL

## 🗄️ Database Schema```

http://localhost:3001/api

### Tables```



**integrations** - API provider configurations### Integrations Endpoints

```sql

- id, name, provider, base_url, api_key (encrypted)#### Get All Integrations

- priority, poll_interval_seconds, active```http

- created_at, updated_atGET /api/integrations

```Query Parameters:

  - active: boolean (filter by active status)

**rates_latest** - Current exchange rates  - provider: string (filter by provider)

```sql

- id, base_currency, target_currency, rateResponse:

- integration_id, fetched_at{

```  "success": true,

  "data": [

**rates_history** - Historical rates for charting    {

```sql      "id": "uuid",

- Same as rates_latest (append-only)      "name": "My API",

```      "provider": "exchangerate-api",

      "base_url": "https://...",

**rate_requests** - API call logs      "priority": 100,

```sql      "poll_interval_seconds": 300,

- id, integration_id, base_currency      "active": true,

- success, response_time_ms, error_message      "created_at": "2024-01-01T00:00:00Z",

```      "updated_at": "2024-01-01T00:00:00Z"

    }

**conversions** - User conversion tracking  ],

```sql  "count": 1

- id, from_currency, to_currency, amount}

- result, rate_used, created_at```

```

#### Create Integration

---```http

POST /api/integrations

## ⚙️ Environment VariablesContent-Type: application/json



### Required Variables{

  "name": "My Exchange Rate API",

Create a `.env` file in the root directory (or use docker-compose defaults):  "provider": "exchangerate-api",

  "base_url": "https://v6.exchangerate-api.com",

```env  "api_key": "your-api-key",

# Database  "priority": 100,

DATABASE_HOST=postgres  "poll_interval_seconds": 300,

DATABASE_PORT=5432  "active": true

DATABASE_NAME=currency_exchange}

DATABASE_USER=postgres

DATABASE_PASSWORD=your-secure-passwordResponse: 201 Created

{

# Redis  "success": true,

REDIS_HOST=redis  "data": { /* integration object */ },

REDIS_PORT=6379  "message": "Integration created successfully"

}

# Security```

APP_DATA_KEY=your-32-character-encryption-key

#### Update Integration

# Server```http

PORT=3001PUT /api/integrations/:id

NODE_ENV=productionContent-Type: application/json

```

{

**Note:** The `.env` file is gitignored. See `.env.example` for template.  "name": "Updated Name",

  "priority": 50,

---  "active": false

}

## 🧪 Testing```



### Backend Tests#### Delete Integration (Soft Delete)

```http

```bashDELETE /api/integrations/:id

cd backend

npm installResponse: 200 OK

npm test                    # Run all tests{

npm run test:coverage       # Generate coverage report  "success": true,

```  "message": "Integration deactivated successfully"

}

**Test Coverage:**```

- Integration providers (ExchangeRate-API, Fixer, CurrencyLayer, Mock)

- Services (rates, integrations, scheduler, usage)#### Get Integration Usage

- Routes (REST endpoints)```http

- Utilities (encryption, validation)GET /api/integrations/:id/usage?days=30



### Frontend TestsResponse:

{

```bash  "success": true,

cd frontend  "data": {

npm install    "today": {

npm test                    # Run React tests      "calls_made": 10,

```      "calls_limit": 1500,

      "calls_remaining": 1490

---    },

    "history": [...]

## 🔧 Development  }

}

### Local Development (Without Docker)```



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



---### Integration Polling

Configure per-integration in the UI or via API:

## 📝 License- `poll_interval_seconds`: 60-3600 seconds

- Default: 300 seconds (5 minutes)

This project is created for educational purposes as part of a technical assessment.

### Priority & Failover

---- Lower priority number = higher priority

- On failure, automatically tries next priority integration

## 👥 Contributing- Configurable retry with exponential backoff



This is an assignment project, but suggestions are welcome:### Supported Providers

1. **ExchangeRate-API** (1,500 req/month free)

1. Fork the repository2. **Fixer.io** (100 req/month free, EUR base only)

2. Create a feature branch (`git checkout -b feature/amazing-feature`)3. **CurrencyLayer** (100 req/month free, USD base only)

3. Commit your changes (`git commit -m 'Add amazing feature'`)4. **Mock Provider** (testing only)

4. Push to the branch (`git push origin feature/amazing-feature`)

5. Open a Pull Request## 📊 Monitoring & Alerting



---### Built-in Monitoring

- System health endpoint

## 🆘 Support- Scheduler status

- Per-integration usage metrics

For issues or questions:- Error tracking

- Check the [documentation](docs/)

- Review API logs: `docker-compose logs backend`### Alert Stub

- Test health endpoint: `curl http://localhost:3001/api/monitoring/health`The system logs warnings when integration usage exceeds 90% of limits. In production, configure this to send alerts to:

- Email notifications

---- Slack webhooks

- PagerDuty

**Built with ❤️ using Node.js, React, PostgreSQL, and Redis**- Custom monitoring services


Example implementation location: `backend/src/services/scheduler.js` (line ~150)

## 🐛 Troubleshooting

### Redis Connection Issues
If Redis is unavailable, the system automatically falls back to in-memory LRU cache:
```
Redis unavailable, using in-memory cache fallback
```

### Database Migration Errors
```bash
# Manually run migrations
docker-compose exec backend npm run migrate

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Integration Fetch Failures
1. Check integration is active
2. Verify API key is correct
3. Check base_url is valid
4. Review usage limits
5. Check logs: `docker-compose logs backend`

## 📈 Performance Considerations

### Caching Strategy
- Latest rates cached in Redis (1-hour TTL)
- Historical data queries hit database
- In-memory fallback for Redis downtime

### Scaling
- Backend is stateless (safe to run multiple instances)
- Database connection pooling (max 20 connections)
- Consider read replicas for heavy read workloads
- Use Redis cluster for high availability

## 🎓 Design Decisions

### Why Plugin Architecture?
- Easy to add new provider integrations
- Common interface ensures consistency
- Retry logic and error handling abstracted

### Why Both Redis and Database?
- Redis: Ultra-fast reads for latest rates
- PostgreSQL: Persistent storage and historical analysis
- In-memory fallback ensures availability

### Why Soft Delete?
- Preserves historical data integrity
- Allows recovery of accidentally deleted integrations
- Maintains foreign key relationships

## 📝 Development Roadmap

### Completed
✅ Multi-provider integration system
✅ Scheduler with configurable polling
✅ Redis caching with fallback
✅ REST API with full CRUD
✅ React admin UI
✅ Docker containerization
✅ CI/CD pipeline
✅ API key encryption
✅ Basic testing suite

### Future Enhancements
- [ ] WebSocket support for real-time rate updates
- [ ] Advanced alerting (email, Slack, PagerDuty)
- [ ] Rate calculation with multiple providers (averaging)
- [ ] API rate limiting
- [ ] User authentication and role-based access
- [ ] More integration providers
- [ ] Enhanced monitoring dashboard
- [ ] Export rates to CSV/Excel

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API logs: `docker-compose logs -f backend`

## 🎉 Acknowledgments

Built as part of a technical assessment demonstrating:
- Full-stack development skills
- System architecture and design
- DevOps and containerization
- Testing and CI/CD practices
- Documentation and code quality

---

**Happy Rate Hunting! 💱**
