import { prisma } from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export async function findAllEquipos() {
  return prisma.equipo.findMany({
    where: { activo: true },
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
  codigoItic?: string;
  codigoFacultativo?: string;
  codigoUmsa?: string;
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
      codigoItic: data.codigoItic,
      codigoFacultativo: data.codigoFacultativo,
      codigoUmsa: data.codigoUmsa,
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
  codigoItic: string;
  codigoFacultativo: string;
  codigoUmsa: string;
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
  await prisma.equipo.update({ where: { codigo }, data: { activo: false } });
}

export async function decommissionEquipo(codigo: string, motivo: string, fechaBaja?: string) {
  const existing = await prisma.equipo.findUnique({ where: { codigo }, include: { perifericos: true } });
  if (!existing) throw new AppError("Equipo no encontrado", 404);
  if (existing.estadoId === "de_baja") throw new AppError("El equipo ya está dado de baja", 400);

  // Unassign peripherals
  if (existing.perifericos.length > 0) {
    await prisma.periferico.updateMany({
      where: { equipoCodigo: codigo },
      data: { equipoCodigo: null, estado: "De baja" },
    });
  }

  // Cascade baja to inventory items linked to this equipo
  await prisma.inventarioItem.updateMany({
    where: { equipoCodigo: codigo, activo: true },
    data: { estado: "De baja", laboratorioId: null, equipoCodigo: null },
  });

  return prisma.equipo.update({
    where: { codigo },
    data: {
      estadoId: "de_baja",
      activo: false,
      fechaBaja: fechaBaja ? new Date(fechaBaja) : new Date(),
      motivoBaja: motivo,
    },
    include: { laboratorio: true, estado: true },
  });
}

export async function replaceEquipo(
  codigoViejo: string,
  nuevoData: {
    codigo: string; nombre: string; laboratorioId: string;
    fila?: string; puesto?: string; sistemaOperativo?: string;
    marca?: string; modelo?: string; numeroSerie?: string;
    codigoItic?: string; codigoFacultativo?: string; codigoUmsa?: string;
  },
  motivoBaja?: string,
  reasignarPerifericos?: boolean,
) {
  const existing = await prisma.equipo.findUnique({
    where: { codigo: codigoViejo },
    include: { perifericos: true },
  });
  if (!existing) throw new AppError("Equipo original no encontrado", 404);
  if (existing.estadoId === "de_baja") throw new AppError("El equipo original ya está dado de baja", 400);

  // Decommission old
  await prisma.equipo.update({
    where: { codigo: codigoViejo },
    data: {
      estadoId: "de_baja",
      activo: false,
      fechaBaja: new Date(),
      motivoBaja: motivoBaja || "Reemplazo de equipo",
      reemplazadoPor: nuevoData.codigo,
    },
  });

  // Cascade baja to inventory items linked to old equipo
  await prisma.inventarioItem.updateMany({
    where: { equipoCodigo: codigoViejo, activo: true },
    data: { estado: "De baja", laboratorioId: null, equipoCodigo: null },
  });

  // Reassign peripherals to new equipo
  if (reasignarPerifericos && existing.perifericos.length > 0) {
    await prisma.periferico.updateMany({
      where: { equipoCodigo: codigoViejo },
      data: { equipoCodigo: nuevoData.codigo },
    });
  }

  // Create new equipment
  const nuevo = await prisma.equipo.create({
    data: {
      codigo: nuevoData.codigo,
      nombre: nuevoData.nombre,
      laboratorioId: nuevoData.laboratorioId,
      fila: nuevoData.fila,
      puesto: nuevoData.puesto,
      sistemaOperativo: nuevoData.sistemaOperativo || existing.sistemaOperativo,
      marca: nuevoData.marca || existing.marca,
      modelo: nuevoData.modelo || existing.modelo,
      numeroSerie: nuevoData.numeroSerie,
      codigoItic: nuevoData.codigoItic,
      codigoFacultativo: nuevoData.codigoFacultativo,
      codigoUmsa: nuevoData.codigoUmsa,
      estadoId: "funcionando",
    },
    include: { laboratorio: true, estado: true },
  });

  return { oldEquipo: { ...existing, estadoId: "de_baja", activo: false }, newEquipo: nuevo };
}

export async function countByEstado() {
  const equipos = await prisma.equipo.groupBy({
    by: ["estadoId"],
    where: { activo: true },
    _count: { estadoId: true },
  });
  const estados = await prisma.estadoEquipo.findMany();
  const estadoMap = Object.fromEntries(estados.map((e) => [e.id, e.nombre]));

  return equipos.map((e) => ({ estado: estadoMap[e.estadoId] || e.estadoId, count: e._count.estadoId }));
}

export async function countByLaboratorio() {
  const result = await prisma.equipo.groupBy({
    by: ["laboratorioId"],
    where: { activo: true },
    _count: { laboratorioId: true },
  });
  const labs = await prisma.laboratorio.findMany();
  const labMap = Object.fromEntries(labs.map((l) => [l.id, l.nombre]));
  return result.map((r) => ({ laboratorio: labMap[r.laboratorioId] || r.laboratorioId, total: r._count.laboratorioId }));
}

export async function findEquiposConProblemas() {
  const estadosProblema = ["pendiente", "en_mantenimiento", "en_espera_repuesto"];
  return prisma.equipo.findMany({
    where: { activo: true, estadoId: { in: estadosProblema } },
    include: { laboratorio: true, estado: true, incidencias: { orderBy: { fecha: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
}
