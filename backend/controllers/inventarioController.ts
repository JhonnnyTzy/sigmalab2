import { Request, Response, NextFunction } from "express";
import * as inventarioModel from "../models/inventarioModel";
import { createAuditLog, recordFieldChanges } from "../models/auditModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoriaId, estado, laboratorioId } = req.query;
    const items = await inventarioModel.findAllInventario({
      categoriaId: categoriaId as string, estado: estado as string,
      laboratorioId: laboratorioId as string,
    });
    res.json(items);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventarioModel.findInventarioById(req.params.id);
    res.json(item);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventarioModel.createInventarioItem(req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Crear ítem inventario",
      detalle: `Se creó ítem inventario ${item.id} - ${req.body.codigoItic}`,
      modulo: "Inventario", entidad: item.id, tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "inventario", registroId: item.id, usuarioId: req.user?.userId,
      operacion: "CREAR", after: req.body,
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await inventarioModel.findInventarioById(req.params.id);
    const item = await inventarioModel.updateInventarioItem(req.params.id, req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Actualizar ítem inventario",
      detalle: `Se actualizó ítem inventario ${req.params.id}`,
      modulo: "Inventario", entidad: req.params.id, tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "inventario", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: before as any, after: { ...before, ...req.body } as any,
    });
    res.json(item);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await inventarioModel.findInventarioById(req.params.id);
    await inventarioModel.deleteInventarioItem(req.params.id);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Eliminar ítem inventario",
      detalle: `Se eliminó ítem inventario ${req.params.id}`,
      modulo: "Inventario", entidad: req.params.id, tipoAccion: "Eliminar",
    });
    await recordFieldChanges({
      tabla: "inventario", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ELIMINAR", before: before as any,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await inventarioModel.getInventarioStats();
    res.json(stats);
  } catch (err) { next(err); }
}
