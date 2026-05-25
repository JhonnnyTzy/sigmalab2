import axios from "axios";

function detectApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith(".vscode.dev") || host.endsWith(".github.dev") || host.endsWith(".preview.app.github.dev")) {
      const port = import.meta.env.VITE_API_PORT || "4000";
      return `https://${port}-${host.replace(/^[^.]+-/, "")}/api`;
    }
  }
  return "http://localhost:4000/api";
}

const apiClient = axios.create({
  baseURL: detectApiUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sigmalab.token.v1");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sigmalab.token.v1");
      localStorage.removeItem("sigmalab.session.v1");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
