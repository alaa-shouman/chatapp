import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export const loginResponseSchema = z.object({
  status: z.literal(200),
  message: z.string(), // e.g. "Login successful"
  data: z.object({
    user: z.object({
      id: z.string(),
      role: z.string(), 
      isVerified: z.boolean()
    }),
    tokens: z.object({
      accessToken: z.string(),
      refreshToken: z.string()
    })
  })
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;