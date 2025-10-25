import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal, Button, Input, Select, Alert } from './ui/index.jsx';

/**
 * Initial form values
 */
const initialFormValues = {
  name: '',
  provider: '',
  base_url: '',
  api_key: '',
  priority: 100,
  poll_interval_seconds: 300,
  active: true,
};

/**
 * IntegrationForm component
 * Provides a form for creating and editing exchange rate API integrations
 * Uses react-hook-form with zod validation for robust form handling
 * 
 * @param {Object} props - Component props
 * @param {Object} [props.integration] - The integration object to edit (undefined for new integration)
 * @param {Array} props.providers - List of available providers
 * @param {Function} props.onSubmit - Callback function to submit the form data
 * @param {Function} props.onCancel - Callback function to cancel the form
 * @returns {JSX.Element} The IntegrationForm component
 */
const IntegrationForm = ({ integration, providers, onSubmit, onCancel }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: initialFormValues,
    mode: 'onBlur', // Validate on blur
  });

  // Watch provider changes to auto-fill base URL
  const selectedProvider = watch('provider');

  useEffect(() => {
    if (integration) {
      reset({
        name: integration.name,
        provider: integration.provider,
        base_url: integration.base_url,
        api_key: '', // Never populate API key for security
        priority: integration.priority,
        poll_interval_seconds: integration.poll_interval_seconds,
        active: integration.active
      });
    }
  }, [integration, reset]);

  // Auto-fill base URL when provider changes (for new integrations only)
  useEffect(() => {
    if (selectedProvider && !integration) {
      const provider = providers.find(p => p.name === selectedProvider);
      if (provider?.defaultBaseUrl) {
        setValue('base_url', provider.defaultBaseUrl);
      }
    }
  }, [selectedProvider, providers, integration, setValue]);

  /**
   * Handle form submission
   * Validates and submits the form data
   * @param {Object} data - The validated form data from react-hook-form
   * @returns {Promise<void>}
   */
  const onSubmitForm = async (data) => {
    try {
      const submitData = { ...data };

      // Don't send empty API key on update
      if (integration && !submitData.api_key) {
        delete submitData.api_key;
      }

      await onSubmit(submitData);
    } catch (err) {
      // Set form-level error
      const errorMessage = typeof err === 'string' ? err : 
                          (err.message || JSON.stringify(err) || 'An error occurred');
      setFormError('root', { type: 'manual', message: errorMessage });
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={integration ? 'Edit Integration' : 'Add New Integration'}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="integration-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : integration ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      {errors.root && (
        <Alert variant="error" onClose={() => setFormError('root', null)} className="mb-4">
          {errors.root.message}
        </Alert>
      )}

      <form id="integration-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Integration name is required',
            minLength: { value: 1, message: 'Name is required' },
            maxLength: { value: 100, message: 'Name is too long (max 100 characters)' },
          }}
          render={({ field }) => (
            <Input
              {...field}
              label="Integration Name"
              placeholder="My Exchange Rate API"
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          name="provider"
          control={control}
          rules={{
            required: 'Provider is required',
          }}
          render={({ field }) => (
            <Select
              {...field}
              label="Provider"
              disabled={!!integration}
              error={errors.provider?.message}
            >
              <option value="">Select a provider...</option>
              {providers.map((provider) => (
                <option key={provider.name} value={provider.name}>
                  {provider.displayName} — {provider.description}
                </option>
              ))}
            </Select>
          )}
        />

        <Controller
          name="base_url"
          control={control}
          rules={{
            required: 'Base URL is required',
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Must be a valid URL starting with http:// or https://',
            },
          }}
          render={({ field }) => (
            <Input
              {...field}
              label="Base URL"
              type="url"
              placeholder="https://api.example.com"
              error={errors.base_url?.message}
            />
          )}
        />

        <Controller
          name="api_key"
          control={control}
          rules={{
            required: !integration ? 'API Key is required for new integrations' : false,
          }}
          render={({ field }) => (
            <Input
              {...field}
              label={integration ? 'API Key (leave empty to keep current)' : 'API Key'}
              type="password"
              placeholder="your-api-key-here"
              helperText="Your API key will be encrypted before storage"
              error={errors.api_key?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="priority"
            control={control}
            rules={{
              required: 'Priority is required',
              min: { value: 1, message: 'Priority must be at least 1' },
              max: { value: 1000, message: 'Priority cannot exceed 1000' },
              validate: (value) => Number.isInteger(value) || 'Priority must be a whole number',
            }}
            render={({ field: { onChange, value, ...rest } }) => (
              <Input
                {...rest}
                type="number"
                label="Priority"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                min="1"
                max="1000"
                helperText="Lower = higher priority"
                error={errors.priority?.message}
              />
            )}
          />

          <Controller
            name="poll_interval_seconds"
            control={control}
            rules={{
              required: 'Poll interval is required',
              min: { value: 60, message: 'Minimum interval is 60 seconds' },
              max: { value: 3600, message: 'Maximum interval is 3600 seconds' },
              validate: (value) => Number.isInteger(value) || 'Interval must be a whole number',
            }}
            render={({ field: { onChange, value, ...rest } }) => (
              <Input
                {...rest}
                type="number"
                label="Poll Interval (seconds)"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                min="60"
                max="3600"
                helperText="60-3600 seconds"
                error={errors.poll_interval_seconds?.message}
              />
            )}
          />
        </div>

        <Controller
          name="active"
          control={control}
          render={({ field: { onChange, value, ...rest } }) => (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...rest}
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Active (enable rate fetching)
              </span>
            </label>
          )}
        />
      </form>
    </Modal>
  );
};

export default IntegrationForm;
