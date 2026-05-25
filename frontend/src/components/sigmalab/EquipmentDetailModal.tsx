import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { MantDetalleModal } from "./MantDetalleModal";
import { useStore, type MantDetalle } from "@/lib/store";

type Equipo = {
  codigo: string; nombre: string; lab: string; fila: string; puesto: string;
  so: string; marca: string; modelo: string; serie: string; estado: string;
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  equipo: Equipo | null;
}

const TABS = [
  { id: "info", label: "Información general" },
  { id: "comp", label: "Componentes" },
  { id: "perif", label: "Periféricos asignados" },
  { id: "hist", label: "Historial de mantenimientos" },
];

const FALLBACK_HISTORIAL = [
  { tipo: "Preventivo" as const, fecha: "18/04/2026", tecnico: "Yennifer Sarzuri" },
  { tipo: "Correctivo" as const, fecha: "02/03/2026", tecnico: "Jhonny Arias" },
  { tipo: "Preventivo" as const, fecha: "15/01/2026", tecnico: "Carla Mendoza" },
  { tipo: "Preventivo" as const, fecha: "10/10/2025", tecnico: "Yennifer Sarzuri" },
];

export function EquipmentDetailModal({ open, onOpenChange, equipo }: Props) {
  const [tab, setTab] = useState("info");
  const [detalleSel, setDetalleSel] = useState<MantDetalle | null>(null);
  const detallesAll = useStore((s) => s.detalles);

  if (!equipo) return null;
  const historialReal = detallesAll.filter((d) => d.equipo === equipo.codigo);
  const historial = historialReal.length > 0
    ? historialReal.map((d) => ({ tipo: d.tipo, fecha: d.fecha, tecnico: d.tecnico, detalle: d as MantDetalle | null }))
    : FALLBACK_HISTORIAL.map((h) => ({ ...h, detalle: null as MantDetalle | null }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <DialogHeader className="border-b border-slate-100 px-6 py-4">
          <DialogTitle className="flex items-center gap-3 text-navy">
            {equipo.codigo}
            <span className="text-sm font-normal text-muted-foreground">- {equipo.nombre}</span>
            <StatusBadge status={equipo.estado} />
          </DialogTitle>
        </DialogHeader>

        <div className="border-b border-slate-100 px-6">
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button type="button"
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  tab === t.id
                    ? "border-teal text-navy"
                    : "border-transparent text-muted-foreground hover:text-navy",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {tab === "info" && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
              {[
                ["Código ITIC", equipo.codigo],
                ["Marca", equipo.marca],
                ["Modelo", equipo.modelo],
                ["N° Serie", equipo.serie],
                ["Sistema Operativo", equipo.so],
                ["Laboratorio", equipo.lab],
                ["Fila", equipo.fila],
                ["Puesto", equipo.puesto],
                ["Fecha instalación", "12/03/2023"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs font-medium text-muted-foreground">{k}</p>
                  <p className="mt-1 text-sm font-semibold text-navy">{v}</p>
                </div>
              ))}
              <div>
                <p className="text-xs font-medium text-muted-foreground">Estado actual</p>
                <div className="mt-1"><StatusBadge status={equipo.estado} /></div>
              </div>
            </div>
          )}

          {tab === "comp" && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-semibold">Componente</th>
                  <th className="px-4 py-2 font-semibold">Capacidad / Modelo</th>
                  <th className="px-4 py-2 font-semibold">Tecnología / Marca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-4 py-3">Memoria RAM</td><td className="px-4 py-3">8 GB</td><td className="px-4 py-3">DDR4 2666MHz - Kingston</td></tr>
                <tr className="bg-slate-50/50"><td className="px-4 py-3">Disco duro</td><td className="px-4 py-3">240 GB SSD</td><td className="px-4 py-3">SATA III - Kingston A400</td></tr>
                <tr><td className="px-4 py-3">Tarjeta madre</td><td className="px-4 py-3">{equipo.modelo}</td><td className="px-4 py-3">{equipo.marca}</td></tr>
                <tr className="bg-slate-50/50"><td className="px-4 py-3">Tarjeta de red</td><td className="px-4 py-3">Gigabit Ethernet</td><td className="px-4 py-3">Realtek RTL8111H</td></tr>
              </tbody>
            </table>
          )}

          {tab === "perif" && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-semibold">Tipo</th>
                  <th className="px-4 py-2 font-semibold">Marca</th>
                  <th className="px-4 py-2 font-semibold">Modelo</th>
                  <th className="px-4 py-2 font-semibold">Serie</th>
                  <th className="px-4 py-2 font-semibold">Cód. inventario</th>
                  <th className="px-4 py-2 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-4 py-3">Monitor</td><td className="px-4 py-3">Samsung</td><td className="px-4 py-3">S22F350</td><td className="px-4 py-3">SAM2245X</td><td className="px-4 py-3">UMSA-INF-2024-101</td><td className="px-4 py-3"><StatusBadge status="Funcionando" /></td></tr>
                <tr className="bg-slate-50/50"><td className="px-4 py-3">Teclado</td><td className="px-4 py-3">Logitech</td><td className="px-4 py-3">K120</td><td className="px-4 py-3">LGT88121</td><td className="px-4 py-3">UMSA-INF-2024-102</td><td className="px-4 py-3"><StatusBadge status="Funcionando" /></td></tr>
                <tr><td className="px-4 py-3">Mouse</td><td className="px-4 py-3">Logitech</td><td className="px-4 py-3">M100</td><td className="px-4 py-3">LGT77234</td><td className="px-4 py-3">UMSA-INF-2024-103</td><td className="px-4 py-3"><StatusBadge status="Funcionando" /></td></tr>
              </tbody>
            </table>
          )}

          {tab === "hist" && (
            <div className="space-y-3">
              {historial.map((h, i) => (
                <button type="button" key={h.fecha + h.tipo} onClick={() => h.detalle && setDetalleSel(h.detalle)}
                  className="flex w-full items-center gap-4 rounded-lg border border-slate-100 bg-white px-4 py-3 text-left hover:border-teal hover:bg-teal-soft/30">
                  <StatusBadge status={h.tipo} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-navy">{h.fecha}</p>
                    <p className="text-xs text-muted-foreground">Técnico: {h.tecnico}</p>
                  </div>
                  <span className="text-xs font-semibold text-teal">{h.detalle ? "Ver detalle →" : "Sin detalle"}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <MantDetalleModal detalle={detalleSel} open={!!detalleSel} onOpenChange={(v) => !v && setDetalleSel(null)} />
      </DialogContent>
    </Dialog>
  );
}
