import { Request, Response, NextFunction } from "express";
import * as equipoModel from "../models/equipoModel";
import { createLog } from "../models/logModel";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const equipos = await equipoModel.findAllEquipos();
    res.json(equipos);
  } catch (err) { next(err); }
}

export async function getByCodigo(req: Request, res: Response, next: NextFunction) {
  try {
    const equipo = await equipoModel.findEquipoByCodigo(req.params.codigo);
    res.json(equipo);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const equipo = await equipoModel.createEquipo(req.body);
    res.status(201).json(equipo);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const equipo = await equipoModel.updateEquipo(req.params.codigo, req.body);
    res.json(equipo);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await equipoModel.deleteEquipo(req.params.codigo);
    createLog({
      usuarioId: req.user?.userId,
      accion: "Eliminar equipo",
      detalle: `Se eliminó equipo ${req.params.codigo}`,
      modulo: "Equipos",
      entidad: req.params.codigo,
      tipoAccion: "Eliminar",
    }).catch(() => {});
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getEstadisticas(_req: Request, res: Response, next: NextFunction) {
  try {
    const [porEstado, porLab, conProblemas] = await Promise.all([
      equipoModel.countByEstado(),
      equipoModel.countByLaboratorio(),
      equipoModel.findEquiposConProblemas(),
    ]);
    res.json({ porEstado, porLaboratorio: porLab, conProblemas });
  } catch (err) { next(err); }
}
