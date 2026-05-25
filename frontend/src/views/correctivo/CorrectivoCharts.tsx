import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "@/components/ui/recharts-lazy";
import { Panel } from "@/components/sigmalab/Panel";
import { cn } from "@/lib/utils";

type Intervalo = "dia" | "semana" | "mes";

export function CorrectivoCharts({ serie, intervalo, setIntervalo, estados }: {
  serie: { label: string; total: number; ord: number }[];
  intervalo: Intervalo;
  setIntervalo: (v: Intervalo) => void;
  estados: { name: string; value: number; color: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Panel title={`Mis mantenimientos (${intervalo === "dia" ? "por día" : intervalo === "semana" ? "por semana" : "por mes"})`} className="lg:col-span-2"
        action={
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5 text-xs">
            {(["dia","semana","mes"] as Intervalo[]).map((intervaloOpt) => (
              <button type="button" key={intervaloOpt} onClick={() => setIntervalo(intervaloOpt)}
                className={cn("rounded px-3 py-1 font-semibold transition-colors", intervalo === intervaloOpt ? "bg-warning text-white" : "text-muted-foreground hover:text-navy")}>
                {intervaloOpt === "dia" ? "Día" : intervaloOpt === "semana" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        }>
        <div className="h-64">
          {serie.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin mantenimientos registrados</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="total" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      <Panel title="Mi distribución">
        <div className="h-64">
          {estados.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={estados} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {estados.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>
    </div>
  );
}
