import { prisma } from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export async function findAllInventario(params?: { categoriaId?: string; estado?: string; laboratorioId?: string }) {
  return prisma.inventarioItem.findMany({
    where: {
      activo: true,
      ...(params?.categoriaId && { categoriaId: params.categoriaId }),
      ...(params?.estado && { estado: params.estado }),
      ...(params?.laboratorioId && { laboratorioId: params.laboratorioId }),
    },
    include: { categoria: true, laboratorio: true, equipo: true },
    orderBy: { fechaIngreso: "desc" },
  });
}

export async function findInventarioById(id: string) {
  const item = await prisma.inventarioItem.findUnique({
    where: { id },
    include: { categoria: true, laboratorio: true, equipo: true },
  });
  if (!item) throw new AppError("Ítem de inventario no encontrado", 404);
  return item;
}

export async function createInventarioItem(data: {
  categoriaId: string;
  codigoItic: string;
  codigoFacultativo?: string;
  codigoUmsa?: string;
  numeroSerie?: string;
  marca?: string;
  modelo?: string;
  estado?: string;
  fechaIngreso: string;
  fechaAsignacion?: string;
  laboratorioId?: string;
  equipoCodigo?: string;
  observaciones?: string;
}) {
  return prisma.inventarioItem.create({
    data: {
      id: `INV-${Date.now()}`,
      ...data,
      fechaIngreso: new Date(data.fechaIngreso),
      fechaAsignacion: data.fechaAsignacion ? new Date(data.fechaAsignacion) : undefined,
    },
    include: { categoria: true },
  });
}

export async function updateInventarioItem(id: string, data: Partial<{
  categoriaId: string; estado: string; observaciones: string;
  laboratorioId: string; equipoCodigo: string; fechaAsignacion: string;
}>) {
  const existing = await prisma.inventarioItem.findUnique({ where: { id } });
  if (!existing) throw new AppError("Ítem no encontrado", 404);

  const updateData: any = { ...data };
  if (data.fechaAsignacion) updateData.fechaAsignacion = new Date(data.fechaAsignacion);

  return prisma.inventarioItem.update({ where: { id }, data: updateData, include: { categoria: true } });
}

export async function deleteInventarioItem(id: string) {
  const existing = await prisma.inventarioItem.findUnique({ where: { id } });
  if (!existing) throw new AppError("Ítem no encontrado", 404);
  await prisma.inventarioItem.update({ where: { id }, data: { activo: false } });
}

export async function getInventarioStats() {
  const porCategoria = await prisma.inventarioItem.groupBy({ by: ["categoriaId"], where: { activo: true }, _count: { categoriaId: true } });
  const categorias = await prisma.categoriaInventario.findMany();
  return {
    porCategoria: porCategoria.map((r) => ({
      nombre: categorias.find((c) => c.id === r.categoriaId)?.nombre || r.categoriaId,
      total: r._count.categoriaId,
      stockMinimo: categorias.find((c) => c.id === r.categoriaId)?.stockMinimo || 0,
    })),
    total: await prisma.inventarioItem.count({ where: { activo: true } }),
  };
}
