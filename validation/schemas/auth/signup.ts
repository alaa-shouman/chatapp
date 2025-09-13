import { z } from 'zod';

export const signupSchema = z.object({
  fname: z.string().min(1, 'First name is required').max(255, 'First name must be at most 255 characters'),
  lname: z.string().min(1, 'Last name is required').max(255, 'Last name must be at most 255 characters'),
  username: z.string().min(1, 'Username is required').max(255, 'Username must be at most 255 characters'),
  email: z.string().email('Invalid email format').min(1, 'Email is required').max(255, 'Email must be at most 255 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').min(1, 'Password is required'),
});

export type SignupType = z.infer<typeof signupSchema>;