import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Modal } from './ui/index.jsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function RateChart({ currencyPair, historyData, onClose }) {
  const chartRef = useRef(null);

  // Prepare chart data
  const chartData = {
    labels: historyData.map(entry => {
      const date = new Date(entry.fetched_at);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: `${currencyPair} Exchange Rate`,
        data: historyData.map(entry => entry.rate),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.3, // Smooth line
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function(context) {
            return `Rate: ${context.parsed.y.toFixed(6)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            return value.toFixed(4);
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Calculate stats
  const rates = historyData.map(entry => entry.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  const latestRate = rates[rates.length - 1];
  const oldestRate = rates[0];
  const change = latestRate - oldestRate;
  const changePercent = ((change / oldestRate) * 100).toFixed(2);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${currencyPair} Historical Rates`}
      size="large"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
              Latest
            </div>
            <div className="text-lg font-bold text-gray-900">
              {latestRate.toFixed(6)}
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
              Average
            </div>
            <div className="text-lg font-bold text-gray-900">
              {avgRate.toFixed(6)}
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
              Min
            </div>
            <div className="text-lg font-bold text-gray-900">
              {minRate.toFixed(6)}
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">
              Max
            </div>
            <div className="text-lg font-bold text-gray-900">
              {maxRate.toFixed(6)}
            </div>
          </div>
        </div>

        {/* Change Indicator */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Period Change:
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(6)}
              </span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {change >= 0 ? '+' : ''}{changePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4" style={{ height: '400px' }}>
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>

        {/* Data Point Count */}
        <div className="text-sm text-gray-500 text-center">
          Showing {historyData.length} data points from{' '}
          {new Date(historyData[0].fetched_at).toLocaleDateString()} to{' '}
          {new Date(historyData[historyData.length - 1].fetched_at).toLocaleDateString()}
        </div>
      </div>
    </Modal>
  );
}

export default RateChart;
