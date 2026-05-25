import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, string> = {
  Funcionando: "bg-success-soft text-success",
  Completado: "bg-success-soft text-success",
  Resuelto: "bg-success-soft text-success",
  Activo: "bg-success-soft text-success",
  "En proceso": "bg-warning-soft text-warning",
  "En mantenimiento": "bg-warning-soft text-warning",
  Pendiente: "bg-info-soft text-info",
  "Pendiente repuesto": "bg-danger-soft text-danger",
  "En espera repuesto": "bg-danger-soft text-danger",
  "De baja": "bg-slate-200 text-slate-700",
  Inactivo: "bg-slate-200 text-slate-700",
  Escalado: "bg-danger-soft text-danger",
  Preventivo: "bg-teal-soft text-teal",
  Correctivo: "bg-warning-soft text-warning",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const styles = STATUS_MAP[status] ?? "bg-slate-100 text-slate-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles,
        className,
      )}
    >
      {status}
    </span>
  );
}
