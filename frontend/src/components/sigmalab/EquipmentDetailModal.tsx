import { useState, useEffect, useRef } from "react";
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
  initialTab?: string;
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

export function EquipmentDetailModal({ open, onOpenChange, equipo, initialTab = "info" }: Props) {
  const [tab, setTab] = useState("info");
  const [detalleSel, setDetalleSel] = useState<MantDetalle | null>(null);
  const detallesAll = useStore((s) => s.detalles);
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) setTab(initialTab);
    prevOpen.current = open;
  }, [open, initialTab]);

  if (!equipo) return null;
  const historialReal = detallesAll.filter((d) => d.equipo === equipo.codigo);
  const historial = historialReal.length > 0
    ? historialReal.map((d) => ({ tipo: d.tipo, fecha: d.fecha, tecnico: d.tecnico, detalle: d as MantDetalle | null }))
    : FALLBACK_HISTORIAL.map((h) => ({ ...h, detalle: null as MantDetalle | null }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 1. DialogContent es el contenedor principal. 
        Le agregamos max-h-[90vh] para que NUNCA pase del 90% del alto de la pantalla.
        Le damos flex flex-col para separar el header fijo del contenido con scroll.
      */}
      <DialogContent className="max-w-5xl w-[95vw] p-0 flex flex-col max-h-[90vh] overflow-hidden rounded-2xl">
        
        {/* Cabecera (Fija en la parte superior) shrink-0 evita que se aplaste */}
        <DialogHeader className="border-b border-slate-100 px-4 sm:px-6 py-4 shrink-0 bg-white">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-navy">
            <span className="font-bold text-lg">{equipo.codigo}</span>
            <span className="text-sm font-normal text-muted-foreground hidden sm:inline">-</span>
            <span className="text-sm font-normal text-muted-foreground">{equipo.nombre}</span>
            <div className="mt-1 sm:mt-0">
              <StatusBadge status={equipo.estado} />
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Pestañas (Fijas debajo de la cabecera) shrink-0 */}
        <div className="border-b border-slate-100 px-2 sm:px-6 overflow-x-auto custom-scrollbar shrink-0 bg-white">
          <div className="flex gap-1 min-w-max">
            {TABS.map((t) => (
              <button type="button"
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "border-b-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
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

        {/* Cuerpo (¡AQUÍ ESTÁ LA SOLUCIÓN DEL SCROLL!)
          flex-1 toma el espacio restante.
          overflow-y-auto crea la barra de desplazamiento solo aquí si el contenido es muy largo.
        */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-slate-50/50">
          
          {tab === "info" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6">
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
                <div key={k} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{k}</p>
                  <p className="mt-1 text-sm font-semibold text-navy">{v}</p>
                </div>
              ))}
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estado actual</p>
                <div className="mt-1"><StatusBadge status={equipo.estado} /></div>
              </div>
            </div>
          )}

          {tab === "comp" && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">Componente</th>
                    <th className="px-4 py-3 font-bold">Capacidad / Modelo</th>
                    <th className="px-4 py-3 font-bold">Tecnología / Marca</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 transition-colors"><td className="px-4 py-3 font-medium">Memoria RAM</td><td className="px-4 py-3">8 GB</td><td className="px-4 py-3 text-slate-500">DDR4 2666MHz - Kingston</td></tr>
                  <tr className="hover:bg-slate-50/50 transition-colors"><td className="px-4 py-3 font-medium">Disco duro</td><td className="px-4 py-3">240 GB SSD</td><td className="px-4 py-3 text-slate-500">SATA III - Kingston A400</td></tr>
                  <tr className="hover:bg-slate-50/50 transition-colors"><td className="px-4 py-3 font-medium">Tarjeta madre</td><td className="px-4 py-3">{equipo.modelo}</td><td className="px-4 py-3 text-slate-500">{equipo.marca}</td></tr>
                  <tr className="hover:bg-slate-50/50 transition-colors"><td className="px-4 py-3 font-medium">Tarjeta de red</td><td className="px-4 py-3">Gigabit Ethernet</td><td className="px-4 py-3 text-slate-500">Realtek RTL8111H</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === "perif" && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">Tipo</th>
                    <th className="px-4 py-3 font-bold">Marca</th>
                    <th className="px-4 py-3 font-bold">Modelo</th>
                    <th className="px-4 py-3 font-bold">Serie</th>
                    <th className="px-4 py-3 font-bold">Cód. inventario</th>
                    <th className="px-4 py-3 font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 transition-colors"><td className="px-4 py-3 font-medium">Monitor</td><td className="px-4 py-3">Samsung</td><td className="px-4 py-3">S22F350</td><td className="px-4 py-3 font-mono text-xs">SAM2245X</td><td className="px-4 py-3 font-mono text-xs text-slate-500">UMSA-INF-2024-101</td><td className="px-4 py-3"><StatusBadge status="Funcionando" /></td></tr>
                  <tr className="hover:bg-slate-50/50 transition-colors"><td className="px-4 py-3 font-medium">Teclado</td><td className="px-4 py-3">Logitech</td><td className="px-4 py-3">K120</td><td className="px-4 py-3 font-mono text-xs">LGT88121</td><td className="px-4 py-3 font-mono text-xs text-slate-500">UMSA-INF-2024-102</td><td className="px-4 py-3"><StatusBadge status="Funcionando" /></td></tr>
                  <tr className="hover:bg-slate-50/50 transition-colors"><td className="px-4 py-3 font-medium">Mouse</td><td className="px-4 py-3">Logitech</td><td className="px-4 py-3">M100</td><td className="px-4 py-3 font-mono text-xs">LGT77234</td><td className="px-4 py-3 font-mono text-xs text-slate-500">UMSA-INF-2024-103</td><td className="px-4 py-3"><StatusBadge status="Funcionando" /></td></tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === "hist" && (
            <div className="space-y-3">
              {historial.map((h, i) => (
                <button type="button" key={h.fecha + h.tipo + i} onClick={() => h.detalle && setDetalleSel(h.detalle)}
                  className="flex flex-col sm:flex-row w-full items-start sm:items-center gap-3 sm:gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-teal hover:bg-teal-soft/20 hover:shadow-md">
                  <div className="shrink-0">
                    <StatusBadge status={h.tipo} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-navy">{h.fecha}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Técnico: <span className="text-navy">{h.tecnico}</span></p>
                  </div>
                  <div className="mt-2 sm:mt-0 sm:ml-auto">
                     <span className={cn(
                       "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                       h.detalle ? "bg-teal text-white hover:bg-teal/90" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                     )}>
                       {h.detalle ? "Ver detalle →" : "Sin detalle registrado"}
                     </span>
                  </div>
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