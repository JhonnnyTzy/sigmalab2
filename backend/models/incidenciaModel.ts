import { prisma } from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export async function findAllIncidencias(params?: { estadoId?: string; equipoCodigo?: string; laboratorioId?: string; usuarioId?: string }) {
  return prisma.incidencia.findMany({
    where: {
      ...(params?.estadoId && { estadoId: params.estadoId }),
      ...(params?.equipoCodigo && { equipoCodigo: params.equipoCodigo }),
      ...(params?.laboratorioId && { laboratorioId: params.laboratorioId }),
      ...(params?.usuarioId && { usuarioId: params.usuarioId }),
    },
    include: {
      equipo: true,
      laboratorio: true,
      persona: true,
      estado: true,
    },
    orderBy: { fecha: "desc" },
  });
}

export async function findIncidenciaById(id: string) {
  const inc = await prisma.incidencia.findUnique({
    where: { id },
    include: { equipo: true, laboratorio: true, persona: true, estado: true },
  });
  if (!inc) throw new AppError("Incidencia no encontrada", 404);
  return inc;
}

export async function createIncidencia(data: {
  equipoCodigo?: string;
  laboratorioId?: string;
  usuarioId?: string;
  personaId?: string;
  problema: string;
  requiereSeguimiento?: boolean;
  estadoId?: string;
}) {
  return prisma.incidencia.create({
    data: {
      id: `INC-${Date.now()}`,
      equipoCodigo: data.equipoCodigo || null,
      laboratorioId: data.laboratorioId || null,
      usuarioId: data.usuarioId || null,
      personaId: data.personaId || null,
      problema: data.problema,
      requiereSeguimiento: data.requiereSeguimiento || false,
      estadoId: data.estadoId || "nuevo",
    },
    include: { equipo: true, laboratorio: true, persona: true, estado: true },
  });
}

export async function updateIncidencia(id: string, data: Partial<{
  estadoId: string;
  resueltaEn: string;
  problema: string;
  requiereSeguimiento: boolean;
}>) {
  const existing = await prisma.incidencia.findUnique({ where: { id } });
  if (!existing) throw new AppError("Incidencia no encontrada", 404);

  const updateData: any = { ...data };
  if (data.resueltaEn) updateData.resueltaEn = new Date(data.resueltaEn);

  return prisma.incidencia.update({
    where: { id },
    data: updateData,
    include: { equipo: true, laboratorio: true, estado: true },
  });
}

export async function getIncidenciaStats() {
  const porEstado = await prisma.incidencia.groupBy({ by: ["estadoId"], _count: { estadoId: true } });
  const estados = await prisma.estadoIncidencia.findMany();
  return {
    porEstado: porEstado.map((r) => ({
      nombre: estados.find((e) => e.id === r.estadoId)?.nombre || r.estadoId,
      total: r._count.estadoId,
    })),
    total: await prisma.incidencia.count(),
  };
}
