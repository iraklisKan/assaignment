import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, Alert } from './ui/index.jsx';

function IntegrationForm({ integration, providers, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    base_url: '',
    api_key: '',
    priority: '100',
    poll_interval_seconds: '300',
    active: true
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        provider: integration.provider,
        base_url: integration.base_url,
        api_key: '', // Never populate API key for security
        priority: integration.priority.toString(),
        poll_interval_seconds: integration.poll_interval_seconds.toString(),
        active: integration.active
      });
    }
  }, [integration]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProviderChange = (e) => {
    const selectedProvider = providers.find(p => p.name === e.target.value);
    
    if (selectedProvider && !integration) {
      // Auto-fill base URL when creating new integration
      setFormData(prev => ({
        ...prev,
        provider: selectedProvider.name,
        base_url: selectedProvider.defaultBaseUrl
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        provider: e.target.value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        priority: parseInt(formData.priority),
        poll_interval_seconds: parseInt(formData.poll_interval_seconds)
      };

      // Don't send empty API key on update
      if (integration && !submitData.api_key) {
        delete submitData.api_key;
      }

      await onSubmit(submitData);
    } catch (err) {
      // Ensure error is always a string
      const errorMessage = typeof err === 'string' ? err : 
                          (err.message || JSON.stringify(err) || 'An error occurred');
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={integration ? 'Edit Integration' : 'Add New Integration'}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="integration-form" disabled={submitting}>
            {submitting ? 'Saving...' : integration ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      {error && (
        <Alert variant="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      <form id="integration-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Integration Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="My Exchange Rate API"
          required
        />

        <Select
          label="Provider"
          name="provider"
          value={formData.provider}
          onChange={handleProviderChange}
          required
          disabled={!!integration}
        >
          <option value="">Select a provider...</option>
          {providers.map((provider) => (
            <option key={provider.name} value={provider.name}>
              {provider.displayName} — {provider.description}
            </option>
          ))}
        </Select>

        <Input
          label="Base URL"
          name="base_url"
          type="url"
          value={formData.base_url}
          onChange={handleChange}
          placeholder="https://api.example.com"
          required
        />

        <Input
          label={integration ? 'API Key (leave empty to keep current)' : 'API Key'}
          name="api_key"
          type="password"
          value={formData.api_key}
          onChange={handleChange}
          placeholder="your-api-key-here"
          required={!integration}
          helperText="Your API key will be encrypted before storage"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Priority"
            name="priority"
            type="number"
            value={formData.priority}
            onChange={handleChange}
            min="1"
            max="1000"
            helperText="Lower = higher priority"
          />

          <Input
            label="Poll Interval (seconds)"
            name="poll_interval_seconds"
            type="number"
            value={formData.poll_interval_seconds}
            onChange={handleChange}
            min="60"
            max="3600"
            helperText="60-3600 seconds"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            Active (enable rate fetching)
          </span>
        </label>
      </form>
    </Modal>
  );
}

export default IntegrationForm;
