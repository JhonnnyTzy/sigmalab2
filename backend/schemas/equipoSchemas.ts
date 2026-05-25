import { z } from "zod";

export const createEquipoSchema = z.object({
  codigo: z.string().min(1, "Código requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  laboratorioId: z.string().min(1, "Laboratorio requerido"),
  fila: z.string().optional(),
  puesto: z.string().optional(),
  sistemaOperativo: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  estadoId: z.string().optional(),
  fechaCompra: z.string().optional(),
});

export const updateEquipoSchema = createEquipoSchema.partial();
