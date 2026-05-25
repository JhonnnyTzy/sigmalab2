import { z } from "zod";

export const createMantenimientoSchema = z.object({
  tipoId: z.string().min(1, "Tipo requerido"),
  equipoCodigo: z.string().min(1, "Equipo requerido"),
  tecnicoId: z.string().min(1, "Técnico requerido"),
  laboratorioId: z.string().optional(),
  fecha: z.string().min(1, "Fecha requerida"),
  horaInicio: z.string().optional(),
  horaFin: z.string().optional(),
  estadoId: z.string().min(1, "Estado requerido"),
});

export const updateMantenimientoSchema = z.object({
  estadoId: z.string().optional(),
  horaInicio: z.string().optional(),
  horaFin: z.string().optional(),
  fecha: z.string().optional(),
  tipoId: z.string().optional(),
  laboratorioId: z.string().optional(),
});

export const createDetalleSchema = z.object({
  mantenimientoId: z.string().min(1),
  descripcion: z.string().optional(),
  diagnostico: z.string().optional(),
  accionRealizada: z.string().optional(),
  resolucion: z.string().optional(),
  tipoIncidencia: z.string().optional(),
  estadoFinal: z.string().optional(),
  observaciones: z.string().optional(),
  recomendaciones: z.string().optional(),
  checklists: z.array(z.object({
    categoria: z.enum(["hardware", "software", "pruebas"]),
    item: z.string().min(1),
    estado: z.enum(["OK", "Regular", "Mal"]),
    observacion: z.string().optional(),
  })).optional(),
  insumosUsados: z.array(z.object({
    insumoNombre: z.string().min(1),
    cantidad: z.string().min(1),
  })).optional(),
});
