import { z } from "zod";

// .coerce.number() means it will convert the string to a number if it's a string

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32),

  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  FRONTEND_URL: z.string().url(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  STREAM_API_KEY: z.string().min(1),
  STREAM_API_SECRET: z.string().min(1),

  SENTRY_DSN: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);

    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

let cachedEnv: Env | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = loadEnv();
  }

  return cachedEnv;
}
