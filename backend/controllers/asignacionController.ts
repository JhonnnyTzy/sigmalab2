import { Request, Response, NextFunction } from "express";
import * as asignacionModel from "../models/asignacionModel";
import { createAuditLog, recordFieldChanges } from "../models/auditModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { tecnicoId, estado, equipoCodigo } = req.query;
    const asignaciones = await asignacionModel.findAllAsignaciones({
      tecnicoId: tecnicoId as string, estado: estado as string, equipoCodigo: equipoCodigo as string,
    });
    res.json(asignaciones);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const a = await asignacionModel.findAsignacionById(req.params.id);
    res.json(a);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const a = await asignacionModel.createAsignacion(req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Crear asignación",
      detalle: `Se asignó equipo ${req.body.equipoCodigo} a técnico ${req.body.tecnicoId}`,
      modulo: "Asignaciones", entidad: a.id, tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "asignaciones", registroId: a.id, usuarioId: req.user?.userId,
      operacion: "CREAR", after: req.body,
    });
    res.status(201).json(a);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await asignacionModel.findAsignacionById(req.params.id);
    const a = await asignacionModel.updateAsignacion(req.params.id, req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Actualizar asignación",
      detalle: `Se actualizó asignación ${req.params.id} → ${req.body.estado || "sin cambio de estado"}`,
      modulo: "Asignaciones", entidad: req.params.id, tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "asignaciones", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: before as any, after: { ...before, ...req.body } as any,
    });
    res.json(a);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await asignacionModel.findAsignacionById(req.params.id);
    await asignacionModel.deleteAsignacion(req.params.id);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Eliminar asignación",
      detalle: `Se eliminó asignación ${req.params.id}`,
      modulo: "Asignaciones", entidad: req.params.id, tipoAccion: "Eliminar",
    });
    await recordFieldChanges({
      tabla: "asignaciones", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ELIMINAR", before: before as any,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}
