import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { store, useStore, type Laboratorio } from "@/lib/store";
import { useIsReadOnly } from "@/lib/auth";

const EMPTY: Laboratorio = { id: "", nombre: "", edificio: "Edificio Principal", piso: 1, capEquipos: 20, capPersonas: 25 };

export function LaboratoriosView() {
  const labs = useStore((s) => s.labs);
  const readOnly = useIsReadOnly();
  const [editing, setEditing] = useState<Laboratorio | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Laboratorio | null>(null);
  const [form, setForm] = useState<Laboratorio>(EMPTY);

  const openCreate = () => { setForm({ ...EMPTY, id: `LAB${labs.length + 1}` }); setCreating(true); };
  const openEdit = (l: Laboratorio) => { setForm(l); setEditing(l); };

  const submit = async () => {
    if (!form.id || !form.nombre) { toast.error("ID y Nombre son requeridos"); return; }
    if (creating) {
      if (labs.some((l) => l.id === form.id)) { toast.error("ID ya existe"); return; }
      try {
        await store.addLab(form);
        toast.success("Laboratorio creado");
        setCreating(false);
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "Error al crear laboratorio");
      }
    } else if (editing) {
      try {
        await store.updateLab(editing.id, form);
        toast.success("Laboratorio actualizado");
        setEditing(null);
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "Error al actualizar laboratorio");
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await store.deleteLab(deleting.id);
      toast.success(`Laboratorio ${deleting.nombre} eliminado`);
      setDeleting(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Error al eliminar laboratorio");
    }
  };

  const FormBody = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField label="ID" required><input value={form.id} disabled={!!editing} onChange={(e) => setForm({ ...form, id: e.target.value })} className={inputCls} aria-label="ID" /></FormField>
      <FormField label="Nombre" required><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} aria-label="Nombre" /></FormField>
      <FormField label="Edificio">
        <select value={form.edificio} onChange={(e) => setForm({ ...form, edificio: e.target.value })} className={inputCls} aria-label="Edificio">
          <option>Edificio Principal</option><option>Edificio LASIN</option>
        </select>
      </FormField>
      <FormField label="Piso"><input type="number" value={form.piso} onChange={(e) => setForm({ ...form, piso: +e.target.value })} className={inputCls} aria-label="Piso" /></FormField>
      <FormField label="Cap. Equipos"><input type="number" value={form.capEquipos} onChange={(e) => setForm({ ...form, capEquipos: +e.target.value })} className={inputCls} aria-label="Capacidad equipos" /></FormField>
      <FormField label="Cap. Personas"><input type="number" value={form.capPersonas} onChange={(e) => setForm({ ...form, capPersonas: +e.target.value })} className={inputCls} aria-label="Capacidad personas" /></FormField>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">Laboratorios</h1>
          <p className="text-sm text-muted-foreground">Gestión de laboratorios ITIC</p>
        </div>
        {!readOnly && (
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90">
            <Plus className="size-4" /> Nuevo Laboratorio
          </button>
        )}
      </div>

      <Panel title={`${labs.length} laboratorios registrados`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Edificio</th>
                <th className="px-4 py-3 font-semibold">Piso</th>
                <th className="px-4 py-3 font-semibold">Cap. Equipos</th>
                <th className="px-4 py-3 font-semibold">Cap. Personas</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labs.map((l, i) => (
                <tr key={l.id} className={i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/40 hover:bg-slate-50"}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-teal">{l.id}</td>
                  <td className="px-4 py-3 font-medium text-navy">{l.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.edificio}</td>
                  <td className="px-4 py-3 text-muted-foreground">Piso {l.piso}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.capEquipos}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.capPersonas}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {readOnly ? (
                        <span className="text-xs text-muted-foreground italic">Sólo lectura</span>
                      ) : (
                        <>
                          <button type="button" onClick={() => openEdit(l)} title="Editar" className="inline-flex size-8 items-center justify-center rounded-md border border-teal text-teal hover:bg-teal-soft">
                            <Pencil className="size-3.5" />
                          </button>
                          <button type="button" onClick={() => setDeleting(l)} title="Eliminar" className="inline-flex size-8 items-center justify-center rounded-md border border-danger text-danger hover:bg-danger-soft">
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

      <Modal open={creating} onOpenChange={setCreating} title="Nuevo Laboratorio"
        footer={<><Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button><Button onClick={submit} className="bg-navy">Crear</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!editing} onOpenChange={(v) => !v && setEditing(null)} title={`Editar ${editing?.nombre ?? ""}`}
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={submit} className="bg-navy">Guardar</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)} title="Eliminar laboratorio" size="sm"
        footer={<><Button variant="outline" onClick={() => setDeleting(null)}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></>}>
        <p className="text-sm text-muted-foreground">¿Estás seguro de eliminar <span className="font-semibold text-navy">{deleting?.nombre}</span>? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
}
