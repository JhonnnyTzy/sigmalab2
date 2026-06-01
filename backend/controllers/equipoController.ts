import { Request, Response, NextFunction } from "express";
import * as equipoModel from "../models/equipoModel";
import { createAuditLog, recordFieldChanges } from "../models/auditModel";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const equipos = await equipoModel.findAllEquipos();
    res.json(equipos);
  } catch (err) { next(err); }
}

export async function getByCodigo(req: Request, res: Response, next: NextFunction) {
  try {
    const equipo = await equipoModel.findEquipoByCodigo(req.params.codigo);
    res.json(equipo);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const equipo = await equipoModel.createEquipo(req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Crear equipo",
      detalle: `Se creó equipo ${req.body.codigo} - ${req.body.nombre}`,
      modulo: "Equipos", entidad: req.body.codigo, tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "equipos", registroId: req.body.codigo, usuarioId: req.user?.userId,
      operacion: "CREAR", after: req.body,
    });
    res.status(201).json(equipo);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await equipoModel.findEquipoByCodigo(req.params.codigo);
    const equipo = await equipoModel.updateEquipo(req.params.codigo, req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Actualizar equipo",
      detalle: `Se actualizó equipo ${req.params.codigo}`,
      modulo: "Equipos", entidad: req.params.codigo, tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "equipos", registroId: req.params.codigo, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: before as any, after: { ...before, ...req.body } as any,
    });
    res.json(equipo);
  } catch (err) { next(err); }
}

export async function getEstadisticas(_req: Request, res: Response, next: NextFunction) {
  try {
    const [porEstado, porLaboratorio] = await Promise.all([
      equipoModel.countByEstado(),
      equipoModel.countByLaboratorio(),
    ]);
    res.json({ porEstado, porLaboratorio });
  } catch (err) { next(err); }
}

export async function decommission(req: Request, res: Response, next: NextFunction) {
  try {
    const { motivo, fechaBaja } = req.body;
    const before = await equipoModel.findEquipoByCodigo(req.params.codigo);
    const equipo = await equipoModel.decommissionEquipo(req.params.codigo, motivo, fechaBaja);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Dar de baja equipo",
      detalle: `Se dio de baja equipo ${req.params.codigo}: ${motivo}`,
      modulo: "Equipos", entidad: req.params.codigo, tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "equipos", registroId: req.params.codigo, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: before as any, after: equipo as any,
    });
    res.json(equipo);
  } catch (err) { next(err); }
}

export async function replace(req: Request, res: Response, next: NextFunction) {
  try {
    const { motivoBaja, reasignarPerifericos, ...nuevoData } = req.body;
    const beforeOld = await equipoModel.findEquipoByCodigo(req.params.codigo);
    const result = await equipoModel.replaceEquipo(req.params.codigo, nuevoData, motivoBaja, reasignarPerifericos);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Reemplazar equipo",
      detalle: `Se reemplazó ${req.params.codigo} → ${nuevoData.codigo}`,
      modulo: "Equipos", entidad: nuevoData.codigo, tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "equipos", registroId: req.params.codigo, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: beforeOld as any, after: result.oldEquipo as any,
    });
    res.json(result);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await equipoModel.findEquipoByCodigo(req.params.codigo);
    await equipoModel.deleteEquipo(req.params.codigo);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Eliminar equipo",
      detalle: `Se eliminó equipo ${req.params.codigo}`,
      modulo: "Equipos", entidad: req.params.codigo, tipoAccion: "Eliminar",
    });
    await recordFieldChanges({
      tabla: "equipos", registroId: req.params.codigo, usuarioId: req.user?.userId,
      operacion: "ELIMINAR", before: before as any,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}
