import { useState } from "react";
import { useApp } from "@/lib/use-app";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
import { MENUS } from "./sidebar-utils";

// Añadimos props para controlar el Sidebar desde móvil
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { role, view, setView } = useApp();
  const items = MENUS[role] ?? [];
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ mantenimientos: true });

  return (
    <>
      {/* Fondo oscuro para móvil (Overlay). Solo se ve si está abierto en pantallas pequeñas */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-navy/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full" // Controla si se ve o se oculta en móvil
        )}
      >
        {/* Zona del Header del Sidebar (Logo, Título y Botón Cerrar en móvil) */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <img 
              src="/logosvg.png" 
              alt="SIGMALAB Logo" 
              className="h-10 w-auto object-contain invert brightness-0" 
            />
            <span className="text-xl font-extrabold tracking-tight text-white">
              SIGMALAB
            </span>
          </div>
          {/* Botón para cerrar en móvil */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1 text-sidebar-foreground/70 hover:text-white rounded-md hover:bg-white/10"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 custom-scrollbar">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            const hasChildren = !!item.children;
            const isChildActive = item.children?.some((c) => c.id === view);
            const isOpenGroup = openGroups[item.id] ?? isChildActive;

            return (
              <div key={item.id}>
                <button type="button"
                  onClick={() => {
                    if (hasChildren) setOpenGroups((g) => ({ ...g, [item.id]: !isOpenGroup }));
                    else {
                      setView(item.id);
                      if (onClose) onClose(); // Cierra el menú en móvil al hacer clic en un enlace
                    }
                  }}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    (isActive || isChildActive)
                      ? "bg-teal text-white shadow-md shadow-teal/20"
                      : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-white",
                    item.highlight && !isActive && "ring-1 ring-teal/50",
                  )}
                >
                  {(isActive || isChildActive) && <span className="absolute top-1 bottom-1 left-0 w-1 rounded-r bg-white/50" />}
                  <Icon className={cn("size-4.5 shrink-0 transition-transform group-hover:scale-110", item.highlight && "text-teal", isActive && "text-white")} strokeWidth={2} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasChildren && <ChevronDown className={cn("size-4 transition-transform duration-300", isOpenGroup && "rotate-180")} />}
                </button>

                {hasChildren && isOpenGroup && (
                  <div className="mt-1 ml-7 space-y-1 border-l border-white/10 pl-3">
                    {item.children!.map((child) => {
                      const childActive = view === child.id;
                      return (
                        <button type="button" key={child.id} 
                          onClick={() => {
                            setView(child.id);
                            if (onClose) onClose(); // Cierra menú al hacer clic
                          }}
                          className={cn(
                            "block w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-all duration-200",
                            childActive 
                              ? "bg-white/15 text-white font-semibold" 
                              : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-white",
                          )}>
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Pie del Sidebar */}
        <div className="border-t border-sidebar-border bg-black/10 p-4 text-[11px] text-sidebar-foreground/60 shrink-0">
          <p className="font-bold text-white/90 tracking-wide">ITIC Laboratorios</p>
          <p className="text-white/50 font-medium mt-0.5">Universidad Mayor de San Andrés</p>
        </div>
      </aside>
    </>
  );
}