import { useState, useMemo } from "react";
import { Eye, CheckCircle2, Clock, AlertTriangle, Wrench, Pencil } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { MetricCard } from "@/components/sigmalab/MetricCard";
import { MantDetalleModal } from "@/components/sigmalab/MantDetalleModal";
import { useStore, correctivoPrefill, type MantDetalle, type HistCorrectivo } from "@/lib/store";
import { useApp } from "@/lib/use-app";
import { useAuth, getSessionFullName } from "@/lib/auth";

const ESTADOS_FILTRO = ["Completado", "En proceso", "Pendiente"];

const norm = (e: string): "Completado" | "En proceso" | "Pendiente" => {
  if (e === "Resuelto" || e === "Completado") return "Completado";
  if (e === "En proceso") return "En proceso";
  return "Pendiente";
};

const TIPOS = ["Hardware", "Software", "Red", "Periférico", "Otro"];

export function MisCorrectivosView() {
  const { user } = useAuth();
  const hist = useStore((s) => s.histCorrectivos);
  const detalles = useStore((s) => s.detalles);
  const equipos = useStore((s) => s.equipos);
  const labs = useStore((s) => s.labs);
  const { setView } = useApp();
  const [q, setQ] = useState("");
  const [estadoF, setEstadoF] = useState("");
  const [labF, setLabF] = useState("");
  const [tipoF, setTipoF] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [detSel, setDetSel] = useState<MantDetalle | null>(null);

  // Sólo mis mantenimientos
  const tecnicoName = getSessionFullName(user);
  const mios = useMemo(() => hist.filter((h) => h.tecnico === tecnicoName), [hist, tecnicoName]);

  const filtered = useMemo(() => mios.filter((h) => {
    if (q && !h.equipo.toLowerCase().includes(q.toLowerCase()) && !h.problema.toLowerCase().includes(q.toLowerCase())) return false;
    if (estadoF && norm(h.estado) !== estadoF) return false;
    if (labF) {
      const eq = equipos.find((e) => e.codigo === h.equipo);
      if (!eq || eq.lab !== labF) return false;
    }
    if (tipoF) {
      const d = detalles.find((x) => x.tipo === "Correctivo" && x.equipo === h.equipo && x.fecha === h.fecha && x.tecnico === h.tecnico);
      if (!d || d.tipoIncidencia !== tipoF) return false;
    }
    if (fechaDesde) {
      const [dd, mm, yy] = h.fecha.split("/");
      const d = new Date(+yy, +mm - 1, +dd);
      const [ad, am, ay] = fechaDesde.split("-");
      if (d < new Date(+ay, +am - 1, +ad)) return false;
    }
    if (fechaHasta) {
      const [dd, mm, yy] = h.fecha.split("/");
      const d = new Date(+yy, +mm - 1, +dd);
      const [hd, hm, hy] = fechaHasta.split("-");
      if (d > new Date(+hy, +hm - 1, +hd)) return false;
    }
    return true;
  }).sort((a, b) => {
    const [ad, am, ay] = a.fecha.split("/");
    const [bd, bm, by] = b.fecha.split("/");
    return new Date(+by, +bm - 1, +bd).getTime() - new Date(+ay, +am - 1, +ad).getTime();
  }), [mios, q, estadoF, labF, tipoF, fechaDesde, fechaHasta, equipos, detalles]);

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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar equipo o problema..." className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:col-span-2" aria-label="Buscar equipo o problema" />
          <select value={estadoF} onChange={(e) => setEstadoF(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {ESTADOS_FILTRO.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={labF} onChange={(e) => setLabF(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por laboratorio">
            <option value="">Todos los laboratorios</option>
            {labs.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
          <select value={tipoF} onChange={(e) => setTipoF(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por tipo">
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Desde
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" aria-label="Fecha desde" />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Hasta
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" aria-label="Fecha hasta" />
          </label>
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
