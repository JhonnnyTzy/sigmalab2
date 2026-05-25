// SIGMALAB sample data — ITIC Laboratorios UMSA

export type Role = "encargado" | "preventivo" | "correctivo";

export const ROLES: { id: Role; label: string; user: string; initials: string }[] = [
  { id: "encargado", label: "Encargado ITIC", user: "Lic. Reynaldo Escobar", initials: "RE" },
  { id: "preventivo", label: "Pasante Preventivo", user: "Yennifer Sarzuri", initials: "YS" },
  { id: "correctivo", label: "Pasante Correctivo", user: "Jhonny Arias", initials: "JA" },
];

export const LABORATORIOS = [
  { id: "LAB1", nombre: "Laboratorio 1", edificio: "Edificio Principal", piso: 1, capEquipos: 25, capPersonas: 30 },
  { id: "LAB2", nombre: "Laboratorio 2", edificio: "Edificio Principal", piso: 1, capEquipos: 20, capPersonas: 25 },
  { id: "LAB3", nombre: "Laboratorio 3", edificio: "Edificio Principal", piso: 2, capEquipos: 22, capPersonas: 28 },
  { id: "LAB4", nombre: "Laboratorio 4", edificio: "Edificio Principal", piso: 2, capEquipos: 20, capPersonas: 25 },
  { id: "LASIN1", nombre: "LASIN 1", edificio: "Edificio LASIN", piso: 1, capEquipos: 18, capPersonas: 22 },
  { id: "LASIN2", nombre: "LASIN 2", edificio: "Edificio LASIN", piso: 1, capEquipos: 15, capPersonas: 20 },
  { id: "LASIN3", nombre: "LASIN 3", edificio: "Edificio LASIN", piso: 2, capEquipos: 15, capPersonas: 20 },
];

export const EQUIPOS = [
  { codigo: "PC-LAB1-001", nombre: "HP ProDesk 600 G6", lab: "LAB1", fila: "A", puesto: "01", so: "Windows 11 Pro", marca: "HP", modelo: "ProDesk 600 G6", serie: "MXL2345A1B", estado: "Funcionando" },
  { codigo: "PC-LAB1-002", nombre: "Dell OptiPlex 7090", lab: "LAB1", fila: "A", puesto: "02", so: "Windows 11 Pro", marca: "Dell", modelo: "OptiPlex 7090", serie: "DLL789X45", estado: "Funcionando" },
  { codigo: "PC-LAB1-003", nombre: "Lenovo ThinkCentre M70", lab: "LAB1", fila: "A", puesto: "03", so: "Windows 10 Pro", marca: "Lenovo", modelo: "ThinkCentre M70q", serie: "LNV45612", estado: "En mantenimiento" },
  { codigo: "PC-LAB2-001", nombre: "HP EliteDesk 800", lab: "LAB2", fila: "B", puesto: "01", so: "Windows 11 Pro", marca: "HP", modelo: "EliteDesk 800 G8", serie: "MXL667712", estado: "Funcionando" },
  { codigo: "PC-LAB2-005", nombre: "Dell Vostro 3681", lab: "LAB2", fila: "B", puesto: "05", so: "Windows 10 Pro", marca: "Dell", modelo: "Vostro 3681", serie: "DLL112233", estado: "Pendiente" },
  { codigo: "PC-LAB3-002", nombre: "HP ProDesk 400", lab: "LAB3", fila: "C", puesto: "02", so: "Windows 11 Pro", marca: "HP", modelo: "ProDesk 400 G7", serie: "MXL998877", estado: "Funcionando" },
  { codigo: "PC-LAB4-007", nombre: "Lenovo ThinkCentre", lab: "LAB4", fila: "D", puesto: "07", so: "Windows 11 Pro", marca: "Lenovo", modelo: "ThinkCentre M90", serie: "LNV778899", estado: "De baja" },
  { codigo: "PC-LASIN1-004", nombre: "Dell OptiPlex 5080", lab: "LASIN1", fila: "E", puesto: "04", so: "Ubuntu 22.04", marca: "Dell", modelo: "OptiPlex 5080", serie: "DLL334455", estado: "En espera repuesto" },
];

