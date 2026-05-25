import { Request, Response, NextFunction } from "express";
import * as materiaModel from "../models/materiaModel";

export async function getAllMaterias(_req: Request, res: Response, next: NextFunction) {
  try {
    const materias = await materiaModel.findAllMaterias();
    res.json(materias);
  } catch (err) { next(err); }
}

export async function getMateriaByCodigo(req: Request, res: Response, next: NextFunction) {
  try {
    const materia = await materiaModel.findMateriaByCodigo(req.params.codigo);
    res.json(materia);
  } catch (err) { next(err); }
}

export async function getAllGrupos(req: Request, res: Response, next: NextFunction) {
  try {
    const { materiaCodigo, docenteId, gestion } = req.query;
    const grupos = await materiaModel.findAllGrupos({
      materiaCodigo: materiaCodigo as string, docenteId: docenteId as string,
      gestion: gestion ? parseInt(gestion as string) : undefined,
    });
    res.json(grupos);
  } catch (err) { next(err); }
}

export async function getHorariosByLab(req: Request, res: Response, next: NextFunction) {
  try {
    const { dia } = req.query;
    const horarios = await materiaModel.findHorariosByLaboratorio(
      req.params.laboratorioId,
      dia ? parseInt(dia as string) : undefined,
    );
    res.json(horarios);
  } catch (err) { next(err); }
}
