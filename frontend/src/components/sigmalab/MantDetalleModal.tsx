import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Wrench, Cpu, Activity, AlertOctagon, Package, FileText } from "lucide-react";
import type { MantDetalle } from "@/lib/store";

export function MantDetalleModal({ detalle, open, onOpenChange }: { detalle: MantDetalle | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg"
      title={detalle ? `Detalle del mantenimiento — ${detalle.equipo}` : "Detalle"}
      description={detalle ? `${detalle.tipo} · ${detalle.fecha}` : ""}
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}>
      {detalle && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 text-xs md:grid-cols-4">
            <Field k="Equipo" v={detalle.equipo} />
            <Field k="Laboratorio" v={detalle.lab} />
            <Field k="Técnico" v={detalle.tecnico} />
            <Field k="Fecha" v={detalle.fecha} />
            {detalle.inicio && <Field k="Hora inicio" v={detalle.inicio} />}
            {detalle.fin && <Field k="Hora fin" v={detalle.fin} />}
            <Field k="Estado" v={<StatusBadge status={detalle.estado} />} />
            {detalle.tipoIncidencia && <Field k="Tipo incidencia" v={detalle.tipoIncidencia} />}
          </div>

          {detalle.tipo === "Correctivo" && (
            <div className="space-y-3">
              <Section icon={AlertOctagon} title="Descripción del problema" tone="danger">
                <p className="text-sm leading-relaxed text-foreground">{detalle.descripcion ?? "—"}</p>
              </Section>
              {detalle.diagnostico && (
                <Section icon={Cpu} title="Diagnóstico técnico" tone="info">
                  <p className="text-sm leading-relaxed text-foreground">{detalle.diagnostico}</p>
                </Section>
              )}
              {detalle.accion && (
                <Section icon={Wrench} title="Acción realizada" tone="success">
                  <p className="text-sm leading-relaxed text-foreground">{detalle.accion}</p>
                </Section>
              )}
              {detalle.componentes && detalle.componentes.length > 0 && (
                <Section icon={Cpu} title="Componentes afectados" tone="warning">
                  <div className="flex flex-wrap gap-2">
                    {detalle.componentes.map((c) => (
                      <span key={c} className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning">{c}</span>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {detalle.tipo === "Preventivo" && (
            <>
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
                  <ul className="space-y-2">
                    {detalle.incidencias.reduce((acc, i) => {
                      if (i.problema) {
                        acc.push(
                          <li key={i.problema} className="rounded-md border border-slate-100 bg-white p-2.5 text-xs">
                            <p className="font-semibold text-navy">Problema: <span className="font-normal text-foreground">{i.problema}</span></p>
                            <p className="mt-1 text-muted-foreground">Acción: {i.accion || "—"}</p>
                            {i.seguimiento && <span className="mt-1 inline-block rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold text-danger">Requiere seguimiento</span>}
                          </li>,
                        );
                      }
                      return acc;
                    }, [] as React.ReactNode[])}
                  </ul>
                </Section>
              )}
            </>
          )}

          {detalle.insumos && detalle.insumos.some((i) => i.insumo) && (
            <Section icon={Package} title="Insumos utilizados" tone="info">
              <table className="w-full text-xs">
                <thead className="text-left text-muted-foreground"><tr><th className="py-1">Insumo</th><th className="py-1">Cantidad</th><th className="py-1">Unidad</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {detalle.insumos.reduce((acc, i) => {
                    if (i.insumo) {
                      acc.push(<tr key={i.insumo}><td className="py-1.5 text-navy font-medium">{i.insumo}</td><td className="py-1.5">{i.cantidad}</td><td className="py-1.5 text-muted-foreground">{i.unidad}</td></tr>);
                    }
                    return acc;
                  }, [] as React.ReactNode[])}
                </tbody>
              </table>
            </Section>
          )}

          {(detalle.observaciones || detalle.recomendaciones) && (
            <Section icon={FileText} title="Notas" tone="navy">
              {detalle.observaciones && <div className="mb-2"><p className="text-xs font-semibold text-muted-foreground">Observaciones</p><p className="text-sm">{detalle.observaciones}</p></div>}
              {detalle.recomendaciones && <div><p className="text-xs font-semibold text-muted-foreground">Recomendaciones</p><p className="text-sm">{detalle.recomendaciones}</p></div>}
            </Section>
          )}
        </div>
      )}
    </Modal>
  );
}

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return <div><p className="font-semibold text-muted-foreground">{k}</p><div className="mt-0.5 font-bold text-navy">{v}</div></div>;
}

function ChecklistView({ items }: { items: { item: string; estado: string; obs: string }[] }) {
  return (
    <table className="w-full text-xs">
      <thead className="text-left text-muted-foreground"><tr><th className="py-1">Actividad</th><th className="py-1 w-24">Estado</th><th className="py-1">Observaciones</th></tr></thead>
      <tbody className="divide-y divide-slate-100">
        {items.map((i, idx) => (
          <tr key={i.item}>
            <td className="py-1.5 text-navy">{i.item}</td>
            <td className="py-1.5"><StatusBadge status={i.estado} /></td>
            <td className="py-1.5 text-muted-foreground">{i.obs || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const TONE: Record<string, string> = {
  teal: "border-teal/20 bg-teal-soft/30",
  info: "border-info/20 bg-info-soft/30",
  warning: "border-warning/20 bg-warning-soft/30",
  danger: "border-danger/20 bg-danger-soft/30",
  success: "border-success/20 bg-success-soft/30",
  navy: "border-slate-200 bg-slate-50",
};
const TONE_TEXT: Record<string, string> = {
  teal: "text-teal", info: "text-info", warning: "text-warning",
  danger: "text-danger", success: "text-success", navy: "text-navy",
};

function Section({ icon: Icon, title, tone, children }: { icon: React.ComponentType<{ className?: string }>; title: string; tone: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg border p-3.5 ${TONE[tone]}`}>
      <div className={`mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${TONE_TEXT[tone]}`}>
        <Icon className="size-3.5" />
        {title}
      </div>
      {children}
    </div>
  );
}
