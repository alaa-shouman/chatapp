import axios from "axios";
import { logout } from "../redux/slices/auth";
import store from "../redux/store";

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
      const { access_token } = state.auth;

      if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
      }

      // Add request metadata for tracking
      config.headers["X-Request-ID"] = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      config.headers["X-Request-Time"] = new Date().toISOString();

      // Log full request details
      // console.log("Full Request Details:", {
      //   method: config.method?.toUpperCase(),
      //   url: `${config.baseURL}${config.url}`,
      //   headers: config.headers,
      //   params: config.params,
      //   data: config.data,
      //   token: access_token ? `Bearer ${access_token.substring(0, 10)}...` : "No token",
      // });

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
      // console.log("Response Success:", {
      //   status: response.status,
      //   statusText: response.statusText,
      //   url: response.config.url,
      //   method: response.config.method?.toUpperCase(),
      //   data: response.data,
      //   headers: response.headers,
      //   requestData: response.config.data,
      //   requestParams: response.config.params,
      // });

      return response;
      // Log error response details
    },
    async (error) => {
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

      // Handle 401 Unauthorized - simply logout
      if (error.response?.status === 401) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
