// utils/apiClient.ts (or utils/apiClient.js)

import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Define the storage key for your token
export const TOKEN_KEY = 'auth_token';

// 1. Create a base Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://agrofarm-vd8i.onrender.com/api/',
  timeout: 10000,
  // Removed withCredentials: true, as we rely on tokens now
});

// 2. Request Interceptor: Inject the token into the Authorization header
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Failed to retrieve token from SecureStore", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Handle global errors (e.g., 401 expiration)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const method = error?.config?.method?.toUpperCase();
        const url = error?.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error?.config?.url;
        const serverMsg = error?.response?.data?.message;
        if (status === 401) {
            console.log('401 Unauthorized: Token might be expired.');
        }
        const message = serverMsg || error.message || 'Request failed';
        const wrapped = new Error(`${message} (${method} ${url} -> ${status || 'ERR'})`);
        return Promise.reject(wrapped);
    }
);

export default apiClient;