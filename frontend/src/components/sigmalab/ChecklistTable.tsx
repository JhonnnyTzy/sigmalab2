import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

const COLORS: Record<string, string> = {
  OK: "bg-success text-white",
  Regular: "bg-warning text-white",
  Pendiente: "bg-info text-white",
};

export function PillSelector({ options, value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-0.5">
      {options.map((opt) => (
        <button type="button" key={opt}
          
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
            value === opt ? COLORS[opt] : "text-muted-foreground hover:text-navy",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function ChecklistTable({ items, estados, observaciones, onEstadoChange, onObsChange }: {
  items: string[]; estados: Record<string, string>; observaciones: Record<string, string>;
  onEstadoChange: (item: string, estado: string) => void; onObsChange?: (item: string, obs: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-100">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Actividad</th>
            <th className="px-4 py-2.5 font-semibold">Estado</th>
            <th className="px-4 py-2.5 font-semibold">Observaciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {items.map((item) => (
            <tr key={item}>
              <td className="px-4 py-2.5 text-sm font-medium text-navy">{item}</td>
              <td className="px-4 py-2.5">
                <PillSelector
                  options={["OK", "Regular", "Pendiente"]}
                  value={estados[item] ?? ""}
                  onChange={(v) => onEstadoChange(item, v)}
                />
              </td>
              <td className="px-4 py-2.5">
                <input value={observaciones[item] ?? ""} onChange={(e) => onObsChange?.(item, e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs" placeholder="Sin observaciones" aria-label="Observaciones" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
