import { useCallback, useMemo, useState, useReducer } from "react";
import { Activity, Eye, Search, X } from "lucide-react";
import { Panel } from "@/components/sigmalab/Panel";
import { Modal } from "@/components/sigmalab/Modal";
import { useStore, type LogEntry } from "@/lib/store";

const TITLE_RX = /^(Lic\.|Ing\.|Dr\.|Dra\.|Mg\.|Mgr\.|Prof\.)\s+/i;

function splitNombre(full: string) {
  const clean = full.replace(TITLE_RX, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 0) return { nombres: "", paterno: "", materno: "" };
  if (parts.length === 1) return { nombres: parts[0], paterno: "", materno: "" };
  if (parts.length === 2) return { nombres: parts[0], paterno: parts[1], materno: "" };
  if (parts.length === 3) return { nombres: parts[0], paterno: parts[1], materno: parts[2] };
  return { nombres: parts.slice(0, -2).join(" "), paterno: parts[parts.length - 2], materno: parts[parts.length - 1] };
}

function parseTs(ts: string): number {
  // dd/MM/yyyy HH:mm
  const m = ts.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!m) return 0;
  const [, dd, mm, yyyy, hh, mi] = m;
  return new Date(+yyyy, +mm - 1, +dd, +hh, +mi).getTime();
}

