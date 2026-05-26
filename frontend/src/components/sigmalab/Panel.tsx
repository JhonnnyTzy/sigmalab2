import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Panel({ title, children, action, className }: PanelProps) {
  return (
    <div className={cn("rounded-xl border border-slate-100 bg-card shadow-sm w-full overflow-hidden", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-4 sm:px-5 py-4 gap-3 sm:gap-0">
        <h3 className="text-base font-semibold text-navy">{title}</h3>
        {/* Si hay un botón de acción, en móvil se alineará mejor */}
        {action && <div className="self-end sm:self-auto">{action}</div>}
      </div>
      {/* Añadimos overflow-x-auto para que tablas/gráficos grandes hagan scroll en móvil */}
      <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar w-full">
        {children}
      </div>
    </div>
  );
}