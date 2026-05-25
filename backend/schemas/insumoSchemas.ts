import { z } from "zod";

export const createInsumoSchema = z.object({
  nombre: z.string().min(1),
  unidadMedida: z.string().min(1),
  stock: z.number().int().min(0).optional(),
  stockMinimo: z.number().int().min(0).optional(),
});

export const updateInsumoSchema = z.object({
  unidadMedida: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  stockMinimo: z.number().int().min(0).optional(),
});
