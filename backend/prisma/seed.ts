import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 12);
  const now = new Date();

  // ─── CATÁLOGOS ───────────────────────────────────────────────────
  await prisma.rol.createMany({ skipDuplicates: true, data: [
    { id: "encargado",   nombre: "Encargado ITIC",     descripcion: "Administrador del sistema, gestión completa",     nivelAcceso: 100 },
    { id: "preventivo",  nombre: "Pasante Preventivo", descripcion: "Mantenimiento preventivo de equipos",             nivelAcceso: 70 },
    { id: "correctivo",  nombre: "Pasante Correctivo", descripcion: "Mantenimiento correctivo y reparaciones",         nivelAcceso: 70 },
    { id: "docente",     nombre: "Docente",             descripcion: "Reporta incidencias en laboratorios",            nivelAcceso: 40 },
    { id: "estudiante",  nombre: "Estudiante",          descripcion: "Reporta incidencias en laboratorios",            nivelAcceso: 30 },
    { id: "invitado",    nombre: "Invitado",            descripcion: "Solo lectura de información pública",           nivelAcceso: 10 },
  ]});

  await prisma.edificio.createMany({ skipDuplicates: true, data: [
    { id: "PPAL",      nombre: "Edificio Principal", ubicacion: "Campus Universitario, Av. Villazón Nro. 1995" },
    { id: "LASIN",     nombre: "Edificio LASIN",     ubicacion: "Campus Universitario, Calle 30 de Octubre" },
    { id: "MONOBLOCK", nombre: "Monoblock Central",  ubicacion: "Av. Villazón, frente a la Plaza del Bicentenario" },
  ]});

  await prisma.estadoEquipo.createMany({ skipDuplicates: true, data: [
    { id: "funcionando",        nombre: "Funcionando" },
    { id: "en_mantenimiento",   nombre: "En mantenimiento" },
    { id: "pendiente",          nombre: "Pendiente" },
    { id: "en_espera_repuesto", nombre: "En espera repuesto" },
    { id: "de_baja",            nombre: "De baja" },
  ]});

  await prisma.tipoMantenimiento.createMany({ skipDuplicates: true, data: [
    { id: "preventivo", nombre: "Preventivo" },
    { id: "correctivo", nombre: "Correctivo" },
  ]});

  await prisma.estadoMantenimiento.createMany({ skipDuplicates: true, data: [
    { id: "programado",  nombre: "Programado" },
    { id: "en_proceso",  nombre: "En proceso" },
    { id: "completado",  nombre: "Completado" },
    { id: "resuelto",    nombre: "Resuelto" },
    { id: "pendiente",   nombre: "Pendiente" },
  ]});

  await prisma.estadoIncidencia.createMany({ skipDuplicates: true, data: [
    { id: "nuevo",       nombre: "Nuevo" },
    { id: "en_proceso",  nombre: "En proceso" },
    { id: "resuelto",    nombre: "Resuelto" },
    { id: "cerrado",     nombre: "Cerrado" },
    { id: "rechazado",   nombre: "Rechazado" },
  ]});

  await prisma.categoriaInventario.createMany({ skipDuplicates: true, data: [
    { id: "monitor",         nombre: "Monitor",         stockMinimo: 2 },
    { id: "teclado",         nombre: "Teclado",         stockMinimo: 3 },
    { id: "mouse",           nombre: "Mouse",           stockMinimo: 3 },
    { id: "fuente_poder",    nombre: "Fuente de poder", stockMinimo: 2 },
    { id: "placa_madre",     nombre: "Placa madre",     stockMinimo: 1 },
    { id: "disco_duro",      nombre: "Disco duro",      stockMinimo: 3 },
    { id: "memoria_ram",     nombre: "Memoria RAM",     stockMinimo: 4 },
    { id: "microprocesador", nombre: "Microprocesador",  stockMinimo: 2 },
    { id: "tarjeta_video",   nombre: "Tarjeta de video", stockMinimo: 1 },
    { id: "cooler",          nombre: "Cooler",          stockMinimo: 2 },
    { id: "cable_sata",      nombre: "Cable SATA",      stockMinimo: 5 },
    { id: "cortapicos",      nombre: "Cortapicos",      stockMinimo: 2 },
    { id: "otro",            nombre: "Otro",            stockMinimo: 0 },
  ]});

  // ─── PERSONAS ────────────────────────────────────────────────────
  await prisma.persona.createMany({ skipDuplicates: true, data: [
    { id: "P-ENC-001", nombres: "Reynaldo", paterno: "Escobar", materno: "Quispe", ci: "4455667 LP", email: "rescobar@umsa.bo", celular: "+591 70011223" },
    { id: "P-ADM-001", nombres: "Patricia", paterno: "Rojas",   materno: "Vargas", ci: "3344556 LP", email: "projas@umsa.bo",  celular: "+591 71234567" },
    { id: "P-PRE-001", nombres: "Yennifer", paterno: "Sarzuri", materno: "Mamani", ci: "9988776 LP", registroUniversitario: "20250001", email: "ysarzuri@est.umsa.bo", celular: "+591 76543210" },
    { id: "P-PRE-002", nombres: "Carla",    paterno: "Mendoza", materno: "Flores", ci: "8877665 LP", registroUniversitario: "20250002", email: "cmendoza@est.umsa.bo", celular: "+591 72456890" },
    { id: "P-COR-001", nombres: "Jhonny",   paterno: "Arias",   materno: "Choque", ci: "6655443 LP", registroUniversitario: "20250003", email: "jarias@est.umsa.bo",   celular: "+591 79988776" },
    { id: "P-COR-002", nombres: "Mauricio", paterno: "Quispe",  materno: "Mamani", ci: "5544332 LP", registroUniversitario: "20250004", email: "mquispe@est.umsa.bo",  celular: "+591 68877665" },
    { id: "P-DOC-001", nombres: "Juan Carlos", paterno: "Mamani", materno: "García", ci: "1122334 LP", email: "jcmamani@umsa.bo", celular: "+591 71555666" },
    { id: "P-DOC-002", nombres: "María Elena", paterno: "Vargas", materno: "López",  ci: "2233445 LP", email: "mvargas@umsa.bo",  celular: "+591 72555444" },
    { id: "P-DOC-003", nombres: "Pedro",      paterno: "Quispe",  materno: "Huanca", ci: "3344556 LP", email: "pquispe@umsa.bo",  celular: "+591 73555333" },
    { id: "P-DOC-004", nombres: "Ana",        paterno: "Condori", materno: "Pérez",  ci: "4455667 LP", email: "acondori@umsa.bo", celular: "+591 74555222" },
    { id: "P-DOC-005", nombres: "Luis Alberto", paterno: "Flores", materno: "Ticona", ci: "5566778 LP", email: "lflores@umsa.bo", celular: "+591 75555111" },
    { id: "P-EST-001", nombres: "Luis",    paterno: "Mendoza", materno: "Flores", registroUniversitario: "20250005", email: "lmendoza@est.umsa.bo", celular: "+591 77665544" },
    { id: "P-EST-002", nombres: "Rosa",    paterno: "Huanca",  materno: "Choque", registroUniversitario: "20250007", email: "rhuanca@est.umsa.bo",  celular: "+591 60123456" },
    { id: "P-EST-003", nombres: "Carlos",  paterno: "Torrez",  materno: "Alanoca", registroUniversitario: "20250008", email: "ctorrez@est.umsa.bo",  celular: "+591 60234567" },
    { id: "P-INV-001", nombres: "Visitante", paterno: "Demo",  email: "invitado@test.com" },
  ]});

  // ─── USUARIOS ────────────────────────────────────────────────────
  await prisma.usuario.createMany({ skipDuplicates: true, data: [
    { id: "u-admin",    personaId: "P-ENC-001", roleId: "encargado",   passwordHash: password },
    { id: "u-docente",  personaId: "P-ADM-001", roleId: "docente",     passwordHash: password },
    { id: "u-prev",     personaId: "P-PRE-001", roleId: "preventivo",  passwordHash: password },
    { id: "u-prev2",    personaId: "P-PRE-002", roleId: "preventivo",  passwordHash: password },
    { id: "u-corr",     personaId: "P-COR-001", roleId: "correctivo",  passwordHash: password },
    { id: "u-corr2",    personaId: "P-COR-002", roleId: "correctivo",  passwordHash: password },
    { id: "u-doc1",     personaId: "P-DOC-001", roleId: "docente",     passwordHash: password },
    { id: "u-doc2",     personaId: "P-DOC-002", roleId: "docente",     passwordHash: password },
    { id: "u-doc3",     personaId: "P-DOC-003", roleId: "docente",     passwordHash: password },
    { id: "u-doc4",     personaId: "P-DOC-004", roleId: "docente",     passwordHash: password },
    { id: "u-doc5",     personaId: "P-DOC-005", roleId: "docente",     passwordHash: password },
    { id: "u-est",      personaId: "P-EST-001", roleId: "estudiante",  passwordHash: password },
    { id: "u-est2",     personaId: "P-EST-002", roleId: "estudiante",  passwordHash: password },
    { id: "u-est3",     personaId: "P-EST-003", roleId: "estudiante",  passwordHash: password },
    { id: "u-invitado", personaId: "P-INV-001", roleId: "invitado",    passwordHash: password },
  ]});

  // ─── LABORATORIOS ────────────────────────────────────────────────
  await prisma.laboratorio.createMany({ skipDuplicates: true, data: [
    { id: "LAB1",   nombre: "Laboratorio 1", edificioId: "PPAL", piso: 1, capacidadEquipos: 25, capacidadPersonas: 30, encargadoId: "P-ENC-001" },
    { id: "LAB2",   nombre: "Laboratorio 2", edificioId: "PPAL", piso: 1, capacidadEquipos: 20, capacidadPersonas: 25, encargadoId: "P-ENC-001" },
    { id: "LAB3",   nombre: "Laboratorio 3", edificioId: "PPAL", piso: 2, capacidadEquipos: 22, capacidadPersonas: 28, encargadoId: "P-ENC-001" },
    { id: "LAB4",   nombre: "Laboratorio 4", edificioId: "PPAL", piso: 2, capacidadEquipos: 20, capacidadPersonas: 25, encargadoId: "P-ENC-001" },
    { id: "LASIN1", nombre: "LASIN 1",       edificioId: "LASIN", piso: 1, capacidadEquipos: 18, capacidadPersonas: 22, encargadoId: "P-ENC-001" },
    { id: "LASIN2", nombre: "LASIN 2",       edificioId: "LASIN", piso: 1, capacidadEquipos: 15, capacidadPersonas: 20, encargadoId: "P-ENC-001" },
    { id: "LASIN3", nombre: "LASIN 3",       edificioId: "LASIN", piso: 2, capacidadEquipos: 15, capacidadPersonas: 20, encargadoId: "P-ENC-001" },
  ]});

  // ─── EQUIPOS ─────────────────────────────────────────────────────
  await prisma.equipo.createMany({ skipDuplicates: true, data: [
    { codigo: "PC-LAB1-001",  nombre: "HP ProDesk 600 G6",  laboratorioId: "LAB1",   fila: "A", puesto: "01", sistemaOperativo: "Windows 11 Pro", marca: "HP",     modelo: "ProDesk 600 G6",  numeroSerie: "MXL2345A1B", estadoId: "funcionando",        fechaCompra: new Date("2023-03-15") },
    { codigo: "PC-LAB1-002",  nombre: "Dell OptiPlex 7090", laboratorioId: "LAB1",   fila: "A", puesto: "02", sistemaOperativo: "Windows 11 Pro", marca: "Dell",   modelo: "OptiPlex 7090",   numeroSerie: "DLL789X45",   estadoId: "funcionando",        fechaCompra: new Date("2023-03-15") },
    { codigo: "PC-LAB1-003",  nombre: "Lenovo ThinkCentre M70q", laboratorioId: "LAB1", fila: "A", puesto: "03", sistemaOperativo: "Windows 10 Pro", marca: "Lenovo", modelo: "ThinkCentre M70q", numeroSerie: "LNV45612",   estadoId: "en_mantenimiento",   fechaCompra: new Date("2022-06-20") },
    { codigo: "PC-LAB2-001",  nombre: "HP EliteDesk 800 G8", laboratorioId: "LAB2",  fila: "B", puesto: "01", sistemaOperativo: "Windows 11 Pro", marca: "HP",     modelo: "EliteDesk 800 G8", numeroSerie: "MXL667712",  estadoId: "funcionando",        fechaCompra: new Date("2024-01-10") },
    { codigo: "PC-LAB2-005",  nombre: "Dell Vostro 3681",   laboratorioId: "LAB2",   fila: "C", puesto: "02", sistemaOperativo: "Windows 10 Pro", marca: "Dell",   modelo: "Vostro 3681",     numeroSerie: "DLL112233",   estadoId: "pendiente",          fechaCompra: new Date("2022-08-20") },
    { codigo: "PC-LAB3-002",  nombre: "HP ProDesk 400 G7",  laboratorioId: "LAB3",   fila: "C", puesto: "02", sistemaOperativo: "Windows 11 Pro", marca: "HP",     modelo: "ProDesk 400 G7",  numeroSerie: "MXL998877",  estadoId: "funcionando",        fechaCompra: new Date("2023-10-05") },
    { codigo: "PC-LAB4-007",  nombre: "Lenovo ThinkCentre M90q", laboratorioId: "LAB4", fila: "D", puesto: "07", sistemaOperativo: "Windows 11 Pro", marca: "Lenovo", modelo: "ThinkCentre M90q", numeroSerie: "LNV778899",  estadoId: "de_baja",            fechaCompra: new Date("2021-02-10") },
    { codigo: "PC-LASIN1-004", nombre: "Dell OptiPlex 5080", laboratorioId: "LASIN1", fila: "E", puesto: "04", sistemaOperativo: "Ubuntu 22.04",   marca: "Dell",   modelo: "OptiPlex 5080",   numeroSerie: "DLL334455",  estadoId: "en_espera_repuesto", fechaCompra: new Date("2023-05-20") },
    { codigo: "PC-LASIN2-001", nombre: "HP ProDesk 400 G7",  laboratorioId: "LASIN2", fila: "F", puesto: "01", sistemaOperativo: "Windows 10 Pro", marca: "HP",     modelo: "ProDesk 400 G7",  numeroSerie: "MXL887766",  estadoId: "funcionando",        fechaCompra: new Date("2024-02-01") },
  ]});

  // ─── PERIFÉRICOS ─────────────────────────────────────────────────
  await prisma.periferico.createMany({ skipDuplicates: true, data: [
    { id: "UMSA-INF-2024-101", tipo: "Monitor",   marca: "Samsung", modelo: "S22F350",  numeroSerie: "SAM2245X",  equipoCodigo: "PC-LAB1-001", estado: "Funcionando" },
    { id: "UMSA-INF-2024-102", tipo: "Teclado",   marca: "Logitech", modelo: "K120",    numeroSerie: "LGT88121",  equipoCodigo: "PC-LAB1-001", estado: "Funcionando" },
    { id: "UMSA-INF-2024-103", tipo: "Mouse",     marca: "Logitech", modelo: "M100",    numeroSerie: "LGT77234",  equipoCodigo: "PC-LAB1-001", estado: "Funcionando" },
    { id: "UMSA-INF-2024-104", tipo: "Monitor",   marca: "LG",      modelo: "20MK400",  numeroSerie: "LG998812",  equipoCodigo: "PC-LAB2-001", estado: "Funcionando" },
    { id: "UMSA-INF-2024-105", tipo: "Teclado",   marca: "Genius",  modelo: "KB-110X",  numeroSerie: "GEN334455", laboratorioId: "LAB4",       estado: "De baja" },
    { id: "UMSA-INF-2024-106", tipo: "Impresora", marca: "HP",      modelo: "LaserJet M404", numeroSerie: "HP445566", laboratorioId: "LAB1",   estado: "En mantenimiento" },
    { id: "UMSA-INF-2024-107", tipo: "Proyector", marca: "Epson",   modelo: "PowerLite X41+", numeroSerie: "EPS112233", laboratorioId: "LAB3", estado: "Funcionando" },
    { id: "UMSA-INF-2024-108", tipo: "Switch",    marca: "TP-Link", modelo: "TL-SG1024", numeroSerie: "TPL778899", laboratorioId: "LASIN1",   estado: "Funcionando" },
  ]});

  // ─── INSUMOS ─────────────────────────────────────────────────────
  await prisma.insumo.createMany({ skipDuplicates: true, data: [
    { nombre: "Alcohol isopropílico",  unidadMedida: "ml",        stock: 2400, stockMinimo: 500 },
    { nombre: "Paños de microfibra",   unidadMedida: "unidades",  stock: 35,   stockMinimo: 10 },
    { nombre: "Hisopos/brochas",       unidadMedida: "unidades",  stock: 80,   stockMinimo: 20 },
    { nombre: "Pasta térmica",         unidadMedida: "aplicaciones", stock: 12, stockMinimo: 5 },
    { nombre: "Aire comprimido",       unidadMedida: "segundos",  stock: 1800, stockMinimo: 600 },
    { nombre: "Cables SATA",           unidadMedida: "unidades",  stock: 25,   stockMinimo: 5 },
    { nombre: "Tornillos para disco",  unidadMedida: "unidades",  stock: 120,  stockMinimo: 20 },
    { nombre: "Bridas plásticas",      unidadMedida: "unidades",  stock: 200,  stockMinimo: 30 },
    { nombre: "Pulsera antiestática",  unidadMedida: "unidades",  stock: 8,    stockMinimo: 2 },
    { nombre: "Limpiador de pantalla", unidadMedida: "ml",        stock: 800,  stockMinimo: 200 },
  ]});

  // ─── INVENTARIO ──────────────────────────────────────────────────
  await prisma.inventarioItem.createMany({ skipDuplicates: true, data: [
    { id: "INV-0001", categoriaId: "monitor",   codigoItic: "ITIC-MON-0001", codigoFacultativo: "FAC-2024-101", codigoUmsa: "UMSA-INF-2024-101", numeroSerie: "SAM2245X",  marca: "Samsung",       modelo: "S22F350",     estado: "Operativo",    fechaIngreso: new Date("2024-03-15"), fechaAsignacion: new Date("2024-04-01"), laboratorioId: "LAB1", equipoCodigo: "PC-LAB1-001" },
    { id: "INV-0002", categoriaId: "teclado",   codigoItic: "ITIC-TEC-0001", codigoFacultativo: "FAC-2024-102", codigoUmsa: "UMSA-INF-2024-102", numeroSerie: "LGT88121",  marca: "Logitech",      modelo: "K120",         estado: "Operativo",    fechaIngreso: new Date("2024-03-15"), fechaAsignacion: new Date("2024-04-01"), laboratorioId: "LAB1", equipoCodigo: "PC-LAB1-001" },
    { id: "INV-0003", categoriaId: "mouse",     codigoItic: "ITIC-MSE-0001", codigoFacultativo: "FAC-2024-103", codigoUmsa: "UMSA-INF-2024-103", numeroSerie: "LGT77234",  marca: "Logitech",      modelo: "M100",         estado: "Operativo",    fechaIngreso: new Date("2024-03-15"), fechaAsignacion: new Date("2024-04-01"), laboratorioId: "LAB1", equipoCodigo: "PC-LAB1-001" },
    { id: "INV-0004", categoriaId: "monitor",   codigoItic: "ITIC-MON-0002", codigoFacultativo: "FAC-2024-110", codigoUmsa: "UMSA-INF-2024-110", numeroSerie: "LG998812",  marca: "LG",            modelo: "20MK400",      estado: "Operativo",    fechaIngreso: new Date("2024-05-02"), fechaAsignacion: new Date("2024-05-10"), laboratorioId: "LAB2" },
    { id: "INV-0005", categoriaId: "disco_duro",  codigoItic: "ITIC-HDD-0001", codigoFacultativo: "FAC-2024-201", numeroSerie: "WD500987",  marca: "Western Digital", modelo: "Blue 1TB",     estado: "En almacén",  fechaIngreso: new Date("2024-08-20") },
    { id: "INV-0006", categoriaId: "memoria_ram", codigoItic: "ITIC-RAM-0001", numeroSerie: "KGT44521",  marca: "Kingston", modelo: "Fury 8GB DDR4", estado: "En almacén",  fechaIngreso: new Date("2024-09-10") },
    { id: "INV-0007", categoriaId: "fuente_poder", codigoItic: "ITIC-PSU-0001", numeroSerie: "EVGA70011", marca: "EVGA",     modelo: "500W 80+ Bronze", estado: "En almacén", fechaIngreso: new Date("2024-09-15") },
    { id: "INV-0008", categoriaId: "cable_sata",   codigoItic: "ITIC-CAB-0001", numeroSerie: "GEN-S-001", marca: "Genérico", modelo: "SATA III 50cm",   estado: "En almacén",  fechaIngreso: new Date("2024-10-01") },
    { id: "INV-0009", categoriaId: "cortapicos",   codigoItic: "ITIC-CRT-0001", numeroSerie: "TPL-CRT-09", marca: "TP-Link",  modelo: "6 tomas",         estado: "Operativo",   fechaIngreso: new Date("2024-02-01"), fechaAsignacion: new Date("2024-02-10"), laboratorioId: "LAB3" },
    { id: "INV-0010", categoriaId: "microprocesador", codigoItic: "ITIC-CPU-0001", numeroSerie: "INTL-i5-22", marca: "Intel",    modelo: "Core i5-12400",  estado: "En almacén",  fechaIngreso: new Date("2025-01-12") },
    { id: "INV-0011", categoriaId: "tarjeta_video", codigoItic: "ITIC-GPU-0001", numeroSerie: "NV-GTX-01", marca: "NVIDIA",   modelo: "GTX 1650",        estado: "De baja",     fechaIngreso: new Date("2022-05-10"), observaciones: "Ventilador dañado" },
    { id: "INV-0012", categoriaId: "cooler",       codigoItic: "ITIC-COL-0001", numeroSerie: "CM-HYPER-7", marca: "Cooler Master", modelo: "Hyper 212",  estado: "En almacén",  fechaIngreso: new Date("2025-02-18") },
  ]});

  // ─── MATERIAS (Carrera de Informática UMSA) ─────────────────────
  await prisma.materia.createMany({ skipDuplicates: true, data: [
    { codigo: "INF-111", nombre: "Introducción a la Informática", sigla: "INF-111", nivel: 1, horasTeoricas: 4, horasPracticas: 2 },
    { codigo: "INF-112", nombre: "Matemática Discreta",           sigla: "INF-112", nivel: 1, horasTeoricas: 4, horasPracticas: 2 },
    { codigo: "INF-121", nombre: "Programación I",               sigla: "INF-121", nivel: 2, horasTeoricas: 3, horasPracticas: 4 },
    { codigo: "INF-211", nombre: "Estructuras de Datos",         sigla: "INF-211", nivel: 3, horasTeoricas: 3, horasPracticas: 4 },
    { codigo: "INF-212", nombre: "Base de Datos I",              sigla: "INF-212", nivel: 3, horasTeoricas: 3, horasPracticas: 3 },
    { codigo: "INF-221", nombre: "Programación II",              sigla: "INF-221", nivel: 4, horasTeoricas: 3, horasPracticas: 4 },
    { codigo: "INF-222", nombre: "Arquitectura de Computadoras", sigla: "INF-222", nivel: 4, horasTeoricas: 3, horasPracticas: 3 },
    { codigo: "INF-311", nombre: "Redes de Computadoras",        sigla: "INF-311", nivel: 5, horasTeoricas: 3, horasPracticas: 3 },
    { codigo: "INF-321", nombre: "Sistemas Operativos",          sigla: "INF-321", nivel: 6, horasTeoricas: 3, horasPracticas: 3 },
    { codigo: "INF-322", nombre: "Base de Datos II",             sigla: "INF-322", nivel: 6, horasTeoricas: 3, horasPracticas: 3 },
    { codigo: "INF-411", nombre: "Inteligencia Artificial",      sigla: "INF-411", nivel: 7, horasTeoricas: 3, horasPracticas: 3 },
    { codigo: "INF-421", nombre: "Proyecto de Grado I",          sigla: "INF-421", nivel: 8, horasTeoricas: 2, horasPracticas: 4 },
  ]});

  // ─── GRUPOS Y HORARIOS ─────────────────────────────────────────
  await prisma.grupo.createMany({ skipDuplicates: true, data: [
    { id: "G-INF121-A", materiaCodigo: "INF-121", numeroGrupo: "A", gestion: 2026, periodo: "1-2026", docenteId: "P-DOC-001", cupoMaximo: 40 },
    { id: "G-INF121-B", materiaCodigo: "INF-121", numeroGrupo: "B", gestion: 2026, periodo: "1-2026", docenteId: "P-DOC-001", cupoMaximo: 35 },
    { id: "G-INF211-A", materiaCodigo: "INF-211", numeroGrupo: "A", gestion: 2026, periodo: "1-2026", docenteId: "P-DOC-002", cupoMaximo: 40 },
    { id: "G-INF212-A", materiaCodigo: "INF-212", numeroGrupo: "A", gestion: 2026, periodo: "1-2026", docenteId: "P-DOC-003", cupoMaximo: 35 },
    { id: "G-INF321-A", materiaCodigo: "INF-321", numeroGrupo: "A", gestion: 2026, periodo: "1-2026", docenteId: "P-DOC-005", cupoMaximo: 30 },
  ]});

  await prisma.inscripcion.createMany({ skipDuplicates: true, data: [
    { id: "INS-001", personaId: "P-EST-001", grupoId: "G-INF121-A", fechaInscripcion: new Date("2026-02-10") },
    { id: "INS-002", personaId: "P-EST-002", grupoId: "G-INF121-A", fechaInscripcion: new Date("2026-02-10") },
    { id: "INS-003", personaId: "P-EST-003", grupoId: "G-INF121-B", fechaInscripcion: new Date("2026-02-11") },
    { id: "INS-004", personaId: "P-EST-001", grupoId: "G-INF211-A", fechaInscripcion: new Date("2026-02-12") },
    { id: "INS-005", personaId: "P-EST-002", grupoId: "G-INF212-A", fechaInscripcion: new Date("2026-02-12") },
  ]});

  console.log("✅ Seed completado");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
