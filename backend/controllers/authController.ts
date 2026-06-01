import { Request, Response, NextFunction } from "express";
import * as authModel from "../models/authModel";
import { createAuditLog, recordFieldChanges } from "../models/auditModel";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = req.body;
    const result = await authModel.loginUser(identifier, password);
    const ip = req.ip || req.socket.remoteAddress || "desconocida";
    const ua = req.headers["user-agent"] || "";
    createAuditLog({
      usuarioId: result.user.id,
      accion: "Inicio de sesión",
      detalle: `Inicio de sesión exitoso: ${identifier} | IP: ${ip} | ${ua}`,
      modulo: "Autenticación",
      tipoAccion: "Otro",
      ipOrigen: ip,
    });
    res.json(result);
  } catch (err) {
    const ip = req.ip || req.socket.remoteAddress || "desconocida";
    const ua = req.headers["user-agent"] || "";
    createAuditLog({
      accion: "Intento de inicio de sesión fallido",
      detalle: `Intento fallido: ${req.body?.identifier || "desconocido"} | IP: ${ip} | ${ua}`,
      modulo: "Autenticación",
      tipoAccion: "Otro",
      ipOrigen: ip,
    });
    next(err);
  }
}

export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authModel.getProfile(req.user!.userId);
    res.json(user);
  } catch (err) { next(err); }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authModel.createUser(req.body);
    const fullUser = await authModel.getProfile(user.id);
    await createAuditLog({
      usuarioId: req.user?.userId,
      accion: "Crear usuario",
      detalle: `Se creó usuario ${user.nombres} ${user.paterno} (${user.id})`,
      modulo: "Usuarios",
      entidad: user.id,
      tipoAccion: "Crear",
    });
    await recordFieldChanges({
      tabla: "usuarios",
      registroId: user.id,
      usuarioId: req.user?.userId,
      operacion: "CREAR",
      after: fullUser as any,
    });
    res.status(201).json(user);
  } catch (err) { next(err); }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await authModel.findAllUsers();
    res.json(users);
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await authModel.findRawUser(req.params.id);
    const user = await authModel.updateUser(req.params.id, req.body);
    const after = await authModel.getProfile(req.params.id);
    await createAuditLog({
      usuarioId: req.user?.userId,
      accion: "Actualizar usuario",
      detalle: `Se actualizó usuario ${req.params.id}`,
      modulo: "Usuarios",
      entidad: req.params.id,
      tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "usuarios",
      registroId: req.params.id,
      usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR",
      before: before as any,
      after: after as any,
    });
    res.json(user);
  } catch (err) { next(err); }
}

export async function removeUser(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await authModel.getProfile(req.params.id);
    await authModel.deleteUser(req.params.id);
    await createAuditLog({
      usuarioId: req.user?.userId,
      accion: "Eliminar usuario",
      detalle: `Se eliminó usuario ${req.params.id}`,
      modulo: "Usuarios",
      entidad: req.params.id,
      tipoAccion: "Eliminar",
    });
    await recordFieldChanges({
      tabla: "usuarios",
      registroId: req.params.id,
      usuarioId: req.user?.userId,
      operacion: "ELIMINAR",
      before: before as any,
    });
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const before = await authModel.getProfile(req.user!.userId);
    const user = await authModel.updateProfile(req.user!.userId, req.body);
    const after = await authModel.getProfile(req.user!.userId);
    await createAuditLog({
      usuarioId: req.user?.userId,
      accion: "Actualizar perfil",
      detalle: `Se actualizó el perfil de ${req.user!.userId}`,
      modulo: "Usuarios",
      entidad: req.user!.userId,
      tipoAccion: "Actualizar",
    });
    await recordFieldChanges({
      tabla: "usuarios",
      registroId: req.user!.userId,
      usuarioId: req.user?.userId,
      operacion: "ACTUALIZAR",
      before: before as any,
      after: after as any,
    });
    res.json(user);
  } catch (err) { next(err); }
}

export async function getPasanteHistorial(req: Request, res: Response, next: NextFunction) {
  try {
    const { prisma } = require("../config/database");
    const historial = await prisma.pasanteHistorial.findMany({
      where: { usuarioId: req.params.userId },
      orderBy: { fechaCambio: "desc" },
    });
    res.json(historial);
  } catch (err) { next(err); }
}
