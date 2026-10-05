import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  SEED_OWNER_EMAIL: z.string().email().default("chutro@example.com"),
  SEED_OWNER_PASSWORD: z.string().min(8).default("chutro12345"),
});

// Điểm duy nhất đọc process.env; phần còn lại của app import `env` từ đây.
export const env = schema.parse(process.env);
