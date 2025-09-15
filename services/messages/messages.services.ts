import { apiClient } from "@/api/base";
import { ENDPOINTS } from "@/api/endpoints";
import { MessagesResponse } from "@/validation/schemas/messages/messages.response";

export const getMessages = async (chatId: string, params?: { page?: number; per_page?: number }) => {
  try {
    const response = await apiClient({
      method: "GET",
      endpoint: `${ENDPOINTS.Messages.FetchMessages}${chatId}`,
      params
    });
    return response as MessagesResponse;
  } catch (error: any) {
    const errorMessage = error.response.data.message || "Failed to fetch messages";
    throw {
      userMessage: errorMessage,
      originalError: error,
    };
  }
};


export const sendMessage = async (data:{chatId:string;message:string})=>{
    try {
        const response = await apiClient({
            method: "POST",
            endpoint: ENDPOINTS.Messages.SendMessage,
            data
        });
        return response;
    } catch (error:any) {
        const errorMessage = error.reponse.data.message || "Failed to send message";
        throw {
          userMessage: errorMessage,
          originalError: error,
        };
    }
}