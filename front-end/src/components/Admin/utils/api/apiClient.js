/**
 * API Client - Centralized API calls management
 * Handles all HTTP requests with interceptors, error handling, and retry logic
 */

import { projectId, publicAnonKey } from '../supabase/info.jsx';

class ApiClient {
  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-180a3e95`;
    this.token = null;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders(customHeaders = {}) {
    return {
      ...this.defaultHeaders,
      'Authorization': this.token ? `Bearer ${this.token}` : `Bearer ${publicAnonKey}`,
      ...customHeaders
    };
  }

  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      retries = 3,
      retryDelay = 1000
    } = options;

    const config = {
      method,
      headers: this.getHeaders(headers)
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, config);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return { success: true };
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data;
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.message.includes('HTTP 4')) {
          throw error;
        }

        // Wait before retrying
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }
    }

    throw lastError;
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }
}

export const apiClient = new ApiClient();
