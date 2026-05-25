import { Request, Response, NextFunction } from "express";
import * as insumoModel from "../models/insumoModel";

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
    res.status(201).json(insumo);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const insumo = await insumoModel.updateInsumo(req.params.nombre, req.body);
    res.json(insumo);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await insumoModel.deleteInsumo(req.params.nombre);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getBajoStock(_req: Request, res: Response, next: NextFunction) {
  try {
    const insumos = await insumoModel.getInsumosBajoStock();
    res.json(insumos);
  } catch (err) { next(err); }
}
