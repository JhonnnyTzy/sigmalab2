import { useState } from "react";
import { useApp } from "@/lib/use-app";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { MENUS } from "./sidebar-utils";

export function Sidebar() {
  const { role, view, setView } = useApp();
  const items = MENUS[role] ?? [];
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ mantenimientos: true });

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
      {/* Zona del Header del Sidebar (Logo y Título) */}
      <div className="flex h-16 items-center gap-1 sm:gap-2 border-b border-sidebar-border px-4 transition-all">
        {/* Logo renderizado en blanco puro con tamaño ajustado */}
        <img 
          src="/logosvg.png" 
          alt="SIGMALAB Logo" 
          className="h-10 w-auto sm:h-12 object-contain invert brightness-0 transition-transform hover:scale-105" 
        />
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white transition-all">
          SIGMALAB
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 custom-scrollbar">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          const hasChildren = !!item.children;
          const isChildActive = item.children?.some((c) => c.id === view);
          const isOpen = openGroups[item.id] ?? isChildActive;

          return (
            <div key={item.id}>
              <button type="button"
                onClick={() => {
                  if (hasChildren) setOpenGroups((g) => ({ ...g, [item.id]: !isOpen }));
                  else setView(item.id);
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
                {hasChildren && <ChevronDown className={cn("size-4 transition-transform duration-300", isOpen && "rotate-180")} />}
              </button>

              {hasChildren && isOpen && (
                <div className="mt-1 ml-7 space-y-1 border-l border-white/10 pl-3">
                  {item.children!.map((child) => {
                    const childActive = view === child.id;
                    return (
                      <button type="button" key={child.id} onClick={() => setView(child.id)}
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
      <div className="border-t border-sidebar-border bg-black/10 p-4 text-[11px] text-sidebar-foreground/60">
        <p className="font-bold text-white/90 tracking-wide">ITIC Laboratorios</p>
        <p className="text-white/50 font-medium mt-0.5">Universidad Mayor de San Andrés</p>
      </div>
    </aside>
  );
}