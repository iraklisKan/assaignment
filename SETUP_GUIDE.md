# 🚀 Setup Guide for New Developers

This guide helps anyone clone and run this project from scratch.

## Prerequisites

Before you start, ensure you have:
- **Git** installed
- **Docker Desktop** installed and running (easiest option)
- OR (if not using Docker):
  - Node.js 18 or higher
  - PostgreSQL 18
  - Redis 7 (optional)

## Step-by-Step Setup

### Option 1: Docker Setup (Recommended) ⭐

This is the **easiest and fastest** way to get the project running.

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd assaignment
```

#### 2. Create Environment File

Copy the example environment file:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

#### 3. Configure Your Environment

Open `.env` file and **MUST change**:

```env
# ⚠️ REQUIRED: Change this to a secure 32-character key
APP_DATA_KEY=your-32-character-encryption-key-here-change-this
```

**Generate a secure key:**

```bash
# Windows (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Linux/Mac
openssl rand -base64 32 | cut -c1-32
```

**Optional - Add External API Keys** (for real data):

```env
# Get free API keys from:
# - https://exchangerate-api.com (free tier available)
# - https://fixer.io (free tier available)
# - https://currencylayer.com (free tier available)

EXCHANGERATE_API_KEY=your_api_key_here
FIXER_API_KEY=your_api_key_here
CURRENCYLAYER_API_KEY=your_api_key_here
```

**Without API keys**, the system will use **mock data** for testing.

#### 4. Start Everything with Docker

```bash
docker-compose up --build
```

Wait for all services to start (about 2-3 minutes first time).

You'll see:
```
✓ Database migrations completed
✓ Server running on port 3001
✓ Starting rate scheduler...
```

#### 5. Access the Application

- **Frontend (Web UI)**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/monitoring/health

#### 6. Stop the Application

Press `Ctrl+C` in the terminal, then:

```bash
docker-compose down
```

To **remove all data** (reset database):

```bash
docker-compose down -v
```

---

### Option 2: Manual Setup (Without Docker)

If you can't use Docker, follow these steps:

#### 1. Install PostgreSQL

Download and install PostgreSQL 18 from https://www.postgresql.org/download/

Create a database:

```sql
CREATE DATABASE currency_exchange;
CREATE USER postgres WITH PASSWORD 'postgres123';
GRANT ALL PRIVILEGES ON DATABASE currency_exchange TO postgres;
```

#### 2. Install Redis (Optional)

**Windows**: Download from https://github.com/microsoftarchive/redis/releases
**Linux**: `sudo apt-get install redis-server`
**Mac**: `brew install redis`

Start Redis:
```bash
redis-server
```

*Note: If you skip Redis, the system uses an in-memory LRU cache.*

#### 3. Clone and Setup Backend

```bash
git clone <repository-url>
cd assaignment

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials and APP_DATA_KEY

# Install backend dependencies
cd backend
npm install

# Run database migrations
node migrations/run.js

# Start backend server
npm start
```

Backend will run on http://localhost:3001

#### 4. Setup Frontend (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on http://localhost:3000

---

## 🧪 Verify Installation

### 1. Check System Health

Visit: http://localhost:3001/api/monitoring/health

You should see:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "scheduler": { "running": true, "activeJobs": 1 },
    "redis": "connected"
  }
}
```

### 2. Check Frontend

Visit: http://localhost:3000

You should see:
- **Rates** page with exchange rates
- **Integrations** page to manage API providers
- **Monitoring** page with system stats

### 3. Add an Integration (If You Have API Keys)

1. Go to **Integrations** page
2. Click **Add Integration**
3. Fill in the form:
   - Name: "My ExchangeRate API"
   - Provider: ExchangeRate-API
   - API Key: (your key)
   - Poll Interval: 60 seconds
4. Click **Create Integration**

The scheduler will automatically start fetching rates!

---

## 🔧 Troubleshooting

### Problem: Port Already in Use

**Error**: `Port 3000/3001 is already in use`

**Solution (Windows PowerShell)**:
```powershell
# Kill process on port 3001
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Kill process on port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**Solution (Linux/Mac)**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Problem: Database Connection Failed

**Error**: `Connection to database failed`

**Check**:
1. PostgreSQL is running
2. Database credentials in `.env` are correct
3. Database `currency_exchange` exists

### Problem: APP_DATA_KEY Error

**Error**: `APP_DATA_KEY must be 32 characters`

**Solution**: Generate a proper 32-character key (see step 3 above)

### Problem: Docker Build Fails

**Error**: `npm ci can only install packages when package.json and package-lock.json are in sync`

**Solution**:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Problem: No Rates Showing

**Possible Causes**:
1. No integrations added → Add one via Integrations page
2. Invalid API key → Check your API key is correct
3. Scheduler not running → Check http://localhost:3001/api/monitoring/health

---

## 📁 Project Structure Overview

```
assaignment/
├── backend/              # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── config/       # Database & Redis setup
│   │   ├── integrations/ # External API providers (ExchangeRate-API, Fixer, etc.)
│   │   ├── middleware/   # Error handling, validation
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic (rates, integrations, scheduling)
│   │   └── utils/        # Encryption, validation helpers
│   ├── migrations/       # Database schema and seed data
│   └── tests/            # Backend tests
│
├── frontend/             # Frontend (React + Tailwind CSS)
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── ui/       # Reusable UI components (Button, Card, etc.)
│   │   │   ├── rates/    # Rate-specific components
│   │   │   └── ...       # Navigation, Footer, Forms
│   │   ├── pages/        # Main pages (Rates, Integrations, Monitoring)
│   │   └── services/     # API client (axios)
│   └── public/
│
├── docs/                 # Detailed documentation
├── docker-compose.yml    # Docker orchestration (4 services)
├── .env.example          # Environment template
└── README.md             # Project overview
```

---

## 🎯 Next Steps

Once the project is running:

1. **Read the Documentation**: Check `docs/` folder for detailed guides
2. **Run Tests**: `cd backend && npm test` / `cd frontend && npm test`
3. **Explore the API**: Use the Monitoring page or tools like Postman
4. **Add Integrations**: Configure real API providers for live data
5. **Customize**: Modify the code to fit your needs

---

## 🆘 Need Help?

- Check the `docs/` folder for detailed documentation
- Review `README.md` for feature overview
- Open an issue on GitHub
- Contact the project maintainer

---

## ✅ Quick Checklist

Before sharing this project with someone, ensure:

- [x] `.env.example` file exists with all required variables
- [x] `README.md` is up to date
- [x] `docker-compose.yml` is properly configured
- [x] All dependencies are listed in `package.json`
- [x] Database migrations are in `backend/migrations/`
- [x] `.gitignore` excludes sensitive files (`.env`, `node_modules/`)
- [x] Documentation is in `docs/` folder

**Your project is ready to share!** 🚀
