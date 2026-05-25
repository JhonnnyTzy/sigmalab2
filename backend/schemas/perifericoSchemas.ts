import { z } from "zod";

export const createPerifericoSchema = z.object({
  id: z.string().min(1),
  tipo: z.string().min(1),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  laboratorioId: z.string().optional(),
  equipoCodigo: z.string().optional(),
  estado: z.string().optional(),
});

export const updatePerifericoSchema = createPerifericoSchema.partial();
