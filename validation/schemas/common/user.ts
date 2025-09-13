import { z } from "zod";

export const userProfileSchema = z.object({
    message: z.string(),
    data: z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phoneNumber: z.string().nullable(),
        dob: z.string().nullable(),
    }),
});

export type UserProfile = z.infer<typeof userProfileSchema>;