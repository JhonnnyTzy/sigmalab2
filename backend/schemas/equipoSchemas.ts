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
  codigoItic: z.string().optional(),
  codigoFacultativo: z.string().optional(),
  codigoUmsa: z.string().optional(),
  estadoId: z.string().optional(),
  fechaCompra: z.string().optional(),
});

export const updateEquipoSchema = createEquipoSchema.partial();

export const decommissionEquipoSchema = z.object({
  motivo: z.string().min(1, "Motivo de baja es requerido"),
  fechaBaja: z.string().optional(),
});

export const replaceEquipoSchema = z.object({
  nuevoCodigo: z.string().min(1, "Código del nuevo equipo requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  laboratorioId: z.string().min(1, "Laboratorio requerido"),
  fila: z.string().optional(),
  puesto: z.string().optional(),
  sistemaOperativo: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  codigoItic: z.string().optional(),
  codigoFacultativo: z.string().optional(),
  codigoUmsa: z.string().optional(),
  motivoBaja: z.string().optional(),
  reasignarPerifericos: z.boolean().optional().default(true),
});
