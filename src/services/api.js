// src/services/api.js
import axios from 'axios';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:5000/api';

console.log('🔧 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  // KHÔNG set Content-Type mặc định ở đây
});

// Helpers
const isFormData = (v) => typeof FormData !== 'undefined' && v instanceof FormData;
const isPlainObject = (v) =>
  v &&
  typeof v === 'object' &&
  !(v instanceof FormData) &&
  !(v instanceof Blob) &&
  !(v instanceof ArrayBuffer);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const H = config.headers;

    // Gắn token
    const token = localStorage.getItem('accessToken');
    if (token) {
      if (H && typeof H.set === 'function') H.set('Authorization', `Bearer ${token}`);
      else config.headers = { ...(H || {}), Authorization: `Bearer ${token}` };
    }

    // FormData → để axios/browser tự set multipart + boundary
    if (isFormData(config.data)) {
      if (H && typeof H.delete === 'function') {
        H.delete('Content-Type');
      } else {
        delete config.headers?.['Content-Type'];
      }
      // Không transform FormData thành JSON
      config.transformRequest = [(d) => d];
    } else if (isPlainObject(config.data)) {
      // JSON bình thường
      if (H && typeof H.set === 'function') H.set('Content-Type', 'application/json');
      else config.headers = { ...(H || {}), 'Content-Type': 'application/json' };
    }

    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor + refresh
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error(
      '📥 API Error:',
      error.response?.status,
      error.response?.statusText,
      error.config?.url,
      error.response?.data
    );

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const resp = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          const { token } = resp.data;
          localStorage.setItem('accessToken', token);

          // gắn lại header cho request cũ
          if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
          } else {
            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${token}`,
            };
          }
          return api(originalRequest);
        }
      } catch (e) {
        // fallthrough to sign-in
      }
      localStorage.clear();
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default api;
