import { Bell, LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { auth, useAuth, ROLE_LABEL } from "@/lib/auth";
import { useApp } from "@/lib/use-app";
import { useStore } from "@/lib/store";

interface TopBarProps {
  onOpenSidebar?: () => void;
}

export function TopBar({ onOpenSidebar }: TopBarProps) {
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
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6 shadow-sm transition-all duration-300">
      
      <div className="flex items-center gap-2">
        {/* Botón Hamburguesa: visible solo en móviles */}
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-2 text-navy hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="size-6" />
        </button>

        {/* Logo y título RESTAURADOS */}
        <div className="flex items-center gap-2">
          <img 
            src="/logosvg.png" 
            alt="SIGMALAB Logo" 
            className="h-8 sm:h-10 w-auto object-contain drop-shadow-md transition-all" 
          />
          {/* EL TEXTO VOLVIÓ: Ahora siempre visible, adaptando su tamaño al dispositivo */}
          <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-navy transition-all">
            SIGMALAB
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {showBell && (
          <button type="button"
            onClick={() => setView("incidencias-bandeja")}
            className="relative inline-flex size-9 sm:size-10 items-center justify-center rounded-full border border-slate-200 text-navy transition-colors hover:bg-slate-50 shadow-sm"
            title={`${count} incidencia${count === 1 ? "" : "s"}`}
          >
            <Bell className="size-4 sm:size-4.5 text-slate-600" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[9px] sm:text-[10px] font-bold leading-none text-white shadow-md">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        )}
        
        {/* Info del usuario (Se oculta en móvil para que no choque con el logo) */}
        <button type="button" onClick={() => setView("profile")} className="text-right hover:opacity-80 hidden md:block">
          <p className="text-sm font-bold text-navy">{displayName}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{ROLE_LABEL[user.role]}</p>
        </button>
        
        {/* Perfil de usuario (Iniciales) */}
        <button type="button" onClick={() => setView("profile")} title="Mi Perfil" className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-gradient-to-br from-navy to-blue-800 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105">
          {initials}
        </button>
        
        {/* Botón Salir */}
        <button type="button"
          onClick={() => { auth.logout(); toast.success("Sesión cerrada"); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 sm:px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-danger hover:border-danger/30"
          title="Cerrar sesión"
        >
          <LogOut className="size-3.5 sm:size-4" /> 
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}