function toDateInput(ts: string) {
  const t = parseTs(ts);
  if (!t) return "";
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal focus:outline-none";

export function LogsView() {
  const logs = useStore((s) => s.logs);
  const usuarios = useStore((s) => s.usuarios);

  const userMap = useMemo(() => {
    const map = new Map<string, { full: string; rol: string; nombres: string; paterno: string; materno: string }>();
    usuarios.forEach((u) => {
      const s = u.nombres ? { nombres: u.nombres, paterno: u.paterno ?? "", materno: u.materno ?? "" } : splitNombre(u.nombre);
      map.set(u.username, { full: u.nombre, rol: u.rol, ...s });
    });
    return map;
  }, [usuarios]);

  const fullName = useCallback((username: string) => {
    const u = userMap.get(username);
    if (!u) return username;
    return [u.nombres, u.paterno, u.materno].filter(Boolean).join(" ");
  }, [userMap]);

  const modulos = useMemo(() => Array.from(new Set(logs.flatMap((l) => l.modulo ? [l.modulo] : []))) as string[], [logs]);
  const acciones = useMemo(() => Array.from(new Set(logs.map((l) => l.accion))).sort(), [logs]);
  const usuariosOpts = useMemo(() => Array.from(new Set(logs.map((l) => l.usuario))).sort(), [logs]);
  const equipos = useMemo(() => Array.from(new Set(logs.flatMap((l) => l.equipo ? [l.equipo] : []))) as string[], [logs]);

  const [filtros, dispatchFiltros] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { q: "", fUsuario: "", fAccion: "", fModulo: "", fEquipo: "", fDesde: "", fHasta: "" }
  );
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filtros.fUsuario && l.usuario !== filtros.fUsuario) return false;
      if (filtros.fAccion && l.accion !== filtros.fAccion) return false;
      if (filtros.fModulo && l.modulo !== filtros.fModulo) return false;
      if (filtros.fEquipo && l.equipo !== filtros.fEquipo) return false;
      const ld = toDateInput(l.ts);
      if (filtros.fDesde && ld < filtros.fDesde) return false;
      if (filtros.fHasta && ld > filtros.fHasta) return false;
      if (filtros.q) {
        const blob = [l.accion, l.detalle, l.usuario, fullName(l.usuario), l.modulo, l.entidad, l.equipo, l.descripcion]
          .filter(Boolean).join(" ").toLowerCase();
        if (!blob.includes(filtros.q.toLowerCase())) return false;
      }
      return true;
    });
  }, [logs, filtros.q, filtros.fUsuario, filtros.fAccion, filtros.fModulo, filtros.fEquipo, filtros.fDesde, filtros.fHasta, fullName]);

  const clear = () => {
    dispatchFiltros({ type: "SET_FIELD", field: "q", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fUsuario", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fAccion", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fModulo", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fEquipo", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fDesde", value: "" });
    dispatchFiltros({ type: "SET_FIELD", field: "fHasta", value: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Logs del sistema</h1>
        <p className="text-sm text-muted-foreground">Auditoría de acciones recientes</p>
      </div>

      <Panel title="Filtros">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filtros.q}
                onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "q", value: e.target.value })}
                placeholder="Buscar por texto, equipo, usuario..."
                className={`${inputCls} pl-9`}
                aria-label="Buscar en logs"
              />
          </div>
          <select value={filtros.fUsuario} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fUsuario", value: e.target.value })} className={inputCls} aria-label="Filtrar por usuario">
            <option value="">Todos los usuarios</option>
            {usuariosOpts.map((u) => (
              <option key={u} value={u}>{fullName(u)} (@{u})</option>
            ))}
          </select>
          <select value={filtros.fAccion} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fAccion", value: e.target.value })} className={inputCls} aria-label="Filtrar por acción">
            <option value="">Todas las acciones</option>
            {acciones.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filtros.fModulo} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fModulo", value: e.target.value })} className={inputCls} aria-label="Filtrar por módulo">
            <option value="">Todos los módulos</option>
            {modulos.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filtros.fEquipo} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fEquipo", value: e.target.value })} className={inputCls} aria-label="Filtrar por equipo">
            <option value="">Todos los equipos</option>
            {equipos.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <input type="date" value={filtros.fDesde} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fDesde", value: e.target.value })} className={inputCls} aria-label="Fecha desde" />
          <input type="date" value={filtros.fHasta} onChange={(e) => dispatchFiltros({ type: "SET_FIELD", field: "fHasta", value: e.target.value })} className={inputCls} aria-label="Fecha hasta" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{filtered.length} de {logs.length} eventos</p>
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-navy hover:bg-slate-50"
          >
            <X className="size-3" /> Limpiar filtros
          </button>
        </div>
      </Panel>

      <Panel title={`${filtered.length} eventos`}>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No se encontraron eventos con los filtros aplicados.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((l, i) => {
              const name = fullName(l.usuario);
              return (
                <li key={l.ts + l.usuario + l.accion} className="flex items-start gap-3 py-3">
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal">
                    <Activity className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-navy">{l.accion}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{l.ts}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{l.detalle}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>por <span className="font-medium text-navy">{name}</span> <span className="font-mono text-teal">(@{l.usuario})</span></span>
                      {l.modulo && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy">{l.modulo}</span>}
                      {l.equipo && <span className="rounded bg-teal-soft px-1.5 py-0.5 text-[10px] font-semibold text-teal">{l.equipo}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(l)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-navy hover:bg-slate-50"
                  >
                    <Eye className="size-3" /> Ver
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Modal
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
        title="Detalle del evento"
        description={selected?.accion}
        size="lg"
      >
        {selected && <LogDetail entry={selected} user={userMap.get(selected.usuario)} />}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-slate-100 py-2 text-sm last:border-0">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="col-span-2 text-navy">{value || <span className="text-muted-foreground">-</span>}</div>
    </div>
  );
}

function LogDetail({
  entry,
  user,
}: {
  entry: LogEntry;
  user?: { full: string; rol: string; nombres: string; paterno: string; materno: string };
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <Row label="Tipo de acción" value={entry.tipoAccion} />
        <Row label="Acción" value={entry.accion} />
        <Row label="Módulo afectado" value={entry.modulo} />
        <Row label="Entidad afectada" value={entry.entidad} />
        <Row label="Equipo" value={entry.equipo} />
        <Row label="Estado del evento" value={
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            entry.estado === "Error" ? "bg-red-100 text-red-700" :
            entry.estado === "Advertencia" ? "bg-yellow-100 text-yellow-700" :
            "bg-emerald-100 text-emerald-700"
          }`}>{entry.estado ?? "Éxito"}</span>
        } />
        <Row label="Fecha y hora" value={entry.ts} />
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <h4 className="mb-2 text-sm font-semibold text-navy">Usuario responsable</h4>
        <Row label="Nombres" value={user?.nombres} />
        <Row label="Apellido paterno" value={user?.paterno} />
        <Row label="Apellido materno" value={user?.materno} />
        <Row label="Usuario" value={<span className="font-mono text-teal">@{entry.usuario}</span>} />
        <Row label="Rol" value={user?.rol} />
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <h4 className="mb-2 text-sm font-semibold text-navy">Descripción detallada</h4>
        <p className="text-sm text-navy">{entry.descripcion || entry.detalle || "—"}</p>
        {entry.detalle && entry.detalle !== entry.descripcion && (
          <p className="mt-2 text-xs text-muted-foreground">Detalle original: {entry.detalle}</p>
        )}
      </div>

      {entry.cambios && entry.cambios.length > 0 && (
        <div className="rounded-lg border border-slate-200 p-4">
          <h4 className="mb-2 text-sm font-semibold text-navy">Cambios realizados</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2">Campo</th>
                <th className="py-2">Antes</th>
                <th className="py-2">Después</th>
              </tr>
            </thead>
            <tbody>
              {entry.cambios.map((c, i) => (
                <tr key={c.campo} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 font-medium text-navy">{c.campo}</td>
                  <td className="py-2 text-muted-foreground">{c.antes ?? "—"}</td>
                  <td className="py-2 text-navy">{c.despues ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
