import { useAuthStore } from '@/pages/stores/auth';
import axios from 'axios';
import { getItem, setItem } from '../components/helper/localstorage.helper';
import { getRefreshToken } from './token.service';

const API_BASE = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_MAIN_SERVICE}`;

// 🧠 Helper sederhana
function pick(obj: any, keys: string[]) {
  if (!obj || !keys?.length) return obj;
  return keys.reduce((acc: any, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});
}

// 🧩 Template notifikasi (kalau mau tambahkan notifikasi UI)
const notificationTemplate = (msg: string, type = 'danger') => ({
  title: 'Error',
  message: [msg],
  type,
});

// ✅ Buat hanya 1 instance global axios
const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // pastikan kirim cookies/session jika server butuh
  timeout: 30000, // batas waktu request
});

// 🛠 Interceptor request — pasang token dari Pinia atau localStorage
axiosInstance.interceptors.request.use((config) => {
  try {
    const authStore = useAuthStore();
    const credentials = authStore.credentials;
    const accessToken = credentials?.access || getItem('g-access');

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Debug (opsional)
    // console.log('🔹 Request:', config.url, config.headers.Authorization);
  } catch {
    // silent
  }
  return config;
});

// 🧠 Interceptor response — handle 401 (refresh token otomatis)
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalConfig = error.config;
    const status = error.response?.status;

    if (!originalConfig || !originalConfig.url) return Promise.reject(error);

    const fullUrl = (originalConfig.baseURL || '') + originalConfig.url;

    // ⛔ Skip kalau ini request login
    if (fullUrl.endsWith('/auth/login')) {
      return Promise.reject(error);
    }

    // 🔄 Handle token kadaluarsa
    if (status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      let totalRefresh = getItem('g-refresh') || 0;
      totalRefresh++;
      setItem('g-refresh', totalRefresh);

      if (totalRefresh > 10) {
        const authStore = useAuthStore();
        authStore.logoutUser();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const refresh_token = getRefreshToken();
        if (!refresh_token) throw new Error('Refresh token tidak ditemukan');

        const rt = await axios.post(`${API_BASE}/auth/refresh-token`, {
          refresh: refresh_token,
        });

        const newAccessToken = rt?.data?.access;
        if (!newAccessToken) throw new Error('Gagal refresh token');

        setItem('g-access', newAccessToken);
        setItem('g-refresh', 0);

        const authStore = useAuthStore();
        const currentCredentials = getItem('credentials') || {};
        const newCredentials = { ...currentCredentials, access: newAccessToken };
        authStore.refreshToken(newCredentials);

        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalConfig); // retry
      } catch (refreshError) {
        const authStore = useAuthStore();
        authStore.logoutUser();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // ⚠️ Error lain (selain 401)
    if (originalConfig.method === 'get' && status !== 401) {
      const respMsg = error.response?.data?.message || '';
      console.error(`[API ERROR] ${status}: ${respMsg}`);
      notificationTemplate(respMsg, 'danger');
    }

    return Promise.reject(error);
  }
);

// ✅ Fungsi utama untuk pakai instance yang sama
const requestApi = (responseFields: string[] | null = null, baseUrl = undefined) => {
  // clone konfigurasi bila perlu custom baseURL
  const instance = baseUrl
    ? axios.create({
        ...axiosInstance.defaults,
        baseURL: baseUrl,
      })
    : axiosInstance;

  // kalau user minta pick field tertentu dari response
  if (responseFields) {
    instance.interceptors.response.use((response: any) => pick(response, responseFields));
  }

  return instance;
};

export default requestApi;
