import "dotenv/config";

const required = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "PORT",
  "CORS_ORIGIN",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing env ${key}`);
  }
}

export const env = {
  dbUrl: process.env.DATABASE_URL!,
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  port: Number(process.env.PORT ?? 5001),
  origin: process.env.CORS_ORIGIN!,
  node: process.env.NODE_ENV ?? "development",
};
