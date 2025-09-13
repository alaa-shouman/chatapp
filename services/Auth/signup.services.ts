import { apiClient } from "@/api/base";
import { ENDPOINTS } from "@/api/endpoints";
import { SignupType } from "@/validation";

export const signupService = async (data: SignupType) => {
  try {
    const response = await apiClient({
      method: "POST",
      endpoint: ENDPOINTS.Auth.Signup,
      data,
    });
    return response;
  } catch (error: any) {
    const errorMessage = error.reponse?.data?.message || "Signup failed. Please try again.";
    throw {
      message: errorMessage,
      originalError: error,
    };
  }
};
