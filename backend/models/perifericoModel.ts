import { prisma } from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export async function findAllPerifericos(params?: { laboratorioId?: string; tipo?: string; estado?: string }) {
  return prisma.periferico.findMany({
    where: {
      activo: true,
      ...(params?.laboratorioId && { laboratorioId: params.laboratorioId }),
      ...(params?.tipo && { tipo: params.tipo }),
      ...(params?.estado && { estado: params.estado }),
    },
    include: { laboratorio: true, equipo: true },
    orderBy: { id: "asc" },
  });
}

export async function findPerifericoById(id: string) {
  const p = await prisma.periferico.findUnique({ where: { id }, include: { laboratorio: true, equipo: true } });
  if (!p) throw new AppError("Periférico no encontrado", 404);
  return p;
}

export async function createPeriferico(data: {
  id: string; tipo: string; marca?: string; modelo?: string;
  numeroSerie?: string; laboratorioId?: string; equipoCodigo?: string; estado?: string;
}) {
  return prisma.periferico.create({ data, include: { laboratorio: true, equipo: true } });
}

export async function updatePeriferico(id: string, data: Partial<{
  tipo: string; marca: string; modelo: string; numeroSerie: string;
  laboratorioId: string; equipoCodigo: string; estado: string;
}>) {
  const existing = await prisma.periferico.findUnique({ where: { id } });
  if (!existing) throw new AppError("Periférico no encontrado", 404);
  return prisma.periferico.update({ where: { id }, data, include: { laboratorio: true, equipo: true } });
}

export async function deletePeriferico(id: string) {
  const existing = await prisma.periferico.findUnique({ where: { id } });
  if (!existing) throw new AppError("Periférico no encontrado", 404);
  await prisma.periferico.update({ where: { id }, data: { activo: false } });
}
