import { useReducer } from "react";
import { toast } from "sonner";
import {
  Lock, Mail, Hash, Eye, EyeOff, Loader2, ArrowRight,
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center">
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

      {/* Main Container - Adjusted padding to prevent scroll */}
      <div className="w-full max-w-[68rem] px-4 py-6 md:py-8">
        <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-8 items-stretch">
          
          {/* Brand panel */}
          <div className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy via-[oklch(0.28_0.12_265)] to-slate-900 p-8 xl:p-10 text-white shadow-[0_30px_80px_-30px_rgba(30,39,97,0.55)]">
            <div className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 10%, rgba(255,255,255,.25), transparent 35%), radial-gradient(circle at 80% 90%, rgba(0,200,200,.25), transparent 40%)",
              }} />
            
            <div className="relative flex flex-col justify-between h-full w-full z-10">
              
              {/* Logo & Header */}
              <div className="flex flex-col items-center gap-2 w-full mt-2">
                <img 
                  src="/logosvg.png" 
                  alt="SIGMALAB Logo" 
                  className="w-60 h-50 xl:w-40 xl:h-40 object-contain mx-auto mb-2 invert brightness-0" 
                />
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 text-center">ITIC · INFORMÁTICA · UMSA</p>
                  <span className="text-2xl font-extrabold tracking-tight text-center">SIGMALAB</span>
                </div>
              </div>
              
              {/* Central Text - Auto margins center it vertically */}
              <div className="my-auto text-center">
                <h1 className="text-2xl xl:text-3xl font-semibold leading-tight">
                  Gestión integral del mantenimiento <span className="text-teal">de laboratorios</span>.
                </h1>
                <p className="mt-3 xl:mt-4 max-w-md mx-auto text-sm leading-relaxed text-white/70">
                  Plataforma institucional de ITIC Laboratorios - Carrera de Informática - Universidad Mayor de San Andrés. Control preventivo, correctivo, inventario e incidencias en un solo lugar.
                </p>
              </div>

              {/* Bottom Cards & Footer */}
              <div className="flex flex-col items-center w-full mb-2">
                <div className="grid grid-cols-3 gap-2 xl:gap-3 text-xs w-full max-w-xs mb-6">
                  { [
                    { k: "Equipos", v: "" },
                    { k: "Incidencias", v: "" },
                    { k: "Reportes", v: "" },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur text-center">
                      <p className="text-sm font-semibold text-white">{s.k}</p>
                    </div>
                  )) }
                </div>
                <p className="flex items-center gap-2 text-[11px] text-white/50 justify-center">
                  <GraduationCap className="size-3.5" />
                  Universidad Mayor de San Andrés · La Paz, Bolivia
                </p>
              </div>

            </div>
          </div>

          {/* Form card */}
          <div className="relative flex flex-col justify-center">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 xl:p-9 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              
              <div className="mb-6 flex flex-col items-center gap-3 lg:hidden">
                <img src="/logosvg.png" alt="SIGMALAB Logo" className="w-16 h-16 object-contain invert brightness-0 rounded-xl bg-navy p-2" />
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">ITIC · UMSA</p>
                  <span className="text-xl font-extrabold text-navy">SIGMALAB</span>
                </div>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-[26px]">Bienvenido</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Ingresa tus credenciales institucionales para continuar.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                {/* Identifier */}
                <div>
                  <label htmlFor="login-id" className="mb-1.5 block text-xs font-semibold text-navy/80">
                    Correo o Registro Universitario
                  </label>
                  <div className={`group relative flex items-center rounded-xl border bg-white transition-all ${
                    form.error ? "border-danger/50" : "border-slate-200 focus-within:border-teal focus-within:ring-4 focus-within:ring-teal/15"
                  }`}>
                    <span className="pl-3.5 text-muted-foreground">
                      {isNumeric ? <Hash className="size-4.5" /> : <Mail className="size-4.5" />}
                    </span>
                    <input id="login-id"
                      type="text"
                      inputMode={isNumeric ? "numeric" : "email"}
                      value={form.identifier}
                      onChange={(e) => { dispatch({ type: "SET_FIELD", field: "identifier", value: e.target.value }); if (form.error) dispatch({ type: "SET_FIELD", field: "error", value: "" }); }}
                      placeholder="correo@umsa.bo  ó  12345678"
                      autoComplete="username"
                      className="w-full bg-transparent py-3 pl-2.5 pr-3.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none"
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
                    />
                    <button type="button" onClick={() => dispatch({ type: "SET_FIELD", field: "showPass", value: !form.showPass })} className="mr-2 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-slate-100 hover:text-navy">
                      {form.showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {form.error && (
                  <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>{form.error}</span>
                  </div>
                )}

                <button type="submit" disabled={form.loading} className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-navy to-[oklch(0.32_0.14_265)] py-3 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition-all hover:shadow-xl hover:shadow-navy/30 active:scale-[0.99] disabled:opacity-70 mt-2">
                  {form.loading ? (
                    <><Loader2 className="size-4 animate-spin" /> Validando credenciales…</>
                  ) : (
                    <>Iniciar sesión <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </button>

                {/* <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center"><span className="bg-white/80 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">o</span></div>
                </div> */}
              </form>

              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                Sistema interno ITIC · Universidad Mayor de San Andrés
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}