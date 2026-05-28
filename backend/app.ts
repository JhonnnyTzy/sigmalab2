import express from "express";
import cors from "cors";
import { env } from "./config/env";
import routes from "./routes/index";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(",").map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) return cb(null, true);
    return cb(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "SIGMALAB API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);
app.use("/api", (_req, res) => res.status(404).json({ error: "Ruta de API no encontrada" }));

app.use(errorHandler);

export default app;
