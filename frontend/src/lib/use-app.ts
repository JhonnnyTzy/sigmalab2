import { useSyncExternalStore } from "react";
import { auth, type AppRole, type SessionUser } from "./auth";

let _view: string = "dashboard";
const listeners = new Set<() => void>();

function defaultViewFor(role: AppRole | undefined): string {
  if (!role) return "dashboard";
  if (role === "docente" || role === "estudiante") return "crear-incidencia";
  return "dashboard";
}

auth.subscribe(() => {
  const s = auth.getSession();
  _view = defaultViewFor(s?.role);
  listeners.forEach((fn) => fn());
});

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

interface AppSnapshot {
  session: SessionUser | null;
  view: string;
}

let _cached: AppSnapshot = { session: null, view: "dashboard" };

function getSnapshot(): AppSnapshot {
  const session = auth.getSession();
  if (_cached.session !== session || _cached.view !== _view) {
    _cached = { session, view: _view };
  }
  return _cached;
}

function getServerSnapshot(): AppSnapshot {
  return { session: null, view: "dashboard" };
}

let _serverCached: AppSnapshot | null = null;
function getServerSnapshotCached(): AppSnapshot {
  if (!_serverCached) _serverCached = { session: null, view: "dashboard" };
  return _serverCached;
}

export function useApp() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshotCached);
  return {
    role: (snap.session?.role ?? "invitado") as AppRole,
    view: snap.view,
    isAuthenticated: !!snap.session,
    setView: (v: string) => { _view = v; listeners.forEach((fn) => fn()); },
  };
}
