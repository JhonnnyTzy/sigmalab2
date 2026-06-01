import { useState } from "react";
import { toast } from "sonner";
import { Eye, Wrench, Inbox, Activity } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { store, useStore, type Asignacion, type ReportePasante } from "@/lib/store";
import { useAuth, getSessionUsername } from "@/lib/auth";

type EstadoIncidencia = "Pendiente" | "En proceso" | "Completado";

export function BandejaCorrectivoView() {
  const { user } = useAuth();
  const asignaciones = useStore((s) => s.asignaciones);
  const reportes = useStore((s) => s.reportesPasante);

  const misAsignadas = asignaciones.filter((a) => a.asignadoA === user?.id || a.asignadoA === getSessionUsername(user));

  const [verAsig, setVerAsig] = useState<Asignacion | null>(null);
  const [resolverAsig, setResolverAsig] = useState<Asignacion | null>(null);
  const [verRep, setVerRep] = useState<ReportePasante | null>(null);
  const [resolverRep, setResolverRep] = useState<ReportePasante | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Incidencias</h1>
        <p className="text-sm text-muted-foreground">Tus incidencias asignadas e incidencias activas del sistema</p>
      </div>

      <Panel title={(<span className="flex items-center gap-2"><Inbox className="size-4 text-teal" /> Mis incidencias asignadas ({misAsignadas.length})</span>) as unknown as string}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Lab</th>
                <th className="px-4 py-3 font-semibold">Problema</th>
                <th className="px-4 py-3 font-semibold">Prioridad</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {misAsignadas.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-muted-foreground">{a.fecha}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-teal">{a.equipo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.lab}</td>
                  <td className="px-4 py-3 text-navy">{a.problema}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.prioridad} /></td>
                  <td className="px-4 py-3"><StatusBadge status={a.estado} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setVerAsig(a)}><Eye className="mr-1 size-3" /> Ver</Button>
                      <Button size="sm" className="bg-warning hover:bg-warning/90" onClick={() => setResolverAsig(a)}><Wrench className="mr-1 size-3" /> Resolver</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {misAsignadas.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Sin incidencias asignadas a tu cuenta</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title={(<span className="flex items-center gap-2"><Activity className="size-4 text-warning" /> Incidencias activas - todos los roles ({reportes.length})</span>) as unknown as string}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Reportada por</th>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Lab</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Prioridad</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportes.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-muted-foreground">{r.fecha}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.pasante}</td>
                  <td className="px-4 py-3 font-medium text-navy">{r.titulo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.laboratorio}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.categoria}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.prioridad} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.estado} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setVerRep(r)}><Eye className="mr-1 size-3" /> Ver</Button>
                      <Button size="sm" className="bg-warning hover:bg-warning/90" onClick={() => setResolverRep(r)}><Wrench className="mr-1 size-3" /> Resolver</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {reportes.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">Sin incidencias activas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={!!verAsig} onOpenChange={(v) => !v && setVerAsig(null)} title={`Detalle — ${verAsig?.equipo ?? ""}`}
        footer={<Button onClick={() => setVerAsig(null)}>Cerrar</Button>}>
        {verAsig && (
          <div className="space-y-3 text-sm">
            <Row k="Equipo" v={verAsig.equipo} />
            <Row k="Laboratorio" v={verAsig.lab} />
            <Row k="Asignado a" v={`@${verAsig.asignadoA}`} />
            <Row k="Fecha" v={verAsig.fecha} />
            <Row k="Prioridad" v={<StatusBadge status={verAsig.prioridad} />} />
            <Row k="Estado" v={<StatusBadge status={verAsig.estado} />} />
            <div><p className="text-xs font-semibold text-muted-foreground">Problema</p><p className="mt-1 rounded-md bg-slate-50 p-3 text-sm">{verAsig.problema}</p></div>
          </div>
        )}
      </Modal>

      <ResolverAsignacion asig={resolverAsig} onClose={() => setResolverAsig(null)} />

      <Modal open={!!verRep} onOpenChange={(v) => !v && setVerRep(null)} title={verRep?.titulo ?? "Detalle"}
        footer={<Button onClick={() => setVerRep(null)}>Cerrar</Button>}>
        {verRep && (
          <div className="space-y-3 text-sm">
            <Row k="Reportada por" v={verRep.pasante} />
            <Row k="Laboratorio" v={`${verRep.laboratorio} · ${verRep.ubicacion}`} />
            <Row k="Categoría" v={verRep.categoria} />
            <Row k="Prioridad" v={<StatusBadge status={verRep.prioridad} />} />
            <Row k="Estado" v={<StatusBadge status={verRep.estado} />} />
            <Row k="Fecha" v={verRep.fecha} />
            <div><p className="text-xs font-semibold text-muted-foreground">Descripción</p><p className="mt-1 rounded-md bg-slate-50 p-3">{verRep.descripcion}</p></div>
          </div>
        )}
      </Modal>

      <ResolverReporte rep={resolverRep} onClose={() => setResolverRep(null)} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-xs font-semibold text-muted-foreground">{k}</span>
      <span className="text-sm font-bold text-navy">{v}</span>
    </div>
  );
}

