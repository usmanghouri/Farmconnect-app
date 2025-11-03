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
        if (error.response && error.response.status === 401) {
            console.log('401 Unauthorized: Token might be expired. Redirecting to login.');
            // In a real app, you would clear the token and navigate to the login screen.
            // SecureStore.deleteItemAsync(TOKEN_KEY); 
            // router.replace('/');
        }
        return Promise.reject(error);
    }
);

export default apiClient;