import { z } from 'zod';
const password = z.string().min(8).max(128).regex(/[A-Z]/, 'Password must include an uppercase letter.').regex(/[a-z]/, 'Password must include a lowercase letter.').regex(/[0-9]/, 'Password must include a number.').regex(/[^A-Za-z0-9]/, 'Password must include a special character.');
export const registerSchema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254), password, organizationName: z.string().trim().min(2).max(160) });
export const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(128) });
