import React, { useState } from 'react';
import axios from 'axios';
import { Card, Input, Button, Select } from '../ui/index.jsx';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function CurrencyConverter({ currencies, onError }) {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [converting, setConverting] = useState(false);

  // Handle currency conversion
  const handleConvert = async () => {
    if (!fromCurrency || !toCurrency || !amount) return;
    
    setConverting(true);
    if (onError) onError(null);
    
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
      if (onError) {
        onError(err.message || 'Conversion failed');
      }
    } finally {
      setConverting(false);
    }
  };

  // Swap currencies in converter
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
  };

  return (
    <Card>
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
  );
}

export default CurrencyConverter;
