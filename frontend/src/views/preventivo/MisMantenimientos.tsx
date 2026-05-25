import { useReducer, useMemo, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { MantDetalleModal } from "@/components/sigmalab/MantDetalleModal";
import { Modal } from "@/components/sigmalab/Modal";
import { NuevoMantPreventivoView } from "./NuevoMantPreventivo";
import { useStore, type MantPrev, type MantDetalle } from "@/lib/store";

export function MisMantenimientosView() {
  const misPrev = useStore((s) => s.misPrev);
  const detalles = useStore((s) => s.detalles);
  const labs = useStore((s) => s.labs);
  const [filtros, dispatchFiltros] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { fi: "", ff: "", labF: "", estadoF: "" }
  );
  const [detalleSel, setDetalleSel] = useState<MantDetalle | null>(null);
  const [editing, setEditing] = useState<{ orig: MantPrev; detalle: MantDetalle | null } | null>(null);

  const parseFecha = (s: string) => { const [d, m, y] = s.split("/"); return new Date(`${y}-${m}-${d}`); };

  const filtered = useMemo(() => misPrev.filter((m) => {
    const date = parseFecha(m.fecha);
    if (filtros.fi && date < new Date(filtros.fi)) return false;
    if (filtros.ff && date > new Date(filtros.ff)) return false;
    if (filtros.labF && !m.lab.toLowerCase().includes(filtros.labF.toLowerCase())) return false;
    if (filtros.estadoF && m.estado !== filtros.estadoF) return false;
    return true;
  }), [misPrev, filtros.fi, filtros.ff, filtros.labF, filtros.estadoF]);

  const verDetalle = (m: MantPrev) => {
    const d = detalles.find((x) => x.equipo === m.codigo && x.fecha === m.fecha) ?? detalles.find((x) => x.equipo === m.codigo) ?? null;
    if (d) setDetalleSel(d);
    else toast.info(`No hay detalle adicional para ${m.codigo} (mantenimiento de ejemplo)`);
  };

  const startEdit = (m: MantPrev) => {
    const d = detalles.find((x) => x.equipo === m.codigo && x.fecha === m.fecha) ?? detalles.find((x) => x.equipo === m.codigo) ?? null;
    setEditing({ orig: m, detalle: d });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Mis Mantenimientos</h1>
        <p className="text-sm text-muted-foreground">Historial de mantenimientos preventivos · ver detalle y editar pendientes</p>
      </div>

      <Panel title="Filtros">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input type="date" value={filtros.fi} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fi", value: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Fecha inicio" />
          <input type="date" value={filtros.ff} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "ff", value: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Fecha fin" />
          <select value={filtros.labF} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "labF", value: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por laboratorio">
            <option value="">Todos los laboratorios</option>
            {labs.map((l) => <option key={l.id} value={l.nombre}>{l.nombre}</option>)}
          </select>
          <select value={filtros.estadoF} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "estadoF", value: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por estado">
            <option value="">Todos los estados</option><option>Completado</option><option>En proceso</option><option>Pendiente</option>
          </select>
        </div>
      </Panel>

      <Panel title={`${filtered.length} mantenimientos`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Código equipo</th>
                <th className="px-4 py-3 font-semibold">Laboratorio</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Hora inicio</th>
                <th className="px-4 py-3 font-semibold">Hora fin</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Incidencias</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m, i) => (
                <tr key={m.codigo + m.fecha} className={i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/40 hover:bg-slate-50"}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-teal">{m.codigo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.lab}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.fecha}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.inicio}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.fin}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.estado} /></td>
                  <td className="px-4 py-3"><span className="font-semibold text-navy">{m.incidencias}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => verDetalle(m)} title="Ver detalle completo del mantenimiento" className="inline-flex items-center gap-1 rounded-md border border-teal px-2 py-1 text-xs font-semibold text-teal hover:bg-teal-soft"><Eye className="size-3.5" />Ver</button>
                      <button type="button" onClick={() => startEdit(m)} title="Editar" className="inline-flex items-center gap-1 rounded-md border border-navy/40 px-2 py-1 text-xs font-semibold text-navy hover:bg-slate-100"><Pencil className="size-3.5" />Editar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">Sin resultados</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <MantDetalleModal detalle={detalleSel} open={!!detalleSel} onOpenChange={(v) => !v && setDetalleSel(null)} />

      <Modal open={!!editing} onOpenChange={(v) => !v && setEditing(null)}
        title={`Editar mantenimiento — ${editing?.orig.codigo ?? ""}`} size="lg">
        {editing && (
          <NuevoMantPreventivoView initial={editing} onSaved={() => setEditing(null)} />
        )}
      </Modal>
    </div>
  );
}
