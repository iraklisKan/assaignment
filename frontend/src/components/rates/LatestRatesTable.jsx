import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, Button, Select, LoadingSpinner, EmptyState } from '../ui/index.jsx';
import RateChart from '../RateChart.jsx';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function LatestRatesTable({ baseCurrencies, onError }) {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Chart state
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  // Fetch latest rates for selected base currency
  const fetchRates = useCallback(async () => {
    if (!baseCurrency) return;
    
    setLoading(true);
    if (onError) onError(null);
    
    try {
      const response = await axios.get(`${API_BASE}/api/rates/latest`, {
        params: { base: baseCurrency }
      });
      
      // The API returns an array of rate objects
      const ratesData = response.data.data || [];
      const ratesArray = ratesData.map(item => ({
        currency: item.target,
        rate: parseFloat(item.rate)
      }));
      
      setRates(ratesArray);
    } catch (err) {
      if (onError) {
        onError(err.message || 'Failed to fetch exchange rates');
      }
    } finally {
      setLoading(false);
    }
  }, [baseCurrency, onError]);

  // Auto-fetch rates when base currency changes
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Set initial base currency when baseCurrencies prop changes
  useEffect(() => {
    if (baseCurrencies.length > 0 && !baseCurrency) {
      setBaseCurrency(baseCurrencies[0]);
    }
  }, [baseCurrencies, baseCurrency]);

  // Fetch historical data for chart
  const handleShowChart = async (currency) => {
    setChartLoading(true);
    if (onError) onError(null);
    
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
        if (onError) {
          onError('No historical data available for this currency pair');
        }
      }
    } catch (err) {
      if (onError) {
        onError(err.message || 'Failed to fetch historical data');
      }
    } finally {
      setChartLoading(false);
    }
  };

  return (
    <>
      <Card>
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
    </>
  );
}

export default LatestRatesTable;
