import React, { useMemo, useState, useReducer } from "react";
import { toast } from "sonner";
import {
  Package, Plus, Search, AlertTriangle, Pencil, Trash2, Eye, Filter,
  Boxes, CheckCircle2, X,
} from "lucide-react";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { store, useStore, INVENTARIO_CATEGORIAS, UBIC_OFICINA,
  type InventarioItem, type InventarioCategoria, type InventarioEstado } from "@/lib/store";
import { cn } from "@/lib/utils";

const ESTADOS: InventarioEstado[] = ["Operativo", "En mantenimiento", "De baja", "En almacén"];

const EMPTY: InventarioItem = {
  id: "", categoria: "Monitor", codItic: "", codFacultativo: "", codUmsa: "",
  numeroSerie: "", marca: "", modelo: "", estado: "En almacén",
  fechaIngreso: new Date().toISOString().slice(0, 10),
  fechaAsignacion: "", asignadoEquipo: "", laboratorio: "", observaciones: "",
};

function ubicacionLabel(it: InventarioItem, labs: { id: string; nombre: string }[]) {
  if (!it.laboratorio) return UBIC_OFICINA;
  return labs.find((l) => l.id === it.laboratorio)?.nombre ?? it.laboratorio;
}

function estadoTone(e: InventarioEstado): string {
  switch (e) {
    case "Operativo": return "bg-success-soft text-success";
    case "En mantenimiento": return "bg-warning-soft text-warning";
    case "De baja": return "bg-danger-soft text-danger";
    case "En almacén": return "bg-slate-100 text-slate-700";
  }
}

