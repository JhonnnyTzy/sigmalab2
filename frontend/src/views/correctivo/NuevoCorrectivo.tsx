import { useMemo, useRef, useState, useEffect, useReducer } from "react";
import { toast } from "sonner";
import { Plus, Trash2, History, Search, X } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { MantDetalleModal } from "@/components/sigmalab/MantDetalleModal";
import { INSUMOS, COMPONENTES_AFECTADOS } from "@/lib/sigmalab-data";
import { store, useStore, correctivoPrefill, type MantDetalle, type CorrectivoPrefill } from "@/lib/store";
import { cn } from "@/lib/utils";

const PROBLEMAS_COMUNES = [
  "Pantalla azul",
  "Calentamiento excesivo",
  "Problemas con el cooler",
  "Ruido de la fuente",
  "No reconoce disco",
  "No enciende",
  "Pérdida de red",
  "Lentitud extrema",
  "Otro",
];

export function NuevoCorrectivoView() {
  const labs = useStore((s) => s.labs);
  const equipos = useStore((s) => s.equipos);
  const detalles = useStore((s) => s.detalles);
  const histCorrectivos = useStore((s) => s.histCorrectivos);
  const asignaciones = useStore((s) => s.asignaciones);

  // Consume prefill synchronously during first render
  const prefRef = useRef<CorrectivoPrefill | null>(null);
  if (prefRef.current === null) {
    prefRef.current = correctivoPrefill.consume();
  }
  const p = prefRef.current;

  const [editKey, setEditKey] = useState<{ equipo: string; fecha: string; tecnico: string } | null>(
    p?.histKey ? { equipo: p.equipo!, fecha: p.fecha!, tecnico: "Jhonny Arias" } : null,
  );
  const asignacionRef = useRef(p?.asignacionId ?? null);
  const sugRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  const [form, dispatch] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    {
      equipo: p?.equipo ?? "",
      busq: "",
      showSug: false,
      labFiltro: "",
      tipo: p?.tipoIncidencia ?? "Hardware",
      problemaTitulo: p?.problemaTitulo && PROBLEMAS_COMUNES.includes(p.problemaTitulo) ? p.problemaTitulo : "",
      problemaCustom: p?.problemaTitulo && !PROBLEMAS_COMUNES.includes(p.problemaTitulo) ? p.problemaTitulo : "",
      descripcion: p?.descripcion ?? "",
      diagnostico: p?.diagnostico ?? "",
      accion: p?.accion ?? "",
      observaciones: p?.observaciones ?? "",
      fecha: p?.fecha ?? today,
      hora: p?.hora ?? "10:30",
      seguimiento: false,
      estado: (p?.estado ?? "En proceso") as "Completado" | "En proceso" | "Pendiente",
      componentes: (p?.componentes ?? []) as string[],
      otroComp: p?.componentesOtro ?? "",
      insumos: (p?.insumos?.length ? p.insumos : [{ insumo: "" }]) as { insumo: string }[],
      verHist: false,
    }
  );
  const [detSel, setDetSel] = useState<MantDetalle | null>(null);
  const [verHist, setVerHist] = useState(false);

  const equipoObj = useMemo(() => equipos.find((e) => e.codigo === form.equipo) ?? null, [equipos, form.equipo]);
  const labObj = useMemo(() => labs.find((l) => l.id === equipoObj?.lab), [labs, equipoObj]);

  const busq = form.busq;
  const labFiltro = form.labFiltro;
  // Sugerencias búsqueda equipo
  const sugerencias = useMemo(() => {
    const q = busq.trim().toLowerCase();
    const base = labFiltro ? equipos.filter((e) => e.lab === labFiltro) : equipos;
    if (!q) return labFiltro ? base.slice(0, 8) : [];
    return base.filter((e) =>
      e.codigo.toLowerCase().includes(q) ||
      e.nombre.toLowerCase().includes(q) ||
      e.serie.toLowerCase().includes(q) ||
      e.lab.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [equipos, busq, labFiltro]);

  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      if (sugRef.current && !sugRef.current.contains(ev.target as Node)) dispatch({ type: "SET_FIELD", field: "showSug", value: false });
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const currentEquipo = form.equipo;
  const histDelEquipo = useMemo(() => {
    if (!currentEquipo) return [] as MantDetalle[];
    const fromDet = detalles.filter((d) => d.equipo === currentEquipo);
    const fromHist = histCorrectivos.reduce((acc, h) => {
      if (h.equipo === currentEquipo && !fromDet.some((d) => d.fecha === h.fecha && d.tipo === "Correctivo")) {
        acc.push({
          id: `hh-${h.fecha}-${h.equipo}`, tipo: "Correctivo" as const, equipo: h.equipo,
          lab: equipos.find((e) => e.codigo === h.equipo)?.lab ?? "—",
          tecnico: h.tecnico, fecha: h.fecha, estado: h.estado, descripcion: h.problema, accion: h.accion,
        });
      }
      return acc;
    }, [] as MantDetalle[]);
    return [...fromDet, ...fromHist];
  }, [currentEquipo, detalles, histCorrectivos, equipos]);

  const toggleComp = (c: string) => dispatch({
    type: "SET_FIELD",
    field: "componentes",
    value: form.componentes.includes(c) ? form.componentes.filter((x: string) => x !== c) : [...form.componentes, c],
  });

  const tituloFinal = form.problemaTitulo === "Otro" ? (form.problemaCustom.trim() || "Otro") : form.problemaTitulo;

  const handleSave = () => {
    if (!form.equipo) { toast.error("Selecciona un equipo"); return; }
    if (!form.descripcion.trim() && form.estado !== "Pendiente") { toast.error("Agrega una descripción del problema"); return; }
    const fechaFmt = form.fecha.split("-").reverse().join("/");
    const tecnico = "Jhonny Arias";
    const compFinales = form.otroComp.trim() ? [...form.componentes.filter((c: string) => c !== "Otro"), form.otroComp.trim()] : form.componentes;
    const insumosClean = form.insumos.reduce((acc: any, i: any) => {
      if (i.insumo) acc.push({ insumo: i.insumo, cantidad: "", unidad: "" });
      return acc;
    }, [] as { insumo: string; cantidad: string; unidad: string }[]);
    const problema = tituloFinal ? `${tituloFinal}${form.descripcion ? ` — ${form.descripcion}` : ""}` : form.descripcion;

    if (editKey) {
      store.updateCorrectivo(
        editKey,
        { problema, accion: form.accion || "—", estado: form.estado, fecha: fechaFmt },
        { tipoIncidencia: form.tipo, diagnostico: form.diagnostico, componentes: compFinales, insumos: insumosClean, observaciones: form.observaciones, descripcion: form.descripcion, accion: form.accion, resolucion: form.estado },
      );
      toast.success("Mantenimiento actualizado");
    } else {
      store.addCorrectivo(
        { fecha: fechaFmt, equipo: form.equipo, problema, accion: form.accion || "—", estado: form.estado, tecnico },
        form.equipo, equipoObj?.estado ?? "En mantenimiento",
        { tipoIncidencia: form.tipo, diagnostico: form.diagnostico, componentes: compFinales, insumos: insumosClean, observaciones: form.observaciones, descripcion: form.descripcion, resolucion: form.estado },
      );
      toast.success(form.estado === "Pendiente" ? "Avance guardado como pendiente" : "Mantenimiento registrado");
    }
    if (asignacionRef.current) {
      store.updateAsignacion(asignacionRef.current, { estado: form.estado });
      setEditKey(null); asignacionRef.current = null;
    } else {
      const asig = asignaciones.find((a) => a.equipo === form.equipo && a.asignadoA === "jarias" && a.estado !== "Completado");
      if (asig) store.updateAsignacion(asig.id, { estado: form.estado });
    }
    // limpiar
    setEditKey(null);
    dispatch({ type: "SET_FIELD", field: "equipo", value: "" });
    dispatch({ type: "SET_FIELD", field: "busq", value: "" });
    dispatch({ type: "SET_FIELD", field: "descripcion", value: "" });
    dispatch({ type: "SET_FIELD", field: "diagnostico", value: "" });
    dispatch({ type: "SET_FIELD", field: "accion", value: "" });
    dispatch({ type: "SET_FIELD", field: "observaciones", value: "" });
    dispatch({ type: "SET_FIELD", field: "problemaTitulo", value: "" });
    dispatch({ type: "SET_FIELD", field: "problemaCustom", value: "" });
    dispatch({ type: "SET_FIELD", field: "componentes", value: [] });
    dispatch({ type: "SET_FIELD", field: "otroComp", value: "" });
    dispatch({ type: "SET_FIELD", field: "insumos", value: [{ insumo: "" }] });
    dispatch({ type: "SET_FIELD", field: "estado", value: "En proceso" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Nuevo Mantenimiento</h1>
        <p className="text-sm text-muted-foreground">{editKey ? "Editando mantenimiento existente" : "Registra un mantenimiento correctivo"}</p>
      </div>

      <FormularioCorrectivoPanel
        form={form} dispatch={dispatch} editKey={editKey}
        labs={labs} equipos={equipos}
        equipoObj={equipoObj} labObj={labObj}
        sugRef={sugRef} sugerencias={sugerencias}
        toggleComp={toggleComp} handleSave={handleSave}
        setVerHist={setVerHist}
      />

      <HistorialCorrectivoModal
        open={verHist} onOpenChange={setVerHist}
        equipo={form.equipo}
        items={histDelEquipo}
        onVerDetalle={(h) => { setDetSel(h); setVerHist(false); }}
      />
      <MantDetalleModal detalle={detSel} open={!!detSel} onOpenChange={(v) => !v && setDetSel(null)} />
    </div>
  );
}

function HistorialCorrectivoModal({ open, onOpenChange, equipo, items, onVerDetalle }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  equipo: string; items: MantDetalle[];
  onVerDetalle: (h: MantDetalle) => void;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg"
      title={`Historial de ${equipo || ""}`}
      description="Mantenimientos previos del equipo seleccionado"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Sin historial previo para este equipo</p>
      ) : (
        <ul className="space-y-2">
          {items.map((h) => (
            <li key={h.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3 hover:bg-slate-50">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", h.tipo === "Preventivo" ? "bg-teal-soft text-teal" : "bg-warning-soft text-warning")}>{h.tipo}</span>
                  <span className="text-xs text-muted-foreground">{h.fecha} · {h.tecnico}</span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs">{h.descripcion ?? h.observaciones ?? "—"}</p>
              </div>
              <button type="button" onClick={() => onVerDetalle(h)} className="shrink-0 rounded-md border border-teal px-2 py-1 text-xs font-semibold text-teal hover:bg-teal-soft">Detalle</button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h4 className="mb-2 text-xs font-semibold tracking-wider text-warning uppercase">{title}</h4>{children}</div>;
}

function FormularioCorrectivoPanel({ form, dispatch, editKey, labs, equipos, equipoObj, labObj, sugRef, sugerencias, toggleComp, handleSave, setVerHist }: {
  form: any; dispatch: React.Dispatch<any>; editKey: any;
  labs: any[]; equipos: any[];
  equipoObj: any; labObj: any;
  sugRef: React.RefObject<HTMLDivElement | null>; sugerencias: any[];
  toggleComp: (c: string) => void; handleSave: () => void;
  setVerHist: (v: boolean) => void;
}) {
  return (
    <Panel title="Registrar mantenimiento correctivo">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="nc-lab" className="mb-1 block text-xs font-semibold text-muted-foreground">Laboratorio</label>
            <select id="nc-lab"
              value={form.labFiltro}
              onChange={(e) => { dispatch({ type: "SET_FIELD", field: "labFiltro", value: e.target.value }); dispatch({ type: "SET_FIELD", field: "equipo", value: "" }); dispatch({ type: "SET_FIELD", field: "busq", value: "" }); }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              aria-label="Laboratorio"
            >
              <option value="">Todos los laboratorios</option>
              {labs.map((l: any) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">Filtra los equipos por laboratorio antes de buscar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2" ref={sugRef}>
            <label htmlFor="nc-equipo" className="mb-1 block text-xs font-semibold text-muted-foreground">Equipo (busca por código PC, UMSA, ITIC o facultativo)</label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <input id="nc-equipo"
                  value={form.busq}
                  onChange={(e) => { dispatch({ type: "SET_FIELD", field: "busq", value: e.target.value }); dispatch({ type: "SET_FIELD", field: "showSug", value: true }); dispatch({ type: "SET_FIELD", field: "equipo", value: "" }); }}
                  onFocus={() => dispatch({ type: "SET_FIELD", field: "showSug", value: true })}
                  placeholder="Ej: PC-LAB1, UMSA-INF, SAM2245..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-9 pl-9 text-sm"
                  aria-label="Buscar equipo"
                />
              {form.equipo && <button type="button" onClick={() => { dispatch({ type: "SET_FIELD", field: "equipo", value: "" }); dispatch({ type: "SET_FIELD", field: "busq", value: "" }); }} className="absolute top-2.5 right-3 text-muted-foreground hover:text-navy"><X className="size-4" /></button>}
              {form.showSug && sugerencias.length > 0 && !form.equipo && (
                <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {sugerencias.map((s: any) => (
                    <button type="button" key={s.codigo}
                      onClick={() => { dispatch({ type: "SET_FIELD", field: "equipo", value: s.codigo }); dispatch({ type: "SET_FIELD", field: "busq", value: `${s.codigo} — ${s.nombre}` }); dispatch({ type: "SET_FIELD", field: "showSug", value: false }); }}
                      className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left hover:bg-slate-50">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-teal">{s.codigo}</p>
                        <p className="truncate text-xs text-navy">{s.nombre}</p>
                      </div>
                      <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[10px] uppercase text-muted-foreground">{s.lab}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {equipoObj && (
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-mono font-bold text-teal">{equipoObj.codigo}</span> · {equipoObj.nombre} · {labObj?.nombre ?? equipoObj.lab}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <button type="button" disabled={!form.equipo} onClick={() => setVerHist(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-teal px-3 py-2 text-sm font-semibold text-teal hover:bg-teal-soft disabled:opacity-40">
              <History className="size-4" /> Ver historial
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div><label htmlFor="nc-fecha" className="mb-1 block text-xs font-semibold text-muted-foreground">Fecha</label><input id="nc-fecha" type="date" value={form.fecha} onChange={(e) => dispatch({ type: "SET_FIELD", field: "fecha", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Fecha" /></div>
          <div><label htmlFor="nc-hora" className="mb-1 block text-xs font-semibold text-muted-foreground">Hora</label><input id="nc-hora" type="time" value={form.hora} onChange={(e) => dispatch({ type: "SET_FIELD", field: "hora", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Hora" /></div>
          <div>
            <label htmlFor="nc-tipo" className="mb-1 block text-xs font-semibold text-muted-foreground">Tipo de incidencia</label>
            <select id="nc-tipo" value={form.tipo} onChange={(e) => dispatch({ type: "SET_FIELD", field: "tipo", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Tipo de incidencia">
              <option>Hardware</option><option>Software</option><option>Red</option><option>Periférico</option><option>Otro</option>
            </select>
          </div>
        </div>

        <Section title="Detalle de la incidencia">
          <div className="space-y-3">
            <div>
              <label htmlFor="nc-problema" className="mb-1 block text-xs font-semibold text-muted-foreground">Problema</label>
              <select id="nc-problema" value={form.problemaTitulo} onChange={(e) => dispatch({ type: "SET_FIELD", field: "problemaTitulo", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Problema común">
                <option value="">Selecciona un problema común…</option>
                {PROBLEMAS_COMUNES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {form.problemaTitulo === "Otro" && (
                <input value={form.problemaCustom} onChange={(e) => dispatch({ type: "SET_FIELD", field: "problemaCustom", value: e.target.value })} placeholder="Escribe el título de tu incidencia..." className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Título de incidencia" />
              )}
            </div>
            <div><label htmlFor="nc-desc" className="mb-1 block text-xs font-semibold text-muted-foreground">Descripción del problema</label><textarea id="nc-desc" rows={4} value={form.descripcion} onChange={(e) => dispatch({ type: "SET_FIELD", field: "descripcion", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Descripción del problema" /></div>
            <div><label htmlFor="nc-dx" className="mb-1 block text-xs font-semibold text-muted-foreground">Diagnóstico técnico</label><textarea id="nc-dx" rows={3} value={form.diagnostico} onChange={(e) => dispatch({ type: "SET_FIELD", field: "diagnostico", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Diagnóstico técnico" /></div>
            <div><label htmlFor="nc-accion" className="mb-1 block text-xs font-semibold text-muted-foreground">Acción realizada</label><textarea id="nc-accion" rows={3} value={form.accion} onChange={(e) => dispatch({ type: "SET_FIELD", field: "accion", value: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Acción realizada" /></div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-navy">
                <input type="checkbox" checked={form.seguimiento} onChange={(e) => dispatch({ type: "SET_FIELD", field: "seguimiento", value: e.target.checked })} className="size-4 accent-teal" aria-label="Requiere seguimiento" />¿Requiere seguimiento?
              </label>
              {form.seguimiento && <input type="date" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm" aria-label="Fecha de seguimiento" />}
            </div>
          </div>
        </Section>

        <Section title="Componentes afectados">
          <div className="flex flex-wrap gap-2">
            {COMPONENTES_AFECTADOS.map((c) => {
              const active = form.componentes.includes(c);
              return <button type="button" key={c}  onClick={() => toggleComp(c)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", active ? "border-warning bg-warning text-white" : "border-slate-200 bg-white text-muted-foreground hover:border-warning hover:text-warning")}>{c}</button>;
            })}
          </div>
          {form.componentes.includes("Otro") && (
            <input value={form.otroComp} onChange={(e) => dispatch({ type: "SET_FIELD", field: "otroComp", value: e.target.value })} placeholder="Especifica el componente (otro)..." className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:max-w-md" aria-label="Otro componente" />
          )}
        </Section>

        <Section title="Insumos utilizados">
          <div className="overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-3 py-2">Insumo</th><th aria-label="Acción"></th></tr></thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {form.insumos.map((row: any, i: number) => (
                  <tr key={row.insumo}>
                    <td className="px-3 py-2">
                      <select value={row.insumo} onChange={(e) => dispatch({ type: "SET_FIELD", field: "insumos", value: form.insumos.map((x: any, j: number) => j === i ? { ...x, insumo: e.target.value } : x) })} className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs" aria-label="Insumo">
                        <option value="">Selecciona…</option>
                        {INSUMOS.map((x) => <option key={x.nombre}>{x.nombre}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right"><button type="button" onClick={() => dispatch({ type: "SET_FIELD", field: "insumos", value: form.insumos.filter((_: any, j: number) => j !== i) })} className="text-danger"><Trash2 className="size-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => dispatch({ type: "SET_FIELD", field: "insumos", value: [...form.insumos, { insumo: "" }] })} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline"><Plus className="size-3.5" />Agregar insumo</button>
        </Section>

        <Section title="Observaciones generales">
          <textarea rows={3} value={form.observaciones} onChange={(e) => dispatch({ type: "SET_FIELD", field: "observaciones", value: e.target.value })} placeholder="Observaciones, recomendaciones para el equipo, próximos pasos..." className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Observaciones generales" />
        </Section>

        <Section title="Estado del mantenimiento">
          <select value={form.estado} onChange={(e) => dispatch({ type: "SET_FIELD", field: "estado", value: e.target.value as typeof form.estado })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:max-w-md" aria-label="Estado del mantenimiento">
            <option value="Completado">Completado</option>
            <option value="En proceso">En proceso</option>
            <option value="Pendiente">Pendiente</option>
          </select>
          <p className="mt-1 text-xs text-muted-foreground">Puedes guardar el avance en cualquier estado (incluso Pendiente).</p>
        </Section>

        <button type="button" onClick={handleSave} className="w-full rounded-lg bg-warning px-6 py-3 text-sm font-bold text-white hover:opacity-90">
          {editKey ? "Actualizar mantenimiento" : (form.estado === "Pendiente" ? "Guardar avance (Pendiente)" : "Guardar mantenimiento")}
        </button>
      </div>
    </Panel>
  );
}
