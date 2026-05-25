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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex size-9 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">SL</div>
        <span className="text-base font-extrabold tracking-tight text-white">SIGMALAB</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
                  "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  (isActive || isChildActive)
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-white",
                  item.highlight && !isActive && "ring-1 ring-teal/50",
                )}
              >
                {(isActive || isChildActive) && <span className="absolute top-1 bottom-1 left-0 w-1 rounded-r bg-teal" />}
                <Icon className={cn("size-4.5 shrink-0", item.highlight && "text-teal")} strokeWidth={2} />
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />}
              </button>

              {hasChildren && isOpen && (
                <div className="mt-1 ml-7 space-y-1 border-l border-sidebar-border pl-3">
                  {item.children!.map((child) => {
                    const childActive = view === child.id;
                    return (
                      <button type="button" key={child.id} onClick={() => setView(child.id)}
                        className={cn(
                          "block w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors",
                          childActive ? "bg-sidebar-accent text-white" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-white",
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

      <div className="border-t border-sidebar-border p-4 text-[11px] text-sidebar-foreground/60">
        <p className="font-semibold text-white/80">ITIC Laboratorios</p>
        <p>Universidad Mayor de San Andrés</p>
      </div>
    </aside>
  );
}

