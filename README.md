# Currency Exchange Rate System

A full-stack web application for managing and monitoring real-time currency exchange rates from multiple providers (ExchangeRate-API, Fixer.io, CurrencyLayer).

## 🚀 Features

- **Multi-Provider Integration**: Support for multiple exchange rate API providers with automatic failover
- **Real-time Rate Fetching**: Automated scheduler fetches rates at configurable intervals
- **Historical Data**: Track and visualize exchange rate trends over time
- **Currency Conversion**: Convert between currencies with direct and cross-rate calculations
- **Monitoring Dashboard**: View API usage, request statistics, and system health
- **Redis Caching**: Fast rate lookups with LRU fallback for development
- **Encrypted API Keys**: Secure storage of API credentials
- **Responsive UI**: Mobile-friendly interface built with React and Tailwind CSS

## 📋 Prerequisites

- **Docker** and **Docker Compose** (recommended for easy setup)
- OR manually:
  - Node.js 18+
  - PostgreSQL 18
  - Redis 7 (optional, LRU cache fallback available)

## 🔧 Quick Start with Docker

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd assaignment
```

### 2. Configure Environment Variables

Copy the example environment file and update with your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required: Change this to a secure 32-character key
APP_DATA_KEY=your-32-character-encryption-key-here-change-this

# Optional: Add your API keys for external providers
EXCHANGERATE_API_KEY=your_exchangerate_api_key_here
FIXER_API_KEY=your_fixer_api_key_here
CURRENCYLAYER_API_KEY=your_currencylayer_api_key_here
```

**Important**: 
- The `APP_DATA_KEY` must be exactly 32 characters for encryption
- Without external API keys, the system will use mock data

### 3. Start the Application

```bash
docker-compose up --build
```

This will start:
- **PostgreSQL** (port 5432)
- **Redis** (port 6379)
- **Backend API** (port 3001)
- **Frontend** (port 3000)

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/monitoring/health

### 5. Stop the Application

```bash
docker-compose down
```

To remove all data (database, volumes):

```bash
docker-compose down -v
```

## 🛠️ Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp ../.env.example ../.env
# Edit .env with your settings

# Run database migrations
node migrations/run.js

# Start the server
npm start
```

Backend runs on: http://localhost:3001

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: http://localhost:3000

## 📚 Project Structure

```
assaignment/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/       # Database & Redis configuration
│   │   ├── integrations/ # External API providers
│   │   ├── middleware/   # Error handling & validation
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   ├── migrations/       # Database schema & seeds
│   └── tests/            # Backend tests
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components & UI library
│   │   ├── pages/        # Page components
│   │   └── services/     # API client
│   └── public/
├── docs/                 # Documentation
├── docker-compose.yml    # Docker orchestration
└── .env.example          # Environment template
```

## 🔌 API Endpoints

### Rates
- `GET /api/rates/currencies` - Get available currencies
- `GET /api/rates` - Get latest exchange rates
- `GET /api/rates/history` - Get historical rates

### Conversion
- `GET /api/convert?from=USD&to=EUR&amount=100` - Convert currency

### Integrations
- `GET /api/integrations` - List all integrations
- `POST /api/integrations` - Create new integration
- `PUT /api/integrations/:id` - Update integration
- `DELETE /api/integrations/:id` - Deactivate integration

### Monitoring
- `GET /api/monitoring/health` - System health check
- `GET /api/monitoring/usage` - API usage statistics
- `GET /api/monitoring/requests` - Recent API requests
- `GET /api/monitoring/conversions` - Recent conversions

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🔐 Security

- API keys are encrypted before storage using AES-256-CBC
- Environment variables for sensitive configuration
- Input validation on all endpoints
- SQL injection protection via parameterized queries
- CORS enabled for frontend origin

## 📖 Documentation

Detailed documentation available in the `docs/` directory:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Backend Documentation](docs/BACKEND.md)
- [Frontend Documentation](docs/FRONTEND.md)
- [Database Schema](docs/DATABASE.md)
- [Configuration Guide](docs/CONFIGURATION.md)
- [Testing Guide](docs/TESTS.md)

## 🌟 Key Technologies

### Backend
- Node.js 18 with ES6 modules
- Express.js
- PostgreSQL 18
- Redis 7
- node-cron (scheduler)
- pg (PostgreSQL driver)
- crypto (encryption)

### Frontend
- React 18
- React Router 6
- Tailwind CSS 3
- Chart.js (rate visualization)
- react-hook-form (form management)
- Axios (HTTP client)

### DevOps
- Docker & Docker Compose
- Multi-stage builds
- Nginx (frontend serving)

## 🐛 Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are already in use:

**Windows (PowerShell)**:
```powershell
# Kill process on port 3001
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**Linux/Mac**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Connection Issues

Ensure PostgreSQL is running and credentials in `.env` match your setup.

### Redis Connection Failed

The system will automatically fall back to an in-memory LRU cache if Redis is unavailable.

### Docker Build Issues

If you encounter npm lock file sync issues:

```bash
# Rebuild without cache
docker-compose build --no-cache
docker-compose up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- ExchangeRate-API for providing free tier API access
- Fixer.io and CurrencyLayer for exchange rate data
- Chart.js for visualization components
