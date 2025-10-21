# Configuration Guide

## Environment Variables

### Required Variables

All required environment variables are pre-configured in `docker-compose.yml` for easy deployment. For local development or custom deployments, create a `.env` file in the root directory.

### Database Configuration

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=currency_exchange
DATABASE_USER=postgres
DATABASE_PASSWORD=admin123
```

### Redis Configuration

```env
REDIS_HOST=redis
REDIS_PORT=6379
```

### Security

```env
# 32-character encryption key for API key encryption (AES-256-CBC)
APP_DATA_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Important:** Use a strong, unique key in production. Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').substring(0, 32))"
```

### Rate Scheduler Configuration

```env
# Comma-separated list of base currencies to fetch rates for
BASE_CURRENCIES=USD,EUR,GBP,JPY
```

#### Configuration Options

**Default (Recommended for Free Tier):**
```env
BASE_CURRENCIES=USD,EUR,GBP,JPY
```
- **API Calls:** ~35,000/month at 5-minute intervals
- **Coverage:** Direct rates for 4 base currencies + cross-rate conversion for all others
- **Use Case:** Best for free API tier (ExchangeRate-API: 1,500/month, requires using one integration)

**Top 10 Most Traded Currencies:**
```env
BASE_CURRENCIES=USD,EUR,GBP,JPY,CNY,AUD,CAD,CHF,HKD,NZD
```
- **API Calls:** ~86,000/month
- **Coverage:** Direct rates for top 10 currencies
- **Use Case:** Medium usage with paid API plan

**Top 20 Global Currencies:**
```env
BASE_CURRENCIES=USD,EUR,GBP,JPY,CNY,AUD,CAD,CHF,HKD,NZD,SGD,SEK,NOK,KRW,TRY,INR,RUB,BRL,ZAR,MXN
```
- **API Calls:** ~172,000/month
- **Coverage:** Direct rates for 20 most important currencies
- **Use Case:** Higher usage with paid API plan

**All Currencies (Advanced):**
```env
BASE_CURRENCIES=ALL
```
- **API Calls:** ~1.4 million/month (160+ currencies)
- **Coverage:** Direct rates for every supported currency
- **Use Case:** Premium API plan with high limits
- **Warning:** Requires substantial API quota! Monitor usage carefully.

#### API Call Calculation

Number of calls per month = `BASE_CURRENCIES × (60/5) × 24 × 30`

Where:
- `BASE_CURRENCIES` = number of currencies to fetch
- `60/5` = 12 calls per hour (every 5 minutes)
- `24` = hours per day
- `30` = days per month

Example for 4 currencies: `4 × 12 × 24 × 30 = 34,560 calls/month`

#### How It Works

1. **Scheduler Fetches Base Currencies:**
   - The scheduler fetches rates FROM each base currency TO all other currencies
   - Each API call returns ~160 exchange rates
   - Example: Fetching "USD" returns USD→EUR, USD→GBP, USD→JPY, USD→THB, etc.

2. **Cross-Rate Conversion:**
   - For currencies not fetched as base, the system calculates cross-rates
   - Example: To convert THB→EUR:
     - Try direct pair: THB→EUR (not available)
     - Try cross-rate via USD: (1 / USD→THB) × USD→EUR
     - Try cross-rate via EUR, GBP, JPY if USD fails

3. **Result:**
   - All 160+ currency pairs work, even with only 4 base currencies
   - Adding more base currencies improves direct rate availability and reduces calculation overhead

### Server Configuration

```env
NODE_ENV=production
PORT=3001
```

### Frontend Configuration

```env
REACT_APP_API_URL=http://localhost:3001
```

For production, set this to your actual API domain:
```env
REACT_APP_API_URL=https://api.yourdomain.com
```

## Docker Compose Configuration

The `docker-compose.yml` file automatically loads environment variables from the host or uses sensible defaults:

```yaml
environment:
  BASE_CURRENCIES: ${BASE_CURRENCIES:-USD,EUR,GBP,JPY}
```

This means:
- If `BASE_CURRENCIES` is set in your `.env` file, it will be used
- Otherwise, defaults to `USD,EUR,GBP,JPY`

## Integration Configuration

Each integration can be configured with:

- **Name**: Friendly identifier
- **Provider**: One of: `exchangerate-api`, `fixer`, `currencylayer`, `mock`
- **Base URL**: API endpoint
- **API Key**: Encrypted before storage
- **Priority**: Lower number = higher priority (1 is highest)
- **Poll Interval**: Seconds between rate fetches (minimum 60)
- **Active**: Enable/disable without deleting

### Adding Integrations

1. Navigate to http://localhost:3000/integrations
2. Click "Add Integration"
3. Fill in the form:
   - Choose provider from dropdown
   - Enter your API key (get from provider's website)
   - Set priority (1 = primary, higher = backup)
   - Set poll interval (300 seconds = 5 minutes recommended)
4. Click "Save"

The API key is immediately encrypted using AES-256-CBC and never stored in plain text.

## Monitoring API Usage

To avoid exceeding API limits:

1. **Check Current Usage:**
   - Visit http://localhost:3000/monitoring
   - View "Provider Statistics" for call counts

2. **Monitor Logs:**
   ```bash
   docker-compose logs backend | grep "API calls remaining"
   ```

3. **API Call Calculation:**
   - Calls per hour: `BASE_CURRENCIES count / (poll_interval_seconds / 60)`
   - Example: 4 currencies at 300s interval = 4 × (60/5) = 48 calls/hour

4. **Adjust Configuration:**
   - Reduce BASE_CURRENCIES count
   - Increase poll_interval_seconds
   - Deactivate unused integrations

## Security Best Practices

1. **Never commit `.env` files** with real credentials
2. **Use strong APP_DATA_KEY** (32 random characters)
3. **Rotate API keys** regularly
4. **Use HTTPS** in production
5. **Monitor logs** for suspicious activity
6. **Limit database access** to application only
7. **Keep dependencies updated** (run `npm audit`)

## Production Deployment Checklist

- [ ] Set strong `APP_DATA_KEY`
- [ ] Set strong `DATABASE_PASSWORD`
- [ ] Configure `REACT_APP_API_URL` to production domain
- [ ] Enable HTTPS (use nginx/traefik reverse proxy)
- [ ] Set up automated backups (PostgreSQL + Redis)
- [ ] Configure monitoring/alerting
- [ ] Review and adjust `BASE_CURRENCIES` based on API plan
- [ ] Set appropriate `poll_interval_seconds` for each integration
- [ ] Test failover between integrations
- [ ] Document which team members have API keys

## Troubleshooting

### Scheduler not fetching rates

1. Check `BASE_CURRENCIES` is set correctly:
   ```bash
   docker-compose exec backend printenv BASE_CURRENCIES
   ```

2. View scheduler logs:
   ```bash
   docker-compose logs backend | grep "Fetching rates"
   ```

3. Verify integrations are active:
   ```bash
   curl http://localhost:3001/api/integrations
   ```

### High API usage

1. Reduce number of base currencies
2. Increase poll interval
3. Disable unnecessary integrations

### Missing rates for specific currencies

This is normal if the currency is not in `BASE_CURRENCIES`. The system will use cross-rate conversion instead, which works but may be slightly less accurate.

To add direct support for a currency, add it to `BASE_CURRENCIES`:
```env
BASE_CURRENCIES=USD,EUR,GBP,JPY,THB,CHF
```
