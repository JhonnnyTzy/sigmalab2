import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          campo: e.path.join("."),
          mensaje: e.message,
        }));
        res.status(400).json({ error: "Datos inválidos", detalles: errors });
        return;
      }
      next(err);
    }
  };
}
