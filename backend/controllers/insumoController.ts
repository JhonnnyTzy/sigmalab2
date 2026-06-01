import { Request, Response, NextFunction } from "express";
import * as insumoModel from "../models/insumoModel";
import { createAuditLog, recordFieldChanges } from "../models/auditModel";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const insumos = await insumoModel.findAllInsumos();
    res.json(insumos);
  } catch (err) { next(err); }
}

export async function getByNombre(req: Request, res: Response, next: NextFunction) {
  try {
    const insumo = await insumoModel.findInsumoByNombre(req.params.nombre);
    res.json(insumo);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const insumo = await insumoModel.createInsumo(req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Crear insumo",
      detalle: `Se creó insumo ${req.body.nombre}`,
      modulo: "Insumos", entidad: req.body.nombre, tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "insumos", registroId: req.body.nombre, usuarioId: req.user?.userId,
      operacion: "CREAR", after: req.body,
    });
    res.status(201).json(insumo);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await insumoModel.findInsumoByNombre(req.params.nombre);
    const insumo = await insumoModel.updateInsumo(req.params.nombre, req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Actualizar insumo",
      detalle: `Se actualizó insumo ${req.params.nombre}`,
      modulo: "Insumos", entidad: req.params.nombre, tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "insumos", registroId: req.params.nombre, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: before as any, after: { ...before, ...req.body } as any,
    });
    res.json(insumo);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await insumoModel.findInsumoByNombre(req.params.nombre);
    await insumoModel.deleteInsumo(req.params.nombre);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Eliminar insumo",
      detalle: `Se eliminó insumo ${req.params.nombre}`,
      modulo: "Insumos", entidad: req.params.nombre, tipoAccion: "Eliminar",
    });
    await recordFieldChanges({
      tabla: "insumos", registroId: req.params.nombre, usuarioId: req.user?.userId,
      operacion: "ELIMINAR", before: before as any,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getBajoStock(_req: Request, res: Response, next: NextFunction) {
  try {
    const insumos = await insumoModel.getInsumosBajoStock();
    res.json(insumos);
  } catch (err) { next(err); }
}
