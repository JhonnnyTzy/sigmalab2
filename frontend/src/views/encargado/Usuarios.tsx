import { useState, useMemo, useReducer } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, KeyRound, Eye, X, ToggleLeft, ToggleRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { auth, useAuth, ROLE_LABEL, ROLES_REGISTRO, type AppRole, type AuthAccount } from "@/lib/auth";
import apiClient from "@/services/apiClient";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: AppRole[] = ["encargado", "preventivo", "correctivo", "docente", "estudiante", "invitado"];

interface FormState {
  id: string;
  role: AppRole;
  nombres: string;
  paterno: string;
  materno: string;
  ci: string;
  direccion: string;
  email: string;
  registro: string;
  celular: string;
  password: string;
  fechaIngreso: string;
}

const EMPTY: FormState = {
  id: "", role: "preventivo", nombres: "", paterno: "", materno: "",
  ci: "", direccion: "", email: "", registro: "", celular: "", password: "", fechaIngreso: "",
};

function fromAccount(a: AuthAccount): FormState {
  return {
    id: a.id, role: a.role,
    nombres: a.nombres ?? "", paterno: a.paterno ?? "", materno: a.materno ?? "",
    ci: a.ci ?? "", direccion: a.direccion ?? "", email: a.email ?? "", registro: a.registro ?? "", celular: a.celular ?? "",
    password: a.password ?? "", fechaIngreso: a.fechaIngreso ?? "",
  };
}

