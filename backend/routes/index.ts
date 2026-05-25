import { Router } from "express";
import authRoutes from "./authRoutes";
import equipoRoutes from "./equipoRoutes";
import laboratorioRoutes from "./laboratorioRoutes";
import mantenimientoRoutes from "./mantenimientoRoutes";
import incidenciaRoutes from "./incidenciaRoutes";
import inventarioRoutes from "./inventarioRoutes";
import insumoRoutes from "./insumoRoutes";
import perifericoRoutes from "./perifericoRoutes";
import asignacionRoutes from "./asignacionRoutes";
import reporteRoutes from "./reporteRoutes";
import logRoutes from "./logRoutes";
import materiaRoutes from "./materiaRoutes";
import horarioRoutes from "./horarioRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/equipos", equipoRoutes);
router.use("/laboratorios", laboratorioRoutes);
router.use("/mantenimientos", mantenimientoRoutes);
router.use("/incidencias", incidenciaRoutes);
router.use("/inventario", inventarioRoutes);
router.use("/insumos", insumoRoutes);
router.use("/perifericos", perifericoRoutes);
router.use("/asignaciones", asignacionRoutes);
router.use("/reportes", reporteRoutes);
router.use("/logs", logRoutes);
router.use("/materias", materiaRoutes);
router.use("/horarios", horarioRoutes);

export default router;
