import { prisma } from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export async function findAllEquipos() {
  return prisma.equipo.findMany({
    include: { laboratorio: true, estado: true },
    orderBy: { codigo: "asc" },
  });
}

export async function findEquipoByCodigo(codigo: string) {
  const equipo = await prisma.equipo.findUnique({
    where: { codigo },
    include: {
      laboratorio: true,
      estado: true,
      mantenimientos: { orderBy: { fecha: "desc" }, take: 10 },
      incidencias: { orderBy: { fecha: "desc" }, take: 10 },
    },
  });
  if (!equipo) throw new AppError("Equipo no encontrado", 404);
  return equipo;
}

export async function createEquipo(data: {
  codigo: string;
  nombre: string;
  laboratorioId: string;
  fila?: string;
  puesto?: string;
  sistemaOperativo?: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  estadoId?: string;
  fechaCompra?: string;
}) {
  const lab = await prisma.laboratorio.findUnique({ where: { id: data.laboratorioId } });
  if (!lab) throw new AppError("Laboratorio no encontrado", 404);

  return prisma.equipo.create({
    data: {
      codigo: data.codigo,
      nombre: data.nombre,
      laboratorioId: data.laboratorioId,
      fila: data.fila,
      puesto: data.puesto,
      sistemaOperativo: data.sistemaOperativo,
      marca: data.marca,
      modelo: data.modelo,
      numeroSerie: data.numeroSerie,
      estadoId: data.estadoId || "funcionando",
      fechaCompra: data.fechaCompra ? new Date(data.fechaCompra) : undefined,
    },
    include: { laboratorio: true, estado: true },
  });
}

export async function updateEquipo(codigo: string, data: Partial<{
  nombre: string;
  laboratorioId: string;
  fila: string;
  puesto: string;
  sistemaOperativo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  estadoId: string;
  fechaCompra: string;
}>) {
  const existing = await prisma.equipo.findUnique({ where: { codigo } });
  if (!existing) throw new AppError("Equipo no encontrado", 404);

  const updateData: any = { ...data };
  if (data.fechaCompra) updateData.fechaCompra = new Date(data.fechaCompra);

  return prisma.equipo.update({
    where: { codigo },
    data: updateData,
    include: { laboratorio: true, estado: true },
  });
}

export async function deleteEquipo(codigo: string) {
  const existing = await prisma.equipo.findUnique({ where: { codigo } });
  if (!existing) throw new AppError("Equipo no encontrado", 404);
  await prisma.equipo.delete({ where: { codigo } });
}

export async function countByEstado() {
  const equipos = await prisma.equipo.groupBy({
    by: ["estadoId"],
    _count: { estadoId: true },
  });
  const estados = await prisma.estadoEquipo.findMany();
  const estadoMap = Object.fromEntries(estados.map((e) => [e.id, e.nombre]));

  return equipos.map((e) => ({ estado: estadoMap[e.estadoId] || e.estadoId, count: e._count.estadoId }));
}

export async function countByLaboratorio() {
  const result = await prisma.equipo.groupBy({
    by: ["laboratorioId"],
    _count: { laboratorioId: true },
  });
  const labs = await prisma.laboratorio.findMany();
  const labMap = Object.fromEntries(labs.map((l) => [l.id, l.nombre]));
  return result.map((r) => ({ laboratorio: labMap[r.laboratorioId] || r.laboratorioId, total: r._count.laboratorioId }));
}

export async function findEquiposConProblemas() {
  const estadosProblema = ["pendiente", "en_mantenimiento", "en_espera_repuesto"];
  return prisma.equipo.findMany({
    where: { estadoId: { in: estadosProblema } },
    include: { laboratorio: true, estado: true, incidencias: { orderBy: { fecha: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
}
