import { apiClient } from "../../api/base";
import { ENDPOINTS } from "../../api/endpoints";
import { LoginResponse } from "../../validation/schemas/auth/login";

export interface LoginRequest {
    email: string;
    password: string;
    deviceToken?: string | null;
   
}

export const loginService = async (loginData: LoginRequest): Promise<LoginResponse> => {
    try {

        const response = await apiClient({
            method: "POST",
            endpoint: ENDPOINTS.Auth.Login,
            data: loginData
        });
        
        return response as LoginResponse;
        
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Login failed";
        throw {
            userMessage: errorMessage,
            originalError: error,
        };
    }
};

export const refreshToken = async (refreshToken: string): Promise<LoginResponse> => {
    try {
        const response = await apiClient({
            method: "POST",
            endpoint: ENDPOINTS.Auth.RefreshToken,
            data: { refreshToken }
        });
        return response as any;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to refresh token";
        throw {
            userMessage: errorMessage,
            originalError: error,
        };
    }
}


export const logoutService = async (deviceToken: string): Promise<void> => {
    try {
        await apiClient({
            method: "POST",
            endpoint: ENDPOINTS.Auth.logout,
            data: { token: deviceToken }
        });
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Logout failed";
        throw {
            userMessage: errorMessage,
            originalError: error,
        };
    }
}
