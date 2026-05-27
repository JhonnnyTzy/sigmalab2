import { useReducer } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { store, useStore } from "@/lib/store";
import { useAuth, ROLE_LABEL } from "@/lib/auth";

const PRIORIDADES = ["Alta", "Media", "Baja"] as const;
const CATEGORIAS = ["Hardware", "Software", "Red", "Periférico", "Otro"];

const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export function CrearIncidenciaView() {
  const { user } = useAuth();
  const labs = useStore((s) => s.labs);
  const equipos = useStore((s) => s.equipos);

  const [form, dispatch] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { equipo: "", lab: "", titulo: "", descripcion: "", categoria: CATEGORIAS[0], prioridad: "Media" as typeof PRIORIDADES[number] }
  );

  const submit = () => {
    if (!form.titulo.trim() || !form.descripcion.trim() || !form.lab) {
      toast.error("Completa título, descripción y laboratorio");
      return;
    }
    const id = `RP-${Date.now()}`;
    store.addReportePasante({
      id,
      pasante: user ? `${user.nombres} ${user.paterno}` : "anónimo",
      pasanteId: user?.id,
      rolReporte: user?.role,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      laboratorio: form.lab,
      ubicacion: form.equipo || "—",
      categoria: form.categoria,
      prioridad: form.prioridad,
      fecha: today(),
      estado: "Nuevo",
    });
    toast.success("Incidencia enviada al Encargado ITIC");
    dispatch({ type: "SET_FIELD", field: "titulo", value: "" });
    dispatch({ type: "SET_FIELD", field: "descripcion", value: "" });
    dispatch({ type: "SET_FIELD", field: "equipo", value: "" });
    dispatch({ type: "SET_FIELD", field: "lab", value: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Crear incidencia</h1>
        <p className="text-sm text-muted-foreground">
          Reporta un problema en un equipo o laboratorio. Sesión: {user ? ROLE_LABEL[user.role] : "—"}.
        </p>
      </div>

      <Panel title="Datos de la incidencia">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Laboratorio" required>
            <select value={form.lab} onChange={(e) => dispatch({ type: "SET_FIELD", field: "lab", value: e.target.value })} className={inputCls} aria-label="Laboratorio">
              <option value="">Selecciona…</option>
              {labs.map((l) => <option key={l.id} value={l.nombre}>{l.nombre}</option>)}
            </select>
          </FormField>
          <FormField label="Equipo (opcional)">
            <select value={form.equipo} onChange={(e) => dispatch({ type: "SET_FIELD", field: "equipo", value: e.target.value })} className={inputCls} aria-label="Equipo">
              <option value="">- sin equipo específico -</option>
              {equipos.map((e) => <option key={e.codigo} value={e.codigo}>{e.codigo} - {e.nombre}</option>)}
            </select>
          </FormField>
          <FormField label="Categoría">
            <select value={form.categoria} onChange={(e) => dispatch({ type: "SET_FIELD", field: "categoria", value: e.target.value })} className={inputCls} aria-label="Categoría">
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Prioridad">
            <select value={form.prioridad} onChange={(e) => dispatch({ type: "SET_FIELD", field: "prioridad", value: e.target.value as typeof PRIORIDADES[number] })} className={inputCls} aria-label="Prioridad">
              {PRIORIDADES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Título" required>
              <input value={form.titulo} onChange={(e) => dispatch({ type: "SET_FIELD", field: "titulo", value: e.target.value })} className={inputCls} placeholder="Ej: Equipo no enciende" aria-label="Título" />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Descripción" required>
              <textarea value={form.descripcion} onChange={(e) => dispatch({ type: "SET_FIELD", field: "descripcion", value: e.target.value })} rows={4} className={inputCls} placeholder="Describe lo que ocurre, cuándo empezó, etc." aria-label="Descripción" />
            </FormField>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={submit} className="bg-navy"><Send className="mr-2 size-4" /> Enviar incidencia</Button>
        </div>
      </Panel>
    </div>
  );
}
