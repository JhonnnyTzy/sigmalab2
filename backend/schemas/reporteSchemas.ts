import { z } from "zod";

export const createReporteSchema = z.object({
  pasanteId: z.string().min(1),
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  laboratorioId: z.string().optional(),
  ubicacion: z.string().optional(),
  categoria: z.string().optional(),
  prioridad: z.enum(["Alta", "Media", "Baja"]).optional(),
});

export const updateReporteSchema = z.object({
  estado: z.enum(["Nuevo", "Visto", "En proceso", "Resuelto"]).optional(),
  resolucionDetalle: z.string().optional(),
  atendidoPor: z.string().optional(),
  prioridad: z.enum(["Alta", "Media", "Baja"]).optional(),
});
