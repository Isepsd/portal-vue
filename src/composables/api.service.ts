import { useAuthStore } from '@/pages/stores/auth';
import axios from 'axios';
import { getItem, setItem } from '../components/helper/localstorage.helper';
import { getRefreshToken } from './token.service';
;

const API_BASE = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_MAIN_SERVICE}`;


// Helper untuk pick field dari objek
function pick(obj: any, keys: string[]) {
}

// Template notifikasi error
const notificationTemplate = (msg: string, type = 'danger') => ({
  title: 'Error',
  message: [msg],
  type,
});

// const addNotification = (payload: any) => ({
//   type: 'ADD_NOTIFICATION',
//   payload,
// });

// Axios factory dengan interceptor request & response
const requestApi = (responseFields: string[] | null = null, baseUrl = undefined) => {
  const axiosInstance = axios.create({
    baseURL: baseUrl || API_BASE,
  });

  // Interceptor request: pasang Authorization header dari token di localStorage/Pinia
  axiosInstance.interceptors.request.use((config) => {
    try {
      const authStore = useAuthStore();
      const credentials = authStore.credentials;

      const accessToken = credentials?.access || getItem('g-access');
      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch {
      // silent
    }
    return config;
  });

  // Interceptor response: handle 401 dan refresh token otomatis
  axiosInstance.interceptors.response.use(
    (response) => (responseFields ? pick(response, responseFields) : response.data),
    async (error) => {
      const originalConfig = error.config;
      const status = error.response?.status;

      if (!originalConfig || !originalConfig.url) return Promise.reject(error);

      const fullUrl = (originalConfig.baseURL || '') + originalConfig.url;

      // Jangan proses refresh untuk request login
      if (fullUrl.endsWith('/auth/login')) {
        return Promise.reject(error);
      }

      if (status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        let totalRefresh = getItem('g-refresh') || 0;
        totalRefresh++;
        setItem('g-refresh', totalRefresh);

        if (totalRefresh > 10) {
          // Terlalu banyak refresh token gagal, logout paksa
          const authStore = useAuthStore();
          authStore.logoutUser();
          // localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const refresh_token = getRefreshToken();
          if (!refresh_token) throw new Error('Refresh token tidak ditemukan');

        const rt = await axios.post(
          `${API_BASE}/auth/refresh-token`,
          { refresh: refresh_token }
        );

          const newAccessToken = rt?.data?.access;
          if (!newAccessToken) throw new Error('Gagal mendapatkan access token baru');

          setItem('g-access', newAccessToken);
          setItem('g-refresh', 0);

          const authStore = useAuthStore();
          // Update token di Pinia store
          const currentCredentials = getItem('credentials') || {};
          const newCredentials = { ...currentCredentials, access: newAccessToken };
          authStore.refreshToken(newCredentials);

          originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry request original dengan token baru
          return axiosInstance(originalConfig);
        } catch (refreshError) {
          const authStore = useAuthStore();
          authStore.logoutUser();
          // localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Error selain 401 atau request lain
      if (originalConfig.method === 'get' && status !== 401) {
        const respMsg = error.response?.data?.message || '';
        const notification = notificationTemplate(respMsg, 'danger');
        // Kamu bisa tambahkan mekanisme dispatch notifikasi sesuai framework kamu
        console.error(`[API ERROR] ${status}: ${respMsg}`);
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default requestApi;
