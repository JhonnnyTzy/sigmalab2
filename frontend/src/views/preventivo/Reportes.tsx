import { useReducer } from "react";
import { toast } from "sonner";
import { Send, Inbox, CheckCircle2 } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { FormField, inputCls } from "@/components/sigmalab/Modal";
import { store, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const CATEGORIAS = ["Red", "Hardware", "Software", "Mobiliario", "Limpieza", "Eléctrico", "Otro"];
const ESTADO: Record<string, string> = { Nuevo: "bg-info-soft text-info", Visto: "bg-slate-100 text-slate-600", Resuelto: "bg-success-soft text-success" };

const EJEMPLOS = [
  "Cables de red desconectados detrás del rack del lab 1, piso 3",
  "Pantalla azul intermitente en la PC 5 del laboratorio 1",
  "No funciona el ventilador trasero de la PC 8 del Lab 2",
  "Pizarra del Lab 3 piso 2 se encuentra sucia y rayada",
];

export function ReportesPreventivoView() {
  const labs = useStore((s) => s.labs);
  const reportes = useStore((s) => s.reportesPasante);
  const [form, dispatch] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { titulo: "", descripcion: "", laboratorio: "", ubicacion: "", categoria: "Hardware", prioridad: "Media" as "Alta" | "Media" | "Baja" }
  );

  const enviar = () => {
    if (!form.titulo.trim() || !form.descripcion.trim() || !form.laboratorio) { toast.error("Título, descripción y laboratorio son requeridos"); return; }
    store.addReportePasante({
      id: `RP-${Date.now()}`,
      pasante: "ysarzuri",
      titulo: form.titulo, descripcion: form.descripcion, laboratorio: form.laboratorio, ubicacion: form.ubicacion, categoria: form.categoria, prioridad: form.prioridad,
      fecha: new Date().toLocaleDateString("es-BO"),
      estado: "Nuevo",
    });
    toast.success("Reporte enviado al Encargado ITIC");
    dispatch({ type: "SET_FIELD", field: "titulo", value: "" });
    dispatch({ type: "SET_FIELD", field: "descripcion", value: "" });
    dispatch({ type: "SET_FIELD", field: "ubicacion", value: "" });
  };

  const misReportes = reportes.filter((r) => r.pasante === "ysarzuri");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Reportes</h1>
        <p className="text-sm text-muted-foreground">Envía observaciones e incidencias menores al Encargado ITIC</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Panel title="Nuevo reporte">
            <div className="space-y-4">
              <FormField label="Título" required>
                <input value={form.titulo} onChange={(e) => dispatch({ type: "SET_FIELD", field: "titulo", value: e.target.value })} placeholder="Ej. Cables de red desconectados en Lab 1" className={inputCls} aria-label="Título" />
              </FormField>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Laboratorio" required>
                  <select value={form.laboratorio} onChange={(e) => dispatch({ type: "SET_FIELD", field: "laboratorio", value: e.target.value })} className={inputCls} aria-label="Laboratorio">
                    <option value="">Selecciona…</option>
                    {labs.map((l) => <option key={l.id} value={l.nombre}>{l.nombre}</option>)}
                  </select>
                </FormField>
                <FormField label="Ubicación específica">
                  <input value={form.ubicacion} onChange={(e) => dispatch({ type: "SET_FIELD", field: "ubicacion", value: e.target.value })} placeholder="Piso 1, fila A puesto 5..." className={inputCls} aria-label="Ubicación específica" />
                </FormField>
                <FormField label="Categoría">
                  <select value={form.categoria} onChange={(e) => dispatch({ type: "SET_FIELD", field: "categoria", value: e.target.value })} className={inputCls} aria-label="Categoría">
                    {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Prioridad">
                  <select value={form.prioridad} onChange={(e) => dispatch({ type: "SET_FIELD", field: "prioridad", value: e.target.value as "Alta" | "Media" | "Baja" })} className={inputCls} aria-label="Prioridad">
                    <option>Alta</option><option>Media</option><option>Baja</option>
                  </select>
                </FormField>
              </div>
              <FormField label="Descripción detallada" required>
                <textarea rows={5} value={form.descripcion} onChange={(e) => dispatch({ type: "SET_FIELD", field: "descripcion", value: e.target.value })} placeholder="Describe el problema o la observación con todos los detalles posibles..." className={inputCls} aria-label="Descripción detallada" />
              </FormField>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">💡 Ejemplos:</p>
                <div className="flex flex-wrap gap-1.5">
                  {EJEMPLOS.map((e) => (
                    <button type="button" key={e}  onClick={() => dispatch({ type: "SET_FIELD", field: "descripcion", value: e })} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-teal hover:text-teal">
                      {e.slice(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={enviar} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-bold text-white hover:bg-navy/90">
                <Send className="size-4" /> Enviar reporte al Encargado
              </button>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-2">
          <Panel title={`Mis reportes enviados (${misReportes.length})`}>
            {misReportes.length === 0 ? (
              <div className="py-8 text-center"><Inbox className="mx-auto mb-2 size-7 text-muted-foreground" /><p className="text-xs text-muted-foreground">Aún no has enviado reportes</p></div>
            ) : (
              <ul className="space-y-2">
                {misReportes.map((r) => (
                  <li key={r.id} className="rounded-lg border border-slate-100 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", ESTADO[r.estado])}>{r.estado}</span>
                      {r.estado === "Resuelto" && <CheckCircle2 className="size-3.5 text-success" />}
                      <span className="ml-auto text-[10px] text-muted-foreground">{r.fecha}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-navy">{r.titulo}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{r.laboratorio} · {r.categoria}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
