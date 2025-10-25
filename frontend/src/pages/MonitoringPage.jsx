import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Badge, Alert, LoadingSpinner, EmptyState } from '../components/ui/index.jsx';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

/**
 * MonitoringPage component displays system health and usage statistics.
 * 
 * @component
 * @returns {JSX.Element} The monitoring page with health status and metrics
 */
const MonitoringPage = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [usageStats, setUsageStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshInterval = 30; // seconds

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      setError(null);
      
      // Fetch health status and usage stats in parallel
      const [healthResponse, usageResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/monitoring/health`),
        axios.get(`${API_BASE}/api/monitoring/usage`)
      ]);
      
      setHealthStatus(healthResponse.data);
      setUsageStats(usageResponse.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMonitoringData();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchMonitoringData();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Calculate overall system health
  const getSystemHealth = () => {
    if (!healthStatus || !healthStatus.data) return { status: 'unknown', color: 'gray' };
    
    const { scheduler, redis } = healthStatus.data;
    
    if (!scheduler?.running) {
      return { status: 'critical', color: 'red', message: 'Scheduler offline' };
    }
    
    if (scheduler.activeJobs === 0) {
      return { status: 'warning', color: 'yellow', message: 'No active integration jobs' };
    }
    
    if (redis === 'fallback') {
      return { status: 'warning', color: 'yellow', message: 'Using fallback cache (Redis not connected)' };
    }
    
    return { status: 'healthy', color: 'green', message: 'All systems operational' };
  };

  const systemHealth = getSystemHealth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="mt-2 text-gray-600">
            Monitor health status and usage metrics of all integrations
          </p>
        </div>
        
        {/* Auto-refresh controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer justify-center sm:justify-start">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Auto-refresh every {refreshInterval}s
            </span>
          </label>
          <button
            onClick={fetchMonitoringData}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors self-center"
            aria-label="Refresh now"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* System Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Status */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  System Status
                </div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {systemHealth.status}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {systemHealth.message}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full bg-${systemHealth.color}-500 flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  {systemHealth.status === 'healthy' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : systemHealth.status === 'critical' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  )}
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Database Status */}
        <Card className="border-green-200">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Scheduler
                </div>
                <Badge variant={healthStatus?.data?.scheduler?.running ? 'success' : 'error'}>
                  {healthStatus?.data?.scheduler?.running ? 'Running' : 'Stopped'}
                </Badge>
                <div className="text-xs text-gray-600 mt-2">
                  Background Jobs
                </div>
              </div>
              <svg className={`w-10 h-10 ${healthStatus?.data?.scheduler?.running ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </Card.Content>
        </Card>

        {/* Redis Status */}
        <Card className={healthStatus?.data?.redis === 'connected' ? 'border-blue-200' : 'border-orange-200'}>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Cache
                </div>
                <Badge variant={healthStatus?.data?.redis === 'connected' ? 'info' : 'warning'}>
                  {healthStatus?.data?.redis === 'connected' ? 'Connected' : 'Fallback'}
                </Badge>
                <div className="text-xs text-gray-600 mt-2">
                  {healthStatus?.data?.redis === 'connected' ? 'Redis' : 'In-Memory LRU'}
                </div>
              </div>
              <svg className={`w-10 h-10 ${healthStatus?.data?.redis === 'connected' ? 'text-blue-500' : 'text-orange-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </Card.Content>
        </Card>

        {/* Active Integrations */}
        <Card className="border-purple-200">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Active Jobs
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {healthStatus?.data?.scheduler?.activeJobs || 0}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Running integrations
                </div>
              </div>
              <svg className="w-10 h-10 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Integration Details */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900">Scheduler Jobs</h2>
        </Card.Header>
        <Card.Content>
          {!healthStatus?.data?.scheduler?.jobs || healthStatus.data.scheduler.jobs.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="No jobs scheduled"
              description="Add an integration to start monitoring exchange rate sources"
            />
          ) : (
            <div className="space-y-3">
              {healthStatus.data.scheduler.jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-lg border-2 bg-green-50 border-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {job.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {job.provider} • Interval: {job.interval}s
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="success">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900">API Usage Statistics</h2>
        </Card.Header>
        <Card.Content>
          {usageStats.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="No usage data available"
              description="Usage statistics will appear once integrations start fetching rates"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Integration
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Calls
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Error
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usageStats.map((stat) => {
                    return (
                      <tr key={stat.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {stat.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stat.provider}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge variant={stat.active ? 'success' : 'secondary'}>
                            {stat.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {stat.total_calls || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            Last {refreshInterval}s
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-xs text-gray-600">
                            {stat.last_error_at 
                              ? new Date(stat.last_error_at).toLocaleString()
                              : 'None'}
                          </div>
                          {stat.last_error && (
                            <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={stat.last_error}>
                              {stat.last_error}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default MonitoringPage;
