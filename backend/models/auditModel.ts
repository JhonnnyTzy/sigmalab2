import { prisma } from "../config/database";

export async function createAuditLog(data: {
  usuarioId?: string;
  accion: string;
  detalle?: string;
  modulo?: string;
  entidad?: string;
  equipoCodigo?: string;
  tipoAccion: string;
  ipOrigen?: string;
}) {
  return prisma.log.create({
    data: {
      id: `LOG-${Date.now()}`,
      ...data,
    },
  }).catch((err) => console.error("[AUDIT] log error:", err.message));
}

export async function recordFieldChanges(params: {
  tabla: string;
  registroId: string;
  usuarioId?: string;
  operacion: "CREAR" | "ACTUALIZAR" | "ELIMINAR";
  before?: Record<string, any>;
  after?: Record<string, any>;
}) {
  const { tabla, registroId, usuarioId, operacion, before, after } = params;

  if (operacion === "CREAR" && after) {
    return prisma.auditChange.create({
      data: {
        id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        tabla,
        operacion,
        registroId,
        usuarioId: usuarioId || null,
        campo: null,
        valorAnterior: null,
        valorNuevo: JSON.stringify(after),
      },
    }).catch((err) => console.error("[AUDIT] recordFieldChanges(CREAR) error:", err.message));
  }

  if (operacion === "ACTUALIZAR" && before && after) {
    const changes: { campo: string; valorAnterior: string; valorNuevo: string }[] = [];
    for (const key of Object.keys(after)) {
      const oldVal = JSON.stringify(before[key]);
      const newVal = JSON.stringify(after[key]);
      if (oldVal !== newVal) {
        changes.push({ campo: key, valorAnterior: oldVal, valorNuevo: newVal });
      }
    }
    if (changes.length === 0) return;

    return prisma.auditChange.createMany({
      data: changes.map((c) => ({
        id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        tabla,
        operacion,
        registroId,
        usuarioId: usuarioId || null,
        campo: c.campo,
        valorAnterior: c.valorAnterior,
        valorNuevo: c.valorNuevo,
      })),
    }).catch((err) => console.error("[AUDIT] recordFieldChanges(ACTUALIZAR) error:", err.message));
  }

  if (operacion === "ELIMINAR" && before) {
    return prisma.auditChange.create({
      data: {
        id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        tabla,
        operacion,
        registroId,
        usuarioId: usuarioId || null,
        campo: null,
        valorAnterior: JSON.stringify(before),
        valorNuevo: null,
      },
    }).catch((err) => console.error("[AUDIT] recordFieldChanges(ELIMINAR) error:", err.message));
  }
}

export async function findAuditChanges(params?: {
  tabla?: string;
  registroId?: string;
  limit?: number;
}) {
  return prisma.auditChange.findMany({
    where: {
      ...(params?.tabla && { tabla: params.tabla }),
      ...(params?.registroId && { registroId: params.registroId }),
    },
    include: { usuario: { include: { persona: true } } },
    orderBy: { timestamp: "desc" },
    take: params?.limit || 100,
  });
}
