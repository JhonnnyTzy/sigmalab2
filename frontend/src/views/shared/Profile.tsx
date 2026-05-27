import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { ArrowLeft, Lock, Camera, Pencil, Save, X } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { auth, useAuth, ROLE_LABEL } from "@/lib/auth";
import { useApp } from "@/lib/use-app";
import apiClient from "@/services/apiClient";
import { cn } from "@/lib/utils";

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const inputEditCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-all";
const viewFieldCls = "rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm text-navy";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-200", className)} />;
}

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={viewFieldCls}>{value || "—"}</p>
    </div>
  );
}

function EditField({ label, value, field, type = "text", onChange }: { label: string; value: string; field: string; type?: string; onChange: (field: string, value: string) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={inputEditCls}
        aria-label={label}
      />
    </div>
  );
}

export function ProfileView() {
  const { user } = useAuth();
  const { setView } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passModal, setPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [form, setForm] = useState({
    nombres: "", paterno: "", materno: "",
    email: "", celular: "", fotoUrl: "",
  });
  const [newPhoto, setNewPhoto] = useState<string | null>(null);

  const handleFieldChange = useCallback((field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value })), []);

  useEffect(() => {
    apiClient.get("/auth/profile").then((res) => {
      setProfile(res.data);
      setForm({
        nombres: res.data.nombres ?? "",
        paterno: res.data.paterno ?? "",
        materno: res.data.materno ?? "",
        email: res.data.email ?? "",
        celular: res.data.celular ?? "",
        fotoUrl: res.data.fotoUrl ?? "",
      });
      setLoading(false);
    }).catch(() => {
      toast.error("Error al cargar perfil");
      setLoading(false);
    });
  }, []);

  if (!user || loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4">
        <div className="flex items-center gap-3"><Skeleton className="size-9 rounded-lg" /><Skeleton className="h-6 w-40" /></div>
        <div className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-navy-soft/10 to-teal-soft/20 p-6 shadow-sm">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  const initials = `${profile.nombres?.[0] ?? ""}${profile.paterno?.[0] ?? ""}`.toUpperCase();
  const fullName = [profile.nombres, profile.paterno, profile.materno].filter(Boolean).join(" ");
  const isNewPhoto = newPhoto && newPhoto !== form.fotoUrl;
  const displayPhoto = isNewPhoto ? newPhoto : (editing ? form.fotoUrl : profile.fotoUrl);

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Solo se permiten imágenes"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("La imagen no debe superar 2MB"); return; }
    const b64 = await toBase64(file);
    setNewPhoto(b64);
  };

  const startEdit = () => {
    setForm({
      nombres: profile.nombres ?? "",
      paterno: profile.paterno ?? "",
      materno: profile.materno ?? "",
      email: profile.email ?? "",
      celular: profile.celular ?? "",
      fotoUrl: profile.fotoUrl ?? "",
    });
    setNewPhoto(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setNewPhoto(null);
  };

  const saveProfile = async () => {
    if (!form.nombres.trim() || !form.paterno.trim()) {
      toast.error("Nombres y apellido paterno son requeridos");
      return;
    }
    if (form.email && !form.email.includes("@")) {
      toast.error("Correo electrónico inválido");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        nombres: form.nombres.trim(),
        paterno: form.paterno.trim(),
        materno: form.materno.trim() || undefined,
        email: form.email.trim() || undefined,
        celular: form.celular.trim() || undefined,
      };
      if (isNewPhoto) payload.fotoUrl = newPhoto;
      const res = await apiClient.patch("/auth/profile", payload);
      const updated = res.data;
      setProfile(updated);
      setForm((prev) => ({ ...prev, fotoUrl: updated.fotoUrl ?? "" }));
      setNewPhoto(null);
      auth.updateSession(updated);
      setEditing(false);
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) { toast.error("Mínimo 6 caracteres"); return; }
    setSaving(true);
    try {
      await apiClient.patch("/auth/profile", { password: newPassword });
      setPassModal(false); setNewPassword("");
      toast.success("Contraseña actualizada");
    } catch { toast.error("Error al cambiar contraseña"); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setView("dashboard")} title="Volver" className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-navy transition-colors hover:bg-slate-100">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy">Mi Perfil</h1>
            <p className="text-sm text-muted-foreground">Gestiona tu información personal</p>
          </div>
        </div>
        {!editing ? (
          <Button onClick={startEdit} className="gap-2 bg-navy text-white hover:bg-navy/90 shadow-sm">
            <Pencil className="size-4" /> Editar perfil
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={cancelEdit} className="gap-2 border-slate-300">
              <X className="size-4" /> Cancelar
            </Button>
            <Button onClick={saveProfile} disabled={saving} className="gap-2 bg-teal text-white hover:bg-teal/90 shadow-sm">
              <Save className="size-4" /> {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-navy/5 via-teal-soft/30 to-white shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={cn(
              "flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-lg transition-all duration-300",
              editing && "cursor-pointer ring-2 ring-teal ring-offset-2 hover:ring-teal/80",
            )}
              onClick={() => editing && fileRef.current?.click()}
            >
              {displayPhoto ? (
                <img src={displayPhoto} alt="Foto de perfil" className="size-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{initials}</span>
              )}
            </div>
            {editing && (
              <>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-teal text-white shadow-md transition-transform hover:scale-110"
                  title="Cambiar foto"
                >
                  <Camera className="size-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-navy">{fullName}</h2>
            <p className="text-sm font-medium text-teal">{ROLE_LABEL[profile.roleId] || profile.roleName || profile.roleId}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground sm:justify-start">
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-teal" /> @{profile.id}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-navy/40" /> Miembro desde {new Date(profile.createdAt).toLocaleDateString("es-BO", { year: "numeric", month: "long" })}
              </span>
            </div>
          </div>

          {/* Badge */}
          <div className="hidden sm:flex shrink-0 items-center gap-2 rounded-full bg-navy/10 px-4 py-2 text-xs font-semibold text-navy">
            <span className="size-2 rounded-full bg-teal animate-pulse" />
            {profile.activo ? "Activo" : "Inactivo"}
          </div>
        </div>
      </div>

      {/* Información personal */}
      <Panel title="Información personal">
        {editing ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <EditField label="Nombres" value={form.nombres} field="nombres" onChange={handleFieldChange} />
            <EditField label="Apellido paterno" value={form.paterno} field="paterno" onChange={handleFieldChange} />
            <EditField label="Apellido materno" value={form.materno} field="materno" onChange={handleFieldChange} />
            <EditField label="Correo electrónico" value={form.email} field="email" type="email" onChange={handleFieldChange} />
            <EditField label="Celular" value={form.celular} field="celular" onChange={handleFieldChange} />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registro universitario</p>
              <p className={viewFieldCls + " bg-slate-100"}>{profile.registro || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cédula de identidad</p>
              <p className={viewFieldCls + " bg-slate-100"}>{profile.ci || "—"}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ViewField label="Nombres" value={profile.nombres} />
            <ViewField label="Apellido paterno" value={profile.paterno} />
            <ViewField label="Apellido materno" value={profile.materno} />
            <ViewField label="Correo electrónico" value={profile.email} />
            <ViewField label="Celular" value={profile.celular} />
            <ViewField label="Registro universitario" value={profile.registro} />
            <ViewField label="Cédula de identidad" value={profile.ci} />
          </div>
        )}
      </Panel>

      {/* Seguridad */}
      <Panel title="Seguridad">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-danger-soft">
            <Lock className="size-4 text-danger" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-navy">Contraseña</p>
            <p className="text-xs text-muted-foreground">Último cambio no disponible</p>
          </div>
          <Button variant="outline" onClick={() => setPassModal(true)} className="border-navy/30 text-navy text-xs font-semibold hover:bg-navy/5">
            Cambiar contraseña
          </Button>
        </div>
      </Panel>

      {/* Modal cambio de contraseña */}
      <Modal open={passModal} onOpenChange={setPassModal} title="Cambiar contraseña" size="sm"
        footer={<><Button variant="outline" onClick={() => { setPassModal(false); setNewPassword(""); }}>Cancelar</Button><Button onClick={handlePasswordChange} disabled={saving} className="bg-navy">{saving ? "Guardando..." : "Guardar"}</Button></>}>
        <FormField label="Nueva contraseña" required>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} placeholder="Mínimo 6 caracteres" aria-label="Nueva contraseña" />
        </FormField>
      </Modal>
    </div>
  );
}
