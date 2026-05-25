import { createContext, use, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import * as authService from "../services/authService";

export interface SessionUser {
  id: string;
  role: string;
  nombres: string;
  paterno: string;
  materno?: string | null;
  email?: string | null;
  registro?: string | null;
}

interface AuthContextType {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_TOKEN = "sigmalab.token.v1";
const STORAGE_SESSION = "sigmalab.session.v1";

function loadSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(token: string, user: SessionUser) {
  localStorage.setItem(STORAGE_TOKEN, token);
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_SESSION);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(loadSession);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login({ identifier, password });
      const sessionUser: SessionUser = {
        id: result.user.id,
        role: result.user.role,
        nombres: result.user.nombres,
        paterno: result.user.paterno,
        materno: result.user.materno,
        email: result.user.email,
        registro: result.user.registro,
      };
      persistSession(result.token, sessionUser);
      setUser(sessionUser);
      return { ok: true as const };
    } catch (err: any) {
      const message = err.response?.data?.error || "Error de conexión con el servidor";
      return { ok: false as const, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    if (token) {
      authService.getProfile().catch(() => {
        clearSession();
        setUser(null);
      });
    }
  }, []);

  const value = useMemo(() => ({ user, isAuthenticated: !!user, isLoading, login, logout }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return ctx;
}
