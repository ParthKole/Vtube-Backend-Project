/**
 * AXIOS INSTANCE & INTERCEPTORS
 * =============================
 * This file configures how the frontend connects to the backend API.
 *
 * 1. Base URL: All requests go to http://localhost:8000/api/v1
 * 2. Authorization: JWT token is stored in localStorage and automatically
 *    attached to every request via the request interceptor.
 * 3. Response: Backend returns { data, message, success, statuscode }.
 *    We extract .data for consistency.
 */

import axios from 'axios';

const TOKEN_KEY = 'vtube_access_token';

// Base URL for the backend API (matches your backend routes)
const BASE_URL = 'http://localhost:8000/api/v1';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies if backend uses them
});

/**
 * REQUEST INTERCEPTOR
 * Attaches the JWT token to the Authorization header for every request.
 * Format: "Authorization: Bearer <token>"
 * Private routes require this header; public routes work without it.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * - Extracts backend's .data from ApiResponse for easier usage
 * - Handles 401 (unauthorized) by clearing token and redirecting to login
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Backend returns { data, message, success, statuscode }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Dispatch custom event so AuthContext can react
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);
