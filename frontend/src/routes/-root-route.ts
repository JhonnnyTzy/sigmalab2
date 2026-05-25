import { createRootRoute } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { RootShell } from "./-root-shell";
import { RootComponent } from "./-root-component";
import { NotFoundComponent } from "./-not-found-component";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SIGMALAB — ITIC UMSA" },
      { name: "description", content: "Sistema de Gestión de Mantenimiento de Equipos de Laboratorio — ITIC, Universidad Mayor de San Andrés." },
      { name: "author", content: "ITIC UMSA" },
      { property: "og:title", content: "SIGMALAB — ITIC UMSA" },
      { property: "og:description", content: "Sistema de Gestión de Mantenimiento de Equipos de Laboratorio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});
