import apiClient from "./apiClient";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    role: string;
    nombres: string;
    paterno: string;
    materno?: string | null;
    email?: string | null;
    registro?: string | null;
  };
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function getProfile() {
  const response = await apiClient.get("/auth/profile");
  return response.data;
}

export async function register(data: {
  role: string;
  email?: string;
  registro?: string;
  nombres: string;
  paterno: string;
  materno?: string;
  celular?: string;
  password: string;
}) {
  const response = await apiClient.post("/auth/register", data);
  return response.data;
}
