import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";
import IntegrationsPage from "./pages/IntegrationsPage.jsx";
import RatesPage from "./pages/RatesPage.jsx";
import MonitoringPage from "./pages/MonitoringPage.jsx";

/**
 * Main App component
 * Handles routing and layout structure
 * @returns {JSX.Element} The App component
 */
const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navigation />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<IntegrationsPage />} />
              <Route path="/rates" element={<RatesPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
