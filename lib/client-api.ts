// Client-side API calls that go through Next.js API routes (server-side proxy)
import axios from "axios";

const clientApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include JWT token and user_id from localStorage
clientApi.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('civicchain_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Get user_id from localStorage
    const userId = typeof window !== 'undefined' ? localStorage.getItem('civicchain_user_id') : null;
    
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
clientApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // DON'T auto-redirect on 401 - let the component handle it
    // This prevents infinite redirect loops
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default clientApi;
