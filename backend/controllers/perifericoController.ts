import { Request, Response, NextFunction } from "express";
import * as perifericoModel from "../models/perifericoModel";
import { createAuditLog, recordFieldChanges } from "../models/auditModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { laboratorioId, tipo, estado } = req.query;
    const perifericos = await perifericoModel.findAllPerifericos({
      laboratorioId: laboratorioId as string, tipo: tipo as string, estado: estado as string,
    });
    res.json(perifericos);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await perifericoModel.findPerifericoById(req.params.id);
    res.json(p);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await perifericoModel.createPeriferico(req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Crear periférico",
      detalle: `Se creó periférico ${req.body.id} - ${req.body.tipo}`,
      modulo: "Periféricos", entidad: req.body.id, tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "perifericos", registroId: req.body.id, usuarioId: req.user?.userId,
      operacion: "CREAR", after: req.body,
    });
    res.status(201).json(p);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await perifericoModel.findPerifericoById(req.params.id);
    const p = await perifericoModel.updatePeriferico(req.params.id, req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Actualizar periférico",
      detalle: `Se actualizó periférico ${req.params.id}`,
      modulo: "Periféricos", entidad: req.params.id, tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "perifericos", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: before as any, after: { ...before, ...req.body } as any,
    });
    res.json(p);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await perifericoModel.findPerifericoById(req.params.id);
    await perifericoModel.deletePeriferico(req.params.id);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Eliminar periférico",
      detalle: `Se eliminó periférico ${req.params.id}`,
      modulo: "Periféricos", entidad: req.params.id, tipoAccion: "Eliminar",
    });
    await recordFieldChanges({
      tabla: "perifericos", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ELIMINAR", before: before as any,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}
