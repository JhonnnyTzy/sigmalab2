import { useState, useMemo, useReducer } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Clock, Plus, Search, Trash2 } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { EquipmentDetailModal } from "@/components/sigmalab/EquipmentDetailModal";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/use-app";
import { store, useStore, type Equipo } from "@/lib/store";

const ESTADOS = ["Funcionando", "En mantenimiento", "Pendiente", "De baja", "En espera repuesto"];
const PAGE = 8;

const EMPTY: Equipo = {
  codigo: "", nombre: "", lab: "LAB1", fila: "A", puesto: "01", so: "Windows 11 Pro",
  marca: "HP", modelo: "", serie: "", estado: "Funcionando",
};

export function EquiposView() {
  const { role } = useApp();
  const readOnly = role !== "encargado";
  const equipos = useStore((s) => s.equipos);
  const labs = useStore((s) => s.labs);

  const [filtros, dispatchFiltros] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { lab: "", estado: "", q: "" }
  );
  const [page, setPage] = useState(1);
  const [modal, dispatchModal] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { selected: null, editing: null, creating: false, deleting: null }
  );
  const [form, setForm] = useState<Equipo>(EMPTY);

  const filtered = useMemo(() => equipos.filter((e) =>
    (!filtros.lab || e.lab === filtros.lab) &&
    (!filtros.estado || e.estado === filtros.estado) &&
    (!filtros.q || e.codigo.toLowerCase().includes(filtros.q.toLowerCase()) || e.nombre.toLowerCase().includes(filtros.q.toLowerCase())),
  ), [equipos, filtros.lab, filtros.estado, filtros.q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pageRows = filtered.slice((page - 1) * PAGE, page * PAGE);

  const openCreate = () => {
    const nextNum = String(equipos.filter((e) => e.lab === "LAB1").length + 1).padStart(3, "0");
    setForm({ ...EMPTY, codigo: `PC-LAB1-${nextNum}` });
    dispatchModal({ type: "SET_FIELD", field: "creating", value: true });
  };
  const openEdit = (e: Equipo) => { setForm(e); dispatchModal({ type: "SET_FIELD", field: "editing", value: e }); };

  const submit = () => {
    if (!form.codigo || !form.nombre) { toast.error("Código y Nombre requeridos"); return; }
    if (modal.creating) {
      if (equipos.some((e) => e.codigo === form.codigo)) { toast.error("Código ya existe"); return; }
      store.addEquipo(form); toast.success("Equipo registrado"); dispatchModal({ type: "SET_FIELD", field: "creating", value: false });
    } else if (modal.editing) {
      store.updateEquipo(modal.editing.codigo, form); toast.success("Equipo actualizado"); dispatchModal({ type: "SET_FIELD", field: "editing", value: null });
    }
  };

  const confirmDelete = () => {
    if (!modal.deleting) return;
    store.deleteEquipo(modal.deleting.codigo); toast.success(`${modal.deleting.codigo} eliminado`); dispatchModal({ type: "SET_FIELD", field: "deleting", value: null });
  };

  const FormBody = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField label="Código ITIC" required><input value={form.codigo} disabled={!!modal.editing} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className={inputCls} aria-label="Código ITIC" /></FormField>
      <FormField label="Nombre" required><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} aria-label="Nombre" /></FormField>
      <FormField label="Laboratorio">
        <select value={form.lab} onChange={(e) => setForm({ ...form, lab: e.target.value })} className={inputCls} aria-label="Laboratorio">
          {labs.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>
      </FormField>
      <FormField label="Estado">
        <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className={inputCls} aria-label="Estado">
          {ESTADOS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </FormField>
      <FormField label="Fila"><input value={form.fila} onChange={(e) => setForm({ ...form, fila: e.target.value })} className={inputCls} aria-label="Fila" /></FormField>
      <FormField label="Puesto"><input value={form.puesto} onChange={(e) => setForm({ ...form, puesto: e.target.value })} className={inputCls} aria-label="Puesto" /></FormField>
      <FormField label="Marca"><input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className={inputCls} aria-label="Marca" /></FormField>
      <FormField label="Modelo"><input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} className={inputCls} aria-label="Modelo" /></FormField>
      <FormField label="Serie"><input value={form.serie} onChange={(e) => setForm({ ...form, serie: e.target.value })} className={inputCls} aria-label="Serie" /></FormField>
      <FormField label="Sistema Operativo"><input value={form.so} onChange={(e) => setForm({ ...form, so: e.target.value })} className={inputCls} aria-label="Sistema Operativo" /></FormField>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">Equipos {readOnly && <span className="ml-2 text-xs font-semibold text-muted-foreground">(solo lectura)</span>}</h1>
          <p className="text-sm text-muted-foreground">Inventario completo de equipos de cómputo</p>
        </div>
        {!readOnly && (
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90">
            <Plus className="size-4" /> Registrar Equipo
          </button>
        )}
      </div>

      <Panel title="Filtros y búsqueda">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select value={filtros.lab} onChange={(e) => { dispatchFiltros({ type: "SET_FIELD", field: "lab", value: e.target.value }); setPage(1); }} className={inputCls} aria-label="Filtrar por laboratorio">
            <option value="">Todos los laboratorios</option>
            {labs.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
          <select value={filtros.estado} onChange={(e) => { dispatchFiltros({ type: "SET_FIELD", field: "estado", value: e.target.value }); setPage(1); }} className={inputCls} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <input value={filtros.q} onChange={(e) => { dispatchFiltros({ type: "SET_FIELD", field: "q", value: e.target.value }); setPage(1); }} placeholder="Buscar por código o nombre..." className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm" aria-label="Buscar equipo" />
          </div>
        </div>
      </Panel>

      <Panel title={`${filtered.length} equipos encontrados`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Código ITIC</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Lab</th>
                <th className="px-4 py-3 font-semibold">Fila</th>
                <th className="px-4 py-3 font-semibold">Puesto</th>
                <th className="px-4 py-3 font-semibold">SO</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((e, i) => (
                <tr key={e.codigo} className={i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/40 hover:bg-slate-50"}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-teal">{e.codigo}</td>
                  <td className="px-4 py-3 font-medium text-navy">{e.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.lab}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.fila}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.puesto}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.so}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.estado} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => dispatchModal({ type: "SET_FIELD", field: "selected", value: e })} className="inline-flex size-8 items-center justify-center rounded-md text-teal hover:bg-teal-soft" title="Ver detalle">
                        <Eye className="size-4" />
                      </button>
                      {!readOnly && (
                        <>
                          <button type="button" onClick={() => openEdit(e)} className="inline-flex size-8 items-center justify-center rounded-md text-navy hover:bg-slate-100" title="Editar">
                            <Pencil className="size-4" />
                          </button>
                          <button type="button" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: e })} className="inline-flex size-8 items-center justify-center rounded-md text-danger hover:bg-danger-soft" title="Eliminar">
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                      <button type="button" onClick={() => setSelected(e)} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-slate-100" title="Historial">
                        <Clock className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No se encontraron equipos</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-muted-foreground">
          <span>Mostrando {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, filtered.length)} de {filtered.length}</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-50 disabled:opacity-40">Anterior</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button type="button" key={'page-' + i} onClick={() => setPage(i + 1)} className={`rounded border border-slate-200 px-2.5 py-1 ${page === i + 1 ? "bg-navy text-white" : "hover:bg-slate-50"}`}>{i + 1}</button>
            ))}
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-50 disabled:opacity-40">Siguiente</button>
          </div>
        </div>
      </Panel>

      <EquipmentDetailModal open={!!modal.selected} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "selected", value: null })} equipo={modal.selected} />

      <Modal open={modal.creating} onOpenChange={(v) => dispatchModal({ type: "SET_FIELD", field: "creating", value: v })} title="Registrar nuevo equipo" size="lg"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "creating", value: false })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Registrar</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!modal.editing} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "editing", value: null })} title={`Editar ${modal.editing?.codigo ?? ""}`} size="lg"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "editing", value: null })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Guardar</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!modal.deleting} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })} title="Eliminar equipo" size="sm"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></>}>
        <p className="text-sm text-muted-foreground">¿Eliminar el equipo <span className="font-semibold text-navy">{modal.deleting?.codigo}</span>?</p>
      </Modal>
    </div>
  );
}
