import { useApp } from "@/lib/use-app";
import { getViewLabel } from "./sidebar-utils";

export function Breadcrumb() {
  const { role, view } = useApp();
  const label = getViewLabel(role, view);
  return (
    <nav className="flex items-center gap-2 text-sm">
      <span className="font-semibold text-navy">SIGMALAB</span>
      <span className="text-slate-300">/</span>
      <span className="text-muted-foreground">{label}</span>
    </nav>
  );
}
