import axios from "axios";

const rawBaseURL = import.meta.env.VITE_BASE_URL || "https://thtt-backend.onrender.com/api";
const apiBaseURL = rawBaseURL.replace(/\/+$/, "");

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