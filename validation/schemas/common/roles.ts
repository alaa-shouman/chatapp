import {z} from 'zod';

export const roleSchema = z.enum(['ADMIN', 'PHARMACY_ADMIN', 'PHARMACY_USER', 'DOCTOR', 'PATIENT']);

export type Role = z.infer<typeof roleSchema>;