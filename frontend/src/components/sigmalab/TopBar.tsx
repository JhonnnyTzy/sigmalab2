import { Bell, LogOut } from "lucide-react";
import { toast } from "sonner";
import { auth, useAuth, ROLE_LABEL } from "@/lib/auth";
import { useApp } from "@/lib/use-app";
import { useStore } from "@/lib/store";

export function TopBar() {
  const { user } = useAuth();
  const { setView, role } = useApp();
  const reportes = useStore((s) => s.reportesPasante);
  const asignaciones = useStore((s) => s.asignaciones);
  if (!user) return null;
  const initials = `${user.nombres[0] ?? ""}${user.paterno[0] ?? ""}`.toUpperCase();
  const displayName = [user.nombres, user.paterno, user.materno].filter(Boolean).join(" ");
  const showBell = role === "encargado" || role === "preventivo" || role === "correctivo";
  const cerrados = new Set(["Resuelto", "Completado"]);
  let count = 0;
  if (role === "encargado") {
    count = reportes.filter((r) => !cerrados.has(r.estado)).length;
  } else if (role === "preventivo") {
    count = asignaciones.filter((a) => a.asignadoA === "ysarzuri" && a.estado !== "Completado").length;
  } else if (role === "correctivo") {
    count = asignaciones.filter((a) => a.asignadoA === "jarias" && a.estado !== "Completado").length;
  }

  return (
    <header className="fixed top-0 right-0 left-60 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-card px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">SL</div>
        <span className="text-lg font-extrabold tracking-tight text-navy">SIGMALAB</span>
      </div>

      <div className="flex items-center gap-4">
        {showBell && (
          <button type="button"
            onClick={() => setView("incidencias-bandeja")}
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-slate-200 text-navy transition-colors hover:bg-slate-50"
            title={`${count} incidencia${count === 1 ? "" : "s"}`}
            aria-label="Notificaciones de incidencias"
          >
            <Bell className="size-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        )}
        <button type="button" onClick={() => setView("profile")} className="text-right hover:opacity-80">
          <p className="text-sm font-semibold text-navy">{displayName}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
        </button>
        <button type="button" onClick={() => setView("profile")} title="Mi Perfil" className="flex size-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white hover:opacity-80">{initials}</button>
        <button type="button"
          onClick={() => { auth.logout(); toast.success("Sesión cerrada"); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-slate-50"
          title="Cerrar sesión"
        >
          <LogOut className="size-3.5" /> Salir
        </button>
      </div>
    </header>
  );
}
