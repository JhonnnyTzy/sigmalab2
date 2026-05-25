import { Request, Response, NextFunction } from "express";
import * as incidenciaModel from "../models/incidenciaModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { estadoId, equipoCodigo, laboratorioId, usuarioId } = req.query;
    const incidencias = await incidenciaModel.findAllIncidencias({
      estadoId: estadoId as string, equipoCodigo: equipoCodigo as string,
      laboratorioId: laboratorioId as string, usuarioId: usuarioId as string,
    });
    res.json(incidencias);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const inc = await incidenciaModel.findIncidenciaById(req.params.id);
    res.json(inc);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const inc = await incidenciaModel.createIncidencia(req.body);
    res.status(201).json(inc);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const inc = await incidenciaModel.updateIncidencia(req.params.id, req.body);
    res.json(inc);
  } catch (err) { next(err); }
}

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await incidenciaModel.getIncidenciaStats();
    res.json(stats);
  } catch (err) { next(err); }
}
