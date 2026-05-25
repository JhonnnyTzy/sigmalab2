import { Request, Response, NextFunction } from "express";
import * as inventarioModel from "../models/inventarioModel";

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
    res.status(201).json(item);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventarioModel.updateInventarioItem(req.params.id, req.body);
    res.json(item);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await inventarioModel.deleteInventarioItem(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await inventarioModel.getInventarioStats();
    res.json(stats);
  } catch (err) { next(err); }
}
