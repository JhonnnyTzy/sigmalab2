import { useState, useReducer } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Search, Pencil } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { store, useStore, type Periferico } from "@/lib/store";
import { useIsReadOnly } from "@/lib/auth";

const TIPOS = ["Monitor", "Teclado", "Mouse", "Impresora", "Proyector", "Switch", "Router", "Scanner", "Otro"];
const ESTADOS = ["Funcionando", "En mantenimiento", "De baja"];
const EMPTY: Periferico = { id: "", tipo: "Monitor", marca: "", modelo: "", serie: "", asignadoA: "", estado: "Funcionando" };

export function PerifericosView() {
  const perifericos = useStore((s) => s.perifericos);
  const readOnly = useIsReadOnly();
  const [filtros, dispatchFiltros] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { q: "", tipo: "" }
  );
  const [modal, dispatchModal] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { creating: false, editing: null, deleting: null }
  );
  const [form, setForm] = useState<Periferico>(EMPTY);

  const filtered = perifericos.filter((p) =>
    (!filtros.tipo || p.tipo === filtros.tipo) &&
    (!filtros.q || p.id.toLowerCase().includes(filtros.q.toLowerCase()) || p.marca.toLowerCase().includes(filtros.q.toLowerCase())),
  );

  const openCreate = () => {
    const next = String(perifericos.length + 200).padStart(3, "0");
    setForm({ ...EMPTY, id: `UMSA-INF-2024-${next}` });
    dispatchModal({ type: "SET_FIELD", field: "creating", value: true });
  };
  const openEdit = (p: Periferico) => { setForm(p); dispatchModal({ type: "SET_FIELD", field: "editing", value: p }); };
  const submit = () => {
    if (!form.id || !form.marca) { toast.error("Código y marca requeridos"); return; }
    if (modal.creating) {
      if (perifericos.some((p) => p.id === form.id)) { toast.error("Código ya existe"); return; }
      store.addPeriferico(form); toast.success("Periférico registrado"); dispatchModal({ type: "SET_FIELD", field: "creating", value: false });
    } else if (modal.editing) {
      store.updatePeriferico(modal.editing.id, form); toast.success("Periférico actualizado"); dispatchModal({ type: "SET_FIELD", field: "editing", value: null });
    }
  };
  const confirmDelete = () => {
    if (!modal.deleting) return;
    store.deletePeriferico(modal.deleting.id); toast.success("Periférico eliminado"); dispatchModal({ type: "SET_FIELD", field: "deleting", value: null });
  };

  const FormBody = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField label="Cód. Inventario" required><input value={form.id} disabled={!!modal.editing} onChange={(e) => setForm({ ...form, id: e.target.value })} className={inputCls} aria-label="Código inventario" /></FormField>
      <FormField label="Tipo">
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className={inputCls} aria-label="Tipo">
          {TIPOS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </FormField>
      <FormField label="Marca" required><input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className={inputCls} aria-label="Marca" /></FormField>
      <FormField label="Modelo"><input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} className={inputCls} aria-label="Modelo" /></FormField>
      <FormField label="Serie"><input value={form.serie} onChange={(e) => setForm({ ...form, serie: e.target.value })} className={inputCls} aria-label="Serie" /></FormField>
      <FormField label="Asignado a"><input value={form.asignadoA} placeholder="PC-LAB1-001 o Lab 1" onChange={(e) => setForm({ ...form, asignadoA: e.target.value })} className={inputCls} aria-label="Asignado a" /></FormField>
      <FormField label="Estado">
        <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className={inputCls} aria-label="Estado">
          {ESTADOS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </FormField>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">Periféricos</h1>
          <p className="text-sm text-muted-foreground">Inventario de periféricos asignados</p>
        </div>
        {!readOnly && (
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90">
            <Plus className="size-4" /> Registrar Periférico
          </button>
        )}
      </div>

      <Panel title="Filtros">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select value={filtros.tipo} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "tipo", value: e.target.value })} className={inputCls} aria-label="Filtrar por tipo">
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <input value={filtros.q} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "q", value: e.target.value })} placeholder="Buscar por código o marca..." className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm" aria-label="Buscar periférico" />
          </div>
        </div>
      </Panel>

      <Panel title={`${filtered.length} periféricos`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Cód. Inventario</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Marca</th>
                <th className="px-4 py-3 font-semibold">Modelo</th>
                <th className="px-4 py-3 font-semibold">Serie</th>
                <th className="px-4 py-3 font-semibold">Asignado a</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/40 hover:bg-slate-50"}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-teal">{p.id}</td>
                  <td className="px-4 py-3 text-navy">{p.tipo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.marca}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.modelo}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.serie}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.asignadoA}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.estado} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {readOnly ? (
                        <span className="text-xs text-muted-foreground italic">Sólo lectura</span>
                      ) : (
                        <>
                          <button type="button" onClick={() => openEdit(p)} title="Editar" className="inline-flex size-8 items-center justify-center rounded-md border border-teal text-teal hover:bg-teal-soft">
                            <Pencil className="size-3.5" />
                          </button>
                          <button type="button" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: p })} title="Eliminar" className="inline-flex size-8 items-center justify-center rounded-md border border-danger text-danger hover:bg-danger-soft">
                            <Trash2 className="size-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modal.creating} onOpenChange={(v) => dispatchModal({ type: "SET_FIELD", field: "creating", value: v })} title="Registrar Periférico"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "creating", value: false })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Registrar</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!modal.editing} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "editing", value: null })} title={`Editar ${modal.editing?.id ?? ""}`}
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "editing", value: null })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Guardar</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!modal.deleting} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })} title="Eliminar periférico" size="sm"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></>}>
        <p className="text-sm text-muted-foreground">¿Eliminar <span className="font-semibold text-navy">{modal.deleting?.id}</span>?</p>
      </Modal>
    </div>
  );
}