export function InventarioView() {
  const inventario = useStore((s) => s.inventario);
  const stockMinimos = useStore((s) => s.stockMinimos);
  const labs = useStore((s) => s.labs);
  const equipos = useStore((s) => s.equipos);

  // Merge real inventario items with synthetic items from equipos (PCs)
  const merged = useMemo(() => {
    const eqItems: InventarioItem[] = equipos.map((e) => ({
      id: e.codigo,
      categoria: "Equipo de cómputo" as InventarioCategoria,
      codItic: e.codigo,
      numeroSerie: e.serie,
      marca: e.marca,
      modelo: e.modelo,
      estado: (e.estado === "Funcionando" ? "Operativo" :
               e.estado === "En mantenimiento" ? "En mantenimiento" :
               e.estado === "De baja" ? "De baja" : "En almacén") as InventarioEstado,
      fechaIngreso: "",
      laboratorio: e.lab,
      asignadoEquipo: e.codigo,
      observaciones: `PC: ${e.nombre}`,
    }));
    // Avoid duplicates: skip inventario items that already represent a PC as "Equipo de cómputo"
    const invFiltered = inventario.filter((it) => it.categoria !== "Equipo de cómputo");
    return [...eqItems, ...invFiltered];
  }, [equipos, inventario]);

  const [filtros, dispatchFiltros] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { q: "", fCat: "", fEstado: "", fUbic: "", fMarca: "", onlyLow: false }
  );

  const [modal, dispatchModal] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { creating: false, editing: null, viewing: null, deleting: null, stockModal: false }
  );
  const [form, setForm] = useState<InventarioItem>(EMPTY);

  // Stock por categoría = ítems disponibles (en almacén/oficina), excludes PCs
  const stockPorCat = useMemo(() => {
    const m = new Map<InventarioCategoria, number>();
    for (const it of inventario) {
      if (it.estado === "En almacén" && !it.laboratorio) {
        m.set(it.categoria, (m.get(it.categoria) ?? 0) + 1);
      }
    }
    return m;
  }, [inventario]);

  const lowStock = useMemo(() => {
    const result: Array<typeof stockMinimos[number] & { stock: number }> = [];
    for (const s of stockMinimos) {
      const stock = stockPorCat.get(s.categoria) ?? 0;
      if (stock < s.minimo && s.categoria !== "Equipo de cómputo") result.push({ ...s, stock });
    }
    return result;
  }, [stockMinimos, stockPorCat]);

  const marcas = useMemo(
    () => Array.from(new Set(merged.flatMap((i) => i.marca ? [i.marca] : []))).sort(),
    [merged],
  );

  const filtered = useMemo(() => {
    const lowCats = new Set(lowStock.map((s) => s.categoria));
    return merged.filter((it) => {
      if (filtros.fCat && it.categoria !== filtros.fCat) return false;
      if (filtros.fEstado && it.estado !== filtros.fEstado) return false;
      if (filtros.fMarca && it.marca !== filtros.fMarca) return false;
      if (filtros.fUbic === "oficina" && it.laboratorio) return false;
      if (filtros.fUbic === "asignado" && !it.laboratorio) return false;
      if (filtros.fUbic && filtros.fUbic !== "oficina" && filtros.fUbic !== "asignado" && it.laboratorio !== filtros.fUbic) return false;
      if (filtros.onlyLow && !lowCats.has(it.categoria)) return false;
      if (filtros.q) {
        const s = filtros.q.toLowerCase();
        const hay = [
          it.codItic, it.codFacultativo, it.codUmsa, it.numeroSerie,
          it.marca, it.modelo, it.asignadoEquipo, it.observaciones, it.categoria,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [merged, filtros.q, filtros.fCat, filtros.fEstado, filtros.fUbic, filtros.fMarca, filtros.onlyLow, lowStock]);

  const totales = useMemo(() => ({
    total: merged.length,
    asignados: merged.filter((i) => !!i.laboratorio).length,
    enOficina: merged.filter((i) => !i.laboratorio).length,
    deBaja: merged.filter((i) => i.estado === "De baja").length,
  }), [merged]);

  const openCreate = () => {
    const next = `INV-${String(Date.now()).slice(-6)}`;
    setForm({ ...EMPTY, id: next });
    dispatchModal({ type: "SET_FIELD", field: "creating", value: true });
  };

  const openEdit = (it: InventarioItem) => {
    if (it.categoria === "Equipo de cómputo") {
      toast.error("Los equipos de cómputo se gestionan desde la sección Equipos");
      return;
    }
    setForm({ ...it, codFacultativo: it.codFacultativo ?? "", codUmsa: it.codUmsa ?? "",
      fechaAsignacion: it.fechaAsignacion ?? "", asignadoEquipo: it.asignadoEquipo ?? "",
      laboratorio: it.laboratorio ?? "", observaciones: it.observaciones ?? "" });
    dispatchModal({ type: "SET_FIELD", field: "editing", value: it });
  };

  const submit = async () => {
    if (!form.codItic || !form.numeroSerie || !form.marca || !form.modelo) {
      toast.error("Cod. ITIC, N° serie, marca y modelo son requeridos");
      return;
    }
    if (modal.creating && merged.some((i) => i.codItic === form.codItic)) {
      toast.error("Cod. ITIC ya existe");
      return;
    }
    const clean: InventarioItem = {
      ...form,
      codFacultativo: form.codFacultativo || undefined,
      codUmsa: form.codUmsa || undefined,
      fechaAsignacion: form.laboratorio ? (form.fechaAsignacion || new Date().toISOString().slice(0, 10)) : undefined,
      asignadoEquipo: form.asignadoEquipo || undefined,
      laboratorio: form.laboratorio || undefined,
      observaciones: form.observaciones || undefined,
    };
    try {
      if (modal.creating) { await store.addInventario(clean); toast.success("Ítem agregado al inventario"); dispatchModal({ type: "SET_FIELD", field: "creating", value: false }); }
      else if (modal.editing) { await store.updateInventario(modal.editing.id, clean); toast.success("Ítem actualizado"); dispatchModal({ type: "SET_FIELD", field: "editing", value: null }); }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Error al guardar ítem");
    }
  };

  const confirmDelete = async () => {
    if (!modal.deleting) return;
    if (modal.deleting.categoria === "Equipo de cómputo") {
      toast.error("Los equipos de cómputo se gestionan desde la sección Equipos");
      dispatchModal({ type: "SET_FIELD", field: "deleting", value: null });
      return;
    }
    try {
      await store.deleteInventario(modal.deleting.id);
      toast.success("Ítem eliminado");
      dispatchModal({ type: "SET_FIELD", field: "deleting", value: null });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Error al eliminar ítem");
    }
  };

  const clearFilters = () => {
    dispatchFiltros({ type: "SET_FIELD", field: "q", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fCat", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fEstado", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fUbic", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fMarca", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "onlyLow", value: false });
  };
  const hasFilters = filtros.q || filtros.fCat || filtros.fEstado || filtros.fUbic || filtros.fMarca || filtros.onlyLow;

  const FormBody = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField label="Categoría" required>
        <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as InventarioCategoria })} className={inputCls} aria-label="Categoría">
          {INVENTARIO_CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </FormField>
      <FormField label="Estado" required>
        <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as InventarioEstado })} className={inputCls} aria-label="Estado inventario">
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </FormField>
      <FormField label="Cod. ITIC" required>
        <input value={form.codItic} disabled={!!modal.editing} onChange={(e) => setForm({ ...form, codItic: e.target.value })} className={inputCls} placeholder="ITIC-XXX-0000" aria-label="Código ITIC" />
      </FormField>
      <FormField label="N° serie" required>
        <input value={form.numeroSerie} onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })} className={inputCls} aria-label="Número de serie" />
      </FormField>
      <FormField label="Cod. Facultativo">
        <input value={form.codFacultativo} onChange={(e) => setForm({ ...form, codFacultativo: e.target.value })} className={inputCls} aria-label="Código facultativo" />
      </FormField>
      <FormField label="Cod. UMSA">
        <input value={form.codUmsa} onChange={(e) => setForm({ ...form, codUmsa: e.target.value })} className={inputCls} aria-label="Código UMSA" />
      </FormField>
      <FormField label="Marca" required>
        <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className={inputCls} aria-label="Marca" />
      </FormField>
      <FormField label="Modelo" required>
        <input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} className={inputCls} aria-label="Modelo" />
      </FormField>
      <FormField label="Fecha de ingreso" required>
        <input type="date" value={form.fechaIngreso} onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })} className={inputCls} aria-label="Fecha de ingreso" />
      </FormField>
      <FormField label="Fecha de asignación">
        <input type="date" value={form.fechaAsignacion} onChange={(e) => setForm({ ...form, fechaAsignacion: e.target.value })} className={inputCls} aria-label="Fecha de asignación" />
      </FormField>
      <FormField label="Laboratorio (asignación)">
        <select value={form.laboratorio} onChange={(e) => setForm({ ...form, laboratorio: e.target.value })} className={inputCls} aria-label="Laboratorio asignación">
          <option value="">- Oficina ITIC (sin asignar) -</option>
          {labs.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>
      </FormField>
      <FormField label="Equipo asignado (opcional)">
        <select value={form.asignadoEquipo} onChange={(e) => setForm({ ...form, asignadoEquipo: e.target.value })} className={inputCls} disabled={!form.laboratorio} aria-label="Equipo asignado">
          <option value="">- Ninguno -</option>
          {equipos.reduce((acc, eq) => {
            if (!form.laboratorio || eq.lab === form.laboratorio) {
              acc.push(<option key={eq.codigo} value={eq.codigo}>{eq.codigo} - {eq.nombre}</option>);
            }
            return acc;
          }, [] as React.ReactNode[])}
        </select>
      </FormField>
      <div className="md:col-span-2">
        <FormField label="Observaciones">
          <textarea value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} className={cn(inputCls, "min-h-[70px]")} aria-label="Observaciones" />
        </FormField>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <HeaderInventario openCreate={openCreate} openStockModal={() => dispatchModal({ type: "SET_FIELD", field: "stockModal", value: true })} />
      <InventarioResumen totales={totales} lowStock={lowStock} onlyLow={filtros.onlyLow} setOnlyLow={(v) => dispatchFiltros({ type: "SET_FIELD", field: "onlyLow", value: v })} />
      <FilterPanel filtros={filtros} dispatchFiltros={dispatchFiltros} hasFilters={hasFilters} clearFilters={clearFilters} labs={labs} marcas={marcas} inventario={merged} filtered={filtered} />
      <InventarioTable filtered={filtered} labs={labs} dispatchModal={dispatchModal} openEdit={openEdit} />
      <InventarioModals modal={modal} dispatchModal={dispatchModal} FormBody={FormBody} submit={submit} confirmDelete={confirmDelete} labs={labs} stockMinimos={stockMinimos} stockPorCat={stockPorCat} />
    </div>
  );
}

