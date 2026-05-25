import { useState, useMemo } from "react";
import { Eye, CheckCircle2, Clock, AlertTriangle, Wrench, Pencil } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { MetricCard } from "@/components/sigmalab/MetricCard";
import { MantDetalleModal } from "@/components/sigmalab/MantDetalleModal";
import { useStore, correctivoPrefill, type MantDetalle, type HistCorrectivo } from "@/lib/store";
import { useApp } from "@/lib/use-app";

const ESTADOS_FILTRO = ["Completado", "En proceso", "Pendiente"];

const norm = (e: string): "Completado" | "En proceso" | "Pendiente" => {
  if (e === "Resuelto" || e === "Completado") return "Completado";
  if (e === "En proceso") return "En proceso";
  return "Pendiente";
};

export function MisCorrectivosView() {
  const hist = useStore((s) => s.histCorrectivos);
  const detalles = useStore((s) => s.detalles);
  const equipos = useStore((s) => s.equipos);
  const { setView } = useApp();
  const [q, setQ] = useState("");
  const [estadoF, setEstadoF] = useState("");
  const [detSel, setDetSel] = useState<MantDetalle | null>(null);

  // Sólo mis mantenimientos
  const mios = useMemo(() => hist.filter((h) => h.tecnico === "Jhonny Arias"), [hist]);

  const filtered = useMemo(() => mios.filter((h) =>
    (!q || h.equipo.toLowerCase().includes(q.toLowerCase()) || h.problema.toLowerCase().includes(q.toLowerCase()))
    && (!estadoF || norm(h.estado) === estadoF),
  ), [mios, q, estadoF]);

  const completados = mios.filter((h) => norm(h.estado) === "Completado").length;
  const enProc = mios.filter((h) => norm(h.estado) === "En proceso").length;
  const pendientes = mios.filter((h) => norm(h.estado) === "Pendiente").length;

  const verDetalle = (h: HistCorrectivo) => {
    const d = detalles.find((x) => x.tipo === "Correctivo" && x.equipo === h.equipo && x.fecha === h.fecha && x.tecnico === h.tecnico);
    if (d) setDetSel(d);
    else {
      setDetSel({
        id: `inline-${h.equipo}-${h.fecha}`, tipo: "Correctivo", equipo: h.equipo,
        lab: equipos.find((e) => e.codigo === h.equipo)?.lab ?? "—",
        tecnico: h.tecnico, fecha: h.fecha, estado: h.estado, descripcion: h.problema, accion: h.accion,
      });
    }
  };

  const editar = (h: HistCorrectivo) => {
    const d = detalles.find((x) => x.tipo === "Correctivo" && x.equipo === h.equipo && x.fecha === h.fecha && x.tecnico === h.tecnico);
    const [dd, mm, yy] = h.fecha.split("/");
    const iso = (yy && mm && dd) ? `${yy}-${mm}-${dd}` : new Date().toISOString().slice(0, 10);
    correctivoPrefill.set({
      histKey: { equipo: h.equipo, fecha: h.fecha, tecnico: h.tecnico },
      equipo: h.equipo,
      lab: d?.lab,
      fecha: iso,
      descripcion: d?.descripcion ?? h.problema,
      problemaTitulo: (d?.descripcion && h.problema?.startsWith(d.descripcion)) ? "Otro" : "Otro",
      diagnostico: d?.diagnostico,
      accion: d?.accion ?? h.accion,
      observaciones: d?.observaciones,
      componentes: d?.componentes ?? [],
      insumos: (d?.insumos ?? []).map((i) => ({ insumo: i.insumo })),
      estado: norm(h.estado),
      tipoIncidencia: d?.tipoIncidencia ?? "Hardware",
    });
    setView("nuevo-correctivo");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">Mis Mantenimientos</h1>
          <p className="text-sm text-muted-foreground">Mantenimientos correctivos registrados por ti</p>
        </div>
        <button type="button" onClick={() => setView("nuevo-correctivo")} className="inline-flex items-center gap-2 rounded-lg bg-warning px-4 py-2 text-sm font-bold text-white hover:opacity-90">
          <Wrench className="size-4" /> Nuevo mantenimiento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard title="Total" value={mios.length} icon={Wrench} accent="warning" />
        <MetricCard title="Completados" value={completados} icon={CheckCircle2} accent="teal" />
        <MetricCard title="En proceso" value={enProc} icon={Clock} accent="info" />
        <MetricCard title="Pendientes" value={pendientes} icon={AlertTriangle} accent="danger" />
      </div>

      <Panel title="Filtros">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar equipo o problema..." className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:col-span-2" aria-label="Buscar equipo o problema" />
          <select value={estadoF} onChange={(e) => setEstadoF(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {ESTADOS_FILTRO.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Panel>

      <Panel title={`${filtered.length} mantenimiento${filtered.length !== 1 ? "s" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Problema</th>
                <th className="px-4 py-3 font-semibold">Acción</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((h, i) => (
                <tr key={h.equipo + h.fecha} className={i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/40 hover:bg-slate-50"}>
                  <td className="px-4 py-3 text-muted-foreground">{h.fecha}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-teal">{h.equipo}</td>
                  <td className="px-4 py-3 text-navy">{h.problema}</td>
                  <td className="px-4 py-3 text-muted-foreground">{h.accion}</td>
                  <td className="px-4 py-3"><StatusBadge status={norm(h.estado)} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => verDetalle(h)} title="Ver detalle" className="inline-flex items-center gap-1 rounded-md border border-teal px-2 py-1 text-xs font-semibold text-teal hover:bg-teal-soft">
                        <Eye className="size-3.5" />Ver
                      </button>
                      <button type="button" onClick={() => editar(h)} title="Editar" className="inline-flex items-center gap-1 rounded-md border border-warning px-2 py-1 text-xs font-semibold text-warning hover:bg-warning-soft">
                        <Pencil className="size-3.5" />Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No tienes mantenimientos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <MantDetalleModal detalle={detSel} open={!!detSel} onOpenChange={(v) => !v && setDetSel(null)} />
    </div>
  );
}
