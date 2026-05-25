import { z } from "zod";

export const createIncidenciaSchema = z.object({
  equipoCodigo: z.string().optional(),
  laboratorioId: z.string().optional(),
  usuarioId: z.string().optional(),
  personaId: z.string().optional(),
  problema: z.string().min(1, "Problema requerido"),
  requiereSeguimiento: z.boolean().optional(),
  estadoId: z.string().optional(),
});

export const updateIncidenciaSchema = z.object({
  estadoId: z.string().optional(),
  resueltaEn: z.string().optional(),
  problema: z.string().optional(),
  requiereSeguimiento: z.boolean().optional(),
});
