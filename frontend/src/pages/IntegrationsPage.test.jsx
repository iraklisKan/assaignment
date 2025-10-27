import React from "react";
import { render } from "@testing-library/react";
import IntegrationsPage from "./IntegrationsPage.jsx";

// Mock the API service
jest.mock("../services/api", () => ({
  integrationsAPI: {
    getIntegrations: jest.fn(() => Promise.resolve({ data: [] })),
    getProviders: jest.fn(() => Promise.resolve({ data: [] })),
    createIntegration: jest.fn(() => Promise.resolve({ data: {} })),
    updateIntegration: jest.fn(() => Promise.resolve({ data: {} })),
    deleteIntegration: jest.fn(() => Promise.resolve({ data: {} })),
    testIntegration: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

describe("IntegrationsPage", () => {
  it("should render without crashing", () => {
    const { container } = render(<IntegrationsPage />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should match snapshot", () => {
    const { container } = render(<IntegrationsPage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
