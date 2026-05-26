import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/sigmalab/Sidebar";
import { getViewLabel } from "@/components/sigmalab/sidebar-utils";
import { TopBar } from "@/components/sigmalab/TopBar";
import { Breadcrumb } from "@/components/sigmalab/Breadcrumb";
import { useEffect, useState } from "react"; // <-- Añadido useState
import { useApp } from "@/lib/use-app";
import { Login } from "@/views/Login";
import { can } from "@/lib/auth";

import { initFromApi } from "@/lib/store";
import { EncargadoDashboard } from "@/views/encargado/Dashboard";
import { LaboratoriosView } from "@/views/encargado/Laboratorios";
import { EquiposView } from "@/views/encargado/Equipos";
import { UsuariosView } from "@/views/encargado/Usuarios";
import { ReportesView } from "@/views/encargado/Reportes";
import { PerifericosView } from "@/views/encargado/Perifericos";
import { InsumosView } from "@/views/encargado/Insumos";
import { LogsView } from "@/views/encargado/Logs";
import { MantenimientosView } from "@/views/encargado/Mantenimientos";
import { InventarioView } from "@/views/encargado/Inventario";
import { PreventivoDashboard } from "@/views/preventivo/Dashboard";
import { MisMantenimientosView } from "@/views/preventivo/MisMantenimientos";
import { InsumosDisponiblesView } from "@/views/preventivo/InsumosDisponibles";
import { ReportesPreventivoView } from "@/views/preventivo/Reportes";
import { NuevoMantPreventivoView } from "@/views/preventivo/NuevoMantPreventivo";
import { BandejaPreventivoView } from "@/views/preventivo/BandejaIncidencias";

import { CorrectivoDashboard } from "@/views/correctivo/Dashboard";
import { MisCorrectivosView } from "@/views/correctivo/MisCorrectivos";
import { NuevoCorrectivoView } from "@/views/correctivo/NuevoCorrectivo";
import { AsignadosView } from "@/views/correctivo/Asignados";
import { BandejaCorrectivoView } from "@/views/correctivo/BandejaIncidencias";

import { CrearIncidenciaView } from "@/views/incidencias/Crear";
import { MisIncidenciasView } from "@/views/incidencias/MisIncidencias";
import { BandejaIncidenciasView } from "@/views/incidencias/Bandeja";
import { InvitadoDashboard } from "@/views/invitado/Dashboard";
import { PlaceholderView } from "@/views/Placeholder";
import { ProfileView } from "@/views/shared/Profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIGMALAB — Gestión de Mantenimiento ITIC | UMSA" },
      { name: "description", content: "Sistema de gestión de mantenimiento de equipos de laboratorio para ITIC, Universidad Mayor de San Andrés." },
    ],
  }),
  component: App,
});

function ViewRenderer({ role, view }: { role: string; view: string }) {
  // Vista de perfil disponible para todos los roles autenticados
  if (view === "profile") return <ProfileView />;

  // Vistas compartidas
  if (view === "incidencias-bandeja" && role === "preventivo") return <BandejaPreventivoView />;
  if (view === "incidencias-bandeja" && role === "correctivo") return <BandejaCorrectivoView />;
  if (view === "incidencias-bandeja" && can(role as never, "incidencias:view")) return <BandejaIncidenciasView />;

  if (role === "encargado") {
    if (view === "dashboard") return <EncargadoDashboard />;
    if (view === "laboratorios") return <LaboratoriosView />;
    if (view === "equipos") return <EquiposView />;
    if (view === "usuarios") return <UsuariosView />;
    if (view === "reportes") return <ReportesView />;
    if (view === "perifericos") return <PerifericosView />;
    if (view === "insumos") return <InsumosView />;
    if (view === "inventario") return <InventarioView />;
    if (view === "logs") return <LogsView />;
    if (view === "mant-preventivos") return <MantenimientosView tipo="Preventivo" />;
    if (view === "mant-correctivos") return <MantenimientosView tipo="Correctivo" />;
    return <PlaceholderView title={getViewLabel(role, view)} />;
  }
  if (role === "preventivo") {
    if (view === "dashboard") return <PreventivoDashboard />;
    if (view === "nuevo-mant") return <NuevoMantPreventivoView />;
    if (view === "incidencias-bandeja") return <BandejaPreventivoView />;
    if (view === "mis-mant") return <MisMantenimientosView />;
    if (view === "equipos") return <EquiposView />;
    if (view === "insumos-disp") return <InsumosDisponiblesView />;
    if (view === "reportes-prev") return <ReportesPreventivoView />;
    return <PlaceholderView title={getViewLabel(role, view)} />;
  }
  if (role === "correctivo") {
    if (view === "dashboard") return <CorrectivoDashboard />;
    if (view === "nuevo-correctivo" || view === "nueva-incidencia") return <NuevoCorrectivoView />;
    if (view === "asignados") return <AsignadosView />;
    if (view === "incidencias-bandeja") return <BandejaCorrectivoView />;
    if (view === "mis-correctivos") return <MisCorrectivosView />;
    if (view === "equipos") return <EquiposView />;
    return <PlaceholderView title={getViewLabel(role, view)} />;
  }
  if (role === "docente" || role === "estudiante") {
    if (view === "crear-incidencia" || view === "dashboard") return <CrearIncidenciaView />;
    if (view === "mis-incidencias") return <MisIncidenciasView />;
    return <PlaceholderView title={getViewLabel(role, view)} />;
  }
  if (role === "invitado") {
    if (view === "dashboard" || view === "lectura") return <InvitadoDashboard />;
    if (view === "equipos") return <EquiposView />;
    if (view === "laboratorios") return <LaboratoriosView />;
    if (view === "perifericos") return <PerifericosView />;
    if (view === "insumos") return <InsumosView />;
    if (view === "reportes") return <ReportesView />;
    if (view === "historial") return <PlaceholderView title="Historiales" />;
    return <PlaceholderView title={getViewLabel(role, view)} />;
  }
  return <PlaceholderView title="Sin acceso" />;
}

// ============================================================
// AQUÍ ESTÁ EL CAMBIO MAESTRO PARA EL RESPONSIVE
// ============================================================
function App() {
  const { role, view, isAuthenticated } = useApp();
  // Añadimos el estado para controlar si el menú lateral está abierto en celulares
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => { if (isAuthenticated) initFromApi(); }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toaster position="bottom-right" richColors closeButton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Le pasamos al Sidebar el estado actual y una función para cerrarse.
        En escritorio, ignorará esto y siempre estará abierto. 
      */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Le pasamos al TopBar una función para que, cuando toques 
        el menú hamburguesa, el menú lateral se abra. 
      */}
      <TopBar 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
      />

      {/* EL MARGEN DINÁMICO: 
        ml-0: En móviles, el contenido ocupa el 100% de la pantalla (sin margen izquierdo).
        lg:ml-64: En pantallas grandes, deja un margen de 16rem (256px) para la barra lateral.
      */}
      <main className="ml-0 lg:ml-64 pt-16 transition-all duration-300 ease-in-out">
        {/* También reducimos los paddings (px-4) en móviles para que las tablas quepan mejor */}
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-10">
          <ViewRenderer role={role} view={view} />
        </div>
      </main>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}