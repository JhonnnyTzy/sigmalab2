import { Package } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function InsumosDisponiblesView() {
  const insumos = useStore((s) => s.insumos);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Insumos disponibles</h1>
        <p className="text-sm text-muted-foreground">Consulta el stock disponible para tus mantenimientos</p>
      </div>

      <Panel title="Stock actual">
        <ul className="divide-y divide-slate-100">
          {insumos.map((i) => {
            const pct = Math.min(100, Math.round((i.stock / (i.minimo * 4)) * 100));
            const low = i.stock < i.minimo;
            return (
              <li key={i.nombre} className="flex items-center gap-4 py-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-teal-soft text-teal"><Package className="size-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-navy">{i.nombre}</p>
                    <span className={cn("text-sm font-bold", low ? "text-danger" : "text-navy")}>{i.stock} {i.unidad}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn("h-full rounded-full", low ? "bg-danger" : "bg-teal")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
