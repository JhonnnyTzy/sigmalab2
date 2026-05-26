import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Wrench, Cpu, Activity, AlertOctagon, Package, FileText, X } from "lucide-react";
import type { MantDetalle } from "@/lib/store";

export function MantDetalleModal({ detalle, open, onOpenChange }: { detalle: MantDetalle | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  if (!detalle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* El DialogContent se configura igual que el modal anterior:
        - max-w-4xl: Ancho máximo razonable.
        - max-h-[90vh]: Altura máxima del 90% de la ventana.
        - overflow-hidden: Evita que el contenedor global se desborde.
        - flex flex-col: Para estructurar cabecera, cuerpo y pie.
      */}
      <DialogContent className="max-w-4xl w-[95vw] p-0 flex flex-col max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        
        {/* Cabecera (Fija) */}
        <DialogHeader className="border-b border-slate-100 px-4 sm:px-6 py-4 shrink-0 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold text-navy">
                Detalle del mantenimiento — {detalle.equipo}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                {detalle.tipo} · {detalle.fecha}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Cuerpo (Con Scroll) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-slate-50/50">
          <div className="space-y-5">
            {/* Tarjeta de Información Resumen */}
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-white border border-slate-200 p-5 text-sm shadow-sm md:grid-cols-4">
              <Field k="Equipo" v={detalle.equipo} />
              <Field k="Laboratorio" v={detalle.lab} />
              <Field k="Técnico" v={detalle.tecnico} />
              <Field k="Fecha" v={detalle.fecha} />
              {detalle.inicio && <Field k="Hora inicio" v={detalle.inicio} />}
              {detalle.fin && <Field k="Hora fin" v={detalle.fin} />}
              <Field k="Estado" v={<StatusBadge status={detalle.estado} />} />
              {detalle.tipoIncidencia && <Field k="Tipo incidencia" v={detalle.tipoIncidencia} />}
            </div>

            {/* Secciones Dinámicas según Tipo (Correctivo) */}
            {detalle.tipo === "Correctivo" && (
              <div className="space-y-4">
                <Section icon={AlertOctagon} title="Descripción del problema" tone="danger">
                  <p className="text-sm leading-relaxed text-slate-700">{detalle.descripcion ?? "—"}</p>
                </Section>
                {detalle.diagnostico && (
                  <Section icon={Cpu} title="Diagnóstico técnico" tone="info">
                    <p className="text-sm leading-relaxed text-slate-700">{detalle.diagnostico}</p>
                  </Section>
                )}
                {detalle.accion && (
                  <Section icon={Wrench} title="Acción realizada" tone="success">
                    <p className="text-sm leading-relaxed text-slate-700">{detalle.accion}</p>
                  </Section>
                )}
                {detalle.componentes && detalle.componentes.length > 0 && (
                  <Section icon={Cpu} title="Componentes afectados" tone="warning">
                    <div className="flex flex-wrap gap-2">
                      {detalle.componentes.map((c) => (
                        <span key={c} className="rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">{c}</span>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            )}

            {/* Secciones Dinámicas según Tipo (Preventivo) */}
            {detalle.tipo === "Preventivo" && (
              <div className="space-y-4">
                {detalle.hardware && detalle.hardware.length > 0 && (
                  <Section icon={Cpu} title="Hardware revisado" tone="teal">
                    <ChecklistView items={detalle.hardware} />
                  </Section>
                )}
                {detalle.software && detalle.software.length > 0 && (
                  <Section icon={Activity} title="Software revisado" tone="info">
                    <ChecklistView items={detalle.software} />
                  </Section>
                )}
                {detalle.pruebas && detalle.pruebas.length > 0 && (
                  <Section icon={Activity} title="Pruebas de funcionamiento" tone="success">
                    <ChecklistView items={detalle.pruebas} />
                  </Section>
                )}
                {detalle.incidencias && detalle.incidencias.some((i) => i.problema) && (
                  <Section icon={AlertOctagon} title="Incidencias registradas" tone="warning">
                    <ul className="space-y-3">
                      {detalle.incidencias.reduce((acc, i) => {
                        if (i.problema) {
                          acc.push(
                            <li key={i.problema} className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 text-sm shadow-sm">
                              <p className="font-bold text-navy">Problema: <span className="font-medium text-slate-700">{i.problema}</span></p>
                              <p className="mt-1 font-medium text-slate-500">Acción: {i.accion || "—"}</p>
                              {i.seguimiento && <span className="mt-2 inline-block rounded-md bg-red-100 px-2 py-1 text-[11px] font-bold text-red-700 border border-red-200">Requiere seguimiento</span>}
                            </li>,
                          );
                        }
                        return acc;
                      }, [] as React.ReactNode[])}
                    </ul>
                  </Section>
                )}
              </div>
            )}

            {/* Insumos Utilizados */}
            {detalle.insumos && detalle.insumos.some((i) => i.insumo) && (
              <Section icon={Package} title="Insumos utilizados" tone="info">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500 border-b border-blue-100">
                      <tr>
                        <th className="py-2 font-bold uppercase text-[11px] tracking-wider">Insumo</th>
                        <th className="py-2 font-bold uppercase text-[11px] tracking-wider">Cantidad</th>
                        <th className="py-2 font-bold uppercase text-[11px] tracking-wider">Unidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50">
                      {detalle.insumos.reduce((acc, i) => {
                        if (i.insumo) {
                          acc.push(
                            <tr key={i.insumo}>
                              <td className="py-2.5 text-navy font-semibold">{i.insumo}</td>
                              <td className="py-2.5 text-slate-700 font-medium">{i.cantidad}</td>
                              <td className="py-2.5 text-slate-500 font-medium">{i.unidad}</td>
                            </tr>
                          );
                        }
                        return acc;
                      }, [] as React.ReactNode[])}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Notas Finales */}
            {(detalle.observaciones || detalle.recomendaciones) && (
              <Section icon={FileText} title="Notas Adicionales" tone="navy">
                <div className="space-y-4">
                  {detalle.observaciones && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Observaciones</p>
                      <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-md border border-slate-100">{detalle.observaciones}</p>
                    </div>
                  )}
                  {detalle.recomendaciones && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Recomendaciones</p>
                      <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-md border border-slate-100">{detalle.recomendaciones}</p>
                    </div>
                  )}
                </div>
              </Section>
            )}
          </div>
        </div>

        {/* Pie del modal (Fijo abajo) */}
        <div className="border-t border-slate-100 bg-white px-4 sm:px-6 py-4 shrink-0 flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="bg-navy hover:bg-navy/90 text-white font-bold shadow-sm">
            Cerrar Detalles
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// Subcomponente de Campo (Mejorado)
function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{k}</p>
      <div className="mt-1 text-sm font-semibold text-navy">{v}</div>
    </div>
  );
}

// Subcomponente de Checklist (Mejorado con overflow)
function ChecklistView({ items }: { items: { item: string; estado: string; obs: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-slate-500 border-b border-slate-200/50">
          <tr>
            <th className="py-2 font-bold uppercase text-[11px] tracking-wider min-w-[150px]">Actividad</th>
            <th className="py-2 font-bold uppercase text-[11px] tracking-wider w-28">Estado</th>
            <th className="py-2 font-bold uppercase text-[11px] tracking-wider">Observaciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/60">
          {items.map((i) => (
            <tr key={i.item} className="transition-colors hover:bg-white/50">
              <td className="py-2.5 text-navy font-semibold">{i.item}</td>
              <td className="py-2.5"><StatusBadge status={i.estado} /></td>
              <td className="py-2.5 text-slate-500 text-sm font-medium">{i.obs || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Configuración de Colores para las Secciones
const TONE: Record<string, string> = {
  teal: "border-teal/30 bg-teal-soft/20 shadow-sm",
  info: "border-blue-200 bg-blue-50 shadow-sm",
  warning: "border-amber-200 bg-amber-50 shadow-sm",
  danger: "border-red-200 bg-red-50 shadow-sm",
  success: "border-green-200 bg-green-50 shadow-sm",
  navy: "border-slate-200 bg-slate-100/50 shadow-sm",
};
const TONE_TEXT: Record<string, string> = {
  teal: "text-teal", info: "text-blue-700", warning: "text-amber-700",
  danger: "text-red-700", success: "text-green-700", navy: "text-navy",
};

// Subcomponente de Sección (Mejorado)
function Section({ icon: Icon, title, tone, children }: { icon: React.ComponentType<{ className?: string }>; title: string; tone: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${TONE[tone]}`}>
      <div className={`mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest ${TONE_TEXT[tone]}`}>
        <Icon className="size-4" strokeWidth={2.5} />
        {title}
      </div>
      {children}
    </div>
  );
}