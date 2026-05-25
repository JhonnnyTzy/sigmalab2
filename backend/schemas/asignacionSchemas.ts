import { z } from "zod";

export const createAsignacionSchema = z.object({
  equipoCodigo: z.string().min(1),
  laboratorioId: z.string().optional(),
  tecnicoId: z.string().min(1),
  problema: z.string().min(1),
  prioridad: z.enum(["Alta", "Media", "Baja"]).optional(),
  fecha: z.string().optional(),
});

export const updateAsignacionSchema = z.object({
  estado: z.enum(["Pendiente", "En proceso", "Completado"]).optional(),
  prioridad: z.enum(["Alta", "Media", "Baja"]).optional(),
  problema: z.string().optional(),
  tecnicoId: z.string().optional(),
});
