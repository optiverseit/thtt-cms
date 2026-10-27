import axios from "axios";

/**
 * Normalizes an API base URL:
 * - Ensures protocol (https://) is present
 * - Strips trailing slashes
 * - Ensures /api suffix is present
 */
export const normalizeApiUrl = (url) => {
  if (!url) return "";
  let cleaned = url.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  if (!cleaned.endsWith("/api")) {
    cleaned = `${cleaned}/api`;
  }
  return cleaned;
};

export const getApiBaseURL = () => {
  // 1. Runtime environment override (e.g. window.__ENV__ if configured on server)
  if (typeof window !== "undefined" && window.__ENV__?.VITE_BASE_URL) {
    return normalizeApiUrl(window.__ENV__.VITE_BASE_URL);
  }
  // 2. Vite environment variable from .env.development or .env.production
  if (import.meta.env.VITE_BASE_URL) {
    return normalizeApiUrl(import.meta.env.VITE_BASE_URL);
  }
  // 3. Fallbacks: Local development -> Render API, Production -> cPanel backend
  if (import.meta.env.DEV) {
    return "https://thtt-backend.onrender.com/api";
  }
  return "https://thtt-backend.triphimalaya.com.np/api";
};

const apiBaseURL = getApiBaseURL();

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// This runs before every API request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (import.meta.env.DEV && token) {
      console.log("Token from localStorage:", token);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// when access token expires, use refresh token
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (import.meta.env.DEV && refreshToken) {
          console.log("Refresh token from localStorage:", refreshToken);
        }

        if (!refreshToken) {
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${apiBaseURL}/auth/refresh`,
          refreshToken,
          {
            headers: {
              "Content-Type": "text/plain",
            },
          }
        );

        const newAccessToken = refreshResponse.data.data;

        localStorage.setItem("token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;