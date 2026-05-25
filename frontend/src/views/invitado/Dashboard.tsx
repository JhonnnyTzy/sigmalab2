import { Building2, Monitor, Wrench, AlertTriangle } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { MetricCard } from "@/components/sigmalab/MetricCard";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { useStore } from "@/lib/store";

export function InvitadoDashboard() {
  const labs = useStore((s) => s.labs);
  const equipos = useStore((s) => s.equipos);
  const mantenimientos = useStore((s) => s.mantenimientos);
  const incidencias = useStore((s) => s.incidencias);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Dashboard (modo lectura)</h1>
        <p className="text-sm text-muted-foreground">Vista pública de SIGMALAB - sin permisos de modificación</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard title="Laboratorios" value={labs.length} icon={Building2} />
        <MetricCard title="Equipos registrados" value={equipos.length} icon={Monitor} />
        <MetricCard title="Mantenimientos recientes" value={mantenimientos.length} icon={Wrench} />
        <MetricCard title="Incidencias activas" value={incidencias.length} icon={AlertTriangle} />
      </div>

      <Panel title="Últimos mantenimientos">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Lab</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mantenimientos.slice(0, 8).map((m, i) => (
                <tr key={m.equipo + m.fecha}>
                  <td className="px-4 py-3 font-mono text-xs text-teal">{m.equipo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.lab}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.tipo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.fecha}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
