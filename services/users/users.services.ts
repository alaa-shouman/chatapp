import { apiClient } from "@/api/base";
import { ENDPOINTS } from "@/api/endpoints";
import { UserProfile } from "@/validation/schemas/common/user";

export const getUsers = async (params?: { search?: string; page?: number }) => {
  try {
    const queryParams: Record<string, string | number> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.page) queryParams.page = params.page;

    const response = await apiClient({
      method: "GET",
      endpoint: ENDPOINTS.Users.FetchUsers,
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
    return response as UserProfile;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "An error occurred while fetching users.";
    throw { userMessage: errorMessage, originalError: error };
  }
};
