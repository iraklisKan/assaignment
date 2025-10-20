/**
 * App Component Tests
 * Basic tests for main React app component
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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
    return render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByText(/Currency Exchange Rate Hub/i)).toBeInTheDocument();
  });

  it('displays navigation links', () => {
    renderApp();
    
    expect(screen.getByText(/Rates/i)).toBeInTheDocument();
    expect(screen.getByText(/Integrations/i)).toBeInTheDocument();
    expect(screen.getByText(/Monitoring/i)).toBeInTheDocument();
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
