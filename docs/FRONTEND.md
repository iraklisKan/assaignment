# Frontend Architecture

## Overview
React 18 single-page app with Tailwind CSS, charting, and real-time monitoring.

---

## Tech Stack
- **React 18.3.1** - Component framework
- **React Router 6.26.2** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Historical rate charts
- **Axios** - API calls to backend

---

## Pages (`src/pages/`)

### 1. **Home.jsx** - Dashboard
- Shows latest exchange rates in a table
- Select base currency dropdown (USD, EUR, GBP, JPY)
- Real-time rate display from `GET /api/rates/latest`
- Quick conversion calculator

**Key Features:**
- Auto-refreshes rates every 30 seconds
- Color-coded rate changes (green = up, red = down)
- Mobile-responsive table

---

### 2. **Convert.jsx** - Currency Converter
- User inputs amount, from-currency, to-currency
- Calls `GET /api/rates/convert?from=USD&to=EUR&amount=100`
- Shows result and current rate used
- Swap button to reverse currencies

**Why separate page?**
- Focus on conversion without distractions
- Shows conversion history log
- Better UX for mobile users

---

### 3. **History.jsx** - Rate Trends
- Chart.js line graph showing rate changes over time
- Date range selector (7 days, 30 days, 90 days)
- Fetches from `GET /api/rates/history?base=USD&days=7`
- Compare multiple currencies on one chart

**Chart Features:**
- Interactive tooltips (hover to see exact rate)
- Zoom and pan
- Export chart as image

---

### 4. **Integrations.jsx** - Manage Providers
- CRUD interface for API providers
- Add new integration form:
  - Name (e.g., "My ExchangeRate-API")
  - Provider type dropdown
  - Base URL
  - API key (encrypted on save)
  - Priority (1 = first to try)
  - Poll interval (seconds)
- Edit/delete existing integrations
- Toggle active/inactive

**Security:**
- API keys shown as `••••••••` (never plaintext)
- Only encrypted values sent to backend

---

### 5. **Monitoring.jsx** - System Dashboard
- Provider health status (✅ healthy, ⚠️ degraded, ❌ down)
- Success rate charts per provider
- Average response time graphs
- Recent API call logs from `rate_requests` table
- Scheduler status (running, last update time)

**Metrics:**
- Uptime percentage (last 24 hours)
- Request count per provider
- Error breakdown (timeouts, invalid responses, rate limits)

---

## Components (`src/components/`)

### **Navbar.jsx**
- Top navigation with logo
- Links to all pages
- Active page highlighted
- Mobile hamburger menu

### **RateCard.jsx**
- Reusable card showing single currency rate
- Props: `from`, `to`, `rate`, `timestamp`
- Color-coded change indicator

### **LoadingSpinner.jsx**
- Animated spinner for async operations
- Shows during API calls

### **ErrorBoundary.jsx**
- Catches React errors globally
- Shows friendly error page instead of crash

---

## Services (`src/services/`)

### **api.js**
Centralized API client with Axios.

```javascript
export const getRates = (base = 'USD') => 
  axios.get(`/api/rates/latest?base=${base}`)

export const convertCurrency = (from, to, amount) => 
  axios.get(`/api/rates/convert?from=${from}&to=${to}&amount=${amount}`)

export const getIntegrations = () => 
  axios.get('/api/integrations')

// ... more endpoints
```

**Why centralize?**
- Single source of truth for API URLs
- Easy to add auth headers later
- Consistent error handling

---

## Routing (`App.jsx`)

```javascript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/convert" element={<Convert />} />
  <Route path="/history" element={<History />} />
  <Route path="/integrations" element={<Integrations />} />
  <Route path="/monitoring" element={<Monitoring />} />
</Routes>
```

**Navigation:**
- `/` - Dashboard (default)
- `/convert` - Conversion tool
- `/history` - Rate charts
- `/integrations` - Provider management
- `/monitoring` - System health

---

## State Management

**Local state (useState):**
- Form inputs
- Loading states
- UI toggles

**No Redux needed because:**
- App is small (5 pages)
- No complex shared state
- API calls are page-specific

**Future consideration:** Add Context API if user authentication needed.

---

## Styling Approach

**Tailwind CSS utility classes:**
```jsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
  <h2 className="text-2xl font-bold text-gray-800">Latest Rates</h2>
</div>
```

**Responsive design:**
- Mobile-first (sm:, md:, lg: breakpoints)
- Hamburger menu on small screens
- Stacked cards on mobile, grid on desktop

**Dark mode:** Not implemented yet (could add with Tailwind's `dark:` classes)

---

## Error Handling

**API errors:**
```javascript
try {
  const rates = await getRates('USD')
} catch (error) {
  setError('Failed to load rates. Check your connection.')
  console.error(error)
}
```

**User feedback:**
- Toast notifications for success/error
- Loading spinners during API calls
- Graceful degradation (show cached data if API fails)

---

## Performance Optimizations

1. **Lazy loading:** Could add `React.lazy()` for code splitting
2. **Memoization:** Use `useMemo` for expensive calculations
3. **Debouncing:** User input delayed before API call
4. **Caching:** Store recent rates in localStorage

---

## Key Design Decisions

**Why React Router?**
- Multi-page feel without full reloads
- Shareable URLs (e.g., `/convert?from=USD&to=EUR`)
- Browser back button works

**Why Tailwind?**
- Fast development (no CSS files to manage)
- Consistent design system
- Tree-shaking removes unused styles

**Why Chart.js?**
- Simple API for line/bar charts
- Responsive out of the box
- Good documentation

**Why single API file?**
- Backend URL changes in one place
- Easier to mock for tests
- Type safety (could add TypeScript later)
