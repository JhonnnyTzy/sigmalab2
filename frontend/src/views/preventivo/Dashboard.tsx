import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Wrench, ClipboardCheck, AlertOctagon, Send, PlusCircle, Package, Inbox } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { MetricCard } from "@/components/sigmalab/MetricCard";
import { MantDetalleModal } from "@/components/sigmalab/MantDetalleModal";
import { useStore, type MantDetalle } from "@/lib/store";
import { useApp } from "@/lib/use-app";
import { useAuth, getSessionFullName } from "@/lib/auth";
import { PreventivoCharts } from "./PreventivoCharts";

export function PreventivoDashboard() {
  const { user } = useAuth();
  const misPrev = useStore((s) => s.misPrev);
  const mantenimientos = useStore((s) => s.mantenimientos);
  const detalles = useStore((s) => s.detalles);
  const { setView } = useApp();
  const [detalleSel, setDetalleSel] = useState<MantDetalle | null>(null);

  const nombreCompleto = user ? `${user.nombres} ${user.paterno}`.toLowerCase() : "";
  const asignados = mantenimientos.filter(
    (m) => m.estado === "Nuevo mantenimiento asignado" && m.tecnico?.toLowerCase().includes(nombreCompleto)
  );
  const hoy = misPrev.filter((m) => m.fecha === "20/04/2026").length;
  const completados = misPrev.filter((m) => m.estado === "Completado").length;
  const enProceso = misPrev.filter((m) => m.estado === "En proceso").length;
  const pendientes = misPrev.filter((m) => m.estado === "Pendiente").length;

  const porLab = useMemo(() => {
    const map = new Map<string, number>();
    misPrev.forEach((m) => map.set(m.lab, (map.get(m.lab) ?? 0) + 1));
    return [...map.entries()].map(([lab, total]) => ({ lab, total }));
  }, [misPrev]);

  const distribucion = useMemo(() => [
    { name: "Completados", value: completados, color: "#16A34A" },
    { name: "En proceso", value: enProceso, color: "#F59E0B" },
    { name: "Pendientes", value: pendientes, color: "#3B82F6" },
  ].filter((x) => x.value > 0), [completados, enProceso, pendientes]);

  const verRecienteDetalle = (codigo: string) => {
    const d = detalles.find((x) => x.equipo === codigo) ?? null;
    if (d) setDetalleSel(d);
    else toast.info(`Sin detalle para ${codigo}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-navy">Buenos días, {getSessionFullName(user)}</h1>
          <p className="text-sm text-muted-foreground">ITIC Laboratorios · Pasante Preventivo</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setView("nuevo-mant")} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90">
            <PlusCircle className="size-4" /> Nuevo mantenimiento
          </button>
          <button type="button" onClick={() => setView("reportes-prev")} className="inline-flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            <Send className="size-4" /> Enviar reporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <button type="button" onClick={() => setView("asignados")} className="text-left"><MetricCard title="Equipos asignados" value={asignados.length} icon={Inbox} accent="warning" /></button>
        <MetricCard title="Mis mantenimientos" value={misPrev.length} icon={Wrench} accent="teal" />
        <MetricCard title="Completados" value={completados} icon={ClipboardCheck} accent="info" />
        <MetricCard title="En proceso" value={enProceso} icon={AlertTriangle} accent="warning" />
        <MetricCard title="Pendientes" value={pendientes} icon={AlertOctagon} accent="info" />
      </div>

        <PreventivoCharts porLab={porLab} distribucion={distribucion} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Mis mantenimientos recientes" className="lg:col-span-2">
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {misPrev.slice(0, 6).map((m, i) => (
              <li key={m.codigo + m.fecha} className="rounded-lg border border-slate-100 bg-white p-3.5 hover:shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs font-bold text-teal">{m.codigo}</p>
                    <p className="text-sm font-semibold text-navy">{m.lab}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.fecha} · {m.inicio}–{m.fin}</p>
                  </div>
                  <StatusBadge status={m.estado} />
                </div>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => verRecienteDetalle(m.codigo)} className="flex-1 rounded-md border border-teal px-2 py-1 text-xs font-semibold text-teal hover:bg-teal-soft">Ver detalle</button>
                  <button type="button" onClick={() => setView("mis-mant")} className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-muted-foreground hover:border-navy hover:text-navy">Editar</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
            <CheckCircle2 className="size-4 text-success" />
            <span className="text-xs text-muted-foreground">Equipos revisados hoy: <strong className="text-navy">{hoy || 3}</strong></span>
          </div>
        </Panel>

        <Panel title="Acciones rápidas">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setView("nuevo-mant")} className="flex flex-col items-center gap-1 rounded-lg border border-teal bg-teal-soft p-3 text-xs font-semibold text-teal hover:bg-teal hover:text-white"><PlusCircle className="size-5" />Nuevo mant.</button>
            <button type="button" onClick={() => setView("mis-mant")} className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-semibold hover:border-teal hover:text-teal"><ClipboardCheck className="size-5" />Mis trabajos</button>
            <button type="button" onClick={() => setView("asignados")} className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-semibold hover:border-teal hover:text-teal"><Inbox className="size-5" />Asignados</button>
            <button type="button" onClick={() => setView("insumos-disp")} className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-semibold hover:border-teal hover:text-teal"><Package className="size-5" />Insumos</button>
            <button type="button" onClick={() => setView("equipos")} className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-semibold hover:border-teal hover:text-teal"><Wrench className="size-5" />Equipos</button>
            <button type="button" onClick={() => setView("incidencias-bandeja")} className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-semibold hover:border-teal hover:text-teal"><AlertTriangle className="size-5" />Incidencias</button>
            <button type="button" onClick={() => setView("reportes-prev")} className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-semibold hover:border-teal hover:text-teal"><Send className="size-5" />Reportar</button>
          </div>
        </Panel>
      </div>

      <MantDetalleModal detalle={detalleSel} open={!!detalleSel} onOpenChange={(v) => !v && setDetalleSel(null)} />
    </div>
  );
}
