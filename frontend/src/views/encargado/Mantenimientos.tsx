import { useReducer, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { MantDetalleModal } from "@/components/sigmalab/MantDetalleModal";
import { useStore, type MantDetalle } from "@/lib/store";
import { toast } from "sonner";

export function MantenimientosView({ tipo }: { tipo: "Preventivo" | "Correctivo" }) {
  const mantenimientos = useStore((s) => s.mantenimientos);
  const detalles = useStore((s) => s.detalles);
  const labs = useStore((s) => s.labs);
  const [filtros, dispatchFiltros] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { q: "", labF: "", estadoF: "", fi: "", ff: "" }
  );
  const [detalle, setDetalle] = useState<MantDetalle | null>(null);

  const parse = (s: string) => { const [d, m, y] = s.split("/"); return new Date(`${y}-${m}-${d}`); };

  const filtered = useMemo(() => mantenimientos.filter((m) => {
    if (m.tipo !== tipo) return false;
    if (filtros.q && !m.equipo.toLowerCase().includes(filtros.q.toLowerCase()) && !m.tecnico.toLowerCase().includes(filtros.q.toLowerCase())) return false;
    if (filtros.labF && !m.lab.toLowerCase().includes(filtros.labF.toLowerCase())) return false;
    if (filtros.estadoF && m.estado !== filtros.estadoF) return false;
    const d = parse(m.fecha);
    if (filtros.fi && d < new Date(filtros.fi)) return false;
    if (filtros.ff && d > new Date(filtros.ff)) return false;
    return true;
  }), [mantenimientos, tipo, filtros.q, filtros.labF, filtros.estadoF, filtros.fi, filtros.ff]);

  const abrirDetalle = (equipo: string) => {
    const d = detalles.find((x) => x.equipo === equipo && x.tipo === tipo) ?? detalles.find((x) => x.equipo === equipo);
    if (d) setDetalle(d);
    else toast.info(`No hay detalle registrado aún para ${equipo}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Mantenimientos {tipo}s</h1>
        <p className="text-sm text-muted-foreground">Listado completo y trazabilidad de mantenimientos {tipo.toLowerCase()}s</p>
      </div>

      <Panel title="Filtros">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <input value={filtros.q} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "q", value: e.target.value })} placeholder="Buscar equipo o técnico..." className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm" aria-label="Buscar mantenimiento" />
          </div>
          <select value={filtros.labF} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "labF", value: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por laboratorio">
            <option value="">Todos los labs</option>
            {labs.map((l) => <option key={l.id} value={l.nombre}>{l.nombre}</option>)}
          </select>
          <select value={filtros.estadoF} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "estadoF", value: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            <option>Completado</option><option>En proceso</option><option>Pendiente</option>
          </select>
          <div className="flex gap-2">
            <input type="date" value={filtros.fi} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fi", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs" aria-label="Fecha desde" />
            <input type="date" value={filtros.ff} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "ff", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs" aria-label="Fecha hasta" />
          </div>
        </div>
      </Panel>

      <Panel title={`${filtered.length} registros`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Laboratorio</th>
                <th className="px-4 py-3 font-semibold">Técnico</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m, i) => (
                <tr key={m.equipo + m.fecha} className={i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/40 hover:bg-slate-50"}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-teal">{m.equipo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.lab}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.tecnico}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.fecha}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.estado} /></td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => abrirDetalle(m.equipo)} title="Ver detalle del mantenimiento"
                      className="inline-flex items-center gap-1.5 rounded-md border border-teal px-2.5 py-1 text-xs font-semibold text-teal hover:bg-teal-soft">
                      <Eye className="size-3.5" /> Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">Sin registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <MantDetalleModal detalle={detalle} open={!!detalle} onOpenChange={(v) => !v && setDetalle(null)} />
    </div>
  );
}
