import axios from "axios";
import { API_URL } from "../utils/constants";
import { getToken, clearAuthStorage } from "../utils/storage";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach Bearer token to every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dev: warn if USER-facing code hits admin-only /stores (not /stores/browse)
    if (import.meta.env.DEV && config.url) {
      const path = config.url.split("?")[0];
      if (
        (path === "/stores" || path.endsWith("/stores")) &&
        !path.includes("/browse")
      ) {
        console.warn(
          "[API] Request to ADMIN-only /stores — USER should use /stores/browse",
          config.method?.toUpperCase(),
          config.url
        );
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
