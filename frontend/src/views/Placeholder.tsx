import { Construction } from "lucide-react";

export function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-xl border border-slate-100 bg-card p-10 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-teal-soft text-teal">
          <Construction className="size-7" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-navy">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Este módulo está en construcción y forma parte del sistema SIGMALAB.
        </p>
      </div>
    </div>
  );
}
