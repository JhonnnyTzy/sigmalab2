import { useReducer, useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import {
  FileText, Trophy, Building2, Boxes, FileText as FileIcon, Sheet, Activity, Filter,
  Users, Wrench, ClipboardList, Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { exportPDF, exportExcel } from "@/lib/exporters";

// ---------- helpers ----------
const parseDMY = (s: string): Date | null => {
  // "18/04/2026" → Date
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
};
const inRange = (fecha: string, fi: string, ff: string) => {
  const d = parseDMY(fecha);
  if (!d) return true;
  if (fi) { const a = new Date(fi); if (d < a) return false; }
  if (ff) { const b = new Date(ff); b.setHours(23, 59, 59); if (d > b) return false; }
  return true;
};

// ---------- card definitions ----------
type ReporteKey =
  | "pasantes" | "lab-estado" | "mant-prev" | "mant-corr"
  | "equipos-incid" | "insumos-uso" | "inventario";

interface ReporteDef {
  key: ReporteKey;
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

const REPORTES: ReporteDef[] = [
  { key: "pasantes",      icon: Users,         title: "Reporte de pasantes",            desc: "Pasantes preventivos y correctivos (activos / inactivos).",       color: "bg-teal-soft text-teal" },
  { key: "lab-estado",    icon: Building2,     title: "Estado de laboratorios",         desc: "Resumen del estado operativo de los equipos por laboratorio.",   color: "bg-navy/10 text-navy" },
  { key: "mant-prev",     icon: Wrench,        title: "Mantenimientos preventivos",     desc: "Listado de mantenimientos preventivos por período y laboratorio.", color: "bg-success-soft text-success" },
  { key: "mant-corr",     icon: ClipboardList, title: "Mantenimientos correctivos",     desc: "Listado de mantenimientos correctivos por período y laboratorio.", color: "bg-warning-soft text-warning" },
  { key: "equipos-incid", icon: Trophy,        title: "Equipos con más incidencias",    desc: "Ranking de equipos con mayor número de problemas reportados.",   color: "bg-danger-soft text-danger" },
  { key: "insumos-uso",   icon: Boxes,         title: "Insumos utilizados",             desc: "Insumos consumidos por mantenimientos en un período.",           color: "bg-teal-soft text-teal" },
  { key: "inventario",    icon: Package,       title: "Inventario de componentes",      desc: "Inventario filtrado por categoría, estado y ubicación.",         color: "bg-navy/10 text-navy" },
];

export function ReportesView() {
  const labs = useStore((s) => s.labs);
  const equipos = useStore((s) => s.equipos);
  const usuarios = useStore((s) => s.usuarios);
  const mantenimientos = useStore((s) => s.mantenimientos);
  const incidencias = useStore((s) => s.incidencias);
  const reportesPasante = useStore((s) => s.reportesPasante);
  const detalles = useStore((s) => s.detalles);
  const inventario = useStore((s) => s.inventario);
  const logs = useStore((s) => s.logs);

  const [active, setActive] = useState<ReporteKey | null>(null);

  // ---- movimientos ----
  const [mov, dispatchMov] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { showMov: false, movQ: "", movUser: "", movAccion: "" }
  );
  const usuariosUnicos = useMemo(() => [...new Set(logs.map((l) => l.usuario))], [logs]);
  const accionesUnicas = useMemo(() => [...new Set(logs.map((l) => l.accion))], [logs]);
  const filteredLogs = useMemo(() => logs.filter((l) =>
    (!mov.movQ || l.detalle.toLowerCase().includes(mov.movQ.toLowerCase()) || l.accion.toLowerCase().includes(mov.movQ.toLowerCase()))
    && (!mov.movUser || l.usuario === mov.movUser)
    && (!mov.movAccion || l.accion === mov.movAccion),
  ), [logs, mov.movQ, mov.movUser, mov.movAccion]);
  const exportMov = () => exportExcel(
    "Movimientos del sistema",
    ["Fecha y hora", "Usuario", "Acción", "Detalle"],
    filteredLogs.map((l) => [l.ts, l.usuario, l.accion, l.detalle]),
    `movimientos-${Date.now()}.xlsx`,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">Reportes</h1>
          <p className="text-sm text-muted-foreground">
            Generación y exportación de reportes del sistema · UMSA - ITIC
          </p>
        </div>
        <button type="button" onClick={() => dispatchMov({ type: "SET_FIELD", field: "showMov", value: true })} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90">
          <Activity className="size-4" /> Movimientos del sistema
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {REPORTES.map((r) => {
          const Icon = r.icon;
          return (
            <button type="button"
              key={r.key}
              onClick={() => setActive(r.key)}
              className="group rounded-xl border border-slate-100 bg-card p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal hover:shadow-md"
            >
              <div className={`flex size-12 items-center justify-center rounded-xl ${r.color}`}>
                <Icon className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-navy">{r.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal opacity-0 transition group-hover:opacity-100">
                <FileText className="size-3.5" /> Abrir vista previa
              </p>
            </button>
          );
        })}
      </div>

      {/* Preview modals */}
      {active === "pasantes" && (
        <PasantesReport usuarios={usuarios} onClose={() => setActive(null)} />
      )}
      {active === "lab-estado" && (
        <LabEstadoReport labs={labs} equipos={equipos} onClose={() => setActive(null)} />
      )}
      {active === "mant-prev" && (
        <MantReport tipo="Preventivo" data={mantenimientos} labs={labs} onClose={() => setActive(null)} />
      )}
      {active === "mant-corr" && (
        <MantReport tipo="Correctivo" data={mantenimientos} labs={labs} onClose={() => setActive(null)} />
      )}
      {active === "equipos-incid" && (
        <EquiposIncidReport
          equipos={equipos} incidencias={incidencias} reportesPasante={reportesPasante} labs={labs}
          onClose={() => setActive(null)}
        />
      )}
      {active === "insumos-uso" && (
        <InsumosUsoReport detalles={detalles} labs={labs} onClose={() => setActive(null)} />
      )}
      {active === "inventario" && (
        <InventarioReport inventario={inventario} labs={labs} onClose={() => setActive(null)} />
      )}

      {/* Movimientos */}
      <Modal open={mov.showMov} onOpenChange={(v) => dispatchMov({ type: "SET_FIELD", field: "showMov", value: v })} size="lg"
        title="Movimientos del sistema"
        description="Trazabilidad completa de todas las acciones de los usuarios"
        footer={<>
          <Button variant="outline" onClick={() => dispatchMov({ type: "SET_FIELD", field: "showMov", value: false })}>Cerrar</Button>
          <Button onClick={exportMov} className="bg-navy"><Sheet className="mr-1 size-4" />Exportar Excel</Button>
        </>}>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="relative md:col-span-1">
            <Filter className="pointer-events-none absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
            <input value={mov.movQ} onChange={(e) => dispatchMov({ type: "SET_FIELD", field: "movQ", value: e.target.value })} placeholder="Buscar..." aria-label="Buscar movimientos" className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-2 pl-8 text-sm" />
          </div>
          <select value={mov.movUser} onChange={(e) => dispatchMov({ type: "SET_FIELD", field: "movUser", value: e.target.value })} aria-label="Filtrar por usuario" className={inputCls}>
            <option value="">Todos los usuarios</option>
            {usuariosUnicos.map((u) => <option key={u}>{u}</option>)}
          </select>
          <select value={mov.movAccion} onChange={(e) => dispatchMov({ type: "SET_FIELD", field: "movAccion", value: e.target.value })} className={inputCls} aria-label="Filtrar por acción">
            <option value="">Todas las acciones</option>
            {accionesUnicas.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-100">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-50 text-left uppercase text-muted-foreground">
              <tr><th className="px-3 py-2 font-semibold">Fecha</th><th className="px-3 py-2 font-semibold">Usuario</th><th className="px-3 py-2 font-semibold">Acción</th><th className="px-3 py-2 font-semibold">Detalle</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((l, i) => (
                <tr key={l.ts + l.usuario} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{l.ts}</td>
                  <td className="px-3 py-2 text-teal font-mono">@{l.usuario}</td>
                  <td className="px-3 py-2 font-semibold text-navy">{l.accion}</td>
                  <td className="px-3 py-2 text-muted-foreground">{l.detalle}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">Sin movimientos</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">{filteredLogs.length} movimientos · de {logs.length} totales</p>
      </Modal>

      <Panel title="Acerca de los reportes">
        <p className="text-sm text-muted-foreground">
          Toca cualquier tarjeta para abrir la vista previa del reporte, aplicar filtros y descargarlo
          en formato <strong className="text-danger">PDF</strong> o <strong className="text-success">Excel</strong>.
          Cada documento incluye el encabezado institucional UMSA-ITIC, título del reporte, fecha y hora de generación,
          y los filtros aplicados.
        </p>
      </Panel>
    </div>
  );
}

// ============================================================
// Generic preview shell
// ============================================================
function PreviewShell({
  title, description, filters, headers, rows, filterMeta, filename, onClose,
}: {
  title: string;
  description?: string;
  filters: ReactNode;
  headers: string[];
  rows: (string | number)[][];
  filterMeta: string[];
  filename: string;
  onClose: () => void;
}) {
  const now = useRef(Date.now());
  return (
    <Modal
      open
      onOpenChange={(o) => { if (!o) onClose(); }}
      size="lg"
      title={title}
      description={description}
      footer={<>
        <Button variant="outline" onClick={onClose}>Cerrar</Button>
        <Button
          onClick={() => exportPDF(title, headers, rows, `${filename}-${now.current}.pdf`, filterMeta)}
          className="bg-danger hover:bg-danger/90"
        >
          <FileIcon className="mr-1 size-4" /> Descargar PDF
        </Button>
        <Button
          onClick={() => exportExcel(title, headers, rows, `${filename}-${now}.xlsx`)}
          className="bg-success hover:bg-success/90"
        >
          <Sheet className="mr-1 size-4" /> Descargar Excel
        </Button>
      </>}
    >
      <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          <Filter className="mr-1 inline size-3" /> Filtros
        </p>
        {filters}
      </div>

      <div>
        <p className="mb-1 text-xs text-muted-foreground">
          Vista previa · <strong className="text-navy">{rows.length}</strong> registros
        </p>
        <div className="max-h-80 overflow-auto rounded-lg border border-slate-100">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-navy text-left text-white">
              <tr>{headers.map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, i) => (
                <tr key={r[0]?.toString() + '-' + i} className="hover:bg-slate-50">
                  {r.map((c, j) => <td key={headers[j]} className="px-3 py-2 text-muted-foreground">{String(c)}</td>)}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={headers.length} className="px-3 py-6 text-center text-muted-foreground">Sin datos con los filtros actuales</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

const FilterField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</label>
    {children}
  </div>
);

// ============================================================
// Pasantes
// ============================================================
function PasantesReport({ usuarios, onClose }: { usuarios: ReturnType<typeof useStore<any>>; onClose: () => void }) {
  const [tipo, setTipo] = useState<"Todos" | "Preventivo" | "Correctivo">("Todos");
  const [estado, setEstado] = useState<"Todos" | "Activo" | "Inactivo">("Todos");

  const rows = useMemo(() => {
    return (usuarios as Array<{ nombre: string; username: string; rol: string; email: string; estado: string; fecha: string }>)
      .reduce((acc, u) => {
        if (u.rol.startsWith("Pasante") && (tipo === "Todos" || u.rol.includes(tipo)) && (estado === "Todos" || u.estado === estado)) {
          acc.push([u.nombre, u.username, u.rol, u.email, u.estado, u.fecha]);
        }
        return acc;
      }, [] as (string | number)[][]);
  }, [usuarios, tipo, estado]);

  return (
    <PreviewShell
      title="Reporte de pasantes"
      description="Pasantes preventivos y correctivos del sistema"
      filename="reporte-pasantes"
      filterMeta={[`Tipo: ${tipo}`, `Estado: ${estado}`]}
      filters={
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <FilterField label="Tipo de pasante">
            <select value={tipo} onChange={(e) => setTipo(e.target.value as any)} className={inputCls} aria-label="Tipo de pasante">
              <option>Todos</option><option>Preventivo</option><option>Correctivo</option>
            </select>
          </FilterField>
          <FilterField label="Estado">
            <select value={estado} onChange={(e) => setEstado(e.target.value as any)} className={inputCls} aria-label="Estado pasante">
              <option>Todos</option><option>Activo</option><option>Inactivo</option>
            </select>
          </FilterField>
        </div>
      }
      headers={["Nombre", "Usuario", "Rol", "Email", "Estado", "Fecha alta"]}
      rows={rows}
      onClose={onClose}
    />
  );
}

// ============================================================
// Estado de laboratorios
// ============================================================
function LabEstadoReport({ labs, equipos, onClose }: {
  labs: Array<{ id: string; nombre: string }>;
  equipos: Array<{ codigo: string; lab: string; estado: string }>;
  onClose: () => void;
}) {
  const [lab, setLab] = useState("");
  const rows = useMemo(() => {
    return labs.reduce((acc, l) => {
      if (lab && l.id !== lab) return acc;
      const list = equipos.filter((e) => e.lab === l.id);
      acc.push([
        l.nombre,
        list.length,
        list.filter((e) => e.estado === "Funcionando").length,
        list.filter((e) => e.estado === "En mantenimiento").length,
        list.filter((e) => e.estado === "Pendiente").length,
        list.filter((e) => e.estado === "De baja").length,
      ]);
      return acc;
    }, [] as (string | number)[][]);
  }, [labs, equipos, lab]);

  return (
    <PreviewShell
      title="Estado actual de laboratorios"
      description="Resumen del estado operativo de los equipos por laboratorio"
      filename="reporte-laboratorios"
      filterMeta={[`Laboratorio: ${lab ? (labs.find((l) => l.id === lab)?.nombre ?? lab) : "Todos"}`]}
      filters={
        <FilterField label="Laboratorio">
          <select value={lab} onChange={(e) => setLab(e.target.value)} className={inputCls} aria-label="Laboratorio">
            <option value="">Todos</option>
            {labs.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
        </FilterField>
      }
      headers={["Laboratorio", "Total", "Funcionando", "En mant.", "Pendiente", "De baja"]}
      rows={rows}
      onClose={onClose}
    />
  );
}

// ============================================================
// Mantenimientos (preventivos / correctivos)
// ============================================================
function MantReport({ tipo, data, labs, onClose }: {
  tipo: "Preventivo" | "Correctivo";
  data: Array<{ equipo: string; lab: string; tecnico: string; tipo: string; fecha: string; estado: string }>;
  labs: Array<{ id: string; nombre: string }>;
  onClose: () => void;
}) {
  const [fi, setFi] = useState("");
  const [ff, setFf] = useState("");
  const [lab, setLab] = useState("");
  const [estado, setEstado] = useState("");

  const rows = useMemo(() => {
    return data.reduce((acc, m) => {
      if (m.tipo !== tipo) return acc;
      if (lab && m.lab !== lab && m.lab.replace(/\s+/g, "").toUpperCase() !== lab.toUpperCase()) return acc;
      if (estado && m.estado !== estado) return acc;
      if (!inRange(m.fecha, fi, ff)) return acc;
      acc.push([m.equipo, m.lab, m.tecnico, m.fecha, m.estado]);
      return acc;
    }, [] as (string | number)[][]);
  }, [data, tipo, fi, ff, lab, estado]);

  return (
    <PreviewShell
      title={`Reporte de mantenimientos ${tipo.toLowerCase()}s`}
      description={`Mantenimientos de tipo ${tipo} registrados en el sistema`}
      filename={`reporte-mant-${tipo.toLowerCase()}`}
      filterMeta={[
        `Período: ${fi || "—"} a ${ff || "—"}`,
        `Laboratorio: ${lab || "Todos"}`,
        `Estado: ${estado || "Todos"}`,
      ]}
      filters={
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <FilterField label="Desde"><input type="date" value={fi} onChange={(e) => setFi(e.target.value)} className={inputCls} aria-label="Desde" /></FilterField>
          <FilterField label="Hasta"><input type="date" value={ff} onChange={(e) => setFf(e.target.value)} className={inputCls} aria-label="Hasta" /></FilterField>
          <FilterField label="Laboratorio">
            <select value={lab} onChange={(e) => setLab(e.target.value)} className={inputCls} aria-label="Laboratorio">
              <option value="">Todos</option>
              {labs.map((l) => <option key={l.id} value={l.nombre}>{l.nombre}</option>)}
            </select>
          </FilterField>
          <FilterField label="Estado">
            <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls} aria-label="Estado mantenimiento">
              <option value="">Todos</option>
              <option>Completado</option><option>En proceso</option><option>Pendiente</option>
            </select>
          </FilterField>
        </div>
      }
      headers={["Equipo", "Laboratorio", "Técnico", "Fecha", "Estado"]}
      rows={rows}
      onClose={onClose}
    />
  );
}

// ============================================================
// Equipos con más incidencias
// ============================================================
function EquiposIncidReport({ equipos, incidencias, reportesPasante, labs, onClose }: {
  equipos: Array<{ codigo: string; lab: string }>;
  incidencias: Array<{ equipo: string; fecha: string }>;
  reportesPasante: Array<{ laboratorio: string; fecha: string; titulo: string }>;
  labs: Array<{ id: string; nombre: string }>;
  onClose: () => void;
}) {
  const [fi, setFi] = useState("");
  const [ff, setFf] = useState("");
  const [lab, setLab] = useState("");

  const rows = useMemo(() => {
    const counts = new Map<string, number>();
    incidencias.forEach((i) => {
      if (!inRange(i.fecha, fi, ff)) return;
      const eq = equipos.find((e) => e.codigo === i.equipo);
      if (lab && eq && eq.lab !== lab) return;
      counts.set(i.equipo, (counts.get(i.equipo) ?? 0) + 1);
    });
    return [...counts.entries()]
      .toSorted((a, b) => b[1] - a[1])
      .reduce((acc, [eq, c], i) => {
        const e = equipos.find((x) => x.codigo === eq);
        acc.push([i + 1, eq, e?.lab ?? "—", c]);
        return acc;
      }, [] as (string | number)[][]);
  }, [equipos, incidencias, fi, ff, lab]);

  return (
    <PreviewShell
      title="Equipos con más incidencias"
      description="Ranking de equipos con más incidencias reportadas"
      filename="reporte-equipos-incidencias"
      filterMeta={[
        `Período: ${fi || "—"} a ${ff || "—"}`,
        `Laboratorio: ${lab ? (labs.find((l) => l.id === lab)?.nombre ?? lab) : "Todos"}`,
      ]}
      filters={
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          <FilterField label="Desde"><input type="date" value={fi} onChange={(e) => setFi(e.target.value)} className={inputCls} aria-label="Desde" /></FilterField>
          <FilterField label="Hasta"><input type="date" value={ff} onChange={(e) => setFf(e.target.value)} className={inputCls} aria-label="Hasta" /></FilterField>
          <FilterField label="Laboratorio">
            <select value={lab} onChange={(e) => setLab(e.target.value)} className={inputCls} aria-label="Laboratorio">
              <option value="">Todos</option>
              {labs.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </select>
          </FilterField>
        </div>
      }
      headers={["Ranking", "Equipo", "Laboratorio", "Incidencias"]}
      rows={rows}
      onClose={onClose}
    />
  );
}

// ============================================================
// Insumos utilizados (a partir de detalles[].insumos)
// ============================================================
function InsumosUsoReport({ detalles, labs, onClose }: {
  detalles: Array<{ tipo: string; lab: string; fecha: string; equipo: string; insumos?: Array<{ insumo: string; cantidad: string; unidad: string }> }>;
  labs: Array<{ id: string; nombre: string }>;
  onClose: () => void;
}) {
  const [fi, setFi] = useState("");
  const [ff, setFf] = useState("");
  const [lab, setLab] = useState("");
  const [tipo, setTipo] = useState("");

  const rows = useMemo(() => {
    const out: (string | number)[][] = [];
    detalles.forEach((d) => {
      if (tipo && d.tipo !== tipo) return;
      if (lab && d.lab !== lab) return;
      if (!inRange(d.fecha, fi, ff)) return;
      (d.insumos ?? []).forEach((ins) => {
        out.push([d.fecha, d.tipo, d.equipo, d.lab, ins.insumo, ins.cantidad, ins.unidad]);
      });
    });
    return out;
  }, [detalles, fi, ff, lab, tipo]);

  return (
    <PreviewShell
      title="Insumos utilizados en mantenimientos"
      description="Consumo de insumos por mantenimiento registrado"
      filename="reporte-insumos-uso"
      filterMeta={[
        `Período: ${fi || "—"} a ${ff || "—"}`,
        `Laboratorio: ${lab || "Todos"}`,
        `Tipo de mantenimiento: ${tipo || "Todos"}`,
      ]}
      filters={
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <FilterField label="Desde"><input type="date" value={fi} onChange={(e) => setFi(e.target.value)} className={inputCls} aria-label="Desde" /></FilterField>
          <FilterField label="Hasta"><input type="date" value={ff} onChange={(e) => setFf(e.target.value)} className={inputCls} aria-label="Hasta" /></FilterField>
          <FilterField label="Laboratorio">
            <select value={lab} onChange={(e) => setLab(e.target.value)} className={inputCls} aria-label="Laboratorio">
              <option value="">Todos</option>
              {labs.map((l) => <option key={l.id} value={l.nombre}>{l.nombre}</option>)}
            </select>
          </FilterField>
          <FilterField label="Tipo">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls} aria-label="Tipo mantenimiento">
              <option value="">Todos</option><option>Preventivo</option><option>Correctivo</option>
            </select>
          </FilterField>
        </div>
      }
      headers={["Fecha", "Tipo mant.", "Equipo", "Laboratorio", "Insumo", "Cantidad", "Unidad"]}
      rows={rows}
      onClose={onClose}
    />
  );
}

// ============================================================
// Inventario
// ============================================================
function InventarioReport({ inventario, labs, onClose }: {
  inventario: Array<{ id: string; categoria: string; codItic: string; codUmsa?: string; numeroSerie: string; marca: string; modelo: string; estado: string; fechaIngreso: string; laboratorio?: string; asignadoEquipo?: string }>;
  labs: Array<{ id: string; nombre: string }>;
  onClose: () => void;
}) {
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");
  const [ubic, setUbic] = useState("");

  const categorias = useMemo(() => [...new Set(inventario.map((i) => i.categoria))], [inventario]);
  const labName = useCallback((id?: string) => id ? (labs.find((l) => l.id === id)?.nombre ?? id) : "Oficina ITIC", [labs]);

  const rows = useMemo(() => {
    return inventario.reduce((acc, i) => {
      if (categoria && i.categoria !== categoria) return acc;
      if (estado && i.estado !== estado) return acc;
      if (ubic) {
        if (ubic === "OFICINA" && i.laboratorio) return acc;
        if (ubic !== "OFICINA" && i.laboratorio !== ubic) return acc;
      }
      acc.push([
        i.codItic,
        i.codUmsa ?? "—",
        i.categoria,
        i.marca,
        i.modelo,
        i.numeroSerie,
        i.estado,
        i.fechaIngreso,
        labName(i.laboratorio),
        i.asignadoEquipo ?? "—",
      ]);
      return acc;
    }, [] as (string | number)[][]);
  }, [inventario, categoria, estado, ubic, labName]);

  return (
    <PreviewShell
      title="Reporte de inventario"
      description="Componentes registrados en el inventario ITIC"
      filename="reporte-inventario"
      filterMeta={[
        `Categoría: ${categoria || "Todas"}`,
        `Estado: ${estado || "Todos"}`,
        `Ubicación: ${ubic ? (ubic === "OFICINA" ? "Oficina ITIC" : labName(ubic)) : "Todas"}`,
      ]}
      filters={
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <FilterField label="Categoría">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputCls} aria-label="Categoría">
              <option value="">Todas</option>
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FilterField>
          <FilterField label="Estado">
            <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls} aria-label="Estado inventario">
              <option value="">Todos</option>
              <option>Operativo</option><option>En mantenimiento</option>
              <option>De baja</option><option>En almacén</option>
            </select>
          </FilterField>
          <FilterField label="Ubicación">
            <select value={ubic} onChange={(e) => setUbic(e.target.value)} className={inputCls} aria-label="Ubicación">
              <option value="">Todas</option>
              <option value="OFICINA">Oficina ITIC</option>
              {labs.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </select>
          </FilterField>
        </div>
      }
      headers={["Cód ITIC", "Cód UMSA", "Categoría", "Marca", "Modelo", "Serie", "Estado", "Ingreso", "Ubicación", "Asignado a"]}
      rows={rows}
      onClose={onClose}
    />
  );
}