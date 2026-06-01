import { Request, Response, NextFunction } from "express";
import * as reporteModel from "../models/reporteModel";
import { createAuditLog, recordFieldChanges } from "../models/auditModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { estado, pasanteId, laboratorioId } = req.query;
    const reportes = await reporteModel.findAllReportes({
      estado: estado as string, pasanteId: pasanteId as string, laboratorioId: laboratorioId as string,
    });
    res.json(reportes);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await reporteModel.findReporteById(req.params.id);
    res.json(r);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await reporteModel.createReporte(req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Crear reporte",
      detalle: `Se creó reporte ${r.id}: ${req.body.titulo}`,
      modulo: "Reportes", entidad: r.id, tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "reportes_pasante", registroId: r.id, usuarioId: req.user?.userId,
      operacion: "CREAR", after: req.body,
    });
    res.status(201).json(r);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await reporteModel.findReporteById(req.params.id);
    const r = await reporteModel.updateReporte(req.params.id, req.body);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Actualizar reporte",
      detalle: `Se actualizó reporte ${req.params.id} → ${req.body.estado || "sin cambio de estado"}`,
      modulo: "Reportes", entidad: req.params.id, tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "reportes_pasante", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR", before: before as any, after: { ...before, ...req.body } as any,
    });
    res.json(r);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await reporteModel.findReporteById(req.params.id);
    await reporteModel.deleteReporte(req.params.id);
    await createAuditLog({
      usuarioId: req.user?.userId, accion: "Eliminar reporte",
      detalle: `Se eliminó reporte ${req.params.id}`,
      modulo: "Reportes", entidad: req.params.id, tipoAccion: "Eliminar",
    });
    await recordFieldChanges({
      tabla: "reportes_pasante", registroId: req.params.id, usuarioId: req.user?.userId,
      operacion: "ELIMINAR", before: before as any,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}
