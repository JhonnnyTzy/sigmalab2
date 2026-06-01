import { useMemo, useState } from "react";
import { Wrench, AlertTriangle, CheckCircle2, Clock, Inbox, PenTool, AlertCircle } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { MetricCard } from "@/components/sigmalab/MetricCard";
import { useStore } from "@/lib/store";
import { useApp } from "@/lib/use-app";
import { useAuth, getSessionFullName, getSessionUsername } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { CorrectivoCharts } from "./CorrectivoCharts";

type Intervalo = "dia" | "semana" | "mes";

function parseFecha(f: string): Date | null {
  const [d, m, y] = f.split("/");
  if (!d || !m || !y) return null;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

const norm = (e: string) => (e === "Resuelto" || e === "Completado") ? "Completado" : e === "En proceso" ? "En proceso" : "Pendiente";

export function CorrectivoDashboard() {
  const { user } = useAuth();
  const { setView } = useApp();
  const histCorrectivos = useStore((s) => s.histCorrectivos);
  const mantenimientos = useStore((s) => s.mantenimientos);
  const asignaciones = useStore((s) => s.asignaciones);
  const [intervalo, setIntervalo] = useState<Intervalo>("mes");

  const tecnicoName = getSessionFullName(user);
  const nombreCompleto = user ? `${user.nombres} ${user.paterno}`.toLowerCase() : "";
  const misHist = useMemo(() => histCorrectivos.filter((h) => h.tecnico === tecnicoName), [histCorrectivos, tecnicoName]);
  const misAsignados = [
    ...mantenimientos.filter((m) => m.estado === "Nuevo mantenimiento asignado" && m.tecnico?.toLowerCase().includes(nombreCompleto)),
    ...asignaciones.filter((a) => (a.asignadoA === user?.id || a.asignadoA === getSessionUsername(user)) && (a.estado === "Pendiente" || a.estado === "En proceso")),
  ];
  const pendientes = misAsignados.length;
  const enProceso = misHist.filter((h) => norm(h.estado) === "En proceso").length;
  const completados = misHist.filter((h) => norm(h.estado) === "Completado").length;

  // Serie temporal según intervalo
  const serie = useMemo(() => {
    const buckets = new Map<string, { label: string; total: number; ord: number }>();
    misHist.forEach((h) => {
      const d = parseFecha(h.fecha); if (!d) return;
      let key = "", label = "", ord = 0;
      if (intervalo === "dia") {
        key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        ord = d.getTime();
      } else if (intervalo === "semana") {
        const tmp = new Date(d);
        const day = (tmp.getDay() + 6) % 7;
        tmp.setDate(tmp.getDate() - day);
        key = `${tmp.getFullYear()}-W${tmp.getMonth()}-${tmp.getDate()}`;
        label = `Sem ${String(tmp.getDate()).padStart(2, "0")}/${String(tmp.getMonth() + 1).padStart(2, "0")}`;
        ord = tmp.getTime();
      } else {
        key = `${d.getFullYear()}-${d.getMonth()}`;
        const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
        label = `${meses[d.getMonth()]} ${d.getFullYear()}`;
        ord = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      }
      const prev = buckets.get(key);
      if (prev) prev.total += 1;
      else buckets.set(key, { label, total: 1, ord });
    });
    return [...buckets.values()].toSorted((a, b) => a.ord - b.ord);
  }, [misHist, intervalo]);

  const estados = useMemo(() => [
    { name: "Completados", value: completados, color: "#16A34A" },
    { name: "En proceso", value: enProceso, color: "#F59E0B" },
    { name: "Pendientes", value: pendientes, color: "#DC2626" },
  ].filter((x) => x.value > 0), [completados, enProceso, pendientes]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-navy">Buenos días, {getSessionFullName(user)}</h1>
        <p className="text-sm text-muted-foreground">ITIC Laboratorios · Pasante Correctivo</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <button type="button" onClick={() => setView("asignados")} className="text-left"><MetricCard title="Equipos asignados" value={misAsignados.length} icon={Inbox} accent="warning" /></button>
        <button type="button" onClick={() => setView("asignados")} className="text-left"><MetricCard title="Pendientes" value={pendientes} icon={AlertTriangle} accent="danger" /></button>
        <button type="button" onClick={() => setView("mis-correctivos")} className="text-left"><MetricCard title="En proceso" value={enProceso} icon={Clock} accent="info" /></button>
        <button type="button" onClick={() => setView("mis-correctivos")} className="text-left"><MetricCard title="Completados" value={completados} icon={CheckCircle2} accent="teal" /></button>
      </div>

        <CorrectivoCharts serie={serie} intervalo={intervalo} setIntervalo={setIntervalo} estados={estados} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title={`Mis equipos asignados (${misAsignados.length})`}
          action={<button type="button" onClick={() => setView("asignados")} className="text-xs font-semibold text-teal hover:underline">Ver todos →</button>}>
          {misAsignados.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No tienes equipos asignados</p>
          ) : (
            <ul className="space-y-2">
              {misAsignados.slice(0, 5).map((it, i) => (
                <li key={i} className={cn("rounded-lg border-l-4 bg-white p-3", "equipo" in it ? "border-l-teal" : "prioridad" in it && (it as any).prioridad === "Alta" ? "border-l-danger" : "border-l-warning")}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-teal">{(it as any).equipo}</p>
                      <p className="text-xs text-muted-foreground">{(it as any).lab} · {(it as any).fecha}</p>
                      <p className="mt-1 line-clamp-1 text-xs">{(it as any).problema || (it as any).tipo}</p>
                    </div>
                    <button type="button" onClick={() => setView("asignados")} className="shrink-0 rounded-md bg-warning px-2.5 py-1 text-xs font-bold text-white hover:opacity-90">Ver</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Acciones rápidas">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setView("nuevo-correctivo")} className="flex flex-col items-center gap-2 rounded-xl border-2 border-warning/40 bg-warning-soft p-5 text-warning hover:border-warning"><PenTool className="size-7" /><span className="text-sm font-bold">Nuevo mantenimiento</span></button>
            <button type="button" onClick={() => setView("asignados")} className="flex flex-col items-center gap-2 rounded-xl border-2 border-info/40 bg-info-soft p-5 text-info hover:border-info"><Inbox className="size-7" /><span className="text-sm font-bold">Mis asignados</span></button>
            <button type="button" onClick={() => setView("incidencias-bandeja")} className="flex flex-col items-center gap-2 rounded-xl border-2 border-danger/40 bg-danger-soft p-5 text-danger hover:border-danger"><AlertCircle className="size-7" /><span className="text-sm font-bold">Incidencias</span></button>
            <button type="button" onClick={() => setView("mis-correctivos")} className="flex flex-col items-center gap-2 rounded-xl border-2 border-teal/40 bg-teal-soft p-5 text-teal hover:border-teal"><Wrench className="size-7" /><span className="text-sm font-bold">Mis mantenimientos</span></button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
