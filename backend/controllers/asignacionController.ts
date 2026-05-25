import { Request, Response, NextFunction } from "express";
import * as asignacionModel from "../models/asignacionModel";

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
    res.status(201).json(a);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const a = await asignacionModel.updateAsignacion(req.params.id, req.body);
    res.json(a);
  } catch (err) { next(err); }
}
