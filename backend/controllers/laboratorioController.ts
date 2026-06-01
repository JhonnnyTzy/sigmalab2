import { Request, Response, NextFunction } from "express";
import * as laboratorioModel from "../models/laboratorioModel";
import { createAuditLog, recordFieldChanges } from "../models/auditModel";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const labs = await laboratorioModel.findAllLaboratorios();
    res.json(labs);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const lab = await laboratorioModel.findLaboratorioById(req.params.id);
    res.json(lab);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const lab = await laboratorioModel.createLaboratorio(req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Crear laboratorio",
      detalle: `Se creó laboratorio ${req.body.nombre} (${req.body.id})`,
      modulo: "Laboratorios", entidad: req.body.id, tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "laboratorios", registroId: req.body.id, usuarioId: req.user?.userId,
      operacion: "CREAR", after: req.body,
    });
    res.status(201).json(lab);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await laboratorioModel.findLaboratorioById(req.params.id);
    const lab = await laboratorioModel.updateLaboratorio(req.params.id, req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Actualizar laboratorio",
      detalle: `Se actualizó laboratorio ${req.params.id}`,
      modulo: "Laboratorios", entidad: req.params.id, tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "laboratorios", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: before as any, after: { ...before, ...req.body } as any,
    });
    res.json(lab);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await laboratorioModel.findLaboratorioById(req.params.id);
    await laboratorioModel.deleteLaboratorio(req.params.id);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Eliminar laboratorio",
      detalle: `Se eliminó laboratorio ${req.params.id}`,
      modulo: "Laboratorios", entidad: req.params.id, tipoAccion: "Eliminar",
    });
    await recordFieldChanges({
      tabla: "laboratorios", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ELIMINAR", before: before as any,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}
