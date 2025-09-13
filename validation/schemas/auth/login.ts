import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginResponseSchema = z.object({
  message: z.string(), // e.g. "Login successful"
  access_token: z.string(),
  user: z.object({
    uuid: z.string(),
    fname: z.string(),
    lname: z.string(),
    username: z.string().optional(),
    email: z.string(),
    avatar: z.string().optional(),
    status: z.string(),
  }),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
