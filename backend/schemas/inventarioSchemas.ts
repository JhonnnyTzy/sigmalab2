import { z } from "zod";

export const createInventarioSchema = z.object({
  categoriaId: z.string().min(1),
  codigoItic: z.string().min(1),
  codigoFacultativo: z.string().optional(),
  codigoUmsa: z.string().optional(),
  numeroSerie: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  estado: z.string().optional(),
  fechaIngreso: z.string().min(1),
  fechaAsignacion: z.string().optional(),
  laboratorioId: z.string().optional(),
  equipoCodigo: z.string().optional(),
  observaciones: z.string().optional(),
});

export const updateInventarioSchema = createInventarioSchema.partial();
