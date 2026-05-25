import { Router } from "express";
import * as incidenciaController from "../controllers/incidenciaController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createIncidenciaSchema, updateIncidenciaSchema } from "../schemas/incidenciaSchemas";

const router = Router();

router.use(authenticate);

router.get("/", incidenciaController.getAll);
router.get("/stats", incidenciaController.getStats);
router.get("/:id", incidenciaController.getById);
router.post("/", validate(createIncidenciaSchema), incidenciaController.create);
router.patch("/:id", authorize("encargado", "preventivo", "correctivo"), validate(updateIncidenciaSchema), incidenciaController.update);

export default router;
