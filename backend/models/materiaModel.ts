import { prisma } from "../config/database";

export async function findAllMaterias() {
  return prisma.materia.findMany({ orderBy: { nivel: "asc" } });
}

export async function findMateriaByCodigo(codigo: string) {
  return prisma.materia.findUnique({
    where: { codigo },
    include: { grupos: { include: { docente: true, horarios: { include: { laboratorio: true } } } } },
  });
}

export async function findAllGrupos(params?: { materiaCodigo?: string; docenteId?: string; gestion?: number }) {
  return prisma.grupo.findMany({
    where: {
      ...(params?.materiaCodigo && { materiaCodigo: params.materiaCodigo }),
      ...(params?.docenteId && { docenteId: params.docenteId }),
      ...(params?.gestion && { gestion: params.gestion }),
    },
    include: {
      materia: true,
      docente: true,
      horarios: { include: { laboratorio: true } },
      _count: { select: { inscripciones: true } },
    },
    orderBy: [{ gestion: "desc" }, { materiaCodigo: "asc" }],
  });
}

export async function findHorariosByLaboratorio(laboratorioId: string, dia?: number) {
  return prisma.horario.findMany({
    where: {
      laboratorioId,
      ...(dia && { diaSemana: dia }),
    },
    include: {
      grupo: { include: { materia: true, docente: true } },
    },
    orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
  });
}
