import { z } from "zod";

export const createLogSchema = z.object({
  usuarioId: z.string().optional(),
  accion: z.string().min(1),
  detalle: z.string().optional(),
  modulo: z.string().optional(),
  entidad: z.string().optional(),
  equipoCodigo: z.string().optional(),
  tipoAccion: z.enum(["Crear", "Editar", "Eliminar", "Asignar", "Resolver", "Actualizar", "Otro"]).optional(),
  estado: z.enum(["Éxito", "Error", "Advertencia"]).optional(),
  ipOrigen: z.string().optional(),
});
