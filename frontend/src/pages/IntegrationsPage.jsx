import React, { useState, useEffect, useCallback } from 'react';
import { integrationsAPI } from '../services/api';
import IntegrationForm from '../components/IntegrationForm.jsx';
import { 
  Button, 
  Card, 
  Badge, 
  Alert, 
  LoadingSpinner,
  Table,
  EmptyState
} from '../components/ui/index.jsx';

function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      const params = activeFilter === 'all' ? {} : { active: activeFilter === 'active' };
      const response = await integrationsAPI.getAll(params);
      setIntegrations(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch integrations');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const fetchProviders = useCallback(async () => {
    try {
      const response = await integrationsAPI.getProviders();
      setProviders(response.data.data);
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
    fetchProviders();
  }, [fetchIntegrations, fetchProviders]);

  const handleCreate = () => {
    setEditingIntegration(null);
    setShowForm(true);
  };

  const handleEdit = (integration) => {
    setEditingIntegration(integration);
    setShowForm(true);
  };

  const handleToggleActive = async (integration) => {
    const action = integration.active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} "${integration.name}"?`)) return;

    try {
      await integrationsAPI.update(integration.id, { active: !integration.active });
      fetchIntegrations();
    } catch (err) {
      alert(`Failed to ${action} integration: ${err.message}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE "${name}"? This action cannot be undone.`)) return;

    try {
      await integrationsAPI.hardDelete(id);
      fetchIntegrations();
    } catch (err) {
      alert(`Failed to delete integration: ${err.message}`);
    }
  };

  const handleFormSubmit = async (data) => {
    if (editingIntegration) {
      await integrationsAPI.update(editingIntegration.id, data);
    } else {
      await integrationsAPI.create(data);
    }
    setShowForm(false);
    setEditingIntegration(null);
    fetchIntegrations();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingIntegration(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading integrations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure and manage your exchange rate API providers
          </p>
        </div>
        <Button onClick={handleCreate}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Integration
        </Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Active Integrations</h2>
            <div className="flex gap-2">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === option.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </Card.Header>

        <Card.Content className="p-0">
          {integrations.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              }
              title="No integrations found"
              description="Get started by adding your first exchange rate API integration"
              action={
                <Button onClick={handleCreate}>
                  Add Your First Integration
                </Button>
              }
            />
          ) : (
            <Table 
              headers={['Name', 'Provider', 'Priority', 'Poll Interval', 'Status', 'Actions']}
            >
              {integrations.map((integration) => (
                <tr key={integration.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{integration.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {integration.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="default">{integration.priority}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {integration.poll_interval_seconds}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={integration.active ? 'success' : 'danger'}>
                      {integration.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(integration)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant={integration.active ? 'warning' : 'success'}
                      size="sm" 
                      onClick={() => handleToggleActive(integration)}
                    >
                      {integration.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(integration.id, integration.name)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card.Content>
      </Card>

      {showForm && (
        <IntegrationForm
          integration={editingIntegration}
          providers={providers}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export default IntegrationsPage;
