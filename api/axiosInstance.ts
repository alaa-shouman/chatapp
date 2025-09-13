import axios from "axios";
import store from "../redux/store";
import { logout, setTokens } from "../redux/slices/auth";
import { refreshToken as rf } from "../services/Auth/login.services";
// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

export const createAxiosInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const { accessToken } = state.auth;

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Add request metadata for tracking
      config.headers["X-Request-ID"] = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      config.headers["X-Request-Time"] = new Date().toISOString();

      // Log full request details
      console.log("Full Request Details:", {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        headers: config.headers,
        params: config.params,
        data: config.data,
        token: accessToken ? `Bearer ${accessToken.substring(0, 10)}...` : "No token",
      });

      return config;
    },
    (error) => {
      console.error("Request Error Interceptor:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      // Log successful response details
      console.log("Response Success:", {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
        data: response.data,
        headers: response.headers,
        requestData: response.config.data,
        requestParams: response.config.params,
      });

      return response;
      // Log error response details
    },
    async (error) => {
      const originalRequest = error.config;
      const state = store.getState();
      const { refreshToken } = state.auth;
      // Log error response details
      console.error("Response Error:", {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        requestData: error.config?.data,
        requestParams: error.config?.params,
        message: error.message,
      });

      // Handle 401 Unauthorized with refresh token logic
      if (error.response?.status === 401 && !originalRequest._retry) {
        // If no refresh token, logout immediately
        if (!refreshToken) {
          console.log("No refresh token available, logging out");
          store.dispatch(logout());
          return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          console.log("Already refreshing, queueing request");
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => {
              store.dispatch(logout());
              return Promise.reject(err);
            });
        }

        // Mark request as retry and start refreshing
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log("Attempting to refresh token...");

          // Call refresh token service
          const refreshResponse = await rf(refreshToken);

          console.log("Token refreshed successfully");

          // Update tokens in Redux store (accessing data property)
          store.dispatch(
            setTokens({
              accessToken: refreshResponse.data.tokens.accessToken,
              refreshToken: refreshResponse.data.tokens.refreshToken || refreshToken,
            })
          );

          // Update original request with new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.tokens.accessToken}`;

          // Process all queued requests
          processQueue(null, refreshResponse.data.tokens.accessToken);

          // Retry the original request
          return instance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);

          // Process queue with error and logout
          processQueue(refreshError, null);
          store.dispatch(logout());
          return Promise.reject(refreshError);
        } finally {
          // Reset refreshing state
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
