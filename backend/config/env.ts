import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string, value: string | undefined): string {
  if (!value) throw new Error(`Falta variable de entorno: ${key}`);
  return value;
}

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: requireEnv("JWT_SECRET", process.env.JWT_SECRET),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};
