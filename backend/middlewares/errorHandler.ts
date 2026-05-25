import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || "Error interno del servidor";

  console.error(`[ERROR] ${err.message}`);
  if (env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
