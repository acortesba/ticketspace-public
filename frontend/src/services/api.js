import axios from 'axios';

// VITE_API_URL must be set in Vercel environment variables.
// Example: https://api.ticketspace.es/api/v1
const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh token
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
        
        if (res.data.success) {
          const { access_token } = res.data.data;
          localStorage.setItem('access_token', access_token);
          
          // Retry the original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect to login
        console.error('Token refresh failed', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const ticketService = {
  getMyTickets: () => api.get('/tickets/my').then(res => res.data.data),
  getPastTickets: () => api.get('/tickets/past').then(res => res.data.data),
  getTicket: (token) => api.get(`/tickets/${token}`).then(res => res.data.data),
};

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data).then(res => res.data),
  updatePassword: (data) => api.put('/users/password', data).then(res => res.data),
};

export const eventService = {
  createEvent: (data) => api.post('/events', data).then(res => res.data),
};

export default api;
