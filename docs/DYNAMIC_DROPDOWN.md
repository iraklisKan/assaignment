# Dynamic Base Currency Dropdown

## Overview

The "Latest Rates" page now has a **smart dropdown** that shows only the currencies you've configured in `BASE_CURRENCIES`. This gives you a better user experience by showing only the currencies that have direct rate data.

## How It Works

### Backend
- New endpoint: `GET /api/rates/base-currencies`
- Returns the list of currencies from `BASE_CURRENCIES` environment variable
- If set to "ALL", returns all available currencies from database
- Defaults to `['USD', 'EUR', 'GBP', 'JPY']` if not configured

### Frontend
- **Base Currency Dropdown** (Latest Rates): Shows only configured base currencies
- **Converter Dropdowns** (From/To): Shows all 160+ currencies for maximum flexibility

## Examples

### Configuration 1: Default (4 Currencies)
```env
BASE_CURRENCIES=USD,EUR,GBP,JPY
```

**Result:**
- Base currency dropdown shows: USD, EUR, GBP, JPY
- Converter dropdowns show: All 160+ currencies
- You can view rates for 4 bases directly
- You can convert between any currency pair

### Configuration 2: Top 10 Currencies
```env
BASE_CURRENCIES=USD,EUR,GBP,JPY,CNY,AUD,CAD,CHF,HKD,NZD
```

**Result:**
- Base currency dropdown shows: 10 currencies
- More options for viewing direct rates
- Still convert between all pairs

### Configuration 3: Custom Selection
```env
BASE_CURRENCIES=USD,EUR,THB,SGD
```

**Result:**
- Base currency dropdown shows: USD, EUR, THB, SGD
- Perfect for regional focus (e.g., Southeast Asia)
- Converter works for all currencies

### Configuration 4: All Currencies
```env
BASE_CURRENCIES=ALL
```

**Result:**
- Base currency dropdown shows: All 160+ currencies
- View direct rates for any currency
- ⚠️ Warning: Very high API usage!

## Testing Different Configurations

### Step 1: Update Configuration
Edit `.env` file:
```env
BASE_CURRENCIES=USD,EUR,GBP,JPY,CNY,AUD
```

### Step 2: Rebuild Backend
```bash
docker-compose up -d --build backend
```

### Step 3: Verify API Response
```bash
curl "http://localhost:3001/api/rates/base-currencies"
```

Expected output:
```json
{
  "success": true,
  "baseCurrencies": ["USD", "EUR", "GBP", "JPY", "CNY", "AUD"]
}
```

### Step 4: Check Frontend
1. Open http://localhost:3000
2. Look at the "Latest Rates" card
3. Click the "Base:" dropdown
4. Should show only the 6 configured currencies

## Benefits

### 1. **Better UX**
- Users only see currencies that have direct data
- No confusion about which currencies work as base
- Dropdown is cleaner with fewer options

### 2. **Transparency**
- What you configure is what users see
- Clear relationship between backend config and frontend UI
- Easy to understand what's available

### 3. **Flexibility**
- Change configuration without code changes
- Different deployments can have different currency sets
- Easy to test with different configurations

### 4. **Performance**
- Smaller dropdown = faster rendering
- Less scrolling for users
- More focused experience

## API Comparison

### Old Behavior
```
Base Currency Dropdown: All 160+ currencies
Problem: Users could select currencies with no direct data
Result: Empty rates table, confusing experience
```

### New Behavior
```
Base Currency Dropdown: Only configured currencies (4 by default)
Benefit: Every selection shows rates
Result: Better user experience, no empty states
```

### Converter (Unchanged)
```
From/To Dropdowns: All 160+ currencies
Reason: Cross-rate conversion works for all pairs
Result: Maximum flexibility for conversions
```

## Technical Details

### API Endpoint
```http
GET /api/rates/base-currencies
```

**Response:**
```json
{
  "success": true,
  "baseCurrencies": ["USD", "EUR", "GBP", "JPY"]
}
```

### Service Method
```javascript
export async function getConfiguredBaseCurrencies() {
  let baseCurrencies = ['USD', 'EUR', 'GBP', 'JPY']; // Default
  
  if (process.env.BASE_CURRENCIES) {
    const envValue = process.env.BASE_CURRENCIES.trim().toUpperCase();
    
    if (envValue === 'ALL') {
      return await getAvailableCurrencies();
    } else {
      baseCurrencies = envValue.split(',').map(c => c.trim()).filter(c => c.length > 0);
    }
  }
  
  return baseCurrencies;
}
```

### Frontend Integration
```javascript
// Fetch configured base currencies
const baseCurrenciesResponse = await axios.get(`${API_BASE}/api/rates/base-currencies`);
const configuredBases = baseCurrenciesResponse.data.baseCurrencies || [];
setBaseCurrencies(configuredBases);

// Use in dropdown
<Select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)}>
  {baseCurrencies.map((currency) => (
    <option key={currency} value={currency}>{currency}</option>
  ))}
</Select>
```

## Troubleshooting

### Dropdown shows wrong currencies
1. Check environment variable:
   ```bash
   docker-compose exec backend printenv BASE_CURRENCIES
   ```
2. Verify API response:
   ```bash
   curl "http://localhost:3001/api/rates/base-currencies"
   ```
3. Clear browser cache and reload

### Dropdown is empty
1. Check if backend is running
2. Check browser console for errors
3. Verify API is accessible: `curl http://localhost:3001/api/rates/base-currencies`

### Want to add more currencies
1. Edit `.env`: `BASE_CURRENCIES=USD,EUR,GBP,JPY,CNY,AUD`
2. Rebuild: `docker-compose up -d --build backend`
3. Refresh frontend: Ctrl+F5

## See Also

- [CONFIGURATION.md](CONFIGURATION.md) - Full configuration guide
- [BACKEND.md](BACKEND.md) - API documentation
- [FRONTEND.md](FRONTEND.md) - UI components guide
