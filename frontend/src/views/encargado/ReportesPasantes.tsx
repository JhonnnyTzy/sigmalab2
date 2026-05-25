import { useState } from "react";
import { toast } from "sonner";
import { Inbox, CheckCircle2, Eye } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { store, useStore, type ReportePasante } from "@/lib/store";
import { cn } from "@/lib/utils";

const PRIO: Record<string, string> = { Alta: "border-l-danger bg-danger-soft/40", Media: "border-l-warning bg-warning-soft/40", Baja: "border-l-info bg-info-soft/40" };
const ESTADO: Record<string, string> = { Nuevo: "bg-info-soft text-info", Visto: "bg-slate-100 text-slate-600", Resuelto: "bg-success-soft text-success" };

export function ReportesPasantesView() {
  const reportes = useStore((s) => s.reportesPasante);
  const [filter, setFilter] = useState("");
  const [estadoF, setEstadoF] = useState("");
  const [open, setOpen] = useState<ReportePasante | null>(null);

  const filtered = reportes.filter((r) =>
    (!filter || r.titulo.toLowerCase().includes(filter.toLowerCase()) || r.descripcion.toLowerCase().includes(filter.toLowerCase()))
    && (!estadoF || r.estado === estadoF),
  );

  const marcarResuelto = (r: ReportePasante) => {
    store.updateReportePasante(r.id, { estado: "Resuelto" });
    toast.success(`Reporte "${r.titulo}" marcado como resuelto`);
    setOpen(null);
  };
  const marcarVisto = (r: ReportePasante) => {
    if (r.estado === "Nuevo") store.updateReportePasante(r.id, { estado: "Visto" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Reportes de pasantes</h1>
        <p className="text-sm text-muted-foreground">Bandeja de incidencias menores y observaciones reportadas por los pasantes</p>
      </div>

      <Panel title="Filtros">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar por título o descripción..." className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:col-span-2" aria-label="Buscar reporte" />
          <select value={estadoF} onChange={(e) => setEstadoF(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por estado">
            <option value="">Todos los estados</option><option>Nuevo</option><option>Visto</option><option>Resuelto</option>
          </select>
        </div>
      </Panel>

      <Panel title={`${filtered.length} reporte${filtered.length !== 1 ? "s" : ""}`}>
        {filtered.length === 0 ? (
          <div className="py-12 text-center"><Inbox className="mx-auto mb-2 size-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">No hay reportes pendientes</p></div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((r) => (
              <li key={r.id} className={cn("rounded-lg border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md", PRIO[r.prioridad])}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", ESTADO[r.estado])}>{r.estado}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">{r.prioridad}</span>
                      <span className="text-[11px] text-muted-foreground">{r.fecha} · @{r.pasante}</span>
                    </div>
                    <p className="mt-1.5 font-bold text-navy">{r.titulo}</p>
                    <p className="mt-1 text-xs text-muted-foreground">📍 {r.laboratorio} · {r.ubicacion} · {r.categoria}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-foreground">{r.descripcion}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button type="button" onClick={() => { marcarVisto(r); setOpen(r); }} className="inline-flex items-center gap-1.5 rounded-md border border-teal px-2.5 py-1 text-xs font-semibold text-teal hover:bg-teal-soft"><Eye className="size-3.5" />Ver</button>
                    {r.estado !== "Resuelto" && (
                      <button type="button" onClick={() => marcarResuelto(r)} className="inline-flex items-center gap-1.5 rounded-md bg-success px-2.5 py-1 text-xs font-bold text-white hover:opacity-90"><CheckCircle2 className="size-3.5" />Resolver</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal open={!!open} onOpenChange={(v) => !v && setOpen(null)} size="md"
        title={open?.titulo ?? ""}
        description={open ? `Reportado el ${open.fecha} por @${open.pasante}` : ""}
        footer={<>
          <Button variant="outline" onClick={() => setOpen(null)}>Cerrar</Button>
          {open && open.estado !== "Resuelto" && <Button className="bg-success hover:bg-success/90" onClick={() => open && marcarResuelto(open)}><CheckCircle2 className="mr-1 size-4" />Marcar resuelto</Button>}
        </>}>
        {open && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
              <div><p className="font-semibold text-muted-foreground">Laboratorio</p><p className="font-bold text-navy">{open.laboratorio}</p></div>
              <div><p className="font-semibold text-muted-foreground">Ubicación</p><p className="font-bold text-navy">{open.ubicacion}</p></div>
              <div><p className="font-semibold text-muted-foreground">Categoría</p><p className="font-bold text-navy">{open.categoria}</p></div>
              <div><p className="font-semibold text-muted-foreground">Prioridad</p><p className="font-bold text-navy">{open.prioridad}</p></div>
            </div>
            <div className="rounded-lg border border-slate-100 p-3"><p className="text-xs font-semibold uppercase tracking-wider text-teal">Descripción</p><p className="mt-1.5 text-sm">{open.descripcion}</p></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
