/**
 * LatestRatesTable Component Tests
 * Tests for rates table display and historical chart functionality
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LatestRatesTable from '../LatestRatesTable';

// Mock axios module
const mockGet = jest.fn();
jest.mock('axios', () => ({
  get: (...args) => mockGet(...args),
  create: jest.fn(() => ({
    get: mockGet,
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    }
  }))
}));

// Mock RateChart component
jest.mock('../../RateChart', () => {
  return function MockRateChart({ currency, onClose }) {
    return (
      <div data-testid="rate-chart">
        <div>Chart for {currency}</div>
        <button onClick={onClose}>Close Chart</button>
      </div>
    );
  };
});

describe('LatestRatesTable', () => {
  const mockBaseCurrency = 'USD';
  const mockOnError = jest.fn();

  const mockRatesData = {
    data: {
      data: {
        baseCurrency: 'USD',
        rates: [
          { currency: 'EUR', rate: 0.855, updated_at: '2024-01-15T10:30:00Z' },
          { currency: 'GBP', rate: 0.789, updated_at: '2024-01-15T10:30:00Z' },
          { currency: 'JPY', rate: 110.50, updated_at: '2024-01-15T10:30:00Z' },
          { currency: 'CAD', rate: 1.25, updated_at: '2024-01-15T10:30:00Z' }
        ]
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should show loading state initially', () => {
      mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      expect(screen.getByText(/Loading rates.../i)).toBeInTheDocument();
    });

    it('should fetch and display rates on mount', async () => {
      mockGet.mockResolvedValue(mockRatesData);

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/api/rates', {
          params: { baseCurrency: 'USD' }
        });
      });

      await waitFor(() => {
        expect(screen.getByText('EUR')).toBeInTheDocument();
        expect(screen.getByText('GBP')).toBeInTheDocument();
        expect(screen.getByText('JPY')).toBeInTheDocument();
      });
    });

    it('should display table headers', async () => {
      mockGet.mockResolvedValue(mockRatesData);

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByText('Currency')).toBeInTheDocument();
        expect(screen.getByText('Rate')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', async () => {
      mockGet.mockResolvedValue(mockRatesData);

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search currencies.../i)).toBeInTheDocument();
      });
    });

    it('should filter rates based on search term', async () => {
      const user = userEvent.setup();
      mockGet.mockResolvedValue(mockRatesData);

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByText('EUR')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search currencies.../i);
      await user.type(searchInput, 'EUR');

      expect(screen.getByText('EUR')).toBeInTheDocument();
      expect(screen.queryByText('JPY')).not.toBeInTheDocument();
    });
  });

  describe('Base Currency Changes', () => {
    it('should refetch rates when baseCurrency changes', async () => {
      mockGet.mockResolvedValue(mockRatesData);

      const { rerender } = render(
        <LatestRatesTable baseCurrency="USD" onError={mockOnError} />
      );

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/api/rates', {
          params: { baseCurrency: 'USD' }
        });
      });

      // Change base currency
      rerender(<LatestRatesTable baseCurrency="EUR" onError={mockOnError} />);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/api/rates', {
          params: { baseCurrency: 'EUR' }
        });
      });
    });
  });

  describe('Historical Chart', () => {
    it('should open chart when "View History" button is clicked', async () => {
      const user = userEvent.setup();
      mockGet.mockResolvedValue(mockRatesData);

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByText('EUR')).toBeInTheDocument();
      });

      const viewHistoryButtons = screen.getAllByText(/View History/i);
      await user.click(viewHistoryButtons[0]);

      expect(screen.getByTestId('rate-chart')).toBeInTheDocument();
    });

    it('should close chart when onClose is called', async () => {
      const user = userEvent.setup();
      mockGet.mockResolvedValue(mockRatesData);

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByText('EUR')).toBeInTheDocument();
      });

      const viewHistoryButtons = screen.getAllByText(/View History/i);
      await user.click(viewHistoryButtons[0]);

      expect(screen.getByTestId('rate-chart')).toBeInTheDocument();

      const closeButton = screen.getByText('Close Chart');
      await user.click(closeButton);

      expect(screen.queryByTestId('rate-chart')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should call onError when fetch fails', async () => {
      const errorMessage = 'Network error';
      mockGet.mockRejectedValue(new Error(errorMessage));

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('should not crash without onError callback', async () => {
      mockGet.mockRejectedValue(new Error('Test error'));

      expect(() => {
        render(<LatestRatesTable baseCurrency={mockBaseCurrency} />);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty rates array', async () => {
      mockGet.mockResolvedValue({
        data: {
          data: {
            baseCurrency: 'USD',
            rates: []
          }
        }
      });

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByText(/No rates found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should have a refresh button', async () => {
      mockGet.mockResolvedValue(mockRatesData);

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        expect(refreshButton).toBeInTheDocument();
      });
    });

    it('should refetch rates when refresh button is clicked', async () => {
      const user = userEvent.setup();
      mockGet.mockResolvedValue(mockRatesData);

      render(<LatestRatesTable baseCurrency={mockBaseCurrency} onError={mockOnError} />);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });
  });
});
