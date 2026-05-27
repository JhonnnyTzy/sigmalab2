import { Request, Response, NextFunction } from "express";
import * as mantenimientoModel from "../models/mantenimientoModel";
import { createLog } from "../models/logModel";

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
    res.status(201).json(mant);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const mant = await mantenimientoModel.updateMantenimiento(req.params.id, req.body);
    res.json(mant);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await mantenimientoModel.deleteMantenimiento(req.params.id);
    createLog({
      usuarioId: req.user?.userId,
      accion: "Eliminar mantenimiento",
      detalle: `Se eliminó mantenimiento ${req.params.id}`,
      modulo: "Mantenimientos",
      entidad: req.params.id,
      tipoAccion: "Eliminar",
    }).catch(() => {});
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
    res.status(201).json(detalle);
  } catch (err) { next(err); }
}
