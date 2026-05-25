import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export function MisIncidenciasView() {
  const { user } = useAuth();
  const reportes = useStore((s) => s.reportesPasante);
  const mine = user
    ? reportes.filter((r) => r.pasante.includes(user.nombres) && r.pasante.includes(user.paterno))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Mis incidencias</h1>
        <p className="text-sm text-muted-foreground">Incidencias que has reportado</p>
      </div>
      <Panel title={`${mine.length} reporte${mine.length !== 1 ? "s" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Laboratorio</th>
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Prioridad</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mine.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-muted-foreground">{r.fecha}</td>
                  <td className="px-4 py-3 font-medium text-navy">{r.titulo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.laboratorio}</td>
                  <td className="px-4 py-3 font-mono text-xs text-teal">{r.ubicacion}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.prioridad} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.estado} /></td>
                </tr>
              ))}
              {mine.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">Aún no has reportado incidencias</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
