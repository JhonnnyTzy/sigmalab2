import { useState, useReducer } from "react";
import { toast } from "sonner";
import { Package, Plus, Minus, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { store, useStore, type InsumoStock } from "@/lib/store";
import { useIsReadOnly } from "@/lib/auth";
import { cn } from "@/lib/utils";

const EMPTY: InsumoStock = { nombre: "", unidad: "", stock: 0, minimo: 0 };

export function InsumosView() {
  const insumos = useStore((s) => s.insumos);
  const readOnly = useIsReadOnly();
  const [adjust, dispatchAdjust] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { adjusting: null, delta: "" }
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
  const [form, setForm] = useState<InsumoStock>(EMPTY);

  const apply = (sign: 1 | -1) => {
    if (!adjust.adjusting) return;
    const n = parseInt(adjust.delta, 10);
    if (isNaN(n) || n <= 0) { toast.error("Ingresa una cantidad válida"); return; }
    const newStock = Math.max(0, adjust.adjusting.stock + sign * n);
    store.updateInsumo(adjust.adjusting.nombre, { stock: newStock });
    toast.success(`Stock actualizado: ${adjust.adjusting.nombre} → ${newStock} ${adjust.adjusting.unidad}`);
    dispatchAdjust({ type: "SET_FIELD", field: "adjusting", value: null }); dispatchAdjust({ type: "SET_FIELD", field: "delta", value: "" });
  };

  const openCreate = () => { setForm(EMPTY); dispatchModal({ type: "SET_FIELD", field: "creating", value: true }); };
  const openEdit = (i: InsumoStock) => { setForm(i); dispatchModal({ type: "SET_FIELD", field: "editing", value: i }); };

  const submit = () => {
    if (!form.nombre || !form.unidad) { toast.error("Nombre y unidad requeridos"); return; }
    if (modal.creating) {
      if (insumos.some((i) => i.nombre === form.nombre)) { toast.error("Insumo ya existe"); return; }
      store.addInsumo({ ...form, stock: Number(form.stock) || 0, minimo: Number(form.minimo) || 0 });
      toast.success("Insumo agregado"); dispatchModal({ type: "SET_FIELD", field: "creating", value: false });
    } else if (modal.editing) {
      store.updateInsumo(modal.editing.nombre, { ...form, stock: Number(form.stock), minimo: Number(form.minimo) });
      toast.success("Insumo actualizado"); dispatchModal({ type: "SET_FIELD", field: "editing", value: null });
    }
  };

  const confirmDelete = () => {
    if (!modal.deleting) return;
    store.deleteInsumo(modal.deleting.nombre); toast.success("Insumo eliminado"); dispatchModal({ type: "SET_FIELD", field: "deleting", value: null });
  };

  const FormBody = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField label="Nombre" required><input value={form.nombre} disabled={!!modal.editing} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} aria-label="Nombre" /></FormField>
      <FormField label="Unidad" required><input value={form.unidad} placeholder="ml, unidades..." onChange={(e) => setForm({ ...form, unidad: e.target.value })} className={inputCls} aria-label="Unidad" /></FormField>
      <FormField label="Stock inicial"><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={inputCls} aria-label="Stock inicial" /></FormField>
      <FormField label="Mínimo"><input type="number" value={form.minimo} onChange={(e) => setForm({ ...form, minimo: Number(e.target.value) })} className={inputCls} aria-label="Mínimo" /></FormField>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">Insumos</h1>
          <p className="text-sm text-muted-foreground">Gestión de stock de materiales</p>
        </div>
        {!readOnly && (
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90">
            <Plus className="size-4" /> Nuevo Insumo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {insumos.map((i) => {
          const low = i.stock < i.minimo;
          return (
            <div key={i.nombre} className={cn("rounded-xl border bg-card p-5 shadow-sm", low ? "border-danger/40" : "border-slate-100")}>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Package className="size-4 text-teal" />
                    <p className="truncate font-semibold text-navy">{i.nombre}</p>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-navy">{i.stock} <span className="text-sm font-medium text-muted-foreground">{i.unidad}</span></p>
                  <p className="mt-1 text-xs text-muted-foreground">Mínimo: {i.minimo} {i.unidad}</p>
                </div>
                {low && <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2 py-1 text-[10px] font-semibold text-danger"><AlertTriangle className="size-3" />Bajo</span>}
              </div>
              {!readOnly && (
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => dispatchAdjust({ type: "SET_FIELD", field: "adjusting", value: i })} className="flex-1 rounded-lg border border-teal px-3 py-1.5 text-xs font-semibold text-teal hover:bg-teal-soft">Ajustar</button>
                  <button type="button" onClick={() => openEdit(i)} title="Editar" className="inline-flex size-8 items-center justify-center rounded-md border border-navy/40 text-navy hover:bg-slate-100"><Pencil className="size-3.5" /></button>
                  <button type="button" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: i })} title="Eliminar" className="inline-flex size-8 items-center justify-center rounded-md border border-danger text-danger hover:bg-danger-soft"><Trash2 className="size-3.5" /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={!!adjust.adjusting} onOpenChange={(v) => !v && dispatchAdjust({ type: "SET_FIELD", field: "adjusting", value: null })} title={`Ajustar: ${adjust.adjusting?.nombre ?? ""}`} size="sm"
        footer={<>
          <Button variant="outline" onClick={() => dispatchAdjust({ type: "SET_FIELD", field: "adjusting", value: null })}>Cancelar</Button>
          <Button variant="destructive" onClick={() => apply(-1)}><Minus className="mr-1 size-4" />Salida</Button>
          <Button onClick={() => apply(1)} className="bg-success hover:bg-success/90"><Plus className="mr-1 size-4" />Entrada</Button>
        </>}>
        <p className="text-sm text-muted-foreground">Stock actual: <span className="font-bold text-navy">{adjust.adjusting?.stock} {adjust.adjusting?.unidad}</span></p>
        <input type="number" value={adjust.delta} onChange={(e) => dispatchAdjust({ type: "SET_FIELD", field: "delta", value: e.target.value })} placeholder={`Cantidad en ${adjust.adjusting?.unidad ?? ""}`} className={inputCls} aria-label="Cantidad a ajustar" />
      </Modal>

      <Modal open={modal.creating} onOpenChange={(v) => dispatchModal({ type: "SET_FIELD", field: "creating", value: v })} title="Nuevo insumo"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "creating", value: false })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Agregar</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!modal.editing} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "editing", value: null })} title={`Editar ${modal.editing?.nombre ?? ""}`}
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "editing", value: null })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Guardar</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!modal.deleting} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })} title="Eliminar insumo" size="sm"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></>}>
        <p className="text-sm text-muted-foreground">¿Eliminar <span className="font-semibold text-navy">{modal.deleting?.nombre}</span>?</p>
      </Modal>
    </div>
  );
}
