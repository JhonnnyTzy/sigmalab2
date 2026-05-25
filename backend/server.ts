import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
  console.log(`🔬 SIGMALAB API corriendo en http://localhost:${env.PORT}`);
  console.log(`   Entorno: ${env.NODE_ENV}`);
  console.log(`   Health:  http://localhost:${env.PORT}/api/health`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM recibido. Cerrando servidor...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT recibido. Cerrando servidor...");
  server.close(() => process.exit(0));
});
