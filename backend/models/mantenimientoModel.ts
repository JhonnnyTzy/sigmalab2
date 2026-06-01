import { prisma } from "../config/database";
import { AppError } from "../middlewares/errorHandler";

function parseDate(str: string): Date {
  // Soporta DD/MM/YYYY y YYYY-MM-DD
  // Si viene con hora (DD/MM/YYYYTHH:MM), extraer solo la fecha
  const clean = str.split("T")[0];
  const parts = clean.split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const date = new Date(`${y}-${m}-${d}`);
    // Reaplicar la hora si venía incluida
    if (str.includes("T")) {
      const time = str.split("T")[1];
      const [h, min] = time.split(":");
      date.setHours(parseInt(h, 10), parseInt(min, 10), 0, 0);
    }
    return date;
  }
  return new Date(str);
}

export async function findAllMantenimientos(params?: { tipoId?: string; estadoId?: string; equipoCodigo?: string; tecnicoId?: string; laboratorioId?: string }) {
  return prisma.mantenimiento.findMany({
    where: {
      activo: true,
      ...(params?.tipoId && { tipoId: params.tipoId }),
      ...(params?.estadoId && { estadoId: params.estadoId }),
      ...(params?.equipoCodigo && { equipoCodigo: params.equipoCodigo }),
      ...(params?.tecnicoId && { tecnicoId: params.tecnicoId }),
      ...(params?.laboratorioId && { laboratorioId: params.laboratorioId }),
    },
    include: {
      tipo: true,
      estado: true,
      equipo: { include: { laboratorio: true } },
      tecnico: { include: { persona: true } },
      detalle: { include: { checklists: true, insumosUsados: { include: { insumo: true } } } },
    },
    orderBy: { fecha: "desc" },
  });
}

export async function findMantenimientoById(id: string) {
  const mant = await prisma.mantenimiento.findUnique({
    where: { id },
    include: {
      tipo: true,
      estado: true,
      equipo: { include: { laboratorio: true, estado: true } },
      tecnico: { include: { persona: true } },
      laboratorio: true,
      detalle: { include: { checklists: true, insumosUsados: { include: { insumo: true } } } },
    },
  });
  if (!mant) throw new AppError("Mantenimiento no encontrado", 404);
  return mant;
}

export async function createMantenimiento(data: {
  id?: string;
  tipoId: string;
  equipoCodigo: string;
  tecnicoId: string;
  laboratorioId?: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  estadoId: string;
}) {
  const equipo = await prisma.equipo.findUnique({ where: { codigo: data.equipoCodigo } });
  if (!equipo) throw new AppError("Equipo no encontrado", 404);

  return prisma.mantenimiento.create({
    data: {
      id: data.id || `M-${Date.now()}`,
      tipoId: data.tipoId,
      equipoCodigo: data.equipoCodigo,
      tecnicoId: data.tecnicoId,
      laboratorioId: data.laboratorioId || equipo.laboratorioId,
      fecha: parseDate(data.fecha),
      horaInicio: data.horaInicio ? parseDate(`${data.fecha}T${data.horaInicio}`) : undefined,
      horaFin: data.horaFin ? parseDate(`${data.fecha}T${data.horaFin}`) : undefined,
      estadoId: data.estadoId,
    },
    include: { tipo: true, estado: true, equipo: true, tecnico: { include: { persona: true } } },
  });
}

export async function updateMantenimiento(id: string, data: Partial<{
  estadoId: string;
  horaInicio: string;
  horaFin: string;
  fecha: string;
  tipoId: string;
  laboratorioId: string;
}>) {
  const existing = await prisma.mantenimiento.findUnique({ where: { id } });
  if (!existing) throw new AppError("Mantenimiento no encontrado", 404);

  const updateData: any = { ...data };
  if (data.fecha) updateData.fecha = parseDate(data.fecha);
  if (data.horaInicio) updateData.horaInicio = parseDate(`${existing.fecha.toISOString().split("T")[0]}T${data.horaInicio}`);
  if (data.horaFin) updateData.horaFin = parseDate(`${existing.fecha.toISOString().split("T")[0]}T${data.horaFin}`);

  return prisma.mantenimiento.update({
    where: { id },
    data: updateData,
    include: { tipo: true, estado: true, equipo: true, detalle: true },
  });
}

export async function deleteMantenimiento(id: string) {
  const existing = await prisma.mantenimiento.findUnique({ where: { id } });
  if (!existing) throw new AppError("Mantenimiento no encontrado", 404);
  await prisma.mantenimiento.update({ where: { id }, data: { activo: false } });
}

export async function getMantenimientoStats() {
  const porTipo = await prisma.mantenimiento.groupBy({ by: ["tipoId"], where: { activo: true }, _count: { tipoId: true } });
  const porEstado = await prisma.mantenimiento.groupBy({ by: ["estadoId"], where: { activo: true }, _count: { estadoId: true } });
  const porLab = await prisma.mantenimiento.groupBy({ by: ["laboratorioId"], where: { activo: true }, _count: { laboratorioId: true } });

  const tipos = await prisma.tipoMantenimiento.findMany();
  const estados = await prisma.estadoMantenimiento.findMany();
  const labs = await prisma.laboratorio.findMany();

  const mapObj = (arr: any[], keyMap: any[]) =>
    arr.map((r: any) => ({
      nombre: keyMap.find((k: any) => k.id === (r.tipoId || r.estadoId || r.laboratorioId))?.nombre || r.tipoId || r.estadoId || r.laboratorioId,
      total: r._count.tipoId || r._count.estadoId || r._count.laboratorioId,
    }));

  return {
    porTipo: mapObj(porTipo, tipos),
    porEstado: mapObj(porEstado, estados),
    porLaboratorio: mapObj(porLab, labs),
    total: await prisma.mantenimiento.count({ where: { activo: true } }),
  };
}

export async function createDetalle(data: {
  mantenimientoId: string;
  descripcion?: string;
  diagnostico?: string;
  accionRealizada?: string;
  resolucion?: string;
  tipoIncidencia?: string;
  estadoFinal?: string;
  observaciones?: string;
  recomendaciones?: string;
}) {
  return prisma.mantenimientoDetalle.create({
    data: {
      id: `DET-${Date.now()}`,
      mantenimientoId: data.mantenimientoId,
      descripcion: data.descripcion,
      diagnostico: data.diagnostico,
      accionRealizada: data.accionRealizada,
      resolucion: data.resolucion,
      tipoIncidencia: data.tipoIncidencia,
      estadoFinal: data.estadoFinal,
      observaciones: data.observaciones,
      recomendaciones: data.recomendaciones,
    },
  });
}

export async function updateDetalle(id: string, data: Partial<{
  descripcion: string; diagnostico: string; accionRealizada: string;
  resolucion: string; tipoIncidencia: string; estadoFinal: string;
  observaciones: string; recomendaciones: string;
}>) {
  return prisma.mantenimientoDetalle.update({ where: { id }, data });
}

export async function addChecklist(detalleId: string, items: { categoria: string; item: string; estado: string; observacion?: string }[]) {
  return prisma.checklist.createMany({
    data: items.map((item) => ({
      id: `CHK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      detalleId,
      ...item,
    })),
  });
}

export async function addInsumoUsado(detalleId: string, items: { insumoNombre: string; cantidad: string }[]) {
  return prisma.insumoUsado.createMany({
    data: items.map((item) => ({
      id: `IU-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      detalleId,
      ...item,
    })),
  });
}