export function UsuariosView() {
  const { accounts } = useAuth();
  const [profileView, setProfileView] = useState<AuthAccount | null>(null);
  const [modal, dispatchModal] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { editing: null, creating: false, deleting: null }
  );
  const [form, setForm] = useState<FormState>(EMPTY);
  const [filtros, dispatchFiltros] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { q: "", rolF: "", activoF: "" }
  );

  const openEdit = (acc: AuthAccount) => {
    setForm(fromAccount(acc));
    dispatchModal({ type: "SET_FIELD", field: "editing", value: acc });
  };

  const filtered = useMemo(() => accounts.filter((a) => {
    const txt = `${a.nombres} ${a.paterno} ${a.materno ?? ""} ${a.email ?? ""} ${a.registro ?? ""}`.toLowerCase();
    if (filtros.q && !txt.includes(filtros.q.toLowerCase())) return false;
    if (filtros.rolF && a.role !== filtros.rolF) return false;
    if (filtros.activoF === "activo" && a.activo === false) return false;
    if (filtros.activoF === "inactivo" && a.activo !== false) return false;
    return true;
  }), [accounts, filtros.q, filtros.rolF, filtros.activoF]);

  const usaRegistro = ROLES_REGISTRO.includes(form.role);

  const openCreate = () => { setForm({ ...EMPTY, role: "preventivo" }); dispatchModal({ type: "SET_FIELD", field: "creating", value: true }); };

  const submit = async () => {
    if (!form.nombres.trim() || !form.paterno.trim()) {
      toast.error("Nombres y Apellido Paterno son requeridos"); return;
    }
    if (usaRegistro) {
      if (!/^\d+$/.test(form.registro.trim())) {
        toast.error("El registro universitario debe contener solo números"); return;
      }
    } else {
      if (!form.email.trim() || !form.email.includes("@")) {
        toast.error("Email válido requerido para este rol"); return;
      }
    }
    if (form.password && form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres"); return;
    }

    const identifier = usaRegistro ? form.registro.trim() : form.email.trim().toLowerCase();
    // Verificar duplicados
    const dup = accounts.find((a) =>
      a.id !== form.id &&
      (usaRegistro ? a.registro === identifier : a.email?.toLowerCase() === identifier),
    );
    if (dup) { toast.error("Ya existe un usuario con ese identificador"); return; }

    if (modal.creating) {
      const payload = {
        roleId: form.role,
        password: form.password,
        nombres: form.nombres.trim(),
        paterno: form.paterno.trim(),
        materno: form.materno.trim() || undefined,
        ci: form.ci.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        email: usaRegistro ? undefined : identifier,
        registro: usaRegistro ? identifier : undefined,
        celular: form.celular.trim() || undefined,
        fechaIngreso: (form.role === "preventivo" || form.role === "correctivo" || form.role === "estudiante") ? form.fechaIngreso || undefined : undefined,
      };
      try {
        const res = await apiClient.post("/auth/register", payload);
        const newAcc: AuthAccount = {
          id: res.data.id,
          role: res.data.roleId as AppRole,
          activo: true,
          nombres: res.data.nombres,
          paterno: res.data.paterno,
          materno: undefined,
          email: usaRegistro ? undefined : identifier,
          registro: usaRegistro ? identifier : undefined,
          celular: form.celular.trim() || undefined,
          fechaIngreso: form.fechaIngreso || undefined,
        };
        auth.addAccount(newAcc);
        toast.success("Usuario creado");
      } catch (e: any) {
        toast.error(e.response?.data?.error || "Error al crear usuario");
      }
      dispatchModal({ type: "SET_FIELD", field: "creating", value: false });
    } else if (modal.editing) {
      try {
        const patch: any = {
          roleId: form.role,
          nombres: form.nombres.trim(),
          paterno: form.paterno.trim(),
          materno: form.materno.trim() || undefined,
          email: usaRegistro ? undefined : identifier,
          registro: usaRegistro ? identifier : undefined,
          celular: form.celular.trim() || undefined,
          fechaIngreso: (form.role === "preventivo" || form.role === "correctivo" || form.role === "estudiante") ? form.fechaIngreso || undefined : undefined,
        };
        if (form.password.trim()) patch.password = form.password;
        await apiClient.patch(`/auth/${modal.editing.id}`, patch);
        auth.updateAccount(modal.editing.id, { ...patch, role: patch.roleId });
        toast.success("Usuario actualizado"); dispatchModal({ type: "SET_FIELD", field: "editing", value: null });
      } catch (e: any) {
        toast.error(e?.response?.data?.error || "Error al actualizar usuario");
      }
    }
  };

  const confirmDelete = async () => {
    if (!modal.deleting) return;
    const ahoraActivo = modal.deleting.activo !== false;
    try {
      if (ahoraActivo) {
        await apiClient.delete(`/auth/${modal.deleting.id}`);
      } else {
        await apiClient.patch(`/auth/${modal.deleting.id}`, { activo: true });
      }
      auth.updateAccount(modal.deleting.id, { activo: !ahoraActivo });
      toast.success(ahoraActivo ? "Usuario desactivado" : "Usuario reactivado");
      dispatchModal({ type: "SET_FIELD", field: "deleting", value: null });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Error al cambiar estado del usuario");
    }
  };

  const ViewProfileField = ({ label, value }: { label: string; value?: string }) => (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm text-navy">{value || "—"}</p>
    </div>
  );

  const FormBody = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField label="Rol" required>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AppRole })} className={inputCls} aria-label="Rol">
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
      </FormField>
      <FormField label={usaRegistro ? "Registro universitario" : "Email"} required>
        {usaRegistro ? (
          <input value={form.registro} inputMode="numeric"
            onChange={(e) => setForm({ ...form, registro: e.target.value.replace(/\D/g, "") })}
            placeholder="20250001" className={inputCls} aria-label="Registro universitario" />
        ) : (
          <input type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="usuario@umsa.bo" className={inputCls} aria-label="Email" />
        )}
      </FormField>
      <FormField label="Nombres" required>
        <input value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} className={inputCls} aria-label="Nombres" />
      </FormField>
      <FormField label="Apellido Paterno" required>
        <input value={form.paterno} onChange={(e) => setForm({ ...form, paterno: e.target.value })} className={inputCls} aria-label="Apellido paterno" />
      </FormField>
      <FormField label="Apellido Materno">
        <input value={form.materno} onChange={(e) => setForm({ ...form, materno: e.target.value })} className={inputCls} aria-label="Apellido materno" />
      </FormField>
      <FormField label="CI">
        <input value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value.replace(/\D/g, "") })} placeholder="Número de carnet" className={inputCls} aria-label="CI" />
      </FormField>
      <FormField label="Dirección">
        <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección domicilio" className={inputCls} aria-label="Dirección" />
      </FormField>
      <FormField label="Celular">
        <input value={form.celular} placeholder="7XXXXXXX"
          onChange={(e) => setForm({ ...form, celular: e.target.value })} className={inputCls} aria-label="Celular" />
      </FormField>
      {(form.role === "preventivo" || form.role === "correctivo" || form.role === "estudiante") && (
        <FormField label="Fecha de ingreso">
          <input type="date" value={form.fechaIngreso} onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })} className={inputCls} aria-label="Fecha de ingreso" />
        </FormField>
      )}
      <div className="md:col-span-2">
        <FormField label={modal.creating ? "Contraseña" : "Nueva contraseña (vacío = no cambiar)"} required={modal.creating}>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <input type="text" value={form.password} placeholder="mínimo 6 caracteres"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`${inputCls} pl-9 font-mono`} aria-label="Contraseña" />
          </div>
        </FormField>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestión de cuentas y credenciales del sistema</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90">
          <Plus className="size-4" /> Nuevo Usuario
        </button>
      </div>

      <Panel title="Filtros">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <input value={filtros.q} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "q", value: e.target.value })}
              placeholder="Buscar por nombre, apellido, email o registro..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm" aria-label="Buscar usuario" />
          </div>
          <select value={filtros.rolF} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "rolF", value: e.target.value as "" | AppRole })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por rol">
            <option value="">Todos los roles</option>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          <select value={filtros.activoF} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "activoF", value: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filtrar por estado">
            <option value="">Activos e inactivos</option>
            <option value="activo">Solo activos</option>
            <option value="inactivo">Solo inactivos</option>
          </select>
        </div>
      </Panel>

      <Panel title={`${filtered.length} usuario${filtered.length !== 1 ? "s" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombres</th>
                <th className="px-4 py-3 font-semibold">Apellido Paterno</th>
                <th className="px-4 py-3 font-semibold">Apellido Materno</th>
                <th className="px-4 py-3 font-semibold">Identificador</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Celular</th>
                <th className="px-4 py-3 font-semibold">Fecha Ingreso</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a, i) => (
                <tr key={a.id} className={i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/40 hover:bg-slate-50"}>
                  <td className="px-4 py-3 font-medium text-navy">{a.nombres}</td>
                  <td className="px-4 py-3 text-navy">{a.paterno}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.materno ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-teal">{a.email ?? a.registro ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={ROLE_LABEL[a.role]} /></td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", a.activo !== false ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
                      {a.activo !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.celular ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.fechaIngreso ? new Date(a.fechaIngreso).toLocaleDateString("es-BO") : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setProfileView(a)} title="Ver perfil"
                        className="inline-flex size-8 items-center justify-center rounded-md border border-navy/30 text-navy hover:bg-navy-soft">
                        <Eye className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => openEdit(a)} title="Editar"
                        className="inline-flex size-8 items-center justify-center rounded-md border border-teal text-teal hover:bg-teal-soft">
                        <Pencil className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: a })} title={a.activo !== false ? "Desactivar" : "Reactivar"}
                        className={cn("inline-flex size-8 items-center justify-center rounded-md border", a.activo !== false ? "border-danger text-danger hover:bg-danger-soft" : "border-success text-success hover:bg-success-soft")}>
                        {a.activo !== false ? <Trash2 className="size-3.5" /> : <ToggleRight className="size-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Dialog open={!!profileView} onOpenChange={(v) => !v && setProfileView(null)}>
        <DialogContent className="max-w-lg w-[95vw] p-0 flex flex-col max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-4 bg-white shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-navy">Perfil de usuario</DialogTitle>
              <button type="button" onClick={() => setProfileView(null)} className="rounded-md p-1 text-muted-foreground hover:bg-slate-100">
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>
          {profileView && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-navy/5 to-teal-soft/30 p-4 border border-slate-100">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-navy text-lg font-bold text-white shadow">
                  {((profileView.nombres?.[0] ?? "") + (profileView.paterno?.[0] ?? "")).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-navy truncate">{profileView.nombres} {profileView.paterno} {profileView.materno ?? ""}</p>
                  <p className="text-sm font-medium text-teal">{ROLE_LABEL[profileView.role] || profileView.role}</p>
                  <p className="text-xs text-muted-foreground">@{profileView.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ViewProfileField label="Email" value={profileView.email} />
                <ViewProfileField label="Registro universitario" value={profileView.registro} />
                <ViewProfileField label="Celular" value={profileView.celular} />
                <ViewProfileField label="Fecha ingreso" value={profileView.fechaIngreso ? new Date(profileView.fechaIngreso).toLocaleDateString("es-BO") : undefined} />
                <ViewProfileField label="Rol" value={ROLE_LABEL[profileView.role] || profileView.role} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Modal open={modal.creating} onOpenChange={(v) => dispatchModal({ type: "SET_FIELD", field: "creating", value: v })} title="Nuevo Usuario" size="lg"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "creating", value: false })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Crear</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!modal.editing} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "editing", value: null })}
        title={`Editar ${modal.editing ? `${modal.editing.nombres} ${modal.editing.paterno}` : ""}`} size="lg"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "editing", value: null })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Guardar</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!modal.deleting} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })} title="Estado del usuario" size="sm"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })}>Cancelar</Button><Button variant={modal.deleting?.activo !== false ? "destructive" : "default"} className={modal.deleting?.activo !== false ? "" : "bg-success hover:bg-success/90"} onClick={confirmDelete}>
          {modal.deleting?.activo !== false ? "Desactivar" : "Reactivar"}
        </Button></>}>
        <p className="text-sm text-muted-foreground">
          {modal.deleting?.activo !== false
            ? <>¿Desactivar a <span className="font-semibold text-navy">{modal.deleting?.nombres} {modal.deleting?.paterno}</span>? El usuario no podrá iniciar sesión.</>
            : <>¿Reactivar a <span className="font-semibold text-navy">{modal.deleting?.nombres} {modal.deleting?.paterno}</span>? El usuario podrá acceder nuevamente.</>}
        </p>
      </Modal>
    </div>
  );
}
