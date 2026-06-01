import { Request, Response, NextFunction } from "express";
import * as incidenciaModel from "../models/incidenciaModel";
import { createAuditLog, recordFieldChanges } from "../models/auditModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { estadoId, equipoCodigo, laboratorioId, usuarioId } = req.query;
    const incs = await incidenciaModel.findAllIncidencias({
      estadoId: estadoId as string, equipoCodigo: equipoCodigo as string,
      laboratorioId: laboratorioId as string, usuarioId: usuarioId as string,
    });
    res.json(incs);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const inc = await incidenciaModel.findIncidenciaById(req.params.id);
    res.json(inc);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const inc = await incidenciaModel.createIncidencia(req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Crear incidencia",
      detalle: `Se creó incidencia ${inc.id}: ${req.body.problema?.substring(0, 100)}`,
      modulo: "Incidencias", entidad: inc.id, tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "incidencias", registroId: inc.id, usuarioId: req.user?.userId,
      operacion: "CREAR", after: req.body,
    });
    res.status(201).json(inc);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await incidenciaModel.findIncidenciaById(req.params.id);
    const inc = await incidenciaModel.updateIncidencia(req.params.id, req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Actualizar incidencia",
      detalle: `Se actualizó incidencia ${req.params.id} → ${req.body.estadoId || "sin cambio de estado"}`,
      modulo: "Incidencias", entidad: req.params.id, tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "incidencias", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: before as any, after: { ...before, ...req.body } as any,
    });
    res.json(inc);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await incidenciaModel.findIncidenciaById(req.params.id);
    await incidenciaModel.deleteIncidencia(req.params.id);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Eliminar incidencia",
      detalle: `Se eliminó incidencia ${req.params.id}`,
      modulo: "Incidencias", entidad: req.params.id, tipoAccion: "Eliminar",
    });
    await recordFieldChanges({
      tabla: "incidencias", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ELIMINAR", before: before as any,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await incidenciaModel.getIncidenciaStats();
    res.json(stats);
  } catch (err) { next(err); }
}
