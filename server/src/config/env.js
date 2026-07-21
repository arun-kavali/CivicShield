import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required.'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters.'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters.'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  SOCKET_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SERVER_URL: z.string().url().default('http://localhost:5000'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const issues = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid server configuration. ${issues}`);
}

export const env = Object.freeze({
  ...parsedEnvironment.data,
  SOCKET_PORT: parsedEnvironment.data.SOCKET_PORT ?? parsedEnvironment.data.PORT,
});
