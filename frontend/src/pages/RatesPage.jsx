import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from '../components/ui/index.jsx';
import CurrencyConverter from '../components/rates/CurrencyConverter.jsx';
import LatestRatesTable from '../components/rates/LatestRatesTable.jsx';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function RatesPage() {
  const [currencies, setCurrencies] = useState([]);
  const [baseCurrencies, setBaseCurrencies] = useState([]);
  const [error, setError] = useState(null);

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
      } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || 'Failed to fetch currencies';
        console.error('Failed to fetch currencies:', errorMsg);
        // Fallback to defaults if API fails
        setBaseCurrencies(['USD', 'EUR', 'GBP', 'JPY']);
      }
    };

    fetchCurrencies();
  }, []);

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
        <div className="lg:col-span-1">
          <CurrencyConverter 
            currencies={currencies} 
            onError={setError}
          />
        </div>

        {/* Latest Rates Table */}
        <div className="lg:col-span-2">
          <LatestRatesTable 
            baseCurrencies={baseCurrencies}
            onError={setError}
          />
        </div>
      </div>
    </div>
  );
}

export default RatesPage;
