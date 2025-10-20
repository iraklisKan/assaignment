import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract the error message from the response
    let message = 'An error occurred';
    
    if (error.response?.data?.error) {
      // Backend returns {error: {message: "..."}}
      if (typeof error.response.data.error === 'string') {
        message = error.response.data.error;
      } else if (error.response.data.error.message) {
        message = error.response.data.error.message;
      }
    } else if (error.message) {
      message = error.message;
    }
    
    // Create a new error with just the string message
    const err = new Error(message);
    err.response = error.response;
    return Promise.reject(err);
  }
);

// Integrations API
export const integrationsAPI = {
  getAll: (params) => api.get('/api/integrations', { params }),
  getById: (id) => api.get(`/api/integrations/${id}`),
  create: (data) => api.post('/api/integrations', data),
  update: (id, data) => api.put(`/api/integrations/${id}`, data),
  delete: (id) => api.delete(`/api/integrations/${id}`),
  hardDelete: (id) => api.delete(`/api/integrations/${id}/permanent`),
  getUsage: (id, params) => api.get(`/api/integrations/${id}/usage`, { params }),
  getProviders: () => api.get('/api/integrations/providers')
};

// Rates API
export const ratesAPI = {
  getLatest: (params) => api.get('/api/rates', { params }),
  getHistory: (params) => api.get('/api/rates/history', { params }),
  convert: (params) => api.get('/api/convert', { params })
};

// Monitoring API
export const monitoringAPI = {
  getHealth: () => api.get('/api/monitoring/health'),
  getUsage: (params) => api.get('/api/monitoring/usage', { params }),
  getScheduler: () => api.get('/api/monitoring/scheduler')
};

export default api;
