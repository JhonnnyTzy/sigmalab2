import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onOpenChange, title, description, children, footer, size = "md" }: Props) {
  const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={widths[size] + " max-h-[85vh]"}>
        <DialogHeader>
          <DialogTitle className="text-navy">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="max-h-[65vh] space-y-4 overflow-y-auto py-2">{children}</div>
        {footer && <DialogFooter className="shrink-0">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export function FormField({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
      <span>{label} {required && <span className="text-danger">*</span>}</span>
      {children}
    </label>
  );
}

export const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal focus:outline-none";
