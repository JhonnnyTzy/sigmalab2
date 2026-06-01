import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "El identificador es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const createUserSchema = z.object({
  personaId: z.string().optional(),
  roleId: z.string().min(1, "Rol requerido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  nombres: z.string().min(1, "Nombres requeridos"),
  paterno: z.string().min(1, "Apellido paterno requerido"),
  materno: z.string().optional(),
  ci: z.string().min(5, "CI requerido").optional(),
  direccion: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  registro: z.string().optional(),
  celular: z.string().optional(),
  fechaIngreso: z.string().optional(),
});

export const updateUserSchema = z.object({
  roleId: z.string().optional(),
  activo: z.boolean().optional(),
  password: z.string().min(6).optional(),
  nombres: z.string().min(1).optional(),
  paterno: z.string().min(1).optional(),
  materno: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  registro: z.string().optional(),
  celular: z.string().optional(),
  fechaIngreso: z.string().optional(),
});

export const updateProfileSchema = z.object({
  nombres: z.string().min(1).optional(),
  paterno: z.string().min(1).optional(),
  materno: z.string().optional(),
  email: z.string().email().optional(),
  celular: z.string().optional(),
  fotoUrl: z.string().optional(),
  password: z.string().min(6).optional(),
});
