import { AxiosError } from "axios";
import { createAxiosInstance } from "./axiosInstance";
import { Platform } from "react-native";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const getBaseUrl = () => {
  // const envUrl = process.env.EXPO_PUBLIC_BASE_URL;
  // if (envUrl) return envUrl;

  // For Android emulator, localhost should be 10.0.2.2
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api/";
  }

  return "http://localhost:8000/api/";
};

const baseURL = getBaseUrl();

interface ApiOptions {
  method: HttpMethod;
  endpoint: string;
  data?: unknown;
  params?: unknown;
}

export const apiClient = async ({ method, endpoint, data, params }: ApiOptions): Promise<unknown> => {
  try {
    const instance = createAxiosInstance(baseURL);
    const response = await instance({
      method,
      url: endpoint,
      data,
      params,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw error;
  }
};
