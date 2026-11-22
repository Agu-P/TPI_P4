import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const url = error.config?.url || '';

    const isAuthEndpoint = url.includes('/auth/token') || url.includes('/auth/me');

    // 401 fuera de /auth/token y /auth/me
    if (status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().limpiarSesion();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // 400 con detail «Cuenta de usuario desactivada»
    if (status === 400 && typeof detail === 'string' && detail.includes('Cuenta de usuario desactivada')) {
      useAuthStore.getState().limpiarSesion();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
