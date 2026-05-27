// Reactive in-memory store for SIGMALAB
import { useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import { auth, getSessionUsername } from "./auth";
import {
  LABORATORIOS as L0,
  EQUIPOS as E0,
  USUARIOS as U0,
  MANTENIMIENTOS_RECIENTES as M0,
  INCIDENCIAS_RECIENTES as I0,
  MIS_MANTENIMIENTOS_PREV as MP0,
  EQUIPOS_PROBLEMAS as EP0,
  HISTORIAL_CORRECTIVOS as HC0,
  INSUMOS as IN0,
} from "./sigmalab-data";

export type Laboratorio = (typeof L0)[number];
export type Equipo = (typeof E0)[number];
export type Usuario = (typeof U0)[number] & {
  paterno?: string;
  materno?: string;
  nombres?: string;
  celular?: string;
};
export type Mantenimiento = (typeof M0)[number];
export type Incidencia = (typeof I0)[number];
export type MantPrev = (typeof MP0)[number];
export type EquipoProblema = (typeof EP0)[number];
export type HistCorrectivo = (typeof HC0)[number];

export interface InsumoStock {
  nombre: string;
  unidad: string;
  stock: number;
  minimo: number;
}

export interface Periferico {
  id: string;
  tipo: string;
  marca: string;
  modelo: string;
  serie: string;
  asignadoA: string;
  estado: string;
}

export interface LogEntry {
  ts: string;
  usuario: string;
  accion: string;
  detalle: string;
  modulo?: string;
  entidad?: string;
  equipo?: string;
  tipoAccion?: "Crear" | "Editar" | "Eliminar" | "Asignar" | "Resolver" | "Actualizar" | "Otro";
  estado?: "Éxito" | "Error" | "Advertencia";
  descripcion?: string;
  cambios?: { campo: string; antes?: string; despues?: string }[];
}

export interface MantDetalle {
  id: string;
  tipo: "Preventivo" | "Correctivo";
  equipo: string;
  lab: string;
  tecnico: string;
  fecha: string;
  inicio?: string;
  fin?: string;
  estado: string;
  hardware?: { item: string; estado: string; obs: string }[];
  software?: { item: string; estado: string; obs: string }[];
  pruebas?: { item: string; estado: string; obs: string }[];
  incidencias?: { problema: string; accion: string; seguimiento: boolean }[];
  insumos?: { insumo: string; cantidad: string; unidad: string }[];
  estadoFinal?: string;
  observaciones?: string;
  recomendaciones?: string;
  // correctivo
  descripcion?: string;
  diagnostico?: string;
  accion?: string;
  componentes?: string[];
  resolucion?: string;
  tipoIncidencia?: string;
}

export interface Asignacion {
  id: string;
  equipo: string;
  lab: string;
  asignadoA: string; // username pasante correctivo
  problema: string;
  prioridad: "Alta" | "Media" | "Baja";
  fecha: string;
  estado: "Pendiente" | "En proceso" | "Completado";
}

export interface ReportePasante {
  id: string;
  pasante: string;
  pasanteId?: string;
  rolReporte?: "encargado" | "preventivo" | "correctivo" | "docente" | "estudiante" | "invitado";
  titulo: string;
  descripcion: string;
  laboratorio: string;
  ubicacion: string;
  categoria: string;
  prioridad: "Alta" | "Media" | "Baja";
  fecha: string;
  estado: "Nuevo" | "Visto" | "Resuelto" | "Pendiente" | "En proceso" | "Completado";
  resolucionDetalle?: string;
}

export interface CorrectivoPrefill {
  asignacionId?: string;
  histKey?: { equipo: string; fecha: string; tecnico: string };
  lab?: string;
  equipo?: string;
  descripcion?: string;
  problemaTitulo?: string;
  fecha?: string; // YYYY-MM-DD
  hora?: string;
  diagnostico?: string;
  accion?: string;
  observaciones?: string;
  componentes?: string[];
  componentesOtro?: string;
  insumos?: { insumo: string }[];
  estado?: "Completado" | "En proceso" | "Pendiente";
  tipoIncidencia?: string;
}

export const INVENTARIO_CATEGORIAS = [
  "Equipo de cómputo",
  "Monitor",
  "Teclado",
  "Mouse",
  "Fuente de poder",
  "Placa madre",
  "Disco duro",
  "Memoria RAM",
  "Microprocesador",
  "Tarjeta de video",
  "Cooler",
  "Cable SATA",
  "Cortapicos",
  "Otro",
] as const;

export type InventarioCategoria = (typeof INVENTARIO_CATEGORIAS)[number];
export type InventarioEstado = "Operativo" | "En mantenimiento" | "De baja" | "En almacén";
export const UBIC_OFICINA = "Oficina ITIC";

export interface InventarioItem {
  id: string;
  categoria: InventarioCategoria;
  codItic: string;
  codFacultativo?: string;
  codUmsa?: string;
  numeroSerie: string;
  marca: string;
  modelo: string;
  estado: InventarioEstado;
  fechaIngreso: string; // YYYY-MM-DD
  fechaAsignacion?: string;
  asignadoEquipo?: string;
  laboratorio?: string; // lab id si asignado; sino vacío => Oficina ITIC
  observaciones?: string;
}

export interface StockMinimo {
  categoria: InventarioCategoria;
  minimo: number;
}

interface State {
  labs: Laboratorio[];
  equipos: Equipo[];
  usuarios: Usuario[];
  mantenimientos: Mantenimiento[];
  incidencias: Incidencia[];
  misPrev: MantPrev[];
  equiposProblemas: EquipoProblema[];
  histCorrectivos: HistCorrectivo[];
  insumos: InsumoStock[];
  perifericos: Periferico[];
  logs: LogEntry[];
  detalles: MantDetalle[];
  asignaciones: Asignacion[];
  reportesPasante: ReportePasante[];
  inventario: InventarioItem[];
  stockMinimos: StockMinimo[];
}

const PERIFERICOS_SEED: Periferico[] = [
  { id: "UMSA-INF-2024-101", tipo: "Monitor", marca: "Samsung", modelo: "S22F350", serie: "SAM2245X", asignadoA: "PC-LAB1-001", estado: "Funcionando" },
  { id: "UMSA-INF-2024-102", tipo: "Teclado", marca: "Logitech", modelo: "K120", serie: "LGT88121", asignadoA: "PC-LAB1-001", estado: "Funcionando" },
  { id: "UMSA-INF-2024-103", tipo: "Mouse", marca: "Logitech", modelo: "M100", serie: "LGT77234", asignadoA: "PC-LAB1-001", estado: "Funcionando" },
  { id: "UMSA-INF-2024-110", tipo: "Monitor", marca: "LG", modelo: "20MK400", serie: "LG998812", asignadoA: "PC-LAB2-001", estado: "Funcionando" },
  { id: "UMSA-INF-2024-115", tipo: "Impresora", marca: "HP", modelo: "LaserJet M404", serie: "HP445566", asignadoA: "Lab 1", estado: "En mantenimiento" },
  { id: "UMSA-INF-2024-120", tipo: "Proyector", marca: "Epson", modelo: "PowerLite X41+", serie: "EPS112233", asignadoA: "Lab 3", estado: "Funcionando" },
  { id: "UMSA-INF-2024-125", tipo: "Switch", marca: "TP-Link", modelo: "TL-SG1024", serie: "TPL778899", asignadoA: "LASIN 1", estado: "Funcionando" },
  { id: "UMSA-INF-2024-130", tipo: "Teclado", marca: "Genius", modelo: "KB-110X", serie: "GEN334455", asignadoA: "PC-LAB4-007", estado: "De baja" },
];

const INSUMOS_SEED: InsumoStock[] = IN0.map((i, idx) => ({
  nombre: i.nombre,
  unidad: i.unidad,
  stock: [2400, 35, 80, 12, 1800][idx] ?? 50,
  minimo: [500, 10, 20, 5, 600][idx] ?? 10,
}));

const LOGS_SEED: LogEntry[] = [
  { ts: "20/04/2026 09:12", usuario: "ysarzuri", accion: "Mantenimiento creado", detalle: "Preventivo PC-LAB1-001", modulo: "Mantenimientos", entidad: "Mantenimiento Preventivo", equipo: "PC-LAB1-001", tipoAccion: "Crear", estado: "Éxito", descripcion: "Se registró un nuevo mantenimiento preventivo para el equipo PC-LAB1-001 del Laboratorio 1.", cambios: [{ campo: "estado", antes: "—", despues: "Programado" }] },
  { ts: "20/04/2026 08:55", usuario: "jarias", accion: "Estado actualizado", detalle: "PC-LAB2-005 → En mantenimiento", modulo: "Equipos", entidad: "Equipo", equipo: "PC-LAB2-005", tipoAccion: "Actualizar", estado: "Éxito", descripcion: "Cambio de estado del equipo PC-LAB2-005.", cambios: [{ campo: "estado", antes: "Funcionando", despues: "En mantenimiento" }] },
  { ts: "19/04/2026 17:30", usuario: "rescobar", accion: "Equipo registrado", detalle: "PC-LAB3-012 (HP ProDesk)", modulo: "Equipos", entidad: "Equipo", equipo: "PC-LAB3-012", tipoAccion: "Crear", estado: "Éxito", descripcion: "Alta del equipo PC-LAB3-012 (HP ProDesk) en el Laboratorio 3." },
  { ts: "19/04/2026 14:22", usuario: "rescobar", accion: "Usuario creado", detalle: "cmendoza (Pasante Preventivo)", modulo: "Usuarios", entidad: "Usuario", tipoAccion: "Crear", estado: "Éxito", descripcion: "Se creó el usuario cmendoza con rol Pasante Preventivo." },
  { ts: "19/04/2026 11:08", usuario: "jarias", accion: "Correctivo cerrado", detalle: "PC-LAB2-001 — RAM reemplazada", modulo: "Mantenimientos", entidad: "Mantenimiento Correctivo", equipo: "PC-LAB2-001", tipoAccion: "Resolver", estado: "Éxito", descripcion: "Cierre del mantenimiento correctivo para PC-LAB2-001.", cambios: [{ campo: "estado", antes: "En proceso", despues: "Resuelto" }, { campo: "componente", antes: "RAM defectuosa", despues: "RAM reemplazada" }] },
];

const DETALLES_SEED: MantDetalle[] = [
  {
    id: "MP-seed-1", tipo: "Preventivo", equipo: "PC-LAB1-001", lab: "Lab 1",
    tecnico: "Yennifer Sarzuri", fecha: "18/04/2026", inicio: "08:30", fin: "09:45", estado: "Completado",
    hardware: [
      { item: "Limpieza externa del case", estado: "OK", obs: "Sin polvo visible" },
      { item: "Limpieza interna (componentes)", estado: "OK", obs: "Aire comprimido aplicado" },
      { item: "Ventiladores y disipadores", estado: "Regular", obs: "Cambiar pasta térmica próxima vez" },
      { item: "Memoria RAM", estado: "OK", obs: "8GB DDR4 funcionando" },
    ],
    software: [
      { item: "Actualizaciones del SO", estado: "OK", obs: "Win 11 al día" },
      { item: "Antivirus actualizado", estado: "OK", obs: "Defender activo" },
    ],
    pruebas: [{ item: "Encendido/apagado correcto", estado: "OK", obs: "" }],
    insumos: [
      { insumo: "Alcohol isopropílico", cantidad: "150", unidad: "ml" },
      { insumo: "Paños de microfibra", cantidad: "2", unidad: "unidades" },
    ],
    estadoFinal: "Bueno",
    observaciones: "Equipo en buen estado general.",
    recomendaciones: "Programar cambio de pasta térmica en 6 meses.",
  },
  {
    id: "MC-seed-1", tipo: "Correctivo", equipo: "PC-LAB2-001", lab: "LAB2",
    tecnico: "Jhonny Arias", fecha: "12/04/2026", estado: "Resuelto",
    descripcion: "Memoria RAM defectuosa, equipo se reinicia aleatoriamente",
    diagnostico: "Test de memtest86 indica fallos en módulo de RAM",
    accion: "Cambio de módulo de 8GB DDR4 Kingston por nuevo módulo Crucial",
    componentes: ["RAM"],
    resolucion: "Resuelto",
    insumos: [{ insumo: "Pasta térmica", cantidad: "1", unidad: "aplicaciones" }],
    tipoIncidencia: "Hardware",
  },
];

const ASIGNACIONES_SEED: Asignacion[] = [
  { id: "AS-1", equipo: "PC-LASIN1-004", lab: "LASIN 1", asignadoA: "jarias", problema: "No enciende, posible falla de fuente de poder", prioridad: "Alta", fecha: "18/04/2026", estado: "Pendiente" },
  { id: "AS-2", equipo: "PC-LAB2-005", lab: "Lab 2", asignadoA: "jarias", problema: "Pantalla azul intermitente", prioridad: "Media", fecha: "17/04/2026", estado: "En proceso" },
  { id: "AS-3", equipo: "PC-LAB1-002", lab: "Lab 1", asignadoA: "ysarzuri", problema: "Equipo lento, requiere mantenimiento preventivo urgente", prioridad: "Media", fecha: "19/04/2026", estado: "Pendiente" },
  { id: "AS-4", equipo: "PC-LAB3-002", lab: "Lab 3", asignadoA: "ysarzuri", problema: "Limpieza profunda y revisión de software", prioridad: "Baja", fecha: "18/04/2026", estado: "En proceso" },
];

const REPORTES_SEED: ReportePasante[] = [
  { id: "RP-1", pasante: "ysarzuri", rolReporte: "preventivo", titulo: "Cables de red desconectados", descripcion: "Se encontraron 3 cables de red sueltos detrás del rack del Lab 1", laboratorio: "Lab 1", ubicacion: "Piso 1", categoria: "Red", prioridad: "Media", fecha: "19/04/2026", estado: "Nuevo" },
];

const INVENTARIO_SEED: InventarioItem[] = [
  { id: "INV-0001", categoria: "Monitor", codItic: "ITIC-MON-0001", codFacultativo: "FAC-2024-101", codUmsa: "UMSA-INF-2024-101", numeroSerie: "SAM2245X", marca: "Samsung", modelo: "S22F350", estado: "Operativo", fechaIngreso: "2024-03-15", fechaAsignacion: "2024-04-01", asignadoEquipo: "PC-LAB1-001", laboratorio: "LAB1" },
  { id: "INV-0002", categoria: "Teclado", codItic: "ITIC-TEC-0001", codFacultativo: "FAC-2024-102", codUmsa: "UMSA-INF-2024-102", numeroSerie: "LGT88121", marca: "Logitech", modelo: "K120", estado: "Operativo", fechaIngreso: "2024-03-15", fechaAsignacion: "2024-04-01", asignadoEquipo: "PC-LAB1-001", laboratorio: "LAB1" },
  { id: "INV-0003", categoria: "Mouse", codItic: "ITIC-MSE-0001", codFacultativo: "FAC-2024-103", codUmsa: "UMSA-INF-2024-103", numeroSerie: "LGT77234", marca: "Logitech", modelo: "M100", estado: "Operativo", fechaIngreso: "2024-03-15", fechaAsignacion: "2024-04-01", asignadoEquipo: "PC-LAB1-001", laboratorio: "LAB1" },
  { id: "INV-0004", categoria: "Monitor", codItic: "ITIC-MON-0002", codFacultativo: "FAC-2024-110", codUmsa: "UMSA-INF-2024-110", numeroSerie: "LG998812", marca: "LG", modelo: "20MK400", estado: "Operativo", fechaIngreso: "2024-05-02", fechaAsignacion: "2024-05-10", asignadoEquipo: "PC-LAB2-001", laboratorio: "LAB2" },
  { id: "INV-0005", categoria: "Disco duro", codItic: "ITIC-HDD-0001", codFacultativo: "FAC-2024-201", numeroSerie: "WD500987", marca: "Western Digital", modelo: "Blue 1TB", estado: "En almacén", fechaIngreso: "2024-08-20" },
  { id: "INV-0006", categoria: "Memoria RAM", codItic: "ITIC-RAM-0001", numeroSerie: "KGT44521", marca: "Kingston", modelo: "Fury 8GB DDR4", estado: "En almacén", fechaIngreso: "2024-09-10" },
  { id: "INV-0007", categoria: "Fuente de poder", codItic: "ITIC-PSU-0001", numeroSerie: "EVGA70011", marca: "EVGA", modelo: "500W 80+ Bronze", estado: "En almacén", fechaIngreso: "2024-09-15" },
  { id: "INV-0008", categoria: "Cable SATA", codItic: "ITIC-CAB-0001", numeroSerie: "GEN-S-001", marca: "Genérico", modelo: "SATA III 50cm", estado: "En almacén", fechaIngreso: "2024-10-01" },
  { id: "INV-0009", categoria: "Cortapicos", codItic: "ITIC-CRT-0001", numeroSerie: "TPL-CRT-09", marca: "TP-Link", modelo: "6 tomas", estado: "Operativo", fechaIngreso: "2024-02-01", fechaAsignacion: "2024-02-10", laboratorio: "LAB3" },
  { id: "INV-0010", categoria: "Microprocesador", codItic: "ITIC-CPU-0001", numeroSerie: "INTL-i5-22", marca: "Intel", modelo: "Core i5-12400", estado: "En almacén", fechaIngreso: "2025-01-12" },
  { id: "INV-0011", categoria: "Tarjeta de video", codItic: "ITIC-GPU-0001", numeroSerie: "NV-GTX-01", marca: "NVIDIA", modelo: "GTX 1650", estado: "De baja", fechaIngreso: "2022-05-10", observaciones: "Ventilador dañado" },
  { id: "INV-0012", categoria: "Cooler", codItic: "ITIC-COL-0001", numeroSerie: "CM-HYPER-7", marca: "Cooler Master", modelo: "Hyper 212", estado: "En almacén", fechaIngreso: "2025-02-18" },
];

const STOCK_MIN_SEED: StockMinimo[] = [
  { categoria: "Monitor", minimo: 2 },
  { categoria: "Teclado", minimo: 3 },
  { categoria: "Mouse", minimo: 3 },
  { categoria: "Fuente de poder", minimo: 2 },
  { categoria: "Placa madre", minimo: 1 },
  { categoria: "Disco duro", minimo: 3 },
  { categoria: "Memoria RAM", minimo: 4 },
  { categoria: "Microprocesador", minimo: 2 },
  { categoria: "Tarjeta de video", minimo: 1 },
  { categoria: "Cooler", minimo: 2 },
  { categoria: "Cable SATA", minimo: 5 },
  { categoria: "Cortapicos", minimo: 2 },
  { categoria: "Otro", minimo: 0 },
];

const state: State = {
  labs: [...L0],
  equipos: [...E0],
  usuarios: [...U0],
  mantenimientos: [...M0],
  incidencias: [...I0],
  misPrev: [...MP0],
  equiposProblemas: [...EP0],
  histCorrectivos: [...HC0],
  insumos: [...INSUMOS_SEED],
  perifericos: [...PERIFERICOS_SEED],
  logs: [...LOGS_SEED],
  detalles: [...DETALLES_SEED],
  asignaciones: [...ASIGNACIONES_SEED],
  reportesPasante: [...REPORTES_SEED],
  inventario: [...INVENTARIO_SEED],
  stockMinimos: [...STOCK_MIN_SEED],
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

function inferMeta(accion: string, detalle: string) {
  const a = accion.toLowerCase();
  const d = detalle || "";
  let modulo = "Sistema";
  let entidad: string | undefined;
  let tipoAccion: LogEntry["tipoAccion"] = "Otro";
  if (/mantenim/.test(a)) { modulo = "Mantenimientos"; entidad = "Mantenimiento"; }
  else if (/correctivo/.test(a)) { modulo = "Mantenimientos"; entidad = "Mantenimiento Correctivo"; }
  else if (/equipo/.test(a)) { modulo = "Equipos"; entidad = "Equipo"; }
  else if (/usuario/.test(a)) { modulo = "Usuarios"; entidad = "Usuario"; }
  else if (/laboratorio/.test(a)) { modulo = "Laboratorios"; entidad = "Laboratorio"; }
  else if (/insumo/.test(a)) { modulo = "Insumos"; entidad = "Insumo"; }
  else if (/perif/.test(a)) { modulo = "Periféricos"; entidad = "Periférico"; }
  else if (/inventario/.test(a)) { modulo = "Inventario"; entidad = "Ítem de inventario"; }
  else if (/stock/.test(a)) { modulo = "Inventario"; entidad = "Stock mínimo"; }
  else if (/asign/.test(a)) { modulo = "Asignaciones"; entidad = "Asignación"; }
  else if (/reporte/.test(a)) { modulo = "Incidencias"; entidad = "Reporte de pasante"; }
  else if (/incidenc/.test(a)) { modulo = "Incidencias"; entidad = "Incidencia"; }
  if (/(crear|creado|registr|alta|nuevo)/.test(a)) tipoAccion = "Crear";
  else if (/(editar|editado|actualiz|cambio)/.test(a)) tipoAccion = "Actualizar";
  else if (/elimin|baja/.test(a)) tipoAccion = "Eliminar";
  else if (/asign/.test(a)) tipoAccion = "Asignar";
  else if (/(resuelto|resolver|cerrado|atendido)/.test(a)) tipoAccion = "Resolver";
  const eqMatch = (d.match(/PC-[A-Z0-9]+-\d+/) || [])[0];
  return { modulo, entidad, tipoAccion, equipo: eqMatch };
}

function currentUser() {
  const session = auth.getSession();
  return getSessionUsername(session) || "sistema";
}

function log(usuario: string, accion: string, detalle: string, extra?: Partial<LogEntry>) {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ts = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const meta = inferMeta(accion, detalle);
  const entry: LogEntry = {
    ts, usuario: usuario || currentUser(), accion, detalle,
    modulo: meta.modulo,
    entidad: meta.entidad,
    equipo: meta.equipo,
    tipoAccion: meta.tipoAccion,
    estado: "Éxito",
    descripcion: `${accion}${detalle ? `: ${detalle}` : ""}`,
    ...extra,
  };
  state.logs = [entry, ...state.logs].slice(0, 200);
}

export const store = {
  getState: () => state,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  // Labs
  addLab: async (l: Laboratorio) => {
    await apiClient.post("/laboratorios", {
      id: l.id, nombre: l.nombre, edificioId: l.edificio, piso: l.piso,
      capacidadEquipos: l.capEquipos, capacidadPersonas: l.capPersonas,
    });
    state.labs = [...state.labs, l]; log("", "Laboratorio creado", l.nombre); notify();
  },
  updateLab: async (id: string, patch: Partial<Laboratorio>) => {
    await apiClient.patch(`/laboratorios/${id}`, {
      nombre: patch.nombre, edificioId: patch.edificio, piso: patch.piso,
      capacidadEquipos: patch.capEquipos, capacidadPersonas: patch.capPersonas,
    });
    state.labs = state.labs.map((l) => l.id === id ? { ...l, ...patch } : l);
    log("", "Laboratorio editado", id); notify();
  },
  deleteLab: async (id: string) => {
    await apiClient.delete(`/laboratorios/${id}`);
    state.labs = state.labs.filter((l) => l.id !== id); log("", "Laboratorio eliminado", id); notify();
  },
  // Equipos
  addEquipo: async (e: Equipo) => {
    await apiClient.post("/equipos", {
      codigo: e.codigo, nombre: e.nombre, laboratorioId: e.lab,
      fila: e.fila || undefined, puesto: e.puesto || undefined,
      sistemaOperativo: e.so || undefined, marca: e.marca || undefined,
      modelo: e.modelo || undefined, numeroSerie: e.serie || undefined,
      estadoId: e.estado,
    });
    state.equipos = [...state.equipos, e]; log("", "Equipo registrado", e.codigo); notify();
  },
  updateEquipo: async (codigo: string, patch: Partial<Equipo>) => {
    const body: any = {};
    if (patch.nombre !== undefined) body.nombre = patch.nombre;
    if (patch.lab !== undefined) body.laboratorioId = patch.lab;
    if (patch.fila !== undefined) body.fila = patch.fila;
    if (patch.puesto !== undefined) body.puesto = patch.puesto;
    if (patch.so !== undefined) body.sistemaOperativo = patch.so;
    if (patch.marca !== undefined) body.marca = patch.marca;
    if (patch.modelo !== undefined) body.modelo = patch.modelo;
    if (patch.serie !== undefined) body.numeroSerie = patch.serie;
    if (patch.estado !== undefined) body.estadoId = patch.estado;
    await apiClient.patch(`/equipos/${codigo}`, body);
    state.equipos = state.equipos.map((e) => e.codigo === codigo ? { ...e, ...patch } : e);
    log("", "Equipo actualizado", codigo); notify();
  },
  deleteEquipo: async (codigo: string) => {
    await apiClient.delete(`/equipos/${codigo}`);
    state.equipos = state.equipos.filter((e) => e.codigo !== codigo); log("", "Equipo eliminado", codigo); notify();
  },
  // Usuarios
  addUsuario: async (u: Usuario) => {
    // POST /auth/register expects personaId + roleId + password — the view handles creation via auth.addAccount
    state.usuarios = [...state.usuarios, u]; log("", "Usuario creado", u.username); notify();
  },
  updateUsuario: async (username: string, patch: Partial<Usuario>) => {
    const body: any = {};
    if (patch.rol !== undefined) body.roleId = patch.rol;
    if (patch.estado !== undefined) body.activo = patch.estado === "Activo";
    await apiClient.patch(`/auth/${username}`, body);
    state.usuarios = state.usuarios.map((u) => u.username === username ? { ...u, ...patch } : u);
    log("", "Usuario editado", username); notify();
  },
  deleteUsuario: async (username: string) => {
    await apiClient.delete(`/auth/${username}`);
    state.usuarios = state.usuarios.filter((u) => u.username !== username); log("", "Usuario eliminado", username); notify();
  },
  // Mantenimientos (preventivo / correctivo)
  addMantPrev: async (m: MantPrev, detalle?: Partial<MantDetalle>) => {
    const res = await apiClient.post("/mantenimientos", {
      tipoId: "preventivo", equipoCodigo: m.codigo, tecnicoId: "u-prev",
      fecha: m.fecha, estadoId: m.estado?.toLowerCase().replace(/\s+/g, "_") || "programado",
    });
    const mantId = res.data?.id || `MP-${Date.now()}`;
    if (detalle) {
      await apiClient.post("/mantenimientos/detalle", {
        mantenimientoId: mantId, ...detalle,
      });
    }
    state.misPrev = [m, ...state.misPrev];
    state.mantenimientos = [{ equipo: m.codigo, lab: m.lab, tecnico: "Yennifer Sarzuri", tipo: "Preventivo", fecha: m.fecha, estado: m.estado }, ...state.mantenimientos].slice(0, 50);
    const id = `MP-${Date.now()}`;
    state.detalles = [{
      id, tipo: "Preventivo", equipo: m.codigo, lab: m.lab, tecnico: "Yennifer Sarzuri",
      fecha: m.fecha, inicio: m.inicio, fin: m.fin, estado: m.estado,
      ...detalle,
    }, ...state.detalles];
    log("", "Mantenimiento preventivo", m.codigo);
    notify();
    return id;
  },
  updateMantPrev: async (orig: MantPrev, patch: Partial<MantPrev>, detallePatch?: Partial<MantDetalle>) => {
    const list = state.mantenimientos as any[];
    const existing = list.find((m: any) => m.equipo === orig.codigo && m.lab === orig.lab && m.fecha === orig.fecha);
    if (existing?.id) {
      await apiClient.patch(`/mantenimientos/${existing.id}`, { estadoId: patch.estado?.toLowerCase().replace(/\s+/g, "_") });
    }
    state.misPrev = state.misPrev.map((m) => (m === orig || (m.codigo === orig.codigo && m.fecha === orig.fecha && m.inicio === orig.inicio)) ? { ...m, ...patch } : m);
    if (detallePatch) {
      state.detalles = state.detalles.map((d) => (d.equipo === orig.codigo && d.fecha === orig.fecha) ? { ...d, ...detallePatch, estado: patch.estado ?? d.estado } : d);
    }
    log("", "Mantenimiento actualizado", orig.codigo);
    notify();
  },
  addCorrectivo: async (h: HistCorrectivo, equipoCodigo: string, nuevoEstado: string, detalle?: Partial<MantDetalle>) => {
    const res = await apiClient.post("/mantenimientos", {
      tipoId: "correctivo", equipoCodigo, tecnicoId: "u-corr",
      fecha: h.fecha, estadoId: "en_proceso",
    });
    const mantId = res.data?.id || `MC-${Date.now()}`;
    if (detalle) {
      await apiClient.post("/mantenimientos/detalle", {
        mantenimientoId: mantId, descripcion: h.problema, accionRealizada: h.accion, ...detalle,
      });
    }
    state.histCorrectivos = [h, ...state.histCorrectivos];
    const lab = state.equipos.find((e) => e.codigo === h.equipo)?.lab ?? "—";
    state.mantenimientos = [{ equipo: h.equipo, lab, tecnico: h.tecnico, tipo: "Correctivo", fecha: h.fecha, estado: h.estado === "Resuelto" ? "Completado" : "En proceso" }, ...state.mantenimientos].slice(0, 50);
    if (equipoCodigo) {
      state.equipos = state.equipos.map((e) => e.codigo === equipoCodigo ? { ...e, estado: nuevoEstado } : e);
    }
    const id = `MC-${Date.now()}`;
    state.detalles = [{
      id, tipo: "Correctivo", equipo: h.equipo, lab, tecnico: h.tecnico,
      fecha: h.fecha, estado: h.estado, descripcion: h.problema, accion: h.accion,
      ...detalle,
    }, ...state.detalles];
    log("", "Correctivo registrado", h.equipo);
    notify();
    return id;
  },
  resolverProblema: (codigo: string) => {
    state.equiposProblemas = state.equiposProblemas.filter((e) => e.codigo !== codigo);
    state.equipos = state.equipos.map((e) => e.codigo === codigo ? { ...e, estado: "Funcionando" } : e);
    log("", "Equipo atendido", codigo);
    notify();
  },
  // Insumos
  updateInsumo: async (nombre: string, patch: Partial<InsumoStock>) => {
    await apiClient.patch(`/insumos/${encodeURIComponent(nombre)}`, {
      stock: patch.stock, stockMinimo: patch.minimo, unidadMedida: patch.unidad,
    });
    state.insumos = state.insumos.map((i) => i.nombre === nombre ? { ...i, ...patch } : i);
    notify();
  },
  addInsumo: async (i: InsumoStock) => {
    await apiClient.post("/insumos", { nombre: i.nombre, unidadMedida: i.unidad, stock: i.stock, stockMinimo: i.minimo });
    state.insumos = [...state.insumos, i]; log("", "Insumo creado", i.nombre); notify();
  },
  deleteInsumo: async (nombre: string) => {
    await apiClient.delete(`/insumos/${encodeURIComponent(nombre)}`);
    state.insumos = state.insumos.filter((x) => x.nombre !== nombre); log("", "Insumo eliminado", nombre); notify();
  },
  // Perifericos
  addPeriferico: async (p: Periferico) => {
    await apiClient.post("/perifericos", {
      id: p.id, tipo: p.tipo, marca: p.marca, modelo: p.modelo,
      numeroSerie: p.serie, equipoCodigo: p.asignadoA || undefined, estado: p.estado,
    });
    state.perifericos = [...state.perifericos, p]; log("", "Periférico registrado", p.id); notify();
  },
  deletePeriferico: async (id: string) => {
    await apiClient.delete(`/perifericos/${id}`);
    state.perifericos = state.perifericos.filter((p) => p.id !== id); log("", "Periférico eliminado", id); notify();
  },
  updatePeriferico: async (id: string, patch: Partial<Periferico>) => {
    const body: any = {};
    if (patch.tipo !== undefined) body.tipo = patch.tipo;
    if (patch.marca !== undefined) body.marca = patch.marca;
    if (patch.modelo !== undefined) body.modelo = patch.modelo;
    if (patch.serie !== undefined) body.numeroSerie = patch.serie;
    if (patch.asignadoA !== undefined) body.equipoCodigo = patch.asignadoA;
    if (patch.estado !== undefined) body.estado = patch.estado;
    await apiClient.patch(`/perifericos/${id}`, body);
    state.perifericos = state.perifericos.map((p) => p.id === id ? { ...p, ...patch } : p);
    log("", "Periférico editado", id); notify();
  },
  // Detalles de mantenimiento
  addDetalle: (d: MantDetalle) => { state.detalles = [d, ...state.detalles]; notify(); },
  updateDetalle: (id: string, patch: Partial<MantDetalle>) => {
    state.detalles = state.detalles.map((d) => d.id === id ? { ...d, ...patch } : d);
    notify();
  },
  // Asignaciones
  addAsignacion: async (a: Asignacion) => {
    await apiClient.post("/asignaciones", {
      equipoCodigo: a.equipo, laboratorioId: a.lab, tecnicoId: a.asignadoA,
      problema: a.problema, prioridad: a.prioridad,
    });
    state.asignaciones = [a, ...state.asignaciones];
    log("", "Equipo asignado", `${a.equipo} → @${a.asignadoA}`);
    notify();
  },
  updateAsignacion: async (id: string, patch: Partial<Asignacion>) => {
    const body: any = {};
    if (patch.estado !== undefined) body.estado = patch.estado;
    if (patch.prioridad !== undefined) body.prioridad = patch.prioridad;
    if (patch.problema !== undefined) body.problema = patch.problema;
    await apiClient.patch(`/asignaciones/${id}`, body);
    state.asignaciones = state.asignaciones.map((a) => a.id === id ? { ...a, ...patch } : a);
    notify();
  },
  // Reportes de pasante → encargado
  addReportePasante: async (r: ReportePasante) => {
    // optimistic update: mostrar en UI inmediatamente
    state.reportesPasante = [r, ...state.reportesPasante];
    log(r.pasante, "Reporte enviado", r.titulo);
    notify();
    try {
      const lab = state.labs.find((l) => l.nombre === r.laboratorio);
      await apiClient.post("/reportes", {
        pasanteId: r.pasanteId || "u-prev",
        titulo: r.titulo, descripcion: r.descripcion,
        laboratorioId: lab?.id || r.laboratorio, ubicacion: r.ubicacion, categoria: r.categoria,
        prioridad: r.prioridad, rolReporte: r.rolReporte,
      });
    } catch (e) { console.error("POST /reportes falló:", e, r); }
  },
  updateReportePasante: async (id: string, patch: Partial<ReportePasante>) => {
    const body: any = {};
    if (patch.estado !== undefined) body.estado = patch.estado;
    if (patch.resolucionDetalle !== undefined) body.resolucionDetalle = patch.resolucionDetalle;
    await apiClient.patch(`/reportes/${id}`, body);
    state.reportesPasante = state.reportesPasante.map((r) => r.id === id ? { ...r, ...patch } : r);
    notify();
  },
  // Inventario
  addInventario: async (it: InventarioItem) => {
    await apiClient.post("/inventario", {
      id: it.id, categoriaId: it.categoria, codigoItic: it.codItic,
      codigoFacultativo: it.codFacultativo, codigoUmsa: it.codUmsa,
      numeroSerie: it.numeroSerie, marca: it.marca, modelo: it.modelo,
      estado: it.estado, fechaIngreso: it.fechaIngreso,
      fechaAsignacion: it.fechaAsignacion, laboratorioId: it.laboratorio,
      equipoCodigo: it.asignadoEquipo, observaciones: it.observaciones,
    });
    state.inventario = [it, ...state.inventario];
    log("", "Inventario: ítem registrado", `${it.categoria} ${it.codItic}`);
    notify();
  },
  updateInventario: async (id: string, patch: Partial<InventarioItem>) => {
    const body: any = {};
    if (patch.categoria !== undefined) body.categoriaId = patch.categoria;
    if (patch.estado !== undefined) body.estado = patch.estado;
    if (patch.observaciones !== undefined) body.observaciones = patch.observaciones;
    if (patch.laboratorio !== undefined) body.laboratorioId = patch.laboratorio;
    if (patch.asignadoEquipo !== undefined) body.equipoCodigo = patch.asignadoEquipo;
    if (patch.fechaAsignacion !== undefined) body.fechaAsignacion = patch.fechaAsignacion;
    await apiClient.patch(`/inventario/${id}`, body);
    state.inventario = state.inventario.map((i) => i.id === id ? { ...i, ...patch } : i);
    log("", "Inventario: ítem editado", id);
    notify();
  },
  deleteInventario: async (id: string) => {
    await apiClient.delete(`/inventario/${id}`);
    state.inventario = state.inventario.filter((i) => i.id !== id);
    log("", "Inventario: ítem eliminado", id);
    notify();
  },
  setStockMinimo: (categoria: InventarioCategoria, minimo: number) => {
    const exists = state.stockMinimos.some((s) => s.categoria === categoria);
    state.stockMinimos = exists
      ? state.stockMinimos.map((s) => s.categoria === categoria ? { ...s, minimo } : s)
      : [...state.stockMinimos, { categoria, minimo }];
    log("", "Stock mínimo actualizado", `${categoria}: ${minimo}`);
    notify();
  },
  // Correctivo: actualizar registro existente (por clave equipo+fecha+tecnico)
  updateCorrectivo: async (
    key: { equipo: string; fecha: string; tecnico: string },
    patchHist: Partial<HistCorrectivo>,
    detallePatch?: Partial<MantDetalle>,
  ) => {
    const list = state.mantenimientos as any[];
    const existing = list.find((m: any) => m.tipo === "Correctivo" && m.equipo === key.equipo && m.fecha === key.fecha && m.tecnico === key.tecnico);
    if (existing?.id) {
      await apiClient.patch(`/mantenimientos/${existing.id}`, { estadoId: patchHist.estado?.toLowerCase().replace(/\s+/g, "_") });
    }
    state.histCorrectivos = state.histCorrectivos.map((h) =>
      (h.equipo === key.equipo && h.fecha === key.fecha && h.tecnico === key.tecnico)
        ? { ...h, ...patchHist } : h,
    );
    if (detallePatch) {
      state.detalles = state.detalles.map((d) =>
        (d.tipo === "Correctivo" && d.equipo === key.equipo && d.fecha === key.fecha && d.tecnico === key.tecnico)
          ? { ...d, ...detallePatch, estado: patchHist.estado ?? d.estado } : d,
      );
    }
    log("", "Correctivo actualizado", key.equipo);
    notify();
  },
};

// --------- Prefill para Nuevo Mantenimiento Correctivo ---------
let _prefill: CorrectivoPrefill | null = null;
const prefillListeners = new Set<() => void>();
export const correctivoPrefill = {
  get: () => _prefill,
  set: (p: CorrectivoPrefill | null) => { _prefill = p; prefillListeners.forEach((fn) => fn()); },
  consume: () => { const p = _prefill; _prefill = null; prefillListeners.forEach((fn) => fn()); return p; },
  subscribe: (fn: () => void) => { prefillListeners.add(fn); return () => prefillListeners.delete(fn); },
};

// ─── API initialization ─────────────────────────────────────────────
export async function initFromApi() {
  try {
    const [labsRes, equiposRes, mantRes, incRes, insumosRes, usersRes, periRes, invRes, asigRes, reportRes, logRes] = await Promise.allSettled([
      apiClient.get("/laboratorios"),
      apiClient.get("/equipos"),
      apiClient.get("/mantenimientos"),
      apiClient.get("/incidencias"),
      apiClient.get("/insumos"),
      apiClient.get("/auth"),
      apiClient.get("/perifericos"),
      apiClient.get("/inventario"),
      apiClient.get("/asignaciones"),
      apiClient.get("/reportes"),
      apiClient.get("/logs"),
    ]);

    if (labsRes.status === "fulfilled" && labsRes.value.data?.length) {
      const apiLabs = labsRes.value.data.map((l: any) => ({
        id: l.id, nombre: l.nombre, edificio: l.edificio?.nombre || l.edificioId,
        piso: l.piso, capEquipos: l.capacidadEquipos, capPersonas: l.capacidadPersonas,
      }));
      if (apiLabs.length > 0) state.labs = apiLabs;
    }
    if (equiposRes.status === "fulfilled" && equiposRes.value.data?.length) {
      const apiEq = equiposRes.value.data.map((e: any) => ({
        codigo: e.codigo, nombre: e.nombre, lab: e.laboratorioId,
        fila: e.fila || "", puesto: e.puesto || "",
        so: e.sistemaOperativo || "", marca: e.marca || "", modelo: e.modelo || "",
        serie: e.numeroSerie || "", estado: e.estado?.nombre || e.estadoId,
      }));
      if (apiEq.length > 0) state.equipos = apiEq;
    }
    if (mantRes.status === "fulfilled" && mantRes.value.data?.length) {
      const formatTime = (t: any) => {
        if (!t) return null;
        if (typeof t === "string") return t.slice(0, 5);
        if (t instanceof Date) return t.toTimeString().slice(0, 5);
        return String(t).slice(0, 5);
      };
      const apiMant = mantRes.value.data.map((m: any) => ({
        equipo: m.equipo?.codigo || m.equipoCodigo,
        lab: m.equipo?.laboratorio?.nombre || m.laboratorioId,
        tecnico: m.tecnico?.persona?.nombres + " " + (m.tecnico?.persona?.paterno || ""),
        tipo: m.tipo?.nombre || m.tipoId,
        fecha: new Date(m.fecha).toLocaleDateString("es-BO"),
        estado: m.estado?.nombre || m.estadoId,
        horaInicio: formatTime(m.horaInicio),
        horaFin: formatTime(m.horaFin),
        detalle: m.detalle,
      }));
      if (apiMant.length > 0) state.mantenimientos = apiMant.slice(0, 50);

      const prevs = apiMant.filter((m: any) => m.tipo === "Preventivo");
      if (prevs.length > 0) {
        state.misPrev = prevs.map((m: any) => ({
          codigo: m.equipo,
          lab: m.lab,
          fecha: m.fecha,
          inicio: m.horaInicio || "—",
          fin: m.horaFin || "—",
          estado: m.estado,
        }));
      }
      const correctivos = apiMant.filter((m: any) => m.tipo === "Correctivo");
      if (correctivos.length > 0) {
        state.histCorrectivos = correctivos.map((m: any) => ({
          equipo: m.equipo,
          problema: m.detalle?.descripcion || m.detalle?.diagnostico || "—",
          accion: m.detalle?.accionRealizada || m.detalle?.resolucion || "—",
          tecnico: m.tecnico,
          fecha: m.fecha,
          estado: m.estado,
        }));
      }

      // Populate state.detalles from API data (maps m.detalle → MantDetalle)
      const apiDetalles: MantDetalle[] = mantRes.value.data
        .filter((m: any) => m.detalle)
        .map((m: any) => {
          const d = m.detalle;
          const tipo = m.tipo?.nombre || m.tipoId;
          const mapChecklist = (cat: string) =>
            (d.checklists ?? [])
              .filter((c: any) => c.categoria === cat)
              .map((c: any) => ({ item: c.item, estado: c.estado, obs: c.observacion || "" }));
          const mapped: MantDetalle = {
            id: d.id || `det-${m.id}`,
            tipo,
            equipo: m.equipo?.codigo || m.equipoCodigo,
            lab: m.equipo?.laboratorio?.nombre || m.laboratorioId,
            tecnico: m.tecnico?.persona?.nombres + " " + (m.tecnico?.persona?.paterno || ""),
            fecha: new Date(m.fecha).toLocaleDateString("es-BO"),
            inicio: formatTime(m.horaInicio) || undefined,
            fin: formatTime(m.horaFin) || undefined,
            estado: m.estado?.nombre || m.estadoId,
            descripcion: d.descripcion || undefined,
            diagnostico: d.diagnostico || undefined,
            accion: d.accionRealizada || undefined,
            resolucion: d.resolucion || undefined,
            tipoIncidencia: d.tipoIncidencia || undefined,
            estadoFinal: d.estadoFinal || undefined,
            observaciones: d.observaciones || undefined,
            recomendaciones: d.recomendaciones || undefined,
          };
          if (d.checklists?.length) {
            mapped.hardware = mapChecklist("hardware");
            mapped.software = mapChecklist("software");
            mapped.pruebas = mapChecklist("pruebas");
          }
          if (d.insumosUsados?.length) {
            mapped.insumos = d.insumosUsados.map((iu: any) => ({
              insumo: iu.insumo?.nombre || iu.insumoNombre,
              cantidad: String(iu.cantidad),
              unidad: iu.insumo?.unidadMedida || "unidades",
            }));
          }
          return mapped;
        });
      if (apiDetalles.length > 0) state.detalles = apiDetalles;
    }
    if (incRes.status === "fulfilled" && incRes.value.data?.length) {
      const apiInc = incRes.value.data.map((i: any) => ({
        equipo: i.equipo?.codigo || i.equipoCodigo,
        problema: i.problema,
        seguimiento: i.requiereSeguimiento,
        fecha: new Date(i.fecha).toLocaleDateString("es-BO"),
        color: i.requiereSeguimiento ? "danger" : "warning",
      }));
      if (apiInc.length > 0) state.incidencias = apiInc.slice(0, 20);
    }
    if (insumosRes.status === "fulfilled" && insumosRes.value.data?.length) {
      state.insumos = insumosRes.value.data.map((i: any) => ({
        nombre: i.nombre, unidad: i.unidadMedida,
        stock: i.stock, minimo: i.stockMinimo,
      }));
    }
    if (periRes.status === "fulfilled" && periRes.value.data?.length) {
      state.perifericos = periRes.value.data.map((p: any) => ({
        id: p.id, tipo: p.tipo,
        marca: p.marca || "", modelo: p.modelo || "",
        serie: p.numeroSerie || "",
        asignadoA: p.equipoCodigo || "",
        estado: p.estado,
      }));
    }
    if (usersRes.status === "fulfilled" && usersRes.value.data?.length) {
      state.usuarios = usersRes.value.data.map((u: any) => ({
        username: u.id,
        nombre: [u.nombres, u.paterno, u.materno].filter(Boolean).join(" "),
        rol: u.roleName || u.roleId,
        email: u.email || "",
        estado: u.activo ? "Activo" : "Inactivo",
        fecha: new Date(u.createdAt).toLocaleDateString("es-BO"),
        nombres: u.nombres,
        paterno: u.paterno,
        materno: u.materno || undefined,
        celular: u.celular || undefined,
      }));
      // Sync to auth.accounts so UsuariosView (which reads accounts) shows all backend users
      auth.setAccounts(usersRes.value.data.map((u: any) => ({
        id: u.id,
        role: u.roleId,
        activo: u.activo,
        nombres: u.nombres,
        paterno: u.paterno,
        materno: u.materno || undefined,
        email: u.email || undefined,
        registro: u.registro || undefined,
        celular: u.celular || undefined,
      })));
    }
    if (invRes.status === "fulfilled" && invRes.value.data?.length) {
      state.inventario = invRes.value.data.map((it: any) => ({
        id: it.id,
        categoria: it.categoria?.nombre || it.categoriaId,
        codItic: it.codigoItic,
        codFacultativo: it.codigoFacultativo || undefined,
        codUmsa: it.codigoUmsa || undefined,
        numeroSerie: it.numeroSerie || "",
        marca: it.marca || "",
        modelo: it.modelo || "",
        estado: it.estado,
        fechaIngreso: new Date(it.fechaIngreso).toISOString().slice(0, 10),
        fechaAsignacion: it.fechaAsignacion ? new Date(it.fechaAsignacion).toISOString().slice(0, 10) : undefined,
        asignadoEquipo: it.equipoCodigo || undefined,
        laboratorio: it.laboratorioId || undefined,
        observaciones: it.observaciones || undefined,
      }));
      // sync stockMinimos from API categories if response has categoria info
      const cats = invRes.value.data
        .filter((it: any) => it.categoria?.nombre && it.categoria?.stockMinimo != null)
        .reduce((acc: any, it: any) => {
          const name = it.categoria.nombre;
          if (!acc.find((c: any) => c.categoria === name)) acc.push({ categoria: name, minimo: it.categoria.stockMinimo });
          return acc;
        }, [] as StockMinimo[]);
      if (cats.length > 0) state.stockMinimos = cats;
    }
    if (asigRes.status === "fulfilled" && asigRes.value.data?.length) {
      state.asignaciones = asigRes.value.data.map((a: any) => ({
        id: a.id,
        equipo: a.equipo?.codigo || a.equipoCodigo,
        lab: a.laboratorios?.nombre || a.laboratorioId,
        asignadoA: a.tecnico?.id || a.tecnicoId,
        problema: a.problema,
        prioridad: a.prioridad,
        fecha: new Date(a.fecha).toLocaleDateString("es-BO"),
        estado: a.estado,
      }));
    }
    if (reportRes.status === "fulfilled" && reportRes.value.data) {
      state.reportesPasante = reportRes.value.data.map((r: any) => ({
        id: r.id,
        pasante: r.pasante?.persona?.nombres + " " + (r.pasante?.persona?.paterno || ""),
        pasanteId: r.pasanteId,
        rolReporte: r.rolReporte || r.pasante?.rol?.id || undefined,
        titulo: r.titulo,
        descripcion: r.descripcion,
        laboratorio: r.laboratorios?.nombre || r.laboratorioId,
        ubicacion: r.ubicacion || "",
        categoria: r.categoria || "",
        prioridad: r.prioridad,
        fecha: new Date(r.fecha).toLocaleDateString("es-BO"),
        estado: r.estado,
        resolucionDetalle: r.resolucionDetalle || undefined,
      }));
    }
    if (logRes.status === "fulfilled" && logRes.value.data?.length) {
      state.logs = logRes.value.data.map((l: any) => ({
        ts: new Date(l.timestamp).toLocaleString("es-BO"),
        usuario: l.usuario?.persona?.nombres + " " + (l.usuario?.persona?.paterno || "") || l.usuarioId || "",
        accion: l.accion,
        detalle: l.detalle || "",
        modulo: l.modulo || undefined,
        entidad: l.entidad || undefined,
        equipo: l.equipoCodigo || undefined,
        tipoAccion: l.tipoAccion || undefined,
        estado: l.estado || "Éxito",
      }));
    }
    notify();
  } catch {
    // Fallback silently to seed data
  }
}

export function useStore<T>(selector: (s: State) => T): T {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = store.subscribe(() => force((n) => n + 1));
    return unsub;
  }, []);
  return selector(state);
}
