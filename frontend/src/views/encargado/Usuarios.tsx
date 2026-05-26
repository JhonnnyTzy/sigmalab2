import { useState, useMemo, useReducer } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, KeyRound } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { StatusBadge } from "@/components/sigmalab/StatusBadge";
import { Modal, FormField, inputCls } from "@/components/sigmalab/Modal";
import { Button } from "@/components/ui/button";
import { auth, useAuth, ROLE_LABEL, ROLES_REGISTRO, type AppRole, type AuthAccount } from "@/lib/auth";

const ROLE_OPTIONS: AppRole[] = ["encargado", "preventivo", "correctivo", "docente", "estudiante", "invitado"];

interface FormState {
  id: string;
  role: AppRole;
  nombres: string;
  paterno: string;
  materno: string;
  email: string;
  registro: string;
  celular: string;
  password: string;
}

const EMPTY: FormState = {
  id: "", role: "preventivo", nombres: "", paterno: "", materno: "",
  email: "", registro: "", celular: "", password: "",
};

function fromAccount(a: AuthAccount): FormState {
  return {
    id: a.id, role: a.role,
    nombres: a.nombres ?? "", paterno: a.paterno ?? "", materno: a.materno ?? "",
    email: a.email ?? "", registro: a.registro ?? "", celular: a.celular ?? "",
    password: a.password ?? "",
  };
}

export function UsuariosView() {
  const { accounts } = useAuth();
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
    { q: "", rolF: "" }
  );

  const openEdit = (acc: AuthAccount) => {
    setForm(fromAccount(acc));
    dispatchModal({ type: "SET_FIELD", field: "editing", value: acc });
  };

  const filtered = useMemo(() => accounts.filter((a) => {
    const txt = `${a.nombres} ${a.paterno} ${a.materno ?? ""} ${a.email ?? ""} ${a.registro ?? ""}`.toLowerCase();
    if (filtros.q && !txt.includes(filtros.q.toLowerCase())) return false;
    if (filtros.rolF && a.role !== filtros.rolF) return false;
    return true;
  }), [accounts, filtros.q, filtros.rolF]);

  const usaRegistro = ROLES_REGISTRO.includes(form.role);

  const openCreate = () => { setForm({ ...EMPTY, role: "preventivo" }); dispatchModal({ type: "SET_FIELD", field: "creating", value: true }); };

  const submit = () => {
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
    if (modal.creating && !form.password.trim()) {
      toast.error("La contraseña es requerida"); return;
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
      const newAcc: AuthAccount = {
        id: `u-${Date.now()}`,
        role: form.role,
        password: form.password,
        nombres: form.nombres.trim(),
        paterno: form.paterno.trim(),
        materno: form.materno.trim() || undefined,
        email: usaRegistro ? undefined : identifier,
        registro: usaRegistro ? identifier : undefined,
        celular: form.celular.trim() || undefined,
      };
      auth.addAccount(newAcc);
      toast.success("Usuario creado"); dispatchModal({ type: "SET_FIELD", field: "creating", value: false });
    } else if (modal.editing) {
      const patch: Partial<AuthAccount> = {
        role: form.role,
        nombres: form.nombres.trim(),
        paterno: form.paterno.trim(),
        materno: form.materno.trim() || undefined,
        email: usaRegistro ? undefined : identifier,
        registro: usaRegistro ? identifier : undefined,
        celular: form.celular.trim() || undefined,
      };
      if (form.password.trim()) patch.password = form.password;
      auth.updateAccount(modal.editing.id, patch);
      toast.success("Usuario actualizado"); dispatchModal({ type: "SET_FIELD", field: "editing", value: null });
    }
  };

  const confirmDelete = () => {
    if (!modal.deleting) return;
    auth.deleteAccount(modal.deleting.id);
    toast.success("Usuario eliminado"); dispatchModal({ type: "SET_FIELD", field: "deleting", value: null });
  };

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
      <FormField label="Celular">
        <input value={form.celular} placeholder="7XXXXXXX"
          onChange={(e) => setForm({ ...form, celular: e.target.value })} className={inputCls} aria-label="Celular" />
      </FormField>
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
                <th className="px-4 py-3 font-semibold">Celular</th>
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
                  <td className="px-4 py-3 text-muted-foreground">{a.celular ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEdit(a)} title="Editar"
                        className="inline-flex size-8 items-center justify-center rounded-md border border-teal text-teal hover:bg-teal-soft">
                        <Pencil className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: a })} title="Eliminar"
                        className="inline-flex size-8 items-center justify-center rounded-md border border-danger text-danger hover:bg-danger-soft">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modal.creating} onOpenChange={(v) => dispatchModal({ type: "SET_FIELD", field: "creating", value: v })} title="Nuevo Usuario" size="lg"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "creating", value: false })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Crear</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!modal.editing} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "editing", value: null })}
        title={`Editar ${modal.editing ? `${modal.editing.nombres} ${modal.editing.paterno}` : ""}`} size="lg"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "editing", value: null })}>Cancelar</Button><Button onClick={submit} className="bg-navy">Guardar</Button></>}>
        {FormBody}
      </Modal>

      <Modal open={!!modal.deleting} onOpenChange={(v) => !v && dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })} title="Eliminar usuario" size="sm"
        footer={<><Button variant="outline" onClick={() => dispatchModal({ type: "SET_FIELD", field: "deleting", value: null })}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></>}>
        <p className="text-sm text-muted-foreground">
          ¿Eliminar a <span className="font-semibold text-navy">{modal.deleting?.nombres} {modal.deleting?.paterno}</span>?
          Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
