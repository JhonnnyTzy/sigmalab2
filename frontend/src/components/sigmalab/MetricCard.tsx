import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "teal" | "info" | "warning" | "danger" | "success";
}

const ACCENT: Record<string, string> = {
  teal: "bg-teal-soft text-teal",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
};

export function MetricCard({ title, value, icon: Icon, accent = "teal" }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-navy">{value}</p>
        </div>
        <div className={cn("flex size-11 items-center justify-center rounded-lg", ACCENT[accent])}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
