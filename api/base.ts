import { AxiosError } from "axios";
import { createAxiosInstance } from "./axiosInstance";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const baseURL = process.env.EXPO_PUBLIC_BASE_URL ;

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
