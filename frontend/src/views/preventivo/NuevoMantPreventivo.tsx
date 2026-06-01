import { useReducer, useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, Trash2, History, Save } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { ChecklistTable } from "@/components/sigmalab/ChecklistTable";
import { MantDetalleModal } from "@/components/sigmalab/MantDetalleModal";
import { Modal } from "@/components/sigmalab/Modal";
import { HARDWARE_CHECKLIST, SOFTWARE_CHECKLIST, PRUEBAS_CHECKLIST, INSUMOS } from "@/lib/sigmalab-data";
import { store, useStore, preventivoPrefill, type MantDetalle } from "@/lib/store";
import { cn } from "@/lib/utils";

type Estado = "Pendiente" | "En proceso" | "Completado";
const ESTADOS: { id: Estado; cls: string }[] = [
  { id: "Pendiente", cls: "border-info text-info bg-info-soft" },
  { id: "En proceso", cls: "border-warning text-warning bg-warning-soft" },
  { id: "Completado", cls: "border-success text-success bg-success-soft" },
];

interface Props {
  initial?: { orig: import("@/lib/store").MantPrev; detalle?: MantDetalle | null } | null;
  onSaved?: () => void;
}

export function NuevoMantPreventivoView({ initial = null, onSaved }: Props) {
  const labs = useStore((s) => s.labs);
  const equipos = useStore((s) => s.equipos);
  const detalles = useStore((s) => s.detalles);

  // Consume prefill from "Atender" button
  const prefRef = useRef<import("@/lib/store").PreventivoPrefill | null>(null);
  if (prefRef.current === null) {
    prefRef.current = preventivoPrefill.consume();
  }
  const p = prefRef.current;

  const isoFecha = (() => {
    if (p?.fecha) return p.fecha;
    if (!initial) return "2026-04-20";
    const [d, m, y] = initial.orig.fecha.split("/");
    return `${y}-${m}-${d}`;
  })();

  const labDesdePrefill = p?.lab ? labs.find((l) => l.nombre === p.lab || l.id === p.lab)?.id ?? "" : "";

  const initChecklist = (items: string[]) =>
    items.reduce((acc, it) => ({ ...acc, [it]: "" }), {} as Record<string, string>);
  const initChecklistFromDetalle = (items: string[], detalleList?: { item: string; estado: string; obs: string }[]) => {
    if (!detalleList) return initChecklist(items);
    const m = new Map(detalleList.map((d) => [d.item, d.estado]));
    return items.reduce((acc, it) => ({ ...acc, [it]: m.get(it) ?? "" }), {} as Record<string, string>);
  };
  const initObsFromDetalle = (items: string[], detalleList?: { item: string; estado: string; obs: string }[]) => {
    if (!detalleList) return initChecklist(items);
    const m = new Map(detalleList.map((d) => [d.item, d.obs]));
    return items.reduce((acc, it) => ({ ...acc, [it]: m.get(it) ?? "" }), {} as Record<string, string>);
  };
  const [form, dispatch] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    {
      lab: p?.lab ? labDesdePrefill : (initial ? (labs.find((l) => l.nombre === initial.orig.lab)?.id ?? "") : ""),
      equipo: p?.equipo ?? initial?.orig.codigo ?? "",
      fecha: isoFecha,
      horaInicio: p?.horaInicio ?? initial?.orig.inicio ?? "08:30",
      horaFin: p?.horaFin ?? initial?.orig.fin ?? "09:45",
      estado: (p?.estado as Estado) ?? (initial?.orig.estado as Estado) ?? "Pendiente",
      insumosUsados: initial?.detalle?.insumos?.map((i) => ({ insumo: i.insumo })) ?? [{ insumo: "" }],
      incidencias: initial?.detalle?.incidencias ?? [{ problema: "", accion: "", seguimiento: false }],
      observaciones: initial?.detalle?.observaciones ?? "",
      recomendaciones: initial?.detalle?.recomendaciones ?? "",
      hardwareEstados: initChecklistFromDetalle(HARDWARE_CHECKLIST, initial?.detalle?.hardware),
      hardwareObs: initObsFromDetalle(HARDWARE_CHECKLIST, initial?.detalle?.hardware),
      softwareEstados: initChecklistFromDetalle(SOFTWARE_CHECKLIST, initial?.detalle?.software),
      softwareObs: initObsFromDetalle(SOFTWARE_CHECKLIST, initial?.detalle?.software),
      pruebasEstados: initChecklistFromDetalle(PRUEBAS_CHECKLIST, initial?.detalle?.pruebas),
      pruebasObs: initObsFromDetalle(PRUEBAS_CHECKLIST, initial?.detalle?.pruebas),
      touched: false,
      historialOpen: false,
    }
  );
  const [detalleSel, setDetalleSel] = useState<MantDetalle | null>(null);

  const eqDetail = equipos.find((e) => e.codigo === form.equipo);
  const equiposEnLab = form.lab ? equipos.filter((e) => e.lab === form.lab) : equipos;
  const historialEq = detalles.filter((d) => d.equipo === form.equipo);

  const reset = () => {
    dispatch({ type: "SET_FIELD", field: "lab", value: "" });
    dispatch({ type: "SET_FIELD", field: "equipo", value: "" });
    dispatch({ type: "SET_FIELD", field: "touched", value: false });
    dispatch({ type: "SET_FIELD", field: "observaciones", value: "" });
    dispatch({ type: "SET_FIELD", field: "recomendaciones", value: "" });
    dispatch({ type: "SET_FIELD", field: "insumosUsados", value: [{ insumo: "" }] });
    dispatch({ type: "SET_FIELD", field: "estado", value: "Pendiente" });
    dispatch({ type: "SET_FIELD", field: "incidencias", value: [{ problema: "", accion: "", seguimiento: false }] });
    dispatch({ type: "SET_FIELD", field: "hardwareEstados", value: initChecklist(HARDWARE_CHECKLIST) });
    dispatch({ type: "SET_FIELD", field: "hardwareObs", value: initChecklist(HARDWARE_CHECKLIST) });
    dispatch({ type: "SET_FIELD", field: "softwareEstados", value: initChecklist(SOFTWARE_CHECKLIST) });
    dispatch({ type: "SET_FIELD", field: "softwareObs", value: initChecklist(SOFTWARE_CHECKLIST) });
    dispatch({ type: "SET_FIELD", field: "pruebasEstados", value: initChecklist(PRUEBAS_CHECKLIST) });
    dispatch({ type: "SET_FIELD", field: "pruebasObs", value: initChecklist(PRUEBAS_CHECKLIST) });
  };

  const handleSave = async () => {
    dispatch({ type: "SET_FIELD", field: "touched", value: true });
    if (!form.lab || !form.equipo) {
      toast.error("Selecciona laboratorio y equipo (mínimo para guardar como Pendiente)");
      return;
    }
    const fechaFmt = form.fecha.split("-").reverse().join("/");
    const labName = labs.find((l) => l.id === form.lab)?.nombre ?? form.lab;
    const incidenciasReales = form.incidencias.filter((i) => i.problema.trim()).length;
    const insumosFmt = form.insumosUsados.reduce((acc, i) => {
      if (i.insumo) acc.push({
        insumoNombre: i.insumo,
        cantidad: "",
      });
      return acc;
    }, [] as { insumoNombre: string; cantidad: string }[]);
    const detallePayload: Partial<MantDetalle> = {
      hardware: HARDWARE_CHECKLIST.map((it) => ({ item: it, estado: form.hardwareEstados[it] || "OK", obs: form.hardwareObs[it] || "" })),
      software: SOFTWARE_CHECKLIST.map((it) => ({ item: it, estado: form.softwareEstados[it] || "OK", obs: form.softwareObs[it] || "" })),
      pruebas: PRUEBAS_CHECKLIST.map((it) => ({ item: it, estado: form.pruebasEstados[it] || "OK", obs: form.pruebasObs[it] || "" })),
      incidencias: form.incidencias, insumos: insumosFmt, observaciones: form.observaciones, recomendaciones: form.recomendaciones,
    };
    try {
      if (initial) {
        await store.updateMantPrev(initial.orig, {
          lab: labName, fecha: fechaFmt, inicio: form.horaInicio, fin: form.horaFin,
          estado: form.estado, incidencias: incidenciasReales,
        }, detallePayload);
        toast.success(`Mantenimiento actualizado (${form.estado})`);
      } else {
        await store.addMantPrev({
          codigo: form.equipo, lab: labName, fecha: fechaFmt,
          inicio: form.horaInicio, fin: form.horaFin, estado: form.estado, incidencias: incidenciasReales,
        }, detallePayload);
        toast.success(`Mantenimiento guardado (${form.estado})`);
        reset();
      }
      onSaved?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Error al guardar mantenimiento");
    }
  };

  return (
    <div className="space-y-6">
      {!initial && (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">Nuevo Mantenimiento Preventivo</h1>
          <p className="text-sm text-muted-foreground">Registra el mantenimiento. Puedes guardar el avance en cualquier momento como Pendiente.</p>
        </div>
      )}

      <Panel title="Registrar mantenimiento preventivo">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="np-lab" className="mb-1 block text-xs font-semibold text-muted-foreground">Laboratorio *</label>
              <select id="np-lab" value={form.lab} onChange={(e) => { dispatch({ type: "SET_FIELD", field: "lab", value: e.target.value }); dispatch({ type: "SET_FIELD", field: "equipo", value: "" }); }}
                className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm", form.touched && !form.lab ? "border-danger" : "border-slate-200")} aria-label="Laboratorio">
                <option value="">Selecciona un laboratorio</option>
                {labs.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="np-equipo" className="mb-1 block text-xs font-semibold text-muted-foreground">Equipo *</label>
              <div className="flex gap-2">
                <select id="np-equipo" value={form.equipo} onChange={(e) => dispatch({ type: "SET_FIELD", field: "equipo", value: e.target.value })}
                  className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm", form.touched && !form.equipo ? "border-danger" : "border-slate-200")} aria-label="Equipo">
                  <option value="">Selecciona un equipo</option>
                  {equiposEnLab.map((e) => <option key={e.codigo} value={e.codigo}>{e.codigo} - {e.nombre}</option>)}
                </select>
                <button type="button" disabled={!form.equipo} onClick={() => dispatch({ type: "SET_FIELD", field: "historialOpen", value: true })}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-teal bg-teal-soft px-3 py-2 text-xs font-semibold text-teal hover:bg-teal hover:text-white disabled:opacity-50">
                  <History className="size-3.5" /> Ver historial
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs md:grid-cols-4">
            {[["Fila", eqDetail?.fila ?? "—"], ["Puesto", eqDetail?.puesto ?? "—"], ["Sistema Op.", eqDetail?.so ?? "—"], ["Marca", eqDetail?.marca ?? "—"]].map(([k, v]) => (
              <div key={k}><p className="font-semibold text-muted-foreground">{k}</p><p className="mt-0.5 font-bold text-navy">{v}</p></div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label htmlFor="np-fecha" className="mb-1 block text-xs font-semibold text-muted-foreground">Fecha</label><input id="np-fecha" type="date" value={form.fecha} onChange={(e) => dispatch({ type: "SET_FIELD", field: "fecha", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Fecha" /></div>
            <div><label htmlFor="np-hora-inicio" className="mb-1 block text-xs font-semibold text-muted-foreground">Hora inicio</label><input id="np-hora-inicio" type="time" value={form.horaInicio} onChange={(e) => dispatch({ type: "SET_FIELD", field: "horaInicio", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Hora inicio" /></div>
            <div><label htmlFor="np-hora-fin" className="mb-1 block text-xs font-semibold text-muted-foreground">Hora fin</label><input id="np-hora-fin" type="time" value={form.horaFin} onChange={(e) => dispatch({ type: "SET_FIELD", field: "horaFin", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Hora fin" /></div>
          </div>

          <Section title="Mantenimiento de hardware"><ChecklistTable items={HARDWARE_CHECKLIST} estados={form.hardwareEstados} observaciones={form.hardwareObs}
            onEstadoChange={(it, v) => dispatch({ type: "SET_FIELD", field: "hardwareEstados", value: { ...form.hardwareEstados, [it]: v } })}
            onObsChange={(it, v) => dispatch({ type: "SET_FIELD", field: "hardwareObs", value: { ...form.hardwareObs, [it]: v } })} /></Section>
          <Section title="Mantenimiento de software"><ChecklistTable items={SOFTWARE_CHECKLIST} estados={form.softwareEstados} observaciones={form.softwareObs}
            onEstadoChange={(it, v) => dispatch({ type: "SET_FIELD", field: "softwareEstados", value: { ...form.softwareEstados, [it]: v } })}
            onObsChange={(it, v) => dispatch({ type: "SET_FIELD", field: "softwareObs", value: { ...form.softwareObs, [it]: v } })} /></Section>
          <Section title="Pruebas de funcionamiento"><ChecklistTable items={PRUEBAS_CHECKLIST} estados={form.pruebasEstados} observaciones={form.pruebasObs}
            onEstadoChange={(it, v) => dispatch({ type: "SET_FIELD", field: "pruebasEstados", value: { ...form.pruebasEstados, [it]: v } })}
            onObsChange={(it, v) => dispatch({ type: "SET_FIELD", field: "pruebasObs", value: { ...form.pruebasObs, [it]: v } })} /></Section>

          <Section title="Registro de incidencias">
            <div className="space-y-2">
              {form.incidencias.map((inc, i) => (
                <div key={inc.problema + inc.seguimiento} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 md:grid-cols-[1fr_1fr_auto]">
                  <input placeholder="Problema encontrado" value={inc.problema} onChange={(e) => dispatch({ type: "SET_FIELD", field: "incidencias", value: form.incidencias.map((x: any, j: number) => j === i ? { ...x, problema: e.target.value } : x) })} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs" aria-label="Problema encontrado" />
                  <input placeholder="Acción realizada" value={inc.accion} onChange={(e) => dispatch({ type: "SET_FIELD", field: "incidencias", value: form.incidencias.map((x: any, j: number) => j === i ? { ...x, accion: e.target.value } : x) })} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs" aria-label="Acción realizada" />
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={inc.seguimiento} onChange={(e) => dispatch({ type: "SET_FIELD", field: "incidencias", value: form.incidencias.map((x: any, j: number) => j === i ? { ...x, seguimiento: e.target.checked } : x) })} className="size-4 rounded accent-teal" aria-label="Seguimiento" />
                    Seguimiento
                  </label>
                </div>
              ))}
              {form.incidencias.length < 3 && <button type="button" onClick={() => dispatch({ type: "SET_FIELD", field: "incidencias", value: [...form.incidencias, { problema: "", accion: "", seguimiento: false }] })} className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline"><Plus className="size-3.5" /> Agregar incidencia</button>}
            </div>
          </Section>

          <Section title="Insumos utilizados">
            <div className="overflow-hidden rounded-lg border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-3 py-2 font-semibold">Insumo</th><th aria-label="Acción"></th></tr></thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {form.insumosUsados.map((row: any, i: number) => (
                    <tr key={row.insumo}>
                      <td className="px-3 py-2">
                        <select value={row.insumo} onChange={(e) => dispatch({ type: "SET_FIELD", field: "insumosUsados", value: form.insumosUsados.map((x: any, j: number) => j === i ? { insumo: e.target.value } : x) })} className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs" aria-label="Insumo">
                          <option value="">Selecciona…</option>
                          {INSUMOS.map((x) => <option key={x.nombre}>{x.nombre}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right"><button type="button" onClick={() => dispatch({ type: "SET_FIELD", field: "insumosUsados", value: form.insumosUsados.filter((_: any, j: number) => j !== i) })} className="text-danger"><Trash2 className="size-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => dispatch({ type: "SET_FIELD", field: "insumosUsados", value: [...form.insumosUsados, { insumo: "" }] })} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline"><Plus className="size-3.5" /> Agregar insumo</button>
          </Section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label htmlFor="np-obs" className="mb-1 block text-xs font-semibold text-muted-foreground">Observaciones generales</label><textarea id="np-obs" rows={3} value={form.observaciones} onChange={(e) => dispatch({ type: "SET_FIELD", field: "observaciones", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Notas generales..." aria-label="Observaciones generales" /></div>
            <div><label htmlFor="np-rec" className="mb-1 block text-xs font-semibold text-muted-foreground">Recomendaciones</label><textarea id="np-rec" rows={3} value={form.recomendaciones} onChange={(e) => dispatch({ type: "SET_FIELD", field: "recomendaciones", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Sugerencias..." aria-label="Recomendaciones" /></div>
          </div>

          <Section title="Estado del mantenimiento">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {ESTADOS.map((s) => {
                const active = form.estado === s.id;
                return (
                  <button type="button" key={s.id}  onClick={() => dispatch({ type: "SET_FIELD", field: "estado", value: s.id })}
                    className={cn("rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all",
                      active ? s.cls : "border-slate-200 text-muted-foreground hover:border-slate-300")}>
                    {s.id}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Puedes guardar como <strong>Pendiente</strong> para retomar el trabajo mas tarde, o como <strong>En proceso</strong> / <strong>Completado</strong>.
            </p>
          </Section>

          <div className="flex flex-col items-stretch gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
            {!initial && <button type="button" onClick={reset} className="text-sm font-semibold text-teal hover:underline">Limpiar formulario</button>}
            <button type="button" onClick={handleSave} className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-bold text-white hover:bg-navy/90 md:w-auto">
              <Save className="size-4" /> {initial ? "Actualizar mantenimiento" : `Guardar como ${form.estado}`}
            </button>
          </div>
        </div>
      </Panel>

      <Modal open={form.historialOpen} onOpenChange={(v) => dispatch({ type: "SET_FIELD", field: "historialOpen", value: v })} title={`Historial de mantenimientos - ${form.equipo || "—"}`} size="lg">
        {historialEq.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Este equipo no tiene mantenimientos previos registrados.</p>
        ) : (
          <div className="space-y-2">
            {historialEq.map((d) => (
              <button type="button" key={d.id} onClick={() => { setDetalleSel(d); dispatch({ type: "SET_FIELD", field: "historialOpen", value: false }); }}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-teal hover:bg-teal-soft/30">
                <div>
                  <p className="text-sm font-bold text-navy">{d.tipo} · {d.fecha}</p>
                  <p className="text-xs text-muted-foreground">Tecnico: {d.tecnico} · Estado: {d.estado}</p>
                </div>
                <span className="text-xs font-semibold text-teal">Ver detalle →</span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      <MantDetalleModal detalle={detalleSel} open={!!detalleSel} onOpenChange={(v) => !v && setDetalleSel(null)} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h4 className="mb-2 text-xs font-semibold tracking-wider text-teal uppercase">{title}</h4>{children}</div>;
}
