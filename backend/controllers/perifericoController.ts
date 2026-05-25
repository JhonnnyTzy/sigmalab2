import { Request, Response, NextFunction } from "express";
import * as perifericoModel from "../models/perifericoModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { laboratorioId, tipo, estado } = req.query;
    const perifericos = await perifericoModel.findAllPerifericos({
      laboratorioId: laboratorioId as string, tipo: tipo as string, estado: estado as string,
    });
    res.json(perifericos);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await perifericoModel.findPerifericoById(req.params.id);
    res.json(p);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await perifericoModel.createPeriferico(req.body);
    res.status(201).json(p);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await perifericoModel.updatePeriferico(req.params.id, req.body);
    res.json(p);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await perifericoModel.deletePeriferico(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
