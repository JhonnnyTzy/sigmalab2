import { prisma } from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export async function findAllReportes(params?: { pasanteId?: string; estado?: string; prioridad?: string }) {
  return prisma.reportePasante.findMany({
    where: {
      ...(params?.pasanteId && { pasanteId: params.pasanteId }),
      ...(params?.estado && { estado: params.estado }),
      ...(params?.prioridad && { prioridad: params.prioridad }),
    },
    include: {
      pasante: { include: { persona: true } },
      atendidoPorUser: { include: { persona: true } },
      laboratorio: true,
    },
    orderBy: { fecha: "desc" },
  });
}

export async function findReporteById(id: string) {
  const r = await prisma.reportePasante.findUnique({
    where: { id },
    include: { pasante: { include: { persona: true } }, atendidoPorUser: { include: { persona: true } }, laboratorio: true },
  });
  if (!r) throw new AppError("Reporte no encontrado", 404);
  return r;
}

export async function createReporte(data: {
  pasanteId: string; titulo: string; descripcion: string;
  laboratorioId?: string; ubicacion?: string; categoria?: string;
  prioridad?: string;
}) {
  return prisma.reportePasante.create({
    data: {
      id: `RP-${Date.now()}`,
      ...data,
    },
    include: { pasante: { include: { persona: true } } },
  });
}

export async function updateReporte(id: string, data: Partial<{
  estado: string; resolucionDetalle: string; atendidoPor: string; prioridad: string;
}>) {
  const existing = await prisma.reportePasante.findUnique({ where: { id } });
  if (!existing) throw new AppError("Reporte no encontrado", 404);
  return prisma.reportePasante.update({
    where: { id }, data,
    include: { pasante: { include: { persona: true } }, atendidoPorUser: { include: { persona: true } } },
  });
}
