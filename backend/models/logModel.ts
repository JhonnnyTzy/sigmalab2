import { prisma } from "../config/database";

export async function findAllLogs(params?: { modulo?: string; usuarioId?: string; limit?: number }) {
  return prisma.log.findMany({
    where: {
      ...(params?.modulo && { modulo: params.modulo }),
      ...(params?.usuarioId && { usuarioId: params.usuarioId }),
    },
    include: { usuario: { include: { persona: true } } },
    orderBy: { timestamp: "desc" },
    take: params?.limit || 200,
  });
}

export async function createLog(data: {
  usuarioId?: string; accion: string; detalle?: string;
  modulo?: string; entidad?: string; equipoCodigo?: string;
  tipoAccion?: string; estado?: string; ipOrigen?: string;
}) {
  return prisma.log.create({
    data: {
      id: `LOG-${Date.now()}`,
      ...data,
    },
  });
}
