import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from "@/components/ui/recharts-lazy";
import { Panel } from "@/components/sigmalab/Panel";

const COLORS = ["#1E2761", "#0D9488", "#F59E0B", "#DC2626", "#2563EB", "#16A34A", "#64748B"];

export function EncargadoCharts({ mantPorLab, periodo, setPeriodo, estados, tendencia, tipoData, topTecnicos }: {
  mantPorLab: { lab: string; total: number }[];
  periodo: "dia" | "semana" | "mes";
  setPeriodo: (p: "dia" | "semana" | "mes") => void;
  estados: { name: string; value: number; color: string }[];
  tendencia: { name: string; preventivos: number; correctivos: number }[];
  tipoData: { name: string; value: number }[];
  topTecnicos: { name: string; count: number }[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title={`Mantenimientos por laboratorio · ${periodo === "dia" ? "Hoy" : periodo === "semana" ? "Semana" : "Mes"}`} className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mantPorLab} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="lab" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip cursor={{ fill: "rgba(13,148,136,0.08)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="total" fill="#1E2761" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Estado actual de equipos">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={estados} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={2}>
                  {estados.map((e) => (<Cell key={e.name} fill={e.color} />))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Tendencia de mantenimientos">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendencia} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gp" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0D9488" stopOpacity={0.5} /><stop offset="100%" stopColor="#0D9488" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gc" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.5} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="preventivos" stroke="#0D9488" fill="url(#gp)" />
                <Area type="monotone" dataKey="correctivos" stroke="#F59E0B" fill="url(#gc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Distribución por tipo">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tipoData} dataKey="value" nameKey="name" outerRadius={75} label>
                  {tipoData.map((item) => <Cell key={item.name} fill={COLORS[0]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top técnicos">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTecnicos} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={100} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="count" fill="#0D9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
