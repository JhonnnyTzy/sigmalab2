import { Request, Response, NextFunction } from "express";
import * as mantenimientoModel from "../models/mantenimientoModel";
import { createAuditLog, recordFieldChanges } from "../models/auditModel";

const ESTADO_COMPLETADO = "completado";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { tipoId, estadoId, equipoCodigo, tecnicoId, laboratorioId } = req.query;
    const mants = await mantenimientoModel.findAllMantenimientos({
      tipoId: tipoId as string, estadoId: estadoId as string,
      equipoCodigo: equipoCodigo as string, tecnicoId: tecnicoId as string,
      laboratorioId: laboratorioId as string,
    });
    res.json(mants);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const mant = await mantenimientoModel.findMantenimientoById(req.params.id);
    res.json(mant);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const mant = await mantenimientoModel.createMantenimiento(req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Crear mantenimiento",
      detalle: `Se creó mantenimiento ${mant.id} para equipo ${req.body.equipoCodigo}`,
      modulo: "Mantenimientos", entidad: mant.id, tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "mantenimientos", registroId: mant.id, usuarioId: req.user?.userId,
      operacion: "CREAR", after: req.body,
    });
    res.status(201).json(mant);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await mantenimientoModel.findMantenimientoById(req.params.id);

    // Validar flujo de estados: no retroceder de Completado
    if (before.estadoId === ESTADO_COMPLETADO && req.body.estadoId && req.body.estadoId !== ESTADO_COMPLETADO) {
      res.status(400).json({ error: "No se puede retroceder el estado de un mantenimiento completado" });
      return;
    }

    // Auto-asignar horaFin cuando se completa
    const updateData = { ...req.body };
    if (updateData.estadoId === ESTADO_COMPLETADO && before.estadoId !== ESTADO_COMPLETADO) {
      const now = new Date();
      updateData.horaFin = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }

    const mant = await mantenimientoModel.updateMantenimiento(req.params.id, updateData);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Actualizar mantenimiento",
      detalle: `Se actualizó mantenimiento ${req.params.id} → estado: ${updateData.estadoId || before.estadoId}`,
      modulo: "Mantenimientos", entidad: req.params.id, tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "mantenimientos", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: before as any, after: { ...before, ...updateData } as any,
    });
    res.json(mant);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await mantenimientoModel.findMantenimientoById(req.params.id);
    await mantenimientoModel.deleteMantenimiento(req.params.id);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Eliminar mantenimiento",
      detalle: `Se eliminó mantenimiento ${req.params.id}`,
      modulo: "Mantenimientos", entidad: req.params.id, tipoAccion: "Eliminar",
    });
    await recordFieldChanges({
      tabla: "mantenimientos", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ELIMINAR", before: before as any,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await mantenimientoModel.getMantenimientoStats();
    res.json(stats);
  } catch (err) { next(err); }
}

export async function saveDetalle(req: Request, res: Response, next: NextFunction) {
  try {
    const detalle = await mantenimientoModel.createDetalle(req.body);
    if (req.body.checklists?.length) {
      await mantenimientoModel.addChecklist(detalle.id, req.body.checklists);
    }
    if (req.body.insumosUsados?.length) {
      await mantenimientoModel.addInsumoUsado(detalle.id, req.body.insumosUsados);
    }
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Guardar detalle mantenimiento",
      detalle: `Se guardó detalle para mantenimiento ${req.body.mantenimientoId}`,
      modulo: "Mantenimientos", entidad: req.body.mantenimientoId, tipoAccion: "Actualizar",
    });
    res.status(201).json(detalle);
  } catch (err) { next(err); }
}
