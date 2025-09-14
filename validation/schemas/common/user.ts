import { string, z } from "zod";
import { makePaginationMeta } from "./pagination";

export const profileUser = z.object({
  uuid: string(),
  fname: z.string(),
  lname: z.string(),
  username: z.string(),
  avatar: z.string().url().nullable(),
  email: z.string().email(),
  status: z.enum(["online", "offline"]),
});
export const paginationMeta = makePaginationMeta(profileUser);

export const userProfileSchema = z.object({
  message: z.string(),
  data: paginationMeta,
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type ProfileUser = z.infer<typeof profileUser>;
