import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

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

export default api;
