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
    <div className={cn("rounded-xl border border-slate-100 bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-navy">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
