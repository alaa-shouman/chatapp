import {  z } from 'zod';
import { PaginationSchema } from '../common/pagination';

// Reuse common schemas to avoid duplication
// Schema for the Doctor object  
export const DoctorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

// Schema for the PharmacyUser object
export const PharmacyUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

// Schema for single chat message/conversation item
export const ChatSchema = z.object({
  id: z.string(),
  content: z.string(),
  prescriptionId: z.string(),
  senderId: z.string(),
  status: z.string(),
  createdAt: z.string(),
  doctor: DoctorSchema,
  pharmacyUser: PharmacyUserSchema.nullable(),
});

// Schema for GetChatsResponse - list of chat conversations
export const GetChatsResponseSchema = z.object({
  data: z.array(ChatSchema),
  pagination:PaginationSchema,
});

// Schema for the Message object (individual messages in a chat)
export const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.string().optional(),
});

// Schema for GetMessagesResponse (actual API structure)
export const GetMessagesResponseSchema = z.object({
  status: z.number(),
  url: z.string().optional(),
  method: z.string().optional(),
    data: z.array(z.object({
      id: z.string(),
      content: z.string(),
      senderId: z.string(),
      prescriptionId: z.string(),
      status: z.string(),
      createdAt: z.string(),
    })),
    pagination: PaginationSchema.optional(),
  headers: z.record(z.string()).optional(),
});

// Schema for legacy GetMessagesResponse (if still used elsewhere)
export const LegacyGetMessagesResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    messages: z.array(MessageSchema),
  }),
});

// Schema for sending a message
export const sendMessageRequestSchema = z.object({
  prescriptionId: z.string(),
  content: z.string().min(1).max(500),
});

// Schema for send message response
export const SendMessageResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    content: z.string(),
    doctorId: z.string(),
    pharmacyId: z.string().optional(),
    prescriptionId: z.string().optional(),
    pharmacyUserId: z.string().optional(),
    createdAt: z.string(),
  }),
});

// Type exports
export type Chat = z.infer<typeof ChatSchema>;
export type GetChatsResponse = z.infer<typeof GetChatsResponseSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type GetMessagesResponse = z.infer<typeof GetMessagesResponseSchema>;
export type LegacyGetMessagesResponse = z.infer<typeof LegacyGetMessagesResponseSchema>;
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;