export const USUARIOS = [
  { nombre: "Lic. Reynaldo Escobar", username: "rescobar", rol: "Encargado ITIC", email: "rescobar@umsa.bo", estado: "Activo", fecha: "15/01/2024" },
  { nombre: "Yennifer Sarzuri", username: "ysarzuri", rol: "Pasante Preventivo", email: "ysarzuri@est.umsa.bo", estado: "Activo", fecha: "03/02/2024" },
  { nombre: "Carla Mendoza Flores", username: "cmendoza", rol: "Pasante Preventivo", email: "cmendoza@est.umsa.bo", estado: "Activo", fecha: "14/02/2024" },
  { nombre: "Jhonny Arias", username: "jarias", rol: "Pasante Correctivo", email: "jarias@est.umsa.bo", estado: "Activo", fecha: "20/02/2024" },
  { nombre: "Mauricio Quispe Mamani", username: "mquispe", rol: "Pasante Correctivo", email: "mquispe@est.umsa.bo", estado: "Inactivo", fecha: "11/03/2024" },
  { nombre: "Ing. Patricia Rojas", username: "projas", rol: "Administrador", email: "projas@umsa.bo", estado: "Activo", fecha: "10/01/2024" },
];

export const MANTENIMIENTOS_RECIENTES = [
  { equipo: "PC-LAB1-001", lab: "Lab 1", tecnico: "Yennifer Sarzuri", tipo: "Preventivo", fecha: "18/04/2026", estado: "Completado" },
  { equipo: "PC-LAB2-005", lab: "Lab 2", tecnico: "Jhonny Arias", tipo: "Correctivo", fecha: "17/04/2026", estado: "En proceso" },
  { equipo: "PC-LAB3-002", lab: "Lab 3", tecnico: "Carla Mendoza", tipo: "Preventivo", fecha: "16/04/2026", estado: "Completado" },
  { equipo: "PC-LASIN1-004", lab: "LASIN 1", tecnico: "Jhonny Arias", tipo: "Correctivo", fecha: "15/04/2026", estado: "Pendiente" },
  { equipo: "PC-LAB4-007", lab: "Lab 4", tecnico: "Mauricio Quispe", tipo: "Correctivo", fecha: "14/04/2026", estado: "Completado" },
];

export const INCIDENCIAS_RECIENTES = [
  { equipo: "PC-LASIN1-004", problema: "No enciende, posible falla de fuente de poder", seguimiento: true, fecha: "18/04/2026", color: "danger" },
  { equipo: "PC-LAB2-005", problema: "Pantalla azul intermitente al abrir aplicaciones", seguimiento: true, fecha: "17/04/2026", color: "warning" },
  { equipo: "PC-LAB1-003", problema: "Ventilador del CPU haciendo ruido excesivo", seguimiento: false, fecha: "16/04/2026", color: "warning" },
  { equipo: "PC-LAB4-007", problema: "Equipo dado de baja por daño irreparable en placa madre", seguimiento: false, fecha: "14/04/2026", color: "danger" },
  { equipo: "PC-LAB3-002", problema: "Lentitud al cargar el sistema operativo", seguimiento: false, fecha: "12/04/2026", color: "info" },
];

export const MANTENIMIENTOS_LAB = [
  { lab: "Lab 1", total: 18 },
  { lab: "Lab 2", total: 12 },
  { lab: "Lab 3", total: 9 },
  { lab: "Lab 4", total: 15 },
  { lab: "LASIN 1", total: 7 },
  { lab: "LASIN 2", total: 5 },
  { lab: "LASIN 3", total: 4 },
];

export const ESTADO_EQUIPOS = [
  { name: "Funcionando", value: 68, color: "#16A34A" },
  { name: "En mantenimiento", value: 6, color: "#F59E0B" },
  { name: "Pendiente", value: 7, color: "#2563EB" },
  { name: "En espera repuesto", value: 3, color: "#DC2626" },
  { name: "De baja", value: 3, color: "#64748B" },
];

export const HARDWARE_CHECKLIST = [
  "Limpieza externa del case",
  "Limpieza interna (componentes)",
  "Ventiladores y disipadores",
  "Fuente de poder",
  "Revisión de cables y conexiones",
  "Monitor/Pantalla",
  "Teclado",
  "Mouse",
  "Memoria RAM",
  "Disco duro/SSD",
  "Tarjeta de red",
];

