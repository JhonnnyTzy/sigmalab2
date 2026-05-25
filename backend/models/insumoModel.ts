import { prisma } from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export async function findAllInsumos() {
  return prisma.insumo.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function findInsumoByNombre(nombre: string) {
  const insumo = await prisma.insumo.findUnique({ where: { nombre } });
  if (!insumo) throw new AppError("Insumo no encontrado", 404);
  return insumo;
}

export async function createInsumo(data: {
  nombre: string;
  unidadMedida: string;
  stock?: number;
  stockMinimo?: number;
}) {
  return prisma.insumo.create({ data });
}

export async function updateInsumo(nombre: string, data: Partial<{
  unidadMedida: string; stock: number; stockMinimo: number;
}>) {
  const existing = await prisma.insumo.findUnique({ where: { nombre } });
  if (!existing) throw new AppError("Insumo no encontrado", 404);

  return prisma.insumo.update({ where: { nombre }, data });
}

export async function deleteInsumo(nombre: string) {
  const existing = await prisma.insumo.findUnique({ where: { nombre } });
  if (!existing) throw new AppError("Insumo no encontrado", 404);
  await prisma.insumo.delete({ where: { nombre } });
}

export async function getInsumosBajoStock() {
  return prisma.insumo.findMany({
    where: { stock: { lte: prisma.insumo.fields.stockMinimo } },
    orderBy: { stock: "asc" },
  });
}
