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
    fotoUrl?: string | null;
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
      fotoUrl: user.persona.fotoUrl,
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
    fechaIngreso: user.persona.fechaIngresoPasante,
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
  ci?: string;
  direccion?: string;
  email?: string;
  registro?: string;
  celular?: string;
  fechaIngreso?: string;
}) {
  // Validate duplicates
  if (data.email) {
    const existingEmail = await prisma.persona.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existingEmail) throw new AppError("Ya existe una persona con ese email", 409);
  }
  if (data.ci) {
    const existingCi = await prisma.persona.findUnique({ where: { ci: data.ci } });
    if (existingCi) throw new AppError("Ya existe una persona con ese CI", 409);
  }
  if (data.registro) {
    const existingReg = await prisma.persona.findUnique({ where: { registroUniversitario: data.registro } });
    if (existingReg) throw new AppError("Ya existe una persona con ese registro universitario", 409);
  }

  const hashed = await bcrypt.hash(data.password, 12);

  // Create Persona first if personaId not provided
  let personaId = data.personaId;
  let personaCreatedId: string | null = null;
  if (!personaId) {
    const persona = await prisma.persona.create({
      data: {
        id: `P-${Date.now()}`,
        nombres: data.nombres,
        paterno: data.paterno,
        materno: data.materno || null,
        ci: data.ci || null,
        direccion: data.direccion || null,
        email: data.email ? data.email.toLowerCase() : null,
        registroUniversitario: data.registro || null,
        celular: data.celular || null,
        fechaIngresoPasante: data.fechaIngreso ? new Date(data.fechaIngreso) : null,
      },
    });
    personaId = persona.id;
    personaCreatedId = persona.id;
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

  // Create initial historial entry if fechaIngreso provided and role is pasante
  if (data.fechaIngreso) {
    const pasanteRoles = ["preventivo", "correctivo", "estudiante"];
    if (pasanteRoles.includes(data.roleId)) {
      await prisma.pasanteHistorial.create({
        data: {
          id: `PH-${Date.now()}`,
          usuarioId: user.id,
          fechaIngreso: new Date(data.fechaIngreso),
          motivo: "Ingreso inicial a pasantía",
        },
      });
    }
  }

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
    fechaIngreso: u.persona.fechaIngresoPasante,
    createdAt: u.createdAt,
  }));
}

export async function findRawUser(id: string) {
  const user = await prisma.usuario.findUnique({
    where: { id },
    include: { persona: true, rol: true },
  });
  if (!user) throw new AppError("Usuario no encontrado", 404);
  return user;
}

export async function updateUser(id: string, data: Partial<{ roleId: string; activo: boolean; password: string; nombres?: string; paterno?: string; materno?: string; email?: string; registro?: string; celular?: string; fechaIngreso?: string }>) {
  const existing = await prisma.usuario.findUnique({ where: { id }, include: { persona: true } });
  if (!existing) throw new AppError("Usuario no encontrado", 404);

  const updateData: any = {};
  if (data.roleId) updateData.roleId = data.roleId;
  if (data.activo !== undefined) updateData.activo = data.activo;
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 12);

  // Update persona fields if provided
  if (existing.persona) {
    const personaData: any = {};
    if (data.nombres !== undefined) personaData.nombres = data.nombres;
    if (data.paterno !== undefined) personaData.paterno = data.paterno;
    if (data.materno !== undefined) personaData.materno = data.materno;
    if (data.email !== undefined) personaData.email = data.email;
    if (data.registro !== undefined) personaData.registroUniversitario = data.registro;
    if (data.celular !== undefined) personaData.celular = data.celular;
    if (data.fechaIngreso !== undefined) personaData.fechaIngresoPasante = new Date(data.fechaIngreso);
    if (Object.keys(personaData).length > 0) {
      await prisma.persona.update({ where: { id: existing.persona.id }, data: personaData });
    }
  }

  // Create historial entry if fechaIngreso changed for pasante roles
  if (data.fechaIngreso !== undefined) {
    const pasanteRoles = ["preventivo", "correctivo", "estudiante"];
    if (pasanteRoles.includes(existing.roleId)) {
      await prisma.pasanteHistorial.create({
        data: {
          id: `PH-${Date.now()}`,
          usuarioId: id,
          fechaIngreso: new Date(data.fechaIngreso),
          motivo: "Actualización de fecha de ingreso",
        },
      });
    }
  }

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
