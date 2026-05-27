import { Request, Response, NextFunction } from "express";
import * as laboratorioModel from "../models/laboratorioModel";
import { createLog } from "../models/logModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const labs = await laboratorioModel.findAllLaboratorios();
    res.json(labs);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const lab = await laboratorioModel.findLaboratorioById(req.params.id);
    res.json(lab);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const lab = await laboratorioModel.createLaboratorio(req.body);
    res.status(201).json(lab);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const lab = await laboratorioModel.updateLaboratorio(req.params.id, req.body);
    res.json(lab);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await laboratorioModel.deleteLaboratorio(req.params.id);
    createLog({
      usuarioId: req.user?.userId,
      accion: "Eliminar laboratorio",
      detalle: `Se eliminó laboratorio ${req.params.id}`,
      modulo: "Laboratorios",
      entidad: req.params.id,
      tipoAccion: "Eliminar",
    }).catch(() => {});
    res.status(204).send();
  } catch (err) { next(err); }
}