function ResolverAsignacion({ asig, onClose }: { asig: Asignacion | null; onClose: () => void }) {
  const [estado, setEstado] = useState<EstadoIncidencia>("En proceso");
  const [detalle, setDetalle] = useState("");

  const submit = async () => {
    if (!asig) return;
    if (!detalle.trim()) { toast.error("Agrega un detalle de resolución"); return; }
    try {
      await store.updateAsignacion(asig.id, { estado, resolucionDetalle: detalle });
      toast.success(`Incidencia marcada como ${estado}`);
      setDetalle(""); setEstado("En proceso"); onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Error al resolver incidencia");
    }
  };

  return (
    <Modal open={!!asig} onOpenChange={(v) => !v && onClose()} title={`Resolver — ${asig?.equipo ?? ""}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button><Button className="bg-navy" onClick={submit}>Guardar resolución</Button></>}>
      {asig && (
        <div className="space-y-4">
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-navy">{asig.equipo} · {asig.lab}</p>
            <p className="mt-1 text-xs text-muted-foreground">{asig.problema}</p>
          </div>
          <FormField label="Cambiar estado" required>
            <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoIncidencia)} className={inputCls} aria-label="Cambiar estado">
              <option>Pendiente</option><option>En proceso</option><option>Completado</option>
            </select>
          </FormField>
          <FormField label="Detalle de la acción / resolución" required>
            <textarea rows={4} value={detalle} onChange={(e) => setDetalle(e.target.value)} className={inputCls} placeholder="Describe la acción, repuestos, observaciones..." aria-label="Detalle de la acción" />
          </FormField>
        </div>
      )}
    </Modal>
  );
}

function ResolverReporte({ rep, onClose }: { rep: ReportePasante | null; onClose: () => void }) {
  const [estado, setEstado] = useState<EstadoIncidencia>("En proceso");
  const [detalle, setDetalle] = useState("");

  const submit = async () => {
    if (!rep) return;
    if (!detalle.trim()) { toast.error("Agrega un detalle de resolución"); return; }
    try {
      await store.updateReportePasante(rep.id, { estado, resolucionDetalle: detalle });
      toast.success(`Incidencia marcada como ${estado}`);
      setDetalle(""); setEstado("En proceso"); onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Error al resolver reporte");
    }
  };

  return (
    <Modal open={!!rep} onOpenChange={(v) => !v && onClose()} title={`Resolver — ${rep?.titulo ?? ""}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button><Button className="bg-navy" onClick={submit}>Guardar resolución</Button></>}>
      {rep && (
        <div className="space-y-4">
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-navy">{rep.titulo} · {rep.laboratorio}</p>
            <p className="mt-1 text-xs text-muted-foreground">{rep.descripcion}</p>
          </div>
          <FormField label="Cambiar estado" required>
            <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoIncidencia)} className={inputCls} aria-label="Cambiar estado">
              <option>Pendiente</option><option>En proceso</option><option>Completado</option>
            </select>
          </FormField>
          <FormField label="Detalle de la acción" required>
            <textarea rows={4} value={detalle} onChange={(e) => setDetalle(e.target.value)} className={inputCls} placeholder="Acciones tomadas, hallazgos, recomendaciones..." aria-label="Detalle de la acción" />
          </FormField>
        </div>
      )}
    </Modal>
  );
}
