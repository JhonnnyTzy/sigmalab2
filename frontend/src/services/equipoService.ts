import apiClient from "./apiClient";

export interface Equipo {
  codigo: string;
  nombre: string;
  labId: string;
  fila?: string;
  puesto?: string;
  so?: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  estado: string;
  laboratorio?: { id: string; nombre: string };
}

export async function getEquipos(): Promise<Equipo[]> {
  const res = await apiClient.get("/equipos");
  return res.data;
}

export async function getEquipo(codigo: string): Promise<Equipo> {
  const res = await apiClient.get(`/equipos/${codigo}`);
  return res.data;
}

export async function createEquipo(data: Partial<Equipo>): Promise<Equipo> {
  const res = await apiClient.post("/equipos", data);
  return res.data;
}

export async function updateEquipo(codigo: string, data: Partial<Equipo>): Promise<Equipo> {
  const res = await apiClient.patch(`/equipos/${codigo}`, data);
  return res.data;
}

export async function deleteEquipo(codigo: string): Promise<void> {
  await apiClient.delete(`/equipos/${codigo}`);
}

export async function getEstadisticas() {
  const res = await apiClient.get("/equipos/estadisticas");
  return res.data;
}
