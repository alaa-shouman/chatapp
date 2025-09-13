import { patientSignUpSchema, PatientSignUp, DoctorSignUp, doctorSignUpSchema } from "../../validation/schemas/auth/signup";
import { pharmacySignUpSchema, PharmacySignUp } from "../../validation/schemas/auth/signup";
import { apiClient } from "../../api/base";
import { ENDPOINTS } from "../../api/endpoints";


export async function patientSignupService(data: PatientSignUp) {
  try{
    await apiClient({
      method: "POST",
      endpoint: ENDPOINTS.Auth.Signup,
      data: patientSignUpSchema.parse(data),
    });
  }catch (error:any) {
        const errorMessage = error.response?.data?.message || "Failed to Signup";

    throw {
      userMessage: errorMessage,
      originalError: error,
    };
  }
}  

export async function doctorSignupService(data: DoctorSignUp) {
  try{
    await apiClient({
      method: "POST",
      endpoint: ENDPOINTS.Auth.Signup,
      data: doctorSignUpSchema.parse(data),
    });
  }catch (error:any) {
        const errorMessage = error.response?.data?.message || "Failed to Signup";
    throw {
      userMessage: errorMessage,
      originalError: error,
    };
  }
}

export async function pharmacySignupService(data: PharmacySignUp) {
  try {
    await apiClient({
      method: "POST",
      endpoint: ENDPOINTS.Auth.Signup,
      data,
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to Signup";
    throw {
      userMessage: errorMessage,
      originalError: error,
    };
  }
}