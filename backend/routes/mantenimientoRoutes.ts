import { Router } from "express";
import * as mantenimientoController from "../controllers/mantenimientoController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createMantenimientoSchema, updateMantenimientoSchema, createDetalleSchema } from "../schemas/mantenimientoSchemas";

const router = Router();

router.use(authenticate);

router.get("/", mantenimientoController.getAll);
router.get("/stats", mantenimientoController.getStats);
router.get("/:id", mantenimientoController.getById);
router.post("/", authorize("encargado", "preventivo", "correctivo"), validate(createMantenimientoSchema), mantenimientoController.create);
router.patch("/:id", authorize("encargado", "preventivo", "correctivo"), validate(updateMantenimientoSchema), mantenimientoController.update);
router.delete("/:id", authorize("encargado"), mantenimientoController.remove);
router.post("/detalle", authorize("encargado", "preventivo", "correctivo"), validate(createDetalleSchema), mantenimientoController.saveDetalle);

export default router;
