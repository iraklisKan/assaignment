# Testing Documentation

## Overview
Jest test suite covering backend services, routes, and frontend components.

---

## Test Structure

### Backend Tests (`backend/tests/`)

**9 test files:**

1. **integrations/BaseIntegration.test.js**
   - Tests retry logic (3 attempts with backoff)
   - Health check validation
   - Template pattern enforcement
   - Mock provider responses

2. **integrations/ExchangeRateAPI.test.js**
   - API request formatting
   - Response normalization
   - Error handling (invalid API key, network timeout)

3. **integrations/FixerIO.test.js**
   - EUR-only base currency restriction
   - API key parameter placement
   - Rate conversion accuracy

4. **integrations/CurrencyLayer.test.js**
   - USD-only base currency restriction
   - Currency code transformation (USDEUR → EUR)
   - Quirky format handling

5. **services/integrationService.test.js**
   - CRUD operations on integrations table
   - API key encryption/decryption
   - Priority ordering
   - Health check integration

6. **services/ratesService.test.js**
   - Fetch latest rates (cache hit/miss)
   - Currency conversion calculations
   - Cache TTL expiration

7. **services/scheduler.test.js**
   - Provider failover (priority-based)
   - Multi-currency fetching (USD, EUR, GBP, JPY)
   - Rate archival to history table
   - Error logging

8. **routes/rates.test.js**
   - GET /latest endpoint
   - GET /convert endpoint
   - Query parameter validation
   - Error responses (404, 400)

9. **utils/encryption.test.js** ✅ **Passing (10 tests)**
   - Encrypts API keys correctly
   - Decrypts to original value
   - Different inputs = different ciphertext
   - Handles special characters
   - 32-character key requirement

---

### Frontend Test (`frontend/src/`)

**App.test.js**
- Renders without crashing
- Navbar displays correctly
- Routing works (Home, Convert, History)

**Note:** Minimal frontend tests. Could expand with React Testing Library.

---

## Running Tests

### Backend Tests
```bash
cd backend
npm test                  # Run all tests
npm test -- encryption    # Run one test file
npm run test:coverage     # Generate coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                  # Run React tests
npm test -- --coverage    # With coverage
```

---

## Test Results

### ✅ Passing Tests
- **encryption.test.js** - 10/10 tests passing
  - `encrypt()` produces ciphertext
  - `decrypt()` returns original value
  - Re-encrypting same input gives different output (IV randomization)
  - Handles empty strings, special chars, long strings
  - Key must be exactly 32 characters

### ⚠️ Failing Tests
- **validation.test.js** - Import error
  - Issue: `validateAmount` function not found
  - Fix needed: Check `utils/validation.js` exports

---

## Coverage Goals

**Current Coverage:** Not generated yet

**Target Coverage:**
- **Services:** 80%+ (core business logic)
- **Routes:** 70%+ (endpoint testing)
- **Integrations:** 60%+ (provider implementations)
- **Utils:** 90%+ (pure functions, easy to test)

---

## Test Patterns

### 1. **Unit Tests** - Single function/class
```javascript
describe('CurrencyLayer', () => {
  it('transforms USDEUR to EUR', () => {
    const result = transformCurrency('USDEUR')
    expect(result).toBe('EUR')
  })
})
```

### 2. **Integration Tests** - Multiple components
```javascript
describe('Rates Service', () => {
  it('fetches from DB if cache misses', async () => {
    mockRedis.get.mockResolvedValue(null) // Cache miss
    mockDB.query.mockResolvedValue([{ rate: 1.23 }])
    
    const rate = await ratesService.getRate('USD', 'EUR')
    
    expect(mockDB.query).toHaveBeenCalled()
    expect(rate).toBe(1.23)
  })
})
```

### 3. **End-to-End Tests** - API requests
```javascript
describe('GET /api/rates/latest', () => {
  it('returns rates for USD', async () => {
    const res = await request(app)
      .get('/api/rates/latest?base=USD')
      .expect(200)
    
    expect(res.body.base).toBe('USD')
    expect(res.body.rates).toHaveProperty('EUR')
  })
})
```

---

## Mocking Strategy

### Database
```javascript
jest.mock('../config/database', () => ({
  query: jest.fn()
}))
```

### Redis
```javascript
jest.mock('../config/redis', () => ({
  get: jest.fn(),
  set: jest.fn()
}))
```

### External APIs
```javascript
jest.mock('axios')
axios.get.mockResolvedValue({ data: { rates: { EUR: 0.85 } } })
```

**Why mock?**
- Tests run fast (no real API calls)
- No test data in production DB
- Predictable results

---

## Test Data

### Sample Integration Config
```javascript
const mockIntegration = {
  id: 1,
  name: 'Test Provider',
  provider: 'mock',
  base_url: 'http://localhost',
  api_key: 'encrypted_key',
  priority: 1,
  poll_interval_seconds: 60,
  active: true
}
```

### Sample Rates Response
```javascript
const mockRates = {
  base: 'USD',
  timestamp: '2025-10-20T12:00:00Z',
  rates: {
    EUR: 0.85,
    GBP: 0.73,
    JPY: 149.50
  }
}
```

---

## CI/CD Integration (Not Yet Implemented)

**Future GitHub Actions workflow:**
```yaml
- name: Run Backend Tests
  run: cd backend && npm test

- name: Run Frontend Tests
  run: cd frontend && npm test

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

## Known Issues

1. **validation.test.js failing** - Import error for `validateAmount`
2. **No frontend component tests** - Only App.test.js exists
3. **Coverage not generated** - Need to run `npm run test:coverage`
4. **No E2E tests** - Could add Cypress/Playwright

---

## Testing Best Practices

### ✅ Do:
- Test edge cases (empty strings, null, very large numbers)
- Mock external dependencies
- Use descriptive test names (`it('returns 404 if currency not found')`)
- Clean up after tests (reset mocks, clear DB)

### ❌ Don't:
- Test implementation details (test behavior, not internals)
- Make real API calls in tests
- Share state between tests (each test isolated)
- Hardcode current dates (use freezed time)

---

## Extending Tests

### Add Provider Test
```javascript
describe('NewProvider', () => {
  it('fetches rates correctly', async () => {
    const provider = new NewProvider(config)
    const rates = await provider.fetchLatestRates('USD')
    expect(rates).toHaveProperty('EUR')
  })
})
```

### Add Route Test
```javascript
describe('POST /api/integrations', () => {
  it('creates new integration', async () => {
    const res = await request(app)
      .post('/api/integrations')
      .send({ name: 'Test', provider: 'mock' })
      .expect(201)
    
    expect(res.body.id).toBeDefined()
  })
})
```

---

## Test Commands Reference

```bash
# Backend
npm test                      # Run all tests
npm test -- --watch          # Watch mode
npm test -- --verbose        # Detailed output
npm run test:coverage        # Coverage report

# Frontend
npm test                     # Run React tests
npm test -- --watchAll       # Watch mode
npm test -- --coverage       # Coverage report
```
