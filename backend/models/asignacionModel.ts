import { prisma } from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export async function findAllAsignaciones(params?: { tecnicoId?: string; estado?: string; equipoCodigo?: string }) {
  return prisma.asignacion.findMany({
    where: {
      ...(params?.tecnicoId && { tecnicoId: params.tecnicoId }),
      ...(params?.estado && { estado: params.estado }),
      ...(params?.equipoCodigo && { equipoCodigo: params.equipoCodigo }),
    },
    include: {
      equipo: { include: { laboratorio: true } },
      tecnico: { include: { persona: true } },
    },
    orderBy: [{ prioridad: "asc" }, { fecha: "desc" }],
  });
}

export async function findAsignacionById(id: string) {
  const a = await prisma.asignacion.findUnique({
    where: { id },
    include: { equipo: { include: { laboratorio: true } }, tecnico: { include: { persona: true } } },
  });
  if (!a) throw new AppError("Asignación no encontrada", 404);
  return a;
}

export async function createAsignacion(data: {
  equipoCodigo: string; laboratorioId?: string; tecnicoId: string;
  problema: string; prioridad?: string; fecha?: string;
}) {
  return prisma.asignacion.create({
    data: {
      id: `AS-${Date.now()}`,
      ...data,
      fecha: data.fecha ? new Date(data.fecha) : new Date(),
    },
    include: { equipo: true, tecnico: { include: { persona: true } } },
  });
}

export async function updateAsignacion(id: string, data: Partial<{
  estado: string; prioridad: string; problema: string; tecnicoId: string;
}>) {
  const existing = await prisma.asignacion.findUnique({ where: { id } });
  if (!existing) throw new AppError("Asignación no encontrada", 404);
  return prisma.asignacion.update({ where: { id }, data, include: { equipo: true, tecnico: { include: { persona: true } } } });
}
