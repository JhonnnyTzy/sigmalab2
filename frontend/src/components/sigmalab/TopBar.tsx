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
    <header className="fixed top-0 right-0 left-60 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-card px-6 shadow-sm">
      <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
        {/* Usamos classes responsivas para a altura */}
        <img 
          src="/logosvg.png" 
          alt="SIGMALAB Logo" 
          // Base (mobile): h-10 (40px)
          // sm: h-12 (48px)
          // lg: h-14 (56px, quase preenche o cabeçalho de 64px)
          className="h-10 w-auto sm:h-12 lg:h-14 object-contain drop-shadow-md transition-all duration-300" 
        />
        <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-navy transition-all duration-300">
          SIGMALAB
        </span>
      </div>

      <div className="flex items-center gap-4">
        {showBell && (
          <button type="button"
            onClick={() => setView("incidencias-bandeja")}
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-slate-200 text-navy transition-colors hover:bg-slate-50 shadow-sm"
            title={`${count} incidencia${count === 1 ? "" : "s"}`}
            aria-label="Notificaciones de incidencias"
          >
            <Bell className="size-4.5 text-slate-600" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white shadow-md">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        )}
        <button type="button" onClick={() => setView("profile")} className="text-right hover:opacity-80">
          <p className="text-sm font-bold text-navy">{displayName}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{ROLE_LABEL[user.role]}</p>
        </button>
        <button type="button" onClick={() => setView("profile")} title="Mi Perfil" className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-navy to-blue-800 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105">
          {initials}
        </button>
        <button type="button"
          onClick={() => { auth.logout(); toast.success("Sesión cerrada"); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-danger hover:border-danger/30"
          title="Cerrar sesión"
        >
          <LogOut className="size-4" /> Salir
        </button>
      </div>
    </header>
  );
}