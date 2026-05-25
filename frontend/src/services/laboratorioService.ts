import apiClient from "./apiClient";

export interface Laboratorio {
  id: string;
  nombre: string;
  edificio: string;
  piso: number;
  capEquipos: number;
  capPersonas: number;
  _count?: { equipos: number };
}

export async function getLaboratorios(): Promise<Laboratorio[]> {
  const res = await apiClient.get("/laboratorios");
  return res.data;
}

export async function getLaboratorio(id: string): Promise<Laboratorio> {
  const res = await apiClient.get(`/laboratorios/${id}`);
  return res.data;
}

export async function createLaboratorio(data: Laboratorio): Promise<Laboratorio> {
  const res = await apiClient.post("/laboratorios", data);
  return res.data;
}

export async function updateLaboratorio(id: string, data: Partial<Laboratorio>): Promise<Laboratorio> {
  const res = await apiClient.patch(`/laboratorios/${id}`, data);
  return res.data;
}

export async function deleteLaboratorio(id: string): Promise<void> {
  await apiClient.delete(`/laboratorios/${id}`);
}
