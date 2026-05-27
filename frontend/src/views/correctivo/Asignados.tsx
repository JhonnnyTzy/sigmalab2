import { useState } from "react";
import { toast } from "sonner";
import { Eye, Wrench, History, ChevronRight } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { MantDetalleModal } from "@/components/sigmalab/MantDetalleModal";
import { store, useStore, correctivoPrefill, type Asignacion, type MantDetalle } from "@/lib/store";
import { useApp } from "@/lib/use-app";
import { useAuth, getSessionUsername } from "@/lib/auth";
import { cn } from "@/lib/utils";

const PRIO: Record<string, string> = {
  Alta: "border-l-danger bg-danger-soft/30",
  Media: "border-l-warning bg-warning-soft/30",
  Baja: "border-l-info bg-info-soft/30",
};

export function AsignadosView() {
  const { user } = useAuth();
  const asignaciones = useStore((s) => s.asignaciones);
  const detalles = useStore((s) => s.detalles);
  const histCorrectivos = useStore((s) => s.histCorrectivos);
  const equipos = useStore((s) => s.equipos);
  const { setView } = useApp();
  const [verHist, setVerHist] = useState<Asignacion | null>(null);
  const [detSel, setDetSel] = useState<MantDetalle | null>(null);

  // Solo mis asignaciones activas (Pendiente / En proceso)
  const username = getSessionUsername(user);
  const mias = asignaciones.filter(
    (a) => a.asignadoA === username && (a.estado === "Pendiente" || a.estado === "En proceso"),
  );

  const histDelEquipo = (codigo: string) => {
    const fromDetalles = detalles.filter((d) => d.equipo === codigo);
    const fromHist = histCorrectivos.reduce((acc, h) => {
      if (h.equipo === codigo) acc.push({
        id: `hh-${h.fecha}-${h.equipo}`, tipo: "Correctivo" as const, equipo: h.equipo,
        lab: equipos.find((e) => e.codigo === h.equipo)?.lab ?? "—", tecnico: h.tecnico,
        fecha: h.fecha, estado: h.estado, descripcion: h.problema, accion: h.accion,
      } as MantDetalle);
      return acc;
    }, [] as MantDetalle[]);
    return [...fromDetalles, ...fromHist];
  };

  const atender = async (a: Asignacion) => {
    try {
      await store.updateAsignacion(a.id, { estado: "En proceso" });
      const [d, m, y] = a.fecha.split("/");
      const fechaIso = (y && m && d) ? `${y}-${m}-${d}` : new Date().toISOString().slice(0, 10);
      const now = new Date();
      correctivoPrefill.set({
        asignacionId: a.id,
        equipo: a.equipo,
        lab: a.lab,
        descripcion: a.problema,
        problemaTitulo: "Otro",
        fecha: fechaIso,
        hora: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        estado: "En proceso",
      });
      toast.success(`Atendiendo ${a.equipo}`);
      setView("nuevo-correctivo");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Error al actualizar asignación");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Equipos asignados</h1>
        <p className="text-sm text-muted-foreground">Equipos con mantenimientos pendientes o en proceso a tu cargo</p>
      </div>

      <Panel title={`${mias.length} asignación${mias.length !== 1 ? "es" : ""} activa${mias.length !== 1 ? "s" : ""}`}>
        {mias.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No tienes equipos pendientes ni en proceso</p>
        ) : (
          <ul className="space-y-3">
            {mias.map((a) => (
              <li key={a.id} className={cn("rounded-lg border-l-4 bg-white p-4 shadow-sm", PRIO[a.prioridad])}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal">{a.equipo}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase">{a.prioridad}</span>
                      <span className="rounded-full bg-info-soft px-2 py-0.5 text-[10px] font-bold uppercase text-info">{a.estado}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{a.lab} · Asignado el {a.fecha}</p>
                    <p className="mt-1 text-sm">{a.problema}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 md:flex-row">
                    <button type="button" onClick={() => setVerHist(a)} className="inline-flex items-center gap-1 rounded-md border border-teal px-2.5 py-1 text-xs font-semibold text-teal hover:bg-teal-soft">
                      <History className="size-3.5" />Ver historial
                    </button>
                    <button type="button" onClick={() => atender(a)} className="inline-flex items-center gap-1 rounded-md bg-warning px-2.5 py-1 text-xs font-bold text-white hover:opacity-90">
                      <Wrench className="size-3.5" />Atender
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal open={!!verHist} onOpenChange={(v) => !v && setVerHist(null)} size="lg"
        title={`Historial de ${verHist?.equipo ?? ""}`}
        description="Mantenimientos previos del equipo"
        footer={<Button onClick={() => setVerHist(null)}>Cerrar</Button>}>
        {verHist && (() => {
          const hist = histDelEquipo(verHist.equipo);
          return hist.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Sin historial previo</p>
          ) : (
            <ul className="space-y-2">
              {hist.map((h) => (
                <li key={h.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", h.tipo === "Preventivo" ? "bg-teal-soft text-teal" : "bg-warning-soft text-warning")}>{h.tipo}</span>
                      <span className="text-xs text-muted-foreground">{h.fecha} · {h.tecnico}</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs">{h.descripcion ?? h.observaciones ?? "—"}</p>
                  </div>
                  <button type="button" onClick={() => { setDetSel(h); setVerHist(null); }} className="shrink-0 inline-flex items-center gap-1 rounded-md border border-teal px-2 py-1 text-xs font-semibold text-teal hover:bg-teal-soft">
                    <Eye className="size-3.5" />Detalle<ChevronRight className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          );
        })()}
      </Modal>

      <MantDetalleModal detalle={detSel} open={!!detSel} onOpenChange={(v) => !v && setDetSel(null)} />
    </div>
  );
}