export const SOFTWARE_CHECKLIST = [
  "Arranque del sistema",
  "Actualizaciones del SO",
  "Antivirus actualizado",
  "Escaneo de malware",
  "Limpieza archivos temporales",
  "Software de oficina",
  "Navegadores web",
  "Drivers actualizados",
];

export const PRUEBAS_CHECKLIST = [
  "Encendido/apagado correcto",
  "Velocidad de respuesta",
  "Conexión a internet",
  "Sonido",
  "Puertos USB",
  "Lector CD/DVD",
];

export const INSUMOS = [
  { nombre: "Alcohol isopropílico", unidad: "ml" },
  { nombre: "Paños de microfibra", unidad: "unidades" },
  { nombre: "Hisopos/brochas", unidad: "unidades" },
  { nombre: "Pasta térmica", unidad: "aplicaciones" },
  { nombre: "Aire comprimido", unidad: "segundos" },
];

export const COMPONENTES_AFECTADOS = [
  "RAM", "Disco Duro", "Fuente de Poder", "Tarjeta Madre",
  "Tarjeta de Red", "Monitor", "Teclado", "Mouse", "Ventilador", "Otro",
];

export const MIS_MANTENIMIENTOS_PREV = [
  { codigo: "PC-LAB1-001", lab: "Lab 1", fecha: "18/04/2026", inicio: "08:30", fin: "09:45", estado: "Completado", incidencias: 0 },
  { codigo: "PC-LAB1-002", lab: "Lab 1", fecha: "18/04/2026", inicio: "10:00", fin: "11:15", estado: "Completado", incidencias: 1 },
  { codigo: "PC-LAB2-001", lab: "Lab 2", fecha: "17/04/2026", inicio: "14:00", fin: "15:30", estado: "Completado", incidencias: 0 },
  { codigo: "PC-LAB3-002", lab: "Lab 3", fecha: "16/04/2026", inicio: "09:00", fin: "10:20", estado: "En proceso", incidencias: 2 },
  { codigo: "PC-LASIN2-001", lab: "LASIN 2", fecha: "15/04/2026", inicio: "11:00", fin: "12:30", estado: "Completado", incidencias: 0 },
];

export const EQUIPOS_PROBLEMAS = [
  { codigo: "PC-LASIN1-004", nombre: "Dell OptiPlex 5080", lab: "LASIN 1", problema: "No enciende, posible falla de fuente de poder", estado: "En espera repuesto", dias: 3, color: "danger" },
  { codigo: "PC-LAB2-005", nombre: "Dell Vostro 3681", lab: "Lab 2", problema: "Pantalla azul intermitente", estado: "En mantenimiento", dias: 2, color: "warning" },
  { codigo: "PC-LAB1-003", nombre: "Lenovo ThinkCentre M70q", lab: "Lab 1", problema: "Ventilador con ruido excesivo, requiere cambio", estado: "En mantenimiento", dias: 1, color: "warning" },
  { codigo: "PC-LAB4-002", nombre: "HP ProDesk 400", lab: "Lab 4", problema: "Sin acceso a la red local", estado: "Pendiente", dias: 4, color: "danger" },
];

export const HISTORIAL_CORRECTIVOS = [
  { fecha: "12/04/2026", equipo: "PC-LAB2-001", problema: "Memoria RAM defectuosa", accion: "Cambio de módulo de 8GB DDR4", estado: "Resuelto", tecnico: "Jhonny Arias" },
  { fecha: "08/04/2026", equipo: "PC-LAB3-005", problema: "Disco duro con sectores defectuosos", accion: "Reemplazo por SSD de 240GB", estado: "Resuelto", tecnico: "Jhonny Arias" },
  { fecha: "02/04/2026", equipo: "PC-LASIN2-003", problema: "Sistema operativo corrupto", accion: "Reinstalación de Windows 11 + drivers", estado: "Resuelto", tecnico: "Mauricio Quispe" },
  { fecha: "28/03/2026", equipo: "PC-LAB1-008", problema: "Fuente de poder quemada", accion: "Cambio de fuente 500W", estado: "Resuelto", tecnico: "Jhonny Arias" },
  { fecha: "21/03/2026", equipo: "PC-LAB4-003", problema: "Tarjeta de red dañada", accion: "Instalación de tarjeta PCI Ethernet", estado: "Resuelto", tecnico: "Jhonny Arias" },
];
