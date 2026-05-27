import { useState, useMemo } from "react";
import { Monitor, AlertCircle, XCircle, Users, AlertTriangle, Inbox } from "lucide-react";
import { toast } from "sonner";
import { MetricCard } from "@/components/sigmalab/MetricCard";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { MantDetalleModal } from "@/components/sigmalab/MantDetalleModal";
import { useApp } from "@/lib/use-app";
import { useStore, type MantDetalle } from "@/lib/store";
import { cn } from "@/lib/utils";
import { EncargadoCharts } from "./EncargadoCharts";

export function EncargadoDashboard() {
  const { setView } = useApp();
  const equipos = useStore((s) => s.equipos);
  const mantenimientos = useStore((s) => s.mantenimientos);
  const labs = useStore((s) => s.labs);
  const usuarios = useStore((s) => s.usuarios);
  const reportes = useStore((s) => s.reportesPasante);
  const detalles = useStore((s) => s.detalles);

  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes">("mes");
  const [detalleSel, setDetalleSel] = useState<MantDetalle | null>(null);

  const totalEquipos = equipos.length;
  const enMant = equipos.filter((e) => e.estado === "En mantenimiento").length;
  const deBaja = equipos.filter((e) => e.estado === "De baja").length;
  const funcionando = equipos.filter((e) => e.estado === "Funcionando").length;
  const pendientes = equipos.filter((e) => e.estado === "Pendiente" || e.estado === "En espera repuesto").length;
  const pasantesActivos = usuarios.filter(
    (u) => u.estado === "Activo" && (u.rol === "Pasante Preventivo" || u.rol === "Pasante Correctivo"),
  ).length;
  const incidenciasNuevas = reportes.filter((r) => r.estado === "Nuevo").length;
  const incidenciasEnProceso = reportes.filter((r) => r.estado === "En proceso" || r.estado === "Pendiente").length;

  // Mant por laboratorio (real, desde mantenimientos)
  const mantPorLab = useMemo(() => {
    return labs.map((l) => {
      const total = mantenimientos.filter((m) => m.lab.toLowerCase().includes(l.nombre.toLowerCase())).length;
      const factor = periodo === "dia" ? 0.15 : periodo === "semana" ? 0.45 : 1;
      return { lab: l.nombre, total: Math.max(total, Math.round((total + 5) * factor)) };
    });
  }, [labs, mantenimientos, periodo]);

  // Estados de equipos
  const estados = useMemo(() => [
    { name: "Funcionando", value: funcionando, color: "#16A34A" },
    { name: "En mantenimiento", value: enMant, color: "#F59E0B" },
    { name: "Pendiente", value: pendientes, color: "#2563EB" },
    { name: "De baja", value: deBaja, color: "#64748B" },
  ].filter((e) => e.value > 0), [funcionando, enMant, pendientes, deBaja]);

  // Tendencia de mantenimientos (últimos 7 días/semanas/meses simulados)
  const tendencia = useMemo(() => {
    const labels = periodo === "dia"
      ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
      : periodo === "semana"
      ? ["S1", "S2", "S3", "S4"]
      : ["Nov", "Dic", "Ene", "Feb", "Mar", "Abr"];
    return labels.map((l, i) => ({
      name: l,
      preventivos: Math.round(3 + Math.sin(i + 1) * 2 + i * 0.5),
      correctivos: Math.round(2 + Math.cos(i + 1) * 1.5 + i * 0.3),
    }));
  }, [periodo]);

  // Distribución por tipo
  const tipoData = useMemo(() => [
    { name: "Preventivos", value: mantenimientos.filter((m) => m.tipo === "Preventivo").length },
    { name: "Correctivos", value: mantenimientos.filter((m) => m.tipo === "Correctivo").length },
  ], [mantenimientos]);

  // Top técnicos
  const topTecnicos = useMemo(() => {
    const map = new Map<string, number>();
    mantenimientos.forEach((m) => map.set(m.tecnico, (map.get(m.tecnico) ?? 0) + 1));
    return [...map.entries()].toSorted((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  }, [mantenimientos]);

  const openDetalleMant = (equipo: string) => {
    const d = detalles.find((x) => x.equipo === equipo) ?? detalles[0];
    if (d) setDetalleSel(d);
    else toast.info(`Sin detalle registrado para ${equipo}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">Dashboard Encargado</h1>
          <p className="text-sm text-muted-foreground">Vista general del sistema SIGMALAB</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Período:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            {(["dia", "semana", "mes"] as const).map((p) => (
              <button type="button" key={p} onClick={() => setPeriodo(p)}
                className={cn("rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  periodo === p ? "bg-navy text-white" : "text-muted-foreground hover:text-navy")}>
                {p === "dia" ? "Día" : p === "semana" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 1 — KPIs principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <button type="button" onClick={() => setView("equipos")} className="text-left"><MetricCard title="Total Equipos" value={totalEquipos} icon={Monitor} accent="teal" /></button>
        <button type="button" onClick={() => setView("usuarios")} className="text-left"><MetricCard title="Pasantes activos" value={pasantesActivos} icon={Users} accent="info" /></button>
        <button type="button" onClick={() => setView("equipos")} className="text-left"><MetricCard title="En mantenimiento" value={enMant} icon={AlertCircle} accent="warning" /></button>
        <button type="button" onClick={() => setView("equipos")} className="text-left"><MetricCard title="De baja" value={deBaja} icon={XCircle} accent="danger" /></button>
        <button type="button" onClick={() => setView("incidencias-bandeja")} className="text-left"><MetricCard title="Incidencias nuevas" value={incidenciasNuevas} icon={Inbox} accent="danger" /></button>
        <button type="button" onClick={() => setView("incidencias-bandeja")} className="text-left"><MetricCard title="Incidencias en proceso" value={incidenciasEnProceso} icon={AlertTriangle} accent="warning" /></button>
      </div>

      <EncargadoCharts
        mantPorLab={mantPorLab}
        periodo={periodo}
        setPeriodo={setPeriodo}
        estados={estados}
        tendencia={tendencia}
        tipoData={tipoData}
        topTecnicos={topTecnicos}
      />

      {/* Row 5 — últimos mantenimientos clicables */}
      <div className="grid grid-cols-1 gap-6">
        <Panel title="Últimos mantenimientos · clic para ver detalle">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2 font-semibold">Equipo</th>
                  <th className="pb-2 font-semibold">Lab</th>
                  <th className="pb-2 font-semibold">Técnico</th>
                  <th className="pb-2 font-semibold">Tipo</th>
                  <th className="pb-2 font-semibold">Fecha</th>
                  <th className="pb-2 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mantenimientos.slice(0, 6).map((m, i) => (
                  <tr key={m.equipo + m.fecha} onClick={() => openDetalleMant(m.equipo)} className="cursor-pointer transition-colors hover:bg-teal-soft/40">
                    <td className="py-2.5 font-mono text-xs font-bold text-teal">{m.equipo}</td>
                    <td className="py-2.5 text-muted-foreground">{m.lab}</td>
                    <td className="py-2.5 text-muted-foreground">{m.tecnico}</td>
                    <td className="py-2.5"><StatusBadge status={m.tipo} /></td>
                    <td className="py-2.5 text-muted-foreground">{m.fecha}</td>
                    <td className="py-2.5"><StatusBadge status={m.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* Modal detalle mantenimiento */}
      <MantDetalleModal detalle={detalleSel} open={!!detalleSel} onOpenChange={(v) => !v && setDetalleSel(null)} />
    </div>
  );
}
