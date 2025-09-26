import { z } from "zod";
import { makePaginationMeta } from "../common/pagination";

export const messageUser = z.object({
  uuid: z.string(),
  fname: z.string(),
  lname: z.string(),
  username: z.string(),
  email: z.string().email(),
  avatar: z.string().nullable(),
  status: z.enum(["online", "offline"]),
  email_verified_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const singleMessage = z.object({
  id: z.number(),
  message: z.string(),
  chat_id: z.string(),
  user_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  user: messageUser,
});

export const chatMeta = z.object({
  id: z.number(),
  chat_id: z.string(),
  title: z.string().nullable(),
  type: z.string(),
  joined_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const messagesResponse = z.object({
  status: z.number(),
  url: z.string(),
  method: z.string(),
  chat: chatMeta,
  messages: makePaginationMeta(singleMessage),
  headers: z.record(z.string()),
});

export type MessageUser = z.infer<typeof messageUser>;
export type Message = z.infer<typeof singleMessage>;
export type ChatMeta = z.infer<typeof chatMeta>;
export type MessagesPagination = z.infer<ReturnType<typeof makePaginationMeta>>;
export type MessagesResponse = z.infer<typeof messagesResponse>;

export default messagesResponse;
