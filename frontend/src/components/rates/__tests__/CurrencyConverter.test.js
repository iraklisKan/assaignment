/**
 * CurrencyConverter Component Tests
 * Tests for currency conversion functionality
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CurrencyConverter from '../CurrencyConverter';

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

describe('CurrencyConverter', () => {
  const mockCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form elements', () => {
      render(<CurrencyConverter currencies={mockCurrencies} onError={mockOnError} />);

      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
      expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/From/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/To/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Convert/i })).toBeInTheDocument();
    });

    it('should render with default amount of 100', () => {
      render(<CurrencyConverter currencies={mockCurrencies} onError={mockOnError} />);
      
      const amountInput = screen.getByLabelText(/Amount/i);
      expect(amountInput).toHaveValue(100);
    });

    it('should render swap button', () => {
      render(<CurrencyConverter currencies={mockCurrencies} onError={mockOnError} />);
      
      const swapButton = screen.getByRole('button', { name: /Swap currencies/i });
      expect(swapButton).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update amount when user types', async () => {
      const user = userEvent.setup();
      render(<CurrencyConverter currencies={mockCurrencies} onError={mockOnError} />);
      
      const amountInput = screen.getByLabelText(/Amount/i);
      await user.clear(amountInput);
      await user.type(amountInput, '500');
      
      expect(amountInput).toHaveValue(500);
    });

    it('should swap currencies when swap button is clicked', async () => {
      const user = userEvent.setup();
      render(<CurrencyConverter currencies={mockCurrencies} onError={mockOnError} />);
      
      const fromSelect = screen.getByLabelText(/From/i);
      const toSelect = screen.getByLabelText(/To/i);
      const swapButton = screen.getByRole('button', { name: /Swap currencies/i });
      
      const initialFrom = fromSelect.value;
      const initialTo = toSelect.value;
      
      await user.click(swapButton);
      
      expect(fromSelect).toHaveValue(initialTo);
      expect(toSelect).toHaveValue(initialFrom);
    });
  });

  describe('Currency Conversion', () => {
    it('should call API and display result on successful conversion', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          data: {
            result: 85.50,
            rate: 0.855
          }
        }
      };
      mockGet.mockResolvedValue(mockResponse);

      render(<CurrencyConverter currencies={mockCurrencies} onError={mockOnError} />);
      
      const convertButton = screen.getByRole('button', { name: /Convert/i });
      await user.click(convertButton);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(/85.50/)).toBeInTheDocument();
      });
    });

    it('should show Converting... while request is in progress', async () => {
      const user = userEvent.setup();
      mockGet.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<CurrencyConverter currencies={mockCurrencies} onError={mockOnError} />);
      
      const convertButton = screen.getByRole('button', { name: /Convert/i });
      await user.click(convertButton);

      expect(screen.getByRole('button', { name: /Converting.../i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Converting.../i })).toBeDisabled();
    });

    it('should call onError when conversion fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Network error';
      mockGet.mockRejectedValue(new Error(errorMessage));

      render(<CurrencyConverter currencies={mockCurrencies} onError={mockOnError} />);
      
      const convertButton = screen.getByRole('button', { name: /Convert/i });
      await user.click(convertButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('should display result with 2 decimal places', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          data: {
            result: 85.567890,
            rate: 0.855
          }
        }
      };
      mockGet.mockResolvedValue(mockResponse);

      render(<CurrencyConverter currencies={mockCurrencies} onError={mockOnError} />);
      
      const convertButton = screen.getByRole('button', { name: /Convert/i });
      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText(/85.57/)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty currencies array', () => {
      render(<CurrencyConverter currencies={[]} onError={mockOnError} />);
      
      const fromSelect = screen.getByLabelText(/From/i);
      expect(fromSelect.children.length).toBe(0);
    });

    it('should handle missing onError prop', async () => {
      const user = userEvent.setup();
      mockGet.mockRejectedValue(new Error('Test error'));

      render(<CurrencyConverter currencies={mockCurrencies} />);
      
      const convertButton = screen.getByRole('button', { name: /Convert/i });
      
      // Should not throw error
      await expect(user.click(convertButton)).resolves.not.toThrow();
    });
  });
});
