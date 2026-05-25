import {
  Home, Building2, Monitor, Usb, Wrench, Package, Users, BarChart3, Activity,
  PlusCircle, ClipboardList, AlertTriangle, PenTool, AlertCircle, Clock,
  ChevronDown, FileText, Inbox, Eye, Boxes,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
  children?: { id: string; label: string }[];
}

const MENUS: Record<string, NavItem[]> = {
  encargado: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "laboratorios", label: "Laboratorios", icon: Building2 },
    { id: "equipos", label: "Equipos", icon: Monitor },
    { id: "perifericos", label: "Periféricos", icon: Usb },
    {
      id: "mantenimientos", label: "Mantenimientos", icon: Wrench,
      children: [
        { id: "mant-preventivos", label: "Preventivos" },
        { id: "mant-correctivos", label: "Correctivos" },
      ],
    },
    { id: "incidencias-bandeja", label: "Bandeja incidencias", icon: AlertTriangle },
    { id: "insumos", label: "Insumos", icon: Package },
    { id: "inventario", label: "Inventario", icon: Boxes },
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "reportes", label: "Reportes", icon: BarChart3 },
    { id: "logs", label: "Logs del sistema", icon: Activity },
  ],
  preventivo: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "nuevo-mant", label: "Nuevo Mantenimiento", icon: PlusCircle, highlight: true },
    { id: "mis-mant", label: "Mis Mantenimientos", icon: ClipboardList },
    { id: "incidencias-bandeja", label: "Incidencias", icon: AlertTriangle },
    { id: "equipos", label: "Equipos", icon: Monitor },
    { id: "insumos-disp", label: "Insumos disponibles", icon: Package },
    { id: "reportes-prev", label: "Reportes", icon: FileText, highlight: true },
  ],
  correctivo: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "nuevo-correctivo", label: "Nuevo Mantenimiento", icon: AlertTriangle, highlight: true },
    { id: "asignados", label: "Equipos asignados", icon: Inbox },
    { id: "incidencias-bandeja", label: "Incidencias", icon: AlertCircle },
    { id: "mis-correctivos", label: "Mis Mantenimientos", icon: PenTool },
    { id: "equipos", label: "Equipos", icon: Monitor },
  ],
  docente: [
    { id: "crear-incidencia", label: "Crear Incidencia", icon: PlusCircle, highlight: true },
    { id: "mis-incidencias", label: "Mis Incidencias", icon: ClipboardList },
  ],
  estudiante: [
    { id: "crear-incidencia", label: "Crear Incidencia", icon: PlusCircle, highlight: true },
    { id: "mis-incidencias", label: "Mis Incidencias", icon: ClipboardList },
  ],
  invitado: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "laboratorios", label: "Laboratorios", icon: Building2 },
    { id: "equipos", label: "Equipos", icon: Monitor },
    { id: "perifericos", label: "Periféricos", icon: Usb },
    { id: "insumos", label: "Inventario", icon: Package },
    { id: "historial", label: "Historiales", icon: Clock },
    { id: "reportes", label: "Reportes", icon: BarChart3 },
    { id: "lectura", label: "Modo lectura", icon: Eye },
  ],
};

const labelMapByRole = new Map<string, Map<string, string>>();
for (const [role, items] of Object.entries(MENUS)) {
  const map = new Map<string, string>();
  for (const it of items) {
    map.set(it.id, it.label);
    if (it.children) {
      for (const c of it.children) {
        map.set(c.id, c.label);
      }
    }
  }
  labelMapByRole.set(role, map);
}

export function getViewLabel(role: string, viewId: string): string {
  return labelMapByRole.get(role)?.get(viewId) ?? "Dashboard";
}

export { MENUS };
