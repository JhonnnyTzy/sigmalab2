import { Router } from "express";
import * as reporteController from "../controllers/reporteController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createReporteSchema, updateReporteSchema } from "../schemas/reporteSchemas";

const router = Router();

router.use(authenticate);

router.get("/", reporteController.getAll);
router.get("/:id", reporteController.getById);
router.post("/", authorize("preventivo", "correctivo", "docente", "estudiante", "encargado"), validate(createReporteSchema), reporteController.create);
router.patch("/:id", authorize("encargado", "preventivo", "correctivo"), validate(updateReporteSchema), reporteController.update);
router.delete("/:id", authorize("encargado"), reporteController.remove);

export default router;
