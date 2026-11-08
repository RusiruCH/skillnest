import axios from 'axios';

/**
 * ============================================================================
 * SHARED API CLIENT (MEMBER 01 INTEGRATION CONTRACT)
 * ============================================================================
 * Member 01 is responsible for authentication and the shared Axios utility.
 * Member 05 does NOT hardcode token storage keys or assume localStorage.
 *
 * This client instance:
 * 1. Uses `withCredentials: true` to support HTTP-only cookie authentication.
 * 2. Allows a pluggable token getter callback so Member 01's AuthContext or
 *    in-memory token store can provide the bearer token dynamically without
 *    Member 05 hardcoding any storage mechanism.
 * 3. Sets standard base URL configuration.
 * ============================================================================
 */

let tokenProvider = () => null;

/**
 * Allow Member 01's auth provider to register their dynamic token resolver
 * @param {Function} providerFn Returns current active token string or null
 */
export const registerTokenProvider = (providerFn) => {
  tokenProvider = providerFn;
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Dynamic request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenProvider();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network or server error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default apiClient;
