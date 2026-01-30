import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from "./token";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response) return Promise.reject(error);

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        return Promise.reject(error);
      }

      try {
        const host = API_BASE_URL.replace(/\/api\/?$/, "");
        const res = await axios.post(`${host}/api/token/refresh/`, { refresh });

        const newAccess = res.data.access;
        setAccessToken(newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
