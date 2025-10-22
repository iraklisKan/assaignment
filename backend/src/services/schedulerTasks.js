import { createIntegration } from '../integrations/index.js';
import { updateLatestRate, saveRateHistory } from './ratesService.js';
import { recordUsage, recordError, logRequest } from './usageService.js';
import { query } from '../config/database.js';

/**
 * Scheduler Tasks
 * Individual task functions used by the scheduler
 */

/**
 * Get all available currencies from the database
 */
export async function getAllAvailableCurrencies() {
  try {
    // Get unique currencies from rates_latest table
    const result = await query(`
      SELECT DISTINCT base AS currency FROM rates_latest
      UNION
      SELECT DISTINCT target AS currency FROM rates_latest
      ORDER BY currency
    `);
    
    const currencies = result.rows.map(row => row.currency);
    
    if (currencies.length === 0) {
      console.warn('No currencies found in database, falling back to default list');
      return ['USD', 'EUR', 'GBP', 'JPY'];
    }
    
    return currencies;
  } catch (error) {
    console.error('Error fetching currencies from database:', error.message);
    return ['USD', 'EUR', 'GBP', 'JPY']; // Fallback
  }
}

/**
 * Get list of base currencies to fetch (from env or default)
 */
export async function getBaseCurrenciesToFetch() {
  let baseCurrencies = ['USD', 'EUR', 'GBP', 'JPY']; // Default
  
  if (process.env.BASE_CURRENCIES) {
    const envValue = process.env.BASE_CURRENCIES.trim().toUpperCase();
    
    if (envValue === 'ALL') {
      // Fetch ALL available currencies as base
      console.log('⚠️  Fetching ALL currencies as base - high API usage!');
      baseCurrencies = await getAllAvailableCurrencies();
    } else {
      // Parse comma-separated list
      baseCurrencies = envValue.split(',').map(c => c.trim()).filter(c => c.length > 0);
    }
  }
  
  return baseCurrencies;
}

/**
 * Fetch rates for a single base currency from an integration
 */
export async function fetchRatesForBase(integration, integrationConfig, baseCurrency) {
  const requestStartTime = Date.now();
  
  try {
    // Fetch rates (with retry logic built into integration)
    const rateData = await integration.fetchLatestRates({ base: baseCurrency });
    const responseTime = Date.now() - requestStartTime;
    
    // Log successful request
    await logRequest(integrationConfig.id, baseCurrency, true, responseTime);
    
    if (!rateData || !rateData.rates) {
      console.warn(`Invalid rate data received for base ${baseCurrency}`);
      return { success: false, updatedCount: 0 };
    }

    // Store rates
    const { base, rates } = rateData;
    let updatedCount = 0;

    for (const [targetCurrency, rate] of Object.entries(rates)) {
      if (base === targetCurrency) continue; // Skip same currency
      
      try {
        // Update latest rate and cache
        await updateLatestRate(base, targetCurrency, rate, integrationConfig.id);
        
        // Save to history
        await saveRateHistory(base, targetCurrency, rate, integrationConfig.id);
        
        updatedCount++;
      } catch (error) {
        console.error(`Error storing rate ${base}-${targetCurrency}:`, error.message);
      }
    }

    console.log(`  ✓ Stored ${updatedCount} rates for base ${baseCurrency} (${responseTime}ms)`);
    return { success: true, updatedCount, responseTime };

  } catch (error) {
    const responseTime = Date.now() - requestStartTime;
    
    // Log failed request
    await logRequest(integrationConfig.id, baseCurrency, false, responseTime, error.message);
    
    console.error(`  ✗ Error fetching ${baseCurrency} rates:`, error.message);
    return { success: false, updatedCount: 0, error: error.message };
  }
}

/**
 * Check usage metrics and warn if approaching limits
 */
export async function checkAndWarnUsage(integration, integrationConfig, apiCallsMade) {
  try {
    const metrics = await integration.getUsageMetrics();
    await recordUsage(integrationConfig.id, apiCallsMade, metrics);

    // Alert if usage is high
    if (metrics.callsRemaining !== null && metrics.limit !== null) {
      const usagePercent = ((metrics.limit - metrics.callsRemaining) / metrics.limit) * 100;
      if (usagePercent >= 90) {
        console.warn(`⚠ Alert: ${integrationConfig.name} usage at ${usagePercent.toFixed(1)}%`);
        // In production, emit to monitoring/alerting system
      }
    }
  } catch (error) {
    console.warn('Failed to check usage metrics:', error.message);
  }
}

/**
 * Main task: Fetch and store rates for an integration
 */
export async function fetchAndStoreRates(integrationConfig) {
  const startTime = Date.now();
  console.log(`Fetching rates from ${integrationConfig.name}...`);

  try {
    // Get base currencies to fetch
    const baseCurrencies = await getBaseCurrenciesToFetch();
    console.log(`  Base currencies: ${baseCurrencies.join(', ')} (${baseCurrencies.length} total)`);

    // Create integration instance
    const integration = createIntegration(integrationConfig);
    let totalUpdatedCount = 0;

    // Fetch rates for each base currency
    for (const baseCurrency of baseCurrencies) {
      const result = await fetchRatesForBase(integration, integrationConfig, baseCurrency);
      totalUpdatedCount += result.updatedCount;
    }

    // Check usage metrics
    await checkAndWarnUsage(integration, integrationConfig, baseCurrencies.length);

    const duration = Date.now() - startTime;
    console.log(`✓ Fetched ${totalUpdatedCount} total rates from ${integrationConfig.name} in ${duration}ms`);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`✗ Error fetching from ${integrationConfig.name} after ${duration}ms:`, error.message);
    
    // Record error
    await recordError(integrationConfig.id, error.message);
  }
}

export default {
  getAllAvailableCurrencies,
  getBaseCurrenciesToFetch,
  fetchRatesForBase,
  checkAndWarnUsage,
  fetchAndStoreRates
};
