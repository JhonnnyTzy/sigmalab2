import { prisma } from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export async function findAllLaboratorios() {
  return prisma.laboratorio.findMany({
    where: { activo: true },
    include: {
      edificio: true,
      _count: { select: { equipos: true, incidencias: true } },
    },
    orderBy: { id: "asc" },
  });
}

export async function findLaboratorioById(id: string) {
  const lab = await prisma.laboratorio.findUnique({
    where: { id },
    include: {
      edificio: true,
      encargado: true,
      equipos: { include: { estado: true }, orderBy: { codigo: "asc" } },
      _count: { select: { equipos: true, incidencias: true, perifericos: true } },
    },
  });
  if (!lab) throw new AppError("Laboratorio no encontrado", 404);
  return lab;
}

export async function createLaboratorio(data: {
  id: string;
  nombre: string;
  edificioId: string;
  piso: number;
  capacidadEquipos: number;
  capacidadPersonas: number;
  encargadoId?: string;
}) {
  const edificio = await prisma.edificio.findUnique({ where: { id: data.edificioId } });
  if (!edificio) throw new AppError("Edificio no encontrado", 404);

  return prisma.laboratorio.create({
    data,
    include: { edificio: true, _count: { select: { equipos: true } } },
  });
}

export async function updateLaboratorio(id: string, data: Partial<{
  nombre: string;
  edificioId: string;
  piso: number;
  capacidadEquipos: number;
  capacidadPersonas: number;
  encargadoId: string;
  activo: boolean;
}>) {
  const existing = await prisma.laboratorio.findUnique({ where: { id } });
  if (!existing) throw new AppError("Laboratorio no encontrado", 404);

  return prisma.laboratorio.update({
    where: { id },
    data,
    include: { edificio: true, _count: { select: { equipos: true } } },
  });
}

export async function deleteLaboratorio(id: string) {
  const existing = await prisma.laboratorio.findUnique({ where: { id } });
  if (!existing) throw new AppError("Laboratorio no encontrado", 404);
  await prisma.laboratorio.update({ where: { id }, data: { activo: false } });
}
