import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Eye, Wrench, History, ChevronRight, Check } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { MantDetalleModal } from "@/components/sigmalab/MantDetalleModal";
import { store, useStore, correctivoPrefill, preventivoPrefill, type MantDetalle, type Asignacion } from "@/lib/store";
import { useApp } from "@/lib/use-app";
import { useAuth, getSessionUsername } from "@/lib/auth";
import { cn } from "@/lib/utils";

type EstadoIncidencia = "Nuevo" | "Visto" | "Pendiente" | "En proceso" | "Nuevo mantenimiento asignado" | "Completado" | "Resuelto";

export function AsignadosView() {
  const { user } = useAuth();
  const asignaciones = useStore((s) => s.asignaciones);
  const mantenimientos = useStore((s) => s.mantenimientos);
  const detalles = useStore((s) => s.detalles);
  const histCorrectivos = useStore((s) => s.histCorrectivos);
  const equipos = useStore((s) => s.equipos);
  const reportes = useStore((s) => s.reportesPasante);
  const { setView } = useApp();
  const [verHist, setVerHist] = useState<string | null>(null);
  const [detSel, setDetSel] = useState<MantDetalle | null>(null);
  const nombreCompleto = user ? `${user.nombres} ${user.paterno}`.toLowerCase() : "";

  const desdeMant = mantenimientos.filter(
    (m) => m.estado === "Nuevo mantenimiento asignado" && m.tecnico?.toLowerCase().includes(nombreCompleto)
  );
  const desdeAsig = asignaciones.filter((a) => (a.asignadoA === user?.id || a.asignadoA === getSessionUsername(user)) && (a.estado === "Pendiente" || a.estado === "En proceso"));

  type Item = { tipo: "mantenimiento" | "asignacion"; equipo: string; lab: string; problema: string; fecha: string; estado: string; prioridad?: string; ref: any };

  const [resolviendo, setResolviendo] = useState<Item | null>(null);
  const [resDetalle, setResDetalle] = useState("");
  const [resAccion, setResAccion] = useState("");
  const mias: Item[] = useMemo(() => {
    const items: Item[] = [
      ...desdeMant.map((m) => ({ tipo: "mantenimiento" as const, equipo: m.equipo, lab: m.lab, problema: m.tipo, fecha: m.fecha, estado: m.estado, ref: m })),
      ...desdeAsig.map((a) => ({ tipo: "asignacion" as const, equipo: a.equipo, lab: a.lab, problema: a.problema, fecha: a.fecha, estado: a.estado, prioridad: a.prioridad, ref: a })),
    ];
    return items.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [desdeMant, desdeAsig]);

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

  const atender = async (it: Item) => {
    const now = new Date();
    if (it.tipo === "mantenimiento") {
      store.updateMantenimientoEstado(it.equipo, it.lab, it.fecha, "En proceso");
    } else {
      const asig = it.ref as Asignacion;
      try {
        await store.updateAsignacion(asig.id, { estado: "En proceso" });
      } catch (_) {}
    }
    const eqObj = equipos.find((e) => e.codigo === it.equipo);
    if (user?.role === "preventivo") {
      preventivoPrefill.set({
        equipo: it.equipo,
        busq: eqObj ? `${eqObj.codigo} — ${eqObj.nombre}` : "",
        lab: it.lab,
        fecha: now.toISOString().slice(0, 10),
        horaInicio: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        estado: "En proceso",
      });
      toast.success(`Atendiendo ${it.equipo}`);
      setView("nuevo-mant");
      return;
    }
    const PROBLEMAS_COMUNES = ["Pantalla azul","Calentamiento excesivo","Problemas con el cooler","Ruido de la fuente","No reconoce disco","No enciende","Pérdida de red","Lentitud extrema","Otro"];
    let descripcionVal = it.problema;
    let tituloVal = "";
    let asignacionIdVal: string | undefined;
    if (it.tipo === "asignacion") {
      const asig = it.ref as Asignacion;
      asignacionIdVal = asig.id;
      const sep = asig.problema.indexOf(" — ");
      if (sep !== -1) { tituloVal = asig.problema.slice(0, sep); descripcionVal = asig.problema.slice(sep + 3); }
      else tituloVal = asig.problema;
    } else {
      const relAsig = asignaciones.find((a) => a.equipo === it.equipo && a.estado !== "Completado");
      if (relAsig) {
        const sep = relAsig.problema.indexOf(" — ");
        if (sep !== -1) { tituloVal = relAsig.problema.slice(0, sep); descripcionVal = relAsig.problema.slice(sep + 3); }
        else { tituloVal = relAsig.problema; descripcionVal = relAsig.problema; }
      }
    }
    correctivoPrefill.set({
      equipo: it.equipo,
      busq: eqObj ? `${eqObj.codigo} — ${eqObj.nombre}` : "",
      lab: it.lab,
      descripcion: descripcionVal,
      problemaTitulo: PROBLEMAS_COMUNES.includes(tituloVal) ? tituloVal : (tituloVal || "Otro"),
      fecha: now.toISOString().slice(0, 10),
      hora: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      estado: "En proceso",
      ...(asignacionIdVal ? { asignacionId: asignacionIdVal } : {}),
    });
    toast.success(`Atendiendo ${it.equipo}`);
    setView("nuevo-correctivo");
  };

  const resolver = async () => {
    if (!resolviendo || !resDetalle.trim()) { toast.error("Agrega un detalle de la resolución"); return; }
    const it = resolviendo;
    const hoy = new Date();
    const f = `${String(hoy.getDate()).padStart(2,"0")}/${String(hoy.getMonth()+1).padStart(2,"0")}/${hoy.getFullYear()}`;
    const fullName = `${user?.nombres} ${user?.paterno}`;
    const composed = [`Resuelto por ${fullName} el ${f}`, resAccion.trim() && `Acción: ${resAccion.trim()}`, `Detalle: ${resDetalle.trim()}`].filter(Boolean).join("\n");
    try {
      let reporteId: string | undefined;
      if (it.tipo === "mantenimiento") {
        store.updateMantenimientoEstado(it.equipo, it.lab, it.fecha, "Completado");
        const rel = asignaciones.find((a) => a.equipo === it.equipo && a.estado !== "Completado");
        if (rel) reporteId = rel.reporteId;
      } else {
        const asig = it.ref as Asignacion;
        await store.updateAsignacion(asig.id, { estado: "Completado" });
        reporteId = asig.reporteId;
      }
      if (!reporteId) {
        const fallback = reportes.find((r) => r.estado !== "Resuelto" && r.estado !== "Completado" && (r.ubicacion === it.equipo || r.laboratorio === it.lab));
        if (fallback) reporteId = fallback.id;
      }
      if (reporteId) {
        await store.updateReportePasante(reporteId, { estado: "Resuelto", resolucionDetalle: composed });
      }
      toast.success("Incidencia resuelta");
      setResolviendo(null); setResDetalle(""); setResAccion("");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Error al resolver");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Equipos asignados</h1>
        <p className="text-sm text-muted-foreground">Equipos con mantenimientos pendientes a tu cargo</p>
      </div>

      <Panel title={`${mias.length} equipo${mias.length !== 1 ? "s" : ""} asignado${mias.length !== 1 ? "s" : ""}`}>
        {mias.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No tienes equipos asignados</p>
        ) : (
          <ul className="space-y-3">
            {mias.map((it, i) => (
              <li key={i} className={cn("rounded-lg border-l-4 bg-white p-4 shadow-sm", it.tipo === "mantenimiento" ? "border-l-teal" : it.prioridad === "Alta" ? "border-l-danger" : it.prioridad === "Media" ? "border-l-warning" : "border-l-info")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal">{it.equipo}</span>
                      {it.tipo === "mantenimiento" ? (
                        <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[10px] font-bold uppercase text-teal">Mantenimiento</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase">{it.prioridad}</span>
                      )}
                      <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase text-warning">{it.estado}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{it.lab} · Asignado el {it.fecha}</p>
                    {it.tipo === "mantenimiento" ? (
                      <p className="mt-1 text-sm">Mantenimiento {it.problema}</p>
                    ) : (
                      <p className="mt-1 text-sm">{it.problema}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 md:flex-row">
                    <button type="button" onClick={() => setVerHist(it.equipo)} className="inline-flex items-center gap-1 rounded-md border border-teal px-2.5 py-1 text-xs font-semibold text-teal hover:bg-teal-soft">
                      <History className="size-3.5" />Ver historial
                    </button>
                    <button type="button" onClick={() => { setResolviendo(it); setResDetalle(""); setResAccion(""); }} className="inline-flex items-center gap-1 rounded-md bg-success px-2.5 py-1 text-xs font-bold text-white hover:opacity-90">
                      <Check className="size-3.5" />Resolver
                    </button>
                    <button type="button" onClick={() => atender(it)} className="inline-flex items-center gap-1 rounded-md bg-warning px-2.5 py-1 text-xs font-bold text-white hover:opacity-90">
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
        title={`Historial de ${verHist ?? ""}`}
        description="Mantenimientos previos del equipo"
        footer={<Button onClick={() => setVerHist(null)}>Cerrar</Button>}>
        {verHist && (() => {
          const hist = histDelEquipo(verHist);
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

      <Modal open={!!resolviendo} onOpenChange={(v) => !v && setResolviendo(null)} title={`Resolver — ${resolviendo?.equipo ?? ""}`}
        description="Marca la incidencia como resuelta"
        footer={<><Button variant="outline" onClick={() => setResolviendo(null)}>Cancelar</Button><Button className="bg-success hover:bg-success/90" onClick={resolver}><Check className="mr-1 size-4" /> Guardar resolución</Button></>}>
        {resolviendo && (
          <div className="space-y-4">
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-navy">{resolviendo.equipo} · {resolviendo.lab}</p>
              <p className="mt-1 text-xs text-muted-foreground">{resolviendo.problema}</p>
            </div>
            <FormField label="Acción realizada">
              <input value={resAccion} onChange={(e) => setResAccion(e.target.value)} className={inputCls} placeholder="Ej: Reemplazo de cable de red" aria-label="Acción realizada" />
            </FormField>
            <FormField label="Detalle de la resolución" required>
              <textarea rows={4} value={resDetalle} onChange={(e) => setResDetalle(e.target.value)} className={inputCls} placeholder="Describe lo que se hizo, observaciones..." aria-label="Detalle de la resolución" />
            </FormField>
          </div>
        )}
      </Modal>

      <MantDetalleModal detalle={detSel} open={!!detSel} onOpenChange={(v) => !v && setDetSel(null)} />
    </div>
  );
}
