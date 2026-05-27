import { prisma } from "../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../middlewares/errorHandler";

export interface LoginResult {
  token: string;
  user: {
    id: string;
    roleId: string;
    role: string;
    nombres: string;
    paterno: string;
    materno?: string | null;
    email?: string | null;
    registro?: string | null;
  };
}

export async function loginUser(identifier: string, password: string): Promise<LoginResult> {
  const isNumeric = /^\d+$/.test(identifier);

  const user = await prisma.usuario.findFirst({
    where: isNumeric
      ? { persona: { registroUniversitario: identifier } }
      : { persona: { email: identifier.toLowerCase() } },
    include: { persona: true },
  });

  if (!user) throw new AppError("Usuario no encontrado", 404);
  if (!user.activo) throw new AppError("Cuenta desactivada", 403);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Contraseña incorrecta", 401);

  const payload = { userId: user.id, role: user.roleId };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

  return {
    token,
    user: {
      id: user.id,
      roleId: user.roleId,
      role: user.roleId,
      nombres: user.persona.nombres,
      paterno: user.persona.paterno,
      materno: user.persona.materno,
      email: user.persona.email,
      registro: user.persona.registroUniversitario,
    },
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    include: {
      persona: true,
      rol: true,
    },
  });
  if (!user) throw new AppError("Usuario no encontrado", 404);

  return {
    id: user.id,
    roleId: user.roleId,
    roleName: user.rol.nombre,
    nombres: user.persona.nombres,
    paterno: user.persona.paterno,
    materno: user.persona.materno,
    email: user.persona.email,
    registro: user.persona.registroUniversitario,
    celular: user.persona.celular,
    ci: user.persona.ci,
    fotoUrl: user.persona.fotoUrl,
    activo: user.activo,
    createdAt: user.createdAt,
  };
}

export async function createUser(data: {
  personaId?: string;
  roleId: string;
  password: string;
  nombres: string;
  paterno: string;
  materno?: string;
  email?: string;
  registro?: string;
  celular?: string;
}) {
  const hashed = await bcrypt.hash(data.password, 12);

  // Create Persona first if personaId not provided
  let personaId = data.personaId;
  if (!personaId) {
    const persona = await prisma.persona.create({
      data: {
        id: `P-${Date.now()}`,
        nombres: data.nombres,
        paterno: data.paterno,
        materno: data.materno || null,
        email: data.email || null,
        registroUniversitario: data.registro || null,
        celular: data.celular || null,
      },
    });
    personaId = persona.id;
  }

  const user = await prisma.usuario.create({
    data: {
      id: `u-${Date.now()}`,
      personaId,
      roleId: data.roleId,
      passwordHash: hashed,
    },
    include: { persona: true, rol: true },
  });

  return {
    id: user.id,
    roleId: user.roleId,
    roleName: user.rol.nombre,
    nombres: user.persona.nombres,
    paterno: user.persona.paterno,
  };
}

export async function findAllUsers() {
  const users = await prisma.usuario.findMany({
    include: { persona: true, rol: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    roleId: u.roleId,
    roleName: u.rol.nombre,
    nombres: u.persona.nombres,
    paterno: u.persona.paterno,
    materno: u.persona.materno,
    email: u.persona.email,
    registro: u.persona.registroUniversitario,
    celular: u.persona.celular,
    activo: u.activo,
    createdAt: u.createdAt,
  }));
}

export async function updateUser(id: string, data: Partial<{ roleId: string; activo: boolean; password: string }>) {
  const existing = await prisma.usuario.findUnique({ where: { id } });
  if (!existing) throw new AppError("Usuario no encontrado", 404);

  const updateData: any = {};
  if (data.roleId) updateData.roleId = data.roleId;
  if (data.activo !== undefined) updateData.activo = data.activo;
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 12);

  return prisma.usuario.update({ where: { id }, data: updateData, include: { persona: true, rol: true } });
}

export async function deleteUser(id: string) {
  const existing = await prisma.usuario.findUnique({ where: { id } });
  if (!existing) throw new AppError("Usuario no encontrado", 404);
  await prisma.usuario.update({ where: { id }, data: { activo: false } });
}

export async function updateProfile(userId: string, data: {
  nombres?: string; paterno?: string; materno?: string;
  email?: string; celular?: string; fotoUrl?: string; password?: string;
}) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    include: { persona: true },
  });
  if (!user) throw new AppError("Usuario no encontrado", 404);

  // Update persona fields
  const personaData: any = {};
  if (data.nombres !== undefined) personaData.nombres = data.nombres;
  if (data.paterno !== undefined) personaData.paterno = data.paterno;
  if (data.materno !== undefined) personaData.materno = data.materno;
  if (data.email !== undefined) personaData.email = data.email;
  if (data.celular !== undefined) personaData.celular = data.celular;
  if (data.fotoUrl !== undefined) personaData.fotoUrl = data.fotoUrl;

  if (Object.keys(personaData).length > 0) {
    await prisma.persona.update({ where: { id: user.personaId }, data: personaData });
  }

  // Update password if provided
  if (data.password) {
    await prisma.usuario.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(data.password, 12) },
    });
  }

  // Return updated profile
  return getProfile(userId);
}
