import { Request, Response, NextFunction } from "express";
import * as logModel from "../models/logModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { modulo, usuarioId, limit } = req.query;
    const logs = await logModel.findAllLogs({
      modulo: modulo as string, usuarioId: usuarioId as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json(logs);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await logModel.createLog(req.body);
    res.status(201).json(log);
  } catch (err) { next(err); }
}
