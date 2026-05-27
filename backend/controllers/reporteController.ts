import { Request, Response, NextFunction } from "express";
import * as reporteModel from "../models/reporteModel";
import { createLog } from "../models/logModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { pasanteId, estado, prioridad } = req.query;
    const reportes = await reporteModel.findAllReportes({
      pasanteId: pasanteId as string, estado: estado as string, prioridad: prioridad as string,
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
    res.status(201).json(r);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await reporteModel.updateReporte(req.params.id, req.body);
    res.json(r);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await reporteModel.deleteReporte(req.params.id);
    createLog({
      usuarioId: req.user?.userId,
      accion: "Eliminar reporte",
      detalle: `Se eliminó reporte ${req.params.id}`,
      modulo: "Reportes",
      entidad: req.params.id,
      tipoAccion: "Eliminar",
    }).catch(() => {});
    res.status(204).send();
  } catch (err) { next(err); }
}
