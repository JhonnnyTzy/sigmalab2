import { z } from "zod";

export const createLaboratorioSchema = z.object({
  id: z.string().min(1, "ID requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  edificioId: z.string().min(1, "Edificio requerido"),
  piso: z.number().int().min(0),
  capacidadEquipos: z.number().int().min(1),
  capacidadPersonas: z.number().int().min(1),
  encargadoId: z.string().optional(),
});

export const updateLaboratorioSchema = createLaboratorioSchema.partial();
