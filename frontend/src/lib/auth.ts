import { useEffect, useState } from "react";
import apiClient from "@/services/apiClient";

export type AppRole =
  | "encargado" | "preventivo" | "correctivo" | "docente" | "estudiante" | "invitado";

export interface AuthAccount {
  id: string;
  role: AppRole;
  password?: string;
  nombres: string;
  paterno: string;
  materno?: string;
  email?: string;
  registro?: string;
  celular?: string;
  activo?: boolean;
}

export interface SessionUser {
  id: string;
  roleId: string;
  roleName?: string;
  role: string; // alias de roleId para compatibilidad
  nombres: string;
  paterno: string;
  materno?: string | null;
  email?: string | null;
  registro?: string | null;
}

export const ROLE_LABEL: Record<string, string> = {
  encargado: "Administrador",
  preventivo: "Pasante Preventivo",
  correctivo: "Pasante Correctivo",
  docente: "Docente",
  estudiante: "Estudiante",
  invitado: "Invitado",
};

export const ROLES_REGISTRO: AppRole[] = ["preventivo", "correctivo", "estudiante"];
export const ROLES_EMAIL: AppRole[] = ["encargado", "docente", "invitado"];

const STORAGE_SESSION = "sigmalab.session.v1";
const STORAGE_TOKEN = "sigmalab.token.v1";
const STORAGE_ACCOUNTS = "sigmalab.accounts.v1";

let session: SessionUser | null = (() => {
  try { const raw = localStorage.getItem(STORAGE_SESSION); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
})();

let accounts: AuthAccount[] = (() => {
  try { const raw = localStorage.getItem(STORAGE_ACCOUNTS); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
})();

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

function persist() {
  if (session) localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_SESSION);
}

export const auth = {
  getSession: () => session,
  subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; },

  async login(identifier: string, password: string): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
    try {
      const res = await apiClient.post("/auth/login", { identifier, password });
      const { token, user } = res.data;
      localStorage.setItem(STORAGE_TOKEN, token);
      session = {
        id: user.id,
        roleId: user.roleId,
        role: user.roleId,
        roleName: ROLE_LABEL[user.roleId] || user.roleId,
        nombres: user.nombres,
        paterno: user.paterno,
        materno: user.materno || null,
        email: user.email || null,
        registro: user.registro || null,
      };
      persist();
      notify();
      return { ok: true, user: session };
    } catch (err: any) {
      const message = err.response?.data?.error || "Error de conexión con el servidor";
      return { ok: false, error: message };
    }
  },

  logout() {
    session = null;
    localStorage.removeItem(STORAGE_TOKEN);
    persist();
    notify();
  },

  /** Update local session from a profile API response */
  updateSession(profile: { id: string; roleId: string; nombres: string; paterno: string; materno?: string | null; email?: string | null; registro?: string | null }) {
    session = {
      id: profile.id,
      roleId: profile.roleId,
      role: profile.roleId,
      roleName: ROLE_LABEL[profile.roleId] || profile.roleId,
      nombres: profile.nombres,
      paterno: profile.paterno,
      materno: profile.materno || null,
      email: profile.email || null,
      registro: profile.registro || null,
    };
    persist();
    notify();
  },

  getAccounts: () => accounts,

  addAccount(acc: AuthAccount) {
    accounts = [...accounts, acc];
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
    notify();
  },

  updateAccount(id: string, patch: Partial<AuthAccount>) {
    accounts = accounts.map((a) => a.id === id ? { ...a, ...patch } : a);
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
    notify();
  },

  deleteAccount(id: string) {
    accounts = accounts.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
    notify();
  },

  setAccounts(accs: AuthAccount[]) {
    accounts = accs;
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
    notify();
  },
};

export function useAuth() {
  const [, force] = useState(0);
  useEffect(() => auth.subscribe(() => force((n) => n + 1)), []);
  return { user: auth.getSession(), accounts: auth.getAccounts() };
}

export type Action =
  | "manage:all" | "incidencias:view" | "incidencias:manage"
  | "incidencias:create" | "read:only";

const PERMISSIONS: Record<string, Action[]> = {
  encargado:  ["manage:all", "incidencias:view", "incidencias:manage", "incidencias:create"],
  preventivo: ["incidencias:view", "incidencias:manage"],
  correctivo: ["incidencias:view", "incidencias:manage"],
  docente:    ["incidencias:create"],
  estudiante: ["incidencias:create"],
  invitado:   ["read:only"],
};

export function can(role: string | undefined, action: Action): boolean {
  if (!role) return false;
  if (PERMISSIONS[role]?.includes("manage:all")) return true;
  return PERMISSIONS[role]?.includes(action) ?? false;
}

export function useIsReadOnly(): boolean {
  const { user } = useAuth();
  return user?.roleId === "invitado";
}

/** Maps session user IDs to mock data usernames for assignment filtering */
export const USERNAME_MAP: Record<string, string> = {
  "u-admin":    "rescobar",
  "u-docente":  "projas",
  "u-prev":     "ysarzuri",
  "u-prev2":    "cmendoza",
  "u-corr":     "jarias",
  "u-corr2":    "mquispe",
  "u-doc1":     "jmamani",
  "u-doc2":     "mvargas",
  "u-doc3":     "pquispe",
  "u-doc4":     "acondori",
  "u-doc5":     "lflores",
  "u-est":      "lmendoza",
  "u-est2":     "rhuanca",
  "u-est3":     "ctorrez",
  "u-invitado":  "vdemo",
};

export function getSessionUsername(user: SessionUser | null): string {
  if (!user) return "";
  return USERNAME_MAP[user.id] ?? user.id;
}

export function getSessionFullName(user: SessionUser | null): string {
  if (!user) return "Usuario";
  return [user.nombres, user.paterno].filter(Boolean).join(" ");
}
