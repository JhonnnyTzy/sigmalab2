import { z } from "zod";

export const createInsumoSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  tipo: z.string().optional(),
  unidadMedida: z.string().min(1, "Unidad requerida"),
  stock: z.number().int().min(0).optional(),
  stockMinimo: z.number().int().min(0).optional(),
});

export const updateInsumoSchema = createInsumoSchema.partial();
