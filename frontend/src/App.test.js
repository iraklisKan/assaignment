/**
 * App Component Tests
 * Basic tests for main React app component
 */

import { render, screen } from '@testing-library/react';
import App from './App';

// Mock child components to isolate App tests
jest.mock('./pages/IntegrationsPage', () => {
  return function MockIntegrationsPage() {
    return <div>Integrations Page</div>;
  };
});

jest.mock('./pages/RatesPage', () => {
  return function MockRatesPage() {
    return <div>Rates Page</div>;
  };
});

jest.mock('./pages/MonitoringPage', () => {
  return function MockMonitoringPage() {
    return <div>Monitoring Page</div>;
  };
});

describe('App Component', () => {
  const renderApp = () => {
    // App already has BrowserRouter internally, no need to wrap it
    return render(<App />);
  };

  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByText(/Currency Exchange Rate Hub/i)).toBeInTheDocument();
  });

  it('displays navigation links', () => {
    renderApp();
    
    // Check for navigation links by looking within the nav element
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveTextContent(/Exchange Rates/i);
    expect(nav).toHaveTextContent(/Integrations/i);
    expect(nav).toHaveTextContent(/Monitoring/i);
  });

  it('has correct layout structure', () => {
    renderApp();
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('renders main content area', () => {
    const { container } = renderApp();
    
    const mainContent = container.querySelector('main');
    expect(mainContent).toBeInTheDocument();
  });
});
