import { Router } from "express";
import * as asignacionController from "../controllers/asignacionController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createAsignacionSchema, updateAsignacionSchema } from "../schemas/asignacionSchemas";

const router = Router();

router.use(authenticate);

router.get("/", asignacionController.getAll);
router.get("/:id", asignacionController.getById);
router.post("/", authorize("encargado"), validate(createAsignacionSchema), asignacionController.create);
router.patch("/:id", authorize("encargado", "correctivo"), validate(updateAsignacionSchema), asignacionController.update);

export default router;