function InventarioResumen({ totales, lowStock, onlyLow, setOnlyLow }: {
  totales: { total: number; asignados: number; enOficina: number; deBaja: number };
  lowStock: { categoria: string; minimo: number; stock: number }[];
  onlyLow: boolean;
  setOnlyLow: (v: boolean) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Total ítems" value={totales.total} tone="navy" icon={<Package className="size-4" />} />
        <KpiCard label="Asignados a labs" value={totales.asignados} tone="success" icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="En Oficina ITIC" value={totales.enOficina} tone="teal" icon={<Boxes className="size-4" />} />
        <KpiCard label="Dados de baja" value={totales.deBaja} tone="danger" icon={<AlertTriangle className="size-4" />} />
      </div>
      {lowStock.length > 0 && (
        <Panel title="Alertas de stock mínimo" action={
          <button type="button" onClick={() => setOnlyLow(!onlyLow)} className={cn("rounded-md px-3 py-1 text-xs font-semibold", onlyLow ? "bg-danger text-white" : "border border-danger text-danger")}>
            {onlyLow ? "Mostrando bajo stock" : "Filtrar por bajo stock"}
          </button>
        }>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {lowStock.map((s) => (
              <div key={s.categoria} className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger-soft/40 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-navy">{s.categoria}</p>
                  <p className="text-[11px] text-muted-foreground">Mínimo recomendado: {s.minimo}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-danger px-2 py-1 text-[11px] font-semibold text-white">
                  <AlertTriangle className="size-3" /> {s.stock} disp.
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}

function KpiCard({ label, value, tone, icon }: { label: string; value: number; tone: "navy" | "success" | "teal" | "danger"; icon: React.ReactNode }) {
  const tones: Record<string, string> = {
    navy: "bg-navy/5 text-navy",
    success: "bg-success-soft text-success",
    teal: "bg-teal-soft text-teal",
    danger: "bg-danger-soft text-danger",
  };
  return (
    <div className="rounded-xl border border-slate-100 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
        <span className={cn("inline-flex size-7 items-center justify-center rounded-full", tones[tone])}>{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-navy">{value}</p>
    </div>
  );
}

function Detail({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase text-muted-foreground">{k}</p>
      <div className="mt-0.5 text-sm text-navy">{v}</div>
    </div>
  );
}

function HeaderInventario({ openCreate, openStockModal }: { openCreate: () => void; openStockModal: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Inventario</h1>
        <p className="text-sm text-muted-foreground">Control de productos y componentes de ITIC</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={openStockModal} className="border-navy/30 text-navy">
          <Boxes className="mr-1 size-4" /> Stock mínimo
        </Button>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90">
          <Plus className="size-4" /> Nuevo ítem
        </button>
      </div>
    </div>
  );
}

function FilterPanel({ filtros, dispatchFiltros, hasFilters, clearFilters, labs, marcas, inventario, filtered }: {
  filtros: any; dispatchFiltros: React.Dispatch<any>; hasFilters: boolean; clearFilters: () => void;
  labs: any[]; marcas: string[]; inventario: any[]; filtered: any[];
}) {
  return (
    <Panel title="Buscar y filtrar" action={
      hasFilters && (
        <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline">
          <X className="size-3" /> Limpiar
        </button>
      )
    }>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
        <div className="md:col-span-2 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={filtros.q} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "q", value: e.target.value })} placeholder="Cod. ITIC, serie, marca, modelo..." className={cn(inputCls, "pl-9")} aria-label="Buscar en inventario" />
        </div>
        <select value={filtros.fCat} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fCat", value: e.target.value })} className={inputCls} aria-label="Filtrar por categoría">
          <option value="">Todas categorías</option>
          {INVENTARIO_CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtros.fEstado} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fEstado", value: e.target.value })} className={inputCls} aria-label="Filtrar por estado">
          <option value="">Todos estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filtros.fUbic} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fUbic", value: e.target.value })} className={inputCls} aria-label="Filtrar por ubicación">
          <option value="">Todas ubicaciones</option>
          <option value="oficina">Oficina ITIC</option>
          <option value="asignado">Asignado (cualquier lab)</option>
          <optgroup label="Laboratorios">
            {labs.map((l: any) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </optgroup>
        </select>
        <select value={filtros.fMarca} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fMarca", value: e.target.value })} className={inputCls} aria-label="Filtrar por marca">
          <option value="">Todas marcas</option>
          {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Filter className="size-3" /> {filtered.length} de {inventario.length} ítems
      </div>
    </Panel>
  );
}

function InventarioTable({ filtered, labs, dispatchModal, openEdit }: {
  filtered: any[]; labs: any[]; dispatchModal: React.Dispatch<any>; openEdit: (it: any) => void;
}) {
  return (
    <Panel title="Ítems del inventario">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-muted-foreground">
              <th className="px-3 py-2">Cod. ITIC</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Marca / Modelo</th>
              <th className="px-3 py-2">N° serie</th>
              <th className="px-3 py-2">Ubicación</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Ingreso</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-3 py-2 font-mono text-xs text-navy">{it.codItic}</td>
                <td className="px-3 py-2">{it.categoria}</td>
                <td className="px-3 py-2"><span className="font-medium text-navy">{it.marca}</span> <span className="text-muted-foreground">{it.modelo}</span></td>
                <td className="px-3 py-2 font-mono text-xs">{it.numeroSerie}</td>
                <td className="px-3 py-2">
                  {it.laboratorio ? (
                    <div>
                      <p className="text-xs font-semibold text-navy">{ubicacionLabel(it, labs)}</p>
                      {it.asignadoEquipo && <p className="text-[11px] text-muted-foreground">{it.asignadoEquipo}</p>}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-semibold text-teal">{UBIC_OFICINA}</span>
                  )}
                </td>
                <td className="px-3 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", estadoTone(it.estado))}>{it.estado}</span></td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{it.fechaIngreso}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => dispatchModal({ type: "SET_FIELD", field: "viewing", value: it })} title="Ver detalle" className="inline-flex size-8 items-center justify-center rounded-md border border-teal text-teal hover:bg-teal-soft"><Eye className="size-3.5" /></button>
                    {it.categoria === "Equipo de cómputo" ? (
                      <span className="inline-flex size-8 items-center justify-center text-[10px] text-muted-foreground italic">—</span>
                    ) : (
                      <>
                        <button type="button" onClick={() => openEdit(it)} title="Editar" className="inline-flex size-8 items-center justify-center rounded-md border border-navy/40 text-navy hover:bg-slate-100"><Pencil className="size-3.5" /></button>
                        <button type="button" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: it })} title="Eliminar" className="inline-flex size-8 items-center justify-center rounded-md border border-danger text-danger hover:bg-danger-soft"><Trash2 className="size-3.5" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function InventarioModals({ modal, dispatchModal, FormBody, submit, confirmDelete, labs, stockMinimos, stockPorCat }: {
  modal: any; dispatchModal: React.Dispatch<any>; FormBody: React.ReactNode;
  submit: () => void; confirmDelete: () => void; labs: any[];
  stockMinimos: any[]; stockPorCat: Map<string, number>;
}) {
  const perifericos = useStore((s) => s.perifericos);
  const equipos = useStore((s) => s.equipos);
  const relacionPerifericos = modal.viewing?.asignadoEquipo
    ? perifericos.filter((p) => p.asignadoA === modal.viewing.asignadoEquipo)
    : [];
  const relacionEquipo = modal.viewing?.asignadoEquipo
    ? equipos.find((e) => e.codigo === modal.viewing.asignadoEquipo)
    : null;
  return (
    <>
      <Modal open={modal.creating} onOpenChange={(v) => dispatchModal({ type: "SET_FIELD", field: "creating", value: v })} title="Nuevo ítem de inventario" size="lg"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "creating", value: false })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Agregar</Button></>}>
        {FormBody}
      </Modal>
      <Modal open={!!modal.editing} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "editing", value: null })} title={`Editar ${modal.editing?.codItic ?? ""}`} size="lg"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "editing", value: null })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Guardar</Button></>}>
        {FormBody}
      </Modal>
      <Modal open={!!modal.viewing} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "viewing", value: null })} title={modal.viewing ? `${modal.viewing.categoria} — ${modal.viewing.codItic}` : ""} size="lg">
        {modal.viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
              <Detail k="Categoría" v={modal.viewing.categoria} />
              <Detail k="Estado" v={<span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", estadoTone(modal.viewing.estado))}>{modal.viewing.estado}</span>} />
              <Detail k="Cod. ITIC" v={modal.viewing.codItic} />
              <Detail k="Cod. Facultativo" v={modal.viewing.codFacultativo || "—"} />
              <Detail k="Cod. UMSA" v={modal.viewing.codUmsa || "—"} />
              <Detail k="N° serie" v={modal.viewing.numeroSerie} />
              <Detail k="Marca" v={modal.viewing.marca} />
              <Detail k="Modelo" v={modal.viewing.modelo} />
              <Detail k="Fecha de ingreso" v={modal.viewing.fechaIngreso} />
              <Detail k="Fecha de asignación" v={modal.viewing.fechaAsignacion || "—"} />
              <Detail k="Ubicación" v={ubicacionLabel(modal.viewing, labs)} />
              <Detail k="Equipo asignado" v={modal.viewing.asignadoEquipo || "—"} />
              <div className="md:col-span-2">
                <Detail k="Observaciones" v={modal.viewing.observaciones || "—"} />
              </div>
            </div>
            {relacionEquipo && (
              <div className="rounded-lg border border-slate-100 p-3 text-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Equipo asignado</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy">{relacionEquipo.codigo} - {relacionEquipo.nombre}</p>
                    <p className="text-xs text-muted-foreground">{relacionEquipo.marca} {relacionEquipo.modelo} · {relacionEquipo.lab}</p>
                  </div>
                  <StatusBadge status={relacionEquipo.estado} />
                </div>
              </div>
            )}
            {relacionPerifericos.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Periféricos vinculados al equipo</p>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-1.5 font-semibold">Tipo</th>
                      <th className="px-3 py-1.5 font-semibold">Marca</th>
                      <th className="px-3 py-1.5 font-semibold">Modelo</th>
                      <th className="px-3 py-1.5 font-semibold">Serie</th>
                      <th className="px-3 py-1.5 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relacionPerifericos.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="px-3 py-1.5 text-navy">{p.tipo}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{p.marca}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{p.modelo}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{p.serie}</td>
                        <td className="px-3 py-1.5"><StatusBadge status={p.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
      <Modal open={!!modal.deleting} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })} title="Eliminar ítem" size="sm"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></>}>
        <p className="text-sm text-muted-foreground">¿Eliminar <span className="font-semibold text-navy">{modal.deleting?.codItic}</span> ({modal.deleting?.categoria})?</p>
      </Modal>
      <Modal open={modal.stockModal} onOpenChange={(v) => dispatchModal({ type: "SET_FIELD", field: "stockModal", value: v })} title="Stock mínimo por categoría"
        footer={<Button onClick={() => dispatchModal({ type: "SET_FIELD", field: "stockModal", value: false })} className="bg-navy">Cerrar</Button>}>
        <div className="space-y-2">
          {stockMinimos.map((s) => {
            const stock = stockPorCat.get(s.categoria) ?? 0;
            const low = stock < s.minimo;
            return (
              <div key={s.categoria} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-navy">{s.categoria}</p>
                  <p className="text-[11px] text-muted-foreground">Disponibles en Oficina: <span className={cn("font-semibold", low ? "text-danger" : "text-success")}>{stock}</span></p>
                </div>
                <input
                  type="number" min={0} defaultValue={s.minimo}
                  onBlur={async (e) => {
                    const n = Math.max(0, Number(e.target.value) || 0);
                    if (n !== s.minimo) {
                      try {
                        await store.setStockMinimo(s.categoria, n);
                        toast.success(`Mínimo: ${s.categoria} → ${n}`);
                      } catch (err: any) {
                        toast.error(err?.response?.data?.error || "Error al actualizar stock mínimo");
                      }
                    }
                  }}
                  className={cn(inputCls, "w-24")}
                  aria-label={`Stock mínimo para ${s.categoria}`}
                />
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}