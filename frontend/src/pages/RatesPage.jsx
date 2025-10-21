import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, Input, Button, Select, Alert, LoadingSpinner, EmptyState } from '../components/ui/index.jsx';
import RateChart from '../components/RateChart.jsx';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function RatesPage() {
  // Use all available currencies from the backend (fetched dynamically)
  const [currencies, setCurrencies] = useState([]);
  const [baseCurrencies, setBaseCurrencies] = useState([]); // Configured base currencies
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Conversion calculator state
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [converting, setConverting] = useState(false);
  
  // Chart state
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  // Fetch available currencies on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        // Fetch all currencies for the converter dropdowns
        const currenciesResponse = await axios.get(`${API_BASE}/api/rates/currencies`);
        setCurrencies(currenciesResponse.data.currencies || []);
        
        // Fetch configured base currencies for the base currency dropdown
        const baseCurrenciesResponse = await axios.get(`${API_BASE}/api/rates/base-currencies`);
        const configuredBases = baseCurrenciesResponse.data.baseCurrencies || [];
        setBaseCurrencies(configuredBases);
        
        // Set initial defaults if currencies are available
        if (currenciesResponse.data.currencies?.length > 0) {
          const codes = currenciesResponse.data.currencies;
          if (codes.includes('USD')) {
            setBaseCurrency('USD');
            setFromCurrency('USD');
          } else if (configuredBases.length > 0) {
            // If USD not available, use first configured base currency
            setBaseCurrency(configuredBases[0]);
            setFromCurrency(configuredBases[0]);
          }
          if (codes.includes('EUR')) setToCurrency('EUR');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || 'Failed to fetch currencies';
        console.error('Failed to fetch currencies:', errorMsg);
        // Fallback to defaults if API fails
        setBaseCurrencies(['USD', 'EUR', 'GBP', 'JPY']);
      }
    };

    fetchCurrencies();
  }, []);

  // Fetch latest rates for selected base currency
  const fetchRates = useCallback(async () => {
    if (!baseCurrency) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE}/api/rates/latest`, {
        params: { base: baseCurrency }
      });
      
      // console.log('API response:', response.data); // keeping for debugging
      
      // The API returns an array of rate objects
      const ratesData = response.data.data || [];
      const ratesArray = ratesData.map(item => ({
        currency: item.target,
        rate: parseFloat(item.rate)
      }));
      
      setRates(ratesArray);
    } catch (err) {
      setError(err.message || 'Failed to fetch exchange rates');
    } finally {
      setLoading(false);
    }
  }, [baseCurrency]);

  // Auto-fetch rates when base currency changes
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Handle currency conversion
  const handleConvert = async () => {
    if (!fromCurrency || !toCurrency || !amount) return;
    
    setConverting(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE}/api/convert`, {
        params: {
          from: fromCurrency,
          to: toCurrency,
          amount: parseFloat(amount)
        }
      });
      
      setConvertedAmount(response.data.data?.result || null);
    } catch (err) {
      setError(err.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  // Fetch historical data for chart
  const handleShowChart = async (currency) => {
    setChartLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE}/api/rates/history`, {
        params: {
          base: baseCurrency,
          target: currency,
          days: 30 // Last 30 days
        }
      });
      
      if (response.data.data && response.data.data.length > 0) {
        setChartData({
          currencyPair: `${baseCurrency}/${currency}`,
          history: response.data.data
        });
        setShowChart(true);
      } else {
        setError('No historical data available for this currency pair');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch historical data');
    } finally {
      setChartLoading(false);
    }
  };

  // Swap currencies in converter
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exchange Rates</h1>
        <p className="mt-2 text-gray-600">
          View latest exchange rates and convert between currencies
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currency Converter */}
        <Card className="lg:col-span-1">
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Currency Converter</h2>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <Select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwapCurrencies}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  aria-label="Swap currencies"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <Select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
              </div>

              <Button
                onClick={handleConvert}
                disabled={converting || !amount}
                className="w-full"
              >
                {converting ? 'Converting...' : 'Convert'}
              </Button>

              {convertedAmount !== null && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">
                    {amount} {fromCurrency} =
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {typeof convertedAmount === 'number' ? convertedAmount.toFixed(2) : 'N/A'} {toCurrency}
                  </div>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Latest Rates Table */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Latest Rates</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Base:
                </label>
                <Select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-24"
                >
                  {baseCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
                <Button
                  onClick={fetchRates}
                  disabled={loading}
                  size="sm"
                  variant="secondary"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : rates.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="No rates available"
                description="Select a base currency to view exchange rates"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exchange Rate
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rates.map((item) => (
                      <tr key={item.currency} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {item.currency.slice(0, 2)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {item.currency}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {item.rate ? item.rate.toFixed(6) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            1 {baseCurrency} = {item.rate ? item.rate.toFixed(2) : 'N/A'} {item.currency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button
                            onClick={() => handleShowChart(item.currency)}
                            disabled={chartLoading}
                            size="sm"
                            variant="ghost"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            History
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Historical Chart Modal */}
      {showChart && chartData && (
        <RateChart
          currencyPair={chartData.currencyPair}
          historyData={chartData.history}
          onClose={() => {
            setShowChart(false);
            setChartData(null);
          }}
        />
      )}
    </div>
  );
}

export default RatesPage;
