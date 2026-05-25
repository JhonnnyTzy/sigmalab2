import { useMemo, useState, useReducer } from "react";
import { toast } from "sonner";
import { Eye, UserPlus, Wrench, Check, Search } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { store, useStore, type ReportePasante } from "@/lib/store";
import { useAuth, ROLE_LABEL, type AppRole } from "@/lib/auth";

type EstadoIncidencia = ReportePasante["estado"];

const ESTADOS: EstadoIncidencia[] = ["Nuevo", "Visto", "Pendiente", "En proceso", "Completado", "Resuelto"];
const PRIORIDADES = ["Alta", "Media", "Baja"] as const;
const ROLES_REPORTE: AppRole[] = ["preventivo", "correctivo", "docente", "estudiante", "encargado", "invitado"];

function rolLabel(r?: AppRole) {
  return r ? ROLE_LABEL[r] : "—";
}

export function BandejaIncidenciasView() {
  const { user, accounts } = useAuth();
  const reportes = useStore((s) => s.reportesPasante);

  const [filtros, dispatchFiltros] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { fEstado: "", fPrioridad: "", fRol: "", fLab: "", q: "" }
  );

  const [modal, dispatchModal] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { ver: null, asignar: null, resolver: null } as { ver: ReportePasante | null; asignar: ReportePasante | null; resolver: ReportePasante | null }
  );

  const labs = useMemo(
    () => Array.from(new Set(reportes.map((r) => r.laboratorio))).sort(),
    [reportes],
  );

  const filtered = useMemo(() => {
    return reportes.filter((r) => {
      if (filtros.fEstado && r.estado !== filtros.fEstado) return false;
      if (filtros.fPrioridad && r.prioridad !== filtros.fPrioridad) return false;
      if (filtros.fRol && r.rolReporte !== filtros.fRol) return false;
      if (filtros.fLab && r.laboratorio !== filtros.fLab) return false;
      if (filtros.q.trim()) {
        const t = filtros.q.trim().toLowerCase();
        const hay = `${r.titulo} ${r.descripcion} ${r.pasante} ${r.ubicacion}`.toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }, [reportes, filtros.fEstado, filtros.fPrioridad, filtros.fRol, filtros.fLab, filtros.q]);

  const clearFilters = () => {
    dispatchFiltros({ type: "SET_FIELD", field: "fEstado", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fPrioridad", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fRol", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fLab", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "q", value: "" });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Bandeja de incidencias</h1>
        <p className="text-sm text-muted-foreground">Incidencias reportadas por todos los roles</p>
      </div>

      <Panel title="Filtros">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <FormField label="Buscar">
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-2 size-4 text-muted-foreground" />
              <input value={filtros.q} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "q", value: e.target.value })} className={inputCls + " pl-8"} placeholder="Título, descripción..." aria-label="Buscar incidencia" />
            </div>
          </FormField>
          <FormField label="Estado">
            <select value={filtros.fEstado} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fEstado", value: e.target.value })} className={inputCls} aria-label="Estado">
              <option value="">Todos</option>
              {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Prioridad">
            <select value={filtros.fPrioridad} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fPrioridad", value: e.target.value })} className={inputCls} aria-label="Prioridad">
              <option value="">Todas</option>
              {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Rol reportante">
            <select value={filtros.fRol} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fRol", value: e.target.value })} className={inputCls} aria-label="Rol reportante">
              <option value="">Todos</option>
              {ROLES_REPORTE.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </FormField>
          <FormField label="Laboratorio">
            <select value={filtros.fLab} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fLab", value: e.target.value })} className={inputCls} aria-label="Laboratorio">
              <option value="">Todos</option>
              {labs.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </FormField>
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={clearFilters}>Limpiar filtros</Button>
        </div>
      </Panel>

      <Panel title={`${filtered.length} incidencia${filtered.length !== 1 ? "s" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Reportada por</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Laboratorio</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Prioridad</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-muted-foreground">{r.fecha}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.pasante}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-navy">{rolLabel(r.rolReporte)}</td>
                  <td className="px-4 py-3 font-medium text-navy">{r.titulo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.laboratorio}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.categoria}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.prioridad} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.estado} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => dispatchModal({ type: "SET_FIELD", field: "ver", value: r })} title="Ver detalle">
                        <Eye className="mr-1 size-3" /> Ver
                      </Button>
                      <Button size="sm" className="bg-teal hover:bg-teal/90" onClick={() => dispatchModal({ type: "SET_FIELD", field: "asignar", value: r })} title="Asignar a pasante">
                        <UserPlus className="mr-1 size-3" /> Asignar
                      </Button>
                      <Button size="sm" className="bg-warning hover:bg-warning/90" onClick={() => dispatchModal({ type: "SET_FIELD", field: "resolver", value: r })} title="Resolver">
                        <Wrench className="mr-1 size-3" /> Resolver
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">Sin incidencias que coincidan con los filtros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Ver detalle */}
      <Modal open={!!modal.ver} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "ver", value: null })} title={modal.ver?.titulo ?? "Detalle"}
        footer={<Button onClick={() => dispatchModal({ type: "SET_FIELD", field: "ver", value: null })}>Cerrar</Button>}>
        {modal.ver && (
          <div className="space-y-3 text-sm">
            <Row k="Reportada por" v={ver.pasante} />
            <Row k="Rol" v={rolLabel(ver.rolReporte)} />
            <Row k="Fecha" v={ver.fecha} />
            <Row k="Laboratorio" v={`${ver.laboratorio} · ${ver.ubicacion}`} />
            <Row k="Categoría" v={ver.categoria} />
            <Row k="Prioridad" v={<StatusBadge status={ver.prioridad} />} />
            <Row k="Estado" v={<StatusBadge status={ver.estado} />} />
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Descripción</p>
              <p className="mt-1 rounded-md bg-slate-50 p-3">{ver.descripcion}</p>
            </div>
            {ver.resolucionDetalle && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Detalle de resolución</p>
                <p className="mt-1 rounded-md bg-slate-50 p-3">{ver.resolucionDetalle}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <AsignarModal rep={modal.asignar} onClose={() => dispatchModal({ type: "SET_FIELD", field: "asignar", value: null })} accounts={accounts} />
      <ResolverModal rep={modal.resolver} onClose={() => dispatchModal({ type: "SET_FIELD", field: "resolver", value: null })} adminUser={`${user.nombres} ${user.paterno}`} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-xs font-semibold text-muted-foreground">{k}</span>
      <span className="text-sm font-bold text-navy">{v}</span>
    </div>
  );
}

const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

function AsignarModal({ rep, onClose, accounts }: { rep: ReportePasante | null; onClose: () => void; accounts: ReturnType<typeof useAuth>["accounts"] }) {
  const [rol, setRol] = useState<"preventivo" | "correctivo">("correctivo");
  const candidatos = accounts.filter((a) => a.role === rol);
  const [pasante, setPasante] = useState("");
  const opciones = candidatos.map((a) => ({ key: a.email?.split("@")[0] ?? a.id, label: `${a.nombres} ${a.paterno}` }));
  const sel = pasante || opciones[0]?.key || "";

  const submit = () => {
    if (!rep) return;
    if (!sel) { toast.error("Selecciona un pasante"); return; }
    const cand = opciones.find((o) => o.key === sel);
    store.addAsignacion({
      id: `AS-${Date.now()}`,
      equipo: rep.ubicacion && rep.ubicacion !== "—" ? rep.ubicacion : rep.laboratorio,
      lab: rep.laboratorio,
      asignadoA: sel,
      problema: `${rep.titulo} — ${rep.descripcion}`,
      prioridad: rep.prioridad,
      fecha: today(),
      estado: "Pendiente",
    });
    store.updateReportePasante(rep.id, { estado: "En proceso" });
    toast.success(`Asignada a ${cand?.label ?? sel}`);
    setPasante(""); setRol("correctivo"); onClose();
  };

  return (
    <Modal open={!!rep} onOpenChange={(v) => !v && onClose()} title={`Asignar — ${rep?.titulo ?? ""}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button><Button className="bg-navy" onClick={submit}>Asignar</Button></>}>
      {rep && (
        <div className="space-y-4">
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-navy">{rep.titulo}</p>
            <p className="mt-1 text-xs text-muted-foreground">{rep.laboratorio} · {rep.ubicacion}</p>
          </div>
          <FormField label="Rol a asignar" required>
            <select value={rol} onChange={(e) => { setRol(e.target.value as "preventivo" | "correctivo"); setPasante(""); }} className={inputCls} aria-label="Rol a asignar">
              <option value="preventivo">Pasante Preventivo</option>
              <option value="correctivo">Pasante Correctivo</option>
            </select>
          </FormField>
          <FormField label="Pasante" required>
            <select value={sel} onChange={(e) => setPasante(e.target.value)} className={inputCls} aria-label="Pasante">
              {opciones.length === 0 && <option value="">Sin pasantes disponibles</option>}
              {opciones.map((o) => <option key={o.key} value={o.key}>{o.label} (@{o.key})</option>)}
            </select>
          </FormField>
        </div>
      )}
    </Modal>
  );
}

function ResolverModal({ rep, onClose, adminUser }: { rep: ReportePasante | null; onClose: () => void; adminUser: string }) {
  const [estado, setEstado] = useState<EstadoIncidencia>("Resuelto");
  const [detalle, setDetalle] = useState("");
  const [accion, setAccion] = useState("");

  const submit = () => {
    if (!rep) return;
    if (!detalle.trim()) { toast.error("Agrega un detalle de la resolución"); return; }
    const composed = [
      `Resuelto por administrador (${adminUser}) el ${today()}`,
      accion.trim() && `Acción: ${accion.trim()}`,
      `Detalle: ${detalle.trim()}`,
    ].filter(Boolean).join("\n");
    store.updateReportePasante(rep.id, { estado, resolucionDetalle: composed });
    toast.success(`Incidencia marcada como ${estado}`);
    setDetalle(""); setAccion(""); setEstado("Resuelto"); onClose();
  };

  return (
    <Modal open={!!rep} onOpenChange={(v) => !v && onClose()} title={`Resolver — ${rep?.titulo ?? ""}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button><Button className="bg-success hover:bg-success/90" onClick={submit}><Check className="mr-1 size-4" /> Guardar resolución</Button></>}>
      {rep && (
        <div className="space-y-4">
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-navy">{rep.titulo} · {rep.laboratorio}</p>
            <p className="mt-1 text-xs text-muted-foreground">{rep.descripcion}</p>
          </div>
          <FormField label="Cambiar estado" required>
            <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoIncidencia)} className={inputCls} aria-label="Cambiar estado">
              <option value="En proceso">En proceso</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Resuelto">Resuelto</option>
              <option value="Completado">Completado</option>
            </select>
          </FormField>
          <FormField label="Acción realizada">
            <input value={accion} onChange={(e) => setAccion(e.target.value)} className={inputCls} placeholder="Ej: Reemplazo de cable de red" aria-label="Acción realizada" />
          </FormField>
          <FormField label="Detalle de la resolución" required>
            <textarea rows={4} value={detalle} onChange={(e) => setDetalle(e.target.value)} className={inputCls} placeholder="Describe lo que se hizo, observaciones, repuestos usados..." aria-label="Detalle de la resolución" />
          </FormField>
        </div>
      )}
    </Modal>
  );
}
