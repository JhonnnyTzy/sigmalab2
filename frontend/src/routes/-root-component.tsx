import { HeadContent, Outlet } from "@tanstack/react-router";

export function RootComponent() {
  return <><HeadContent /><Outlet /></>;
}
