import { useReducer } from "react";
import { toast } from "sonner";
import {
  Lock, Mail, Hash, Eye, EyeOff, ShieldCheck, Loader2, ArrowRight,
  AlertTriangle, GraduationCap,
} from "lucide-react";
import { auth, ROLE_LABEL } from "@/lib/auth";
import { useApp } from "@/lib/use-app";

export function Login() {
  const { setView } = useApp();
  const [form, dispatch] = useReducer(
    (state: any, action: { type: string; field?: string; value?: any }) => {
      switch (action.type) {
        case "SET_FIELD": return { ...state, [action.field!]: action.value };
        default: return state;
      }
    },
    { identifier: "", password: "", showPass: false, error: "", loading: false }
  );

  const isNumeric = /^\d+$/.test(form.identifier.trim());
  const looksLikeEmail = form.identifier.includes("@");
  const fieldHint = form.identifier.trim().length === 0
    ? "Detectamos automáticamente tu tipo de cuenta"
    : isNumeric
      ? "Detectado: Registro universitario"
      : looksLikeEmail
        ? "Detectado: Correo institucional"
        : "Continúa escribiendo tu correo o registro";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_FIELD", field: "error", value: "" });
    if (!form.identifier.trim() || !form.password.trim()) {
      dispatch({ type: "SET_FIELD", field: "error", value: "Por favor completa todos los campos" });
      return;
    }
    dispatch({ type: "SET_FIELD", field: "loading", value: true });
    try {
      const r = await auth.login(form.identifier, form.password);
      if (!r.ok) { dispatch({ type: "SET_FIELD", field: "error", value: r.error }); return; }
      setView("dashboard");
      toast.success(`Bienvenido, ${r.user.nombres}`, {
        description: `Sesión iniciada como ${ROLE_LABEL[r.user.roleId]}`,
      });
    } finally {
      dispatch({ type: "SET_FIELD", field: "loading", value: false });
    }
  };

  const enviarIncidencia = () => {
    toast.info("Para enviar una incidencia debes iniciar sesión como Docente o Estudiante.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background - institutional gradient + soft tech orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_oklch(0.45_0.18_265/_0.18),_transparent_55%),radial-gradient(circle_at_85%_75%,_oklch(0.65_0.15_200/_0.18),_transparent_50%)]" />
        <div className="absolute -top-32 -left-24 size-80 rounded-full bg-navy/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 size-96 rounded-full bg-teal/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #1E2761 1px, transparent 1px), linear-gradient(to bottom, #1E2761 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Brand panel */}
          <div className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy via-[oklch(0.28_0.12_265)] to-slate-900 p-10 text-white shadow-[0_30px_80px_-30px_rgba(30,39,97,0.55)]">
            <div className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 10%, rgba(255,255,255,.25), transparent 35%), radial-gradient(circle at 80% 90%, rgba(0,200,200,.25), transparent 40%)",
              }} />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <ShieldCheck className="size-6 text-teal" strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">ITIC · UMSA</p>
                  <span className="text-2xl font-extrabold tracking-tight">SIGMALAB</span>
                </div>
              </div>

              <h1 className="mt-14 text-3xl font-semibold leading-tight">
                Gestión integral del mantenimiento <span className="text-teal">de laboratorios</span> universitarios.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
                Plataforma institucional de ITIC Laboratorios - Universidad Mayor de San Andrés. Control preventivo, correctivo, inventario e incidencias en un solo lugar.
              </p>
            </div>

            <div className="relative mt-10 grid grid-cols-3 gap-3 text-xs">
              {[
                { k: "Equipos", v: "monitoreados" },
                { k: "Incidencias", v: "en tiempo real" },
                { k: "Reportes", v: "automáticos" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <p className="text-sm font-semibold text-white">{s.k}</p>
                  <p className="text-white/60">{s.v}</p>
                </div>
              ))}
            </div>

            <p className="relative mt-8 flex items-center gap-2 text-[11px] text-white/50">
              <GraduationCap className="size-3.5" />
              Universidad Mayor de San Andrés · La Paz, Bolivia
            </p>
          </div>

          {/* Form card */}
          <div className="relative">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-7 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-9">
              <div className="mb-6 flex items-center gap-3 lg:hidden">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-navy text-white">
                  <ShieldCheck className="size-5 text-teal" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">ITIC · UMSA</p>
                  <span className="text-lg font-extrabold text-navy">SIGMALAB</span>
                </div>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-[26px]">Bienvenido</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Ingresa tus credenciales institucionales para continuar.
              </p>

              <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
                {/* Identifier */}
                <div>
                  <label htmlFor="login-id" className="mb-1.5 block text-xs font-semibold text-navy/80">
                    Correo o Registro Universitario
                  </label>
                  <div className={`group relative flex items-center rounded-xl border bg-white transition-all ${
                    form.error ? "border-danger/50" : "border-slate-200 focus-within:border-teal focus-within:ring-4 focus-within:ring-teal/15"
                  }`}>
                    <span className="pl-3.5 text-muted-foreground">
                      {isNumeric
                        ? <Hash className="size-4.5" />
                        : <Mail className="size-4.5" />}
                    </span>
                    <input id="login-id"
                      type="text"
                      inputMode={isNumeric ? "numeric" : "email"}
                      value={form.identifier}
                      onChange={(e) => { dispatch({ type: "SET_FIELD", field: "identifier", value: e.target.value }); if (form.error) dispatch({ type: "SET_FIELD", field: "error", value: "" }); }}
                      placeholder="correo@umsa.bo  ó  20250001"
                      autoComplete="username"
                      className="w-full bg-transparent py-3 pl-2.5 pr-3.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none"
                      aria-label="Correo o Registro Universitario"
                    />
                  </div>
                  <p className="mt-1.5 pl-1 text-[11px] text-muted-foreground">{fieldHint}</p>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-pass" className="mb-1.5 block text-xs font-semibold text-navy/80">Contraseña</label>
                  <div className={`group relative flex items-center rounded-xl border bg-white transition-all ${
                    form.error ? "border-danger/50" : "border-slate-200 focus-within:border-teal focus-within:ring-4 focus-within:ring-teal/15"
                  }`}>
                    <span className="pl-3.5 text-muted-foreground"><Lock className="size-4.5" /></span>
                    <input id="login-pass"
                      type={form.showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => { dispatch({ type: "SET_FIELD", field: "password", value: e.target.value }); if (form.error) dispatch({ type: "SET_FIELD", field: "error", value: "" }); }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full bg-transparent py-3 pl-2.5 pr-2 text-sm text-navy placeholder:text-slate-400 focus:outline-none"
                      aria-label="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "SET_FIELD", field: "showPass", value: !form.showPass })}
                      className="mr-2 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-slate-100 hover:text-navy"
                      aria-label={form.showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {form.showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {form.error && (
                  <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm text-danger animate-in fade-in slide-in-from-top-1">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>{form.error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={form.loading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-navy to-[oklch(0.32_0.14_265)] py-3 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition-all hover:shadow-xl hover:shadow-navy/30 active:scale-[0.99] disabled:opacity-70"
                >
                  {form.loading ? (
                    <><Loader2 className="size-4 animate-spin" /> Validando credenciales…</>
                  ) : (
                    <>Iniciar sesión <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center"><span className="bg-white/80 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">o</span></div>
                </div>

                <button
                  type="button"
                  onClick={enviarIncidencia}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-navy transition-all hover:border-teal hover:bg-teal-soft hover:text-navy active:scale-[0.99]"
                >
                  <AlertTriangle className="size-4 text-warning" />
                  Enviar una incidencia
                </button>
              </form>

              <p className="mt-7 text-center text-[11px] text-muted-foreground">
                Sistema interno ITIC · Universidad Mayor de San Andrés
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
